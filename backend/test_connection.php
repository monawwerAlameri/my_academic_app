<?php
header("Content-Type: application/json");
require_once __DIR__ . '/config/database.php';
$response = [
    "success" => false,
    "message" => ""
];
if ($conn->connect_error) {
    $response["message"] = "Database connection failed";
} 
   else {
    $response["success"] = true;
    $response["message"] = "Database connected successfully";
}
echo json_encode($response);
?>