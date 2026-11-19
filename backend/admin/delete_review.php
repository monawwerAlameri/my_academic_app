<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/admin_auth.php';

requireAdmin($conn);

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$reviewId = (int) ($input['reviewId'] ?? 0);

if ($reviewId <= 0) {
    echo json_encode(['success' => false, 'message' => 'reviewId is required', 'data' => null]);
    $conn->close();
    exit;
}

$stmt = $conn->prepare("DELETE FROM review WHERE review_id = ?");
$stmt->bind_param('i', $reviewId);
$stmt->execute();
$deleted = $stmt->affected_rows > 0;
$stmt->close();

if (!$deleted) {
    echo json_encode(['success' => false, 'message' => 'Review not found', 'data' => null]);
    $conn->close();
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'Review deleted successfully',
    'data' => ['reviewId' => $reviewId]
]);
$conn->close();