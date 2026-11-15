<?php

function removeStudentFromWaitingLists(mysqli $conn, string $studentId): void {
    $stmt = $conn->prepare("SELECT waiting_id, faculty_id, requested_time, requested_end_time, queue_position FROM waitinglist WHERE student_id = ?");
    $stmt->bind_param('s', $studentId);
    $stmt->execute();
    $entries = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    foreach ($entries as $entry) {
        $stmt = $conn->prepare("DELETE FROM waitinglist WHERE waiting_id = ?");
        $stmt->bind_param('i', $entry['waiting_id']);
        $stmt->execute();
        $stmt->close();

        $stmt = $conn->prepare("UPDATE waitinglist SET queue_position = queue_position - 1 WHERE faculty_id = ? AND requested_time = ? AND requested_end_time = ? AND queue_position > ?");
        $stmt->bind_param('sssi', $entry['faculty_id'], $entry['requested_time'], $entry['requested_end_time'], $entry['queue_position']);
        $stmt->execute();
        $stmt->close();
    }
}