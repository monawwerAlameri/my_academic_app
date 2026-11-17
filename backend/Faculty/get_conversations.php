<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/faculty_auth.php';

$faculty_id = requireFacultyAuth($conn);

$search      = $_GET["search"] ?? "";
$searchValue = "%" . $search . "%";

// Riyadh time (date_default_timezone_set is inside config/database.php)
$now = date("Y-m-d H:i:s");

// is_now = this student has an Online appointment with this doctor running right now
// Conversations with a running appointment come first, then the newest message
$stmt = $conn->prepare("
    SELECT
        s.student_id,
        s.full_name AS student_name,
        latest.message_text AS last_message,
        latest.sent_at AS last_message_time,
        latest.sender_type AS last_sender_type,
        (
            SELECT COUNT(*) FROM message unread
            WHERE unread.student_id = latest_ids.student_id
            AND unread.faculty_id = latest_ids.faculty_id
            AND unread.sender_type = 'Student'
            AND unread.is_read = 0
        ) AS unread_count,
        (
            SELECT COUNT(*) FROM appointment running
            WHERE running.student_id = latest_ids.student_id
            AND running.faculty_id = latest_ids.faculty_id
            AND running.appointment_type = 'Online'
            AND running.status = 'Booked'
            AND TIMESTAMP(running.appointment_date, running.appointment_time) <= ?
            AND TIMESTAMP(running.appointment_date, running.appointment_end_time) > ?
        ) AS is_now
    FROM (
        SELECT student_id, faculty_id, MAX(message_id) AS latest_message_id
        FROM message
        WHERE faculty_id = ?
        GROUP BY student_id, faculty_id
    ) AS latest_ids
    INNER JOIN message latest ON latest.message_id = latest_ids.latest_message_id
    INNER JOIN student s ON s.student_id = latest_ids.student_id
    WHERE s.full_name LIKE ? OR s.student_id LIKE ?
    ORDER BY is_now DESC, latest.sent_at DESC
");
$stmt->bind_param("sssss", $now, $now, $faculty_id, $searchValue, $searchValue);
$stmt->execute();
$result = $stmt->get_result();
$conversations = [];
while ($row = $result->fetch_assoc()) {
    $row['unread_count'] = (int)$row['unread_count'];
    $row['is_now']       = ((int)$row['is_now'] > 0);
    $conversations[] = $row;
}
$stmt->close();

facultyOk("CONVERSATIONS_RETRIEVED", $conversations, "Conversations retrieved successfully");
$conn->close();