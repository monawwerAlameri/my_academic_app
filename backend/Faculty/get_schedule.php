<?php
header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
$response = [
    "success" => false,
    "message" => "",
    "data" => []
];
$faculty_id = $_GET["faculty_id"] ?? "";
if (empty($faculty_id)) {
    $response["message"] = "Faculty ID is required";
    echo json_encode($response);
    exit;
}
$sql = "SELECT
            schedule_id,
            faculty_id,
            day_of_week,
            start_time,
            end_time,
            appointment_type,
            location
        FROM schedule
        WHERE faculty_id = ?
        ORDER BY schedule_id ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $faculty_id);
$stmt->execute();
$result = $stmt->get_result();
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}
$response["success"] = true;
$response["message"] = "Schedule retrieved successfully";
$response["data"] = $data;
echo json_encode($response);
$stmt->close();
$conn->close();
?>