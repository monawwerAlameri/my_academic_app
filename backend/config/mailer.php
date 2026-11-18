<?php
use PHPMailer\PHPMailer\PHPMailer;

require_once __DIR__ . '/../libs/PHPMailer/src/Exception.php';
require_once __DIR__ . '/../libs/PHPMailer/src/PHPMailer.php';
require_once __DIR__ . '/../libs/PHPMailer/src/SMTP.php';

define('OTP_LIFETIME_SECONDS', 10 * 60);     // مدة صلاحية الكود: 10 دقائق
define('OTP_MAX_SENDS', 5);                  // أقصى عدد أكواد مسموح
define('OTP_RATE_WINDOW_SECONDS', 10 * 60);  // نافذة عدّ الأكواد: آخر 10 دقائق
define('OTP_BLOCK_SECONDS', 10 * 60);        // مدة الحظر: 10 دقائق من المحاولة السادسة

function sendOtpEmail($to_email, $code) {
    $cfg = require __DIR__ . '/mail.php';

    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = $cfg['host'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $cfg['username'];
        $mail->Password   = $cfg['password'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = $cfg['port'];
        $mail->CharSet    = 'UTF-8';

        $mail->setFrom($cfg['from_email'], $cfg['from_name']);
        $mail->addAddress($to_email);

        $mail->isHTML(false);
        $mail->Subject = 'Verification Code';
        $mail->Body    = "Your verification code is: " . $code . "\nThis code expires in " . (OTP_LIFETIME_SECONDS / 60) . " minutes.";

        $mail->send();
        return true;
    } catch (Throwable $e) {
        return false;
    }
}


function otpWaitSeconds($conn, $email) {
    $now = time();
    $now_text = date("Y-m-d H:i:s", $now);

    
    $stmt = $conn->prepare("SELECT blocked_until FROM otp_block WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $block = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if ($block && strtotime($block['blocked_until']) > $now) {
        return strtotime($block['blocked_until']) - $now;   
    }

   
    $since = date("Y-m-d H:i:s", $now - OTP_RATE_WINDOW_SECONDS + OTP_LIFETIME_SECONDS);
    $stmt = $conn->prepare("SELECT COUNT(*) AS cnt FROM verificationcode WHERE email = ? AND expires_at > ?");
    $stmt->bind_param("ss", $email, $since);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if ((int)$row['cnt'] < OTP_MAX_SENDS) {
        return 0;   // allowed
    }

    
    $new_until = date("Y-m-d H:i:s", $now + OTP_BLOCK_SECONDS);
    $stmt = $conn->prepare("
        INSERT INTO otp_block (email, blocked_until) VALUES (?, ?)
        ON DUPLICATE KEY UPDATE blocked_until = IF(blocked_until > ?, blocked_until, VALUES(blocked_until))
    ");
    $stmt->bind_param("sss", $email, $new_until, $now_text);
    $stmt->execute();
    $stmt->close();

  
    $stmt = $conn->prepare("SELECT blocked_until FROM otp_block WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $final = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    return max(1, strtotime($final['blocked_until']) - $now);
}