<?php
// الدكتور يأكد حضور الطالب بعد انتهاء الموعد (حضوري أو أونلاين)
// Pending Confirmation -> Completed (تم الحضور) أو Absent (لم يتم الحضور)
header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/faculty_auth.php';

$faculty_id = requireFacultyAuth($conn);

$input          = json_decode(file_get_contents("php://input"), true) ?? [];
$appointment_id = (int)($input["appointment_id"] ?? 0);
$attended       = $input["attended"] ?? null;

if ($appointment_id <= 0 || !is_bool($attended)) {
    facultyFail("ALL_FIELDS_REQUIRED", "appointment_id and attended (true/false) are required", null, $conn);
}

$now = date("Y-m-d H:i:s");
$stmt = $conn->prepare("UPDATE appointment SET status = 'Pending Confirmation' WHERE status = 'Booked' AND faculty_id = ? AND CONCAT(appointment_date, ' ', appointment_end_time) <= ?");
$stmt->bind_param("ss", $faculty_id, $now);
$stmt->execute();
$stmt->close();

$new_status = $attended ? 'Completed' : 'Absent';

$stmt = $conn->prepare("UPDATE appointment SET status = ? WHERE appointment_id = ? AND faculty_id = ? AND status = 'Pending Confirmation'");
$stmt->bind_param("sis", $new_status, $appointment_id, $faculty_id);
$stmt->execute();
$updated = $stmt->affected_rows > 0;
$stmt->close();

if (!$updated) {
    facultyFail("ATTENDANCE_NOT_ALLOWED", "Attendance can only be confirmed after the appointment ends", null, $conn);
}

facultyOk("ATTENDANCE_CONFIRMED", [
    "appointment_id" => $appointment_id,
    "status"         => $new_status
], "Attendance saved successfully");
$conn->close();