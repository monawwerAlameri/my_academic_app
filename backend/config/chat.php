<?php
// config/chat.php

// هل المحادثة موجودة بين الطالب والدكتور؟
// موجودة إذا: فيه أي رسالة بينهم، أو فيه موعد Online بدأ (Booked أو Completed)
function chatExists($conn, $student_id, $faculty_id) {
    $now = date("Y-m-d H:i:s");
    $stmt = $conn->prepare("
        SELECT
            (SELECT COUNT(*) FROM message WHERE student_id = ? AND faculty_id = ?)
            +
            (SELECT COUNT(*) FROM appointment
             WHERE student_id = ? AND faculty_id = ?
             AND appointment_type = 'Online'
             AND status IN ('Booked', 'Completed')
             AND CONCAT(appointment_date, ' ', appointment_time) <= ?
            ) AS total
    ");
    $stmt->bind_param("sssss", $student_id, $faculty_id, $student_id, $faculty_id, $now);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    return ((int)$row['total'] > 0);
}

// هل الدكتور Active؟ (عشان نعرف الطالب يقدر يرسل أو لا)
function isFacultyActive($conn, $faculty_id) {
    $stmt = $conn->prepare("SELECT account_status FROM facultymember WHERE faculty_id = ?");
    $stmt->bind_param("s", $faculty_id);
    $stmt->execute();
    $faculty = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    return ($faculty && $faculty['account_status'] === 'Active');
}

// يحفظ المرفق اللي جا مع الرسالة في uploads/chat
// يرجّع: ['path' => ..., 'name' => ..., 'type' => ...]  أو  ['error' => 'كود الخطأ']
// الأنواع المسموحة فقط تنقبل، وأي نوع ثاني (مثل php) ينرفض
function saveChatAttachment($file) {
    $max_file_size = 10 * 1024 * 1024; // 10 MB

    if ($file['error'] === UPLOAD_ERR_INI_SIZE || $file['error'] === UPLOAD_ERR_FORM_SIZE || $file['size'] > $max_file_size) {
        return ['error' => 'FILE_TOO_LARGE'];
    }
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return ['error' => 'UPLOAD_FAILED'];
    }

    $allowed_files = [
        'jpg' => 'image', 'jpeg' => 'image', 'png' => 'image',
        'mp4' => 'video',
        'pdf' => 'file', 'doc' => 'file', 'docx' => 'file',
        'ppt' => 'file', 'pptx' => 'file',
        'xls' => 'file', 'xlsx' => 'file', 'txt' => 'file'
    ];
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));

    if (!isset($allowed_files[$extension])) {
        return ['error' => 'INVALID_FILE_TYPE'];
    }
    // الصورة لازم تكون صورة حقيقية، مو ملف ثاني اسمه .jpg
    if ($allowed_files[$extension] === 'image' && @getimagesize($file['tmp_name']) === false) {
        return ['error' => 'INVALID_FILE_TYPE'];
    }

    $upload_dir = __DIR__ . '/../uploads/chat/';
    if (!is_dir($upload_dir) && !mkdir($upload_dir, 0755, true)) {
        return ['error' => 'UPLOAD_FAILED'];
    }

    // اسم عشوائي، عشان ما أحد يقدر يخمّن رابط الملف
    $stored_name = bin2hex(random_bytes(16)) . '.' . $extension;
    if (!move_uploaded_file($file['tmp_name'], $upload_dir . $stored_name)) {
        return ['error' => 'UPLOAD_FAILED'];
    }

    return [
        'path' => 'uploads/chat/' . $stored_name,
        'name' => $file['name'],
        'type' => $allowed_files[$extension]
    ];
}