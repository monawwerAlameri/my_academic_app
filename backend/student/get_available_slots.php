<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/auth.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);
$faculty_id = $data['faculty_id'] ?? '';
$appointment_type = $data['appointment_type'] ?? '';

if (empty($faculty_id) || empty($appointment_type)) {
    echo json_encode(["success" => false, "code" => "ALL_FIELDS_REQUIRED"]);
    exit;
}

if ($appointment_type !== 'In-Person' && $appointment_type !== 'Online') {
    echo json_encode(["success" => false, "code" => "INVALID_APPOINTMENT_TYPE"]);
    exit;
}

// Faculty must exist
$stmt = $conn->prepare("SELECT faculty_id FROM facultymember WHERE faculty_id = ?");
$stmt->bind_param("s", $faculty_id);
$stmt->execute();
$stmt->store_result();
if ($stmt->num_rows === 0) {
    $stmt->close();
    echo json_encode(["success" => false, "code" => "FACULTY_NOT_FOUND"]);
    exit;
}
$stmt->close();
requireActiveFaculty($conn, $faculty_id);

// Booking window: today until 30 days ahead
$today = date('Y-m-d');
$now_time = date('H:i:s');
$last_day = date('Y-m-d', strtotime('+30 days'));

// Weekly template of this faculty for the requested type
$stmt = $conn->prepare("
    SELECT day_of_week, start_time, end_time, location
    FROM schedule
    WHERE faculty_id = ? AND appointment_type = ?
    ORDER BY start_time
");
$stmt->bind_param("ss", $faculty_id, $appointment_type);
$stmt->execute();
$result = $stmt->get_result();
$schedule_rows = [];
while ($row = $result->fetch_assoc()) {
    $schedule_rows[] = $row;
}
$stmt->close();

// Dates closed by the faculty inside the window
$stmt = $conn->prepare("
    SELECT closed_date
    FROM closed_date
    WHERE faculty_id = ? AND closed_date BETWEEN ? AND ?
");
$stmt->bind_param("sss", $faculty_id, $today, $last_day);
$stmt->execute();
$result = $stmt->get_result();
$closed_dates = [];
while ($row = $result->fetch_assoc()) {
    $closed_dates[$row['closed_date']] = true;
}
$stmt->close();

// Booked appointments of this faculty inside the window
$stmt = $conn->prepare("
    SELECT appointment_date, appointment_time, appointment_end_time
    FROM appointment
    WHERE faculty_id = ? AND status = 'Booked' AND appointment_date BETWEEN ? AND ?
");
$stmt->bind_param("sss", $faculty_id, $today, $last_day);
$stmt->execute();
$result = $stmt->get_result();
$booked = [];
while ($row = $result->fetch_assoc()) {
    $booked[] = $row;
}
$stmt->close();

// Build the slots day by day
$slots = [];
for ($i = 0; $i <= 30; $i++) {
    $date = date('Y-m-d', strtotime("+$i days"));

    if (isset($closed_dates[$date])) {
        continue;
    }

    $day_name = date('l', strtotime($date));

    foreach ($schedule_rows as $row) {
        if (strtolower($row['day_of_week']) !== strtolower($day_name)) {
            continue;
        }

        // Skip slots that already started today
        if ($date === $today && $row['start_time'] <= $now_time) {
            continue;
        }

        // Full if a Booked appointment overlaps this slot on the same date
        $is_full = false;
        foreach ($booked as $b) {
            if (
                $b['appointment_date'] === $date &&
                $b['appointment_time'] < $row['end_time'] &&
                $b['appointment_end_time'] > $row['start_time']
            ) {
                $is_full = true;
                break;
            }
        }

        $slots[] = [
            "appointment_date" => $date,
            "day_of_week" => $day_name,
            "appointment_time" => $row['start_time'],
            "appointment_end_time" => $row['end_time'],
            "appointment_type" => $appointment_type,
            "location" => $row['location'],
            "is_full" => $is_full
        ];
    }
}

echo json_encode([
    "success" => true,
    "code" => "AVAILABLE_SLOTS_FETCHED",
    "data" => $slots
]);

$conn->close();