<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/faculty_auth.php';

$faculty_id = requireFacultyAuth($conn);

$stmt = $conn->prepare("
    SELECT r.review_id, r.student_id,
           CASE WHEN r.is_anonymous = 1 THEN 'Anonymous' ELSE s.full_name END AS student_name,
           r.faculty_id, r.rating, r.comment, r.review_date, r.is_anonymous
    FROM review r
    INNER JOIN student s ON r.student_id = s.student_id
    WHERE r.faculty_id = ?
    ORDER BY r.review_date DESC
");
$stmt->bind_param("s", $faculty_id);
$stmt->execute();
$result = $stmt->get_result();
$reviews = [];
while ($row = $result->fetch_assoc()) {
    $reviews[] = $row;
}
$stmt->close();

facultyOk("REVIEWS_RETRIEVED", $reviews, "Reviews retrieved successfully");
$conn->close();
