<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>OLC Lotto Gas — O'S Limited Collection</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
</head>
<body>

<!-- ===== ADMIN QUICK ACCESS ===== -->
<a href="admin/login.php" class="admin-float-btn" title="Admin Login">🔒</a>

<!-- ===== NEON BACKGROUND EFFECTS ===== -->
<div class="neon-bg">
    <div class="neon-glow glow-red"></div>
    <div class="neon-glow glow-cyan"></div>
    <div class="neon-glow glow-gold"></div>
    <div class="neon-streak streak-1"></div>
    <div class="neon-streak streak-2"></div>
    <div class="neon-streak streak-3"></div>
</div>

<!-- ===== AGE GATE MODAL ===== -->
<div id="ageGate" class="modal-overlay">
    <div class="modal-box age-gate-box">
        <div class="logo-wrap">
            <img src="assets/images/logo.jpg" alt="OLC Logo" class="gate-logo">
        </div>
        <h1>O'S Limited Collection</h1>
        <p class="tagline">Lotto Gas Lottery System</p>
        <div class="age-question">
            <p>Are you 19 years of age or older?</p>
            <div class="age-buttons">
                <button id="ageYes" class="btn-neon btn-cyan">YES, I'M 19+</button>
                <button id="ageNo" class="btn-neon btn-red">NO</button>
            </div>
        </div>
        <p class="established">Est. 2025</p>
    </div>
</div>

<!-- ===== UNDER AGE MODAL ===== -->
<div id="underAge" class="modal-overlay hidden">
    <div class="modal-box">
        <h2>⛔ Access Denied</h2>
        <p>You must be 19 or older to access this site.</p>
    </div>
</div>

<!-- ===== MAIN CONTENT (hidden until age verified) ===== -->
<div id="mainContent" class="main-content hidden">

    <!-- HEADER -->
    <header class="site-header">
        <div class="header-inner">
            <img src="assets/images/logo.jpg" alt="OLC" class="header-logo">
            <h1 class="site-title">OLC Lotto Gas</h1>
        </div>
    </header>

    <!-- CODE ENTRY SECTION -->
    <section id="codeSection" class="code-section">
        <div class="code-box">
            <h2>🎟️ Enter Your Special Ticket Code</h2>
            <p class="code-subtitle">Scratch your card? Enter the code below to reveal your prize.</p>
            <div class="code-input-wrap">
                <input type="text" id="ticketCode" placeholder="OLC-XXXX" maxlength="12" autocomplete="off" spellcheck="false">
                <button id="submitCode" class="btn-neon btn-gold">UNLOCK</button>
            </div>
            <div id="codeMessage" class="code-message"></div>
        </div>
    </section>

    <!-- 3D FLIP CARD SECTION -->
    <section class="card-section">
        <div class="card-container">
            <div id="flipCard" class="flip-card">
                <!-- FRONT -->
                <div class="flip-card-front">
                    <img src="assets/images/ticket-front.png" alt="OLC Scratch Ticket" class="card-bg-img">
                    <!-- Lock overlay -->
                    <div id="lockOverlay" class="lock-overlay">
                        <div class="lock-icon">🔒</div>
                        <p>Enter your code to unlock</p>
                    </div>
                    <!-- Scratch canvas -->
                    <canvas id="scratchCanvas" class="scratch-canvas locked"></canvas>
                </div>
                <!-- BACK -->
                <div class="flip-card-back">
                    <img src="assets/images/ticket-back.png" alt="OLC Ticket Back" class="card-bg-img">
                </div>
            </div>
            <button id="flipBtn" class="btn-neon btn-cyan flip-btn">↻ FLIP CARD</button>
        </div>
    </section>

    <!-- WINNER FORM -->
    <section id="winnerForm" class="winner-form-section hidden">
        <div class="winner-form-box">
            <h2>🎉 You're a Winner!</h2>
            <p>Fill out your info so we can reach you.</p>
            <form id="winnerFormEl">
                <input type="hidden" id="winnerTicketCode">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="winnerName" required>
                </div>
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="tel" id="winnerPhone" required>
                </div>
                <div class="form-group">
                    <label>Instagram Handle</label>
                    <input type="text" id="winnerIG" placeholder="@yourusername" required>
                </div>
                <div class="form-group">
                    <label>Date of Birth</label>
                    <input type="date" id="winnerDOB" required>
                </div>
                <button type="submit" class="btn-neon btn-gold">SUBMIT MY INFO</button>
            </form>
            <div id="winnerMessage" class="winner-message"></div>
        </div>
    </section>

    <!-- SPENDING TIERS -->
    <section class="tiers-section">
        <h2>💰 Spending Tiers</h2>
        <div class="tiers-grid">
            <div class="tier-card">
                <div class="tier-amount">$50</div>
                <div class="tier-tickets">3 Tickets</div>
            </div>
            <div class="tier-card">
                <div class="tier-amount">$150</div>
                <div class="tier-tickets">10 Tickets</div>
            </div>
            <div class="tier-card featured">
                <div class="tier-amount">$300</div>
                <div class="tier-tickets">25 Tickets</div>
            </div>
            <div class="tier-card">
                <div class="tier-amount">$500</div>
                <div class="tier-tickets">50 Tickets</div>
            </div>
        </div>
    </section>

    <!-- PLACE ORDER NOW BUTTON -->
    <section class="order-section">
        <a href="https://t.me/OLC_AIBOT" target="_blank" rel="noopener" class="btn-order-now">
            ⛽ PLACE ORDER NOW
        </a>
    </section>

    <!-- ABOUT / INFO MODAL TRIGGER -->
    <section class="info-section">
        <button id="infoBtn" class="btn-neon btn-cyan info-btn">ℹ️ Read Me / License</button>
    </section>

    <!-- FOOTER -->
    <footer class="site-footer">
        <h3>Connect With Us</h3>
        <div class="social-buttons">
            <a href="https://t.me/OLC_AIBOT" target="_blank" rel="noopener" class="social-btn btn-telegram">
                📦 Place an Order
            </a>
            <a href="https://www.instagram.com/os.limitedco" target="_blank" rel="noopener" class="social-btn btn-instagram">
                📸 Follow on Instagram
            </a>
            <a href="https://snapchat.com/t/JMj5BEVr" target="_blank" rel="noopener" class="social-btn btn-snapchat">
                👻 Add on Snap
            </a>
            <a href="https://t.me/olcofficial" target="_blank" rel="noopener" class="social-btn btn-telegram-news">
                📢 Telegram News
            </a>
        </div>
        <div class="linktree-wrap">
            <a href="https://linktr.ee/OsLimitedCollection" target="_blank" rel="noopener" class="btn-linktree">
                🌳 Linktree — All Links
            </a>
        </div>
        <p class="copyright">© 2025 O'S Limited Collection. All rights reserved.</p>
    </footer>
</div>

<!-- ===== INFO / LICENSE MODAL ===== -->
<div id="infoModal" class="modal-overlay hidden">
    <div class="modal-box modal-info">
        <button id="closeInfo" class="modal-close">&times;</button>
        <h2>O'S Limited Collection — Lotto Gas</h2>
        <div class="info-content">
            <h3>About</h3>
            <p>O'S Limited Collection (OLC) Lotto Gas is a promotional lottery scratch ticket system. Purchase qualifying fuel orders to receive scratch tickets with a chance to win prizes up to $750 or HP devices.</p>
            
            <h3>How It Works</h3>
            <ol>
                <li>Place a qualifying order through our Telegram bot</li>
                <li>Receive your unique ticket code(s) based on your spending tier</li>
                <li>Enter your code on this website to unlock the scratch area</li>
                <li>Scratch to reveal your prize!</li>
            </ol>

            <h3>Spending Tiers</h3>
            <ul>
                <li>Spend $50 → 3 Tickets</li>
                <li>Spend $150 → 10 Tickets</li>
                <li>Spend $300 → 25 Tickets</li>
                <li>Spend $500 → 50 Tickets</li>
            </ul>

            <h3>Odds</h3>
            <p>Overall odds of winning any prize: 1 in 3.5. Winning ticket must be validated by an OLC representative.</p>

            <h3>Terms & Conditions</h3>
            <p>Must be 19+ to participate. One code per ticket. Codes are single-use and cannot be reused once redeemed. Prizes are subject to availability. O'S Limited Collection reserves the right to verify all winning claims. Fraudulent entries will be voided. This promotion is not affiliated with or endorsed by any fuel company or lottery corporation.</p>

            <h3>License</h3>
            <p>© 2025 O'S Limited Collection. All rights reserved. The OLC name, logo, and Lotto Gas branding are trademarks of O'S Limited Collection. Unauthorized reproduction or distribution is prohibited.</p>
        </div>
    </div>
</div>

<script src="assets/js/app.js"></script>
</body>
</html>
