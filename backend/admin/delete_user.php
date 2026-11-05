<?php

header('Content-Type: application/json');
session_start();
require_once __DIR__ . '/../config/database.php';

if (!isset($_SESSION['admin_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized. Please log in as admin.',
        'data' => null
    ]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

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
    if ($role === 'Student') {
        // Save the email first, so the ban survives the deletion
        $stmt = $conn->prepare("SELECT email FROM student WHERE student_id = ?");
        $stmt->bind_param('s', $userId);
        $stmt->execute();
        $student = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if ($student) {
            $stmt = $conn->prepare("INSERT IGNORE INTO banned_emails (email, role) VALUES (?, 'Student')");
            $stmt->bind_param('s', $student['email']);
            $stmt->execute();
            $stmt->close();
        }

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
        echo json_encode([
            'success' => false,
            'message' => 'User not found',
            'data' => null
        ]);
        exit;
    }

    $conn->commit();
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode([
        'success' => false,
        'message' => 'Failed to delete user',
        'data' => null
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'User deleted successfully',
    'data' => ['userId' => $userId, 'role' => $role]
]);