// ── COUNTER ANIMATION ──
(function() {
  function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }

  function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const current = Math.round(eased * target);
      el.textContent = prefix + current.toLocaleString('en-IN') + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target.toLocaleString('en-IN') + suffix;
    }
    requestAnimationFrame(step);
  }

  // Observe stats when they enter viewport
  const statsObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        // small delay for drama
        const items = document.querySelectorAll('.hstat-num[data-count]');
        items.forEach((el, i) => {
          setTimeout(() => animateCounter(el), i * 180);
        });
        statsObs.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const statsEl = document.querySelector('.hero-stats');
  if (statsEl) statsObs.observe(statsEl);
})();

// ── STAGGERED PAIN CARD REVEAL ──
(function() {
  const painCards = document.querySelectorAll('.pain-card');
  painCards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(40px) scale(0.96)';
    card.style.transition = `opacity 0.6s ${i*0.1}s ease, transform 0.6s ${i*0.1}s cubic-bezier(0.23,1,0.32,1)`;
  });

  const painObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0) scale(1)';
        painObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  painCards.forEach(c => painObs.observe(c));
})();

// ── STAGGERED FEAT CARD REVEAL ──
(function() {
  const featCards = document.querySelectorAll('.feat-card');
  featCards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(50px) scale(0.95)';
    card.style.transition = `opacity 0.65s ${i*0.09}s ease, transform 0.65s ${i*0.09}s cubic-bezier(0.23,1,0.32,1)`;
  });

  const featObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0) scale(1)';
        featObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  featCards.forEach(c => featObs.observe(c));
})();

// ── TEAM CAROUSEL ──
(function() {
  const track = document.getElementById('teamTrack');
  const outer = document.getElementById('teamOuter');
  const dotsWrap = document.getElementById('teamDots');
  const progressFill = document.getElementById('teamProgress');
  const prevBtn = document.getElementById('teamPrev');
  const nextBtn = document.getElementById('teamNext');
  if (!track) return;

  const GAP = 24;
  let current = 0;
  let autoTimer = null;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartScroll = 0;

  function getVisible() {
    const w = window.innerWidth;
    if (w >= 1200) return 3;
    if (w >= 780) return 2;
    return 1;
  }

  function setCardWidths() {
    const vis = getVisible();
    const outerW = outer.offsetWidth;
    const cardW = (outerW - GAP * (vis - 1)) / vis;
    track.querySelectorAll('.team-card').forEach(c => {
      c.style.width = cardW + 'px';
      c.style.minWidth = cardW + 'px';
    });
  }

  function totalCards() { return track.querySelectorAll('.team-card').length; }
  function maxIndex() { return Math.max(0, totalCards() - getVisible()); }

  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i <= maxIndex(); i++) {
      const d = document.createElement('button');
      d.className = 'carousel-dot' + (i === current ? ' active' : '');
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }
  }

  function update() {
    const cards = track.querySelectorAll('.team-card');
    if (!cards.length) return;
    const cardW = cards[0].offsetWidth;
    const offset = current * (cardW + GAP);
    track.style.transform = `translateX(-${offset}px)`;
    dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    const pct = maxIndex() > 0 ? (current / maxIndex()) * 100 : 0;
    progressFill.style.width = pct + '%';
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= maxIndex();
  }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, maxIndex()));
    update();
  }

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(() => {
      goTo(current >= maxIndex() ? 0 : current + 1);
    }, 3500);
  }
  function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

  prevBtn.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  nextBtn.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });

  track.addEventListener('mousedown', e => {
    isDragging = true; dragStartX = e.clientX; dragStartScroll = current;
    track.classList.add('dragging'); stopAuto();
  });
  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const cards = track.querySelectorAll('.team-card');
    if (!cards.length) return;
    const diff = e.clientX - dragStartX;
    if (Math.abs(diff) > (cards[0].offsetWidth + GAP) / 3) {
      goTo(diff < 0 ? dragStartScroll + 1 : dragStartScroll - 1);
      isDragging = false; track.classList.remove('dragging'); startAuto();
    }
  });
  window.addEventListener('mouseup', () => {
    if (isDragging) { isDragging = false; track.classList.remove('dragging'); startAuto(); }
  });

  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; stopAuto(); }, {passive:true});
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
    startAuto();
  }, {passive:true});

  function init() {
    setCardWidths();
    current = Math.min(current, maxIndex());
    buildDots();
    update();
  }
  window.addEventListener('resize', init);
  init();
  startAuto();
})();

// ── PARTICLE CANVAS ──
(function() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = {x: -9999, y: -9999};

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function rand(a, b) { return a + Math.random() * (b - a); }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = rand(0, W);
      this.y = rand(0, H);
      this.size = rand(0.5, 2);
      this.speedX = rand(-0.4, 0.4);
      this.speedY = rand(-0.6, -0.1);
      this.opacity = rand(0.2, 0.8);
      this.color = Math.random() > 0.5 ? '155,92,246' : '236,72,153';
      this.life = 0;
      this.maxLife = rand(200, 500);
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;
      // mouse repel
      const dx = this.x - mouse.x, dy = this.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        this.x += (dx/dist) * force * 1.5;
        this.y += (dy/dist) * force * 1.5;
      }
      if (this.life > this.maxLife || this.y < -10 || this.x < -10 || this.x > W+10) this.reset();
    }
    draw() {
      const lifeRatio = this.life / this.maxLife;
      const fade = lifeRatio < 0.1 ? lifeRatio*10 : lifeRatio > 0.8 ? (1-lifeRatio)*5 : 1;
      ctx.save();
      ctx.globalAlpha = this.opacity * fade;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `rgba(${this.color},0.8)`;
      ctx.fillStyle = `rgba(${this.color},1)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Create particles
  for (let i = 0; i < 160; i++) particles.push(new Particle());

  // Connection lines
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i+1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 100) {
          ctx.save();
          ctx.globalAlpha = (1 - dist/100) * 0.12;
          ctx.strokeStyle = `rgba(155,92,246,1)`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();

  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  document.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
})();

// ── CURSOR GLOW ──
(function() {
  const glow = document.getElementById('cursorGlow');
  let tx = 0, ty = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
  function update() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    glow.style.left = cx + 'px';
    glow.style.top = cy + 'px';
    requestAnimationFrame(update);
  }
  update();
})();

// ── METEORS ──
(function() {
  const field = document.getElementById('meteorField');
  function spawnMeteor() {
    const m = document.createElement('div');
    m.className = 'meteor';
    const startX = Math.random() * 120 + '%';
    const dur = (Math.random() * 3 + 2) + 's';
    const delay = (Math.random() * 5) + 's';
    const len = Math.random() * 100 + 60;
    m.style.cssText = `left:${startX};height:${len}px;animation-duration:${dur};animation-delay:${delay};`;
    field.appendChild(m);
    setTimeout(() => m.remove(), (parseFloat(dur) + parseFloat(delay)) * 1000 + 500);
  }
  for (let i = 0; i < 6; i++) spawnMeteor();
  setInterval(spawnMeteor, 1200);
})();

// ── HEX NODES ──
(function() {
  const field = document.getElementById('hexField');
  const colors = ['rgba(155,92,246,0.7)', 'rgba(236,72,153,0.6)', 'rgba(124,58,237,0.5)'];
  function spawnHex() {
    const h = document.createElement('div');
    h.className = 'hex-node';
    const x = Math.random() * 100;
    const dur = (Math.random() * 10 + 8) + 's';
    const delay = (Math.random() * 4) + 's';
    const size = Math.random() * 6 + 3;
    h.style.cssText = `left:${x}%;bottom:0;width:${size}px;height:${size}px;background:${colors[Math.floor(Math.random()*colors.length)]};animation-duration:${dur};animation-delay:${delay};`;
    field.appendChild(h);
    setTimeout(() => h.remove(), (parseFloat(dur) + parseFloat(delay)) * 1000 + 500);
  }
  for (let i = 0; i < 12; i++) spawnHex();
  setInterval(spawnHex, 800);
})();

const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

// Load saved theme preference
const savedTheme = localStorage.getItem('cm-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('cm-theme', next);
});

// ── BACK TO TOP ──
(function() {
  const btn   = document.getElementById('backTop');
  const fill  = document.getElementById('bttFill');
  const CIRC  = 125.6; // 2π × r(20)

  function onScroll() {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    const pct      = total > 0 ? scrolled / total : 0;

    // show/hide
    if (scrolled > 300) btn.classList.add('visible');
    else                btn.classList.remove('visible');

    // update ring
    fill.style.strokeDashoffset = CIRC * (1 - pct);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── NAV ──
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
window.addEventListener('scroll', () => {
  document.getElementById('navbar').style.boxShadow = scrollY > 50 ? '0 4px 30px rgba(0,0,0,0.3)' : 'none';
});

// ── REVEAL ──
const obs = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 70);
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(r => obs.observe(r));

// ── EMAILJS INIT ──
// EmailJS setup: Service ID, Template ID, Public Key
// To activate: sign up at emailjs.com, create a service + template, paste IDs below
const EMAILJS_SERVICE_ID  = 'service_89wchcs';   // ← replace with your EmailJS Service ID
const EMAILJS_TEMPLATE_ID = 'template_hhrinx3'; // ← replace with your EmailJS Template ID
const EMAILJS_PUBLIC_KEY  = 'SmKpJ7MiGS7Ykw1Uy';        // ← replace with your EmailJS Public Key

emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

// ── FORM ──
async function submitForm() {
  const name    = document.getElementById('f-name').value.trim();
  const phone   = document.getElementById('f-phone').value.trim();
  const type    = document.getElementById('f-type').value;
  const email   = document.getElementById('f-email').value.trim();
  const college = document.getElementById('f-college').value.trim();
  const msg     = document.getElementById('f-msg').value.trim();
  const errEl   = document.getElementById('formError');
  const btnText = document.getElementById('btnText');
  const btnLoader = document.getElementById('btnLoader');
  const btn     = document.getElementById('submitBtn');

  // Validate
  errEl.style.display = 'none';
  if (!name || !phone || !type) {
    errEl.textContent = '⚠️ Please fill in your Name, Phone, and Role.';
    errEl.style.display = 'block';
    errEl.scrollIntoView({behavior:'smooth', block:'nearest'});
    return;
  }

  // Loading state
  btn.disabled = true;
  btnText.style.display = 'none';
  btnLoader.style.display = 'inline';

  // Build template params (must match your EmailJS template variables)
  const templateParams = {
    to_email:  'codemantra101@gmail.com',
    from_name:  name,
    phone:      phone,
    email:      email || 'Not provided',
    role:       type,
    college:    college || 'Not provided',
    message:    msg || 'No message',
    submitted_at: new Date().toLocaleString('en-IN', {timeZone:'Asia/Kolkata'}),
  };

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
    showSuccess(name, phone, email, type, college);
  } catch (err) {
    // Fallback: still show success + open WhatsApp so lead is never lost
    console.warn('EmailJS error:', err);
    const waMsg = encodeURIComponent(
      `Hi! I'd like to book a demo for Code Mantra 101.\n\nName: ${name}\nPhone: ${phone}\nRole: ${type}${college ? '\nCollege: '+college:''}${msg?'\nMessage: '+msg:''}`
    );
    window.open(`https://wa.me/917970724857?text=${waMsg}`, '_blank');
    showSuccess(name, phone, email, type, college);
  } finally {
    btn.disabled = false;
    btnText.style.display = 'inline';
    btnLoader.style.display = 'none';
  }
}

function showSuccess(name, phone, email, type, college) {
  // Build detail tags
  const details = document.getElementById('successDetails');
  const tags = [
    { icon:'👤', val: name },
    { icon:'📱', val: phone },
    { icon:'🎓', val: type },
  ];
  if (email)   tags.push({ icon:'✉️', val: email });
  if (college) tags.push({ icon:'🏫', val: college });

  details.innerHTML = tags.map(t =>
    `<span class="success-tag">${t.icon} ${t.val}</span>`
  ).join('');

  // Swap form → success
  document.getElementById('formWrap').style.display = 'none';
  const scr = document.getElementById('successMsg');
  scr.style.display = 'block';

  // Confetti burst
  spawnConfetti();
}

function spawnConfetti() {
  const wrap = document.getElementById('confettiWrap');
  const colors = ['#9B5CF6','#EC4899','#7C3AED','#F59E0B','#22D3A5','#60A5FA'];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    const size = Math.random() * 8 + 5;
    p.style.cssText = `
      left:${Math.random()*100}%;
      top:${Math.random()*30}%;
      width:${size}px;height:${size}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      border-radius:${Math.random()>0.5?'50%':'2px'};
      animation-duration:${Math.random()*1.5+1}s;
      animation-delay:${Math.random()*0.5}s;
      transform:rotate(${Math.random()*360}deg);
    `;
    wrap.appendChild(p);
    setTimeout(() => p.remove(), 3000);
  }
}