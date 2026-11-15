<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/faculty_auth.php';

$faculty_id = requireFacultyAuth($conn);

$studentId = trim($_GET["student_id"] ?? "");
if ($studentId === "") {
    facultyFail("ALL_FIELDS_REQUIRED", "student_id is required", null, $conn);
}


$stmt = $conn->prepare("UPDATE message SET is_read = 1 WHERE faculty_id = ? AND student_id = ? AND sender_type = 'Student'");
$stmt->bind_param("ss", $faculty_id, $studentId);
$stmt->execute();
$stmt->close();

$stmt = $conn->prepare("
    SELECT message_id, student_id, faculty_id, sender_type, message_text,
           attachment_path, attachment_name, attachment_type, sent_at, is_read
    FROM message
    WHERE faculty_id = ? AND student_id = ?
    ORDER BY sent_at ASC, message_id ASC
");
$stmt->bind_param("ss", $faculty_id, $studentId);
$stmt->execute();
$result = $stmt->get_result();
$messages = [];
while ($row = $result->fetch_assoc()) {
    $messages[] = $row;
}
$stmt->close();

facultyOk("MESSAGES_RETRIEVED", $messages, "Messages retrieved successfully");
$conn->close();
