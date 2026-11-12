<?php
// config/auth.php
// يتأكد أن الطالب موجود وحسابه Active، وإلا يوقف الطلب

function requireActiveStudent($conn, $student_id) {
    $stmt = $conn->prepare("SELECT account_status FROM student WHERE student_id = ?");
    $stmt->bind_param("s", $student_id);
    $stmt->execute();
    $student = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    // الطالب محذوف (أو محظور) أو ما له وجود
    if (!$student) {
        echo json_encode(["success" => false, "code" => "STUDENT_NOT_FOUND"]);
        $conn->close();
        exit;
    }

    // الطالب موجود لكن حسابه مو Active (موقوف مثلاً)
    if ($student['account_status'] !== 'Active') {
        echo json_encode(["success" => false, "code" => "ACCOUNT_NOT_ACTIVE"]);
        $conn->close();
        exit;
    }
}