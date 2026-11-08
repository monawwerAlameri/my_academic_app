<?php
header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
$response = [
    "success" => false,
    "message" => "",
    "data" => null
];

$facultyId = $_GET["faculty_id"] ?? "";

if (empty($facultyId)) {

    $response["message"] = "faculty_id is required";
    echo json_encode($response);
    exit;
}

$sql = "
    SELECT
        notification_id,
        user_id,
        notification_type,
        message,
        notification_time,
        appointment_id
    FROM notification
    WHERE user_id = ?
    ORDER BY notification_time DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $facultyId);
$stmt->execute();
$result = $stmt->get_result();
$notifications = [];

while ($row = $result->fetch_assoc()) {
    $notifications[] = $row;
}

$response["success"] = true;
$response["message"] = "Notifications retrieved successfully";
$response["data"] = $notifications;
echo json_encode($response);
?>