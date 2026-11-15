<?php
  
header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/faculty_auth.php';

$faculty_id = requireFacultyAuth($conn);

$input            = json_decode(file_get_contents("php://input"), true) ?? [];
$schedule_id      = (int)($input["schedule_id"] ?? 0);
$day_of_week      = trim($input["day_of_week"] ?? "");
$start_time       = trim($input["start_time"] ?? "");
$end_time         = trim($input["end_time"] ?? "");
$appointment_type = trim($input["appointment_type"] ?? "");
$location         = trim($input["location"] ?? "");

if ($schedule_id <= 0 || $day_of_week === "" || $start_time === "" || $end_time === "" || $appointment_type === "" || $location === "") {
    facultyFail("ALL_FIELDS_REQUIRED", "All schedule fields are required", null, $conn);
}

if ($start_time >= $end_time) {
    facultyFail("INVALID_TIME_RANGE", "Start time must be before end time", null, $conn);
}
if (mb_strlen($location) > 30) {
    facultyFail("LOCATION_TOO_LONG", "Location must be 30 characters or less", null, $conn);
}

$stmt = $conn->prepare("SELECT schedule_id FROM schedule WHERE faculty_id = ? AND day_of_week = ? AND start_time < ? AND end_time > ? AND schedule_id <> ? LIMIT 1");
$stmt->bind_param("ssssi", $faculty_id, $day_of_week, $end_time, $start_time, $schedule_id);
$stmt->execute();
$overlap = ($stmt->get_result()->num_rows > 0);
$stmt->close();
if ($overlap) {
    facultyFail("SCHEDULE_OVERLAP", "This time overlaps with another slot", null, $conn);
}

$stmt = $conn->prepare("SELECT schedule_id FROM schedule WHERE schedule_id = ? AND faculty_id = ?");
$stmt->bind_param("is", $schedule_id, $faculty_id);
$stmt->execute();
$exists = ($stmt->get_result()->num_rows > 0);
$stmt->close();
if (!$exists) {
    facultyFail("SCHEDULE_NOT_FOUND", "Schedule not found", null, $conn);
}

$stmt = $conn->prepare("
    UPDATE schedule
    SET day_of_week = ?, start_time = ?, end_time = ?, appointment_type = ?, location = ?
    WHERE schedule_id = ? AND faculty_id = ?
");
$stmt->bind_param("sssssis", $day_of_week, $start_time, $end_time, $appointment_type, $location, $schedule_id, $faculty_id);

if ($stmt->execute()) {
    $stmt->close();
    facultyOk("SCHEDULE_UPDATED", ["schedule_id" => $schedule_id], "Schedule updated successfully");
} else {
    $stmt->close();
    facultyFail("SAVE_FAILED", "Failed to update schedule", null, $conn);
}
$conn->close();
