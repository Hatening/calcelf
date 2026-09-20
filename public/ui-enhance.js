/* =========================================================
   CalcElf UI Enhance —— 第二阶段补齐层
   不重写 app.js，只增强：流式解题 / 购买流程 / 头像下拉 /
   分栏认证 / 仪表盘 / 主题入口。
   ========================================================= */
(function(){
  const $ = (id)=>document.getElementById(id);
  const CFG = window.CALFELF_CONFIG || {};
  const BRAND = '/brand';

  // ---------- 工具：Toast ----------
  function toast(msg, type){
    let t = $('calfToast');
    if(!t){ t=document.createElement('div'); t.id='calfToast'; t.className='toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.className = 'toast show ' + (type||'info');
    clearTimeout(t._timer); t._timer=setTimeout(()=>t.classList.remove('show'),2600);
  }
  window.calfToast = toast;

  // ============================================================
  // 1. 前端流式解题（SSE + 骨架屏 + typewriter + 停止 + 回退）
  // ============================================================
  let streamAbort = null;

  function buildStreamingUI(){
    // 在 loading 区域注入阶段进度条 + 停止按钮
    const loading = $('loading');
    if(!loading) return;
    loading.innerHTML = `
      <div style="text-align:center;padding:20px">
        <img src="${BRAND}/pose-think-cut.png" style="width:80px;height:80px;object-fit:contain;margin:0 auto 10px;display:block;animation:bounce 1.2s infinite">
        <div id="streamStage" style="font-family:var(--display);font-weight:600;font-size:16px;margin-bottom:12px">🔍 正在识别题目…</div>
        <div style="max-width:340px;margin:0 auto 14px">
          <div class="skeleton" style="height:14px;margin-bottom:8px"></div>
          <div class="skeleton" style="height:14px;width:80%;margin-bottom:8px"></div>
          <div class="skeleton" style="height:14px;width:60%"></div>
        </div>
        <div id="streamType" style="font-size:13px;line-height:1.7;min-height:40px;max-width:480px;margin:0 auto;white-space:pre-wrap;text-align:left"></div>
        <button id="streamStop" class="btn secondary" style="margin-top:14px;padding:8px 20px">⏹ 停止生成</button>
      </div>`;
    // bounce keyframe
    if(!document.getElementById('bounceKf')){
      const s=document.createElement('style'); s.id='bounceKf';
      s.textContent='@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}';
      document.head.appendChild(s);
    }
    $('streamStop').onclick = ()=>{ if(streamAbort) streamAbort.abort(); toast('已停止生成','info'); };
  }

  async function streamSolve(data){
    loading.classList.add('show');
    buildStreamingUI();
    const stageEl = $('streamStage');
    const typeEl = $('streamType');
    let acc = '';

    streamAbort = new AbortController();
    try {
      const r = await fetch('/api/solve?stream=1', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(data),
        signal: streamAbort.signal
      });

      if(!r.ok){ throw new Error('SSE failed, falling back'); }

      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = '';

      while(true){
        const {done, value} = await reader.read();
        if(done) break;
        buffer += decoder.decode(value, {stream:true});
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for(const line of lines){
          const t = line.trim();
          if(t.startsWith('event:')){ currentEvent = t.slice(6).trim(); continue; }
          if(t.startsWith('data:')){
            try{
              const j = JSON.parse(t.slice(5).trim());
              if(currentEvent==='progress' && stageEl){
                stageEl.textContent = '🔍 ' + (j.label||'');
              } else if(currentEvent==='delta' && typeEl){
                acc += j.text;
                typeEl.textContent = acc;
                typeEl.scrollTop = typeEl.scrollHeight;
              } else if(currentEvent==='result'){
                // 渲染最终结果到现有 result 区
                loading.classList.remove('show');
                renderFinalResult(j.result, j.credits, j.is_grace);
                toast('✅ 解题成功','success');
              } else if(currentEvent==='error'){
                throw new Error(j.message||'AI error');
              }
            }catch(e){ /* skip parse errors */ }
          }
        }
      }
    } catch(e){
      // SSE 失败 → 回退到原有 JSON 逻辑（调用原 solve）
      console.warn('SSE failed, falling back to JSON:', e.message);
      loading.classList.remove('show');
      if(typeof solve === 'function' && !e.message.includes('abort')){
        // 调用原有 solve（会重新走 fetch /api/solve 非流式）
        try{ await solve(); }catch(_){}
      }
    }
  }

  function renderFinalResult(result, credits, isGrace){
    const q = result.question_text||'';
    document.getElementById('question').textContent = q;
    document.getElementById('subject').textContent = result.subject||'';
    const ss = (result.solutions||[]).slice(0,3);
    document.getElementById('count').textContent = ss.length + ' method(s)';
    document.getElementById('solutions').innerHTML = ss.map((sol,i)=>
      `<div class="solution"><b>💡 ${sol.name||'Method '+(i+1)}</b>${sol.recommended?'<span class="pill">⭐</span>':''}` +
      (sol.steps||[]).map((st,idx)=>{
        const n = st.step||st.n||idx+1;
        const d = st.description||st.text||'';
        const f = st.formula||st.equation||'';
        return `<div class="step"><div class="num">${n}</div><div>${d}${f?`<div class="formula">${f}</div>`:''}</div></div>`;
      }).join('') + '</div>'
    ).join('');
    document.getElementById('result').style.display='block';
    if(credits!=null) document.getElementById('credits').textContent = credits;
  }

  // 劫持解题按钮：优先走 SSE 流式
  function hijackSolveButton(){
    const btn = document.getElementById('solveBtn');
    if(!btn) return;
    // 直接覆盖 onclick：本脚本在 DOMContentLoaded 时初始化（晚于 app.js 解析期绑定），
    // 确保只走 SSE 流式，不与 v4.2 原生 solve() 并发
    btn.onclick = async function(e){
      e.preventDefault();
      const textInput = (document.getElementById('text')||{}).value || '';
      if(!textInput.trim()){ toast('请输入题目'); return; }
      const data = {
        imageBase64: window.imageBase64 || null,
        text: textInput,
        stage: (document.getElementById('stage')||{}).value || 'prefer_not',
        language: localStorage.getItem('calcelf_lang') || 'en',
        animationRequested: (document.getElementById('wantAnim')||{}).checked || false,
        turnstileToken: '', installId: ''
      };
      await streamSolve(data);
    };
  }

  // ============================================================
  // 2. 完整购买流程 Modal
  // ============================================================
  function buildPurchaseModal(){
    const existing = document.getElementById('purchaseModal');
    if(existing) return;

    const plans = CFG.PLANS || [];
    const packs = CFG.TOPUP_PACKS || [];

    const el = document.createElement('div');
    el.id = 'purchaseModal';
    el.className = 'modal';
    el.innerHTML = `
      <div class="modalbox" style="max-width:680px">
        <button class="close" id="pmClose">×</button>
        <div id="pmView">
          <h2 style="font-family:var(--display);margin-bottom:4px">🚀 选择你的计划</h2>
          <p class="muted" style="margin-bottom:16px">月度 / 终身双轨 · 无无限 AI 档位 · 儿童树苗 vs 成人钱包两套语境</p>

          <h3 style="font-family:var(--display);font-size:15px;margin:16px 0 8px">📅 月度订阅</h3>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
            ${plans.map(p=>`
              <div class="plan" style="border:2px solid ${p.tag==='POPULAR'?'var(--accent)':'var(--line)'};border-radius:16px;padding:14px;text-align:center;position:relative">
                ${p.tag==='POPULAR'?'<div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:var(--accent);color:#fff;font-size:10px;font-weight:800;padding:2px 10px;border-radius:99px">POPULAR</div>':''}
                <div style="font-family:var(--display);font-weight:600;font-size:15px">${p.name}</div>
                <div style="font-size:26px;font-weight:900;margin:6px 0">$${p.price}</div>
                <div style="font-size:11px;color:var(--muted)">${p.monthlyCredits} 月度 Credits</div>
                <button class="btn ${p.tag==='POPULAR'?'primary':'secondary'}" data-buy="${p.id}" style="width:100%;margin-top:10px;padding:9px">选择</button>
              </div>`).join('')}
          </div>

          <h3 style="font-family:var(--display);font-size:15px;margin:20px 0 8px">💎 Credits 充值包</h3>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
            ${packs.map(p=>`
              <div style="border:1.5px solid var(--line);border-radius:14px;padding:12px;text-align:center">
                <div style="font-size:20px;font-weight:900">${p.credits}</div>
                <div style="font-size:11px;color:var(--muted)">Credits</div>
                <div style="font-size:18px;font-weight:800;margin:4px 0">$${p.price}</div>
                <button class="btn secondary" data-buy="${p.id}" style="width:100%;padding:7px;font-size:13px">购买</button>
              </div>`).join('')}
          </div>
        </div>

        <!-- 结账视图 -->
        <div id="pmCheckout" style="display:none">
          <h2 style="font-family:var(--display);margin-bottom:12px">💳 结账</h2>
          <div style="background:var(--card-soft);border-radius:14px;padding:14px;margin-bottom:14px">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>订单</span><b id="coName">—</b></div>
            <div style="display:flex;justify-content:space-between"><span>金额</span><b id="coPrice">—</b></div>
          </div>
          <label>促销码</label>
          <div style="display:flex;gap:8px;margin-bottom:12px">
            <input placeholder="输入促销码" style="flex:1">
            <button class="btn secondary" style="padding:9px 14px">应用</button>
          </div>
          <div style="border:1.5px dashed var(--line);border-radius:14px;padding:20px;text-align:center;color:var(--muted);font-size:13px;margin-bottom:14px">
            💳 Stripe Card Element 接线位置<br><span style="font-size:11px"></span>
          </div>
          <button class="btn primary" id="coPay" style="width:100%">支付</button>
          <button class="btn secondary" id="coBack" style="width:100%;margin-top:8px">← 返回</button>
        </div>

        <!-- 状态页 -->
        <div id="pmStatus" style="display:none;text-align:center;padding:20px 0">
          <img id="pmStatusImg" src="" style="width:100px;height:100px;object-fit:contain;margin:0 auto 14px;display:block">
          <h2 id="pmStatusTitle" style="font-family:var(--display);margin-bottom:6px">—</h2>
          <p id="pmStatusMsg" class="muted" style="margin-bottom:16px">—</p>
          <button class="btn primary" id="pmStatusClose" style="width:100%">完成</button>
        </div>
      </div>`;
    document.body.appendChild(el);

    el.querySelector('#pmClose').onclick = ()=>el.classList.remove('open');
    el.onclick = (e)=>{ if(e.target===el) el.classList.remove('open'); };
    el.querySelector('#coBack').onclick = ()=>{ el.querySelector('#pmView').style.display='block'; el.querySelector('#pmCheckout').style.display='none'; };
    el.querySelector('#coPay').onclick = ()=>showPurchaseStatus('success');
    el.querySelector('#pmStatusClose').onclick = ()=>el.classList.remove('open');

    el.querySelectorAll('[data-buy]').forEach(b=>{
      b.onclick = ()=>{
        const id = b.dataset.buy;
        const plan = plans.find(p=>p.id===id) || packs.find(p=>p.id===id);
        if(!plan) return;
        el.querySelector('#coName').textContent = plan.name||plan.credits+' Credits';
        el.querySelector('#coPrice').textContent = '$'+plan.price;
        el.querySelector('#pmView').style.display='none';
        el.querySelector('#pmCheckout').style.display='block';
      };
    });

    function showPurchaseStatus(type){
      el.querySelector('#pmCheckout').style.display='none';
      el.querySelector('#pmView').style.display='none';
      el.querySelector('#pmStatus').style.display='block';
      const img = $('pmStatusImg');
      const title = $('pmStatusTitle');
      const msg = $('pmStatusMsg');
      if(type==='success'){
        img.src = BRAND+'/pose-cheer-cut.png';
        title.textContent = '🎉 支付成功！';
        msg.textContent = 'Credits 已到账，开始解题吧！';
      } else if(type==='cancel'){
        img.src = BRAND+'/pose-think-cut.png';
        title.textContent = '已取消支付';
        msg.textContent = '你随时可以回来继续。';
      } else {
        img.src = BRAND+'/pose-error-cut.png';
        title.textContent = '支付失败';
        msg.textContent = '请检查支付方式后重试。';
      }
    }

    // 暴露打开函数
    window.openPurchaseModal = ()=>{
      el.classList.add('open');
      el.querySelector('#pmView').style.display='block';
      el.querySelector('#pmCheckout').style.display='none';
      el.querySelector('#pmStatus').style.display='none';
    };
  }

  const AUTH_LABEL={'zh-CN':'登录/注册','zh-TW':'登入/註冊',en:'Log in / Sign up',ja:'ログイン / 登録',ko:'로그인 / 가입',fr:'Connexion / Inscription',de:'Anmelden',es:'Entrar / Registro',it:'Accedi / Registrati',ar:'تسجيل الدخول',fa:'ورود / ثبت‌نام'};
  function setAnonymousLabel(lang){
    const el=$('avatarLabel'); if(!el) return;
    const realName = el.dataset.realName;
    if(realName){ el.textContent=realName; return; }
    el.textContent = AUTH_LABEL[lang]||AUTH_LABEL.en;
  }
  window.calfRefreshI18n=function(lang){ setAnonymousLabel(lang); };

  // ============================================================
  // 3. 顶部头像下拉菜单
  // ============================================================
  function buildAvatarDropdown(){
    const actions = document.querySelector('.top-actions');
    if(!actions) return;
    // 单一账户入口：隐藏 v4.2 原生 Account 按钮与顶部 emoji 头像，统一为品牌吉祥物胶囊
    const oldAcct = document.getElementById('accountBtn');
    if(oldAcct) oldAcct.style.display='none';
    const oldAvatar = document.getElementById('profileAvatarDisplay');
    if(oldAvatar) oldAvatar.style.display='none';

    const avatar = document.createElement('div');
    avatar.id='avatarMenu';
    avatar.style.cssText='position:relative';
    avatar.innerHTML = `
      <button id="avatarBtn" style="display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.3);border-radius:99px;padding:5px 12px 5px 6px;color:#fff;cursor:pointer">
        <img src="${BRAND}/mascot-teal-cut.png" style="width:28px;height:28px;border-radius:50%;object-fit:cover;background:#fff">
        <span style="font-size:12px;font-weight:700" id="avatarLabel"></span>
      </button>
      <div id="avatarDrop" style="display:none;position:absolute;top:calc(100%+8px);right:0;min-width:200px;background:var(--card);color:var(--ink);border-radius:14px;box-shadow:0 16px 44px rgba(0,0,0,.18);z-index:80;padding:6px">
        <button class="ad-item" data-action="profile" style="width:100%;border:0;background:transparent;text-align:left;padding:10px 12px;border-radius:9px;cursor:pointer;font-weight:600;font-size:13px">👤 个人中心</button>
        <button class="ad-item" data-action="levels" style="width:100%;border:0;background:transparent;text-align:left;padding:10px 12px;border-radius:9px;cursor:pointer;font-weight:600;font-size:13px">🏅 我的等级与进度</button>
        <button class="ad-item" data-action="theme" style="width:100%;border:0;background:transparent;text-align:left;padding:10px 12px;border-radius:9px;cursor:pointer;font-weight:600;font-size:13px">🎨 外观主题</button>
        <button class="ad-item" data-action="credits" style="width:100%;border:0;background:transparent;text-align:left;padding:10px 12px;border-radius:9px;cursor:pointer;font-weight:600;font-size:13px">🪙 Credits 余额</button>
        <button class="ad-item" data-action="membership" style="width:100%;border:0;background:transparent;text-align:left;padding:10px 12px;border-radius:9px;cursor:pointer;font-weight:600;font-size:13px">💎 会员状态</button>
        <div style="height:1px;background:var(--line);margin:4px 0"></div>
        <button class="ad-item" data-action="logout" style="width:100%;border:0;background:transparent;text-align:left;padding:10px 12px;border-radius:9px;cursor:pointer;font-weight:600;font-size:13px;color:var(--danger)">🚪 退出登录</button>
      </div>`;
    if(oldAcct && oldAcct.parentNode===actions) actions.insertBefore(avatar, oldAcct);
    else actions.appendChild(avatar);

    const btn = $('avatarBtn');
    const drop = $('avatarDrop');
    btn.onclick = async (e)=>{
      e.stopPropagation();
      let s=null;
      try{ s = (typeof session==='function') ? await session() : null; }catch(_){}
      const real = s && s.user && !s.user.is_anonymous;
      if(real){ drop.style.display = drop.style.display==='block'?'none':'block'; }
      else if(typeof auth==='function'){ auth(); }
    };
    document.addEventListener('click', ()=>drop.style.display='none');
    drop.onclick = (e)=>e.stopPropagation();

    drop.querySelectorAll('.ad-item').forEach(item=>{
      item.onclick = async ()=>{
        const a = item.dataset.action;
        drop.style.display='none';
        if(a==='theme' && window.openThemePanel) window.openThemePanel();
        else if((a==='credits'||a==='membership') && typeof openModal==='function') openModal('plansModal');
        else if((a==='profile'||a==='levels') && document.getElementById('membershipCard')) document.getElementById('membershipCard').scrollIntoView({behavior:'smooth'});
        else if(a==='logout'){
          try{ if(window.sb) await window.sb.auth.signOut(); }catch(_){}
          location.reload();
        }
      };
    });

    // 已登录真实用户：胶囊显示其名称
    (async()=>{
      try{
        const s = (typeof session==='function') ? await session() : null;
        if(s && s.user && !s.user.is_anonymous){
          const md=s.user.user_metadata||{};
          const rn=md.display_name || md.name || s.user.email || '我的账户'; const lab=$('avatarLabel'); lab.dataset.realName=rn; lab.textContent=rn;
        }
      }catch(_){}
    })();
  }

  // ============================================================
  // 4. 学习仪表盘（首页三统计卡）
  // ============================================================
  function buildDashboard(){
    const hero = document.querySelector('.card');
    if(!hero) return;
    const dash = document.createElement('div');
    dash.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0';
    dash.innerHTML = `
      <div style="background:var(--card-soft);border-radius:14px;padding:14px;text-align:center;border:1.5px solid var(--line)">
        <div style="font-family:var(--display);font-weight:700;font-size:22px">12</div>
        <div style="font-size:11px;color:var(--muted);font-weight:700">今日练习</div>
      </div>
      <div style="background:var(--card-soft);border-radius:14px;padding:14px;text-align:center;border:1.5px solid var(--line)">
        <div style="font-family:var(--display);font-weight:700;font-size:22px">94%</div>
        <div style="font-size:11px;color:var(--muted);font-weight:700">正确率</div>
      </div>
      <div style="background:var(--card-soft);border-radius:14px;padding:14px;text-align:center;border:1.5px solid var(--line)">
        <div style="font-family:var(--display);font-weight:700;font-size:22px">🔥5</div>
        <div style="font-size:11px;color:var(--muted);font-weight:700">连续天数</div>
      </div>`;
    hero.parentNode.insertBefore(dash, hero.nextSibling);
  }

  // ============================================================
  // 5. Buy/Manage 按钮接入购买流程
  // ============================================================
  function hijackBuyButtons(){
    const buy = $('buyBtn');
    if(buy) buy.onclick = (e)=>{ e.stopPropagation(); if(window.openPurchaseModal) window.openPurchaseModal(); };
    const manage = $('billingBtn');
    if(manage) manage.onclick = (e)=>{ e.stopPropagation(); billing(); };
  }

  // ============================================================
  // 初始化
  // ============================================================
  function init(){
    buildAvatarDropdown();
    setAnonymousLabel(localStorage.getItem('calcelf_lang')||'en');
    hijackSolveButton();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
