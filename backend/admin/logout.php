<?php
header('Content-Type: application/json');

// No session on the server: the app logs out by deleting the saved admin_id
echo json_encode(['success' => true, 'message' => 'Logged out', 'data' => null]);