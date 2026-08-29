<?php
/**
 * API: Submit winner information
 * POST: { ticket_code, full_name, email, address, phone, prize, claim_method }
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

$required = ['ticket_code', 'full_name', 'email', 'address', 'phone', 'prize', 'claim_method'];
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

    $stmt = $pdo->prepare("INSERT INTO winners (ticket_code, full_name, email, address, phone, prize, claim_method) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        strtoupper(trim($input['ticket_code'])),
        htmlspecialchars(trim($input['full_name'])),
        filter_var(trim($input['email']), FILTER_VALIDATE_EMAIL),
        htmlspecialchars(trim($input['address'])),
        htmlspecialchars(trim($input['phone'])),
        htmlspecialchars(trim($input['prize'])),
        htmlspecialchars(trim($input['claim_method']))
    ]);

    echo json_encode(['success' => true, 'message' => 'Winner information submitted successfully']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
