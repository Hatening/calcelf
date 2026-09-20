/* =========================================================
   CalcElf 主题切换 / 语言 / 流式解题 —— 新增交互层
   不覆盖 app.js 原有逻辑，只增强。
   ========================================================= */
(function(){

  const TOAST_I18N = {
    save: {'zh-CN':'✓ 外观已保存，将同步到所有设备','zh-TW':'✓ 外觀已儲存，將同步到所有裝置',en:'✓ Appearance saved and synced to your devices',ja:'✓ 外観を保存し、すべての端末に同期しました',ko:'✓ 외관이 저장되었으며 모든 기기에 동기화됩니다',fr:'✓ Apparence enregistrée et synchronisée sur tous vos appareils',de:'✓ Aussehen gespeichert und mit allen Geräten synchronisiert',es:'✓ Apariencia guardada y sincronizada en tus dispositivos',it:'✓ Aspetto salvato e sincronizzato su tutti i dispositivi',ar:'✓ تم حفظ المظهر ومزامنته على جميع أجهزتك',fa:'✓ ظاهر ذخیره و در همه دستگاه‌ها همگام‌سازی شد'},
    mascot: {'zh-CN':'吉祥物配色已切换','zh-TW':'吉祥物配色已切換',en:'Mascot color changed',ja:'マスコットの色を変更しました',ko:'마스코트 색상이 변경되었습니다',fr:'Couleur de la mascotte modifiée',de:'Maskottchenfarbe geändert',es:'Color de la mascota cambiado',it:'Colore della mascotte cambiato',ar:'تم تغيير لون التميمة',fa:'رنگ عوضک تغییر کرد'}
  };
  function tt(k){ const lang=(typeof currentLang!=='undefined'?currentLang:(localStorage.getItem('calcelf_lang')||'en')); return (TOAST_I18N[k][lang]||TOAST_I18N[k].en); }
  const root = document.documentElement;
  const CFG = window.CALFELF_CONFIG || {};

  // ---- 初始化主题 ----
  function applyTheme(t){
    root.dataset.theme = t;
    localStorage.setItem('calfelf_theme', t);
  }
  function applyMascotColor(c){
    localStorage.setItem('calfelf_mascot_color', c);
  }

  // 启动优先级：localStorage → 默认
  const savedTheme = localStorage.getItem('calfelf_theme') || CFG.DEFAULT_THEME || 'elf';
  applyTheme(savedTheme);
  applyMascotColor(localStorage.getItem('calfelf_mascot_color') || CFG.DEFAULT_MASCOT_COLOR || 'teal');

  // ---- Toast ----
  function toast(msg, type){
    let t = document.getElementById('calfToast');
    if(!t){ t = document.createElement('div'); t.id='calfToast'; t.className='toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.className = 'toast show ' + (type||'info');
    clearTimeout(t._timer);
    t._timer = setTimeout(()=>t.classList.remove('show'), 2400);
  }
  window.calfToast = toast;

  // ---- 主题设置面板注入 ----
  function buildThemePanel(){
    const panel = document.createElement('div');
    panel.id = 'themePanel';
    panel.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:200;display:none;align-items:center;justify-content:center;padding:14px';
    panel.innerHTML = `
      <div class="modalbox" style="max-width:520px">
        <button class="close" id="tpClose">×</button>
        <h2 style="font-family:var(--display);margin-bottom:4px">🎨 Appearance · 外观主题</h2>
        <p class="muted">同一套组件，只换配色。全龄可自由切换。</p>
        <div class="theme-panel" style="margin:14px 0">
          <div class="theme-opt" data-t="story"><div class="swatch" style="background:#e07a55"></div><div class="nm">魔法绘本</div><div class="tg">推荐 1-3 年级</div></div>
          <div class="theme-opt" data-t="elf"><div class="swatch" style="background:#14b8a6"></div><div class="nm">精灵乐园</div><div class="tg">推荐 3-6 年级</div></div>
          <div class="theme-opt" data-t="cloud"><div class="swatch" style="background:#6366f1"></div><div class="nm">云朵书房</div><div class="tg">推荐 7-9 年级</div></div>
          <div class="theme-opt" data-t="aurora"><div class="swatch" style="background:#7c3aed"></div><div class="nm">极光实验室</div><div class="tg">推荐 10-12 年级</div></div>
        </div>
        <h3 style="font-family:var(--display);font-size:15px;margin:14px 0 6px">🧚 吉祥物配色</h3>
        <div style="display:flex;gap:8px">
          <div class="theme-opt" data-m="teal" style="flex:1"><img src="/brand/mascot-teal-cut.png" style="width:44px;height:44px;object-fit:contain;margin:0 auto;display:block"><div class="tg">松石青</div></div>
          <div class="theme-opt" data-m="blue" style="flex:1"><img src="/brand/mascot-blue-cut.png" style="width:44px;height:44px;object-fit:contain;margin:0 auto;display:block"><div class="tg">蓝莓蓝</div></div>
          <div class="theme-opt" data-m="purple" style="flex:1"><img src="/brand/mascot-purple-cut.png" style="width:44px;height:44px;object-fit:contain;margin:0 auto;display:block"><div class="tg">莓果紫</div></div>
        </div>
        <div style="display:flex;gap:10px;margin-top:16px">
          <button class="btn primary" id="tpSave" style="flex:1">✓ 保留外观</button>
          <button class="btn secondary" id="tpCancel">↩ 取消</button>
        </div>
      </div>`;
    document.body.appendChild(panel);

    let previewTheme = savedTheme, previewMascot = localStorage.getItem('calfelf_mascot_color');
    function markActive(){
      panel.querySelectorAll('.theme-opt[data-t]').forEach(o=>o.classList.toggle('active', o.dataset.t===previewTheme));
      panel.querySelectorAll('.theme-opt[data-m]').forEach(o=>o.classList.toggle('active', o.dataset.m===previewMascot));
    }
    panel.querySelectorAll('.theme-opt[data-t]').forEach(o=>o.onclick=()=>{previewTheme=o.dataset.t; applyTheme(previewTheme); markActive();});
    panel.querySelectorAll('.theme-opt[data-m]').forEach(o=>o.onclick=()=>{previewMascot=o.dataset.m; applyMascotColor(previewMascot); markActive(); calfToast(tt('mascot'));});
    panel.querySelector('#tpSave').onclick=()=>{applyTheme(previewTheme); panel.style.display='none'; calfToast(tt('save'),'success');};
    panel.querySelector('#tpCancel').onclick=()=>{applyTheme(savedTheme); panel.style.display='none';};
    panel.querySelector('#tpClose').onclick=()=>panel.style.display='none';
    panel.onclick=(e)=>{if(e.target===panel)panel.style.display='none';};
    markActive();

    // 暴露打开入口
    window.openThemePanel = ()=>{panel.style.display='flex'; markActive();};
  }

  // 等 DOM 就绪
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', buildThemePanel);
  else buildThemePanel();

  // ---- 密码实时校验（注册表单）----
  function setupPasswordCheck(){
    const pw = document.getElementById('signupPassword');
    if(!pw) return;
    const box = document.createElement('div');
    box.style.cssText = 'margin-top:6px;font-size:12px;font-weight:700';
    box.innerHTML = `
      <div class="pw-check" id="pc1"><span class="no">○</span> 至少8位</div>
      <div class="pw-check" id="pc2"><span class="no">○</span> 含大写</div>
      <div class="pw-check" id="pc3"><span class="no">○</span> 含数字</div>
      <div class="pw-check" id="pc4"><span class="no">○</span> 含特殊字符</div>
      <div class="pw-bar"><i id="pwBar" style="width:0%"></i></div>`;
    pw.parentNode.insertBefore(box, pw.nextSibling);

    function check(){
      const v = pw.value;
      const c1 = v.length>=8, c2=/[A-Z]/.test(v), c3=/[0-9]/.test(v), c4=/[^a-zA-Z0-9]/.test(v);
      [['pc1',c1],['pc2',c2],['pc3',c3],['pc4',c4]].forEach(([id,ok])=>{
        const el=document.getElementById(id); if(el) el.querySelector('span').textContent = ok?'✓':'○';
        el.querySelector('span').className = ok?'ok':'no';
      });
      const score = [c1,c2,c3,c4].filter(Boolean).length;
      document.getElementById('pwBar').style.width = (score/4*100)+'%';
    }
    pw.addEventListener('input', check);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', setupPasswordCheck);
  else setupPasswordCheck();

  // 语言菜单统一由 app.js（v4.2 原生 11 语种、无刷新切换）负责，本文件不再重建
})();
