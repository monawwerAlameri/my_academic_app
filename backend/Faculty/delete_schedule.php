<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/faculty_auth.php';

$faculty_id = requireFacultyAuth($conn);

$input       = json_decode(file_get_contents("php://input"), true) ?? [];
$schedule_id = (int)($input["schedule_id"] ?? 0);

if ($schedule_id <= 0) {
    facultyFail("ALL_FIELDS_REQUIRED", "Schedule ID is required", null, $conn);
}

$stmt = $conn->prepare("DELETE FROM schedule WHERE schedule_id = ? AND faculty_id = ?");
$stmt->bind_param("is", $schedule_id, $faculty_id);

if (!$stmt->execute()) {
    $stmt->close();
    facultyFail("SAVE_FAILED", "Failed to delete schedule", null, $conn);
}
$deleted = $stmt->affected_rows;
$stmt->close();

if ($deleted === 0) {
    facultyFail("SCHEDULE_NOT_FOUND", "Schedule not found", null, $conn);
}

facultyOk("SCHEDULE_DELETED", ["schedule_id" => $schedule_id], "Schedule deleted successfully");
$conn->close();
