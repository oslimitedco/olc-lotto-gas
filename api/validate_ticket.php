<?php
/**
 * API: Validate a ticket code
 * POST: { "code": "OLC-7X92K" }
 * Returns: { "valid": true, "tier": "spend_50", "ticket_count": 3 } or { "valid": false }
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
$code = isset($input['code']) ? strtoupper(trim($input['code'])) : '';

if (empty($code) || strlen($code) < 5 || strlen($code) > 12) {
    echo json_encode(['valid' => false, 'error' => 'Invalid code format']);
    exit;
}

try {
    $pdo = getDB();
    $stmt = $pdo->prepare("SELECT id, code, tier, ticket_count, status FROM tickets WHERE code = ?");
    $stmt->execute([$code]);
    $ticket = $stmt->fetch();

    if (!$ticket) {
        echo json_encode(['valid' => false, 'error' => 'Code not found']);
        exit;
    }

    if ($ticket['status'] === 'used') {
        echo json_encode(['valid' => false, 'error' => 'This code has already been used']);
        exit;
    }

    if ($ticket['status'] === 'expired') {
        echo json_encode(['valid' => false, 'error' => 'This code has expired']);
        exit;
    }

    // Mark as used
    $update = $pdo->prepare("UPDATE tickets SET status = 'used', redeemed_at = NOW() WHERE id = ?");
    $update->execute([$ticket['id']]);

    // Store ticket info in session
    startSession();
    $_SESSION['active_ticket'] = [
        'code' => $ticket['code'],
        'tier' => $ticket['tier'],
        'ticket_count' => $ticket['ticket_count']
    ];

    echo json_encode([
        'valid' => true,
        'tier' => $ticket['tier'],
        'ticket_count' => $ticket['ticket_count']
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}
