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
     HERO CANVAS — "open set" regions
     A few soft, organic regions, each drawn with an OPEN (dashed)
     boundary — the topological idea made visual. They drift and
     breathe slowly. On mouse-move, the nearest regions reach
     toward the cursor and warm to the accent, and the cursor
     carries its own little open neighborhood.
     ============================================================ */
  var canvas = document.getElementById("open-set-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0,
    H = 0;
  var regions = [];

  // palette
  var INK = "28, 26, 22";
  var ACCENT = "207, 106, 67";

  // pointer state (CSS px, region-canvas space)
  var mouse = { x: -9999, y: -9999, active: false };
  var mx = -9999, my = -9999; // eased pointer

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  // smooth closed curve through points (Catmull-Rom → bezier)
  function closedCurve(pts) {
    var n = pts.length;
    ctx.beginPath();
    ctx.moveTo(
      (pts[n - 1].x + pts[0].x) / 2,
      (pts[n - 1].y + pts[0].y) / 2
    );
    for (var i = 0; i < n; i++) {
      var p1 = pts[i];
      var p2 = pts[(i + 1) % n];
      ctx.quadraticCurveTo(p1.x, p1.y, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
    }
    ctx.closePath();
  }

  function build() {
    var rect = canvas.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // a calm handful of regions, scaled to the viewport
    var unit = Math.min(W, H);
    var defs = [
      { cx: 0.20, cy: 0.30, r: 0.30, accent: false, dot: true },
      { cx: 0.74, cy: 0.40, r: 0.40, accent: true,  dot: true },
      { cx: 0.16, cy: 0.82, r: 0.22, accent: false, dot: true },
      { cx: 0.56, cy: 0.84, r: 0.26, accent: false, dot: false },
      { cx: 0.90, cy: 0.86, r: 0.20, accent: true,  dot: false }
    ];
    // drop the densest region on small/portrait canvases
    if (W < 720) defs = [defs[0], defs[1], defs[2]];

    regions = defs.map(function (d) {
      var verts = Math.max(10, Math.round(d.r * 26));
      var baseR = d.r * unit * 0.62;
      var lobes = [];
      for (var i = 0; i < verts; i++) {
        lobes.push({
          amp: rand(0.06, 0.17),     // wobble amount
          freq: Math.round(rand(1, 3)),
          phase: rand(0, Math.PI * 2),
          speed: rand(0.4, 0.9),
          push: 0                    // live pointer displacement
        });
      }
      return {
        x: d.cx * W,
        y: d.cy * H,
        hx: d.cx * W,               // home (drift anchor)
        hy: d.cy * H,
        vx: rand(-0.06, 0.06),
        vy: rand(-0.06, 0.06),
        baseR: baseR,
        verts: verts,
        lobes: lobes,
        accent: d.accent,
        dot: d.dot,
        ph: rand(0, Math.PI * 2),
        glow: 0                      // eased accent intensity
      };
    });
  }

  function regionPoints(reg, t) {
    var pts = [];
    var breathe = 1 + Math.sin(t * 0.0006 + reg.ph) * 0.05;
    for (var i = 0; i < reg.verts; i++) {
      var ang = (i / reg.verts) * Math.PI * 2;
      var lobe = reg.lobes[i];
      var wob =
        1 +
        lobe.amp *
          Math.sin(t * 0.001 * lobe.speed + lobe.phase + ang * lobe.freq);
      var r = reg.baseR * breathe * wob + lobe.push;
      pts.push({
        x: reg.x + Math.cos(ang) * r,
        y: reg.y + Math.sin(ang) * r
      });
    }
    return pts;
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    for (var k = 0; k < regions.length; k++) {
      var reg = regions[k];
      var pts = regionPoints(reg, t);
      var col = reg.accent ? ACCENT : INK;
      var g = reg.glow; // 0..1

      // soft fill — barely there, warms slightly near the cursor
      closedCurve(pts);
      ctx.fillStyle =
        "rgba(" + col + "," + (0.020 + g * 0.05).toFixed(3) + ")";
      ctx.fill();

      // OPEN boundary — dashed, so the edge reads as "not included"
      ctx.save();
      ctx.setLineDash([2, 6]);
      ctx.lineWidth = 1.25;
      var edgeA = (reg.accent ? 0.30 : 0.18) + g * 0.5;
      ctx.strokeStyle = "rgba(" + col + "," + Math.min(0.9, edgeA) + ")";
      closedCurve(pts);
      ctx.stroke();
      ctx.restore();

      // a single interior point (its center), gently pulsing
      if (reg.dot) {
        var pr = 2.6 + Math.sin(t * 0.0012 + reg.ph) * 0.5;
        ctx.fillStyle =
          "rgba(" + col + "," + (reg.accent ? 0.85 : 0.5 + g * 0.4) + ")";
        ctx.beginPath();
        ctx.arc(reg.x, reg.y, pr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // cursor's own open neighborhood + connective thread to nearest region
    if (mx > -9000) {
      // thread to the nearest region center
      var near = null,
        nd = 1e9;
      for (var n = 0; n < regions.length; n++) {
        var dx0 = regions[n].x - mx,
          dy0 = regions[n].y - my;
        var dd = dx0 * dx0 + dy0 * dy0;
        if (dd < nd) {
          nd = dd;
          near = regions[n];
        }
      }
      if (near && nd < 360 * 360) {
        var a = (1 - Math.sqrt(nd) / 360) * 0.35;
        ctx.strokeStyle = "rgba(" + ACCENT + "," + a.toFixed(3) + ")";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(mx, my);
        ctx.lineTo(near.x, near.y);
        ctx.stroke();
      }

      var nb = 34 + Math.sin(t * 0.004) * 5;
      ctx.save();
      ctx.setLineDash([2, 5]);
      ctx.lineWidth = 1.25;
      ctx.strokeStyle = "rgba(" + ACCENT + ",0.55)";
      ctx.beginPath();
      ctx.arc(mx, my, nb, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = "rgba(" + ACCENT + ",0.9)";
      ctx.beginPath();
      ctx.arc(mx, my, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function update() {
    // ease pointer toward target (or offscreen when inactive)
    var tx = mouse.active ? mouse.x : -9999;
    var ty = mouse.active ? mouse.y : -9999;
    if (mx < -9000) { mx = tx; my = ty; }
    else { mx += (tx - mx) * 0.12; my += (ty - my) * 0.12; }

    for (var k = 0; k < regions.length; k++) {
      var reg = regions[k];

      // slow drift, gently tethered to home so layout stays balanced
      reg.x += reg.vx;
      reg.y += reg.vy;
      reg.vx += (reg.hx - reg.x) * 0.00012;
      reg.vy += (reg.hy - reg.y) * 0.00012;
      reg.vx *= 0.994;
      reg.vy *= 0.994;

      // pointer influence: nearest edge points bulge toward the cursor,
      // and the whole region warms to the accent (the "cool" hover effect)
      var glowTarget = 0;
      if (mouse.active && mx > -9000) {
        var cdx = mx - reg.x,
          cdy = my - reg.y;
        var cdist = Math.sqrt(cdx * cdx + cdy * cdy);
        var range = reg.baseR + 140;
        if (cdist < range) {
          glowTarget = Math.pow(1 - cdist / range, 1.5);
        }
        // per-vertex reach toward the cursor
        for (var i = 0; i < reg.verts; i++) {
          var ang = (i / reg.verts) * Math.PI * 2;
          var ex = reg.x + Math.cos(ang) * reg.baseR;
          var ey = reg.y + Math.sin(ang) * reg.baseR;
          var ddx = mx - ex,
            ddy = my - ey;
          var ed = Math.sqrt(ddx * ddx + ddy * ddy);
          var infl = ed < 150 ? (1 - ed / 150) : 0;
          var target = infl * infl * 34;
          reg.lobes[i].push += (target - reg.lobes[i].push) * 0.18;
        }
      } else {
        for (var j = 0; j < reg.verts; j++) {
          reg.lobes[j].push += (0 - reg.lobes[j].push) * 0.12;
        }
      }
      reg.glow += (glowTarget - reg.glow) * 0.1;
    }
  }

  var raf = null;
  function loop(t) {
    update();
    draw(t);
    raf = requestAnimationFrame(loop);
  }

  function start() {
    build();
    if (prefersReduced) {
      draw(900); // single calm static frame
    } else {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    }
  }

  // pointer tracking (skipped entirely under reduced-motion)
  if (!prefersReduced) {
    var setPointer = function (clientX, clientY) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = clientX - rect.left;
      mouse.y = clientY - rect.top;
      mouse.active = true;
    };
    canvas.parentElement.addEventListener("mousemove", function (e) {
      setPointer(e.clientX, e.clientY);
    });
    canvas.parentElement.addEventListener("mouseleave", function () {
      mouse.active = false;
    });
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
