<?php
date_default_timezone_set('Asia/Riyadh');
$host = "srv2146.hstgr.io";
$username = "u920842481_admin";
$password = (require __DIR__ . '/secret.php')['db_password'];
$database = "u920842481_academic_book";

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
die("Database connection failed: " . $conn->connect_error);
}

?>