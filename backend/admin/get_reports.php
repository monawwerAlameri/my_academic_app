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

$total = (int) $conn->query("SELECT COUNT(*) AS c FROM appointment")->fetch_assoc()['c'];

function groupWithPercentage(mysqli $conn, string $column, int $total): array {
    $out = [];
    $result = $conn->query("SELECT $column AS label, COUNT(*) AS c FROM appointment GROUP BY $column");
    while ($row = $result->fetch_assoc()) {
        $count = (int) $row['c'];
        $out[] = [
            'label' => $row['label'],
            'count' => $count,
            'percentage' => $total > 0 ? round(($count / $total) * 100) : 0
        ];
    }
    return $out;
}

$byStatus = $total > 0 ? groupWithPercentage($conn, 'status', $total) : [];
$byType = $total > 0 ? groupWithPercentage($conn, 'appointment_type', $total) : [];
$byConsultation = $total > 0 ? groupWithPercentage($conn, 'consultation_type', $total) : [];

$topRated = [];
$result = $conn->query(
    "SELECT f.faculty_id, f.full_name, AVG(r.rating) AS avg_rating, COUNT(r.review_id) AS review_count
     FROM review r
     JOIN facultymember f ON r.faculty_id = f.faculty_id
     GROUP BY f.faculty_id, f.full_name
     ORDER BY avg_rating DESC
     LIMIT 3"
);
while ($row = $result->fetch_assoc()) {
    $topRated[] = [
        'facultyId' => $row['faculty_id'],
        'fullName' => $row['full_name'],
        'averageRating' => round((float) $row['avg_rating'], 1),
        'reviewCount' => (int) $row['review_count']
    ];
}

echo json_encode([
    'success' => true,
    'message' => 'Reports data retrieved successfully',
    'data' => [
        'totalAppointments' => $total,
        'appointmentsByStatus' => $byStatus,
        'onlineVsInPerson' => $byType,
        'consultationTypes' => $byConsultation,
        'topRatedDoctors' => $topRated
    ]
]);