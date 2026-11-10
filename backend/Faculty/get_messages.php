<?php

header("Content-Type: application/json");

require_once __DIR__ . '/../config/database.php';

$response = [
    "success" => false,
    "message" => "",
    "data" => []
];

$facultyId = $_GET["faculty_id"] ?? "";
$studentId = $_GET["student_id"] ?? "";

if (empty($facultyId) || empty($studentId)) {

    $response["message"] = "faculty_id and student_id are required";
    echo json_encode($response);
    exit;
}

// Mark student's messages as read

$updateSql = "
    UPDATE message
    SET is_read = 1
    WHERE faculty_id = ?
    AND student_id = ?
    AND sender_type = 'Student'
";

$updateStmt = $conn->prepare($updateSql);

$updateStmt->bind_param(
    "ss",
    $facultyId,
    $studentId
);

$updateStmt->execute();

$updateStmt->close();

// Retrieve conversation messages

$sql = "
    SELECT
        message_id,
        student_id,
        faculty_id,
        sender_type,
        message_text,
        attachment_path,
        attachment_name,
        attachment_type,
        sent_at,
        is_read
    FROM message
    WHERE faculty_id = ?
    AND student_id = ?
    ORDER BY sent_at ASC, message_id ASC
";

$stmt = $conn->prepare($sql);

$stmt->bind_param(
    "ss",
    $facultyId,
    $studentId
);

$stmt->execute();

$result = $stmt->get_result();

$messages = [];

while ($row = $result->fetch_assoc()) {

    $messages[] = $row;

}

$response["success"] = true;
$response["message"] = "Messages retrieved successfully";
$response["data"] = $messages;

echo json_encode($response);

$stmt->close();
$conn->close();

?>

