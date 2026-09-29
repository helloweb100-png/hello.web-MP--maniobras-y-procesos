/* ==========================================================================
   MP MANIOBRAS Y PROCESOS — script.js
   Sin dependencias. Módulos (cada uno se inicia al final del archivo):
   loader · scroll suave · navegación · reveal · hero (3D + partículas) ·
   manifiesto · parallax · servicios (scroll horizontal) · proceso ·
   efectos de cursor · FAQ · galería · configurador · formulario · WhatsApp
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Configuración del negocio ---------- */
  var WA_NUMBER = '5215536967112';           // +52 1 55 3696 7112
  var waLink = function (msg) { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg); };

  /* ---------- Utilidades ---------- */
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };
  var easeIO = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };

  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;
  var navH = 68;

  try { if ('scrollRestoration' in history && !location.hash) history.scrollRestoration = 'manual'; } catch (e) {}

  /* ==========================================================================
     LOADER
     ========================================================================== */
  var loaderDone = false;
  var onReadyCbs = [];
  function whenReady(fn) { loaderDone ? fn() : onReadyCbs.push(fn); }

  function initLoader() {
    var loader = $('#loader');
    if (!loader) { finish(true); return; }
    var pctEl = $('#ldPct'), prog = $('#ldProg'), bar = $('#ldBar'), status = $('#ldStatus');
    var CIRC = 603.19;
    var MIN = reduced ? 500 : 2600;
    var t0 = performance.now();
    var loaded = document.readyState === 'complete';
    var fontsOk = false;
    var lastMsg = '';
    var msgs = ['Midiendo…', 'Cortando perfiles…', 'Templando el cristal…', 'Instalando…', 'Listo'];

    if (!loaded) window.addEventListener('load', function () { loaded = true; });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fontsOk = true; }); else fontsOk = true;
    var hardStop = t0 + 6500;

    (function step(now) {
      var timeP = clamp((now - t0) / MIN, 0, 1);
      var gate = (loaded && fontsOk) || now > hardStop;
      var p = easeIO(timeP) * (gate ? 1 : .9);
      p = Math.min(p, gate ? 1 : .9);
      if (pctEl) pctEl.textContent = Math.round(p * 100);
      if (prog) prog.style.strokeDashoffset = String(CIRC * (1 - p));
      if (bar) bar.style.transform = 'scaleX(' + p + ')';
      var m = msgs[p >= 1 ? 4 : Math.min(3, Math.floor(p * 4))];
      if (status && m !== lastMsg) { status.textContent = m; lastMsg = m; }
      if (p >= 1) { setTimeout(function () { finish(false); }, 350); return; }
      requestAnimationFrame(step);
    })(performance.now());

    function finish(instant) {
      if (loaderDone) return;
      loaderDone = true;
      if (!instant && loader) {
        loader.classList.add('is-done');
        setTimeout(function () { loader.classList.add('is-gone'); }, 1500);
      }
      root.classList.remove('is-loading');
      root.classList.add('is-ready');
      onReadyCbs.splice(0).forEach(function (fn) { try { fn(); } catch (e) { console.error(e); } });
    }
    // Red de seguridad por si algo falla
    setTimeout(function () { finish(false); }, 9000);
  }

  /* ==========================================================================
     SCROLL SUAVE (rueda del mouse) + anclas
     ========================================================================== */
  var smooth = { on: false, cur: 0, tgt: 0, raf: 0 };
  function maxScroll() { return Math.max(0, root.scrollHeight - window.innerHeight); }
  function scrollLocked() { return root.classList.contains('is-locked') || root.classList.contains('is-loading'); }

  function initSmoothScroll() {
    smooth.on = !reduced && !coarse;
    smooth.cur = smooth.tgt = window.scrollY;

    function loop() {
      smooth.cur = lerp(smooth.cur, smooth.tgt, .085);
      if (Math.abs(smooth.tgt - smooth.cur) < .4) smooth.cur = smooth.tgt;
      window.scrollTo(0, smooth.cur);
      smooth.raf = smooth.cur === smooth.tgt ? 0 : requestAnimationFrame(loop);
    }
    function kick() { if (!smooth.raf) smooth.raf = requestAnimationFrame(loop); }
    function stop() { if (smooth.raf) cancelAnimationFrame(smooth.raf); smooth.raf = 0; smooth.cur = smooth.tgt = window.scrollY; }

    if (smooth.on) {
      window.addEventListener('wheel', function (e) {
        if (e.ctrlKey || e.defaultPrevented || scrollLocked()) return;
        if (e.target.closest && e.target.closest('textarea, select, .menu__inner, .lb')) return;
        e.preventDefault();
        var d = e.deltaMode === 1 ? e.deltaY * 34 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
        if (!smooth.raf) smooth.cur = smooth.tgt = window.scrollY;
        smooth.tgt = clamp(smooth.tgt + d, 0, maxScroll());
        kick();
      }, { passive: false });
      window.addEventListener('keydown', function (e) {
        if ([' ', 'PageDown', 'PageUp', 'Home', 'End', 'ArrowDown', 'ArrowUp'].indexOf(e.key) > -1) stop();
      });
      window.addEventListener('pointerdown', stop, { passive: true });
      window.addEventListener('scroll', function () { if (!smooth.raf) smooth.cur = smooth.tgt = window.scrollY; }, { passive: true });
    }

    window.__scrollToY = function (y) {
      y = clamp(y, 0, maxScroll());
      if (smooth.on) { smooth.tgt = y; if (!smooth.raf) smooth.cur = window.scrollY; kick(); }
      else window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
    };

    // Enlaces internos
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = document.getElementById(id.slice(1));
      if (!el) return;
      e.preventDefault();
      closeMenu();
      var top = el.getBoundingClientRect().top + window.scrollY;
      var y = top;
      if (id === '#inicio') y = 0;
      else if (!el.hasAttribute('data-hscroll')) {
        var pt = parseFloat(getComputedStyle(el).paddingTop) || 0;
        y = top + pt - navH - 40;
      }
      window.__scrollToY(Math.max(0, y));
      try { history.replaceState(null, '', id); } catch (err) {}
    });
  }

  /* ==========================================================================
     NAVEGACIÓN + MENÚ MÓVIL
     ========================================================================== */
  var nav, burger, menu;
  function openMenu() {
    burger.setAttribute('aria-expanded', 'true'); burger.setAttribute('aria-label', 'Cerrar menú');
    menu.classList.add('is-open'); menu.setAttribute('aria-hidden', 'false');
    nav.classList.add('is-menu'); root.classList.add('is-locked');
  }
  function closeMenu() {
    if (!menu || !menu.classList.contains('is-open')) return;
    burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Abrir menú');
    menu.classList.remove('is-open'); menu.setAttribute('aria-hidden', 'true');
    nav.classList.remove('is-menu'); root.classList.remove('is-locked');
  }
  function initNav() {
    nav = $('#nav'); burger = $('#burger'); menu = $('#menu');
    if (!nav) return;
    navH = nav.offsetHeight || 68;
    $$('.menu__nav a', menu).forEach(function (a, i) { a.style.setProperty('--i', i); });
    burger.addEventListener('click', function () { menu.classList.contains('is-open') ? closeMenu() : openMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
    $$('a[data-wa]', menu).forEach(function () {});
    window.addEventListener('resize', function () { if (window.innerWidth >= 1024) closeMenu(); });

    // Sección activa
    var links = $$('.nav__links a');
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          links.forEach(function (l) { l.classList.remove('is-active'); });
          var l = map[en.target.id]; if (l) l.classList.add('is-active');
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
    }
  }

  /* ==========================================================================
     REVEAL AL HACER SCROLL
     ========================================================================== */
  function initReveal() {
    var els = $$('[data-reveal]');
    $$('[data-stagger]').forEach(function (p) {
      $$('[data-reveal]', p).forEach(function (c, i) { c.style.setProperty('--d', (i * 0.09).toFixed(2) + 's'); });
    });
    if (!('IntersectionObserver' in window) || reduced) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        el.classList.add('is-in');
        io.unobserve(el);
        // Tras animar, se libera el elemento para que sus propios hover/transiciones funcionen
        setTimeout(function () { el.removeAttribute('data-reveal'); el.style.removeProperty('--d'); }, 1900);
      });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ==========================================================================
     HERO: contadores · palabra rotatoria · cotas · muro 3D · partículas
     ========================================================================== */
  function animateCount(el, to, dur, pad, from) {
    var s = performance.now(); from = from || 0;
    (function f(now) {
      var t = clamp((now - s) / dur, 0, 1);
      var v = Math.round(lerp(from, to, easeOut(t)));
      el.textContent = pad ? String(v).padStart(pad, '0') : String(v);
      if (t < 1) requestAnimationFrame(f);
    })(s);
  }

  function initHeroText() {
    // contadores
    $$('.hero__stats [data-count]').forEach(function (el) {
      var to = parseInt(el.getAttribute('data-count'), 10), p = parseInt(el.getAttribute('data-pad') || '0', 10);
      if (!reduced) setTimeout(function () { animateCount(el, to, 1800, p); }, 1500);
    });
    // palabra rotatoria
    var words = $$('#cycle .cycle__w');
    if (words.length > 1 && !reduced) {
      var i = 0;
      setInterval(function () {
        var cur = words[i]; i = (i + 1) % words.length; var nx = words[i];
        cur.classList.remove('is-on'); cur.classList.add('is-off');
        nx.classList.remove('is-off'); nx.classList.add('is-on');
        setTimeout(function () { cur.classList.remove('is-off'); }, 950);
      }, 2900);
    }
    // cotas del muro
    var dw = $('#dimW'), dh = $('#dimH');
    if (dw && dh && !reduced) {
      var sets = [[3.2, 2.4], [4.0, 2.6], [2.8, 2.2], [3.6, 2.8]], k = 0, cw = 3.2, ch = 2.4;
      setInterval(function () {
        k = (k + 1) % sets.length;
        var fw = cw, fh = ch, tw = sets[k][0], th = sets[k][1], s = performance.now();
        (function f(now) {
          var t = easeIO(clamp((now - s) / 1300, 0, 1));
          cw = lerp(fw, tw, t); ch = lerp(fh, th, t);
          dw.textContent = cw.toFixed(2); dh.textContent = ch.toFixed(2);
          if (t < 1) requestAnimationFrame(f);
        })(s);
      }, 4200);
    }
  }

  function initHeroFX() {
    var hero = $('#inicio'); if (!hero) return;
    var wall = $('#wall'), floats = $$('.float', hero), cv = $('#fx');
    var ctx = cv && cv.getContext ? cv.getContext('2d') : null;
    var visible = true, W = 0, H = 0, dpr = 1, parts = [];
    var mouse = { x: 0, y: 0, tx: 0, ty: 0, px: -999, py: -999, active: false };

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) requestAnimationFrame(tick); }, { threshold: 0 }).observe(hero);
    }
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.ty = ((e.clientY - r.top) / r.height) * 2 - 1;
      mouse.px = e.clientX - r.left; mouse.py = e.clientY - r.top; mouse.active = true;
    }, { passive: true });
    hero.addEventListener('pointerleave', function () { mouse.active = false; mouse.tx = 0; mouse.ty = 0; mouse.px = mouse.py = -999; });

    function mk() {
      return { x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .22, vy: -.08 - Math.random() * .3,
               r: .7 + Math.random() * 1.8, red: Math.random() < .34, a: .25 + Math.random() * .6, tw: Math.random() * 6.28 };
    }
    function size() {
      if (!cv || !ctx) return;
      var r = cv.parentElement.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2); W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.min(W < 700 ? 34 : 84, Math.round(W * H / 17000));
      parts = []; for (var i = 0; i < n; i++) parts.push(mk());
    }
    var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(size, 200); });
    size();

    var t0 = performance.now();
    function tick(now) {
      if (!visible || document.hidden) return;
      var t = (now - t0) / 1000;

      // Muro 3D: balanceo suave + respuesta al puntero
      if (wall) {
        mouse.x = lerp(mouse.x, mouse.tx, .06); mouse.y = lerp(mouse.y, mouse.ty, .06);
        var idle = reduced ? 0 : 1;
        var ry = -14 + Math.sin(t * .55) * 6 * idle + mouse.x * 12;
        var rx = 3 + Math.cos(t * .42) * 2.4 * idle - mouse.y * 7;
        wall.style.transition = 'none';
        wall.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
        floats.forEach(function (f) {
          var d = parseFloat(f.getAttribute('data-depth')) || 1;
          f.style.translate = (mouse.x * d * -16).toFixed(1) + 'px ' + (mouse.y * d * -12).toFixed(1) + 'px';
        });
      }

      // Partículas
      if (ctx && !reduced) {
        ctx.clearRect(0, 0, W, H);
        var n = parts.length, i, j, p, q, dx, dy, d;
        for (i = 0; i < n; i++) {
          p = parts[i];
          p.x += p.vx; p.y += p.vy; p.tw += .02;
          if (mouse.active) {
            dx = p.x - mouse.px; dy = p.y - mouse.py; d = dx * dx + dy * dy;
            if (d < 24000) { var f = (1 - d / 24000) * .9; p.x += dx / Math.sqrt(d + 1) * f; p.y += dy / Math.sqrt(d + 1) * f; }
          }
          if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
          if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
          var al = p.a * (.6 + .4 * Math.sin(p.tw));
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832);
          ctx.fillStyle = 'rgba(' + (p.red ? '255,65,77' : '190,205,225') + ',' + al.toFixed(3) + ')';
          ctx.fill();
        }
        ctx.lineWidth = 1;
        for (i = 0; i < n; i++) {
          p = parts[i];
          for (j = i + 1; j < n; j++) {
            q = parts[j]; dx = p.x - q.x; dy = p.y - q.y; d = dx * dx + dy * dy;
            if (d < 12100) {
              ctx.strokeStyle = 'rgba(' + (p.red && q.red ? '255,65,77' : '160,180,205') + ',' + ((1 - d / 12100) * .17).toFixed(3) + ')';
              ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
            }
          }
        }
      }
      requestAnimationFrame(tick);
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden && visible) requestAnimationFrame(tick); });
    requestAnimationFrame(tick);
  }

  /* ==========================================================================
     Manifiesto por palabras, parallax, servicios, proceso, ticker, barra de scroll
     (todo en un único ciclo por frame de scroll)
     ========================================================================== */
  var S = { manifesto: null, words: [], par: [], svc: null, steps: null, ticker: null, lastY: 0, vel: 0, rate: 1, navHidden: false };

  function initScrollFX() {
    // Manifiesto
    var m = $('#manifesto');
    if (m) {
      var txt = m.textContent.trim().replace(/\s+/g, ' ').split(' ');
      m.setAttribute('aria-label', txt.join(' '));
      m.innerHTML = txt.map(function (w) { return '<span class="w" aria-hidden="true">' + w + '</span>'; }).join(' ');
      S.manifesto = m; S.words = $$('.w', m);
    }
    S.par = $$('[data-parallax]');
    S.steps = $('#stepsLine');
    var tk = $('.ticker__track');
    if (tk && tk.getAnimations) S.ticker = tk;

    // Servicios (pin + scroll horizontal)
    var pin = $('#svcPin'), track = $('#svcTrack');
    if (pin && track) {
      var mq = window.matchMedia('(min-width: 1024px) and (min-height: 560px)');
      S.svc = { pin: pin, track: track, bar: $('#svcBar'), cur: $('#svcCur'), mq: mq, dist: 0, on: false, cards: $$('.svc', track).length };
      var measure = function () {
        var s = S.svc;
        s.on = mq.matches;
        if (s.on) {
          $$('img', track).forEach(function (im) { im.loading = 'eager'; });
          track.style.transform = '';
          s.dist = Math.max(0, track.scrollWidth - window.innerWidth);
          pin.style.height = (s.dist + window.innerHeight) + 'px';
        } else {
          pin.style.height = ''; track.style.transform = '';
        }
        requestScrollUpdate();
      };
      measure();
      window.addEventListener('resize', measure);
      if (mq.addEventListener) mq.addEventListener('change', measure);
      if ('ResizeObserver' in window) new ResizeObserver(measure).observe(track);
      window.addEventListener('load', measure);
    }

    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    window.addEventListener('resize', requestScrollUpdate);
    requestScrollUpdate();
  }

  var scrollQueued = false;
  function requestScrollUpdate() { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(onScroll); } }

  function onScroll() {
    scrollQueued = false;
    var y = window.scrollY, vh = window.innerHeight, dy = y - S.lastY;
    S.vel = lerp(S.vel, dy, .25);

    // Barra de progreso y estado del nav
    var bar = $('#scrollBar'), max = maxScroll();
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? clamp(y / max, 0, 1) : 0) + ')';
    if (nav) {
      nav.classList.toggle('is-solid', y > 24);
      if (!menu.classList.contains('is-open')) {
        if (y > 520 && dy > 3 && !nav.contains(document.activeElement)) nav.classList.add('is-hidden');
        else if (dy < -3 || y < 520) nav.classList.remove('is-hidden');
      }
    }

    // Manifiesto
    if (S.manifesto) {
      var r = S.manifesto.getBoundingClientRect();
      var p = clamp((vh * .82 - r.top) / (r.height + vh * .32), 0, 1);
      var lit = Math.round(p * S.words.length * 1.08);
      for (var i = 0; i < S.words.length; i++) S.words[i].classList.toggle('is-lit', i < lit);
    }

    // Parallax de imágenes
    if (!reduced) {
      for (var k = 0; k < S.par.length; k++) {
        var el = S.par[k], host = el.parentElement, hr = host.getBoundingClientRect();
        if (hr.bottom < -100 || hr.top > vh + 100) continue;
        var f = parseFloat(el.getAttribute('data-parallax')) || .08;
        var off = clamp(((hr.top + hr.height / 2) - vh / 2) * -f, -hr.height * .07, hr.height * .07);
        el.style.setProperty('--py', off.toFixed(1) + 'px');
      }
    }

    // Servicios: scroll horizontal
    var s = S.svc;
    if (s && s.on) {
      var pr = s.pin.getBoundingClientRect();
      var span = s.pin.offsetHeight - vh;
      var prog = span > 0 ? clamp(-pr.top / span, 0, 1) : 0;
      s.track.style.transform = 'translate3d(' + (-s.dist * prog).toFixed(1) + 'px,0,0)';
      if (s.bar) s.bar.style.transform = 'scaleX(' + prog.toFixed(4) + ')';
      if (s.cur) s.cur.textContent = pad2(Math.min(s.cards, Math.floor(prog * s.cards) + 1));
    }

    // Proceso: línea de tiempo
    if (S.steps) {
      var sr = S.steps.parentElement.parentElement.getBoundingClientRect();
      S.steps.style.setProperty('--p', clamp((vh * .72 - sr.top) / sr.height, 0, 1).toFixed(3));
    }

    // Ticker: se acelera con la velocidad del scroll
    if (S.ticker && !reduced) {
      S.rate = lerp(S.rate, 1 + Math.min(Math.abs(S.vel) * .35, 7), .18);
      var anims = S.ticker.getAnimations();
      if (anims[0]) anims[0].playbackRate = S.rate;
      if (Math.abs(S.rate - 1) > .05) requestScrollUpdate();
    }
    S.lastY = y;
  }

  /* ==========================================================================
     EFECTOS DE CURSOR: foco global, foco en tarjetas, botones magnéticos
     ========================================================================== */
  function initPointerFX() {
    if (coarse) return;
    var glow = $('.cursor-glow'), gx = 0, gy = 0, tx = 0, ty = 0, on = false;
    function gl() {
      gx = lerp(gx, tx, .12); gy = lerp(gy, ty, .12);
      glow.style.transform = 'translate3d(' + gx.toFixed(1) + 'px,' + gy.toFixed(1) + 'px,0)';
      requestAnimationFrame(gl);
    }
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      tx = e.clientX; ty = e.clientY;
      if (!on && glow) { on = true; gx = tx; gy = ty; root.classList.add('has-pointer'); requestAnimationFrame(gl); }
      var sp = e.target.closest && e.target.closest('.spot');
      if (sp) { var r = sp.getBoundingClientRect(); sp.style.setProperty('--mx', (e.clientX - r.left) + 'px'); sp.style.setProperty('--my', (e.clientY - r.top) + 'px'); }
    }, { passive: true });

    $$('.magnetic').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.translate = ((e.clientX - r.left - r.width / 2) * .22).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) * .32).toFixed(1) + 'px';
      });
      b.addEventListener('pointerleave', function () { b.style.translate = ''; });
    });
  }

  /* ==========================================================================
     FAQ (acordeón accesible)
     ========================================================================== */
  function initFaq() {
    $$('.acc__item').forEach(function (item) {
      var q = $('.acc__q', item);
      q.addEventListener('click', function () {
        var open = item.classList.contains('is-open');
        $$('.acc__item.is-open').forEach(function (o) { o.classList.remove('is-open'); $('.acc__q', o).setAttribute('aria-expanded', 'false'); });
        if (!open) { item.classList.add('is-open'); q.setAttribute('aria-expanded', 'true'); }
      });
    });
  }

  /* ==========================================================================
     GALERÍA + LIGHTBOX
     ========================================================================== */
  function initLightbox() {
    var lb = $('#lb'); if (!lb) return;
    var tiles = $$('#gallery .tile'), idx = 0, lastFocus = null;
    var img = $('#lbImg'), cap = $('#lbCap'), tag = $('#lbTag'), cnt = $('#lbCount');
    var closeBtn = $('#lbClose'), prev = $('#lbPrev'), next = $('#lbNext');

    function show(i) {
      idx = (i + tiles.length) % tiles.length;
      var t = tiles[idx], src = $('img', t);
      img.src = src.currentSrc || src.src; img.alt = src.alt;
      cap.textContent = t.getAttribute('data-cap') || ''; tag.textContent = t.getAttribute('data-tag') || '';
      cnt.textContent = (idx + 1) + ' / ' + tiles.length;
      [1, -1].forEach(function (d) { var n = new Image(); n.src = $('img', tiles[(idx + d + tiles.length) % tiles.length]).src; });
    }
    function open(i) {
      lastFocus = document.activeElement; show(i);
      lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); root.classList.add('is-locked');
      setTimeout(function () { closeBtn.focus(); }, 60);
    }
    function close() {
      lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); root.classList.remove('is-locked');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    tiles.forEach(function (t, i) { $('.tile__btn', t).addEventListener('click', function () { open(i); }); });
    closeBtn.addEventListener('click', close);
    prev.addEventListener('click', function () { show(idx - 1); });
    next.addEventListener('click', function () { show(idx + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(idx - 1);
      else if (e.key === 'ArrowRight') show(idx + 1);
      else if (e.key === 'Tab') {   // atrapa el foco dentro del diálogo
        var f = [closeBtn, prev, next], i = f.indexOf(document.activeElement);
        e.preventDefault(); f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });
    var sx = 0;
    lb.addEventListener('touchstart', function (e) { sx = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      var d = e.changedTouches[0].clientX - sx;
      if (Math.abs(d) > 50) show(idx + (d < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ==========================================================================
     CONFIGURADOR "DISEÑA TU CANCEL"
     ========================================================================== */
  function initStudio() {
    var form = $('#studioForm'), canvas = $('#studioCanvas'); if (!form || !canvas) return;
    var names = { corrediza: 'Ventana corrediza', fija: 'Ventana fija', abatible: 'Ventana abatible', mampara: 'Mampara de cristal' };
    var fin = { natural: 'aluminio natural', negro: 'aluminio negro', blanco: 'aluminio blanco', bronce: 'aluminio bronce', madera: 'aluminio tono madera' };
    var sashes = { corrediza: 2, fija: 1, abatible: 2, mampara: 3 };
    var win = document.createElement('div'); win.className = 'stu-win';
    var dim = document.createElement('span'); dim.className = 'stu-dim';
    canvas.appendChild(win); canvas.appendChild(dim);
    var summary = $('#studioSummary'), cta = $('#studioCta');
    var wR = $('#rngW'), hR = $('#rngH'), curTipo = '';

    function val(n) { return form.elements[n].value; }
    function fill(r) { r.style.setProperty('--p', ((r.value - r.min) / (r.max - r.min) * 100).toFixed(1) + '%'); }
    function render() {
      var tipo = val('tipo'), acab = val('acabado'), cri = val('cristal');
      var w = parseFloat(wR.value), h = parseFloat(hR.value);
      if (tipo !== curTipo) {
        curTipo = tipo; win.setAttribute('data-tipo', tipo);
        win.innerHTML = new Array(sashes[tipo] + 1).join('<i class="sash"></i>');
      }
      canvas.setAttribute('data-acabado', acab); canvas.setAttribute('data-cristal', cri);
      win.style.setProperty('--w', clamp(w / 4.0 * 100, 12, 90).toFixed(1));
      win.style.setProperty('--h', clamp(h / 3.2 * 100, 12, 84).toFixed(1));
      $('#outW').textContent = w.toFixed(2) + ' m'; $('#outH').textContent = h.toFixed(2) + ' m';
      fill(wR); fill(hR);
      var size = w.toFixed(2) + ' × ' + h.toFixed(2) + ' m';
      dim.textContent = size;
      summary.innerHTML = '<b>' + names[tipo] + '</b> · ' + fin[acab] + ' · cristal ' + cri + ' · ' + size;
      var msg = 'Hola, me interesa cotizar: ' + names[tipo] + ', ' + fin[acab] + ', cristal ' + cri + ', medidas aproximadas ' + size + '. (Diseñado en el configurador del sitio web)';
      cta.setAttribute('href', waLink(msg));
    }
    form.addEventListener('input', render);
    form.addEventListener('change', render);
    render();
  }

  /* ==========================================================================
     FORMULARIO DE CONTACTO → WHATSAPP
     ========================================================================== */
  function initContact() {
    var form = $('#contactForm'); if (!form) return;
    var ok = $('#cf-ok'), okLink = $('#cf-ok-link');
    var rules = [
      { id: 'cf-nombre', err: 'Escribe tu nombre.' },
      { id: 'cf-tipo', err: 'Selecciona el tipo de proyecto.' },
      { id: 'cf-msg', err: 'Cuéntanos brevemente qué necesitas.' }
    ];
    function setErr(id, msg) {
      var input = document.getElementById(id), box = input.closest('.field'), out = document.getElementById(id + '-err');
      box.classList.toggle('is-err', !!msg); input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg) input.setAttribute('aria-describedby', id + '-err'); else input.removeAttribute('aria-describedby');
      if (out) out.textContent = msg || '';
    }
    rules.forEach(function (r) {
      document.getElementById(r.id).addEventListener('input', function () { if (this.value.trim()) setErr(r.id, ''); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      rules.forEach(function (r) {
        var el = document.getElementById(r.id), empty = !el.value.trim();
        setErr(r.id, empty ? r.err : '');
        if (empty && !bad) bad = el;
      });
      if (bad) { bad.focus(); return; }
      var v = function (id) { return document.getElementById(id).value.trim(); };
      var lines = ['Hola, soy ' + v('cf-nombre') + '. Quiero cotizar: ' + v('cf-tipo') + '.'];
      if (v('cf-medidas')) lines.push('Medidas aproximadas: ' + v('cf-medidas'));
      if (v('cf-ubic')) lines.push('Ubicación de la obra: ' + v('cf-ubic'));
      lines.push('', v('cf-msg'));
      var url = waLink(lines.join('\n'));
      okLink.setAttribute('href', url); ok.hidden = false;
      var w = window.open(url, '_blank', 'noopener');
      if (!w) window.location.href = url;
    });
  }

  /* ==========================================================================
     ENLACES DE WHATSAPP + BOTÓN FLOTANTE
     ========================================================================== */
  function initWhatsApp() {
    $$('a[data-wa]').forEach(function (a) { a.setAttribute('href', waLink(a.getAttribute('data-wa'))); });
    var wa = $('#wa'); if (!wa) return;
    whenReady(function () {
      setTimeout(function () { wa.classList.add('is-tip'); setTimeout(function () { wa.classList.remove('is-tip'); }, 6500); }, 7000);
    });
  }

  /* ==========================================================================
     INICIO
     ========================================================================== */
  function boot() {
    var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
    initLoader();
    initNav();
    initSmoothScroll();
    initReveal();
    initScrollFX();
    initPointerFX();
    initFaq();
    initLightbox();
    initStudio();
    initContact();
    initWhatsApp();
    whenReady(function () { initHeroText(); });
    initHeroFX();
    if (location.hash && document.getElementById(location.hash.slice(1))) {
      whenReady(function () { setTimeout(function () { var a = document.querySelector('a[href="' + location.hash + '"]'); if (a) a.click(); }, 400); });
    } else { window.scrollTo(0, 0); }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
