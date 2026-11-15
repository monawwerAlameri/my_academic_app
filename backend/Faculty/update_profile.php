<?php

header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/faculty_auth.php';

$faculty_id = requireFacultyAuth($conn);

$input          = json_decode(file_get_contents("php://input"), true) ?? [];
$fullName       = trim($input["full_name"] ?? "");
$email          = trim($input["email"] ?? "");
$phoneNumber    = trim($input["phone_number"] ?? "");
$officeLocation = trim($input["office_location"] ?? "");

if ($fullName === "" || $email === "" || $phoneNumber === "" || $officeLocation === "") {
    facultyFail("ALL_FIELDS_REQUIRED", "All fields are required", null, $conn);
}

$stmt = $conn->prepare("UPDATE facultymember SET full_name = ?, email = ?, phone_number = ?, office_location = ? WHERE faculty_id = ?");
$stmt->bind_param("sssss", $fullName, $email, $phoneNumber, $officeLocation, $faculty_id);

if ($stmt->execute()) {
    $stmt->close();
    facultyOk("PROFILE_UPDATED", [
        "faculty_id"      => $faculty_id,
        "full_name"       => $fullName,
        "email"           => $email,
        "phone_number"    => $phoneNumber,
        "office_location" => $officeLocation
    ], "Faculty profile updated successfully");
} else {
    $stmt->close();
    facultyFail("SAVE_FAILED", "Failed to update faculty profile", null, $conn);
}
$conn->close();
