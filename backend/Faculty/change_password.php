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
$currentPassword = $input["current_password"] ?? "";
$newPassword = $input["new_password"] ?? "";

if (empty($facultyId) || empty($currentPassword) || empty($newPassword)) {

    $response["message"] = "Faculty ID, current password and new password are required";

    echo json_encode($response);
    exit;
}

// Get faculty password from database
$sql = "
    SELECT password
    FROM facultymember
    WHERE faculty_id = ?
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $facultyId);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows === 0) {

    $response["message"] = "Faculty member not found";

} else {

    $faculty = $result->fetch_assoc();

    // Verify current password
    if (!password_verify($currentPassword, $faculty["password"])) {

        $response["message"] = "Current password is incorrect";
        $response["code"] = "INVALID_CURRENT_PASSWORD";

    } else {

        // Hash new password
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

        // Update password in database
        $updateSql = "
            UPDATE facultymember
            SET password = ?
            WHERE faculty_id = ?
        ";

        $updateStmt = $conn->prepare($updateSql);
        $updateStmt->bind_param("ss", $hashedPassword, $facultyId);

        if ($updateStmt->execute()) {

            $response["success"] = true;
            $response["message"] = "Password changed successfully";

            $response["data"] = [
                "faculty_id" => $facultyId
            ];

        } else {

            $response["message"] = "Password update failed";

        }

        $updateStmt->close();
    }
}

echo json_encode($response);

$stmt->close();
$conn->close();

?>

