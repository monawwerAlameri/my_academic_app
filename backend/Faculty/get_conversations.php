<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/faculty_auth.php';

$faculty_id = requireFacultyAuth($conn);

$search      = $_GET["search"] ?? "";
$searchValue = "%" . $search . "%";

// Riyadh time (date_default_timezone_set is inside config/database.php)
$now = date("Y-m-d H:i:s");

// المحادثة تظهر للدكتور إذا: فيه رسائل بينه وبين الطالب، أو فيه موعد Online بدأ (Booked أو Completed)
// is_now = عند الطالب موعد Online مع الدكتور شغّال الحين (بين وقت البداية ووقت النهاية)
// المحادثات اللي موعدها شغّال تطلع أول، بعدها الأحدث
$stmt = $conn->prepare("
    SELECT
        s.student_id,
        s.full_name AS student_name,
        latest.message_text AS last_message,
        latest.attachment_type AS last_attachment_type,
        latest.sent_at AS last_message_time,
        latest.sender_type AS last_sender_type,
        (
            SELECT COUNT(*) FROM message unread
            WHERE unread.student_id = chats.student_id
            AND unread.faculty_id = ?
            AND unread.sender_type = 'Student'
            AND unread.is_read = 0
        ) AS unread_count,
        (
            SELECT COUNT(*) FROM appointment running
            WHERE running.student_id = chats.student_id
            AND running.faculty_id = ?
            AND running.appointment_type = 'Online'
            AND running.status = 'Booked'
            AND TIMESTAMP(running.appointment_date, running.appointment_time) <= ?
            AND TIMESTAMP(running.appointment_date, running.appointment_end_time) > ?
        ) AS is_now
    FROM (
        SELECT student_id, MAX(last_time) AS last_start
        FROM (
            SELECT student_id, TIMESTAMP(appointment_date, appointment_time) AS last_time
            FROM appointment
            WHERE faculty_id = ?
            AND appointment_type = 'Online'
           AND status IN ('Booked', 'Pending Confirmation', 'Completed', 'Absent')
            AND TIMESTAMP(appointment_date, appointment_time) <= ?
            UNION ALL
            SELECT student_id, sent_at AS last_time
            FROM message
            WHERE faculty_id = ?
        ) AS all_chats
        GROUP BY student_id
    ) AS chats
    INNER JOIN student s ON s.student_id = chats.student_id
    LEFT JOIN (
        SELECT student_id, MAX(message_id) AS last_id
        FROM message
        WHERE faculty_id = ?
        GROUP BY student_id
    ) AS last_ids ON last_ids.student_id = chats.student_id
    LEFT JOIN message latest ON latest.message_id = last_ids.last_id
    WHERE s.full_name LIKE ? OR s.student_id LIKE ?
    ORDER BY is_now DESC, COALESCE(latest.sent_at, chats.last_start) DESC, s.student_id ASC
");
$stmt->bind_param(
    "ssssssssss",
    $faculty_id, $faculty_id, $now, $now,
    $faculty_id, $now, $faculty_id,
    $faculty_id, $searchValue, $searchValue
);
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

