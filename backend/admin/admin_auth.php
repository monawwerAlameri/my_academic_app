<?php
// admin/admin_auth.php
// 1) Any uncaught error in an admin file is returned as JSON with "message" (the shape the admin app reads).
//    This file must be required AFTER config/database.php, so this handler replaces the one in database.php.
// 2) requireAdmin(): the request must carry an admin_id that exists in the admin table.

set_exception_handler(function ($e) {
    error_log('Admin error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    if (!headers_sent()) {
        header('Content-Type: application/json');
    }
    echo json_encode(['success' => false, 'message' => 'Server error', 'data' => null]);
    exit;
});

function requireAdmin($conn) {
    $input    = json_decode(file_get_contents('php://input'), true) ?? [];
    $admin_id = trim($_GET['admin_id'] ?? ($input['admin_id'] ?? ''));

    if ($admin_id === '') {
        echo json_encode(['success' => false, 'message' => 'Admin ID is required', 'data' => null]);
        $conn->close();
        exit;
    }

    $stmt = $conn->prepare("SELECT admin_id FROM admin WHERE admin_id = ?");
    $stmt->bind_param('s', $admin_id);
    $stmt->execute();
    $stmt->store_result();
    $found = $stmt->num_rows > 0;
    $stmt->close();

    if (!$found) {
        echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in as admin.', 'data' => null]);
        $conn->close();
        exit;
    }

    return $admin_id;
}