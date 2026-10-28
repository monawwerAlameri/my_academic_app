<?php
header("Content-Type: application/json");
require_once __DIR__ . '/../config/database.php';
$response = [
    "success" => false,
    "message" => "",
    "data" => []
];

$input = json_decode(file_get_contents("php://input"), true);
$appointment_id = $input["appointment_id"] ?? "";
$faculty_id = $input["faculty_id"] ?? "";
$reason = $input["reason"] ?? "";

if (empty($appointment_id) || empty($faculty_id)) {
    $response["message"] = "Appointment ID and Faculty ID are required";
    echo json_encode($response);
    exit;
}

$sql = "SELECT student_id
        FROM appointment
        WHERE appointment_id = ?
        AND faculty_id = ?
        AND status = 'Booked'";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "is",
    $appointment_id,
    $faculty_id
);
$stmt->execute();
$result = $stmt->get_result();

  if ($result->num_rows === 0) {
    $response["message"] = "Confirmed appointment not found";
    echo json_encode($response);
    exit;
}

$row = $result->fetch_assoc();
$student_id = $row["student_id"];
$stmt->close();

$sql = "UPDATE appointment
        SET status = 'Cancelled'
        WHERE appointment_id = ?
        AND faculty_id = ?
        AND status = 'Booked'";

$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "is",
    $appointment_id,
    $faculty_id
);

  if ($stmt->execute() && $stmt->affected_rows > 0) {

    $message = "Your appointment has been cancelled by the faculty member.";

    if (!empty($reason)) {
        $message .= " Reason: " . $reason;
    }
    $notification_type = "Cancellation";
    $notification_time = date("Y-m-d H:i:s");
    $notification_sql = "INSERT INTO notification
        (user_id, notification_type, message, notification_time, appointment_id)
        VALUES (?, ?, ?, ?, ?)";
    $notification_stmt = $conn->prepare($notification_sql);
    $notification_stmt->bind_param(
        "ssssi",
        $student_id,
        $notification_type,
        $message,
        $notification_time,
        $appointment_id
    );

    $notification_stmt->execute();
    $notification_stmt->close();
    $response["success"] = true;
    $response["message"] = "Appointment cancelled successfully";

} 
   else {

    $response["message"] = "Failed to cancel appointment";
}
echo json_encode($response);
$stmt->close();
$conn->close();
?>
