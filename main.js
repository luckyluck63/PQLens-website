/* PQLens website scripts */
(function () {
  'use strict';

  // ---- Settings: change the contact address here -------------------------
  var CONTACT_EMAIL = 'sakzad.amin@gmail.com';
  // ------------------------------------------------------------------------

  document.documentElement.classList.add('js');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Footer year
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Mobile navigation
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      }
    });
  }

  // Reveal on scroll
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Tabs (outputs)
  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') next = tabs[0];
        if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
  });

  // Contact form: compose an email (static hosting has no server)
  document.querySelectorAll('[data-contact-link]').forEach(function (a) {
    a.href = 'mailto:' + CONTACT_EMAIL;
  });
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name, email = form.elements.email;
      var ok = true;
      [name, email].forEach(function (f) {
        var valid = f.value.trim() !== '' && (f.type !== 'email' || /.+@.+\..+/.test(f.value));
        f.setAttribute('aria-invalid', String(!valid));
        if (!valid) ok = false;
      });
      var note = document.getElementById('form-note');
      if (!ok) {
        note.textContent = 'Please add your name and a valid work email.';
        (name.value.trim() === '' ? name : email).focus();
        return;
      }
      var org = form.elements.organisation.value.trim();
      var subject = 'PQLens enquiry' + (org ? ' from ' + org : '');
      var body = form.elements.message.value.trim() + '\n\n' + name.value.trim() +
        (org ? '\n' + org : '') + '\n' + email.value.trim();
      window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' +
        encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      note.textContent = 'Your email app should open now. If it does not, write to ' + CONTACT_EMAIL + '.';
    });
  }

  // ---- Lamp resilience animation -----------------------------------------
  var canvas = document.getElementById('lamps');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var stepEl = document.getElementById('lamp-step');
  var textEl = document.getElementById('lamp-text');

  var LW = 640, LH = 440;               // logical drawing size
  var COLS = 10, ROWS = 6, PITCH = 50;
  var GX = (LW - COLS * PITCH) / 2 + PITCH / 2, GY = 44;
  var N = COLS * ROWS, FPS = 15, LOOP = 486;
  var BG = '#10172A';
  var S1 = [12, 25, 33, 47, 56];              // degraded by AI-assisted attacks
  var S2 = [3, 18, 29, 41, 52, 8, 36];        // harvest-now, decrypt-later risk
  var CL = [];                                // Q-day cluster
  for (var r = 1; r < 5; r++) for (var c = 5; c < 9; c++) CL.push(r * COLS + c);

  function lp(i) { return [GX + (i % COLS) * PITCH, GY + Math.floor(i / COLS) * PITCH]; }
  function ease(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }
  function ramp(f, a, b) { return ease((f - a) / (b - a)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function mix(a, b, t) {
    return 'rgb(' + [0, 1, 2].map(function (k) { return Math.round(a[k] + (b[k] - a[k]) * t); }).join(',') + ')';
  }
  var OFF = [27, 35, 56], OFFST = [70, 82, 110], ON = [255, 231, 160], WHITE = [255, 255, 255];
  var TEAL = [46, 230, 197], VIO = [157, 140, 255], BGC = [16, 23, 42];
  var clusterC = (function () {
    var x = 0, y = 0;
    CL.forEach(function (i) { var p = lp(i); x += p[0]; y += p[1]; });
    return [x / CL.length, y / CL.length];
  })();

  // Glow sprite
  var glow = document.createElement('canvas');
  var GR = 26; glow.width = glow.height = GR * 2;
  (function () {
    var g = glow.getContext('2d');
    var grad = g.createRadialGradient(GR, GR, 0, GR, GR, GR);
    grad.addColorStop(0, 'rgba(255,201,74,0.85)');
    grad.addColorStop(0.5, 'rgba(255,178,46,0.28)');
    grad.addColorStop(1, 'rgba(255,178,46,0)');
    g.fillStyle = grad; g.fillRect(0, 0, GR * 2, GR * 2);
  })();

  function lampState(i, f) {
    var b = ramp(f, 2 + i * 0.35, 10 + i * 0.35), s = 1, ring = null, tri = 0, hl = 0, k, t0;
    if ((k = S1.indexOf(i)) > -1) {
      b *= lerp(1, 0.3, ramp(f, 40, 62));
      hl = ramp(f, 72 + k * 5, 78 + k * 5) * (1 - ramp(f, 100 + k * 7, 104 + k * 7));
      t0 = 100 + k * 7;
      if (f >= t0 && f < t0 + 5) s = 1 - ramp(f, t0, t0 + 5);
      else if (f >= t0 + 5) {
        s = f < t0 + 11 ? Math.min(1, ramp(f, t0 + 5, t0 + 11) * 1.15) : 1;
        b = 1;
        if (f < t0 + 22) ring = [VIO, ramp(f, t0 + 5, t0 + 22)];
      }
    }
    if ((k = S2.indexOf(i)) > -1) {
      var a = 160 + k * 3;
      tri = ramp(f, a, a + 5);
      b *= lerp(1, 0.55, ramp(f, a, a + 6));
      t0 = 188 + k * 9;
      if (f >= t0) {
        tri *= 1 - ramp(f, t0, t0 + 6);
        b = lerp(0.55, 1, ramp(f, t0 + 2, t0 + 9));
        if (f < t0 + 16) ring = [TEAL, ramp(f, t0 + 2, t0 + 16)];
      }
    }
    if (CL.indexOf(i) > -1) {
      var p = lp(i);
      if (f >= 286) b = 0;
      var d = Math.hypot(p[0] - clusterC[0], p[1] - clusterC[1]) / (PITCH * 2.6);
      t0 = 338 + d * 30;
      if (f >= t0) {
        b = ramp(f, t0, t0 + 6);
        if (f < t0 + 16) ring = [VIO, ramp(f, t0, t0 + 16)];
      }
    }
    if (f >= 430) b = Math.min(1, b * (0.97 + 0.03 * Math.sin((f - 430) / 3 + i * 0.7)));
    return { b: b, s: s, ring: ring, tri: tri, hl: hl };
  }

  function drawLamp(i, f) {
    var st = lampState(i, f), p = lp(i), x = p[0], y = p[1];
    if (st.b > 0.02 && st.s > 0.05) {
      ctx.globalAlpha = st.b * st.s;
      ctx.drawImage(glow, x - GR, y - GR);
      ctx.globalAlpha = 1;
    }
    var R = 13 * st.s;
    if (R > 0.5) {
      ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2);
      ctx.fillStyle = mix(OFF, ON, st.b); ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = mix(OFFST, ON, st.b); ctx.stroke();
      if (st.b > 0.3) {
        ctx.beginPath(); ctx.arc(x - R * 0.3, y - R * 0.3, R * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + (0.45 * st.b).toFixed(2) + ')'; ctx.fill();
      }
    }
    if (st.hl > 0.01) {
      ctx.strokeStyle = mix(BGC, VIO, st.hl); ctx.lineWidth = 3;
      for (var a0 = 0; a0 < 360; a0 += 45) {
        ctx.beginPath(); ctx.arc(x, y, 19, a0 * Math.PI / 180, (a0 + 28) * Math.PI / 180); ctx.stroke();
      }
    }
    if (st.ring) {
      var t = st.ring[1], rr = 14 + 16 * t;
      ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2);
      ctx.strokeStyle = mix(st.ring[0], BGC, t); ctx.lineWidth = 3; ctx.stroke();
    }
    if (st.tri > 0.01) {
      var sc = st.tri, ty = y + 2;
      ctx.beginPath(); ctx.moveTo(x, ty - 14 * sc); ctx.lineTo(x + 15 * sc, ty + 12 * sc); ctx.lineTo(x - 15 * sc, ty + 12 * sc); ctx.closePath();
      ctx.fillStyle = '#FF9F1C'; ctx.fill(); ctx.strokeStyle = BG; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = BG; ctx.fillRect(x - 1.8 * sc, ty - 6 * sc, 3.6 * sc, 10 * sc);
      ctx.beginPath(); ctx.arc(x, ty + 8.5 * sc, 2 * sc, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawLens(x, y, sz) {
    var r = sz * 0.31, w = Math.max(2, sz * 0.09);
    ctx.lineCap = 'round'; ctx.lineWidth = w;
    for (var k = 0; k < 6; k++) {
      var a0 = (-78 + k * 60) * Math.PI / 180, a1 = a0 + 36 * Math.PI / 180, dx = k === 1 ? sz * 0.045 : 0;
      ctx.beginPath(); ctx.arc(x + dx, y, r, a0, a1);
      ctx.strokeStyle = k === 1 ? '#9D8CFF' : '#2EE6C5'; ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(x + r * 0.707, y + r * 0.707); ctx.lineTo(x + sz * 0.38, y + sz * 0.38);
    ctx.strokeStyle = '#2EE6C5'; ctx.stroke();
    for (var i = -1; i <= 1; i++) for (var j = -1; j <= 1; j++) {
      var centre = i === 0 && j === 0;
      ctx.beginPath(); ctx.arc(x + i * sz * 0.1, y + j * sz * 0.1, sz * (centre ? 0.03 : 0.02), 0, Math.PI * 2);
      ctx.fillStyle = centre ? '#9D8CFF' : '#5C6890'; ctx.fill();
    }
    ctx.lineCap = 'butt';
  }

  function seg(pts, times, f) {
    for (var j = 0; j < times.length - 1; j++) {
      if (f >= times[j] && f < times[j + 1]) {
        var u = ease((f - times[j]) / (times[j + 1] - times[j]));
        return [lerp(pts[j][0], pts[j + 1][0], u), lerp(pts[j][1], pts[j + 1][1], u)];
      }
    }
    return null;
  }
  function lensPos(f) {
    var k, pts, times;
    if (f >= 64 && f < 136) {
      pts = [[-80, GY + PITCH * 2]]; times = [64];
      for (k = 0; k < S1.length; k++) { pts.push(lp(S1[k])); times.push(72 + k * 6); }
      pts.push([LW + 80, GY + PITCH * 3]); times.push(136);
      return seg(pts, times, f);
    }
    if (f >= 176 && f < 256) {
      pts = [[-80, GY]]; times = [176];
      for (k = 0; k < S2.length; k++) { pts.push(lp(S2[k])); times.push(188 + k * 9); }
      pts.push([LW + 80, GY]); times.push(256);
      return seg(pts, times, f);
    }
    if (f >= 316 && f < 392) {
      if (f < 336) return [lerp(-80, clusterC[0], ease((f - 316) / 20)), clusterC[1]];
      if (f < 376) return clusterC;
      return [lerp(clusterC[0], LW + 100, ease((f - 376) / 16)), clusterC[1]];
    }
    return null;
  }

  var CAPS = [
    [0, 36, 'Resilience', 'Every lamp is a stream of digital payments protected by cryptography.'],
    [36, 64, '1 · AI-assisted attacks', 'Some lamps degrade: their cryptography is weakened.'],
    [64, 100, '1 · PQLens identifies', 'Continuous inventory finds every degraded lamp.'],
    [100, 156, '1 · PQLens replaces', 'The weak algorithm is swapped out. Light restored.'],
    [156, 184, '2 · Harvest now, decrypt later', 'Risk triangles: today’s traffic could be decrypted tomorrow.'],
    [184, 276, '2 · PQLens removes the risk', 'Post-quantum key exchange: the lamps shine bright again.'],
    [276, 316, '3 · Q-day', 'A whole cluster goes dark at once.'],
    [316, 376, '3 · PQLens acts', 'Crypto-agile by design: the cluster is re-keyed with PQC.'],
    [376, 430, '3 · Back online', 'Post-quantum signatures and keys restore trust.'],
    [430, 486, 'PQLens', 'Resilient, crypto-agile trust for digital finance.']
  ];
  var lastCap = -1;
  function caption(f) {
    for (var i = CAPS.length - 1; i >= 0; i--) {
      if (f >= CAPS[i][0]) {
        if (i !== lastCap) { lastCap = i; stepEl.textContent = CAPS[i][2]; textEl.textContent = CAPS[i][3]; }
        return;
      }
    }
  }

  function resize() {
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    var scale = Math.min(canvas.width / LW, canvas.height / (LH - 10));
    var ox = (canvas.width - LW * scale) / 2;
    ctx.setTransform(scale, 0, 0, scale, ox, 0);
  }

  function frame(f) {
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = BG; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.restore();
    for (var i = 0; i < N; i++) drawLamp(i, f);
    if (f >= 284 && f < 290) {
      ctx.fillStyle = 'rgba(255,255,255,' + (0.55 * (1 - (f - 284) / 6)).toFixed(2) + ')';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(clusterC[0] - PITCH * 2.4, clusterC[1] - PITCH * 2.4, PITCH * 4.8, PITCH * 4.8, 16)
                    : ctx.rect(clusterC[0] - PITCH * 2.4, clusterC[1] - PITCH * 2.4, PITCH * 4.8, PITCH * 4.8);
      ctx.fill();
    }
    if (f >= 336 && f < 380) {
      for (var k = 0; k < 3; k++) {
        var t = ((f - 336) / 22 + k / 3) % 1, rr = 20 + 140 * t;
        ctx.beginPath(); ctx.arc(clusterC[0], clusterC[1], rr, 0, Math.PI * 2);
        ctx.strokeStyle = mix(VIO, BGC, t); ctx.lineWidth = 3; ctx.stroke();
      }
    }
    var p = lensPos(f);
    if (p) drawLens(p[0], p[1], 92);
    caption(f);
  }

  resize();
  window.addEventListener('resize', function () { resize(); if (reduceMotion) frame(470); });

  if (reduceMotion) {
    frame(470);
    stepEl.textContent = 'Resilience';
    textEl.textContent = 'PQLens finds degraded lamps, removes quantum risk and relights what Q-day switches off.';
    return;
  }

  var running = true, start = null, raf = null;
  function tick(ts) {
    if (start === null) start = ts;
    var f = Math.floor(((ts - start) / 1000) * FPS) % LOOP;
    frame(f);
    raf = requestAnimationFrame(tick);
  }
  function play() { if (!raf) { start = null; raf = requestAnimationFrame(tick); } }
  function pause() { if (raf) { cancelAnimationFrame(raf); raf = null; } }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      running = es[0].isIntersecting;
      if (running && !document.hidden) play(); else pause();
    }).observe(canvas);
  } else { play(); }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) pause(); else if (running) play();
  });
})();
