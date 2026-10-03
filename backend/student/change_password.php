<?php
require_once __DIR__ . '/../config/database.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$student_id       = $data['student_id'] ?? '';
$current_password = $data['current_password'] ?? '';
$new_password     = $data['new_password'] ?? '';

if (empty($student_id) || empty($current_password) || empty($new_password)) {
    echo json_encode(["success" => false, "code" => "ALL_FIELDS_REQUIRED"]);
    exit;
}

$stmt = $conn->prepare("SELECT password FROM student WHERE student_id = ?");
$stmt->bind_param("s", $student_id);
$stmt->execute();
$student = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$student) {
    echo json_encode(["success" => false, "code" => "STUDENT_NOT_FOUND"]);
    $conn->close();
    exit;
}

if (!password_verify($current_password, $student['password'])) {
    echo json_encode(["success" => false, "code" => "INVALID_CURRENT_PASSWORD"]);
    $conn->close();
    exit;
}

$hashedPassword = password_hash($new_password, PASSWORD_DEFAULT);

$updateStmt = $conn->prepare("UPDATE student SET password = ? WHERE student_id = ?");
$updateStmt->bind_param("ss", $hashedPassword, $student_id);

if ($updateStmt->execute()) {
    echo json_encode(["success" => true, "code" => "PASSWORD_CHANGED"]);
} else {
    echo json_encode(["success" => false, "code" => "PASSWORD_CHANGE_FAILED"]);
}

$updateStmt->close();
$conn->close();