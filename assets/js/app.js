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

    // ===== OUTCOME POOL =====
    // Winner: 20.88% | 1 More Chance: 7.5% | Try Again: 69.62%
    const OUTCOMES = [
        { type: 'winner', emoji: '🎉', title: 'WINNER!', message: 'You are a winner! Fill out your info so we can reach you.' },
        { type: 'chance', emoji: '🔄', title: '1 MORE CHANCE!', message: 'You get one more scratch! Enter a new code.' },
        { type: 'lose', emoji: '❌', title: 'TRY AGAIN', message: 'No luck this time. Try another ticket!' },
    ];

    function pickOutcome() {
        const rand = Math.random();
        if (rand < 0.2088) return OUTCOMES[0];   // 20.88% - Winner
        if (rand < 0.2838) return OUTCOMES[1];   // 7.5% - 1 More Chance
        return OUTCOMES[2];                       // 69.62% - Try Again
    }

    let currentOutcome = null;

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

        lockOverlay.classList.add('unlocked');
        scratchCanvas.classList.remove('locked');
        scratchCanvas.classList.add('unlocked');

        currentOutcome = pickOutcome();

        if (isFlipped) {
            flipBtn.click();
        }

        setTimeout(initScratchCanvas, 300);
    }

    // ===== SCRATCH CANVAS =====
    function initScratchCanvas() {
        ctx = scratchCanvas.getContext('2d');
        resizeCanvas();

        // 100% opaque scratch-off coating
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#c4a265';
        ctx.fillRect(0, 0, scratchCanvas.width, scratchCanvas.height);

        // Subtle texture
        ctx.fillStyle = 'rgba(160,120,72,0.3)';
        for (let i = 0; i < 300; i++) {
            const x = Math.random() * scratchCanvas.width;
            const y = Math.random() * scratchCanvas.height;
            ctx.beginPath();
            ctx.arc(x, y, Math.random() * 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // "SCRATCH HERE" text
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.font = 'bold 20px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SCRATCH HERE', scratchCanvas.width / 2, scratchCanvas.height / 2 - 10);
        ctx.font = '13px Inter, sans-serif';
        ctx.fillText('Reveal your result!', scratchCanvas.width / 2, scratchCanvas.height / 2 + 15);

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

        if (scratchPercentage > 40) {
            revealPrize();
        }
    }

    function revealPrize() {
        if (revealed) return;
        revealed = true;

        scratchCanvas.style.transition = 'opacity 0.4s';
        scratchCanvas.style.opacity = '0';
        setTimeout(() => {
            scratchCanvas.style.display = 'none';
        }, 400);

        scratchCanvas.removeEventListener('mousedown', startScratch);
        scratchCanvas.removeEventListener('mousemove', scratch);
        scratchCanvas.removeEventListener('mouseup', endScratch);
        scratchCanvas.removeEventListener('touchstart', startScratch);
        scratchCanvas.removeEventListener('touchmove', scratch);
        scratchCanvas.removeEventListener('touchend', endScratch);

        setTimeout(showResultPopup, 500);
    }

    // ===== RESULT POPUP =====
    function showResultPopup() {
        const isWinner = currentOutcome.type === 'winner';
        const isChance = currentOutcome.type === 'chance';

        const overlay = document.createElement('div');
        overlay.className = 'result-overlay';
        overlay.innerHTML =
            '<div class="result-modal ' + (isWinner ? 'result-win' : 'result-lose') + '">' +
                '<div class="result-emoji">' + currentOutcome.emoji + '</div>' +
                '<h2 class="result-title">' + currentOutcome.title + '</h2>' +
                '<p class="result-sub">' + currentOutcome.message + '</p>' +
                '<div class="result-buttons">' +
                    (isWinner ? '<button class="btn-neon btn-gold result-claim-btn">SUBMIT MY INFO</button>' : '') +
                    (isChance ? '<button class="btn-neon btn-gold result-next-btn">ENTER NEW CODE</button>' : '') +
                    (!isWinner && !isChance ? '<button class="btn-neon btn-cyan result-next-btn">NEXT TICKET</button>' : '') +
                '</div>' +
            '</div>';

        document.body.appendChild(overlay);
        setTimeout(function() { overlay.classList.add('active'); }, 10);

        var claimBtn = overlay.querySelector('.result-claim-btn');
        var nextBtn = overlay.querySelector('.result-next-btn');

        if (claimBtn) {
            claimBtn.addEventListener('click', function() {
                overlay.classList.remove('active');
                setTimeout(function() {
                    overlay.remove();
                    winnerForm.classList.remove('hidden');
                    document.getElementById('winnerTicketCode').value = currentTicketCode;
                    winnerForm.scrollIntoView({ behavior: 'smooth' });
                }, 300);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                overlay.classList.remove('active');
                setTimeout(function() {
                    overlay.remove();
                    resetForNextTicket();
                }, 300);
            });
        }
    }

    function resetForNextTicket() {
        isUnlocked = false;
        isFlipped = false;
        revealed = false;
        currentOutcome = null;
        currentTicketCode = '';
        scratchPercentage = 0;

        flipCard.classList.remove('flipped');
        flipBtn.textContent = '↻ FLIP CARD';

        lockOverlay.classList.remove('unlocked');

        scratchCanvas.style.display = '';
        scratchCanvas.style.opacity = '';
        scratchCanvas.classList.remove('unlocked');
        scratchCanvas.classList.add('locked');

        ticketCode.value = '';
        codeMessage.textContent = '';
        codeMessage.className = 'code-message';

        winnerForm.classList.add('hidden');
        winnerMessage.textContent = '';

        document.getElementById('codeSection').scrollIntoView({ behavior: 'smooth' });
    }

    // ===== WINNER FORM SUBMISSION =====
    winnerFormEl.addEventListener('submit', async function(e) {
        e.preventDefault();

        var btn = this.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'SUBMITTING...';

        var data = {
            ticket_code: document.getElementById('winnerTicketCode').value,
            full_name: document.getElementById('winnerName').value,
            phone: document.getElementById('winnerPhone').value,
            ig_handle: document.getElementById('winnerIG').value,
            dob: document.getElementById('winnerDOB').value
        };

        try {
            var response = await fetch('api/submit_winner.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            var result = await response.json();

            if (result.success) {
                winnerMessage.textContent = '✅ Info submitted! We will reach out to you soon.';
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
        btn.textContent = 'SUBMIT MY INFO';
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
