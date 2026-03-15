/* =====================================================
   VISHALI PORTFOLIO — script.js (White Theme Edition)
   ===================================================== */

document.addEventListener('DOMContentLoaded', function () {

  // ============================================
  // 1. THEME TOGGLE
  // ============================================
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon   = document.getElementById('themeIcon');
  const html        = document.documentElement;

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('vTheme', theme);
    if (themeIcon) themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
  setTheme(localStorage.getItem('vTheme') || 'light');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      setTheme(html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  // ============================================
  // 2. NAVBAR SCROLL
  // ============================================
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (!navbar) return;
    const isDark = html.getAttribute('data-theme') === 'dark';
    navbar.style.background = window.scrollY > 50
      ? (isDark ? 'rgba(17,17,16,0.97)' : 'rgba(250,250,248,0.98)')
      : '';
  });

  // ============================================
  // 3. HAMBURGER
  // ============================================
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  // ============================================
  // 4. SCROLL REVEAL
  // ============================================
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => obs.observe(el));
  }

  // ============================================
  // 5. ACTIVE NAV HIGHLIGHT
  // ============================================
  const navAnchors = document.querySelectorAll('.nav-links a');
  document.querySelectorAll('section[id]').forEach(s => {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        const id = s.getAttribute('id');
        navAnchors.forEach(a => {
          const active = a.getAttribute('href') === '#' + id;
          a.style.color      = active ? 'var(--ink)' : '';
          a.style.background = active ? 'var(--bg3)' : '';
        });
      }
    }, { threshold: 0.35 }).observe(s);
  });

  // ============================================
  // 6. SPIN WHEEL
  // ============================================
  const canvas  = document.getElementById('wheelCanvas');
  const spinBtn = document.getElementById('spinBtn');
  const spinNote = document.querySelector('.spin-note');

  // ---- Prize list (matches HTML prizes-list order) ----
  const segments = [
    { label: '₹500 OFF',          color: '#7C5CFC', text: '#fff', emoji: '🎁' },
    { label: '₹1000 OFF',         color: '#FF4F1F', text: '#fff', emoji: '🎉' },
    { label: '₹1500 OFF',         color: '#111110', text: '#fff', emoji: '🔥' },
    { label: '₹3500 Discount',    color: '#2C2C2A', text: '#fff', emoji: '💥' },
    { label: 'Free Documentation',color: '#2a9d8f', text: '#fff', emoji: '📄' },
    { label: 'Extra Documentation',color:'#e9c46a', text: '#111', emoji: '📚' },
    { label: 'No Offer',          color: '#D0CFCA', text: '#555', emoji: '😊' },
  ];

  const NUM = segments.length;
  const ARC = (2 * Math.PI) / NUM;
  let curA     = 0;
  let spinning = false;

  // Check localStorage — spin is ONE TIME EVER (not just session)
  const SPIN_KEY    = 'vishali_spin_done';
  const PRIZE_KEY   = 'vishali_prize';
  const alreadySpun = localStorage.getItem(SPIN_KEY) === '1';

  // If already spun, restore prize into form and disable button
  if (alreadySpun) {
    const savedPrize = localStorage.getItem(PRIZE_KEY);
    if (savedPrize) applyDiscountToForm(savedPrize);
    lockSpinButton();
  }

  if (!canvas || !spinBtn) {
    console.warn('Spin wheel canvas or button not found');
  } else {
    const ctx = canvas.getContext('2d');

    // ---- Draw ----
    function drawWheel(angle) {
      const W  = canvas.width;
      const H  = canvas.height;
      const cx = W / 2;
      const cy = H / 2;
      const r  = cx - 16;

      ctx.clearRect(0, 0, W, H);

      segments.forEach((seg, i) => {
        const st  = angle + i * ARC;
        const en  = st + ARC;
        const mid = st + ARC / 2;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, st, en);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.18)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(mid);
        ctx.textAlign    = 'right';
        ctx.fillStyle    = seg.text;
        ctx.font         = '600 11px sans-serif';
        ctx.fillText(seg.label, r - 14, 4);
        ctx.restore();
      });

      // Outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, r + 10, 0, 2 * Math.PI);
      const rg = ctx.createLinearGradient(0, 0, W, H);
      rg.addColorStop(0, '#FF4F1F');
      rg.addColorStop(1, '#FF8C42');
      ctx.strokeStyle = rg;
      ctx.lineWidth   = 9;
      ctx.stroke();

      // Thin separator
      ctx.beginPath();
      ctx.arc(cx, cy, r + 1, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.lineWidth   = 1;
      ctx.stroke();

      // Center disc
      ctx.beginPath();
      ctx.arc(cx, cy, 34, 0, 2 * Math.PI);
      ctx.fillStyle = '#111110';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      ctx.fillStyle    = '#FFFFFF';
      ctx.font         = '700 10px monospace';
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SPIN', cx, cy);
    }

    drawWheel(curA);

    // ---- Spin click ----
    spinBtn.addEventListener('click', function () {
      if (spinning) return;

      // ONE TIME EVER — locked in localStorage
      if (localStorage.getItem(SPIN_KEY) === '1') {
        showToast('You have already used your spin! Check the form for your discount.', 'info');
        // Scroll to form so they see their applied discount
        const formEl = document.getElementById('request');
        if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      spinning         = true;
      spinBtn.disabled = true;
      spinBtn.style.opacity = '0.6';

      const winIdx  = Math.floor(Math.random() * NUM);
      // Pointer sits at top = -π/2; calculate angle so winning segment centre aligns with it
      const winAngle  = -Math.PI / 2 - (winIdx * ARC + ARC / 2);
      const fullSpins = (6 + Math.floor(Math.random() * 3)) * 2 * Math.PI;
      const normDelta = ((winAngle - curA) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const delta     = fullSpins + normDelta;

      const dur    = 5000;
      const startT = performance.now();
      const startA = curA;

      function easeOut(t) { return 1 - Math.pow(1 - t, 4); }

      function frame(now) {
        const p = Math.min((now - startT) / dur, 1);
        curA = startA + delta * easeOut(p);
        drawWheel(curA);

        if (p < 1) { requestAnimationFrame(frame); return; }

        // Finished spinning
        spinning              = false;
        spinBtn.disabled      = false;
        spinBtn.style.opacity = '1';

        const prize = segments[winIdx];

        // Save permanently to localStorage
        localStorage.setItem(SPIN_KEY,  '1');
        localStorage.setItem(PRIZE_KEY, prize.label);

        // Lock the button visually
        lockSpinButton();

        // Auto-fill the form with the prize
        applyDiscountToForm(prize.label);

        // Show popup
        showResult(prize);
      }

      requestAnimationFrame(frame);
    });

    // ---- Popup ----
    function showResult(seg) {
      const overlay = document.getElementById('spinOverlay');
      if (!overlay) return;

      const noOffer = seg.label === 'No Offer';

      setEl('popupEmoji',  seg.emoji);
      setEl('popupResult', seg.label);
      setEl('popupTitle',  noOffer ? 'Better Luck Next Time!' : 'Congratulations! 🎊');
      setEl('popupMsg',    noOffer
        ? "You didn't win a discount this time — but our prices are already very competitive!"
        : 'You won ' + seg.label + '! It has been automatically added to the request form below.');

      // Change CTA text
      const cta = document.getElementById('popupCta');
      if (cta) cta.textContent = noOffer ? 'Request a Project →' : 'Claim in Form →';

      overlay.classList.add('active');
      if (!noOffer) launchConfetti();
    }

    const popupClose  = document.getElementById('popupClose');
    const spinOverlay = document.getElementById('spinOverlay');
    if (popupClose)  popupClose.addEventListener('click',  () => spinOverlay.classList.remove('active'));
    if (spinOverlay) spinOverlay.addEventListener('click', e => {
      if (e.target === spinOverlay) spinOverlay.classList.remove('active');
    });

    // Scroll to form when Claim button clicked
    const popupCta = document.getElementById('popupCta');
    if (popupCta) {
      popupCta.addEventListener('click', () => {
        spinOverlay.classList.remove('active');
        const formEl = document.getElementById('request');
        if (formEl) setTimeout(() => formEl.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
      });
    }
  }

  // ---- Lock spin button after use ----
  function lockSpinButton() {
    if (!spinBtn) return;
    spinBtn.disabled       = true;
    spinBtn.style.opacity  = '0.45';
    spinBtn.style.cursor   = 'not-allowed';
    spinBtn.innerHTML      = '<i class="fas fa-lock"></i> Already Spun';
    if (spinNote) spinNote.textContent = '// spin_used — check your discount in the form below';
  }

  // ---- Apply discount to form ----
  function applyDiscountToForm(prizeLabel) {
    const row    = document.getElementById('discountRow');
    const valEl  = document.getElementById('discountValue');
    const hidden = document.getElementById('discountWon');

    if (!row || !valEl || !hidden) return;

    valEl.textContent  = prizeLabel;
    hidden.value       = prizeLabel;
    row.style.display  = 'block';

    // Animate the row into view if the form is visible
    row.scrollIntoView && setTimeout(() => {
      row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
  }

  // ---- Utility: set element text ----
  function setEl(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ============================================
  // 7. CONFETTI
  // ============================================
  function launchConfetti() {
    const cc = document.getElementById('confettiCanvas');
    if (!cc) return;
    const c2  = cc.getContext('2d');
    cc.width  = window.innerWidth;
    cc.height = window.innerHeight;

    const colors = ['#FF4F1F','#111110','#7C5CFC','#FF8C42','#2a9d8f','#e9c46a','#ffffff'];
    const pieces = Array.from({ length: 220 }, () => ({
      x:     Math.random() * cc.width,
      y:     Math.random() * cc.height - cc.height,
      w:     Math.random() * 10 + 5,
      h:     Math.random() * 6  + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      speed: Math.random() * 4  + 2,
      angle: Math.random() * 360,
      spin:  (Math.random() - 0.5) * 6,
      drift: (Math.random() - 0.5) * 2,
    }));

    let frame = 0;
    function draw() {
      c2.clearRect(0, 0, cc.width, cc.height);
      pieces.forEach(p => {
        c2.save();
        c2.translate(p.x + p.w / 2, p.y + p.h / 2);
        c2.rotate(p.angle * Math.PI / 180);
        c2.fillStyle = p.color;
        c2.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        c2.restore();
        p.y += p.speed; p.x += p.drift; p.angle += p.spin;
      });
      if (++frame < 260) requestAnimationFrame(draw);
      else c2.clearRect(0, 0, cc.width, cc.height);
    }
    requestAnimationFrame(draw);
  }

  // ============================================
  // 8. FILE UPLOAD PREVIEW
  // ============================================
  const payInput   = document.getElementById('paymentScreenshot');
  const uploadArea = document.getElementById('uploadArea');
  const uploadPrev = document.getElementById('uploadPreview');

  if (payInput && uploadArea) {
    payInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        if (uploadPrev) uploadPrev.innerHTML =
          '<img src="' + ev.target.result + '" style="max-width:100%;border-radius:6px;margin-top:8px" alt="Payment screenshot"/>';
        uploadArea.style.borderColor = '#2a9d8f';
        const sp = uploadArea.querySelector('span');
        if (sp) sp.textContent = '✓ Screenshot uploaded';
      };
      reader.readAsDataURL(file);
    });

    uploadArea.addEventListener('dragover',  e => { e.preventDefault(); uploadArea.style.borderColor = 'var(--accent)'; });
    uploadArea.addEventListener('dragleave', () => { uploadArea.style.borderColor = ''; });
    uploadArea.addEventListener('drop', e => {
      e.preventDefault(); uploadArea.style.borderColor = '';
      const f = e.dataTransfer.files[0];
      if (f && f.type.startsWith('image/')) {
        payInput.files = e.dataTransfer.files;
        payInput.dispatchEvent(new Event('change'));
      }
    });
  }

  // ============================================
  // 9. FORM SUBMISSION + GOOGLE SHEETS
  // ============================================

  /**
   * GOOGLE SHEETS INTEGRATION — SETUP GUIDE
   * ----------------------------------------
   * STEP 1: Create a Google Sheet with these Row 1 headers:
   *   Full Name | Email | Phone | College | Course | Domain |
   *   Technology | Project Type | Features | Deadline | Budget |
   *   Deliverables | Discount Won | Additional | Timestamp
   *
   * STEP 2: Extensions → Apps Script → paste:
   *
   *   function doPost(e) {
   *     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
   *     var data  = JSON.parse(e.postData.contents);
   *     sheet.appendRow([
   *       data.fullName, data.email, data.phone, data.college,
   *       data.course, data.domain, data.tech, data.projectType,
   *       data.features, data.deadline, data.budget, data.deliverables,
   *       data.discountWon, data.additional, new Date().toLocaleString()
   *     ]);
   *     return ContentService
   *       .createTextOutput(JSON.stringify({ result: 'success' }))
   *       .setMimeType(ContentService.MimeType.JSON);
   *   }
   *
   * STEP 3: Deploy → New Deployment → Web App
   *   Execute as: Me | Access: Anyone
   *   Copy the URL and paste below ↓
   */
  const SHEETS_URL = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE';

  const projectForm = document.getElementById('projectForm');
  const successMsg  = document.getElementById('successMsg');
  const submitBtn2  = document.getElementById('submitBtn');
  const submitText  = document.getElementById('submitText');
  const submitLoad  = document.getElementById('submitLoading');

  if (projectForm) {
    projectForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      let valid = true;
      projectForm.querySelectorAll('[required]').forEach(f => {
        if (!f.value.trim()) {
          f.style.borderColor = '#FF4F1F';
          f.style.boxShadow   = '0 0 0 3px rgba(255,79,31,0.12)';
          valid = false;
          setTimeout(() => { f.style.borderColor = ''; f.style.boxShadow = ''; }, 3500);
        }
      });
      if (!valid) { showToast('Please fill in all required fields.', 'error'); return; }

      const deliverables = Array.from(
        projectForm.querySelectorAll('input[name="deliverables"]:checked')
      ).map(cb => cb.value).join(', ');

      // Read discount from localStorage (most reliable source)
      const discountWon = localStorage.getItem(PRIZE_KEY) || 'None';

      const formData = {
        fullName:    (document.getElementById('fullName')    || {}).value || '',
        email:       (document.getElementById('email')       || {}).value || '',
        phone:       (document.getElementById('phone')       || {}).value || '',
        college:     (document.getElementById('college')     || {}).value || '',
        course:      (document.getElementById('course')      || {}).value || '',
        domain:      (document.getElementById('domain')      || {}).value || '',
        tech:        (document.getElementById('tech')        || {}).value || '',
        projectType: (document.getElementById('projectType') || {}).value || '',
        features:    (document.getElementById('features')    || {}).value || '',
        deadline:    (document.getElementById('deadline')    || {}).value || '',
        budget:      (document.getElementById('budget')      || {}).value || '',
        deliverables,
        discountWon,
        additional:  (document.getElementById('additional')  || {}).value || '',
      };

      if (submitText)  submitText.style.display  = 'none';
      if (submitLoad)  submitLoad.style.display   = 'inline-flex';
      if (submitBtn2)  submitBtn2.disabled        = true;

      try {
        if (SHEETS_URL && !SHEETS_URL.includes('YOUR_GOOGLE')) {
          await fetch(SHEETS_URL, {
            method: 'POST', mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
        }
        projectForm.style.display = 'none';
        if (successMsg) {
          successMsg.style.display = 'block';
          successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } catch (err) {
        console.error(err);
        if (submitText) submitText.style.display  = 'inline-flex';
        if (submitLoad) submitLoad.style.display   = 'none';
        if (submitBtn2) submitBtn2.disabled        = false;
        showToast('Submission failed. Please try WhatsApp instead.', 'error');
      }
    });
  }

  // ============================================
  // 10. TOAST NOTIFICATION
  // ============================================
  function showToast(msg, type) {
    type = type || 'info';
    const colors = { error: '#FF4F1F', info: '#111110', success: '#2a9d8f' };
    const t = document.createElement('div');
    t.style.cssText = [
      'position:fixed', 'bottom:32px', 'right:32px',
      'background:' + (colors[type] || colors.info),
      'color:#fff', 'padding:14px 22px', 'border-radius:10px',
      "font-family:'Plus Jakarta Sans',sans-serif",
      'font-size:0.875rem', 'font-weight:500',
      'box-shadow:0 8px 32px rgba(0,0,0,0.18)',
      'z-index:9999', 'transform:translateY(80px)',
      'transition:transform 0.3s ease', 'max-width:320px', 'line-height:1.5'
    ].join(';');
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => { t.style.transform = 'translateY(0)'; });
    setTimeout(() => {
      t.style.transform = 'translateY(80px)';
      setTimeout(() => t.remove(), 320);
    }, 4000);
  }

}); // end DOMContentLoaded
