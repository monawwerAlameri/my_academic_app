<?php
// backend/admin/get_users.php
// Returns all students and faculty members, for the User Management screen (Figure 30).

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

$users = [];

// Students
$result = $conn->query("SELECT student_id, full_name, email, phone_number FROM student");
while ($row = $result->fetch_assoc()) {
    $users[] = [
        'userId' => $row['student_id'],
        'fullName' => $row['full_name'],
        'email' => $row['email'],
        'phoneNumber' => $row['phone_number'],
        'role' => 'Student'
    ];
}

// Faculty members
$result = $conn->query("SELECT faculty_id, full_name, email, phone_number FROM facultymember");
while ($row = $result->fetch_assoc()) {
    $users[] = [
        'userId' => $row['faculty_id'],
        'fullName' => $row['full_name'],
        'email' => $row['email'],
        'phoneNumber' => $row['phone_number'],
        'role' => 'Faculty'
    ];
}

echo json_encode([
    'success' => true,
    'message' => 'Users retrieved successfully',
    'data' => $users
]);