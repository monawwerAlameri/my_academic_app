<?php
require_once __DIR__ . '/auth.php';

function facultyFail($code, $message = "", $data = null, $conn = null) {
    echo json_encode(["success" => false, "code" => $code, "message" => $message, "data" => $data], JSON_UNESCAPED_UNICODE);
    if ($conn) $conn->close();
    exit;
}

function facultyOk($code, $data = null, $message = "") {
    echo json_encode(["success" => true, "code" => $code, "message" => $message, "data" => $data], JSON_UNESCAPED_UNICODE);
}

function requireFacultyAuth($conn) {
    $input = json_decode(file_get_contents("php://input"), true) ?? [];
    $faculty_id = trim($_GET['faculty_id'] ?? ($input['faculty_id'] ?? ''));
    if ($faculty_id === '') {
        facultyFail("ALL_FIELDS_REQUIRED", "Faculty ID is required", null, $conn);
    }
    requireActiveFaculty($conn, $faculty_id);
    return $faculty_id;
}