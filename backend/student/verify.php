<?php
require_once __DIR__ . '/../config/database.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$phone_number = $data['phone_number'] ?? '';
$code = $data['code'] ?? '';

if (empty($phone_number) || empty($code)) {
   echo json_encode(["success" => false, "code" => "VERIFICATION_REQUIRED"]);
    exit;
}

$stmt = $conn->prepare("SELECT verification_id, expires_at, is_used FROM verificationcode WHERE phone_number = ? AND code = ? ORDER BY verification_id DESC LIMIT 1");
$stmt->bind_param("ss", $phone_number, $code);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$stmt->close();

if (!$row) {
    echo json_encode(["success" => false, "code" => "INVALID_CODE"]);
    $conn->close();
    exit;
}

if ($row['is_used'] == 1) {
    echo json_encode(["success" => false, "code" => "CODE_ALREADY_USED"]);
    $conn->close();
    exit;
}

if (strtotime($row['expires_at']) < time()) {
    echo json_encode(["success" => false, "code" => "CODE_EXPIRED"]);
    $conn->close();
    exit;
}

$updateStmt = $conn->prepare("UPDATE verificationcode SET is_used = 1 WHERE verification_id = ?");
$updateStmt->bind_param("i", $row['verification_id']);
$updateStmt->execute();
$updateStmt->close();

echo json_encode(["success" => true, "code" => "VERIFIED_SUCCESS"]);

$conn->close();