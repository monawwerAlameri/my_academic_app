<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/admin_auth.php';

requireAdmin($conn);

$facultyId = trim($_GET['faculty_id'] ?? '');

if ($facultyId === '') {
    // List mode: every faculty member with their rating summary
    $list = [];
    $result = $conn->query(
        "SELECT f.faculty_id, f.full_name,
                AVG(r.rating) AS avg_rating, COUNT(r.review_id) AS review_count
         FROM facultymember f
         LEFT JOIN review r ON r.faculty_id = f.faculty_id
         GROUP BY f.faculty_id, f.full_name
         ORDER BY f.full_name ASC"
    );
    while ($row = $result->fetch_assoc()) {
        $list[] = [
            'facultyId' => $row['faculty_id'],
            'fullName' => $row['full_name'],
            'averageRating' => $row['avg_rating'] !== null ? round((float) $row['avg_rating'], 1) : null,
            'reviewCount' => (int) $row['review_count']
        ];
    }

    echo json_encode(['success' => true, 'message' => 'Faculty ratings retrieved successfully', 'data' => $list]);
    $conn->close();
    exit;
}

// Detail mode: one faculty member's reviews
$stmt = $conn->prepare("SELECT faculty_id, full_name FROM facultymember WHERE faculty_id = ?");
$stmt->bind_param('s', $facultyId);
$stmt->execute();
$faculty = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$faculty) {
    echo json_encode(['success' => false, 'message' => 'Faculty member not found', 'data' => null]);
    $conn->close();
    exit;
}

$stmt = $conn->prepare(
    "SELECT r.review_id, r.rating, r.comment, r.review_date, r.is_anonymous, s.full_name AS student_name
     FROM review r
     JOIN student s ON r.student_id = s.student_id
     WHERE r.faculty_id = ?
     ORDER BY r.review_date DESC"
);
$stmt->bind_param('s', $facultyId);
$stmt->execute();
$result = $stmt->get_result();

$reviews = [];
$sum = 0;
$count = 0;
while ($row = $result->fetch_assoc()) {
    $sum += (int) $row['rating'];
    $count++;
    $reviews[] = [
        'reviewId' => $row['review_id'],
        'reviewerName' => ((int) $row['is_anonymous'] === 1) ? 'Anonymous' : $row['student_name'],
        'rating' => (int) $row['rating'],
        'comment' => $row['comment'],
        'reviewDate' => $row['review_date']
    ];
}
$stmt->close();

echo json_encode([
    'success' => true,
    'message' => 'Reviews retrieved successfully',
    'data' => [
        'facultyId' => $faculty['faculty_id'],
        'fullName' => $faculty['full_name'],
        'averageRating' => $count > 0 ? round($sum / $count, 1) : null,
        'reviewCount' => $count,
        'reviews' => $reviews
    ]
]);
$conn->close();