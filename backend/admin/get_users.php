<?php
// Returns all students and faculty members (with account status) for the User Management screen.
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/admin_auth.php';

requireAdmin($conn);

$users = [];

// Students
$result = $conn->query("SELECT student_id, full_name, email, phone_number, account_status FROM student");
while ($row = $result->fetch_assoc()) {
    $users[] = [
        'userId' => $row['student_id'],
        'fullName' => $row['full_name'],
        'email' => $row['email'],
        'phoneNumber' => $row['phone_number'],
        'role' => 'Student',
        'accountStatus' => $row['account_status']
    ];
}

// Faculty members
$result = $conn->query("SELECT faculty_id, full_name, email, phone_number, office_location, account_status FROM facultymember");
while ($row = $result->fetch_assoc()) {
    $users[] = [
        'userId' => $row['faculty_id'],
        'fullName' => $row['full_name'],
        'email' => $row['email'],
        'phoneNumber' => $row['phone_number'],
        'officeLocation' => $row['office_location'],
        'role' => 'Faculty',
        'accountStatus' => $row['account_status']
    ];
}

echo json_encode([
    'success' => true,
    'message' => 'Users retrieved successfully',
    'data' => $users
]);
$conn->close();