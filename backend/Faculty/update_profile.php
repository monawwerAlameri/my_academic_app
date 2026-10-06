<?php
header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
$response = [
    "success" => false,
    "message" => "",
    "data" => null
];
$input = json_decode(file_get_contents("php://input"), true);
$facultyId = $input["faculty_id"] ?? "";
$fullName = $input["full_name"] ?? "";
$email = $input["email"] ?? "";
$phoneNumber = $input["phone_number"] ?? "";
$officeLocation = $input["office_location"] ?? "";
if (
    empty($facultyId) ||
    empty($fullName) ||
    empty($email) ||
    empty($phoneNumber) ||
    empty($officeLocation)
) {

    $response["message"] = "All fields are required";
    echo json_encode($response);
    exit;
}

$sql = "
    UPDATE facultymember
    SET
        full_name = ?,
        email = ?,
        phone_number = ?,
        office_location = ?
    WHERE faculty_id = ?
";
$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "sssss",
    $fullName,
    $email,
    $phoneNumber,
    $officeLocation,
    $facultyId
);

  if ($stmt->execute()) {

    $response["success"] = true;
    $response["message"] = "Faculty profile updated successfully";
    $response["data"] = [
        "faculty_id" => $facultyId,
        "full_name" => $fullName,
        "email" => $email,
        "phone_number" => $phoneNumber,
        "office_location" => $officeLocation
    ];

} 
  else {

    $response["message"] = "Failed to update faculty profile";
}
echo json_encode($response);
?>