<?php
header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
$response = [
    "success" => false,
    "message" => "",
    "data" => null
];

$facultyId = $_GET["faculty_id"] ?? "";
  if (empty($facultyId)) 
    {
    $response["message"] = "faculty_id is required";
    echo json_encode($response);
    exit;
}

$sql = "
    SELECT
        waiting_id,
        student_id,
        faculty_id,
        requested_time,
        queue_position
    FROM waitinglist
    WHERE faculty_id = ?
    ORDER BY queue_position ASC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $facultyId);
$stmt->execute();
$result = $stmt->get_result();
$waitingList = [];

 while ($row = $result->fetch_assoc()) {
    $waitingList[] = $row;
}
$response["success"] = true;
$response["message"] = "Waiting list retrieved successfully";
$response["data"] = $waitingList;
echo json_encode($response);
?>