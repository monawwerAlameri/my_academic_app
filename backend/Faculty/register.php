<?php
use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/mailer.php';
header('Content-Type: application/json');

function registerFail($code) {
    global $conn;
    echo json_encode(["success" => false, "code" => $code]);
    $conn->close();
    exit;
}

function sendFacultyWelcome($to_email, $full_name, $faculty_id) {
    $cfg = require __DIR__ . '/../config/mail.php';
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = $cfg['host'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $cfg['username'];
        $mail->Password   = $cfg['password'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = $cfg['port'];
        $mail->CharSet    = 'UTF-8';
        $mail->setFrom($cfg['from_email'], $cfg['from_name']);
        $mail->addAddress($to_email, $full_name);
        $mail->isHTML(false);
        $mail->Subject = 'Your Silah doctor account';
        $mail->Body    = "Hello $full_name,\n\nYour doctor account has been created.\nYour login ID: $faculty_id\n\nUse this ID and your password to sign in.";
        $mail->send();
        return true;
    } catch (Throwable $e) {
        return false;
    }
}

$data            = json_decode(file_get_contents("php://input"), true) ?? [];
$full_name       = trim($data['full_name'] ?? '');
$department      = trim($data['department'] ?? '');
$office_location = trim($data['office_location'] ?? '');
$phone_number    = trim($data['phone_number'] ?? '');
$email           = strtolower(trim($data['email'] ?? ''));
$password        = $data['password'] ?? '';
$code            = trim($data['code'] ?? '');

if ($full_name === '' || $department === '' || $office_location === '' || $phone_number === '' || $email === '' || $password === '') {
    registerFail("ALL_FIELDS_REQUIRED");
}
if ($code === '') {
    registerFail("VERIFICATION_REQUIRED");
}
if (mb_strlen($full_name) > 100 || mb_strlen($department) > 100 || mb_strlen($office_location) > 255) {
    registerFail("ALL_FIELDS_REQUIRED");
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/^s[0-9]+@uoh\.edu\.sa$/', $email)) {
    registerFail("INVALID_FACULTY_EMAIL");
}
if (!preg_match('/^05[0-9]{8}$/', $phone_number)) {
    registerFail("INVALID_PHONE_FORMAT");
}
if (strlen($password) < 8) {
    registerFail("REGISTER_FAILED");
}

$stmt = $conn->prepare("SELECT faculty_id FROM facultymember WHERE email = ? OR phone_number = ?");
$stmt->bind_param("ss", $email, $phone_number);
$stmt->execute();
$exists = $stmt->get_result()->num_rows > 0;
$stmt->close();
if ($exists) {
    registerFail("ALREADY_REGISTERED");
}

$stmt = $conn->prepare("SELECT email FROM banned_emails WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$banned = $stmt->get_result()->num_rows > 0;
$stmt->close();
if ($banned) {
    registerFail("EMAIL_BANNED");
}

$stmt = $conn->prepare("SELECT verification_id, expires_at, is_used FROM verificationcode WHERE email = ? AND code = ? ORDER BY verification_id DESC LIMIT 1");
$stmt->bind_param("ss", $email, $code);
$stmt->execute();
$otp = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$otp) {
    registerFail("INVALID_CODE");
}
if ((int)$otp['is_used'] === 1) {
    registerFail("CODE_ALREADY_USED");
}
if (strtotime($otp['expires_at']) < time()) {
    registerFail("CODE_EXPIRED");
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$faculty_id = null;
for ($attempt = 0; $attempt < 5 && $faculty_id === null; $attempt++) {
    $result = $conn->query("SELECT faculty_id FROM facultymember WHERE faculty_id REGEXP '^F[0-9]+$' ORDER BY CAST(SUBSTRING(faculty_id, 2) AS UNSIGNED) DESC LIMIT 1");
    $next = 1;
    if ($row = $result->fetch_assoc()) {
        $next = (int)substr($row['faculty_id'], 1) + 1;
    }
    $candidate = 'F' . str_pad($next, 3, '0', STR_PAD_LEFT);

    try {
        $stmt = $conn->prepare("INSERT INTO facultymember (faculty_id, full_name, department, email, password, phone_number, office_location) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssssss", $candidate, $full_name, $department, $email, $hashedPassword, $phone_number, $office_location);
        if ($stmt->execute()) {
            $faculty_id = $candidate;
        }
        $stmt->close();
    } catch (mysqli_sql_exception $e) {
        if ($e->getCode() !== 1062) {   
            registerFail("REGISTER_FAILED");
        }
    }
}

if ($faculty_id === null) {
    registerFail("REGISTER_FAILED");
}

$stmt = $conn->prepare("UPDATE verificationcode SET is_used = 1 WHERE verification_id = ?");
$stmt->bind_param("i", $otp['verification_id']);
$stmt->execute();
$stmt->close();

sendFacultyWelcome($email, $full_name, $faculty_id);

echo json_encode([
    "success" => true,
    "code"    => "REGISTER_SUCCESS",
    "data"    => ["faculty_id" => $faculty_id]
]);
$conn->close();
