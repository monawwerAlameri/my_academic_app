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

$stmt = $conn->prepare("
    SELECT
        notification_id,
        notification_type,
        message,
                notification_time,
        appointment_id,
        is_read
    FROM notification
    WHERE user_id = ?
    ORDER BY notification_time DESC
");
$stmt->bind_param("s", $student_id);
$stmt->execute();
$result = $stmt->get_result();

$notifications = [];
while ($row = $result->fetch_assoc()) {
    $notifications[] = $row;
}

$stmt->close();

echo json_encode([
    "success" => true,
    "code" => "NOTIFICATIONS_FETCHED",
    "data" => $notifications
]);

$conn->close();