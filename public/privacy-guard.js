/* =========================================================
   CalcElf 强制阅读隐私声明
   用法：
   const ok = await CalcElfPrivacy.require();
   if (!ok) return;
   ========================================================= */
(function () {
  const LS_KEY = "calcelf_privacy_agreed_v1";
  let pendingResolve = null;
  let timer = null;
  let secondsLeft = 5;
  let scrolledToBottom = false;
  let agreed = false;

  function getText() {
    return window.PRIVACY_TEXTS.get();
  }

  function buildModal() {
    if (document.getElementById("privacyGuardModal")) return;

    const div = document.createElement("div");
    div.id = "privacyGuardModal";
    div.className = "privacy-guard-modal";
    div.innerHTML = `
      <div class="privacy-guard-box">
        <h2 id="pgTitle"></h2>
        <div id="pgBody" class="privacy-guard-body"></div>
        <div id="pgScrollHint" class="privacy-scroll-hint"></div>
        <label class="privacy-check-label">
          <input type="checkbox" id="pgCheckbox" disabled>
          <span id="pgCheckboxText"></span>
        </label>
        <div class="privacy-actions">
          <button id="pgAgreeBtn" class="btn primary" disabled></button>
          <button id="pgCloseBtn" class="btn ghost"></button>
        </div>
        <div id="pgWait" class="privacy-wait"></div>
      </div>
    `;
    document.body.appendChild(div);

    const body = div.querySelector("#pgBody");
    body.addEventListener("scroll", function () {
      if (body.scrollTop + body.clientHeight >= body.scrollHeight - 8) {
        scrolledToBottom = true;
        updateState();
      }
    });

    div.querySelector("#pgCheckbox").addEventListener("change", function (e) {
      agreed = e.target.checked;
      updateState();
    });

    div.querySelector("#pgAgreeBtn").addEventListener("click", function () {
      if (!scrolledToBottom || !agreed || secondsLeft > 0) return;
      localStorage.setItem(LS_KEY, "1");
      close(true);
    });

    div.querySelector("#pgCloseBtn").addEventListener("click", function () {
      close(false);
    });
  }

  function updateState() {
    const modal = document.getElementById("privacyGuardModal");
    if (!modal) return;
    const cb = modal.querySelector("#pgCheckbox");
    const btn = modal.querySelector("#pgAgreeBtn");
    const wait = modal.querySelector("#pgWait");
    const tt = getText();

    wait.textContent = secondsLeft > 0 ? tt.waitText : "";
    cb.disabled = !(scrolledToBottom && secondsLeft <= 0);
    btn.disabled = !(scrolledToBottom && agreed && secondsLeft <= 0);
  }

  function open() {
    buildModal();
    const modal = document.getElementById("privacyGuardModal");
    const tt = getText();

    modal.querySelector("#pgTitle").textContent = tt.title;
    modal.querySelector("#pgBody").innerHTML = tt.body;
    modal.querySelector("#pgScrollHint").textContent = tt.scrollHint;
    modal.querySelector("#pgCheckboxText").textContent = tt.checkboxText;
    modal.querySelector("#pgAgreeBtn").textContent = tt.agreeBtn;
    modal.querySelector("#pgCloseBtn").textContent = tt.closeBtn || "Close";

    modal.style.display = "flex";
    scrolledToBottom = false;
    agreed = false;
    secondsLeft = 5;
    modal.querySelector("#pgCheckbox").checked = false;
    updateState();

    clearInterval(timer);
    timer = setInterval(function () {
      secondsLeft--;
      if (secondsLeft <= 0) {
        clearInterval(timer);
        secondsLeft = 0;
      }
      updateState();
    }, 1000);

    setTimeout(function () {
      const body = modal.querySelector("#pgBody");
      if (body.scrollHeight <= body.clientHeight + 8) {
        scrolledToBottom = true;
        updateState();
      }
    }, 120);
  }

  function close(ok) {
    const modal = document.getElementById("privacyGuardModal");
    if (modal) modal.style.display = "none";
    clearInterval(timer);
    if (pendingResolve) {
      pendingResolve(ok);
      pendingResolve = null;
    }
  }

  window.CalcElfPrivacy = {
    require: function () {
      if (localStorage.getItem(LS_KEY) === "1") return Promise.resolve(true);
      return new Promise(function (resolve) {
        pendingResolve = resolve;
        open();
      });
    },
    isAgreed: function () {
      return localStorage.getItem(LS_KEY) === "1";
    },
    reset: function () {
      localStorage.removeItem(LS_KEY);
    }
  };
})();