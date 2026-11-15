<?php
date_default_timezone_set('Asia/Riyadh');
$host = "srv2146.hstgr.io";
$username = "u920842481_admin";
$password = "SilAh@2021**";
$database = "u920842481_academic_book";

try {
    $conn = new mysqli($host, $username, $password, $database);
} catch (Throwable $e) {
    // The real error stays in the server log only, the app gets a clean JSON
    error_log("Database connection failed: " . $e->getMessage());
    header('Content-Type: application/json');
    echo json_encode(["success" => false, "code" => "DB_ERROR"]);
    exit;
}
?>