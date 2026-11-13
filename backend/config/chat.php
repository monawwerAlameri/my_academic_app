<?php
// config/chat.php

// هل المحادثة موجودة بين الطالب والدكتور؟
// موجودة إذا: فيه أي رسالة بينهم، أو فيه موعد Online بدأ (Booked أو Completed)
function chatExists($conn, $student_id, $faculty_id) {
    $now = date("Y-m-d H:i:s");
    $stmt = $conn->prepare("
        SELECT
            (SELECT COUNT(*) FROM message WHERE student_id = ? AND faculty_id = ?)
            +
            (SELECT COUNT(*) FROM appointment
             WHERE student_id = ? AND faculty_id = ?
             AND appointment_type = 'Online'
             AND status IN ('Booked', 'Completed')
             AND CONCAT(appointment_date, ' ', appointment_time) <= ?
            ) AS total
    ");
    $stmt->bind_param("sssss", $student_id, $faculty_id, $student_id, $faculty_id, $now);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    return ((int)$row['total'] > 0);
}

// هل الدكتور Active؟ (عشان نعرف الطالب يقدر يرسل أو لا)
function isFacultyActive($conn, $faculty_id) {
    $stmt = $conn->prepare("SELECT account_status FROM facultymember WHERE faculty_id = ?");
    $stmt->bind_param("s", $faculty_id);
    $stmt->execute();
    $faculty = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    return ($faculty && $faculty['account_status'] === 'Active');
}