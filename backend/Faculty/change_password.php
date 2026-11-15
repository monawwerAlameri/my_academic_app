<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/faculty_auth.php';

$faculty_id = requireFacultyAuth($conn);

$input           = json_decode(file_get_contents("php://input"), true) ?? [];
$currentPassword = $input["current_password"] ?? "";
$newPassword     = $input["new_password"] ?? "";

if ($currentPassword === "" || $newPassword === "") {
    facultyFail("ALL_FIELDS_REQUIRED", "Current password and new password are required", null, $conn);
}

$stmt = $conn->prepare("SELECT password FROM facultymember WHERE faculty_id = ?");
$stmt->bind_param("s", $faculty_id);
$stmt->execute();
$faculty = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$faculty) {
    facultyFail("FACULTY_NOT_FOUND", "Faculty member not found", null, $conn);
}
if (!password_verify($currentPassword, $faculty["password"])) {
    facultyFail("INVALID_CURRENT_PASSWORD", "Current password is incorrect", null, $conn);
}

$hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
$stmt = $conn->prepare("UPDATE facultymember SET password = ? WHERE faculty_id = ?");
$stmt->bind_param("ss", $hashedPassword, $faculty_id);

if ($stmt->execute()) {
    $stmt->close();
    facultyOk("PASSWORD_CHANGED", ["faculty_id" => $faculty_id], "Password changed successfully");
} else {
    $stmt->close();
    facultyFail("SAVE_FAILED", "Password update failed", null, $conn);
}
$conn->close();
