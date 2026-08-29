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
    const prizeReveal = document.getElementById('prizeReveal');
    const prizeText = document.getElementById('prizeText');
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

    // ===== PRIZE POOL =====
    const PRIZES = [
        { text: '$750 Cash Prize!', grand: true },
        { text: 'HP Laptop!', grand: true },
        { text: '$100 Gas Card', grand: false },
        { text: '$50 Gas Card', grand: false },
        { text: '$25 Gas Card', grand: false },
        { text: 'Free Car Wash', grand: false },
        { text: 'Better Luck Next Time', grand: false },
        { text: 'Try Again', grand: false },
    ];

    // Weighted odds (1 in 3.5 overall win rate)
    // ~28.5% chance of winning something
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

    // Check if already verified
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

    // Also flip on card tap/click
    flipCard.addEventListener('click', function(e) {
        if (e.target === scratchCanvas && isUnlocked) return; // Don't flip while scratching
        flipBtn.click();
    });

    // ===== CODE VALIDATION =====
    submitCode.addEventListener('click', validateCode);
    ticketCode.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') validateCode();
    });

    // Auto-format code input
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
                showMessage(`✅ Code accepted! Tier: ${data.tier.replace('_', ' $')} — ${data.ticket_count} ticket(s)`, 'success');
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
        initScratchCanvas();
    }

    // ===== SCRATCH CANVAS =====
    function initScratchCanvas() {
        ctx = scratchCanvas.getContext('2d');
        resizeCanvas();

        // Fill with scratch-off coating
        const gradient = ctx.createLinearGradient(0, 0, scratchCanvas.width, scratchCanvas.height);
        gradient.addColorStop(0, '#b8956a');
        gradient.addColorStop(0.5, '#d4b896');
        gradient.addColorStop(1, '#a07848');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);

        // Add scratch texture dots
        ctx.fillStyle = 'rgba(0,0,0,0.08)';
        for (let i = 0; i < 500; i++) {
            const x = Math.random() * scratchCanvas.width;
            const y = Math.random() * scratchCanvas.height;
            ctx.beginPath();
            ctx.arc(x, y, Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw "SCRATCH HERE" text
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.font = 'bold 18px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SCRATCH HERE', scratchCanvas.width / 2, scratchCanvas.height / 2 - 10);
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText('Reveal your prize!', scratchCanvas.width / 2, scratchCanvas.height / 2 + 15);

        // Set composite for scratching
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
        const rect = scratchCanvas.parentElement.getBoundingClientRect();
        // Use offsetWidth/Height for better iOS compatibility
        const w = rect.width || scratchCanvas.parentElement.offsetWidth;
        const h = rect.height || scratchCanvas.parentElement.offsetHeight;
        scratchCanvas.width = w;
        scratchCanvas.height = h;
        // Set CSS size explicitly for iOS
        scratchCanvas.style.width = w + 'px';
        scratchCanvas.style.height = h + 'px';
    }

    function getPos(e) {
        const rect = scratchCanvas.getBoundingClientRect();
        const touch = e.touches ? e.touches[0] : e;
        // Scale coordinates for canvas resolution
        const scaleX = scratchCanvas.width / rect.width;
        const scaleY = scratchCanvas.height / rect.height;
        return {
            x: (touch.clientX - rect.left) * scaleX,
            y: (touch.clientY - rect.top) * scaleY
        };
    }

    function startScratch(e) {
        if (!isUnlocked) return;
        e.preventDefault();
        isScratching = true;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 40, 0, Math.PI * 2);
        ctx.fill();
    }

    function scratch(e) {
        if (!isScratching || !isUnlocked) return;
        e.preventDefault();
        const pos = getPos(e);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 40, 0, Math.PI * 2);
        ctx.fill();
        checkScratchProgress();
    }

    function endScratch() {
        isScratching = false;
        checkScratchProgress();
    }

    function checkScratchProgress() {
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
        // Remove canvas entirely
        scratchCanvas.style.transition = 'opacity 0.5s';
        scratchCanvas.style.opacity = '0';
        setTimeout(() => {
            scratchCanvas.style.display = 'none';
        }, 500);

        // Show prize
        prizeReveal.classList.remove('hidden');
        prizeText.textContent = currentPrize.text;

        // If grand prize, show winner form
        if (currentPrize.grand) {
            setTimeout(() => {
                winnerForm.classList.remove('hidden');
                document.getElementById('winnerTicketCode').value = currentTicketCode;
                document.getElementById('winnerPrize').value = currentPrize.text;
                winnerForm.scrollIntoView({ behavior: 'smooth' });
            }, 1500);
        }

        // Remove event listeners
        scratchCanvas.removeEventListener('mousedown', startScratch);
        scratchCanvas.removeEventListener('mousemove', scratch);
        scratchCanvas.removeEventListener('mouseup', endScratch);
        scratchCanvas.removeEventListener('touchstart', startScratch);
        scratchCanvas.removeEventListener('touchmove', scratch);
        scratchCanvas.removeEventListener('touchend', endScratch);
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

    // ===== RESIZE HANDLER =====
    window.addEventListener('resize', function() {
        if (ctx && isUnlocked) {
            // Don't resize if already scratched — would lose progress
        }
    });

})();
