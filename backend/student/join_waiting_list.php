<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json');
// Waiting lists of appointment times that already started are removed
$clean_now = date("Y-m-d H:i:s");
$cleanStmt = $conn->prepare("DELETE FROM waitinglist WHERE requested_time <= ?");
$cleanStmt->bind_param("s", $clean_now);
$cleanStmt->execute();
$cleanStmt->close();

$data = json_decode(file_get_contents("php://input"), true);
$student_id           = $data['student_id'] ?? '';
$faculty_id           = $data['faculty_id'] ?? '';
$appointment_date     = $data['appointment_date'] ?? '';
$appointment_time     = $data['appointment_time'] ?? '';
$appointment_end_time = $data['appointment_end_time'] ?? '';
$appointment_type     = $data['appointment_type'] ?? '';
$consultation_type    = $data['consultation_type'] ?? '';

if (
    empty($student_id) || empty($faculty_id) || empty($appointment_date) ||
    empty($appointment_time) || empty($appointment_end_time) ||
    empty($appointment_type) || empty($consultation_type)
) {
    echo json_encode(["success" => false, "code" => "ALL_FIELDS_REQUIRED"]);
    exit;
}
requireActiveStudent($conn, $student_id); 

if ($appointment_type !== 'In-Person' && $appointment_type !== 'Online') {
    echo json_encode(["success" => false, "code" => "INVALID_APPOINTMENT_TYPE"]);
    exit;
}

$allowed_consultation_types = ['Questions', 'Project Discussion', 'Other'];
if (!in_array($consultation_type, $allowed_consultation_types, true)) {
    echo json_encode(["success" => false, "code" => "INVALID_CONSULTATION_TYPE"]);
    exit;
}

// Date and time format
$date_ts = strtotime($appointment_date);
if (
    $date_ts === false || date('Y-m-d', $date_ts) !== $appointment_date ||
    !preg_match('/^\d{2}:\d{2}:\d{2}$/', $appointment_time) ||
    !preg_match('/^\d{2}:\d{2}:\d{2}$/', $appointment_end_time)
) {
    echo json_encode(["success" => false, "code" => "SLOT_NOT_FOUND"]);
    exit;
}

// Student must exist
$stmt = $conn->prepare("SELECT full_name FROM student WHERE student_id = ?");
$stmt->bind_param("s", $student_id);
$stmt->execute();
$student = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$student) {
    echo json_encode(["success" => false, "code" => "STUDENT_NOT_FOUND"]);
    $conn->close();
    exit;
}

// Faculty must exist
$stmt = $conn->prepare("SELECT full_name FROM facultymember WHERE faculty_id = ?");
$stmt->bind_param("s", $faculty_id);
$stmt->execute();
$faculty = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$faculty) {
    echo json_encode(["success" => false, "code" => "FACULTY_NOT_FOUND"]);
    $conn->close();
    exit;
}

// Booking window: today until 30 days ahead, and the slot must not have started
$today    = date('Y-m-d');
$now_time = date('H:i:s');
$last_day = date('Y-m-d', strtotime('+30 days'));

if (
    $appointment_date < $today ||
    $appointment_date > $last_day ||
    ($appointment_date === $today && $appointment_time <= $now_time)
) {
    echo json_encode(["success" => false, "code" => "SLOT_NOT_FOUND"]);
    $conn->close();
    exit;
}

// The slot must exist in the faculty weekly schedule
$day_name = date('l', $date_ts);
$stmt = $conn->prepare("
    SELECT schedule_id
    FROM schedule
    WHERE faculty_id = ?
    AND appointment_type = ?
    AND LOWER(day_of_week) = LOWER(?)
    AND start_time = ?
    AND end_time = ?
");
$stmt->bind_param("sssss", $faculty_id, $appointment_type, $day_name, $appointment_time, $appointment_end_time);
$stmt->execute();
$slot = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$slot) {
    echo json_encode(["success" => false, "code" => "SLOT_NOT_FOUND"]);
    $conn->close();
    exit;
}

// The faculty must not have closed this date
$stmt = $conn->prepare("SELECT closed_id FROM closed_date WHERE faculty_id = ? AND closed_date = ?");
$stmt->bind_param("ss", $faculty_id, $appointment_date);
$stmt->execute();
$closed = $stmt->get_result()->num_rows;
$stmt->close();

if ($closed > 0) {
    echo json_encode(["success" => false, "code" => "DAY_CLOSED"]);
    $conn->close();
    exit;
}

$start_datetime    = $appointment_date . ' ' . $appointment_time;
$end_datetime      = $appointment_date . ' ' . $appointment_end_time;
$date_text         = date("j M Y", $date_ts);
$time_text         = date("g:i A", strtotime($appointment_time));
$now               = date("Y-m-d H:i:s");
$notification_type = "Waiting List";
$student_message   = json_encode(["doctor" => $faculty['full_name'], "appointment_type" => $appointment_type, "date" => $appointment_date, "time" => $appointment_time], JSON_UNESCAPED_UNICODE);

$conn->begin_transaction();

try {
    // Lock the faculty row so queue positions and bookings stay consistent
    $lockStmt = $conn->prepare("SELECT faculty_id FROM facultymember WHERE faculty_id = ? FOR UPDATE");
    $lockStmt->bind_param("s", $faculty_id);
    $lockStmt->execute();
    $lockStmt->get_result();
    $lockStmt->close();

    // The slot must be full (a Booked appointment overlaps it)
    $fullStmt = $conn->prepare("
        SELECT appointment_id
        FROM appointment
        WHERE faculty_id = ? AND appointment_date = ? AND status = 'Booked'
        AND appointment_time < ? AND appointment_end_time > ?
        LIMIT 1
    ");
    $fullStmt->bind_param("ssss", $faculty_id, $appointment_date, $appointment_end_time, $appointment_time);
    $fullStmt->execute();
    $isFull = $fullStmt->get_result()->num_rows;
    $fullStmt->close();

    if ($isFull == 0) {
        $conn->rollback();
        echo json_encode(["success" => false, "code" => "SLOT_AVAILABLE"]);
        $conn->close();
        exit;
    }

    // Student already has a Booked appointment at an overlapping time (any faculty)
    $myStmt = $conn->prepare("
        SELECT appointment_id
        FROM appointment
        WHERE student_id = ? AND appointment_date = ? AND status = 'Booked'
        AND appointment_time < ? AND appointment_end_time > ?
        LIMIT 1
    ");
    $myStmt->bind_param("ssss", $student_id, $appointment_date, $appointment_end_time, $appointment_time);
    $myStmt->execute();
    $hasBooking = $myStmt->get_result()->num_rows;
    $myStmt->close();

    // Student already in a waiting list at an overlapping time (any faculty)
    $waitStmt = $conn->prepare("
        SELECT waiting_id
        FROM waitinglist
        WHERE student_id = ?
        AND requested_time < ? AND requested_end_time > ?
        LIMIT 1
    ");
    $waitStmt->bind_param("sss", $student_id, $end_datetime, $start_datetime);
    $waitStmt->execute();
    $hasWaiting = $waitStmt->get_result()->num_rows;
    $waitStmt->close();

    if ($hasBooking > 0 || $hasWaiting > 0) {
        $conn->rollback();
        echo json_encode(["success" => false, "code" => "TIME_CONFLICT"]);
        $conn->close();
        exit;
    }

    // Queue position = number of students already waiting for this slot + 1
    $countStmt = $conn->prepare("
        SELECT COUNT(*) AS waiting_count
        FROM waitinglist
        WHERE faculty_id = ? AND requested_time = ? AND requested_end_time = ?
    ");
    $countStmt->bind_param("sss", $faculty_id, $start_datetime, $end_datetime);
    $countStmt->execute();
    $waiting_count = $countStmt->get_result()->fetch_assoc()['waiting_count'];
    $countStmt->close();

    $queue_position = (int)$waiting_count + 1;

    $insertStmt = $conn->prepare("INSERT INTO waitinglist (student_id, faculty_id, requested_time, requested_end_time, appointment_type, consultation_type, queue_position) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $insertStmt->bind_param("ssssssi", $student_id, $faculty_id, $start_datetime, $end_datetime, $appointment_type, $consultation_type, $queue_position);
    $insertStmt->execute();
    $waiting_id = $conn->insert_id;
    $insertStmt->close();

    // Waiting-list notification has no appointment yet, so appointment_id stays NULL
    $notifStmt = $conn->prepare("INSERT INTO notification (user_id, notification_type, message, notification_time, appointment_id) VALUES (?, ?, ?, ?, NULL)");
    $notifStmt->bind_param("ssss", $student_id, $notification_type, $student_message, $now);
    $notifStmt->execute();
    $notifStmt->close();

    $conn->commit();
    echo json_encode([
        "success" => true,
        "code" => "WAITING_LIST_JOINED",
        "data" => [
            "waiting_id" => $waiting_id,
            "queue_position" => $queue_position
        ]
    ]);
} catch (Throwable $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "code" => "JOIN_FAILED"]);
}

$conn->close();