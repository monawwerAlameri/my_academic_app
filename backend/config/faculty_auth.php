<?php
require_once DIR . '/auth.php';
require_once DIR . '/token.php';

function facultyFail($code, $message = "", $data = null, $conn = null) {
    echo json_encode(["success" => false, "code" => $code, "message" => $message, "data" => $data], JSON_UNESCAPED_UNICODE);
    if ($conn) $conn->close();
    exit;
}

function facultyOk($code, $data = null, $message = "") {
    echo json_encode(["success" => true, "code" => $code, "message" => $message, "data" => $data], JSON_UNESCAPED_UNICODE);
}

function requireFacultyAuth($conn) {
    $faculty_id = verifyToken(readBearerToken(), 'faculty');
    if (!$faculty_id) {
        facultyFail("UNAUTHORIZED", "Login required", null, $conn);
    }
    requireActiveFaculty($conn, $faculty_id);
    return $faculty_id;
}