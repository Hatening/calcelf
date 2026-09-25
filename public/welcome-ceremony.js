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

  const WC_I18N={
    en:{t:'Welcome to CalcElf!',d:'Your {n} Credits are ready!',b:'Start my journey'},
    'zh-CN':{t:'欢迎来到 CalcElf！',d:'你的 {n} 个 Credits 已准备好！',b:'开始我的旅程'},
    'zh-TW':{t:'歡迎來到 CalcElf！',d:'你的 {n} 個 Credits 已準備好！',b:'開始我的旅程'},
    ja:{t:'CalcElf へようこそ！',d:'{n} Credits の準備ができました！',b:'旅を始める'},
    ko:{t:'CalcElf에 오신 것을 환영해요!',d:'Credits {n}개가 준비되었어요!',b:'여행 시작하기'},
    fr:{t:'Bienvenue sur CalcElf !',d:'Vos {n} Credits sont prêts !',b:'Commencer mon aventure'},
    de:{t:'Willkommen bei CalcElf!',d:'Deine {n} Credits sind bereit!',b:'Reise starten'},
    es:{t:'¡Bienvenido a CalcElf!',d:'¡Tus {n} Credits están listos!',b:'Empezar mi viaje'},
    it:{t:'Benvenuto su CalcElf!',d:'I tuoi {n} Credits sono pronti!',b:'Inizia il mio viaggio'},
    ar:{t:'مرحبًا بك في CalcElf!',d:'أرصدتك البالغة {n} Credits جاهزة!',b:'ابدأ رحلتي'},
    fa:{t:'به CalcElf خوش آمدید!',d:'{n} اعتبار شما آماده است!',b:'شروع سفر من'}
  };
  function wcLang(){ try{ return window.CALF_LANG||localStorage.getItem('calcelf_lang')||'en'; }catch(e){ return 'en'; } }
  function localizeWelcome(credits){
    const root=currentRoot; if(!root) return; const d=WC_I18N[wcLang()]||WC_I18N.en;
    const tt=root.querySelector('#calcelfWelcomeTitle'), dd=root.querySelector('#calcelfWelcomeDesc'), bb=root.querySelector('#calcelfWelcomeBtn');
    if(tt)tt.textContent=d.t; if(dd)dd.textContent=d.d.replace('{n}',credits==null?'100':credits); if(bb)bb.textContent=d.b;
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
    localizeWelcome(credits);
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