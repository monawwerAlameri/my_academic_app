<?php
require_once __DIR__ . '/../config/database.php';
header('Content-Type: application/json');

// ==== دالة الإرسال (Mock الحين، تتبدل لاحقاً لـSMS حقيقي بدون ما نلمس باقي الملف) ====
function sendSms($phone_number, $code) {
    // Mock OTP: حالياً نرجع الكود مباشرة بدل إرساله SMS فعلي (للتطوير والاختبار فقط)
    return ["mock" => true, "code" => $code];
}
// ====================================================================

$data = json_decode(file_get_contents("php://input"), true);
$phone_number = $data['phone_number'] ?? '';

if (empty($phone_number)) {
   echo json_encode(["success" => false, "code" => "PHONE_REQUIRED"]);
    exit;
}
if (!preg_match('/^05[0-9]{8}$/', $phone_number)) {
    echo json_encode(["success" => false, "code" => "INVALID_PHONE_FORMAT"]);
    exit;
}

$code = strval(random_int(100000, 999999));
$expires_at = date("Y-m-d H:i:s", strtotime("+5 minutes"));

$stmt = $conn->prepare("INSERT INTO verificationcode (phone_number, code, expires_at, is_used) VALUES (?, ?, ?, 0)");
$stmt->bind_param("sss", $phone_number, $code, $expires_at);

if ($stmt->execute()) {
    $sendResult = sendSms($phone_number, $code);

    echo json_encode([
    "success" => true,
    "code" => "OTP_GENERATED",
    "data" => ["code" => $sendResult["code"]]
]);

} else {
    echo json_encode([
    "success" => false,
    "code" => "OTP_SEND_FAILED"
]);
}

$stmt->close();
$conn->close();
