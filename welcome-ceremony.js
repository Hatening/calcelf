/* =========================================================
   CalcElf 欢迎开箱仪式
   按年龄段随机轮动 Lottie，播放完弹 Welcome + 彩带
   用法：
   CalcElfWelcome.trigger({ stage: "primary_1_3", credits: 100 });
   ========================================================= */
(function () {
  const ANIMATION_MAP = {
    "party-celebration": { file: "party-celebration.json", duration: 3000 },
    "happy-smile": { file: "happy-smile.json", duration: 3000 },
    "gift-box": { file: "gift-box.json", duration: 2600 },
    "rocket-launch": { file: "rocket-launch.json", duration: 2400 },
    "thumbs-up": { file: "thumbs-up.json", duration: 2400 },
    "clapping": { file: "clapping.json", duration: 2200 },
    "balloon-float": { file: "balloon-float.json", duration: 2400 },
    "waving": { file: "waving.json", duration: 2200 },
    "smile-face": { file: "smile-face.json", duration: 3000 },
    "energy-core": { file: "energy-core.json", duration: 3000 },
    "key-unlock": { file: "key-unlock.json", duration: 3000 }
  };

  const STAGE_POOLS = {
    primary_1_3: [
      "gift-box", "happy-smile", "balloon-float", "clapping",
      "thumbs-up", "waving", "smile-face"
    ],
    primary_3_6: [
      "party-celebration", "rocket-launch", "thumbs-up",
      "gift-box", "happy-smile", "balloon-float"
    ],
    middle_1_2: [
      "energy-core", "rocket-launch", "party-celebration", "thumbs-up"
    ],
    grade_9_12: [
      "key-unlock", "energy-core", "rocket-launch", "party-celebration"
    ],
    prefer_not: [
      "party-celebration", "gift-box", "rocket-launch",
      "happy-smile", "balloon-float"
    ]
  };

  let currentAnim = null;
  let currentRoot = null;
  let closeTimer = null;

  function pickNext(stage) {
    const pool = STAGE_POOLS[stage] || STAGE_POOLS.prefer_not;
    const key = "calcelf_welcome_last_" + stage;
    let last = parseInt(localStorage.getItem(key) || "-1", 10);
    let next = (last + 1) % pool.length;
    localStorage.setItem(key, String(next));
    return pool[next];
  }

  function ensureRoot() {
    if (currentRoot) return currentRoot;

    const root = document.createElement("div");
    root.id = "calcelfWelcomeRoot";
    root.className = "calcelf-welcome-root";
    root.style.display = "none";
    root.innerHTML = `
      <div class="calcelf-welcome-stage">
        <div id="calcelfLottieBox" class="calcelf-lottie-box"></div>
        <div class="calcelf-welcome-content">
          <h2 id="calcelfWelcomeTitle">Welcome to CalcElf!</h2>
          <p id="calcelfWelcomeDesc">Your 100 Credits are ready!</p>
          <button id="calcelfWelcomeBtn" class="btn primary">Start my journey</button>
        </div>
      </div>
    `;
    document.body.appendChild(root);

    root.querySelector("#calcelfWelcomeBtn").addEventListener("click", function () {
      close();
    });

    currentRoot = root;
    return root;
  }

  function showContent(credits) {
    const root = ensureRoot();
    const desc = root.querySelector("#calcelfWelcomeDesc");
    if (credits) desc.textContent = "Your " + credits + " Credits are ready!";
    root.classList.add("show-content");
    if (window.CalcElfConfetti) {
      window.CalcElfConfetti.burst({ count: 180, duration: 3200 });
    }
  }

  function trigger(options) {
    const opt = options || {};
    const stage = opt.stage || "prefer_not";
    const credits = opt.credits || 100;
    const chosen = pickNext(stage);
    const item = ANIMATION_MAP[chosen] || ANIMATION_MAP["party-celebration"];

    const root = ensureRoot();
    root.style.display = "flex";
    root.classList.remove("show-content");

    const box = root.querySelector("#calcelfLottieBox");
    box.innerHTML = "";

    if (currentAnim) {
      try { currentAnim.destroy(); } catch (e) {}
      currentAnim = null;
    }

    if (!window.lottie) {
      // Lottie 没加载成功时，直接走文字 + 彩带，避免卡死
      setTimeout(function () { showContent(credits); }, 300);
      return;
    }

    currentAnim = window.lottie.loadAnimation({
      container: box,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "/animations/" + item.file,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
        progressiveLoad: true
      }
    });

    clearTimeout(closeTimer);
    closeTimer = setTimeout(function () {
      if (currentAnim) {
        try { currentAnim.destroy(); } catch (e) {}
        currentAnim = null;
      }
      showContent(credits);
    }, item.duration || 2800);
  }

  function close() {
    const root = ensureRoot();
    root.style.display = "none";
    root.classList.remove("show-content");
    if (currentAnim) {
      try { currentAnim.destroy(); } catch (e) {}
      currentAnim = null;
    }
    if (window.CalcElfConfetti) {
      window.CalcElfConfetti.burst({ count: 120, duration: 2600 });
    }
  }

  window.CalcElfWelcome = {
    trigger: trigger,
    close: close,
    pools: STAGE_POOLS,
    animations: ANIMATION_MAP
  };
})();