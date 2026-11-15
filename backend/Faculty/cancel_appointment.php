<?php
header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/faculty_auth.php';
require_once __DIR__ . '/../config/waiting_list.php';
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);   

$faculty_id = requireFacultyAuth($conn);

$input          = json_decode(file_get_contents("php://input"), true) ?? [];
$appointment_id = (int)($input["appointment_id"] ?? 0);
$reason         = trim($input["reason"] ?? "");

if ($appointment_id <= 0) {
    facultyFail("ALL_FIELDS_REQUIRED", "Appointment ID is required", null, $conn);
}

$stmt = $conn->prepare("
    SELECT a.student_id, a.appointment_date, a.appointment_time, a.appointment_end_time, a.status,
           f.full_name AS doctor_name
    FROM appointment a
    INNER JOIN facultymember f ON a.faculty_id = f.faculty_id
    WHERE a.appointment_id = ? AND a.faculty_id = ?
");
$stmt->bind_param("is", $appointment_id, $faculty_id);
$stmt->execute();
$appointment = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$appointment) {
    facultyFail("APPOINTMENT_NOT_FOUND", "Appointment not found", null, $conn);
}


$start_ts = strtotime($appointment['appointment_date'] . ' ' . $appointment['appointment_time']);
if ($appointment['status'] !== 'Booked' || $start_ts <= time()) {
    facultyFail("APPOINTMENT_NOT_CANCELLABLE", "Appointment cannot be cancelled", null, $conn);
}

$now          = date("Y-m-d H:i:s");
$promoted_id  = null;
$cancelled    = false;

$conn->begin_transaction();
try {
    $lock = $conn->prepare("SELECT faculty_id FROM facultymember WHERE faculty_id = ? FOR UPDATE");
    $lock->bind_param("s", $faculty_id);
    $lock->execute();
    $lock->get_result();
    $lock->close();

    $stmt = $conn->prepare("UPDATE appointment SET status = 'Cancelled' WHERE appointment_id = ? AND faculty_id = ? AND status = 'Booked'");
    $stmt->bind_param("is", $appointment_id, $faculty_id);
    $stmt->execute();
    $cancelled = ($stmt->affected_rows > 0);
    $stmt->close();

    if ($cancelled) {
        // H2: نفس صيغة باقي الإشعارات حتى تظهر شارة «ألغاه الدكتور» واسم الدكتور والتاريخ
        $type    = "Cancellation";
        $message = json_encode([
            "doctor" => $appointment['doctor_name'],
            "date"   => $appointment['appointment_date'],
            "time"   => $appointment['appointment_time'],
            "by"     => "faculty",
            "reason" => $reason,
        ], JSON_UNESCAPED_UNICODE);

        $stmt = $conn->prepare("INSERT INTO notification (user_id, notification_type, message, notification_time, appointment_id) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("ssssi", $appointment['student_id'], $type, $message, $now, $appointment_id);
        $stmt->execute();
        $stmt->close();

       
        $promoted_id = promoteFirstFromWaitingList(
            $conn, $faculty_id,
            $appointment['appointment_date'], $appointment['appointment_time'], $appointment['appointment_end_time'],
            $appointment['doctor_name'], $now
        );
        $conn->commit();
    } else {
        $conn->rollback();   
    }
} catch (Throwable $e) {
    $conn->rollback();
    facultyFail("CANCEL_FAILED", "Failed to cancel appointment", null, $conn);
}

if (!$cancelled) {
    facultyFail("APPOINTMENT_NOT_CANCELLABLE", "Appointment cannot be cancelled", null, $conn);
}

facultyOk("APPOINTMENT_CANCELLED", [
    "appointment_id"          => $appointment_id,
    "promoted_appointment_id" => $promoted_id
], "Appointment cancelled successfully");
$conn->close();
