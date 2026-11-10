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
$password = $input["password"] ?? "";
$phoneNumber = $input["phone_number"] ?? "";
$officeLocation = $input["office_location"] ?? "";
if (
    empty($facultyId) ||
    empty($fullName) ||
    empty($email) ||
    empty($password) ||
    empty($phoneNumber) ||
    empty($officeLocation)
) {
    $response["message"] = "All fields are required";
    echo json_encode($response);
    exit;
}
$checkSql = "
    SELECT faculty_id
    FROM facultymember
    WHERE faculty_id = ? OR email = ?
";
$checkStmt = $conn->prepare($checkSql);
$checkStmt->bind_param("ss", $facultyId, $email);
$checkStmt->execute();
$checkResult = $checkStmt->get_result();
if ($checkResult->num_rows > 0) {
    $response["message"] = "Faculty ID or email already exists";
    echo json_encode($response);
    exit;
}
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);
$sql = "
    INSERT INTO facultymember
    (
        faculty_id,
        full_name,
        email,
        password,
        phone_number,
        office_location
    )
    VALUES (?, ?, ?, ?, ?, ?)
";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "ssssss",
    $facultyId,
    $fullName,
    $email,
    $hashedPassword,
    $phoneNumber,
    $officeLocation
);
  if ($stmt->execute()) {

    $response["success"] = true;
    $response["message"] = "Faculty registered successfully";
    $response["data"] = [
        "faculty_id" => $facultyId,
        "full_name" => $fullName,
        "email" => $email,
        "phone_number" => $phoneNumber,
        "office_location" => $officeLocation
    ];

} 
   else {

    $response["message"] = "Failed to register faculty";
}
echo json_encode($response);
?>