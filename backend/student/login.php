<?php
require_once __DIR__ . '/../config/database.php';
header('Content-Type: application/json');

function sendSms($phone_number, $code) {
    // Mock OTP: حالياً نرجع الكود مباشرة بدل إرساله SMS فعلي (للتطوير والاختبار فقط)
    return ["mock" => true, "code" => $code];
}

$data = json_decode(file_get_contents("php://input"), true);
$student_id = $data['student_id'] ?? '';
$password   = $data['password'] ?? '';

if (empty($student_id) || empty($password)) {
    echo json_encode(["success" => false, "code" => "LOGIN_FIELDS_REQUIRED"]);
    exit;
}

$stmt = $conn->prepare("SELECT password, phone_number, full_name FROM student WHERE student_id = ?");
$stmt->bind_param("s", $student_id);
$stmt->execute();
$result = $stmt->get_result();
$student = $result->fetch_assoc();
$stmt->close();

if (!$student) {
    echo json_encode(["success" => false, "code" => "INVALID_CREDENTIALS"]);
    $conn->close();
    exit;
}

if (!password_verify($password, $student['password'])) {
    echo json_encode(["success" => false, "code" => "INVALID_CREDENTIALS"]);
    $conn->close();
    exit;
}

$phone_number = $student['phone_number'];

$code = strval(random_int(100000, 999999));
$expires_at = date("Y-m-d H:i:s", strtotime("+5 minutes"));

$stmt = $conn->prepare("INSERT INTO verificationcode (phone_number, code, expires_at, is_used) VALUES (?, ?, ?, 0)");
$stmt->bind_param("sss", $phone_number, $code, $expires_at);

if ($stmt->execute()) {
    $sendResult = sendSms($phone_number, $code);

    echo json_encode([
    "success" => true,
    "code" => "OTP_GENERATED",
    "data" => [
        "phone_number" => $phone_number,
        "full_name" => $student['full_name'],
        "code" => $sendResult["code"]
    ]
]);
} else {
    echo json_encode([
    "success" => false,
    "code" => "OTP_SEND_FAILED"
]);
}

$stmt->close();
$conn->close();