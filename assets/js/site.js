/* ==========================================================================
   Mohammed Nasser — portfolio behaviour
   Vanilla, dependency-free, progressive enhancement only: every section is
   fully readable with JS disabled. Shared by index.html and indexAr.html.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document.documentElement;
  var isAr = doc.lang === 'ar';
  var reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var T = isAr ? {
    jump: 'انتقال إلى', action: 'إجراء', project: 'مشروع', section: 'قسم',
    theme: 'تبديل المظهر', lang: 'التبديل إلى الإنجليزية', copy: 'نسخ البريد الإلكتروني',
    copied: 'تم نسخ البريد الإلكتروني', copyFail: 'تعذّر النسخ — mohmd1919@gmail.com',
    email: 'مراسلة عبر البريد', none: 'لا توجد نتائج'
  } : {
    jump: 'Jump to', action: 'Action', project: 'Project', section: 'Section',
    theme: 'Toggle theme', lang: 'Switch to Arabic', copy: 'Copy email address',
    copied: 'Email copied to clipboard', copyFail: 'Copy failed — mohmd1919@gmail.com',
    email: 'Send an email', none: 'No matches'
  };

  /* --- Theme ------------------------------------------------------------- */
  function setTheme(mode) {
    doc.setAttribute('data-theme', mode);
    try { localStorage.setItem('theme', mode); } catch (e) {}
    var b = $('#theme-toggle');
    if (b) b.setAttribute('aria-label', T.theme + ' (' + mode + ')');
  }
  function currentTheme() { return doc.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }
  var themeBtn = $('#theme-toggle');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    setTheme(currentTheme() === 'light' ? 'dark' : 'light');
  });

  /* --- Scroll progress + sticky nav -------------------------------------- */
  var nav = $('.nav');
  var bar = $('.progress');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var max = document.body.scrollHeight - innerHeight;
      if (bar) bar.style.setProperty('--p', max > 0 ? Math.min(scrollY / max, 1) : 0);
      if (nav) nav.toggleAttribute('data-stuck', scrollY > 8);
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --- Reveal on scroll --------------------------------------------------- */
  if ('IntersectionObserver' in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.setAttribute('data-in', ''); revealIO.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: .08 });
    $$('.reveal').forEach(function (el) { revealIO.observe(el); });
  } else {
    $$('.reveal').forEach(function (el) { el.setAttribute('data-in', ''); });
  }

  /* --- Active section in nav ---------------------------------------------- */
  var links = $$('.nav__link[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    var byId = {};
    links.forEach(function (l) { byId[l.getAttribute('href').slice(1)] = l; });
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var l = byId[e.target.id];
        if (!l) return;
        if (e.isIntersecting) {
          links.forEach(function (x) { x.removeAttribute('aria-current'); });
          l.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) { var s = document.getElementById(id); if (s) navIO.observe(s); });
  }

  /* --- Count-up metrics --------------------------------------------------- */
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    var decimals = (el.dataset.count.split('.')[1] || '').length;
    if (reduced.matches) { el.textContent = target.toFixed(decimals) + suffix; return; }
    var start = performance.now(), dur = 1400;
    (function step(now) {
      var t = Math.min((now - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (t < 1) requestAnimationFrame(step);
    })(start);
  }
  var counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var cIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { countUp(e.target); cIO.unobserve(e.target); }
      });
    }, { threshold: .6 });
    counters.forEach(function (el) { cIO.observe(el); });
  } else {
    counters.forEach(countUp);
  }

  /* --- Case-study accordion ----------------------------------------------- */
  $$('.case__btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (panel) panel.toggleAttribute('data-open', !open);
    });
  });

  /* --- Filters ------------------------------------------------------------ */
  var chips = $$('.chip');
  var cases = $$('.case');
  var emptyMsg = $('#cases-empty');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.dataset.filter;
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      var shown = 0;
      cases.forEach(function (c) {
        var match = f === 'all' || (c.dataset.cats || '').split(' ').indexOf(f) > -1;
        c.hidden = !match;
        if (match) shown++;
      });
      if (emptyMsg) emptyMsg.hidden = shown > 0;
    });
  });

  /* --- Copy email --------------------------------------------------------- */
  var toast = $('#toast');
  var toastTimer;
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.setAttribute('data-show', '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.removeAttribute('data-show'); }, 2400);
  }
  function copyEmail() {
    var mail = 'mohmd1919@gmail.com';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(mail).then(function () { say(T.copied); }, function () { say(T.copyFail); });
    } else {
      say(T.copyFail);
    }
  }
  $$('[data-copy-email]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); copyEmail(); });
  });

  /* --- Command palette ---------------------------------------------------- */
  var pal = $('#cmdk');
  if (pal) {
    var input = $('#cmdk-input');
    var list = $('#cmdk-list');
    var lastFocus = null;
    var active = 0;
    var items = [];

    $$('section[id] h2.section__title, header[id] h1').forEach(function (h) {
      var sec = h.closest('section[id], header[id]');
      if (!sec) return;
      var label = sec.getAttribute('data-cmdk-label') || h.textContent.replace(/\s+/g, ' ').trim();
      items.push({ label: label, kind: T.section, icon: '#', run: function () { go('#' + sec.id); } });
    });
    $$('.case').forEach(function (c) {
      var name = $('.case__name', c);
      var btn = $('.case__btn', c);
      if (!name || !btn) return;
      items.push({
        label: name.textContent.trim(), kind: T.project, icon: '</>',
        run: function () {
          chips.forEach(function (ch) { ch.setAttribute('aria-pressed', String(ch.dataset.filter === 'all')); });
          cases.forEach(function (x) { x.hidden = false; });
          if (emptyMsg) emptyMsg.hidden = true;
          if (btn.getAttribute('aria-expanded') !== 'true') btn.click();
          c.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'center' });
          btn.focus({ preventScroll: true });
        }
      });
    });
    items.push({ label: T.theme, kind: T.action, icon: '◐', run: function () { setTheme(currentTheme() === 'light' ? 'dark' : 'light'); } });
    items.push({ label: T.copy, kind: T.action, icon: '@', run: copyEmail });
    items.push({ label: T.email, kind: T.action, icon: '✉', run: function () { location.href = 'mailto:mohmd1919@gmail.com'; } });
    items.push({ label: T.lang, kind: T.action, icon: isAr ? 'EN' : 'ع', run: function () { location.href = isAr ? 'index.html' : 'indexAr.html'; } });
    items.push({ label: 'LinkedIn', kind: T.action, icon: 'in', run: function () { open('https://linkedin.com/in/mohmdalfaha', '_blank', 'noopener'); } });
    items.push({ label: 'GitHub', kind: T.action, icon: 'git', run: function () { open('https://github.com/mohmdalfaha', '_blank', 'noopener'); } });

    function go(hash) {
      var el = document.querySelector(hash);
      if (el) el.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' });
    }
    function score(item, q) {
      var l = item.label.toLowerCase();
      if (!q) return 1;
      if (l.indexOf(q) === 0) return 3;
      if (l.indexOf(q) > -1) return 2;
      var i = 0;
      for (var c = 0; c < l.length && i < q.length; c++) if (l[c] === q[i]) i++;
      return i === q.length ? 1 : 0;
    }
    function render() {
      var q = input.value.trim().toLowerCase();
      var hits = items.map(function (it) { return { it: it, s: score(it, q) }; })
        .filter(function (h) { return h.s > 0; })
        .sort(function (a, b) { return b.s - a.s; })
        .map(function (h) { return h.it; });
      list.innerHTML = '';
      active = 0;
      if (!hits.length) {
        var li = document.createElement('li');
        li.className = 'empty';
        li.textContent = T.none;
        list.appendChild(li);
        return;
      }
      hits.forEach(function (it, i) {
        var li = document.createElement('li');
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'cmdk__item';
        b.setAttribute('role', 'option');
        b.id = 'cmdk-opt-' + i;
        if (i === 0) { b.setAttribute('data-active', ''); b.setAttribute('aria-selected', 'true'); }
        b.innerHTML = '<span class="cmdk__ico" aria-hidden="true"></span><span class="cmdk__label"></span><span class="cmdk__kind"></span>';
        $('.cmdk__ico', b).textContent = it.icon;
        $('.cmdk__label', b).textContent = it.label;
        $('.cmdk__kind', b).textContent = it.kind;
        b.addEventListener('click', function () { close(); it.run(); });
        li.appendChild(b);
        list.appendChild(li);
      });
      sync();
    }
    function options() { return $$('.cmdk__item', list); }
    function sync() {
      var opts = options();
      opts.forEach(function (o, i) {
        o.toggleAttribute('data-active', i === active);
        o.setAttribute('aria-selected', String(i === active));
      });
      if (opts[active]) {
        input.setAttribute('aria-activedescendant', opts[active].id);
        opts[active].scrollIntoView({ block: 'nearest' });
      }
    }
    function open_() {
      lastFocus = document.activeElement;
      pal.setAttribute('data-open', '');
      pal.setAttribute('aria-hidden', 'false');
      input.value = '';
      render();
      input.focus();
    }
    function close() {
      pal.removeAttribute('data-open');
      pal.setAttribute('aria-hidden', 'true');
      input.removeAttribute('aria-activedescendant');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    $$('[data-cmdk-open]').forEach(function (b) { b.addEventListener('click', open_); });
    pal.addEventListener('click', function (e) { if (e.target === pal) close(); });
    input.addEventListener('input', render);
    input.addEventListener('keydown', function (e) {
      var opts = options();
      if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % opts.length; sync(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + opts.length) % opts.length; sync(); }
      else if (e.key === 'Enter') { e.preventDefault(); if (opts[active]) opts[active].click(); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'Tab') { e.preventDefault(); }
    });
    addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); pal.hasAttribute('data-open') ? close() : open_(); }
      else if (e.key === 'Escape' && pal.hasAttribute('data-open')) close();
    });
    if (navigator.platform && /Mac|iPhone|iPad/.test(navigator.platform)) {
      $$('[data-mod]').forEach(function (k) { k.textContent = '⌘'; });
    }
  }

  /* --- Hero signal field --------------------------------------------------
     A drifting node/edge network: distributed-systems texture rather than
     decoration. Static single frame when the visitor prefers reduced motion. */
  var cv = $('#field');
  if (cv && cv.getContext) {
    var ctx = cv.getContext('2d');
    var nodes = [], w = 0, h = 0, dpr = 1, raf = 0;
    var pointer = { x: -9999, y: -9999, on: false };

    function accent() {
      return getComputedStyle(doc).getPropertyValue('--accent').trim() || '#5b8cff';
    }
    function rgb() {
      var c = accent();
      if (c.charAt(0) === '#') {
        var n = c.length === 4
          ? c.slice(1).split('').map(function (x) { return parseInt(x + x, 16); })
          : [parseInt(c.substr(1, 2), 16), parseInt(c.substr(3, 2), 16), parseInt(c.substr(5, 2), 16)];
        return n.join(',');
      }
      return '91,140,255';
    }
    function resize() {
      var r = cv.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(28, Math.min(78, Math.round(w * h / 15000)));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w, y: Math.random() * h,
          vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22,
          r: Math.random() * 1.5 + .8
        });
      }
    }
    function draw() {
      var c = rgb();
      ctx.clearRect(0, 0, w, h);
      var link = Math.min(150, w * .16);
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < link) {
            ctx.strokeStyle = 'rgba(' + c + ',' + (.24 * (1 - d / link)).toFixed(3) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        var near = pointer.on ? Math.hypot(a.x - pointer.x, a.y - pointer.y) : 9999;
        var lit = near < 130;
        ctx.fillStyle = 'rgba(' + c + ',' + (lit ? .95 : .5) + ')';
        ctx.beginPath();
        ctx.arc(a.x, a.y, lit ? a.r * 1.8 : a.r, 0, 6.2832);
        ctx.fill();
        if (lit) {
          ctx.strokeStyle = 'rgba(' + c + ',' + (.4 * (1 - near / 130)).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(pointer.x, pointer.y); ctx.stroke();
        }
      }
    }
    function tick() {
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
      }
      draw();
      raf = requestAnimationFrame(tick);
    }
    function start() {
      cancelAnimationFrame(raf);
      if (reduced.matches) draw(); else raf = requestAnimationFrame(tick);
    }
    var rt;
    addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { resize(); start(); }, 180);
    });
    cv.addEventListener('pointermove', function (e) {
      var r = cv.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.on = true;
    });
    cv.addEventListener('pointerleave', function () { pointer.on = false; });
    if (reduced.addEventListener) reduced.addEventListener('change', start);
    // Pause the loop while the hero is off-screen or the tab is hidden.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        en[0].isIntersecting ? start() : cancelAnimationFrame(raf);
      }, { threshold: 0 }).observe(cv);
    }
    addEventListener('visibilitychange', function () {
      document.hidden ? cancelAnimationFrame(raf) : start();
    });
    resize();
    start();
  }

  /* --- Current year -------------------------------------------------------- */
  var y = $('#year');
  if (y) y.textContent = new Date().getFullYear();
})();
