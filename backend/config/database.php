<?php
date_default_timezone_set('Asia/Riyadh');
$host = "localhost";
$username = "root";
$password = (require DIR . '/secret.php')['db_password'];
$database = "academic_booking";

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
die("Database connection failed: " . $conn->connect_error);
}

?>