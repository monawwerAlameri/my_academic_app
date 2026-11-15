<?php

header('Content-Type: application/json');

// Any uncaught error is returned as JSON (not an HTML page), so the app can read it
set_exception_handler(function ($e) {
    error_log('Admin error: ' . $e->getMessage()); // see C:\xampp\apache\logs\error.log
    echo json_encode(['success' => false, 'message' => 'Server error', 'data' => null]);
});
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/database.php';

if (!isset($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in as admin.', 'data' => null]);
    exit;
}

$now = date('Y-m-d H:i:s'); // PHP time zone (Asia/Riyadh, set in database.php), not the MySQL server's

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