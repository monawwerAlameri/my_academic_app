<?php
header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
$response = [
    "success" => false,
    "message" => "",
    "data" => []
];
$faculty_id = $_GET["faculty_id"] ?? "";
if (empty($faculty_id)) {
    $response["message"] = "Faculty ID is required";
    echo json_encode($response);
    exit;
}

$sql = "SELECT
            a.appointment_id,
            a.student_id,
            s.full_name AS student_name,
            a.faculty_id,
            a.appointment_date,
            a.appointment_time,
            a.appointment_end_time,
            a.appointment_type,
            a.consultation_type,
            a.status,
            a.location
        FROM appointment a
        INNER JOIN student s
            ON a.student_id = s.student_id
        WHERE a.faculty_id = ?
        ORDER BY a.appointment_date ASC,
                 a.appointment_time ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $faculty_id);
$stmt->execute();
$result = $stmt->get_result();
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

$response["success"] = true;
$response["message"] = "Appointments retrieved successfully";
$response["data"] = $data;
echo json_encode($response);
$stmt->close();
$conn->close();
?>