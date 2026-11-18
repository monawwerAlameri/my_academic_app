<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json');
$complete_now = date("Y-m-d H:i:s");
$completeStmt = $conn->prepare("UPDATE appointment SET status = 'Completed' WHERE status = 'Booked' AND CONCAT(appointment_date, ' ', appointment_end_time) <= ?");
$completeStmt->bind_param("s", $complete_now);
$completeStmt->execute();
$completeStmt->close();

$data = json_decode(file_get_contents("php://input"), true);
$student_id     = $data['student_id'] ?? '';
$appointment_id = $data['appointment_id'] ?? '';

if (empty($student_id)) {
    echo json_encode(["success" => false, "code" => "STUDENT_ID_REQUIRED"]);
    exit;
}
if (empty($appointment_id)) {
    echo json_encode(["success" => false, "code" => "APPOINTMENT_ID_REQUIRED"]);
    exit;
}
requireActiveStudent($conn, $student_id); 

$stmt = $conn->prepare("
    SELECT
        appointment.faculty_id,
        appointment.appointment_date,
        appointment.appointment_time,
        appointment.appointment_end_time,
        appointment.status,
        student.full_name AS student_name,
        facultymember.full_name AS doctor_name
    FROM appointment
    INNER JOIN student ON appointment.student_id = student.student_id
    INNER JOIN facultymember ON appointment.faculty_id = facultymember.faculty_id
    WHERE appointment.appointment_id = ?
    AND appointment.student_id = ?
");
$stmt->bind_param("is", $appointment_id, $student_id);
$stmt->execute();
$appointment = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$appointment) {
    echo json_encode(["success" => false, "code" => "APPOINTMENT_NOT_FOUND"]);
    $conn->close();
    exit;
}

if ($appointment['status'] != 'Booked') {
    echo json_encode(["success" => false, "code" => "APPOINTMENT_NOT_CANCELLABLE"]);
    $conn->close();
    exit;
}
$cancel_deadline = strtotime($appointment['appointment_date'] . ' ' . $appointment['appointment_time']) - (30 * 60);
if (time() > $cancel_deadline) {
    echo json_encode(["success" => false, "code" => "CANCEL_TOO_LATE"]);
    $conn->close();
    exit;
}

$faculty_id        = $appointment['faculty_id'];
$date_text         = date("j M Y", strtotime($appointment['appointment_date']));
$time_text         = date("g:i A", strtotime($appointment['appointment_time']));
$now               = date("Y-m-d H:i:s");
$notification_type = "Cancellation";
$student_message   = json_encode(["doctor" => $appointment['doctor_name'], "date" => $appointment['appointment_date'], "time" => $appointment['appointment_time'], "by" => "student"], JSON_UNESCAPED_UNICODE);
$doctor_message    = json_encode(["student" => $appointment['student_name'], "date" => $appointment['appointment_date'], "time" => $appointment['appointment_time'], "by" => "student"], JSON_UNESCAPED_UNICODE);

$slot_start   = $appointment['appointment_date'] . ' ' . $appointment['appointment_time'];
$slot_end     = $appointment['appointment_date'] . ' ' . $appointment['appointment_end_time'];


$conn->begin_transaction();

try {
    $lockStmt = $conn->prepare("SELECT faculty_id FROM facultymember WHERE faculty_id = ? FOR UPDATE");
    $lockStmt->bind_param("s", $faculty_id);
    $lockStmt->execute();
    $lockStmt->get_result();
    $lockStmt->close();

    $updateStmt = $conn->prepare("UPDATE appointment SET status = 'Cancelled' WHERE appointment_id = ? AND student_id = ? AND status = 'Booked'");
    $updateStmt->bind_param("is", $appointment_id, $student_id);
    $updateStmt->execute();
    $updated = $updateStmt->affected_rows;
    $updateStmt->close();

    if ($updated == 0) {
        $conn->rollback();
        echo json_encode(["success" => false, "code" => "APPOINTMENT_NOT_CANCELLABLE"]);
        $conn->close();
        exit;
    }

    $notifStmt = $conn->prepare("INSERT INTO notification (user_id, notification_type, message, notification_time, appointment_id) VALUES (?, ?, ?, ?, ?)");

    $notifStmt->bind_param("ssssi", $student_id, $notification_type, $student_message, $now, $appointment_id);
    $notifStmt->execute();

    $notifStmt->bind_param("ssssi", $faculty_id, $notification_type, $doctor_message, $now, $appointment_id);
    $notifStmt->execute();
    $notifStmt->close();

   
        $firstStmt = $conn->prepare("
            SELECT
                waitinglist.waiting_id,
                waitinglist.student_id,
                waitinglist.appointment_type,
                waitinglist.consultation_type,
                waitinglist.queue_position,
                student.full_name AS waiting_student_name
            FROM waitinglist
            INNER JOIN student ON waitinglist.student_id = student.student_id
            WHERE waitinglist.faculty_id = ?
            AND waitinglist.requested_time = ?
            AND waitinglist.requested_end_time = ?
            ORDER BY waitinglist.queue_position ASC
            LIMIT 1
        ");
        $firstStmt->bind_param("sss", $faculty_id, $slot_start, $slot_end);
        $firstStmt->execute();
        $first = $firstStmt->get_result()->fetch_assoc();
        $firstStmt->close();

        if ($first) {
            $day_name = date('l', strtotime($appointment['appointment_date']));
            $locStmt = $conn->prepare("
                SELECT location
                FROM schedule
                WHERE faculty_id = ?
                AND appointment_type = ?
                AND LOWER(day_of_week) = LOWER(?)
                AND start_time = ?
                AND end_time = ?
            ");
            $locStmt->bind_param("sssss", $faculty_id, $first['appointment_type'], $day_name, $appointment['appointment_time'], $appointment['appointment_end_time']);
            $locStmt->execute();
            $slot = $locStmt->get_result()->fetch_assoc();
            $locStmt->close();

            if ($slot) {
                $insertStmt = $conn->prepare("INSERT INTO appointment (student_id, faculty_id, appointment_date, appointment_time, appointment_end_time, appointment_type, consultation_type, status, location) VALUES (?, ?, ?, ?, ?, ?, ?, 'Booked', ?)");
                $insertStmt->bind_param("ssssssss", $first['student_id'], $faculty_id, $appointment['appointment_date'], $appointment['appointment_time'], $appointment['appointment_end_time'], $first['appointment_type'], $first['consultation_type'], $slot['location']);
                $insertStmt->execute();
                $new_appointment_id = $conn->insert_id;
                $insertStmt->close();

                $removeStmt = $conn->prepare("DELETE FROM waitinglist WHERE waiting_id = ?");
                $removeStmt->bind_param("i", $first['waiting_id']);
                $removeStmt->execute();
                $removeStmt->close();

                $shiftStmt = $conn->prepare("
                    UPDATE waitinglist
                    SET queue_position = queue_position - 1
                    WHERE faculty_id = ? AND requested_time = ? AND requested_end_time = ?
                    AND queue_position > ?
                ");
                $shiftStmt->bind_param("sssi", $faculty_id, $slot_start, $slot_end, $first['queue_position']);
                $shiftStmt->execute();
                $shiftStmt->close();

                $confirm_type     = "Booking Confirmation";
                $new_student_msg  = json_encode(["doctor" => $appointment['doctor_name'], "date" => $appointment['appointment_date'], "time" => $appointment['appointment_time']], JSON_UNESCAPED_UNICODE);
                $new_doctor_msg   = json_encode(["student" => $first['waiting_student_name'], "date" => $appointment['appointment_date'], "time" => $appointment['appointment_time']], JSON_UNESCAPED_UNICODE);

                $confirmStmt = $conn->prepare("INSERT INTO notification (user_id, notification_type, message, notification_time, appointment_id) VALUES (?, ?, ?, ?, ?)");

                $confirmStmt->bind_param("ssssi", $first['student_id'], $confirm_type, $new_student_msg, $now, $new_appointment_id);
                $confirmStmt->execute();

                $confirmStmt->bind_param("ssssi", $faculty_id, $confirm_type, $new_doctor_msg, $now, $new_appointment_id);
                $confirmStmt->execute();
                $confirmStmt->close();
            }
        }
    

    $conn->commit();
    echo json_encode(["success" => true, "code" => "APPOINTMENT_CANCELLED"]);
} catch (Throwable $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "code" => "CANCEL_FAILED"]);
}

$conn->close();
