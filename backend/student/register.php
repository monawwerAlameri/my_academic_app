<?php
require_once __DIR__ . '/../config/database.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

$student_id   = $data['student_id'] ?? '';
$full_name    = $data['full_name'] ?? '';
$phone_number = $data['phone_number'] ?? '';
$email        = $data['email'] ?? '';
$password     = $data['password'] ?? '';

if (empty($student_id) || empty($full_name) || empty($phone_number) || empty($email) || empty($password)) {
    echo json_encode(["success" => false, "code" => "ALL_FIELDS_REQUIRED"]);
    exit;
}
// The university ID must contain digits only
if (!preg_match('/^[0-9]+$/', $student_id)) {
    echo json_encode(["success" => false, "code" => "INVALID_STUDENT_ID"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "code" => "INVALID_EMAIL"]);
    exit;
}
// The university email must be: "s" + the university ID + "@uoh.edu.sa"
if (strtolower($email) !== strtolower('s' . $student_id . '@uoh.edu.sa')) {
    echo json_encode(["success" => false, "code" => "INVALID_UNIVERSITY_EMAIL"]);
    exit;
}
if (!preg_match('/^05[0-9]{8}$/', $phone_number)) {
    echo json_encode(["success" => false, "code" => "INVALID_PHONE_FORMAT"]);
    exit;
}

$otpCheckStmt = $conn->prepare("SELECT expires_at FROM verificationcode WHERE phone_number = ? AND is_used = 1 ORDER BY verification_id DESC LIMIT 1");
$otpCheckStmt->bind_param("s", $phone_number);
$otpCheckStmt->execute();
$otpCheckResult = $otpCheckStmt->get_result();
$otpRow = $otpCheckResult->fetch_assoc();

if (!$otpRow || strtotime($otpRow['expires_at']) < time()) {
    echo json_encode(["success" => false, "code" => "PHONE_NOT_VERIFIED"]);
    $otpCheckStmt->close();
    $conn->close();
    exit;
}
$otpCheckStmt->close();

$checkStmt = $conn->prepare("SELECT student_id FROM student WHERE student_id = ? OR email = ? OR phone_number = ?");
$checkStmt->bind_param("sss", $student_id, $email, $phone_number);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows > 0) {
    echo json_encode(["success" => false, "code" => "ALREADY_REGISTERED"]);
    $checkStmt->close();
    $conn->close();
    exit;
}
$checkStmt->close();

// An email of a deleted account cannot be used to register again
$bannedStmt = $conn->prepare("SELECT email FROM banned_emails WHERE email = ?");
$bannedStmt->bind_param("s", $email);
$bannedStmt->execute();
$bannedResult = $bannedStmt->get_result();

if ($bannedResult->num_rows > 0) {
    echo json_encode(["success" => false, "code" => "EMAIL_BANNED"]);
    $bannedStmt->close();
    $conn->close();
    exit;
}
$bannedStmt->close();

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$insertStmt = $conn->prepare("INSERT INTO student (student_id, full_name, email, password, phone_number) VALUES (?, ?, ?, ?, ?)");
$insertStmt->bind_param("sssss", $student_id, $full_name, $email, $hashedPassword, $phone_number);

if ($insertStmt->execute()) {
    echo json_encode(["success" => true, "code" => "REGISTER_SUCCESS"]);
} else {
    echo json_encode(["success" => false, "code" => "REGISTER_FAILED"]);
}

$insertStmt->close();
$conn->close();
$stmt = $conn->prepare("SELECT email FROM banned_emails WHERE email = ?");
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    // ارجعي رد برمز مثل EMAIL_BANNED وارفضي التسجيل
}
$stmt->close();
