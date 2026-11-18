<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/faculty_auth.php';
require_once __DIR__ . '/../config/chat.php';


if (
    empty($_POST) && empty($_FILES) && !empty($_SERVER['CONTENT_LENGTH']) &&
    stripos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data') !== false
) {
    facultyFail("FILE_TOO_LARGE", "File is too large", null, $conn);
}


$faculty_id = requireFacultyAuth($conn);


$input       = !empty($_POST) ? $_POST : (json_decode(file_get_contents("php://input"), true) ?? []);
$studentId   = trim($input["student_id"] ?? "");
$messageText = trim($input["message_text"] ?? "");
$hasFile     = isset($_FILES['file']) && $_FILES['file']['error'] !== UPLOAD_ERR_NO_FILE;

if ($studentId === "") {
    facultyFail("ALL_FIELDS_REQUIRED", "student_id is required", null, $conn);
}
if ($messageText === "" && !$hasFile) {
    facultyFail("MESSAGE_REQUIRED", "Write a message or attach a file", null, $conn);
}

$stmt = $conn->prepare("SELECT student_id FROM student WHERE student_id = ?");
$stmt->bind_param("s", $studentId);
$stmt->execute();
$studentExists = ($stmt->get_result()->num_rows > 0);
$stmt->close();

if (!$studentExists) {
    facultyFail("STUDENT_NOT_FOUND", "Student not found", null, $conn);
}

$attachmentPath = null;
$attachmentName = null;
$attachmentType = null;

if ($hasFile) {
    $saved = saveChatAttachment($_FILES['file']);
    if (isset($saved['error'])) {
        facultyFail($saved['error'], "Attachment rejected", null, $conn);
    }
    $attachmentPath = $saved['path'];
    $attachmentName = $saved['name'];
    $attachmentType = $saved['type'];
}

$senderType = "Faculty";
$sentAt     = date("Y-m-d H:i:s");
$textValue  = ($messageText === "") ? null : $messageText;

$stmt = $conn->prepare("
    INSERT INTO message (student_id, faculty_id, sender_type, message_text, attachment_path, attachment_name, attachment_type, sent_at, is_read)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
");
$stmt->bind_param("ssssssss", $studentId, $faculty_id, $senderType, $textValue, $attachmentPath, $attachmentName, $attachmentType, $sentAt);

if ($stmt->execute()) {
    $newId = $stmt->insert_id;
    $stmt->close();
    facultyOk("MESSAGE_SENT", [
        "message_id"      => $newId,
        "student_id"      => $studentId,
        "faculty_id"      => $faculty_id,
        "sender_type"     => $senderType,
        "message_text"    => $textValue,
        "attachment_path" => $attachmentPath,
        "attachment_name" => $attachmentName,
        "attachment_type" => $attachmentType,
        "sent_at"         => $sentAt,
        "is_read"         => 0
    ], "Message sent successfully");
} else {
    $stmt->close();

    if ($attachmentPath !== null) {
        @unlink(__DIR__ . '/../' . $attachmentPath);
    }
    facultyFail("MESSAGE_FAILED", "Failed to send message", null, $conn);
}
$conn->close();
