<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json');

// The request is bigger than post_max_size, so PHP dropped all of it
if (
    empty($_POST) && empty($_FILES) && !empty($_SERVER['CONTENT_LENGTH']) &&
    stripos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data') !== false
) {
    echo json_encode(["success" => false, "code" => "FILE_TOO_LARGE"]);
    exit;
}

// A message with a file comes as form-data, a text-only message can also come as JSON
$data = !empty($_POST) ? $_POST : json_decode(file_get_contents("php://input"), true);
$student_id   = $data['student_id'] ?? '';
$faculty_id   = $data['faculty_id'] ?? '';
$message_text = trim($data['message_text'] ?? '');
$has_file     = isset($_FILES['file']) && $_FILES['file']['error'] !== UPLOAD_ERR_NO_FILE;

if (empty($student_id) || empty($faculty_id)) {
    echo json_encode(["success" => false, "code" => "ALL_FIELDS_REQUIRED"]);
    exit;
}
requireActiveStudent($conn, $student_id); 

if ($message_text === '' && !$has_file) {
    echo json_encode(["success" => false, "code" => "MESSAGE_REQUIRED"]);
    exit;
}

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
// Chat is allowed only if there is an Online appointment between them that already started
$now_check = date("Y-m-d H:i:s");
$chatStmt = $conn->prepare("
    SELECT appointment_id
    FROM appointment
    WHERE student_id = ? AND faculty_id = ?
    AND appointment_type = 'Online'
    AND status IN ('Booked', 'Completed')
    AND CONCAT(appointment_date, ' ', appointment_time) <= ?
    LIMIT 1
");
$chatStmt->bind_param("sss", $student_id, $faculty_id, $now_check);
$chatStmt->execute();
$chatAllowed = $chatStmt->get_result()->num_rows;
$chatStmt->close();

if ($chatAllowed == 0) {
    echo json_encode(["success" => false, "code" => "CHAT_NOT_ALLOWED"]);
    $conn->close();
    exit;
}

$attachment_path = null;
$attachment_name = null;
$attachment_type = null;

if ($has_file) {
    $file          = $_FILES['file'];
    $max_file_size = 10 * 1024 * 1024; // 10 MB

    if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE || $file['size'] > $max_file_size) {
        echo json_encode(["success" => false, "code" => "FILE_TOO_LARGE"]);
        $conn->close();
        exit;
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(["success" => false, "code" => "UPLOAD_FAILED"]);
        $conn->close();
        exit;
    }

    // Only these file types are allowed (anything else, like PHP, is rejected)
    $allowed_files = [
        'jpg' => 'image', 'jpeg' => 'image', 'png' => 'image',
        'mp4' => 'video',
        'pdf' => 'file', 'doc' => 'file', 'docx' => 'file',
        'ppt' => 'file', 'pptx' => 'file',
        'xls' => 'file', 'xlsx' => 'file', 'txt' => 'file'
    ];
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!isset($allowed_files[$extension])) {
        echo json_encode(["success" => false, "code" => "INVALID_FILE_TYPE"]);
        $conn->close();
        exit;
    }
    if ($allowed_files[$extension] === 'image' && @getimagesize($file['tmp_name']) === false) {
        echo json_encode(["success" => false, "code" => "INVALID_FILE_TYPE"]);
        $conn->close();
        exit;
    }

    // The file is saved with a random name, so nobody can guess it or upload a script
    $upload_dir = __DIR__ . '/../uploads/chat/';
    if (!is_dir($upload_dir) && !mkdir($upload_dir, 0777, true)) {
        echo json_encode(["success" => false, "code" => "UPLOAD_FAILED"]);
        $conn->close();
        exit;
    }

    $stored_name = bin2hex(random_bytes(16)) . '.' . $extension;
    if (!move_uploaded_file($file['tmp_name'], $upload_dir . $stored_name)) {
        echo json_encode(["success" => false, "code" => "UPLOAD_FAILED"]);
        $conn->close();
        exit;
    }

    $attachment_path = 'uploads/chat/' . $stored_name;
    $attachment_name = $file['name'];
    $attachment_type = $allowed_files[$extension];
}

$text_value = ($message_text === '') ? null : $message_text;
$sent_at    = date("Y-m-d H:i:s");

try {
    $insertStmt = $conn->prepare("INSERT INTO message (student_id, faculty_id, sender_type, message_text, attachment_path, attachment_name, attachment_type, sent_at) VALUES (?, ?, 'student', ?, ?, ?, ?, ?)");
    $insertStmt->bind_param("sssssss", $student_id, $faculty_id, $text_value, $attachment_path, $attachment_name, $attachment_type, $sent_at);
    $insertStmt->execute();
    $message_id = $conn->insert_id;
    $insertStmt->close();

    echo json_encode([
        "success" => true,
        "code" => "MESSAGE_SENT",
        "data" => [
            "message_id" => $message_id,
            "sent_at" => $sent_at,
            "attachment_path" => $attachment_path
        ]
    ]);
} catch (Throwable $e) {
    // The message was not saved, so the uploaded file is removed too
    if ($attachment_path !== null) {
        @unlink(__DIR__ . '/../' . $attachment_path);
    }
    echo json_encode(["success" => false, "code" => "MESSAGE_FAILED"]);
}

$conn->close();