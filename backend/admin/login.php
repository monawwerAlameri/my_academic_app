<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/admin_auth.php';
require_once __DIR__ . '/../config/mailer.php';

const ADMIN_OTP_DEV_MODE = false;

$input = json_decode(file_get_contents('php://input'), true) ?? [];

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
    $conn->close();
    exit;
}

$email = strtolower($admin['email']);

// Same OTP rate limit as students and faculty (5 codes, then a fixed 10-minute block)
$wait = otpWaitSeconds($conn, $email);
if ($wait > 0) {
    echo json_encode(['success' => false, 'message' => 'Too many attempts. Try again later.', 'data' => ['retryAfterSeconds' => $wait]]);
    $conn->close();
    exit;
}

$code       = strval(random_int(100000, 999999));
$expires_at = date("Y-m-d H:i:s", time() + OTP_LIFETIME_SECONDS);

$stmt = $conn->prepare("INSERT INTO verificationcode (email, code, expires_at, is_used) VALUES (?, ?, ?, 0)");
$stmt->bind_param('sss', $email, $code, $expires_at);
$stmt->execute();
$stmt->close();

$data = [
    'adminId'          => $admin['admin_id'],
    'email'            => substr($email, 0, 1) . '***' . strstr($email, '@'),
    'expiresInSeconds' => OTP_LIFETIME_SECONDS
];

if (ADMIN_OTP_DEV_MODE) {
    $data['devCode'] = $code; // testing only
} elseif (!sendOtpEmail($email, $code)) {
    echo json_encode(['success' => false, 'message' => 'Failed to send the verification code', 'data' => null]);
    $conn->close();
    exit;
}

echo json_encode(['success' => true, 'message' => 'Verification code sent', 'data' => $data]);
$conn->close();