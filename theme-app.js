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

  // ---- 主题设置面板注入（11 语本地化）----
  const TP_I18N={
    en:{title:'🎨 Appearance',sub:'Same components, only the colors change. Free to switch at any age.',tstory:'Storybook',telf:'Elf Playground',tcloud:'Cloud Study',taurora:'Aurora Lab',g1:'Ages 1–3',g2:'Ages 3–6',g3:'Ages 7–9',g4:'Ages 10–12',mascot:'🧚 Mascot color',teal:'Teal',blue:'Blue',berry:'Berry',save:'✓ Keep look',cancel:'↩ Cancel'},
    'zh-CN':{title:'🎨 外观主题',sub:'同一套组件，只换配色，全龄可自由切换。',tstory:'魔法绘本',telf:'精灵乐园',tcloud:'云朵书房',taurora:'极光实验室',g1:'推荐 1–3 年级',g2:'推荐 3–6 年级',g3:'推荐 7–9 年级',g4:'推荐 10–12 年级',mascot:'🧚 吉祥物配色',teal:'松石青',blue:'蓝莓蓝',berry:'莓果紫',save:'✓ 保留外观',cancel:'↩ 取消'},
    'zh-TW':{title:'🎨 外觀主題',sub:'同一套元件，只換配色，全年齡都可自由切換。',tstory:'魔法繪本',telf:'精靈樂園',tcloud:'雲朵書房',taurora:'極光實驗室',g1:'推薦 1–3 年級',g2:'推薦 3–6 年級',g3:'推薦 7–9 年級',g4:'推薦 10–12 年級',mascot:'🧚 吉祥物配色',teal:'松石青',blue:'藍莓藍',berry:'莓果紫',save:'✓ 保留外觀',cancel:'↩ 取消'},
    ja:{title:'🎨 テーマ',sub:'同じコンポーネントで色だけ変わります。年齢に関係なく自由に切替できます。',tstory:'絵本',telf:'エルフランド',tcloud:'クラウド書斎',taurora:'オーロララボ',g1:'1〜3年生向け',g2:'3〜6年生向け',g3:'7〜9年生向け',g4:'10〜12年生向け',mascot:'🧚 マスコットカラー',teal:'ティール',blue:'ブルー',berry:'ベリー',save:'✓ 適用',cancel:'↩ キャンセル'},
    ko:{title:'🎨 테마',sub:'같은 구성 요소에 색상만 바뀝니다. 누구나 자유롭게 전환할 수 있어요.',tstory:'동화책',telf:'엘프 놀이터',tcloud:'클라우드 서재',taurora:'오로라 랩',g1:'1–3학년 추천',g2:'3–6학년 추천',g3:'7–9학년 추천',g4:'10–12학년 추천',mascot:'🧚 마스코트 색상',teal:'틸',blue:'블루',berry:'베리',save:'✓ 적용',cancel:'↩ 취소'},
    fr:{title:'🎨 Apparence',sub:'Les mêmes éléments, seules les couleurs changent. À tout âge, changez librement.',tstory:'Livre d’histoires',telf:'Aire des elfes',tcloud:'Bureau nuage',taurora:'Lab. aurore',g1:'6–8 ans',g2:'8–11 ans',g3:'11–14 ans',g4:'14–18 ans',mascot:'🧚 Couleur de la mascotte',teal:'Sarcelle',blue:'Bleu',berry:'Baie',save:'✓ Garder',cancel:'↩ Annuler'},
    de:{title:'🎨 Design',sub:'Dieselben Elemente, nur andere Farben. Für jedes Alter frei wählbar.',tstory:'Bilderbuch',telf:'Elfen-Spielplatz',tcloud:'Wolken-Lesezimmer',taurora:'Aurora-Labor',g1:'6–8 Jahre',g2:'8–11 Jahre',g3:'11–14 Jahre',g4:'14–18 Jahre',mascot:'🧚 Maskottchenfarbe',teal:'Türkis',blue:'Blau',berry:'Beere',save:'✓ Behalten',cancel:'↩ Abbrechen'},
    es:{title:'🎨 Apariencia',sub:'Los mismos elementos, solo cambian los colores. Cámbialo libremente a cualquier edad.',tstory:'Cuento',telf:'Patio de elfos',tcloud:'Estudio nube',taurora:'Laboratorio aurora',g1:'6–8 años',g2:'8–11 años',g3:'11–14 años',g4:'14–18 años',mascot:'🧚 Color de mascota',teal:'Verde azulado',blue:'Azul',berry:'Baya',save:'✓ Conservar',cancel:'↩ Cancelar'},
    it:{title:'🎨 Aspetto',sub:'Stessi elementi, cambiano solo i colori. Cambia liberamente a ogni età.',tstory:'Libro di fiabe',telf:'Parco degli elfi',tcloud:'Studio nuvola',taurora:'Laboratorio aurora',g1:'6–8 anni',g2:'8–11 anni',g3:'11–14 anni',g4:'14–18 anni',mascot:'🧚 Colore mascotte',teal:'Teal',blue:'Blu',berry:'Bacca',save:'✓ Mantieni',cancel:'↩ Annulla'},
    ar:{title:'🎨 المظهر',sub:'نفس العناصر، تتغير الألوان فقط. بدّل بحرية في أي عمر.',tstory:'كتاب القصص',telf:'ساحة العفاريت',tcloud:'مكتبة السحابة',taurora:'مختبر الشفق',g1:'٦–٨ سنوات',g2:'٨–١١ سنة',g3:'١١–١٤ سنة',g4:'١٤–١٨ سنة',mascot:'🧚 لون التميمة',teal:'أزرق مخضر',blue:'أزرق',berry:'توت',save:'✓ حفظ المظهر',cancel:'↩ إلغاء'},
    fa:{title:'🎨 پوسته',sub:'همان اجزا، فقط رنگ‌ها عوض می‌شوند. در هر سن‌وسال آزادانه تغییر دهید.',tstory:'کتاب قصه',telf:'زمین الف‌ها',tcloud:'اتاق مطالعه ابری',taurora:'آزمایشگاه شفق',g1:'۶–۸ سال',g2:'۸–۱۱ سال',g3:'۱۱–۱۴ سال',g4:'۱۴–۱۸ سال',mascot:'🧚 رنگ عروسک',teal:'سبزآبی',blue:'آبی',berry:'توت',save:'✓ ذخیره پوسته',cancel:'↩ انصراف'}
  };
  function tpLang(){ try{ return window.CALF_LANG||localStorage.getItem('calcelf_lang')||'en'; }catch(e){ return 'en'; } }
  function buildThemePanel(){
    const panel = document.createElement('div');
    panel.id = 'themePanel';
    panel.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:200;display:none;align-items:center;justify-content:center;padding:14px';
    panel.innerHTML = `
      <div class="modalbox" style="max-width:520px">
        <button class="close" id="tpClose">×</button>
        <h2 style="font-family:var(--display);margin-bottom:4px" data-tp="title"></h2>
        <p class="muted" data-tp="sub"></p>
        <div class="theme-panel" style="margin:14px 0">
          <div class="theme-opt" data-t="story"><div class="swatch" style="background:#e07a55"></div><div class="nm" data-tp="tstory"></div><div class="tg" data-tp="g1"></div></div>
          <div class="theme-opt" data-t="elf"><div class="swatch" style="background:#14b8a6"></div><div class="nm" data-tp="telf"></div><div class="tg" data-tp="g2"></div></div>
          <div class="theme-opt" data-t="cloud"><div class="swatch" style="background:#6366f1"></div><div class="nm" data-tp="tcloud"></div><div class="tg" data-tp="g3"></div></div>
          <div class="theme-opt" data-t="aurora"><div class="swatch" style="background:#7c3aed"></div><div class="nm" data-tp="taurora"></div><div class="tg" data-tp="g4"></div></div>
        </div>
        <h3 style="font-family:var(--display);font-size:15px;margin:14px 0 6px" data-tp="mascot"></h3>
        <div style="display:flex;gap:8px">
          <div class="theme-opt" data-m="teal" style="flex:1"><img src="/brand/mascot-teal-cut.png" style="width:44px;height:44px;object-fit:contain;margin:0 auto;display:block"><div class="tg" data-tp="teal"></div></div>
          <div class="theme-opt" data-m="blue" style="flex:1"><img src="/brand/mascot-blue-cut.png" style="width:44px;height:44px;object-fit:contain;margin:0 auto;display:block"><div class="tg" data-tp="blue"></div></div>
          <div class="theme-opt" data-m="purple" style="flex:1"><img src="/brand/mascot-purple-cut.png" style="width:44px;height:44px;object-fit:contain;margin:0 auto;display:block"><div class="tg" data-tp="berry"></div></div>
        </div>
        <div style="display:flex;gap:10px;margin-top:16px">
          <button class="btn primary" id="tpSave" style="flex:1"></button>
          <button class="btn secondary" id="tpCancel"></button>
        </div>
      </div>`;
    document.body.appendChild(panel);
    function localizePanel(){ const d=TP_I18N[tpLang()]||TP_I18N.en; panel.querySelectorAll('[data-tp]').forEach(el=>{el.textContent=d[el.dataset.tp];}); const sv=panel.querySelector('#tpSave'),cx=panel.querySelector('#tpCancel'); if(sv)sv.textContent=d.save; if(cx)cx.textContent=d.cancel; }
    localizePanel();
    document.addEventListener('calf:langchanged',localizePanel);

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
    window.openThemePanel = ()=>{localizePanel(); panel.style.display='flex'; markActive();};
  }

  // 等 DOM 就绪
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', buildThemePanel);
  else buildThemePanel();

  // ---- 密码实时校验（注册表单）10语种 ----
  const PW_RULES = {
    'en':     ['At least 8 characters','Includes uppercase','Includes a number','Includes a special character'],
    'zh-CN':  ['至少8位','含大写','含数字','含特殊字符'],
    'zh-TW':  ['至少8位','含大寫','含數字','含特殊字元'],
    'ja':     ['8文字以上','大文字を含む','数字を含む','記号を含む'],
    'ko':     ['8자 이상','대문자 포함','숫자 포함','특수문자 포함'],
    'fr':     ['8 caractères minimum','Une majuscule','Un chiffre','Un caractère spécial'],
    'de':     ['Mindestens 8 Zeichen','Großbuchstabe','Zahl','Sonderzeichen'],
    'es':     ['Mínimo 8 caracteres','Una mayúscula','Un número','Un carácter especial'],
    'it':     ['Almeno 8 caratteri','Una maiuscola','Un numero','Un carattere speciale'],
    'ar':     ['٨ أحرف على الأقل','حرف كبير','رقم','رمز خاص'],
    'fa':     ['حداقل ۸ نویسه','حرف بزرگ','شامل عدد','نماد ویژه']
  };
  function pwText(lang){ return PW_RULES[lang] || PW_RULES['en']; }
  function setupPasswordCheck(){
    const pw = document.getElementById('signupPassword');
    if(!pw) return;
    const box = document.createElement('div');
    box.style.cssText = 'margin-top:6px;font-size:12px;font-weight:700';
    function render(lang){
      const t = pwText(lang);
      box.innerHTML = `
        <div class="pw-gems" aria-hidden="true"><i class="gem no" id="pg1"></i><i class="gem no" id="pg2"></i><i class="gem no" id="pg3"></i><i class="gem no" id="pg4"></i><span class="pw-gemlabel" id="pwGemLabel"></span></div>
        <div class="pw-bar"><i id="pwBar" style="width:0%"></i></div>
        <details class="pw-rules"><summary>🔐 ${t[0]} · ${t[1]} · ${t[2]} · ${t[3]}</summary>
          <div class="pw-check" id="pc1"><span class="no">○</span> ${t[0]}</div>
          <div class="pw-check" id="pc2"><span class="no">○</span> ${t[1]}</div>
          <div class="pw-check" id="pc3"><span class="no">○</span> ${t[2]}</div>
          <div class="pw-check" id="pc4"><span class="no">○</span> ${t[3]}</div>
        </details>`;
    }
    const cur = (window.CALF_LANG || 'en').replace('_','-');
    render(cur);
    pw.parentNode.insertBefore(box, pw.nextSibling);

    function check(){
      const v = pw.value;
      const c1 = v.length>=8, c2=/[A-Z]/.test(v), c3=/[0-9]/.test(v), c4=/[^a-zA-Z0-9]/.test(v);
      [['pc1',c1],['pc2',c2],['pc3',c3],['pc4',c4]].forEach(([id,ok])=>{
        const el=document.getElementById(id); if(el) el.querySelector('span').textContent = ok?'✓':'○';
        el.querySelector('span').className = ok?'ok':'no';
      });
      const score = [c1,c2,c3,c4].filter(Boolean).length;
      const bar=document.getElementById('pwBar'); if(bar){bar.style.width=(score/4*100)+'%';
        const cols=['#e5e7eb','#f87171','#fbbf24','#34d399','linear-gradient(90deg,#22d3ee,#a78bfa)'];
        bar.style.background=cols[score];}
      [['pg1',c1],['pg2',c2],['pg3',c3],['pg4',c4]].forEach(([id,ok])=>{const g=document.getElementById(id);if(g)g.className='gem '+(ok?'ok':'no');});
    }
    pw.addEventListener('input', check);
    // i18n 钩子：语言切换时重渲染
    window.calfRefreshI18n = function(lang){
      const l = (lang||'en').replace('_','-');
      render(l);
      check();
    };
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', setupPasswordCheck);
  else setupPasswordCheck();

  // 语言菜单统一由 app.js（v4.2 原生 11 语种、无刷新切换）负责，本文件不再重建
})();
