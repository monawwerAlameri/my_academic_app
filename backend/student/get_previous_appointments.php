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

$stmt = $conn->prepare("
    SELECT
        appointment.appointment_id,
        appointment.faculty_id,
        appointment.appointment_date,
        appointment.appointment_time,
        appointment.appointment_end_time,
        appointment.appointment_type,
        appointment.consultation_type,
        appointment.status,
        appointment.location,
        facultymember.full_name AS doctor_name
    FROM appointment
    INNER JOIN facultymember ON appointment.faculty_id = facultymember.faculty_id
    WHERE appointment.student_id = ?
    AND appointment.status IN ('Completed', 'Cancelled', 'Pending Confirmation', 'Absent')
    ORDER BY appointment.appointment_date DESC, appointment.appointment_time DESC
");
$stmt->bind_param("s", $student_id);
$stmt->execute();
$result = $stmt->get_result();

$appointments = [];
while ($row = $result->fetch_assoc()) {
    $appointments[] = $row;
}

$stmt->close();

echo json_encode([
    "success" => true,
  "code" => "PREVIOUS_APPOINTMENTS_FETCHED",
    "data" => $appointments
]);

$conn->close();