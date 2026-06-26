/* ============================================================
   Open Set Solutions — main.js
   Vanilla JS · no dependencies · no storage
   - Mobile hamburger menu (accessible)
   - Header shadow on scroll
   - Reveal-on-scroll
   - "Open set" hero canvas animation (reduced-motion aware)
   ============================================================ */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("nav");

  function setMenu(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Close when a link is tapped
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });

    // Close on Escape, return focus to toggle
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setMenu(false);
        toggle.focus();
      }
    });

    // Reset when leaving mobile breakpoint
    window.matchMedia("(max-width: 800px)").addEventListener("change", function (m) {
      if (!m.matches) setMenu(false);
    });
  }

  /* ---------- Header shadow on scroll ---------- */
  var header = document.getElementById("site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = [].slice.call(
    document.querySelectorAll(
      ".definition__inner, .section__head, .card, .about__intro, .about__body, .contact__inner"
    )
  );
  revealEls.forEach(function (el, i) {
    el.classList.add("reveal");
    el.style.transitionDelay = Math.min(i % 4, 3) * 70 + "ms";
  });

  if (prefersReduced || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) {
      el.classList.add("is-in");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  }

  /* ============================================================
     HERO CANVAS — "open set"
     A soft field of points, each carrying its own open (dashed)
     neighborhood. Points drift and keep gentle breathing room
     from one another — an open set, never pinned to an edge.
     ============================================================ */
  var canvas = document.getElementById("open-set-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0,
    H = 0;
  var points = [];

  // palette
  var INK = "28, 26, 22";
  var ACCENT = "207, 106, 67";

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function build() {
    var rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // density scales with area but stays calm
    var count = Math.round(
      Math.max(14, Math.min(34, (W * H) / 32000))
    );
    points = [];
    for (var i = 0; i < count; i++) {
      var accent = Math.random() < 0.22;
      points.push({
        x: rand(0, W),
        y: rand(0, H),
        vx: rand(-0.18, 0.18),
        vy: rand(-0.18, 0.18),
        r: rand(2.2, 4.2),
        nb: rand(34, 78), // neighborhood radius
        accent: accent,
        ph: rand(0, Math.PI * 2) // breathing phase
      });
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    // connective threads (only between near neighbors) — very faint
    for (var i = 0; i < points.length; i++) {
      for (var j = i + 1; j < points.length; j++) {
        var a = points[i],
          b = points[j];
        var dx = a.x - b.x,
          dy = a.y - b.y;
        var d = Math.sqrt(dx * dx + dy * dy);
        var reach = 150;
        if (d < reach) {
          var alpha = (1 - d / reach) * 0.1;
          ctx.strokeStyle = "rgba(" + INK + "," + alpha + ")";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // points + their open (dashed) neighborhoods
    for (var k = 0; k < points.length; k++) {
      var p = points[k];
      var col = p.accent ? ACCENT : INK;
      var breathe = 1 + Math.sin(t * 0.0009 + p.ph) * 0.12;

      // open neighborhood ring (dashed = open boundary)
      ctx.save();
      ctx.setLineDash([2, 5]);
      ctx.lineWidth = 1;
      ctx.strokeStyle =
        "rgba(" + col + "," + (p.accent ? 0.28 : 0.14) + ")";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.nb * breathe, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // the point itself
      ctx.fillStyle = "rgba(" + col + "," + (p.accent ? 0.95 : 0.6) + ")";
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function step(p) {
    p.x += p.vx;
    p.y += p.vy;

    // soft wrap so nothing is ever pinned to an edge
    var m = 90;
    if (p.x < -m) p.x = W + m;
    if (p.x > W + m) p.x = -m;
    if (p.y < -m) p.y = H + m;
    if (p.y > H + m) p.y = -m;
  }

  function maintainSpacing() {
    // gentle mutual repulsion — keep breathing room
    for (var i = 0; i < points.length; i++) {
      for (var j = i + 1; j < points.length; j++) {
        var a = points[i],
          b = points[j];
        var dx = a.x - b.x,
          dy = a.y - b.y;
        var d2 = dx * dx + dy * dy;
        var min = 70;
        if (d2 < min * min && d2 > 0.01) {
          var d = Math.sqrt(d2);
          var f = ((min - d) / min) * 0.015;
          var ux = dx / d,
            uy = dy / d;
          a.vx += ux * f;
          a.vy += uy * f;
          b.vx -= ux * f;
          b.vy -= uy * f;
        }
      }
    }
    // damp velocities so motion stays slow & calm
    for (var k = 0; k < points.length; k++) {
      var p = points[k];
      p.vx *= 0.992;
      p.vy *= 0.992;
      var sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      var cap = 0.32;
      if (sp > cap) {
        p.vx = (p.vx / sp) * cap;
        p.vy = (p.vy / sp) * cap;
      }
    }
  }

  var raf = null;
  function loop(t) {
    maintainSpacing();
    for (var i = 0; i < points.length; i++) step(points[i]);
    draw(t);
    raf = requestAnimationFrame(loop);
  }

  function start() {
    build();
    if (prefersReduced) {
      draw(0); // single static frame
    } else {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    }
  }

  // Pause when the hero is offscreen (perf + battery)
  if (!prefersReduced && "IntersectionObserver" in window) {
    var visObs = new IntersectionObserver(
      function (entries) {
        var visible = entries[0].isIntersecting;
        if (visible && !raf) {
          raf = requestAnimationFrame(loop);
        } else if (!visible && raf) {
          cancelAnimationFrame(raf);
          raf = null;
        }
      },
      { threshold: 0 }
    );
    visObs.observe(canvas);
  }

  // Debounced resize
  var rt = null;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(start, 180);
  });

  start();
})();
