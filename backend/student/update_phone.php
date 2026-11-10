<?php
require_once __DIR__ . '/../config/database.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$student_id   = $data['student_id'] ?? '';
$phone_number = $data['phone_number'] ?? '';

if (empty($student_id) || empty($phone_number)) {
    echo json_encode(["success" => false, "code" => "ALL_FIELDS_REQUIRED"]);
    exit;
}

if (!preg_match('/^05[0-9]{8}$/', $phone_number)) {
    echo json_encode(["success" => false, "code" => "INVALID_PHONE_FORMAT"]);
    exit;
}

$studentStmt = $conn->prepare("SELECT student_id FROM student WHERE student_id = ?");
$studentStmt->bind_param("s", $student_id);
$studentStmt->execute();
$studentResult = $studentStmt->get_result();

if ($studentResult->num_rows == 0) {
    echo json_encode(["success" => false, "code" => "STUDENT_NOT_FOUND"]);
    $studentStmt->close();
    $conn->close();
    exit;
}
$studentStmt->close();



$checkStmt = $conn->prepare("SELECT student_id FROM student WHERE phone_number = ? AND student_id != ?");
$checkStmt->bind_param("ss", $phone_number, $student_id);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();

if ($checkResult->num_rows > 0) {
    echo json_encode(["success" => false, "code" => "PHONE_ALREADY_USED"]);
    $checkStmt->close();
    $conn->close();
    exit;
}
$checkStmt->close();

$updateStmt = $conn->prepare("UPDATE student SET phone_number = ? WHERE student_id = ?");
$updateStmt->bind_param("ss", $phone_number, $student_id);

if ($updateStmt->execute()) {
    echo json_encode(["success" => true, "code" => "PHONE_UPDATED"]);
} else {
    echo json_encode(["success" => false, "code" => "PHONE_UPDATE_FAILED"]);
}

$updateStmt->close();
$conn->close();