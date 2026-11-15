<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/faculty_auth.php';

$faculty_id = requireFacultyAuth($conn);
$today      = date('Y-m-d');

$stmt = $conn->prepare("SELECT closed_id, closed_date FROM closed_date WHERE faculty_id = ? AND closed_date >= ? ORDER BY closed_date ASC");
$stmt->bind_param("ss", $faculty_id, $today);
$stmt->execute();
$result = $stmt->get_result();
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}
$stmt->close();

facultyOk("CLOSED_DATES_RETRIEVED", $data);
$conn->close();
