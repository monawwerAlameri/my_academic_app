<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/mailer.php';
header('Content-Type: application/json');

$data  = json_decode(file_get_contents("php://input"), true) ?? [];
$email = strtolower(trim($data['email'] ?? ''));

if ($email === '') {
    echo json_encode(["success" => false, "code" => "EMAIL_REQUIRED"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/^s[0-9]+@uoh\.edu\.sa$/', $email)) {
    echo json_encode(["success" => false, "code" => "INVALID_FACULTY_EMAIL"]);
    exit;
}

// البريد مسجّل من قبل لدكتور
$stmt = $conn->prepare("SELECT faculty_id FROM facultymember WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$exists = $stmt->get_result()->num_rows > 0;
$stmt->close();
if ($exists) {
    echo json_encode(["success" => false, "code" => "ALREADY_REGISTERED"]);
    $conn->close();
    exit;
}

// بريد حساب محذوف ما يقدر يسجّل مرة ثانية
$stmt = $conn->prepare("SELECT email FROM banned_emails WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$banned = $stmt->get_result()->num_rows > 0;
$stmt->close();
if ($banned) {
    echo json_encode(["success" => false, "code" => "EMAIL_BANNED"]);
    $conn->close();
    exit;
}

$wait = otpWaitSeconds($conn, $email);
if ($wait > 0) {
    echo json_encode(["success" => false, "code" => "TOO_MANY_REQUESTS", "data" => ["retry_after_seconds" => $wait]]);
    $conn->close();
    exit;
}

$code = strval(random_int(100000, 999999));
$expires_at = date("Y-m-d H:i:s", time() + OTP_LIFETIME_SECONDS);

$stmt = $conn->prepare("INSERT INTO verificationcode (email, code, expires_at, is_used) VALUES (?, ?, ?, 0)");
$stmt->bind_param("sss", $email, $code, $expires_at);

if ($stmt->execute() && sendOtpEmail($email, $code)) {
    echo json_encode(["success" => true, "code" => "OTP_GENERATED"]);
} else {
    echo json_encode(["success" => false, "code" => "OTP_SEND_FAILED"]);
}

$stmt->close();
$conn->close();