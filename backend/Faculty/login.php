<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/mailer.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$faculty_id = $data['faculty_id'] ?? '';
$password   = $data['password'] ?? '';

if (empty($faculty_id) || empty($password)) {
    echo json_encode(["success" => false, "code" => "LOGIN_FIELDS_REQUIRED"]);
    exit;
}

$stmt = $conn->prepare("SELECT faculty_id, password, email, full_name, account_status FROM facultymember WHERE faculty_id = ?");
$stmt->bind_param("s", $faculty_id);
$stmt->execute();
$faculty = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$faculty || !password_verify($password, $faculty['password'])) {
    echo json_encode(["success" => false, "code" => "INVALID_CREDENTIALS"]);
    $conn->close();
    exit;
}
if ($faculty['account_status'] !== 'Active') {
    echo json_encode(["success" => false, "code" => "ACCOUNT_NOT_ACTIVE"]);
    $conn->close();
    exit;
}
$email = strtolower($faculty['email']);

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
    echo json_encode([
        "success" => true,
        "code" => "OTP_GENERATED",
        "data" => [
    "faculty_id" => $faculty['faculty_id'],
    "email"      => $email,
    "full_name"  => $faculty['full_name']
]
    ]);
} else {
    echo json_encode(["success" => false, "code" => "OTP_SEND_FAILED"]);
}

$stmt->close();
$conn->close();
