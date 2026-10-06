<?php
require_once __DIR__ . '/../config/database.php';
header('Content-Type: application/json');

$stmt = $conn->prepare("
    SELECT
        facultymember.faculty_id,
        facultymember.full_name,
        AVG(review.rating) AS avg_rating,
        COUNT(review.review_id) AS reviews_count
    FROM facultymember
    LEFT JOIN review ON review.faculty_id = facultymember.faculty_id
    GROUP BY facultymember.faculty_id, facultymember.full_name
    ORDER BY facultymember.full_name ASC
");
$stmt->execute();
$result = $stmt->get_result();

$doctors = [];
while ($row = $result->fetch_assoc()) {
    $doctors[] = [
        "faculty_id"    => $row['faculty_id'],
        "full_name"     => $row['full_name'],
        "avg_rating"    => $row['avg_rating'] === null ? null : round((float)$row['avg_rating'], 1),
        "reviews_count" => (int)$row['reviews_count']
    ];
}

echo json_encode([
    "success" => true,
    "code" => "DOCTORS_FETCHED",
    "data" => $doctors
]);

$stmt->close();
$conn->close();