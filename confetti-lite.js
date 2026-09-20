/* =========================================================
   CalcElf 纯 JS 彩带爆炸
   不依赖 canvas-confetti，直接可用
   ========================================================= */
(function () {
  let canvas = null;
  let ctx = null;
  let particles = [];
  let raf = null;

  function ensureCanvas() {
    if (canvas) return;
    canvas = document.createElement("canvas");
    canvas.id = "calcelfConfettiCanvas";
    canvas.style.position = "fixed";
    canvas.style.inset = "0";
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "2147483647";
    document.body.appendChild(canvas);
    ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);
  }

  function resize() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function random(min, max) {
    return Math.random() * (max - min) + min;
  }

  function burst(options) {
    ensureCanvas();
    const opt = options || {};
    const count = opt.count || 120;
    const duration = opt.duration || 2600;
    const colors = opt.colors || [
      "#ff4d6d", "#ffb703", "#00d4ff", "#7cff6b",
      "#c77dff", "#ff8fab", "#ffd93d", "#4cc9f0"
    ];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: window.innerWidth * random(0.15, 0.85),
        y: window.innerHeight * random(0.1, 0.45),
        vx: random(-7, 7),
        vy: random(-11, -2),
        size: random(5, 13),
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: random(0, Math.PI * 2),
        vr: random(-0.25, 0.25),
        life: duration,
        born: performance.now(),
        shape: Math.random() > 0.5 ? "rect" : "circle"
      });
    }
    if (!raf) loop();
  }

  function loop() {
    raf = requestAnimationFrame(loop);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const now = performance.now();

    particles = particles.filter(function (p) {
      const age = now - p.born;
      if (age > p.life) return false;

      p.vy += 0.22;
      p.vx *= 0.992;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.max(0, 1 - age / p.life);
      ctx.fillStyle = p.color;

      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size * 0.5, -p.size * 0.25, p.size, p.size * 0.5);
      }
      ctx.restore();
      return true;
    });

    if (particles.length === 0) {
      cancelAnimationFrame(raf);
      raf = null;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }

  window.CalcElfConfetti = {
    burst: burst
  };
})();