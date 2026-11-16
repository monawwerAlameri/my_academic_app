<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/admin_auth.php';
require_once __DIR__ . '/waiting_list_helper.php';
require_once __DIR__ . '/../config/waiting_list.php';

requireAdmin($conn);

$input = json_decode(file_get_contents('php://input'), true) ?? [];

$userId = trim($input['userId'] ?? '');
$role = trim($input['role'] ?? '');
$accountStatus = trim($input['accountStatus'] ?? '');

if ($userId === '' || !in_array($role, ['Student', 'Faculty']) || !in_array($accountStatus, ['Active', 'Suspended'])) {
    echo json_encode([
        'success' => false,
        'message' => 'userId, role (Student/Faculty) and accountStatus (Active/Suspended) are required',
        'data' => null
    ]);
    exit;
}

$now = date('Y-m-d H:i:s');

$conn->begin_transaction();

try {
    if ($role === 'Student') {
        $stmt = $conn->prepare("UPDATE student SET account_status = ? WHERE student_id = ?");
    } else {
        $stmt = $conn->prepare("UPDATE facultymember SET account_status = ? WHERE faculty_id = ?");
    }
    $stmt->bind_param('ss', $accountStatus, $userId);
    $stmt->execute();
    $changed = $stmt->affected_rows > 0;
    $stmt->close();

    // 0 affected rows = user not found OR already in this status
    if (!$changed) {
        $checkSql = ($role === 'Student')
            ? "SELECT student_id FROM student WHERE student_id = ?"
            : "SELECT faculty_id FROM facultymember WHERE faculty_id = ?";
        $stmt = $conn->prepare($checkSql);
        $stmt->bind_param('s', $userId);
        $stmt->execute();
        $stmt->store_result();
        $found = $stmt->num_rows > 0;
        $stmt->close();

        if (!$found) {
            $conn->rollback();
            echo json_encode(['success' => false, 'message' => 'User not found', 'data' => null]);
            $conn->close();
            exit;
        }
    }

    // ---------- A student has just been suspended ----------
    // Leave the waiting lists, cancel her Booked appointments,
    // and give every freed slot that has not started yet to the first waiting student
    if ($changed && $role === 'Student' && $accountStatus === 'Suspended') {
        removeStudentFromWaitingLists($conn, $userId);

        $stmt = $conn->prepare("
            SELECT a.appointment_id, a.faculty_id, a.appointment_date, a.appointment_time, a.appointment_end_time,
                   f.full_name AS doctor_name
            FROM appointment a
            INNER JOIN facultymember f ON a.faculty_id = f.faculty_id
            WHERE a.student_id = ? AND a.status = 'Booked'
        ");
        $stmt->bind_param('s', $userId);
        $stmt->execute();
        $appointments = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        foreach ($appointments as $a) {
            // Same lock used by booking and cancelling, so the waiting list is not changed at the same time
            $lock = $conn->prepare("SELECT faculty_id FROM facultymember WHERE faculty_id = ? FOR UPDATE");
            $lock->bind_param('s', $a['faculty_id']);
            $lock->execute();
            $lock->get_result();
            $lock->close();

            $stmt = $conn->prepare("UPDATE appointment SET status = 'Cancelled' WHERE appointment_id = ? AND status = 'Booked'");
            $stmt->bind_param('i', $a['appointment_id']);
            $stmt->execute();
            $cancelled = $stmt->affected_rows > 0;
            $stmt->close();

            $start_ts = strtotime($a['appointment_date'] . ' ' . $a['appointment_time']);
            if ($cancelled && $start_ts > time()) {
                promoteFirstFromWaitingList(
                    $conn, $a['faculty_id'],
                    $a['appointment_date'], $a['appointment_time'], $a['appointment_end_time'],
                    $a['doctor_name'], $now
                );
            }
        }
    }

    // ---------- A doctor has just been suspended ----------
    // Cancel all Booked appointments (started or not), send a generic cancellation notice to each student,
    // and delete the doctor's waiting list without notifications
    if ($changed && $role === 'Faculty' && $accountStatus === 'Suspended') {
        $stmt = $conn->prepare("SELECT full_name FROM facultymember WHERE faculty_id = ? FOR UPDATE");
        $stmt->bind_param('s', $userId);
        $stmt->execute();
        $doctor_name = $stmt->get_result()->fetch_assoc()['full_name'];
        $stmt->close();

        $stmt = $conn->prepare("SELECT appointment_id, student_id, appointment_date, appointment_time FROM appointment WHERE faculty_id = ? AND status = 'Booked'");
        $stmt->bind_param('s', $userId);
        $stmt->execute();
        $appointments = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        if (count($appointments) > 0) {
            $stmt = $conn->prepare("UPDATE appointment SET status = 'Cancelled' WHERE faculty_id = ? AND status = 'Booked'");
            $stmt->bind_param('s', $userId);
            $stmt->execute();
            $stmt->close();

            // Generic notice: no "by" and no "reason", so the suspension is not mentioned
            $type  = "Cancellation";
            $notif = $conn->prepare("INSERT INTO notification (user_id, notification_type, message, notification_time, appointment_id) VALUES (?, ?, ?, ?, ?)");
            foreach ($appointments as $a) {
                $message = json_encode([
                    "doctor" => $doctor_name,
                    "date"   => $a['appointment_date'],
                    "time"   => $a['appointment_time']
                ], JSON_UNESCAPED_UNICODE);
                $appointment_id = (int) $a['appointment_id'];
                $notif->bind_param('ssssi', $a['student_id'], $type, $message, $now, $appointment_id);
                $notif->execute();
            }
            $notif->close();
        }

        $stmt = $conn->prepare("DELETE FROM waitinglist WHERE faculty_id = ?");
        $stmt->bind_param('s', $userId);
        $stmt->execute();
        $stmt->close();
    }

    $conn->commit();
} catch (Throwable $e) {
    $conn->rollback();
    error_log('update_user_status error: ' . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Failed to update user status', 'data' => null]);
    $conn->close();
    exit;
}

echo json_encode([
    'success' => true,
    'message' => 'User status updated successfully',
    'data' => ['userId' => $userId, 'role' => $role, 'accountStatus' => $accountStatus]
]);
$conn->close();