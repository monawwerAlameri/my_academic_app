<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/faculty_auth.php';

$faculty_id = requireFacultyAuth($conn);

$input       = json_decode(file_get_contents("php://input"), true) ?? [];
$closed_date = trim($input["closed_date"] ?? "");

if ($closed_date === "") {
    facultyFail("ALL_FIELDS_REQUIRED", "closed_date is required", null, $conn);
}
$d = DateTime::createFromFormat('Y-m-d', $closed_date);
if (!$d || $d->format('Y-m-d') !== $closed_date) {
    facultyFail("INVALID_DATE", "Date must be YYYY-MM-DD", null, $conn);
}

$stmt = $conn->prepare("DELETE FROM closed_date WHERE faculty_id = ? AND closed_date = ?");
$stmt->bind_param("ss", $faculty_id, $closed_date);
$stmt->execute();
$deleted = $stmt->affected_rows;
$stmt->close();

if ($deleted === 0) {
    facultyFail("DATE_NOT_CLOSED", "This date is not closed", null, $conn);
}

facultyOk("DATE_REOPENED", ["closed_date" => $closed_date], "Date reopened successfully");
$conn->close();
