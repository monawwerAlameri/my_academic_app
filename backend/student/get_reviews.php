<?php
require_once __DIR__ . '/../config/database.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$faculty_id = $data['faculty_id'] ?? '';

if (empty($faculty_id)) {
    echo json_encode(["success" => false, "code" => "FACULTY_ID_REQUIRED"]);
    exit;
}

$facultyStmt = $conn->prepare("SELECT faculty_id FROM facultymember WHERE faculty_id = ?");
$facultyStmt->bind_param("s", $faculty_id);
$facultyStmt->execute();
$facultyResult = $facultyStmt->get_result();

if ($facultyResult->num_rows == 0) {
    echo json_encode(["success" => false, "code" => "FACULTY_NOT_FOUND"]);
    $facultyStmt->close();
    $conn->close();
    exit;
}
$facultyStmt->close();

$stmt = $conn->prepare("
    SELECT
        review.review_id,
        review.rating,
        review.comment,
        review.review_date,
        review.is_anonymous,
        CASE WHEN review.is_anonymous = 1 THEN NULL ELSE student.full_name END AS reviewer_name
    FROM review
    INNER JOIN student ON review.student_id = student.student_id
    WHERE review.faculty_id = ?
    ORDER BY review.review_date DESC, review.review_id DESC
");
$stmt->bind_param("s", $faculty_id);
$stmt->execute();
$result = $stmt->get_result();

$reviews = [];
while ($row = $result->fetch_assoc()) {
    $reviews[] = $row;
}

echo json_encode([
    "success" => true,
    "code" => "REVIEWS_FETCHED",
    "data" => $reviews
]);

$stmt->close();
$conn->close();