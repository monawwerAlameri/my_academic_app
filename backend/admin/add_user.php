<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/admin_auth.php';

requireAdmin($conn);

$input = json_decode(file_get_contents('php://input'), true) ?? [];

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

// Column sizes: id and phone 30, full name and email 100, office location 255
if (mb_strlen($fullName) > 100 || strlen($userId) > 30 || strlen($phoneNumber) > 30 || strlen($email) > 100 || mb_strlen($officeLocation) > 255) {
    echo json_encode(['success' => false, 'message' => 'One of the fields is too long', 'data' => null]);
    exit;
}

// The ID format must match what the login screen expects
if ($role === 'Student') {
    if (!preg_match('/^[0-9]+$/', $userId)) {
        echo json_encode(['success' => false, 'message' => 'Student ID must contain digits only', 'data' => null]);
        exit;
    }
    if (strtolower($email) !== strtolower('s' . $userId . '@uoh.edu.sa')) {
        echo json_encode(['success' => false, 'message' => 'Student email must be s<ID>@uoh.edu.sa', 'data' => null]);
        exit;
    }
} else {
    $userId = strtoupper($userId);
    if (!preg_match('/^F[0-9]+$/', $userId)) {
        echo json_encode(['success' => false, 'message' => 'Faculty ID must look like F001', 'data' => null]);
        exit;
    }
}
$email = strtolower($email);

// An e-mail that belonged to a deleted account cannot be used again
$stmt = $conn->prepare("SELECT email FROM banned_emails WHERE email = ?");
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->store_result();
$banned = $stmt->num_rows > 0;
$stmt->close();
if ($banned) {
    echo json_encode(['success' => false, 'message' => 'This email belongs to a deleted account', 'data' => null]);
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
$conn->close();