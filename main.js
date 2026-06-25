(function () {
  const CONTACT_EMAIL = "hello@opensetsolutions.com";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const year = document.getElementById("year");
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const menuToggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");
  const body = document.body;

  function closeMenu() {
    if (!menu || !menuToggle) return;
    menu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    body.classList.remove("menu-open");
  }

  if (menuToggle && menu) {
    menuToggle.addEventListener("click", function () {
      const isOpen = menu.classList.toggle("is-open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      body.classList.toggle("menu-open", isOpen);
    });

    menu.addEventListener("click", function (event) {
      if (event.target instanceof HTMLAnchorElement) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
  }

  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  if (revealEls.length && "IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const email = String(data.get("email") || "").trim();
      const company = String(data.get("company") || "").trim();
      const message = String(data.get("message") || "").trim();
      const status = document.getElementById("form-status");
      const errors = {
        name: document.getElementById("name-error"),
        email: document.getElementById("email-error"),
        message: document.getElementById("message-error")
      };

      Object.values(errors).forEach(function (el) {
        if (el) el.textContent = "";
      });
      if (status) status.textContent = "";

      let firstInvalid = null;
      if (!name) {
        if (errors.name) errors.name.textContent = "Please enter your name.";
        firstInvalid = firstInvalid || document.getElementById("name");
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (errors.email) errors.email.textContent = "Please enter a valid email address.";
        firstInvalid = firstInvalid || document.getElementById("email");
      }

      if (!message) {
        if (errors.message) errors.message.textContent = "Please include a short message.";
        firstInvalid = firstInvalid || document.getElementById("message");
      }

      if (firstInvalid) {
        firstInvalid.focus();
        if (status) status.textContent = "Please fix the highlighted fields.";
        return;
      }

      const subject = encodeURIComponent("Open Set Solutions inquiry");
      const body = encodeURIComponent(
        [
          "Name: " + name,
          "Email: " + email,
          "Company: " + (company || "Not provided"),
          "",
          message
        ].join("\n")
      );
      if (status) status.textContent = "Opening your email app with a draft message.";
      window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;
    });
  }

  const canvas = document.getElementById("open-set-canvas");
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let width = 0;
  let height = 0;
  let frame = 0;
  let running = false;
  let rafId = 0;

  const points = [
    { x: 0.21, y: 0.26, r: 4.6, phase: 0.2, inside: true },
    { x: 0.32, y: 0.34, r: 5.5, phase: 1.2, inside: true },
    { x: 0.48, y: 0.24, r: 4.2, phase: 2.1, inside: true },
    { x: 0.58, y: 0.36, r: 5.2, phase: 2.8, inside: true },
    { x: 0.39, y: 0.53, r: 4.8, phase: 3.5, inside: true },
    { x: 0.62, y: 0.58, r: 4.3, phase: 4.4, inside: true },
    { x: 0.28, y: 0.64, r: 4.6, phase: 5.2, inside: true },
    { x: 0.72, y: 0.46, r: 4.4, phase: 6.1, inside: false },
    { x: 0.17, y: 0.49, r: 4.5, phase: 1.6, inside: false },
    { x: 0.77, y: 0.24, r: 4.1, phase: 3.1, inside: false },
    { x: 0.53, y: 0.72, r: 5.1, phase: 4.8, inside: false },
    { x: 0.81, y: 0.66, r: 3.7, phase: 0.9, outside: true },
    { x: 0.12, y: 0.18, r: 3.7, phase: 3.8, outside: true },
    { x: 0.84, y: 0.39, r: 3.5, phase: 5.4, outside: true }
  ];

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(320, Math.floor(rect.width));
    height = Math.max(320, Math.floor(rect.height));
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }

  function boundaryPoint(angle, time) {
    const cx = width * 0.48;
    const cy = height * 0.47;
    const baseX = width * 0.31;
    const baseY = height * 0.28;
    const wobble =
      1 +
      0.052 * Math.sin(angle * 3 + time * 0.018) +
      0.034 * Math.cos(angle * 5 - time * 0.014);
    return {
      x: cx + Math.cos(angle) * baseX * wobble,
      y: cy + Math.sin(angle) * baseY * (1 + 0.038 * Math.cos(angle * 2 + time * 0.016))
    };
  }

  function drawBoundary(time) {
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i <= 120; i += 1) {
      const angle = (Math.PI * 2 * i) / 120;
      const point = boundaryPoint(angle, time);
      if (i === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(35, 71, 232, 0.055)";
    ctx.fill();
    ctx.setLineDash([10, 10]);
    ctx.lineDashOffset = reduceMotion ? 0 : -time * 0.08;
    ctx.strokeStyle = "#2347E8";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  function drawPoint(point, time) {
    const drift = reduceMotion ? 0 : 1;
    const x = point.x * width + Math.cos(time * 0.012 + point.phase) * 7 * drift;
    const y = point.y * height + Math.sin(time * 0.01 + point.phase * 1.7) * 6 * drift;
    const radius = point.r;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    if (point.outside || !point.inside) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.76)";
      ctx.fill();
      ctx.strokeStyle = point.outside ? "rgba(14, 27, 51, 0.56)" : "#2347E8";
      ctx.lineWidth = 1.8;
      ctx.stroke();
    } else {
      ctx.fillStyle = "#0E1B33";
      ctx.fill();
    }
  }

  function drawConnectors(time) {
    const lines = [
      [0, 1],
      [1, 3],
      [3, 5],
      [2, 3],
      [4, 6],
      [4, 5]
    ];
    ctx.save();
    ctx.strokeStyle = "rgba(14, 27, 51, 0.12)";
    ctx.lineWidth = 1;
    lines.forEach(function (pair) {
      const a = points[pair[0]];
      const b = points[pair[1]];
      const ax = a.x * width + Math.cos(time * 0.012 + a.phase) * 7;
      const ay = a.y * height + Math.sin(time * 0.01 + a.phase * 1.7) * 6;
      const bx = b.x * width + Math.cos(time * 0.012 + b.phase) * 7;
      const by = b.y * height + Math.sin(time * 0.01 + b.phase * 1.7) * 6;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    });
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
    for (let x = 44; x < width; x += 44) {
      ctx.fillRect(x, 0, 1, height);
    }
    for (let y = 44; y < height; y += 44) {
      ctx.fillRect(0, y, width, 1);
    }

    const time = reduceMotion ? 0 : frame;
    drawBoundary(time);
    drawConnectors(time);
    points.forEach(function (point) {
      drawPoint(point, time);
    });
  }

  function tick() {
    if (!running) return;
    frame += 1;
    draw();
    rafId = window.requestAnimationFrame(tick);
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    tick();
  }

  function stop() {
    running = false;
    if (rafId) window.cancelAnimationFrame(rafId);
  }

  resizeCanvas();

  if ("ResizeObserver" in window) {
    new ResizeObserver(resizeCanvas).observe(canvas);
  } else {
    window.addEventListener("resize", resizeCanvas);
  }

  if (reduceMotion) {
    draw();
  } else if ("IntersectionObserver" in window) {
    const canvasObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) start();
          else stop();
        });
      },
      { threshold: 0.05 }
    );
    canvasObserver.observe(canvas);
  } else {
    start();
  }
})();
