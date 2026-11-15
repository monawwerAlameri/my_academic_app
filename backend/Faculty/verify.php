<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';

$data       = json_decode(file_get_contents("php://input"), true);
$faculty_id = trim($data['faculty_id'] ?? '');
$code       = trim($data['code'] ?? '');

if (empty($faculty_id) || empty($code)) {
    echo json_encode(["success" => false, "code" => "VERIFICATION_REQUIRED"]);
    exit;
}

$stmt = $conn->prepare("SELECT faculty_id, email, full_name, account_status FROM facultymember WHERE faculty_id = ?");
$stmt->bind_param("s", $faculty_id);
$stmt->execute();
$faculty = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$faculty) {
    echo json_encode(["success" => false, "code" => "INVALID_CODE"]);
    $conn->close();
    exit;
}
if ($faculty['account_status'] !== 'Active') {
    echo json_encode(["success" => false, "code" => "ACCOUNT_NOT_ACTIVE"]);
    $conn->close();
    exit;
}

$email = strtolower($faculty['email']);


$stmt = $conn->prepare("SELECT verification_id, expires_at, is_used FROM verificationcode WHERE email = ? AND code = ? ORDER BY verification_id DESC LIMIT 1");
$stmt->bind_param("ss", $email, $code);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
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

$stmt = $conn->prepare("UPDATE verificationcode SET is_used = 1 WHERE verification_id = ?");
$stmt->bind_param("i", $row['verification_id']);
$stmt->execute();
$stmt->close();

echo json_encode([
    "success" => true,
    "code"    => "VERIFIED_SUCCESS",
    "data"    => [
        "faculty_id" => $faculty['faculty_id'],
        "full_name"  => $faculty['full_name'],
        "email"      => $email,
    ]
], JSON_UNESCAPED_UNICODE);

$conn->close();
