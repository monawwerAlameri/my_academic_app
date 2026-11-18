<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$student_id = $data['student_id'] ?? '';
$waiting_id = $data['waiting_id'] ?? '';

if (empty($student_id)) {
    echo json_encode(["success" => false, "code" => "STUDENT_ID_REQUIRED"]);
    exit;
}
if (empty($waiting_id)) {
    echo json_encode(["success" => false, "code" => "WAITING_ID_REQUIRED"]);
    exit;
}
requireActiveStudent($conn, $student_id); 

$stmt = $conn->prepare("SELECT faculty_id FROM waitinglist WHERE waiting_id = ? AND student_id = ?");
$stmt->bind_param("is", $waiting_id, $student_id);
$stmt->execute();
$entry = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$entry) {
    echo json_encode(["success" => false, "code" => "WAITING_NOT_FOUND"]);
    $conn->close();
    exit;
}

$faculty_id = $entry['faculty_id'];

$conn->begin_transaction();

try {
    $lockStmt = $conn->prepare("SELECT faculty_id FROM facultymember WHERE faculty_id = ? FOR UPDATE");
    $lockStmt->bind_param("s", $faculty_id);
    $lockStmt->execute();
    $lockStmt->get_result();
    $lockStmt->close();

    $readStmt = $conn->prepare("SELECT requested_time, requested_end_time, queue_position FROM waitinglist WHERE waiting_id = ? AND student_id = ?");
    $readStmt->bind_param("is", $waiting_id, $student_id);
    $readStmt->execute();
    $current = $readStmt->get_result()->fetch_assoc();
    $readStmt->close();

    if (!$current) {
        $conn->rollback();
        echo json_encode(["success" => false, "code" => "WAITING_NOT_FOUND"]);
        $conn->close();
        exit;
    }

    $deleteStmt = $conn->prepare("DELETE FROM waitinglist WHERE waiting_id = ? AND student_id = ?");
    $deleteStmt->bind_param("is", $waiting_id, $student_id);
    $deleteStmt->execute();
    $deleted = $deleteStmt->affected_rows;
    $deleteStmt->close();

    if ($deleted == 0) {
        $conn->rollback();
        echo json_encode(["success" => false, "code" => "WAITING_NOT_FOUND"]);
        $conn->close();
        exit;
    }

    $shiftStmt = $conn->prepare("
        UPDATE waitinglist
        SET queue_position = queue_position - 1
        WHERE faculty_id = ? AND requested_time = ? AND requested_end_time = ?
        AND queue_position > ?
    ");
    $shiftStmt->bind_param("sssi", $faculty_id, $current['requested_time'], $current['requested_end_time'], $current['queue_position']);
    $shiftStmt->execute();
    $shiftStmt->close();

    $conn->commit();
    echo json_encode(["success" => true, "code" => "WAITING_LIST_LEFT"]);
} catch (Throwable $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "code" => "LEAVE_FAILED"]);
}

$conn->close();