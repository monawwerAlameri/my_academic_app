<?php

if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    exit('Forbidden');
}

require_once __DIR__ . '/../config/database.php';


$now = date("Y-m-d H:i:s");

try {
    $stmt = $conn->prepare("
        UPDATE appointment
        SET status = 'Completed'
        WHERE status = 'Booked'
        AND TIMESTAMP(appointment_date, appointment_end_time) <= ?
    ");
    $stmt->bind_param("s", $now);
    $stmt->execute();
    echo $now . " complete_appointments: " . $stmt->affected_rows . " appointment(s) completed\n";
    $stmt->close();
} catch (Throwable $e) {
    error_log("complete_appointments failed: " . $e->getMessage());
    echo $now . " complete_appointments: FAILED\n";
    $conn->close();
    exit(1);
}

$conn->close();