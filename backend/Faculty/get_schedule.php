<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/faculty_auth.php';

$faculty_id = requireFacultyAuth($conn);

$stmt = $conn->prepare("
    SELECT schedule_id, faculty_id, day_of_week, start_time, end_time, appointment_type, location
    FROM schedule
    WHERE faculty_id = ?
    ORDER BY schedule_id ASC
");
$stmt->bind_param("s", $faculty_id);
$stmt->execute();
$result = $stmt->get_result();
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}
$stmt->close();

facultyOk("SCHEDULE_RETRIEVED", $data, "Schedule retrieved successfully");
$conn->close();
