<?php
header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
$response = [
    "success" => false,
    "message" => "",
    "data" => []
];
$input = json_decode(file_get_contents("php://input"), true);
$schedule_id = $input["schedule_id"] ?? "";
$faculty_id = $input["faculty_id"] ?? "";
if (empty($schedule_id) || empty($faculty_id)) {
    $response["message"] = "Schedule ID and Faculty ID are required";
    echo json_encode($response);
    exit;
}
$sql = "DELETE FROM schedule
        WHERE schedule_id = ?
        AND faculty_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "is",
    $schedule_id,
    $faculty_id
);
  if ($stmt->execute()) {

    $response["success"] = true;
    $response["message"] = "Schedule deleted successfully";

} 
  else {

    $response["message"] = "Failed to delete schedule";
}
echo json_encode($response);
$stmt->close();
$conn->close();
?>