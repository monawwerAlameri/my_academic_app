<?php
date_default_timezone_set('Asia/Riyadh');
$host = "srv2146.hstgr.io";
$username = "u920842481_admin";
$password = (require DIR . '/secret.php')['db_password'];
$database = "u920842481_academic_book";

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $conn = new mysqli($host, $username, $password, $database);
    $conn->set_charset('utf8mb4');
} catch (mysqli_sql_exception $e) {
    header('Content-Type: application/json');
    die(json_encode(["success" => false, "code" => "DB_CONNECTION_FAILED"]));
}