<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$student_id = $data['student_id'] ?? '';

if (empty($student_id)) {
    echo json_encode(["success" => false, "code" => "STUDENT_ID_REQUIRED"]);
    exit;
}
requireActiveStudent($conn, $student_id);

$stmt = $conn->prepare("UPDATE notification SET is_read = 1 WHERE user_id = ? AND is_read = 0");
$stmt->bind_param("s", $student_id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "code" => "NOTIFICATIONS_MARKED_READ"]);
} else {
    echo json_encode(["success" => false, "code" => "MARK_READ_FAILED"]);
}

$stmt->close();
$conn->close();