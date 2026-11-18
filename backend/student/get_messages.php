<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';
require_once __DIR__ . '/../config/chat.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$student_id       = $data['student_id'] ?? '';
$faculty_id       = $data['faculty_id'] ?? '';
$after_message_id = (int)($data['after_message_id'] ?? 0);

if (empty($student_id) || empty($faculty_id)) {
    echo json_encode(["success" => false, "code" => "ALL_FIELDS_REQUIRED"]);
    exit;
}
requireActiveStudent($conn, $student_id); 

// Student must exist
$stmt = $conn->prepare("SELECT student_id FROM student WHERE student_id = ?");
$stmt->bind_param("s", $student_id);
$stmt->execute();
$studentFound = $stmt->get_result()->num_rows;
$stmt->close();

if ($studentFound == 0) {
    echo json_encode(["success" => false, "code" => "STUDENT_NOT_FOUND"]);
    $conn->close();
    exit;
}

// Faculty must exist
$stmt = $conn->prepare("SELECT faculty_id FROM facultymember WHERE faculty_id = ?");
$stmt->bind_param("s", $faculty_id);
$stmt->execute();
$facultyFound = $stmt->get_result()->num_rows;
$stmt->close();

if ($facultyFound == 0) {
    echo json_encode(["success" => false, "code" => "FACULTY_NOT_FOUND"]);
    $conn->close();
    exit;
}
if (!chatExists($conn, $student_id, $faculty_id)) {
    echo json_encode(["success" => false, "code" => "CHAT_NOT_ALLOWED"]);
    $conn->close();
    exit;
}

$stmt = $conn->prepare("
    SELECT message_id, sender_type, message_text, attachment_path, attachment_name, attachment_type, sent_at
    FROM message
    WHERE student_id = ? AND faculty_id = ? AND message_id > ?
    ORDER BY message_id ASC
");
$stmt->bind_param("ssi", $student_id, $faculty_id, $after_message_id);
$stmt->execute();
$result = $stmt->get_result();

$messages = [];
$last_faculty_message_id = 0;
while ($row = $result->fetch_assoc()) {
    $row['message_id'] = (int)$row['message_id'];
    $row['is_mine']    = ($row['sender_type'] === 'student');
    if (!$row['is_mine']) {
        $last_faculty_message_id = $row['message_id'];
    }
    unset($row['sender_type']);
    $messages[] = $row;
}

$stmt->close();

if ($last_faculty_message_id > 0) {
    $readStmt = $conn->prepare("UPDATE message SET is_read = 1 WHERE student_id = ? AND faculty_id = ? AND sender_type = 'faculty' AND is_read = 0 AND message_id <= ?");
    $readStmt->bind_param("ssi", $student_id, $faculty_id, $last_faculty_message_id);
    $readStmt->execute();
    $readStmt->close();
}

$can_send = isFacultyActive($conn, $faculty_id);

echo json_encode([
    "success" => true,
    "code" => "MESSAGES_FETCHED",
    "data" => $messages,
    "can_send" => $can_send
]);

$conn->close();