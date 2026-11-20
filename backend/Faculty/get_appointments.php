<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/faculty_auth.php';

$faculty_id = requireFacultyAuth($conn);

//   بانتظار تأكيد الحضور من الدكتور
$now = date("Y-m-d H:i:s");
$upd = $conn->prepare("UPDATE appointment SET status = 'Pending Confirmation' WHERE status = 'Booked' AND faculty_id = ? AND CONCAT(appointment_date, ' ', appointment_end_time) <= ?");
$upd->bind_param("ss", $faculty_id, $now);
$upd->execute();
$upd->close();

$stmt = $conn->prepare("
    SELECT a.appointment_id, a.student_id, s.full_name AS student_name, a.faculty_id,
           a.appointment_date, a.appointment_time, a.appointment_end_time,
           a.appointment_type, a.consultation_type, a.status, a.location
    FROM appointment a
    INNER JOIN student s ON a.student_id = s.student_id
    WHERE a.faculty_id = ?
    ORDER BY a.appointment_date ASC, a.appointment_time ASC
");
$stmt->bind_param("s", $faculty_id);
$stmt->execute();
$result = $stmt->get_result();
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}
$stmt->close();

facultyOk("APPOINTMENTS_RETRIEVED", $data, "Appointments retrieved successfully");
$conn->close();
