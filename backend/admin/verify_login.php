<?php


header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../config/database.php';

const MAX_OTP_ATTEMPTS = 5;

function clearPendingLogin(): void {
    unset($_SESSION['pending_admin_id'], $_SESSION['otp_hash'], $_SESSION['otp_expires'], $_SESSION['otp_attempts']);
}

$input = json_decode(file_get_contents('php://input'), true);
$code = trim($input['code'] ?? '');

if (!isset($_SESSION['pending_admin_id'], $_SESSION['otp_hash'], $_SESSION['otp_expires'], $_SESSION['otp_attempts'])) {
    echo json_encode(['success' => false, 'message' => 'No pending login. Please log in again.', 'data' => null]);
    exit;
}

if (time() > $_SESSION['otp_expires']) {
    clearPendingLogin();
    echo json_encode(['success' => false, 'message' => 'Verification code expired. Please log in again.', 'data' => null]);
    exit;
}

if ($_SESSION['otp_attempts'] >= MAX_OTP_ATTEMPTS) {
    clearPendingLogin();
    echo json_encode(['success' => false, 'message' => 'Too many attempts. Please log in again.', 'data' => null]);
    exit;
}

$_SESSION['otp_attempts']++;

if (!preg_match('/^[0-9]{6}$/', $code) || !hash_equals($_SESSION['otp_hash'], hash('sha256', $code))) {
    echo json_encode(['success' => false, 'message' => 'Invalid verification code', 'data' => null]);
    exit;
}

// Code is correct: complete the login
$adminId = $_SESSION['pending_admin_id'];
clearPendingLogin();
session_regenerate_id(true);
$_SESSION['admin_id'] = $adminId;
$_SESSION['role'] = 'admin';

$stmt = $conn->prepare("SELECT admin_id, full_name, email FROM admin WHERE admin_id = ?");
$stmt->bind_param('s', $adminId);
$stmt->execute();
$admin = $stmt->get_result()->fetch_assoc();
$stmt->close();

echo json_encode([
    'success' => true,
    'message' => 'Login successful',
    'data' => [
        'adminId' => $admin['admin_id'],
        'fullName' => $admin['full_name'],
        'email' => $admin['email']
    ]
]);