<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/admin_auth.php';

requireAdmin($conn);

$now = date('Y-m-d H:i:s'); 

$studentCount = (int) $conn->query("SELECT COUNT(*) AS c FROM student")->fetch_assoc()['c'];
$facultyCount = (int) $conn->query("SELECT COUNT(*) AS c FROM facultymember")->fetch_assoc()['c'];

$stmt = $conn->prepare("SELECT COUNT(*) AS c FROM appointment WHERE status = 'Booked' AND TIMESTAMP(appointment_date, appointment_time) > ?");
$stmt->bind_param('s', $now);
$stmt->execute();
$pendingCount = (int) $stmt->get_result()->fetch_assoc()['c'];
$stmt->close();

$needsAttention = [];
$stmt = $conn->prepare(
    "SELECT a.appointment_id, a.appointment_date, a.appointment_time,
            s.full_name AS student_name, f.full_name AS faculty_name
     FROM appointment a
     JOIN student s ON a.student_id = s.student_id
     JOIN facultymember f ON a.faculty_id = f.faculty_id
     WHERE a.status = 'Booked' AND TIMESTAMP(a.appointment_date, a.appointment_time) > ?
     ORDER BY a.appointment_date ASC, a.appointment_time ASC
     LIMIT 5"
);
$stmt->bind_param('s', $now);
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $needsAttention[] = [
        'appointmentId' => $row['appointment_id'],
        'studentName' => $row['student_name'],
        'facultyName' => $row['faculty_name'],
        'appointmentDate' => $row['appointment_date'],
        'appointmentTime' => $row['appointment_time']
    ];
}
$stmt->close();

echo json_encode([
    'success' => true,
    'message' => 'Dashboard data retrieved successfully',
    'data' => [
        'totalUsers' => $studentCount + $facultyCount,
        'students' => $studentCount,
        'faculty' => $facultyCount,
        'pendingAppointments' => $pendingCount,
        'needsAttention' => $needsAttention
    ]
]);
$conn->close();