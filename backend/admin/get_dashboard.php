<?php


header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../config/database.php';

if (!isset($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in as admin.', 'data' => null]);
    exit;
}

$studentCount = $conn->query("SELECT COUNT(*) AS c FROM student")->fetch_assoc()['c'];
$facultyCount = $conn->query("SELECT COUNT(*) AS c FROM facultymember")->fetch_assoc()['c'];
$pendingCount = $conn->query("SELECT COUNT(*) AS c FROM appointment WHERE status = 'Pending'")->fetch_assoc()['c'];

$needsAttention = [];
$result = $conn->query(
    "SELECT a.appointment_id, a.appointment_date, a.appointment_time,
            s.full_name AS student_name, f.full_name AS faculty_name
     FROM appointment a
     JOIN student s ON a.student_id = s.student_id
     JOIN facultymember f ON a.faculty_id = f.faculty_id
     WHERE a.status = 'Pending'
     ORDER BY a.appointment_date ASC, a.appointment_time ASC
     LIMIT 5"
);
while ($row = $result->fetch_assoc()) {
    $needsAttention[] = [
        'appointmentId' => $row['appointment_id'],
        'studentName' => $row['student_name'],
        'facultyName' => $row['faculty_name'],
        'appointmentDate' => $row['appointment_date'],
        'appointmentTime' => $row['appointment_time']
    ];
}

echo json_encode([
    'success' => true,
    'message' => 'Dashboard data retrieved successfully',
    'data' => [
        'totalUsers' => (int) $studentCount + (int) $facultyCount,
        'students' => (int) $studentCount,
        'faculty' => (int) $facultyCount,
        'pendingAppointments' => (int) $pendingCount,
        'needsAttention' => $needsAttention
    ]
]);