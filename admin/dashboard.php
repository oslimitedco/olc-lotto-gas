<?php
require_once __DIR__ . '/../config/db.php';
startSession();

if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    header('Location: login.php');
    exit;
}

$pdo = getDB();

// Handle ticket generation
$genMessage = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    if ($_POST['action'] === 'generate') {
        $count = intval($_POST['ticket_count'] ?? 0);
        $tier = $_POST['tier'] ?? '';
        
        $tierMap = [
            'spend_50' => 3,
            'spend_150' => 10,
            'spend_300' => 25,
            'spend_500' => 50
        ];

        if ($count > 0 && $count <= 1000 && isset($tierMap[$tier])) {
            $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            $generated = 0;
            $stmt = $pdo->prepare("INSERT INTO tickets (code, tier, ticket_count) VALUES (?, ?, ?)");

            for ($i = 0; $i < $count; $i++) {
                $attempts = 0;
                do {
                    $code = 'OLC-';
                    for ($j = 0; $j < 4; $j++) {
                        $code .= $chars[random_int(0, strlen($chars) - 1)];
                    }
                    $attempts++;
                } while ($attempts < 10 && $pdo->prepare("SELECT id FROM tickets WHERE code = ?")->execute([$code]) && $pdo->prepare("SELECT id FROM tickets WHERE code = ?")->rowCount() > 0);

                try {
                    $stmt->execute([$code, $tier, $tierMap[$tier]]);
                    $generated++;
                } catch (PDOException $e) {
                    // Duplicate code, skip
                }
            }
            $genMessage = "✅ Generated $generated tickets for tier: $tier";
        } else {
            $genMessage = "❌ Invalid input. Max 1000 tickets per batch.";
        }
    }

    if ($_POST['action'] === 'expire') {
        $code = strtoupper(trim($_POST['code'] ?? ''));
        if ($code) {
            $stmt = $pdo->prepare("UPDATE tickets SET status = 'expired' WHERE code = ?");
            $stmt->execute([$code]);
            $genMessage = "✅ Ticket $code expired.";
        }
    }
}

// Fetch stats
$totalTickets = $pdo->query("SELECT COUNT(*) FROM tickets")->fetchColumn();
$activeTickets = $pdo->query("SELECT COUNT(*) FROM tickets WHERE status = 'active'")->fetchColumn();
$usedTickets = $pdo->query("SELECT COUNT(*) FROM tickets WHERE status = 'used'")->fetchColumn();
$expiredTickets = $pdo->query("SELECT COUNT(*) FROM tickets WHERE status = 'expired'")->fetchColumn();
$totalWinners = $pdo->query("SELECT COUNT(*) FROM winners")->fetchColumn();

// Fetch all tickets
$tickets = $pdo->query("SELECT * FROM tickets ORDER BY created_at DESC LIMIT 500")->fetchAll();

// Fetch all winners
$winners = $pdo->query("SELECT * FROM winners ORDER BY created_at DESC")->fetchAll();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OLC Admin Dashboard</title>
    <link rel="stylesheet" href="../assets/css/admin.css">
</head>
<body class="admin-dashboard">
    <header class="admin-header">
        <h1>⛽ OLC Lotto Gas — Admin Dashboard</h1>
        <a href="?logout=1" class="btn-logout">Logout</a>
    </header>

    <?php if (isset($_GET['logout'])): ?>
        <?php session_destroy(); header('Location: login.php'); exit; ?>
    <?php endif; ?>

    <?php if ($genMessage): ?>
        <div class="alert"><?php echo $genMessage; ?></div>
    <?php endif; ?>

    <!-- Stats -->
    <section class="stats-grid">
        <div class="stat-card"><span class="stat-num"><?php echo $totalTickets; ?></span><span class="stat-label">Total Tickets</span></div>
        <div class="stat-card active"><span class="stat-num"><?php echo $activeTickets; ?></span><span class="stat-label">Active</span></div>
        <div class="stat-card used"><span class="stat-num"><?php echo $usedTickets; ?></span><span class="stat-label">Used</span></div>
        <div class="stat-card expired"><span class="stat-num"><?php echo $expiredTickets; ?></span><span class="stat-label">Expired</span></div>
        <div class="stat-card winners"><span class="stat-num"><?php echo $totalWinners; ?></span><span class="stat-label">Winners</span></div>
    </section>

    <!-- Generate Tickets -->
    <section class="panel">
        <h2>🎟️ Generate Tickets</h2>
        <form method="POST" class="gen-form">
            <input type="hidden" name="action" value="generate">
            <div class="form-row">
                <div class="form-group">
                    <label>Tier</label>
                    <select name="tier" required>
                        <option value="spend_50">Spend $50 → 3 Tickets</option>
                        <option value="spend_150">Spend $150 → 10 Tickets</option>
                        <option value="spend_300">Spend $300 → 25 Tickets</option>
                        <option value="spend_500">Spend $500 → 50 Tickets</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Number of Codes</label>
                    <input type="number" name="ticket_count" min="1" max="1000" value="10" required>
                </div>
                <button type="submit" class="btn-generate">Generate</button>
            </div>
        </form>
    </section>

    <!-- Ticket Management -->
    <section class="panel">
        <h2>📋 Ticket Management</h2>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Tier</th>
                        <th>Tickets</th>
                        <th>Status</th>
                        <th>Redeemed At</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($tickets as $t): ?>
                    <tr class="status-<?php echo $t['status']; ?>">
                        <td class="code-cell"><?php echo htmlspecialchars($t['code']); ?></td>
                        <td><?php echo htmlspecialchars($t['tier']); ?></td>
                        <td><?php echo $t['ticket_count']; ?></td>
                        <td><span class="badge badge-<?php echo $t['status']; ?>"><?php echo ucfirst($t['status']); ?></span></td>
                        <td><?php echo $t['redeemed_at'] ?? '—'; ?></td>
                        <td>
                            <?php if ($t['status'] === 'active'): ?>
                            <form method="POST" style="display:inline">
                                <input type="hidden" name="action" value="expire">
                                <input type="hidden" name="code" value="<?php echo htmlspecialchars($t['code']); ?>">
                                <button type="submit" class="btn-expire" onclick="return confirm('Expire this ticket?')">Expire</button>
                            </form>
                            <?php endif; ?>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </section>

    <!-- Winners -->
    <section class="panel">
        <h2>🏆 Winner Reports</h2>
        <?php if (empty($winners)): ?>
            <p class="no-data">No winners yet.</p>
        <?php else: ?>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Ticket Code</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th>Phone</th>
                        <th>Prize</th>
                        <th>Claim Method</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($winners as $w): ?>
                    <tr>
                        <td class="code-cell"><?php echo htmlspecialchars($w['ticket_code']); ?></td>
                        <td><?php echo htmlspecialchars($w['full_name']); ?></td>
                        <td><?php echo htmlspecialchars($w['email']); ?></td>
                        <td><?php echo htmlspecialchars($w['address']); ?></td>
                        <td><?php echo htmlspecialchars($w['phone']); ?></td>
                        <td><?php echo htmlspecialchars($w['prize']); ?></td>
                        <td><?php echo htmlspecialchars($w['claim_method']); ?></td>
                        <td><?php echo $w['created_at']; ?></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <?php endif; ?>
    </section>

    <footer class="admin-footer">
        <p>© 2025 O'S Limited Collection. All rights reserved.</p>
    </footer>
</body>
</html>
