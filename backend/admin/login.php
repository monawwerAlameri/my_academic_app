<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as MailException;

header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../config/database.php';

const OTP_VALID_SECONDS = 600; // 10 minutes, same as the student/faculty codes

// true  = do NOT send an email, return the code in the response (for Postman testing)
// false = send the real email with PHPMailer. MUST be false in the final version.
const ADMIN_OTP_DEV_MODE = false;

// SMTP settings come from backend/config/mail.php (shared with the other modules)

function sendAdminCode(string $toEmail, string $toName, string $code): bool {
    // PHPMailer lives in backend/libs/PHPMailer/src/ (shared with the other modules)
    require_once __DIR__ . '/../libs/PHPMailer/src/Exception.php';
    require_once __DIR__ . '/../libs/PHPMailer/src/PHPMailer.php';
    require_once __DIR__ . '/../libs/PHPMailer/src/SMTP.php';
    $cfg = require __DIR__ . '/../config/mail.php';
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = $cfg['host'];
        $mail->SMTPAuth = true;
        $mail->Username = $cfg['username'];
        $mail->Password = $cfg['password'];
        $mail->SMTPSecure = ((int) $cfg['port'] === 465) ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = (int) $cfg['port'];
        $mail->CharSet = 'UTF-8';
        $mail->setFrom($cfg['from_email'], $cfg['from_name']);
        $mail->addAddress($toEmail, $toName);
        $mail->Subject = 'Your admin verification code';
        $mail->Body = "Your verification code is: $code\nIt is valid for 10 minutes.";
        $mail->send();
        return true;
    } catch (MailException $e) {
        error_log('Admin OTP mail error: ' . $mail->ErrorInfo); // see C:\xampp\apache\logs\error.log
        return false;
    }
}

// Locked after too many wrong codes (set in verify_login.php)
if (isset($_SESSION['locked_until'])) {
    $remaining = $_SESSION['locked_until'] - time();
    if ($remaining > 0) {
        echo json_encode(['success' => false, 'message' => 'Too many attempts. Try again later.', 'data' => ['retryAfterSeconds' => $remaining]]);
        exit;
    }
    unset($_SESSION['locked_until']); // 10 minutes passed, allowed again
}

$input = json_decode(file_get_contents('php://input'), true);

$username = trim($input['username'] ?? ($input['email'] ?? ''));
$password = $input['password'] ?? '';

if ($username === '' || $password === '') {
    echo json_encode(['success' => false, 'message' => 'Username and password are required', 'data' => null]);
    exit;
}

$stmt = $conn->prepare("SELECT admin_id, full_name, email, password FROM admin WHERE admin_id = ? OR email = ?");
$stmt->bind_param('ss', $username, $username);
$stmt->execute();
$admin = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$admin || !password_verify($password, $admin['password'])) {
    echo json_encode(['success' => false, 'message' => 'Invalid username or password', 'data' => null]);
    exit;
}

// Password is correct: create a one-time code, kept in the session (hashed)
$code = (string) random_int(100000, 999999);

unset($_SESSION['admin_id'], $_SESSION['role']); // not logged in until the code is verified
$_SESSION['pending_admin_id'] = $admin['admin_id'];
$_SESSION['otp_hash'] = hash('sha256', $code);
$_SESSION['otp_expires'] = time() + OTP_VALID_SECONDS;
$_SESSION['otp_attempts'] = 0;

$data = [
    'email' => substr($admin['email'], 0, 1) . '***' . strstr($admin['email'], '@'),
    'expiresInSeconds' => OTP_VALID_SECONDS
];

if (ADMIN_OTP_DEV_MODE) {
    $data['devCode'] = $code; // testing only
} elseif (!sendAdminCode($admin['email'], $admin['full_name'], $code)) {
    unset($_SESSION['pending_admin_id'], $_SESSION['otp_hash'], $_SESSION['otp_expires'], $_SESSION['otp_attempts']);
    echo json_encode(['success' => false, 'message' => 'Failed to send the verification code', 'data' => null]);
    exit;
}

echo json_encode(['success' => true, 'message' => 'Verification code sent', 'data' => $data]);