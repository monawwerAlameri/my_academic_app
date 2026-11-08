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
$accountStatus = trim($input['accountStatus'] ?? '');

if ($userId === '' || !in_array($role, ['Student', 'Faculty']) || !in_array($accountStatus, ['Active', 'Suspended'])) {
    echo json_encode([
        'success' => false,
        'message' => 'userId, role (Student/Faculty) and accountStatus (Active/Suspended) are required',
        'data' => null
    ]);
    exit;
}

if ($role === 'Student') {
    $stmt = $conn->prepare("UPDATE student SET account_status = ? WHERE student_id = ?");
} else {
    $stmt = $conn->prepare("UPDATE facultymember SET account_status = ? WHERE faculty_id = ?");
}

$stmt->bind_param('ss', $accountStatus, $userId);
$stmt->execute();
$affected = $stmt->affected_rows;
$stmt->close();


if ($affected === 0) {
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
        echo json_encode(['success' => false, 'message' => 'User not found', 'data' => null]);
        exit;
    }
}

echo json_encode([
    'success' => true,
    'message' => 'User status updated successfully',
    'data' => ['userId' => $userId, 'role' => $role, 'accountStatus' => $accountStatus]
]);