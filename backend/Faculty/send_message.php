<?php

header("Content-Type: application/json");

require_once __DIR__ . '/../config/database.php';

$response = [
    "success" => false,
    "message" => "",
    "data" => null
];

$input = json_decode(file_get_contents("php://input"), true);

$facultyId = $input["faculty_id"] ?? "";
$studentId = $input["student_id"] ?? "";
$messageText = trim($input["message_text"] ?? "");

if (
    empty($facultyId) ||
    empty($studentId) ||
    empty($messageText)
) {

    $response["message"] = "faculty_id, student_id and message_text are required";

    echo json_encode($response);
    exit;
}

// Check that faculty and student exist

$checkSql = "
    SELECT
        (SELECT COUNT(*) FROM facultymember WHERE faculty_id = ?) AS faculty_exists,
        (SELECT COUNT(*) FROM student WHERE student_id = ?) AS student_exists
";

$checkStmt = $conn->prepare($checkSql);

$checkStmt->bind_param(
    "ss",
    $facultyId,
    $studentId
);

$checkStmt->execute();

$checkResult = $checkStmt->get_result();

$checkData = $checkResult->fetch_assoc();

$checkStmt->close();

if (
    $checkData["faculty_exists"] == 0 ||
    $checkData["student_exists"] == 0
) {

    $response["message"] = "Faculty member or student not found";

    echo json_encode($response);
    exit;
}

// Insert faculty message

$senderType = "Faculty";
$sentAt = date("Y-m-d H:i:s");

$sql = "
    INSERT INTO message
    (
        student_id,
        faculty_id,
        sender_type,
        message_text,
        sent_at,
        is_read
    )
    VALUES (?, ?, ?, ?, ?, 0)
";

$stmt = $conn->prepare($sql);

$stmt->bind_param(
    "sssss",
    $studentId,
    $facultyId,
    $senderType,
    $messageText,
    $sentAt
);

if ($stmt->execute()) {

    $response["success"] = true;

    $response["message"] = "Message sent successfully";

    $response["data"] = [
        "message_id" => $stmt->insert_id,
        "student_id" => $studentId,
        "faculty_id" => $facultyId,
        "sender_type" => $senderType,
        "message_text" => $messageText,
        "sent_at" => $sentAt,
        "is_read" => 0
    ];

} else {

    $response["message"] = "Failed to send message";

}

echo json_encode($response);

$stmt->close();
$conn->close();

?>
