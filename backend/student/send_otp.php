<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/mailer.php';
header('Content-Type: application/json');

$data  = json_decode(file_get_contents("php://input"), true);
$email = strtolower(trim($data['email'] ?? ''));

if (empty($email)) {
    echo json_encode(["success" => false, "code" => "EMAIL_REQUIRED"]);
    exit;
}
// Only the university email format is accepted: "s" + digits + "@uoh.edu.sa"
if (!preg_match('/^s[0-9]+@uoh\.edu\.sa$/', $email)) {
    echo json_encode(["success" => false, "code" => "INVALID_UNIVERSITY_EMAIL"]);
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

if ($stmt->execute()) {
    if (sendOtpEmail($email, $code)) {
        echo json_encode(["success" => true, "code" => "OTP_GENERATED"]);
    } else {
        echo json_encode(["success" => false, "code" => "OTP_SEND_FAILED"]);
    }
} else {
    echo json_encode(["success" => false, "code" => "OTP_SEND_FAILED"]);
}

$stmt->close();
$conn->close();