<?php
header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
$response = [
    "success" => false,
    "message" => "",
    "data" => []
];
$input = json_decode(file_get_contents("php://input"), true);
$faculty_id = $input["faculty_id"] ?? "";
$appointment_date = $input["appointment_date"] ?? "";
$reason = $input["reason"] ?? "";
 if (empty($faculty_id) || empty($appointment_date)) {
    $response["message"] = "Faculty ID and appointment date are required";
    echo json_encode($response);
    exit;
}

$sql = "SELECT appointment_id, student_id
        FROM appointment
        WHERE faculty_id = ?
        AND appointment_date = ?
        AND status = 'Booked'";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "ss",
    $faculty_id,
    $appointment_date
);
$stmt->execute();
$result = $stmt->get_result();
$appointments = [];
 while ($row = $result->fetch_assoc()) {
    $appointments[] = $row;
}
$stmt->close();
 if (count($appointments) === 0) {
    $response["success"] = true;
    $response["message"] = "No confirmed appointments found for this date";
    echo json_encode($response);
    exit;
}
$sql = "UPDATE appointment
        SET status = 'Cancelled'
        WHERE faculty_id = ?
        AND appointment_date = ?
        AND status = 'Booked'";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "ss",
    $faculty_id,
    $appointment_date
);
$stmt->execute();
$stmt->close();
$notification_type = "Cancellation";
$notification_time = date("Y-m-d H:i:s");
 foreach ($appointments as $appointment) {

    $message = "Your appointment has been cancelled by the faculty member.";

    if (!empty($reason)) {
        $message .= " Reason: " . $reason;
    }

    $notification_sql = "INSERT INTO notification
        (user_id, notification_type, message, notification_time, appointment_id)
        VALUES (?, ?, ?, ?, ?)";

    $notification_stmt = $conn->prepare($notification_sql);
    $notification_stmt->bind_param(
        "ssssi",
        $appointment["student_id"],
        $notification_type,
        $message,
        $notification_time,
        $appointment["appointment_id"]
    );

    $notification_stmt->execute();
    $notification_stmt->close();
}

$response["success"] = true;
$response["message"] = "All appointments for the selected date were cancelled";

echo json_encode($response);
$conn->close();
?>
