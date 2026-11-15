<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/faculty_auth.php';

$faculty_id = requireFacultyAuth($conn);

$stmt = $conn->prepare("SELECT faculty_id, full_name, email, phone_number, office_location FROM facultymember WHERE faculty_id = ?");
$stmt->bind_param("s", $faculty_id);
$stmt->execute();
$faculty = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$faculty) {
    facultyFail("FACULTY_NOT_FOUND", "Faculty member not found", null, $conn);
}

facultyOk("PROFILE_RETRIEVED", $faculty, "Faculty profile retrieved successfully");
$conn->close();
