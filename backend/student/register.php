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
    echo json_encode(["success" => false, "message" => "جميع الحقول مطلوبة"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "صيغة البريد الإلكتروني غير صحيحة"]);
    exit;
}

$otpCheckStmt = $conn->prepare("SELECT verification_id FROM verificationcode WHERE phone_number = ? AND is_used = 1 ORDER BY verification_id DESC LIMIT 1");
$otpCheckStmt->bind_param("s", $phone_number);
$otpCheckStmt->execute();
$otpCheckResult = $otpCheckStmt->get_result();

if ($otpCheckResult->num_rows == 0) {
    echo json_encode(["success" => false, "message" => "لم يتم التحقق من رقم الجوال"]);
    $otpCheckStmt->close();
    $conn->close();
    exit;
}
$otpCheckStmt->close();

$checkStmt = $conn->prepare("SELECT student_id FROM student WHERE student_id = ? OR email = ?");
$checkStmt->bind_param("ss", $student_id, $email);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows > 0) {
    echo json_encode(["success" => false, "message" => "الرقم الجامعي أو البريد الإلكتروني مسجل مسبقاً"]);
    $checkStmt->close();
    $conn->close();
    exit;
}
$checkStmt->close();

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$insertStmt = $conn->prepare("INSERT INTO student (student_id, full_name, email, password, phone_number) VALUES (?, ?, ?, ?, ?)");
$insertStmt->bind_param("sssss", $student_id, $full_name, $email, $hashedPassword, $phone_number);

if ($insertStmt->execute()) {
    echo json_encode(["success" => true, "message" => "تم إنشاء الحساب بنجاح"]);
} else {
    echo json_encode(["success" => false, "message" => "حدث خطأ أثناء إنشاء الحساب"]);
}

$insertStmt->close();
$conn->close();