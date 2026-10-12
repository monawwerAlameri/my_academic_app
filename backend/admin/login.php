<?php

header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../config/database.php';

$input = json_decode(file_get_contents('php://input'), true);

$email = trim($input['email'] ?? '');
$password = $input['password'] ?? '';

if ($email === '' || $password === '') {
    echo json_encode([
        'success' => false,
        'message' => 'Email and password are required',
        'data' => null
    ]);
    exit;
}

$stmt = $conn->prepare("SELECT admin_id, full_name, email, password FROM admin WHERE email = ?");
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();
$admin = $result->fetch_assoc();
$stmt->close();

if (!$admin || !password_verify($password, $admin['password'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid email or password',
        'data' => null
    ]);
    exit;
}


$_SESSION['admin_id'] = $admin['admin_id'];
$_SESSION['role'] = 'admin';

echo json_encode([
    'success' => true,
    'message' => 'Login successful',
    'data' => [
        'adminId' => $admin['admin_id'],
        'fullName' => $admin['full_name'],
        'email' => $admin['email']
    ]
]);