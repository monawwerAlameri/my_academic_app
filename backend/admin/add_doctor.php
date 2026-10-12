<?php


header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../config/database.php';

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


$result = $conn->query("SELECT faculty_id FROM facultymember WHERE faculty_id REGEXP '^F[0-9]+$' ORDER BY CAST(SUBSTRING(faculty_id, 2) AS UNSIGNED) DESC LIMIT 1");
$nextNumber = 1;
if ($row = $result->fetch_assoc()) {
    $nextNumber = (int) substr($row['faculty_id'], 1) + 1;
}
$facultyId = 'F' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);


$tempPassword = substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'), 0, 10);
$hashedPassword = password_hash($tempPassword, PASSWORD_DEFAULT);

$stmt = $conn->prepare(
    "INSERT INTO facultymember (faculty_id, full_name, department, email, password, phone_number, office_location)
     VALUES (?, ?, ?, ?, ?, NULL, NULL)"
);
$stmt->bind_param('sssss', $facultyId, $fullName, $department, $email, $hashedPassword);

if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'message' => 'Failed to add doctor', 'data' => null]);
    exit;
}
$stmt->close();

echo json_encode([
    'success' => true,
    'message' => 'Doctor added successfully',
    'data' => [
        'facultyId' => $facultyId,
        'fullName' => $fullName,
        'department' => $department,
        'email' => $email,
        'temporaryPassword' => $tempPassword // show this to the admin once, to share with the doctor
    ]
]);