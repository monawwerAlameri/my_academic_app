<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/admin_auth.php';
require_once __DIR__ . '/waiting_list_helper.php';

requireAdmin($conn);

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$userId = trim($input['userId'] ?? '');
$role = trim($input['role'] ?? '');

if ($userId === '' || !in_array($role, ['Student', 'Faculty'])) {
    echo json_encode([
        'success' => false,
        'message' => 'userId and a valid role (Student or Faculty) are required',
        'data' => null
    ]);
    exit;
}

$conn->begin_transaction();

try {
    // Save the email first, so the ban survives the deletion (students and faculty)
    $emailSql = ($role === 'Student')
        ? "SELECT email FROM student WHERE student_id = ?"
        : "SELECT email FROM facultymember WHERE faculty_id = ?";
    $stmt = $conn->prepare($emailSql);
    $stmt->bind_param('s', $userId);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if ($user) {
        $bannedEmail = strtolower($user['email']);
        $stmt = $conn->prepare("INSERT IGNORE INTO banned_emails (email, role) VALUES (?, ?)");
        $stmt->bind_param('ss', $bannedEmail, $role);
        $stmt->execute();
        $stmt->close();
    }

    if ($role === 'Student') {
        // Leave every waiting list first so the other students' positions stay in order
        removeStudentFromWaitingLists($conn, $userId);
        $stmt = $conn->prepare("DELETE FROM student WHERE student_id = ?");
    } else {
        $stmt = $conn->prepare("DELETE FROM facultymember WHERE faculty_id = ?");
    }

    $stmt->bind_param('s', $userId);
    $stmt->execute();
    $deleted = $stmt->affected_rows > 0;
    $stmt->close();

    if (!$deleted) {
        $conn->rollback();
        echo json_encode(['success' => false, 'message' => 'User not found', 'data' => null]);
        $conn->close();
        exit;
    }

    $conn->commit();
} catch (Throwable $e) {
    $conn->rollback();
    error_log('delete_user error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to delete user', 'data' => null]);
    $conn->close();
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'User deleted successfully',
    'data' => ['userId' => $userId, 'role' => $role]
]);
$conn->close();