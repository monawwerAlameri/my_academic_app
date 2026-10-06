<?php
header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
$response = [
    "success" => false,
    "message" => "",
    "data" => []
];
$input = json_decode(file_get_contents("php://input"), true);
$faculty_id = $input["faculty_id"] ?? "";
$day_of_week = $input["day_of_week"] ?? "";
$start_time = $input["start_time"] ?? "";
$end_time = $input["end_time"] ?? "";
$appointment_type = $input["appointment_type"] ?? "";
$location = $input["location"] ?? "";
if (
    empty($faculty_id) ||
    empty($day_of_week) ||
    empty($start_time) ||
    empty($end_time) ||
    empty($appointment_type) ||
    empty($location)
) {
    $response["message"] = "All schedule fields are required";
    echo json_encode($response);
    exit;
}
$sql = "INSERT INTO schedule
        (faculty_id, day_of_week, start_time, end_time, appointment_type, location)
        VALUES (?, ?, ?, ?, ?, ?)";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "ssssss",
    $faculty_id,
    $day_of_week,
    $start_time,
    $end_time,
    $appointment_type,
    $location
);
  if ($stmt->execute()) {

    $response["success"] = true;
    $response["message"] = "Schedule created successfully";

} 
  else {

    $response["message"] = "Failed to create schedule";
}
echo json_encode($response);
$stmt->close();
$conn->close();
?>