<?php
require_once __DIR__ . '/../config/database.php';
header('Content-Type: application/json');
// Waiting lists of appointment times that already started are removed
$clean_now = date("Y-m-d H:i:s");
$cleanStmt = $conn->prepare("DELETE FROM waitinglist WHERE requested_time <= ?");
$cleanStmt->bind_param("s", $clean_now);
$cleanStmt->execute();
$cleanStmt->close();

$data = json_decode(file_get_contents("php://input"), true);
$student_id = $data['student_id'] ?? '';

if (empty($student_id)) {
    echo json_encode(["success" => false, "code" => "STUDENT_ID_REQUIRED"]);
    exit;
}

$now = date("Y-m-d H:i:s");

$stmt = $conn->prepare("
    SELECT
        waitinglist.waiting_id,
        facultymember.full_name AS doctor_name,
        waitinglist.requested_time,
        waitinglist.requested_end_time,
        waitinglist.appointment_type,
        waitinglist.consultation_type,
        waitinglist.queue_position
    FROM waitinglist
    INNER JOIN facultymember ON waitinglist.faculty_id = facultymember.faculty_id
    WHERE waitinglist.student_id = ?
    AND waitinglist.requested_time > ?
    ORDER BY waitinglist.requested_time ASC
");
$stmt->bind_param("ss", $student_id, $now);
$stmt->execute();
$result = $stmt->get_result();

$waiting_list = [];
while ($row = $result->fetch_assoc()) {
    $row['queue_position'] = (int)$row['queue_position'];
    $row['ahead_of_you']   = $row['queue_position'] - 1;
    $waiting_list[] = $row;
}

$stmt->close();

echo json_encode([
    "success" => true,
    "code" => "WAITING_LIST_FETCHED",
    "data" => $waiting_list
]);

$conn->close();