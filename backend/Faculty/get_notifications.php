<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/faculty_auth.php';

$faculty_id = requireFacultyAuth($conn);

$stmt = $conn->prepare("
    SELECT notification_id, user_id, notification_type, message, notification_time, appointment_id
    FROM notification
    WHERE user_id = ?
    ORDER BY notification_time DESC
");
$stmt->bind_param("s", $faculty_id);
$stmt->execute();
$result = $stmt->get_result();
$notifications = [];
while ($row = $result->fetch_assoc()) {
    $notifications[] = $row;
}
$stmt->close();

facultyOk("NOTIFICATIONS_RETRIEVED", $notifications, "Notifications retrieved successfully");
$conn->close();
