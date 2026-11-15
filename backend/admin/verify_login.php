<?php

header('Content-Type: application/json');

// Any uncaught error is returned as JSON (not an HTML page), so the app can read it
set_exception_handler(function ($e) {
    error_log('Admin error: ' . $e->getMessage()); // see C:\xampp\apache\logs\error.log
    echo json_encode(['success' => false, 'message' => 'Server error', 'data' => null]);
});
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/database.php';

const MAX_OTP_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 600; // 10 minutes

function clearPendingLogin(): void {
    unset($_SESSION['pending_admin_id'], $_SESSION['otp_hash'], $_SESSION['otp_expires'], $_SESSION['otp_attempts']);
}

// Still locked from too many wrong codes?
if (isset($_SESSION['locked_until'])) {
    $remaining = $_SESSION['locked_until'] - time();
    if ($remaining > 0) {
        echo json_encode(['success' => false, 'message' => 'Too many attempts. Try again later.', 'data' => ['retryAfterSeconds' => $remaining]]);
        exit;
    }
    unset($_SESSION['locked_until']); // 10 minutes passed, allowed again
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

$_SESSION['otp_attempts']++;

if (!preg_match('/^[0-9]{6}$/', $code) || !hash_equals($_SESSION['otp_hash'], hash('sha256', $code))) {
    if ($_SESSION['otp_attempts'] >= MAX_OTP_ATTEMPTS) {
        clearPendingLogin();
        $_SESSION['locked_until'] = time() + LOCKOUT_SECONDS;
        echo json_encode(['success' => false, 'message' => 'Too many attempts. Try again later.', 'data' => ['retryAfterSeconds' => LOCKOUT_SECONDS]]);
        exit;
    }
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