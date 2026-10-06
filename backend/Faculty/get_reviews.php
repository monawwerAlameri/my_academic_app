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
        review_id,
        student_id,
        faculty_id,
        rating,
        comment,
        review_date,
        is_anonymous
    FROM review
    WHERE faculty_id = ?
    ORDER BY review_date DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $facultyId);
$stmt->execute();
$result = $stmt->get_result();
$reviews = [];

 while ($row = $result->fetch_assoc()) {
    $reviews[] = $row;
}

$response["success"] = true;
$response["message"] = "Reviews retrieved successfully";
$response["data"] = $reviews;
echo json_encode($response);
?>