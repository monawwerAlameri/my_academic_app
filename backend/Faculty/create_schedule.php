<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/faculty_auth.php';

$faculty_id = requireFacultyAuth($conn);

$input            = json_decode(file_get_contents("php://input"), true) ?? [];
$day_of_week      = trim($input["day_of_week"] ?? "");
$start_time       = trim($input["start_time"] ?? "");
$end_time         = trim($input["end_time"] ?? "");
$appointment_type = trim($input["appointment_type"] ?? "");
$location         = trim($input["location"] ?? "");

if ($day_of_week === "" || $start_time === "" || $end_time === "" || $appointment_type === "" || $location === "") {
    facultyFail("ALL_FIELDS_REQUIRED", "All schedule fields are required", null, $conn);
}

if ($start_time >= $end_time) {
    facultyFail("INVALID_TIME_RANGE", "Start time must be before end time", null, $conn);
}
if (mb_strlen($location) > 30) {
    facultyFail("LOCATION_TOO_LONG", "Location must be 30 characters or less", null, $conn);
}

$stmt = $conn->prepare("SELECT schedule_id FROM schedule WHERE faculty_id = ? AND day_of_week = ? AND start_time < ? AND end_time > ? LIMIT 1");
$stmt->bind_param("ssss", $faculty_id, $day_of_week, $end_time, $start_time);
$stmt->execute();
$overlap = ($stmt->get_result()->num_rows > 0);
$stmt->close();
if ($overlap) {
    facultyFail("SCHEDULE_OVERLAP", "This time overlaps with another slot", null, $conn);
}

$stmt = $conn->prepare("
    INSERT INTO schedule (faculty_id, day_of_week, start_time, end_time, appointment_type, location)
    VALUES (?, ?, ?, ?, ?, ?)
");
$stmt->bind_param("ssssss", $faculty_id, $day_of_week, $start_time, $end_time, $appointment_type, $location);

if ($stmt->execute()) {
    $new_id = $stmt->insert_id;
    $stmt->close();
    facultyOk("SCHEDULE_CREATED", ["schedule_id" => $new_id], "Schedule created successfully");
} else {
    $stmt->close();
    facultyFail("SAVE_FAILED", "Failed to create schedule", null, $conn);
}
$conn->close();
