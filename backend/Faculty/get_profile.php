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
        faculty_id,
        full_name,
        email,
        phone_number,
        office_location
    FROM facultymember
    WHERE faculty_id = ?
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $facultyId);
$stmt->execute();
$result = $stmt->get_result();

 if ($result->num_rows === 0) {

    $response["message"] = "Faculty member not found";

} 
  else {

    $faculty = $result->fetch_assoc();
    $response["success"] = true;
    $response["message"] = "Faculty profile retrieved successfully";
    $response["data"] = $faculty;
}
echo json_encode($response);
?>