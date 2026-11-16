<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/admin_auth.php';

$input    = json_decode(file_get_contents('php://input'), true) ?? [];
$admin_id = trim($input['admin_id'] ?? '');
$code     = trim($input['code'] ?? '');

if ($admin_id === '' || $code === '') {
    echo json_encode(['success' => false, 'message' => 'Admin ID and code are required', 'data' => null]);
    exit;
}

$stmt = $conn->prepare("SELECT admin_id, full_name, email FROM admin WHERE admin_id = ?");
$stmt->bind_param('s', $admin_id);
$stmt->execute();
$admin = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$admin) {
    echo json_encode(['success' => false, 'message' => 'Invalid verification code', 'data' => null]);
    $conn->close();
    exit;
}

$email = strtolower($admin['email']);

$stmt = $conn->prepare("SELECT verification_id, expires_at, is_used FROM verificationcode WHERE email = ? AND code = ? ORDER BY verification_id DESC LIMIT 1");
$stmt->bind_param('ss', $email, $code);
$stmt->execute();
$row = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$row) {
    echo json_encode(['success' => false, 'message' => 'Invalid verification code', 'data' => null]);
    $conn->close();
    exit;
}
if ($row['is_used'] == 1) {
    echo json_encode(['success' => false, 'message' => 'Verification code already used', 'data' => null]);
    $conn->close();
    exit;
}
if (strtotime($row['expires_at']) < time()) {
    echo json_encode(['success' => false, 'message' => 'Verification code expired. Please log in again.', 'data' => null]);
    $conn->close();
    exit;
}

$stmt = $conn->prepare("UPDATE verificationcode SET is_used = 1 WHERE verification_id = ?");
$stmt->bind_param('i', $row['verification_id']);
$stmt->execute();
$stmt->close();

echo json_encode([
    'success' => true,
    'message' => 'Login successful',
    'data' => [
        'adminId'  => $admin['admin_id'],
        'fullName' => $admin['full_name'],
        'email'    => $admin['email']
    ]
]);
$conn->close();