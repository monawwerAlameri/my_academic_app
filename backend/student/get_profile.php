<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$student_id = $data['student_id'] ?? '';

if (empty($student_id)) {
    echo json_encode(["success" => false, "code" => "STUDENT_ID_REQUIRED"]);
    exit;
}
requireActiveStudent($conn, $student_id);

$stmt = $conn->prepare("SELECT full_name, email, phone_number FROM student WHERE student_id = ?");
$stmt->bind_param("s", $student_id);
$stmt->execute();
$student = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$student) {
    echo json_encode(["success" => false, "code" => "STUDENT_NOT_FOUND"]);
    $conn->close();
    exit;
}

echo json_encode([
    "success" => true,
    "code" => "PROFILE_FETCHED",
    "data" => $student
]);

$conn->close();