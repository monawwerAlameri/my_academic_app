<?php


header('Content-Type: application/json');

// Any uncaught error is returned as JSON (not an HTML page), so the app can read it
set_exception_handler(function ($e) {
    error_log('Admin error: ' . $e->getMessage()); // see C:\xampp\apache\logs\error.log
    echo json_encode(['success' => false, 'message' => 'Server error', 'data' => null]);
});
require_once __DIR__ . '/../config/session.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/waiting_list_helper.php';

if (!isset($_SESSION['admin_id'])) {
    echo json_encode(['success' => false, 'message' => 'Unauthorized. Please log in as admin.', 'data' => null]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$userId = trim($input['userId'] ?? '');
$role = trim($input['role'] ?? '');
$accountStatus = trim($input['accountStatus'] ?? '');

if ($userId === '' || !in_array($role, ['Student', 'Faculty']) || !in_array($accountStatus, ['Active', 'Suspended'])) {
    echo json_encode([
        'success' => false,
        'message' => 'userId, role (Student/Faculty) and accountStatus (Active/Suspended) are required',
        'data' => null
    ]);
    exit;
}

$conn->begin_transaction();

try {
    if ($role === 'Student') {
        $stmt = $conn->prepare("UPDATE student SET account_status = ? WHERE student_id = ?");
    } else {
        $stmt = $conn->prepare("UPDATE facultymember SET account_status = ? WHERE faculty_id = ?");
    }
    $stmt->bind_param('ss', $accountStatus, $userId);
    $stmt->execute();
    $changed = $stmt->affected_rows > 0;
    $stmt->close();

    // 0 affected rows = user not found OR already in this status
    if (!$changed) {
        $checkSql = ($role === 'Student')
            ? "SELECT student_id FROM student WHERE student_id = ?"
            : "SELECT faculty_id FROM facultymember WHERE faculty_id = ?";
        $stmt = $conn->prepare($checkSql);
        $stmt->bind_param('s', $userId);
        $stmt->execute();
        $stmt->store_result();
        $found = $stmt->num_rows > 0;
        $stmt->close();

        if (!$found) {
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'User not found', 'data' => null]);
            exit;
        }
    }

    // A student has just been suspended: cancel bookings and leave the waiting lists
    if ($changed && $role === 'Student' && $accountStatus === 'Suspended') {
        $stmt = $conn->prepare("UPDATE appointment SET status = 'Cancelled' WHERE student_id = ? AND status NOT IN ('Cancelled', 'Completed')");
        $stmt->bind_param('s', $userId);
        $stmt->execute();
        $stmt->close();

        removeStudentFromWaitingLists($conn, $userId);
    }

    $conn->commit();
} catch (Throwable $e) {
    $conn->rollback();
    error_log('update_user_status error: ' . $e->getMessage()); // see C:\xampp\apache\logs\error.log
    echo json_encode(['success' => false, 'message' => 'Failed to update user status', 'data' => null]);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'User status updated successfully',
    'data' => ['userId' => $userId, 'role' => $role, 'accountStatus' => $accountStatus]
]);