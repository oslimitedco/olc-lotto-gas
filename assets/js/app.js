/**
 * OLC Lotto Gas — Main Application JS
 * Neon Noir Edition — Mobile-First
 */

(function() {
    'use strict';

    // ===== DOM ELEMENTS =====
    const ageGate = document.getElementById('ageGate');
    const ageYes = document.getElementById('ageYes');
    const ageNo = document.getElementById('ageNo');
    const underAge = document.getElementById('underAge');
    const mainContent = document.getElementById('mainContent');
    const ticketCode = document.getElementById('ticketCode');
    const submitCode = document.getElementById('submitCode');
    const codeMessage = document.getElementById('codeMessage');
    const flipCard = document.getElementById('flipCard');
    const flipBtn = document.getElementById('flipBtn');
    const lockOverlay = document.getElementById('lockOverlay');
    const scratchCanvas = document.getElementById('scratchCanvas');
    const winnerForm = document.getElementById('winnerForm');
    const winnerFormEl = document.getElementById('winnerFormEl');
    const winnerMessage = document.getElementById('winnerMessage');
    const infoBtn = document.getElementById('infoBtn');
    const infoModal = document.getElementById('infoModal');
    const closeInfo = document.getElementById('closeInfo');

    // ===== STATE =====
    let isFlipped = false;
    let isUnlocked = false;
    let isScratching = false;
    let scratchPercentage = 0;
    let ctx = null;
    let currentTicketCode = '';
    let revealed = false;

    // ===== PRIZE POOL =====
    const PRIZES = [
        { text: '$750 Cash Prize!', grand: true, emoji: '💰' },
        { text: 'HP Laptop!', grand: true, emoji: '💻' },
        { text: '$100 Gas Card', grand: false, emoji: '⛽' },
        { text: '$50 Gas Card', grand: false, emoji: '⛽' },
        { text: '$25 Gas Card', grand: false, emoji: '⛽' },
        { text: 'Free Car Wash', grand: false, emoji: '🚗' },
        { text: 'Better Luck Next Time', grand: false, emoji: '🤞' },
        { text: 'Try Again', grand: false, emoji: '🔄' },
    ];

    // Weighted odds (1 in 3.5 overall win rate)
    function pickPrize() {
        const rand = Math.random();
        if (rand < 0.02) return PRIZES[0];      // 2% - $750
        if (rand < 0.04) return PRIZES[1];      // 2% - HP
        if (rand < 0.08) return PRIZES[2];      // 4% - $100
        if (rand < 0.14) return PRIZES[3];      // 6% - $50
        if (rand < 0.20) return PRIZES[4];      // 6% - $25
        if (rand < 0.25) return PRIZES[5];      // 5% - Car Wash
        if (rand < 0.285) return PRIZES[6];     // 3.5% - Better Luck
        return PRIZES[7];                        // 71.5% - Try Again
    }

    let currentPrize = null;

    // ===== AGE GATE =====
    ageYes.addEventListener('click', function() {
        ageGate.classList.add('hidden');
        mainContent.classList.remove('hidden');
        sessionStorage.setItem('ageVerified', 'true');
    });

    ageNo.addEventListener('click', function() {
        ageGate.classList.add('hidden');
        underAge.classList.remove('hidden');
    });

    if (sessionStorage.getItem('ageVerified') === 'true') {
        ageGate.classList.add('hidden');
        mainContent.classList.remove('hidden');
    }

    // ===== 3D FLIP CARD =====
    flipBtn.addEventListener('click', function() {
        isFlipped = !isFlipped;
        if (isFlipped) {
            flipCard.classList.add('flipped');
            flipBtn.textContent = '↻ SHOW FRONT';
        } else {
            flipCard.classList.remove('flipped');
            flipBtn.textContent = '↻ FLIP CARD';
        }
    });

    flipCard.addEventListener('click', function(e) {
        if (e.target === scratchCanvas && isUnlocked) return;
        flipBtn.click();
    });

    // ===== CODE VALIDATION =====
    submitCode.addEventListener('click', validateCode);
    ticketCode.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') validateCode();
    });

    ticketCode.addEventListener('input', function() {
        this.value = this.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    });

    async function validateCode() {
        const code = ticketCode.value.trim();
        if (!code) {
            showMessage('Please enter a code', 'error');
            return;
        }

        submitCode.disabled = true;
        submitCode.textContent = '...';
        showMessage('Validating...', '');

        try {
            const response = await fetch('api/validate_ticket.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code })
            });

            const data = await response.json();

            if (data.valid) {
                currentTicketCode = code;
                unlockCard(data);
                showMessage('✅ Code accepted! Scratch your ticket!', 'success');
            } else {
                showMessage(data.error || 'Invalid code', 'error');
            }
        } catch (err) {
            showMessage('Network error. Try again.', 'error');
        }

        submitCode.disabled = false;
        submitCode.textContent = 'UNLOCK';
    }

    function showMessage(msg, type) {
        codeMessage.textContent = msg;
        codeMessage.className = 'code-message ' + (type || '');
    }

    // ===== UNLOCK CARD =====
    function unlockCard(data) {
        isUnlocked = true;
        revealed = false;

        // Remove lock overlay
        lockOverlay.classList.add('unlocked');

        // Enable scratch canvas
        scratchCanvas.classList.remove('locked');
        scratchCanvas.classList.add('unlocked');

        // Pick prize
        currentPrize = pickPrize();

        // Flip to front if on back
        if (isFlipped) {
            flipBtn.click();
        }

        // Initialize scratch canvas
        setTimeout(initScratchCanvas, 300);
    }

    // ===== SCRATCH CANVAS =====
    function initScratchCanvas() {
        ctx = scratchCanvas.getContext('2d');
        resizeCanvas();

        // Fill with 100% opaque scratch-off coating
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#c4a265';
        ctx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);

        // Add subtle texture
        ctx.fillStyle = 'rgba(160,120,72,0.3)';
        for (let i = 0; i < 300; i++) {
            const x = Math.random() * scratchCanvas.width;
            const y = Math.random() * scratchCanvas.height;
            ctx.beginPath();
            ctx.arc(x, y, Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw "SCRATCH HERE" text
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.font = 'bold 20px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SCRATCH HERE', scratchCanvas.width / 2, scratchCanvas.height / 2 - 10);
        ctx.font = '13px Inter, sans-serif';
        ctx.fillText('Reveal your prize!', scratchCanvas.width / 2, scratchCanvas.height / 2 + 15);

        // Set composite for scratching (erases to transparent)
        ctx.globalCompositeOperation = 'destination-out';

        // Event listeners
        scratchCanvas.addEventListener('mousedown', startScratch);
        scratchCanvas.addEventListener('mousemove', scratch);
        scratchCanvas.addEventListener('mouseup', endScratch);
        scratchCanvas.addEventListener('mouseleave', endScratch);
        scratchCanvas.addEventListener('touchstart', startScratch, { passive: false });
        scratchCanvas.addEventListener('touchmove', scratch, { passive: false });
        scratchCanvas.addEventListener('touchend', endScratch);
    }

    function resizeCanvas() {
        const parent = scratchCanvas.parentElement;
        const w = parent.offsetWidth || parent.getBoundingClientRect().width;
        const h = parent.offsetHeight || parent.getBoundingClientRect().height;
        scratchCanvas.width = w;
        scratchCanvas.height = h;
        scratchCanvas.style.width = w + 'px';
        scratchCanvas.style.height = h + 'px';
    }

    function getPos(e) {
        const rect = scratchCanvas.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        const scaleX = scratchCanvas.width / rect.width;
        const scaleY = scratchCanvas.height / rect.height;
        return {
            x: (touch.clientX - rect.left) * scaleX,
            y: (touch.clientY - rect.top) * scaleY
        };
    }

    function startScratch(e) {
        if (!isUnlocked || revealed) return;
        e.preventDefault();
        isScratching = true;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 40, 0, Math.PI * 2);
        ctx.fill();
    }

    function scratch(e) {
        if (!isScratching || !isUnlocked || revealed) return;
        e.preventDefault();
        const pos = getPos(e);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 40, 0, Math.PI * 2);
        ctx.fill();
        checkScratchProgress();
    }

    function endScratch() {
        isScratching = false;
        if (!revealed) checkScratchProgress();
    }

    function checkScratchProgress() {
        if (revealed) return;
        const imageData = ctx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
        const pixels = imageData.data;
        let transparent = 0;
        const total = pixels.length / 4;

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) transparent++;
        }

        scratchPercentage = (transparent / total) * 100;

        // Auto-reveal at 40% scratched
        if (scratchPercentage > 40) {
            revealPrize();
        }
    }

    function revealPrize() {
        if (revealed) return;
        revealed = true;

        // Remove canvas
        scratchCanvas.style.transition = 'opacity 0.4s';
        scratchCanvas.style.opacity = '0';
        setTimeout(() => {
            scratchCanvas.style.display = 'none';
        }, 400);

        // Remove event listeners
        scratchCanvas.removeEventListener('mousedown', startScratch);
        scratchCanvas.removeEventListener('mousemove', scratch);
        scratchCanvas.removeEventListener('mouseup', endScratch);
        scratchCanvas.removeEventListener('touchstart', startScratch);
        scratchCanvas.removeEventListener('touchmove', scratch);
        scratchCanvas.removeEventListener('touchend', endScratch);

        // Show result popup after canvas fades
        setTimeout(showResultPopup, 500);
    }

    // ===== RESULT POPUP =====
    function showResultPopup() {
        const isWinner = currentPrize.grand || !currentPrize.text.includes('Try Again') && !currentPrize.text.includes('Better Luck');

        // Create popup overlay
        const overlay = document.createElement('div');
        overlay.className = 'result-overlay';
        overlay.innerHTML = `
            <div class="result-modal ${isWinner ? 'result-win' : 'result-lose'}">
                <div class="result-emoji">${currentPrize.emoji}</div>
                <h2 class="result-title">${isWinner ? '🎉 CONGRATULATIONS!' : '😔 NOT THIS TIME'}</h2>
                <p class="result-prize">${currentPrize.text}</p>
                ${isWinner && currentPrize.grand ? '<p class="result-sub">Fill out the form below to claim your prize!</p>' : ''}
                ${!isWinner ? '<p class="result-sub">Better luck on your next scratch!</p>' : ''}
                <div class="result-buttons">
                    ${isWinner && currentPrize.grand ? '<button class="btn-neon btn-gold result-claim-btn">CLAIM PRIZE</button>' : ''}
                    <button class="btn-neon btn-cyan result-next-btn">NEXT TICKET</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Animate in
        setTimeout(() => overlay.classList.add('active'), 10);

        // Button handlers
        const claimBtn = overlay.querySelector('.result-claim-btn');
        const nextBtn = overlay.querySelector('.result-next-btn');

        if (claimBtn) {
            claimBtn.addEventListener('click', function() {
                overlay.classList.remove('active');
                setTimeout(() => {
                    overlay.remove();
                    // Show winner form
                    winnerForm.classList.remove('hidden');
                    document.getElementById('winnerTicketCode').value = currentTicketCode;
                    document.getElementById('winnerPrize').value = currentPrize.text;
                    winnerForm.scrollIntoView({ behavior: 'smooth' });
                }, 300);
            });
        }

        nextBtn.addEventListener('click', function() {
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.remove();
                resetForNextTicket();
            }, 300);
        });
    }

    function resetForNextTicket() {
        // Reset card state
        isUnlocked = false;
        isFlipped = false;
        revealed = false;
        currentPrize = null;
        currentTicketCode = '';
        scratchPercentage = 0;

        // Reset card flip
        flipCard.classList.remove('flipped');
        flipBtn.textContent = '↻ FLIP CARD';

        // Reset lock overlay
        lockOverlay.classList.remove('unlocked');

        // Reset canvas
        scratchCanvas.style.display = '';
        scratchCanvas.style.opacity = '';
        scratchCanvas.classList.remove('unlocked');
        scratchCanvas.classList.add('locked');

        // Clear code input
        ticketCode.value = '';
        codeMessage.textContent = '';
        codeMessage.className = 'code-message';

        // Hide winner form
        winnerForm.classList.add('hidden');
        winnerMessage.textContent = '';

        // Scroll to code section
        document.getElementById('codeSection').scrollIntoView({ behavior: 'smooth' });
    }

    // ===== WINNER FORM SUBMISSION =====
    winnerFormEl.addEventListener('submit', async function(e) {
        e.preventDefault();

        const btn = this.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'SUBMITTING...';

        const data = {
            ticket_code: document.getElementById('winnerTicketCode').value,
            full_name: document.getElementById('winnerName').value,
            email: document.getElementById('winnerEmail').value,
            address: document.getElementById('winnerAddress').value,
            phone: document.getElementById('winnerPhone').value,
            prize: document.getElementById('winnerPrize').value,
            claim_method: document.getElementById('winnerClaim').value
        };

        try {
            const response = await fetch('api/submit_winner.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                winnerMessage.textContent = '✅ Claim submitted! We will contact you soon.';
                winnerMessage.className = 'winner-message success';
                winnerFormEl.reset();
            } else {
                winnerMessage.textContent = '❌ ' + (result.error || 'Submission failed');
                winnerMessage.className = 'winner-message error';
            }
        } catch (err) {
            winnerMessage.textContent = '❌ Network error. Try again.';
            winnerMessage.className = 'winner-message error';
        }

        btn.disabled = false;
        btn.textContent = 'SUBMIT CLAIM';
    });

    // ===== INFO MODAL =====
    infoBtn.addEventListener('click', function() {
        infoModal.classList.remove('hidden');
    });

    closeInfo.addEventListener('click', function() {
        infoModal.classList.add('hidden');
    });

    infoModal.addEventListener('click', function(e) {
        if (e.target === infoModal) {
            infoModal.classList.add('hidden');
        }
    });

})();
