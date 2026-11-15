<?php
// backend/admin/get_users.php
// Returns all students and faculty members (with account status) for the User Management screen.
// Requires the account_status column (run add_account_status.sql first).

header('Content-Type: application/json');

// Any uncaught error is returned as JSON (not an HTML page), so the app can read it
set_exception_handler(function ($e) {
    error_log('Admin error: ' . $e->getMessage()); // see C:\xampp\apache\logs\error.log
    echo json_encode(['success' => false, 'message' => 'Server error', 'data' => null]);
});
require_once __DIR__ . '/../config/session.php';
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