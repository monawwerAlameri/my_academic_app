<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json');
$complete_now = date("Y-m-d H:i:s");
$completeStmt = $conn->prepare("UPDATE appointment SET status = 'Pending Confirmation' WHERE status = 'Booked' AND CONCAT(appointment_date, ' ', appointment_end_time) <= ?");
$completeStmt->bind_param("s", $complete_now);
$completeStmt->execute();
$completeStmt->close();

$data = json_decode(file_get_contents("php://input"), true);
$student_id   = $data['student_id'] ?? '';
$faculty_id   = $data['faculty_id'] ?? '';
$rating       = $data['rating'] ?? '';
$comment      = trim($data['comment'] ?? '');
$is_anonymous = !empty($data['is_anonymous']) ? 1 : 0;

if (empty($student_id) || empty($faculty_id) || empty($rating) || $comment === '') {
    echo json_encode(["success" => false, "code" => "ALL_FIELDS_REQUIRED"]);
    exit;
}
requireActiveStudent($conn, $student_id); 
requireActiveFaculty($conn, $faculty_id);

$rating = (int)$rating;
if ($rating < 1 || $rating > 5) {
    echo json_encode(["success" => false, "code" => "INVALID_RATING"]);
    exit;
}

$countStmt = $conn->prepare("
    SELECT
        (SELECT COUNT(*) FROM appointment WHERE student_id = ? AND faculty_id = ? AND status = 'Completed') AS completed_count,
        (SELECT COUNT(*) FROM review WHERE student_id = ? AND faculty_id = ?) AS reviews_count
");
$countStmt->bind_param("ssss", $student_id, $faculty_id, $student_id, $faculty_id);
$countStmt->execute();
$counts = $countStmt->get_result()->fetch_assoc();
$countStmt->close();

if ($counts['completed_count'] == 0) {
    echo json_encode(["success" => false, "code" => "NO_COMPLETED_APPOINTMENT"]);
    $conn->close();
    exit;
}
// A student can write at most 5 reviews for the same doctor
$max_reviews_per_doctor = 5;
if ($counts['reviews_count'] >= $max_reviews_per_doctor) {
    echo json_encode(["success" => false, "code" => "REVIEW_MAX_REACHED"]);
    $conn->close();
    exit;
}

if ($counts['reviews_count'] >= $counts['completed_count']) {
    echo json_encode(["success" => false, "code" => "REVIEW_LIMIT_REACHED"]);
    $conn->close();
    exit;
}

$review_date = date("Y-m-d");

$insertStmt = $conn->prepare("INSERT INTO review (student_id, faculty_id, rating, comment, review_date, is_anonymous) VALUES (?, ?, ?, ?, ?, ?)");
$insertStmt->bind_param("ssissi", $student_id, $faculty_id, $rating, $comment, $review_date, $is_anonymous);

if ($insertStmt->execute()) {
    echo json_encode(["success" => true, "code" => "REVIEW_ADDED"]);
} else {
    echo json_encode(["success" => false, "code" => "REVIEW_FAILED"]);
}

$insertStmt->close();
$conn->close();