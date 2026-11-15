<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/faculty_auth.php';

$faculty_id = requireFacultyAuth($conn);

$input       = json_decode(file_get_contents("php://input"), true) ?? [];
$studentId   = trim($input["student_id"] ?? "");
$messageText = trim($input["message_text"] ?? "");

if ($studentId === "" || $messageText === "") {
    facultyFail("ALL_FIELDS_REQUIRED", "student_id and message_text are required", null, $conn);
}


$stmt = $conn->prepare("SELECT student_id FROM student WHERE student_id = ?");
$stmt->bind_param("s", $studentId);
$stmt->execute();
$studentExists = ($stmt->get_result()->num_rows > 0);
$stmt->close();

if (!$studentExists) {
    facultyFail("STUDENT_NOT_FOUND", "Student not found", null, $conn);
}

$senderType = "Faculty";
$sentAt     = date("Y-m-d H:i:s");

$stmt = $conn->prepare("
    INSERT INTO message (student_id, faculty_id, sender_type, message_text, sent_at, is_read)
    VALUES (?, ?, ?, ?, ?, 0)
");
$stmt->bind_param("sssss", $studentId, $faculty_id, $senderType, $messageText, $sentAt);

if ($stmt->execute()) {
    $newId = $stmt->insert_id;
    $stmt->close();
    facultyOk("MESSAGE_SENT", [
        "message_id"   => $newId,
        "student_id"   => $studentId,
        "faculty_id"   => $faculty_id,
        "sender_type"  => $senderType,
        "message_text" => $messageText,
        "sent_at"      => $sentAt,
        "is_read"      => 0
    ], "Message sent successfully");
} else {
    $stmt->close();
    facultyFail("SAVE_FAILED", "Failed to send message", null, $conn);
}
$conn->close();
