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
        r.review_id,
        r.student_id,

        CASE
            WHEN r.is_anonymous = 1 THEN 'Anonymous'
            ELSE s.full_name
        END AS student_name,

        r.faculty_id,
        r.rating,
        r.comment,
        r.review_date,
        r.is_anonymous

    FROM review r

    INNER JOIN student s
        ON r.student_id = s.student_id

    WHERE r.faculty_id = ?

    ORDER BY r.review_date DESC
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

$stmt->close();
$conn->close();

?>
