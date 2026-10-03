<?php
require_once __DIR__ . '/../config/database.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$student_id     = $data['student_id'] ?? '';
$appointment_id = $data['appointment_id'] ?? '';

if (empty($student_id)) {
    echo json_encode(["success" => false, "code" => "STUDENT_ID_REQUIRED"]);
    exit;
}
if (empty($appointment_id)) {
    echo json_encode(["success" => false, "code" => "APPOINTMENT_ID_REQUIRED"]);
    exit;
}

$stmt = $conn->prepare("
    SELECT
        appointment.faculty_id,
        appointment.appointment_time,
        appointment.status,
        student.full_name AS student_name,
        facultymember.full_name AS doctor_name
    FROM appointment
    INNER JOIN student ON appointment.student_id = student.student_id
    INNER JOIN facultymember ON appointment.faculty_id = facultymember.faculty_id
    WHERE appointment.appointment_id = ?
    AND appointment.student_id = ?
");
$stmt->bind_param("is", $appointment_id, $student_id);
$stmt->execute();
$appointment = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$appointment) {
    echo json_encode(["success" => false, "code" => "APPOINTMENT_NOT_FOUND"]);
    $conn->close();
    exit;
}

if ($appointment['status'] != 'Booked') {
    echo json_encode(["success" => false, "code" => "APPOINTMENT_NOT_CANCELLABLE"]);
    $conn->close();
    exit;
}

$faculty_id        = $appointment['faculty_id'];
$time_text         = date("g:i A", strtotime($appointment['appointment_time']));
$now               = date("Y-m-d H:i:s");
$notification_type = "Cancellation";
$student_message   = "Your appointment with " . $appointment['doctor_name'] . " at " . $time_text . " has been cancelled.";
$doctor_message    = $appointment['student_name'] . " cancelled their appointment at " . $time_text . ".";

$conn->begin_transaction();

try {
    $updateStmt = $conn->prepare("UPDATE appointment SET status = 'Cancelled' WHERE appointment_id = ? AND student_id = ? AND status = 'Booked'");
    $updateStmt->bind_param("is", $appointment_id, $student_id);
    $updateStmt->execute();
    $updated = $updateStmt->affected_rows;
    $updateStmt->close();

    if ($updated == 0) {
        $conn->rollback();
        echo json_encode(["success" => false, "code" => "APPOINTMENT_NOT_CANCELLABLE"]);
        $conn->close();
        exit;
    }

    $notifStmt = $conn->prepare("INSERT INTO notification (user_id, notification_type, message, notification_time, appointment_id) VALUES (?, ?, ?, ?, ?)");

    $notifStmt->bind_param("ssssi", $student_id, $notification_type, $student_message, $now, $appointment_id);
    $notifStmt->execute();

    $notifStmt->bind_param("ssssi", $faculty_id, $notification_type, $doctor_message, $now, $appointment_id);
    $notifStmt->execute();
    $notifStmt->close();

    $conn->commit();
    echo json_encode(["success" => true, "code" => "APPOINTMENT_CANCELLED"]);
} catch (Throwable $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "code" => "CANCEL_FAILED"]);
}

$conn->close();