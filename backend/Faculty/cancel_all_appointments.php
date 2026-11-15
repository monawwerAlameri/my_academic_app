<?php
header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/faculty_auth.php';
require_once __DIR__ . '/../config/waiting_list.php';
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

$faculty_id = requireFacultyAuth($conn);

$input            = json_decode(file_get_contents("php://input"), true) ?? [];
$appointment_date = trim($input["appointment_date"] ?? "");
$reason           = trim($input["reason"] ?? "");

if ($appointment_date === "") {
    facultyFail("ALL_FIELDS_REQUIRED", "Appointment date is required", null, $conn);
}
$d = DateTime::createFromFormat('Y-m-d', $appointment_date);
if (!$d || $d->format('Y-m-d') !== $appointment_date) {
    facultyFail("INVALID_DATE", "Date must be YYYY-MM-DD", null, $conn);
}
if ($appointment_date < date('Y-m-d')) {
    facultyFail("PAST_DATE", "Cannot close a past date", null, $conn);
}

$now             = date("Y-m-d H:i:s");
$cancelled_count = 0;
$waiting_removed = 0;

$conn->begin_transaction();
try {
    
    $stmt = $conn->prepare("SELECT full_name FROM facultymember WHERE faculty_id = ? FOR UPDATE");
    $stmt->bind_param("s", $faculty_id);
    $stmt->execute();
    $doctor_name = $stmt->get_result()->fetch_assoc()['full_name'];
    $stmt->close();

    
    $stmt = $conn->prepare("SELECT closed_id FROM closed_date WHERE faculty_id = ? AND closed_date = ?");
    $stmt->bind_param("ss", $faculty_id, $appointment_date);
    $stmt->execute();
    $already_closed = ($stmt->get_result()->num_rows > 0);
    $stmt->close();

    if (!$already_closed) {
        $stmt = $conn->prepare("INSERT INTO closed_date (faculty_id, closed_date) VALUES (?, ?)");
        $stmt->bind_param("ss", $faculty_id, $appointment_date);
        $stmt->execute();
        $stmt->close();
    }

   
    $stmt = $conn->prepare("SELECT appointment_id, student_id, appointment_time FROM appointment WHERE faculty_id = ? AND appointment_date = ? AND status = 'Booked'");
    $stmt->bind_param("ss", $faculty_id, $appointment_date);
    $stmt->execute();
    $result = $stmt->get_result();
    $appointments = [];
    while ($row = $result->fetch_assoc()) {
        $appointments[] = $row;
    }
    $stmt->close();

    if (count($appointments) > 0) {
        $stmt = $conn->prepare("UPDATE appointment SET status = 'Cancelled' WHERE faculty_id = ? AND appointment_date = ? AND status = 'Booked'");
        $stmt->bind_param("ss", $faculty_id, $appointment_date);
        $stmt->execute();
        $cancelled_count = $stmt->affected_rows;
        $stmt->close();

        
        $type  = "Cancellation";
        $notif = $conn->prepare("INSERT INTO notification (user_id, notification_type, message, notification_time, appointment_id) VALUES (?, ?, ?, ?, ?)");
        foreach ($appointments as $a) {
            $message = json_encode([
                "doctor" => $doctor_name,
                "date"   => $appointment_date,
                "time"   => $a['appointment_time'],
                "by"     => "faculty",
                "reason" => $reason,
            ], JSON_UNESCAPED_UNICODE);
            $appointment_id = (int)$a['appointment_id'];
            $notif->bind_param("ssssi", $a['student_id'], $type, $message, $now, $appointment_id);
            $notif->execute();
        }
        $notif->close();
    }

    
    $waiting_removed = clearWaitingListForDate($conn, $faculty_id, $appointment_date, $doctor_name, $reason, $now);

    $conn->commit();
} catch (Throwable $e) {
    $conn->rollback();
    facultyFail("CANCEL_FAILED", "Failed to close the day", null, $conn);
}

facultyOk("DAY_CLOSED_SUCCESS", [
    "closed_date"     => $appointment_date,
    "cancelled_count" => $cancelled_count,
    "waiting_removed" => $waiting_removed
], "Day closed successfully");
$conn->close();
