<?php
date_default_timezone_set('Asia/Riyadh');

$host     = "localhost";
$username = "u920842481_admin";
$password = (require __DIR__ . '/secret.php')['db_password'];
$database = "u920842481_academic_book";


set_exception_handler(function ($e) {
    error_log('API error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    if (!headers_sent()) {
        header('Content-Type: application/json');
    }
    echo json_encode(["success" => false, "code" => "SERVER_ERROR"]);
    exit;
});


ini_set('display_errors', '0');
ini_set('log_errors', '1');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $conn = new mysqli($host, $username, $password, $database);
    $conn->set_charset('utf8mb4');
    
    $conn->query("SET time_zone = '+03:00'");
} catch (mysqli_sql_exception $e) {
    error_log('Database connection failed: ' . $e->getMessage());
    header('Content-Type: application/json');
    die(json_encode(["success" => false, "code" => "DB_CONNECTION_FAILED"]));
}