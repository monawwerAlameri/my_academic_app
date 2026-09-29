<?php
// backend/admin/get_appointments.php
// Returns appointments for the Admin "Appointments Monitoring" screen (Figure 31).
// Optional query param: ?status=Pending (or Confirmed / Cancelled / Completed). No param = all.

header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../config/database.php';

if (!isset($_SESSION['admin_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized. Please log in as admin.',
        'data' => null
    ]);
    exit;
}

$statusFilter = trim($_GET['status'] ?? '');
$allowedStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];

$sql = "SELECT
            a.appointment_id, a.appointment_date, a.appointment_time,
            a.appointment_type, a.consultation_type, a.status, a.location,
            s.student_id, s.full_name AS student_name,
            f.faculty_id, f.full_name AS faculty_name
        FROM appointment a
        JOIN student s ON a.student_id = s.student_id
        JOIN facultymember f ON a.faculty_id = f.faculty_id";

if ($statusFilter !== '' && in_array($statusFilter, $allowedStatuses)) {
    $sql .= " WHERE a.status = ?";
}
$sql .= " ORDER BY a.appointment_date DESC, a.appointment_time DESC";

$stmt = $conn->prepare($sql);

if ($statusFilter !== '' && in_array($statusFilter, $allowedStatuses)) {
    $stmt->bind_param('s', $statusFilter);
}

$stmt->execute();
$result = $stmt->get_result();

$appointments = [];
while ($row = $result->fetch_assoc()) {
    $appointments[] = [
        'appointmentId' => $row['appointment_id'],
        'studentId' => $row['student_id'],
        'studentName' => $row['student_name'],
        'facultyId' => $row['faculty_id'],
        'facultyName' => $row['faculty_name'],
        'appointmentDate' => $row['appointment_date'],
        'appointmentTime' => $row['appointment_time'],
        'appointmentType' => $row['appointment_type'],
        'consultationType' => $row['consultation_type'],
        'status' => $row['status'],
        'location' => $row['location']
    ];
}
$stmt->close();

echo json_encode([
    'success' => true,
    'message' => 'Appointments retrieved successfully',
    'data' => $appointments
]);