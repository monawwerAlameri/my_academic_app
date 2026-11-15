<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/faculty_auth.php';

$faculty_id = requireFacultyAuth($conn);

$stmt = $conn->prepare("
    SELECT waiting_id, student_id, faculty_id, requested_time, queue_position
    FROM waitinglist
    WHERE faculty_id = ?
    ORDER BY queue_position ASC
");
$stmt->bind_param("s", $faculty_id);
$stmt->execute();
$result = $stmt->get_result();
$waitingList = [];
while ($row = $result->fetch_assoc()) {
    $waitingList[] = $row;
}
$stmt->close();

facultyOk("WAITING_LIST_RETRIEVED", $waitingList, "Waiting list retrieved successfully");
$conn->close();
