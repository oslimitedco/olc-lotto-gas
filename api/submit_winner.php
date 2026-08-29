<?php
/**
 * API: Submit winner information
 * POST: { ticket_code, full_name, phone, ig_handle, dob }
 */
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$required = ['ticket_code', 'full_name', 'phone', 'ig_handle', 'dob'];
foreach ($required as $field) {
    if (empty($input[$field])) {
        echo json_encode(['error' => "Missing field: $field"]);
        exit;
    }
}

try {
    $pdo = getDB();
    
    // Verify ticket exists and is used
    $stmt = $pdo->prepare("SELECT id FROM tickets WHERE code = ? AND status = 'used'");
    $stmt->execute([strtoupper(trim($input['ticket_code']))]);
    if (!$stmt->fetch()) {
        echo json_encode(['error' => 'Invalid ticket code']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO winners (ticket_code, full_name, phone, ig_handle, dob) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([
        strtoupper(trim($input['ticket_code'])),
        htmlspecialchars(trim($input['full_name'])),
        htmlspecialchars(trim($input['phone'])),
        htmlspecialchars(trim($input['ig_handle'])),
        htmlspecialchars(trim($input['dob']))
    ]);

    echo json_encode(['success' => true, 'message' => 'Information submitted successfully']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
