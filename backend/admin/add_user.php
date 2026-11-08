<?php
// backend/admin/add_user.php
// Admin adds a student or faculty member.
// POST JSON: { "role": "Student" | "Faculty", "userId": "...", "fullName": "...",
//              "email": "...", "password": "...", "phoneNumber": "...",
//              "officeLocation": "..." (Faculty only) }

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

$input = json_decode(file_get_contents('php://input'), true);

$role = trim($input['role'] ?? '');
$userId = trim($input['userId'] ?? '');
$fullName = trim($input['fullName'] ?? '');
$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';
$phoneNumber = trim($input['phoneNumber'] ?? '');
$officeLocation = trim($input['officeLocation'] ?? '');

if (!in_array($role, ['Student', 'Faculty'])) {
    echo json_encode(['success' => false, 'message' => 'Role must be Student or Faculty', 'data' => null]);
    exit;
}

if ($userId === '' || $fullName === '' || $email === '' || $password === '' || $phoneNumber === '') {
    echo json_encode(['success' => false, 'message' => 'All fields are required', 'data' => null]);
    exit;
}

if ($role === 'Faculty' && $officeLocation === '') {
    echo json_encode(['success' => false, 'message' => 'Office location is required for faculty', 'data' => null]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format', 'data' => null]);
    exit;
}

// full_name, user id, phone and office location columns are varchar(30)
if (strlen($fullName) > 30 || strlen($userId) > 30 || strlen($phoneNumber) > 30 || strlen($officeLocation) > 30) {
    echo json_encode(['success' => false, 'message' => 'Name, ID, phone and office location must be 30 characters or less', 'data' => null]);
    exit;
}

$table = ($role === 'Student') ? 'student' : 'facultymember';
$idColumn = ($role === 'Student') ? 'student_id' : 'faculty_id';

// Check duplicate id or email
$stmt = $conn->prepare("SELECT $idColumn FROM $table WHERE $idColumn = ? OR email = ?");
$stmt->bind_param('ss', $userId, $email);
$stmt->execute();
$stmt->store_result();
$exists = $stmt->num_rows > 0;
$stmt->close();

if ($exists) {
    echo json_encode(['success' => false, 'message' => 'A user with this ID or email already exists', 'data' => null]);
    exit;
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

if ($role === 'Student') {
    $stmt = $conn->prepare("INSERT INTO student (student_id, full_name, email, password, phone_number) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param('sssss', $userId, $fullName, $email, $hashedPassword, $phoneNumber);
} else {
    $stmt = $conn->prepare("INSERT INTO facultymember (faculty_id, full_name, email, password, phone_number, office_location) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->bind_param('ssssss', $userId, $fullName, $email, $hashedPassword, $phoneNumber, $officeLocation);
}

if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'message' => 'Failed to add user', 'data' => null]);
    exit;
}
$stmt->close();

echo json_encode([
    'success' => true,
    'message' => 'User added successfully',
    'data' => ['userId' => $userId, 'role' => $role, 'fullName' => $fullName]
]);