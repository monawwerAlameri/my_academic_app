<?php


header('Content-Type: application/json');

// Any uncaught error is returned as JSON (not an HTML page), so the app can read it
set_exception_handler(function ($e) {
    error_log('Admin error: ' . $e->getMessage()); // see C:\xampp\apache\logs\error.log
    echo json_encode(['success' => false, 'message' => 'Server error', 'data' => null]);
});
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/admin_mail.php';

if (!isset($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in as admin.', 'data' => null]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$fullName = trim($input['fullName'] ?? '');
$email = trim($input['email'] ?? '');
$department = trim($input['department'] ?? '');

if ($fullName === '' || $email === '' || $department === '') {
    echo json_encode(['success' => false, 'message' => 'Full name, email and department are required', 'data' => null]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format', 'data' => null]);
    exit;
}

if (strlen($fullName) > 100 || strlen($email) > 100 || strlen($department) > 100) {
    echo json_encode(['success' => false, 'message' => 'One of the fields is too long', 'data' => null]);
    exit;
}

// Email must be unique
$stmt = $conn->prepare("SELECT faculty_id FROM facultymember WHERE email = ?");
$stmt->bind_param('s', $email);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows > 0) {
    $stmt->close();
    echo json_encode(['success' => false, 'message' => 'A faculty member with this email already exists', 'data' => null]);
    exit;
}
$stmt->close();

// Generate the next faculty_id in the form F001, F002, ...
$result = $conn->query("SELECT faculty_id FROM facultymember WHERE faculty_id REGEXP '^F[0-9]+$' ORDER BY CAST(SUBSTRING(faculty_id, 2) AS UNSIGNED) DESC LIMIT 1");
$nextNumber = 1;
if ($row = $result->fetch_assoc()) {
    $nextNumber = (int) substr($row['faculty_id'], 1) + 1;
}
$facultyId = 'F' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

// Temporary password: the doctor should change it after the first login
$tempPassword = substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'), 0, 10);
$hashedPassword = password_hash($tempPassword, PASSWORD_DEFAULT);

$stmt = $conn->prepare(
    "INSERT INTO facultymember (faculty_id, full_name, department, email, password, phone_number, office_location)
     VALUES (?, ?, ?, ?, ?, NULL, NULL)"
);
$stmt->bind_param('sssss', $facultyId, $fullName, $department, $email, $hashedPassword);
$stmt->execute();
$stmt->close();

$emailSent = sendAdminMail(
    $email,
    $fullName,
    'Your Academic Booking account',
    "Hello $fullName,\n\nYour doctor account has been created.\nDoctor ID: $facultyId\nTemporary password: $tempPassword\n\nPlease sign in and change your password."
);

$data = [
    'facultyId' => $facultyId,
    'fullName' => $fullName,
    'department' => $department,
    'email' => $email,
    'emailSent' => $emailSent
];
if (!$emailSent) {
    $data['temporaryPassword'] = $tempPassword; // only when the e-mail could not be sent
}

echo json_encode(['success' => true, 'message' => 'Doctor added successfully', 'data' => $data]);