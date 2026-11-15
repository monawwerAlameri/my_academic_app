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
