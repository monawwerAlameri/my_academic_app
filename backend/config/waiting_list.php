<?php
// يُستدعى داخل transaction بعد قفل صف الدكتور

function promoteFirstFromWaitingList($conn, $faculty_id, $date, $start_time, $end_time, $doctor_name, $now) {
    $slot_start = $date . ' ' . $start_time;
    $slot_end   = $date . ' ' . $end_time;

    $stmt = $conn->prepare("
        SELECT w.waiting_id, w.student_id, w.appointment_type, w.consultation_type, w.queue_position,
               s.full_name AS waiting_student_name
        FROM waitinglist w
        INNER JOIN student s ON w.student_id = s.student_id
        WHERE w.faculty_id = ? AND w.requested_time = ? AND w.requested_end_time = ?
        ORDER BY w.queue_position ASC LIMIT 1
    ");
    $stmt->bind_param("sss", $faculty_id, $slot_start, $slot_end);
    $stmt->execute();
    $first = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$first) return null;

    $day_name = date('l', strtotime($date));
    $stmt = $conn->prepare("
        SELECT location FROM schedule
        WHERE faculty_id = ? AND appointment_type = ? AND LOWER(day_of_week) = LOWER(?)
        AND start_time = ? AND end_time = ?
    ");
    $stmt->bind_param("sssss", $faculty_id, $first['appointment_type'], $day_name, $start_time, $end_time);
    $stmt->execute();
    $slot = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    if (!$slot) return null;

    $stmt = $conn->prepare("
        INSERT INTO appointment (student_id, faculty_id, appointment_date, appointment_time, appointment_end_time,
                                 appointment_type, consultation_type, status, location)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'Booked', ?)
    ");
    $stmt->bind_param("ssssssss", $first['student_id'], $faculty_id, $date, $start_time, $end_time,
                      $first['appointment_type'], $first['consultation_type'], $slot['location']);
    $stmt->execute();
    $new_appointment_id = $conn->insert_id;
    $stmt->close();

    $stmt = $conn->prepare("DELETE FROM waitinglist WHERE waiting_id = ?");
    $stmt->bind_param("i", $first['waiting_id']);
    $stmt->execute();
    $stmt->close();

    $stmt = $conn->prepare("
        UPDATE waitinglist SET queue_position = queue_position - 1
        WHERE faculty_id = ? AND requested_time = ? AND requested_end_time = ? AND queue_position > ?
    ");
    $stmt->bind_param("sssi", $faculty_id, $slot_start, $slot_end, $first['queue_position']);
    $stmt->execute();
    $stmt->close();

    $type        = "Booking Confirmation";
    $student_msg = json_encode(["doctor" => $doctor_name, "date" => $date, "time" => $start_time], JSON_UNESCAPED_UNICODE);
    $doctor_msg  = json_encode(["student" => $first['waiting_student_name'], "date" => $date, "time" => $start_time], JSON_UNESCAPED_UNICODE);

    $stmt = $conn->prepare("INSERT INTO notification (user_id, notification_type, message, notification_time, appointment_id) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("ssssi", $first['student_id'], $type, $student_msg, $now, $new_appointment_id);
    $stmt->execute();
    $stmt->bind_param("ssssi", $faculty_id, $type, $doctor_msg, $now, $new_appointment_id);
    $stmt->execute();
    $stmt->close();

    return $new_appointment_id;
}

function clearWaitingListForDate($conn, $faculty_id, $date, $doctor_name, $reason, $now) {
    $stmt = $conn->prepare("SELECT student_id, requested_time FROM waitinglist WHERE faculty_id = ? AND DATE(requested_time) = ?");
    $stmt->bind_param("ss", $faculty_id, $date);
    $stmt->execute();
    $result = $stmt->get_result();
    $rows = [];
    while ($row = $result->fetch_assoc()) $rows[] = $row;
    $stmt->close();
    if (count($rows) === 0) return 0;

    $type  = "Cancellation";
    $notif = $conn->prepare("INSERT INTO notification (user_id, notification_type, message, notification_time) VALUES (?, ?, ?, ?)");
    foreach ($rows as $row) {
        $msg = json_encode([
            "doctor" => $doctor_name,
            "date"   => $date,
            "time"   => substr($row['requested_time'], 11, 8),
            "by"     => "faculty",
            "reason" => $reason,
        ], JSON_UNESCAPED_UNICODE);
        $notif->bind_param("ssss", $row['student_id'], $type, $msg, $now);
        $notif->execute();
    }
    $notif->close();

    $stmt = $conn->prepare("DELETE FROM waitinglist WHERE faculty_id = ? AND DATE(requested_time) = ?");
    $stmt->bind_param("ss", $faculty_id, $date);
    $stmt->execute();
    $stmt->close();

    return count($rows);
}