<?php
// Cron job: replaces the MySQL event `send_appointment_reminders`.
// Runs every minute. Creates a 'Reminder' notification (for the student and for the faculty)
// for every Booked appointment that starts within the next 30 minutes.
// Same logic as the event; the only difference is that "now" comes from PHP (Asia/Riyadh,
// set in config/database.php) instead of UTC + 3 hours.
 
// This file must run from the command line (cron) only, never from a browser
if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    exit('Forbidden');
}
 
require_once __DIR__ . '/../config/database.php';
 
// Riyadh time from PHP (date_default_timezone_set is inside database.php)
$now   = date("Y-m-d H:i:s");
$limit = date("Y-m-d H:i:s", time() + (30 * 60));   // 30 minutes from now
 
// Appointments that start after now and up to 30 minutes from now.
// The LEFT JOIN skips appointments that already have a Reminder for the same user.
$sql = <<<'SQL'
INSERT INTO notification (user_id, notification_type, message, notification_time, appointment_id)
SELECT r.user_id, 'Reminder', r.message, ?, r.appointment_id
FROM (
    SELECT a.student_id AS user_id, a.appointment_id,
           JSON_OBJECT('doctor', f.full_name, 'date', DATE_FORMAT(a.appointment_date, '%Y-%m-%d'), 'time', TIME_FORMAT(a.appointment_time, '%H:%i:%s')) AS message
    FROM appointment a
    INNER JOIN facultymember f ON a.faculty_id = f.faculty_id
    WHERE a.status = 'Booked'
      AND TIMESTAMP(a.appointment_date, a.appointment_time) > ?
      AND TIMESTAMP(a.appointment_date, a.appointment_time) <= ?
    UNION ALL
    SELECT a.faculty_id AS user_id, a.appointment_id,
           JSON_OBJECT('student', s.full_name, 'date', DATE_FORMAT(a.appointment_date, '%Y-%m-%d'), 'time', TIME_FORMAT(a.appointment_time, '%H:%i:%s')) AS message
    FROM appointment a
    INNER JOIN student s ON a.student_id = s.student_id
    WHERE a.status = 'Booked'
      AND TIMESTAMP(a.appointment_date, a.appointment_time) > ?
      AND TIMESTAMP(a.appointment_date, a.appointment_time) <= ?
) AS r
LEFT JOIN notification n
    ON n.user_id = r.user_id AND n.notification_type = 'Reminder' AND n.appointment_id = r.appointment_id
WHERE n.notification_id IS NULL
SQL;
 
try {
    $stmt = $conn->prepare($sql);
    // 5 values in order: notification_time, (now, limit) for the student part, (now, limit) for the faculty part
    $stmt->bind_param("sssss", $now, $now, $limit, $now, $limit);
    $stmt->execute();
    echo $now . " send_reminders: " . $stmt->affected_rows . " reminder(s) created\n";
    $stmt->close();
} catch (Throwable $e) {
    error_log("send_reminders failed: " . $e->getMessage());
    echo $now . " send_reminders: FAILED\n";
    $conn->close();
    exit(1);
}
 
$conn->close();