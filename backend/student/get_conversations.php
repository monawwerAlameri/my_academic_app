<?php
require_once __DIR__ . '/../config/database.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$student_id = $data['student_id'] ?? '';

if (empty($student_id)) {
    echo json_encode(["success" => false, "code" => "STUDENT_ID_REQUIRED"]);
    exit;
}

// Every doctor the student has an Online appointment with that already started (this is what opens a chat)
// The chat with a running Online appointment right now (is_now) comes first, then the newest activity
$now = date("Y-m-d H:i:s");

$stmt = $conn->prepare("
    SELECT
        facultymember.faculty_id,
        facultymember.full_name AS doctor_name,
        last_message.message_text AS last_message,
        last_message.attachment_type AS last_attachment_type,
        last_message.sent_at AS last_message_time,
        (
            SELECT COUNT(*)
            FROM message AS unread
            WHERE unread.student_id = ?
            AND unread.faculty_id = facultymember.faculty_id
            AND unread.sender_type = 'faculty'
            AND unread.is_read = 0
        ) AS unread_count,
        (
            SELECT COUNT(*)
            FROM appointment AS running
            WHERE running.student_id = ?
            AND running.faculty_id = facultymember.faculty_id
            AND running.appointment_type = 'Online'
            AND running.status = 'Booked'
            AND TIMESTAMP(running.appointment_date, running.appointment_time) <= ?
            AND TIMESTAMP(running.appointment_date, running.appointment_end_time) > ?
        ) AS is_now
    FROM (
        SELECT faculty_id, MAX(TIMESTAMP(appointment_date, appointment_time)) AS last_start
        FROM appointment
        WHERE student_id = ?
        AND appointment_type = 'Online'
        AND status IN ('Booked', 'Completed')
        AND TIMESTAMP(appointment_date, appointment_time) <= ?
        GROUP BY faculty_id
    ) AS chats
    INNER JOIN facultymember ON facultymember.faculty_id = chats.faculty_id
    LEFT JOIN (
        SELECT faculty_id, MAX(message_id) AS last_id
        FROM message
        WHERE student_id = ?
        GROUP BY faculty_id
    ) AS last_ids ON last_ids.faculty_id = chats.faculty_id
    LEFT JOIN message AS last_message ON last_message.message_id = last_ids.last_id
    ORDER BY is_now DESC, COALESCE(last_message.sent_at, chats.last_start) DESC, facultymember.faculty_id ASC
");
$stmt->bind_param("sssssss", $student_id, $student_id, $now, $now, $student_id, $now, $student_id);
$stmt->execute();
$result = $stmt->get_result();

$conversations = [];
while ($row = $result->fetch_assoc()) {
    $row['unread_count'] = (int)$row['unread_count'];
    $row['is_now']       = ((int)$row['is_now'] > 0);
    $conversations[] = $row;
}

$stmt->close();

echo json_encode([
    "success" => true,
    "code" => "CONVERSATIONS_FETCHED",
    "data" => $conversations
]);

$conn->close();