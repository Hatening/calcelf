/* =========================================================
   CalcElf v5.5.9 —— 学习档案 / 解析偏好 / 家长周报 设置面板
   数据存 profiles：stage_band / subject_pref / explain_level /
   weekly_report_email / weekly_report_to。
   ========================================================= */
(function(){
  function lang(){ return (typeof currentLang!=='undefined'?currentLang:(localStorage.getItem('calcelf_lang')||'en')); }

  const STAGES=[
    {k:'primary_1_3', en:'Grades 1–3','zh-CN':'小学 1–3 年级','zh-TW':'國小 1–3 年級',ja:'1–3年生（低学年）',ko:'초등 1–3학년',fr:'CP–CE2 (1re–3e)',de:'Klasse 1–3',es:'Grados 1–3',it:'Classi 1–3',ar:'الصفوف 1–3',fa:'پایه ۱ تا ۳'},
    {k:'primary_3_6', en:'Grades 4–6','zh-CN':'小学 4–6 年级','zh-TW':'國小 4–6 年級',ja:'4–6年生（中学年）',ko:'초등 4–6학년',fr:'CM1–6e (4e–6e)',de:'Klasse 4–6',es:'Grados 4–6',it:'Classi 4–6',ar:'الصفوف 4–6',fa:'پایه ۴ تا ۶'},
    {k:'middle_1_2',  en:'Grades 7–9','zh-CN':'初中 7–9 年级','zh-TW':'國中 7–9 年級',ja:'7–9年生（中学校）',ko:'중등 7–9학년',fr:'5e–3e (7e–9e)',de:'Klasse 7–9',es:'Grados 7–9',it:'Classi 7–9',ar:'الصفوف 7–9',fa:'پایه ۷ تا ۹'},
    {k:'grade_9_12',  en:'Grades 10–12','zh-CN':'高中 10–12 年级','zh-TW':'高中 10–12 年級',ja:'10–12年生（高校）',ko:'고등 10–12학년',fr:'2de–Term (10e–12e)',de:'Klasse 10–12',es:'Grados 10–12',it:'Classi 10–12',ar:'الصفوف 10–12',fa:'پایه ۱۰ تا ۱۲'},
    {k:'prefer_not',  en:'Prefer not to say','zh-CN':'暂不设置','zh-TW':'暫不設定',ja:'設定しない',ko:'지정 안 함',fr:'Je préfère ne pas dire',de:'Keine Angabe',es:'Prefiero no decirlo',it:'Preferisco non dirlo',ar:'أفضّل عدم التحديد',fa:'ترجیح می‌دهم نگویم'}
  ];
  const SUBJECTS=[
    {k:'math',en:'Math','zh-CN':'数学','zh-TW':'數學',ja:'数学',ko:'수학',fr:'Maths',de:'Mathe',es:'Matemáticas',it:'Matematica',ar:'رياضيات',fa:'ریاضی'},
    {k:'physics',en:'Physics','zh-CN':'物理','zh-TW':'物理',ja:'物理',ko:'물리',fr:'Physique',de:'Physik',es:'Física',it:'Fisica',ar:'فيزياء',fa:'فیزیک'},
    {k:'chemistry',en:'Chemistry','zh-CN':'化学','zh-TW':'化學',ja:'化学',ko:'화학',fr:'Chimie',de:'Chemie',es:'Química',it:'Chimica',ar:'كيمياء',fa:'شیمی'},
    {k:'biology',en:'Biology','zh-CN':'生物','zh-TW':'生物',ja:'生物',ko:'생물',fr:'Biologie',de:'Biologie',es:'Biología',it:'Biologia',ar:'أحياء',fa:'زیست'},
    {k:'english',en:'English / Reading','zh-CN':'英语 / 阅读','zh-TW':'英語 / 閱讀',ja:'英語 / 読解',ko:'영어 / 독해',fr:'Anglais / Lecture',de:'Englisch / Lesen',es:'Inglés / Lectura',it:'Inglese / Lettura',ar:'إنجليزي / قراءة',fa:'انگلیسی / خواندن'},
    {k:'history',en:'History','zh-CN':'历史','zh-TW':'歷史',ja:'歴史',ko:'역사',fr:'Histoire',de:'Geschichte',es:'Historia',it:'Storia',ar:'تاريخ',fa:'تاریخ'},
    {k:'geography',en:'Geography','zh-CN':'地理','zh-TW':'地理',ja:'地理',ko:'지리',fr:'Géographie',de:'Erdkunde',es:'Geografía',it:'Geografia',ar:'جغرافيا',fa:'جغرافیا'},
    {k:'cs',en:'Computer Science','zh-CN':'信息科技','zh-TW':'資訊科技',ja:'情報',ko:'정보',fr:'Numérique',de:'Informatik',es:'Informática',it:'Informatica',ar:'حاسوب',fa:'کامپیوتر'}
  ];
  const LEVELS=[
    {k:'answer_only',en:'Answer only','zh-CN':'只给答案','zh-TW':'只給答案',ja:'答えだけ',ko:'답만',fr:'Réponse seule',de:'Nur Antwort',es:'Solo respuesta',it:'Solo risposta',ar:'الإجابة فقط',fa:'فقط پاسخ'},
    {k:'steps',en:'Step by step','zh-CN':'分步讲解','zh-TW':'分步講解',ja:'ステップ解説',ko:'단계별 풀이',fr:'Étape par étape',de:'Schritt für Schritt',es:'Paso a paso',it:'Passo passo',ar:'خطوة بخطوة',fa:'گام‌به‌گام'},
    {k:'detailed',en:'Detailed + tips','zh-CN':'详细讲解','zh-TW':'詳細講解',ja:'詳しい解説',ko:'상세 풀이+팁',fr:'Détaillé + astuces',de:'Detailliert + Tipps',es:'Detallado + consejos',it:'Dettagliato + consigli',ar:'شرح مفصّل + نصائح',fa:'توضیح کامل + نکته'}
  ];
  const I18N={
    en:{title:'Learning settings',profile:'Learning profile',stage:'Grade / stage',subjects:'Focus subjects (tap several)',explain:'How detailed should solutions be?',weekly:'Weekly parent report',weeklyDesc:'A friendly progress email with strengths, weak spots and advice, once a week.',weeklyOn:'Send weekly report',parentEmail:'Parent email (optional — report goes here)',save:'Save settings',saved:'✓ Settings saved',login:'Please log in first',stageHint:'This tunes question difficulty and vocabulary.'},
    'zh-CN':{title:'学习设置',profile:'学习档案',stage:'年级 / 学段',subjects:'关注学科（可多选）',explain:'解题要多详细？',weekly:'家长周报',weeklyDesc:'每周一封学习进度邮件，包含掌握情况、薄弱点和建议。',weeklyOn:'开启每周学习简报',parentEmail:'家长邮箱（选填——周报发到这里）',save:'保存设置',saved:'✓ 设置已保存',login:'请先登录',stageHint:'用于匹配题目难度和讲解用词。'},
    'zh-TW':{title:'學習設定',profile:'學習檔案',stage:'年級 / 學段',subjects:'關注學科（可多選）',explain:'解題要多詳細？',weekly:'家長週報',weeklyDesc:'每週一封學習進度郵件，包含掌握情況、薄弱點和建議。',weeklyOn:'開啟每週學習簡報',parentEmail:'家長郵箱（選填——週報發到這裡）',save:'儲存設定',saved:'✓ 設定已儲存',login:'請先登入',stageHint:'用於匹配題目難度和講解用詞。'},
    ja:{title:'学習設定',profile:'学習プロフィール',stage:'学年 / ステージ',subjects:'重点科目（複数可）',explain:'解説の詳しさは？',weekly:'保護者への週間レポート',weeklyDesc:'週に1回、得意・苦手とアドバイスをまとめたメールを送ります。',weeklyOn:'週間レポートを受け取る',parentEmail:'保護者メール（任意 — 送信先）',save:'設定を保存',saved:'✓ 設定を保存しました',login:'先にログインしてください',stageHint:'問題の難易度と言葉づかいを合わせます。'},
    ko:{title:'학습 설정',profile:'학습 프로필',stage:'학년 / 단계',subjects:'중점 과목(여러 개)',explain:'풀이를 얼마나 자세히 할까요?',weekly:'주간 학부모 리포트',weeklyDesc:'주 1회, 잘하는 점·부족한 점과 조언을 이메일로 보내드려요.',weeklyOn:'주간 리포트 받기',parentEmail:'학부모 이메일(선택 — 여기로 전송)',save:'설정 저장',saved:'✓ 저장되었습니다',login:'먼저 로그인해 주세요',stageHint:'문제 난이도와 설명 어휘를 맞춥니다.'},
    fr:{title:'Réglages d’apprentissage',profile:'Profil d’apprentissage',stage:'Niveau / classe',subjects:'Matières prioritaires (plusieurs)',explain:'Quel niveau de détail pour les solutions ?',weekly:'Rapport hebdomadaire parent',weeklyDesc:'Chaque semaine, un e-mail avec acquis, points faibles et conseils.',weeklyOn:'Recevoir le rapport hebdo',parentEmail:'E-mail parent (facultatif — destinataire)',save:'Enregistrer',saved:'✓ Réglages enregistrés',login:'Veuillez vous connecter',stageHint:'Adapte la difficulté et le vocabulaire.'},
    de:{title:'Lerneinstellungen',profile:'Lernprofil',stage:'Klassenstufe',subjects:'Fokus-Fächer (mehrere)',explain:'Wie ausführlich sollen Lösungen sein?',weekly:'Wöchentlicher Elternbericht',weeklyDesc:'Einmal pro Woche eine E-Mail mit Stärken, Schwächen und Tipps.',weeklyOn:'Wochenbericht senden',parentEmail:'Eltern-E-Mail (optional — Empfänger)',save:'Speichern',saved:'✓ Gespeichert',login:'Bitte zuerst anmelden',stageHint:'Passt Schwierigkeit und Wortwahl an.'},
    es:{title:'Ajustes de aprendizaje',profile:'Perfil de aprendizaje',stage:'Grado / etapa',subjects:'Materias de interés (varias)',explain:'¿Qué detalle quieres en las soluciones?',weekly:'Informe semanal para padres',weeklyDesc:'Cada semana un correo con logros, puntos débiles y consejos.',weeklyOn:'Enviar informe semanal',parentEmail:'Correo del padre/madre (opcional — destinatario)',save:'Guardar ajustes',saved:'✓ Ajustes guardados',login:'Inicia sesión primero',stageHint:'Ajusta la dificultad y el vocabulario.'},
    it:{title:'Impostazioni di apprendimento',profile:'Profilo di apprendimento',stage:'Classe / fase',subjects:'Materie preferite (più scelte)',explain:'Quanto dettaglio vuoi nelle soluzioni?',weekly:'Report settimanale per i genitori',weeklyDesc:'Ogni settimana un’email con punti forti, deboli e consigli.',weeklyOn:'Invia report settimanale',parentEmail:'Email del genitore (facoltativa — destinatario)',save:'Salva impostazioni',saved:'✓ Impostazioni salvate',login:'Prima accedi',stageHint:'Adatta difficoltà e linguaggio.'},
    ar:{title:'إعدادات التعلم',profile:'ملف التعلم',stage:'الصف / المرحلة',subjects:'المواد المركّزة عليها (عدة)',explain:'ما مستوى تفصيل الحلول؟',weekly:'تقرير أسبوعي لولي الأمر',weeklyDesc:'مرة أسبوعيًا بريد بنقاط القوة والضعف والنصائح.',weeklyOn:'إرسال التقرير الأسبوعي',parentEmail:'بريد ولي الأمر (اختياري — المستلم)',save:'حفظ الإعدادات',saved:'✓ تم الحفظ',login:'يرجى تسجيل الدخول أولًا',stageHint:'يضبط صعوبة المسألة والمفردات.'},
    fa:{title:'تنظیمات یادگیری',profile:'پروفایل یادگیری',stage:'پایه / مقطع',subjects:'درس‌های مورد تمرکز (چندتایی)',explain:'پاسخ‌ها چقدر کامل باشند؟',weekly:'گزارش هفتگی والدین',weeklyDesc:'هفته‌ای یک ایمیل با نقاط قوت، ضعف و توصیه‌ها.',weeklyOn:'ارسال گزارش هفتگی',parentEmail:'ایمیل والدین (اختیاری — گیرنده)',save:'ذخیره تنظیمات',saved:'✓ تنظیمات ذخیره شد',login:'اول وارد شوید',stageHint:'دشواری و واژگان را متناسب می‌کند.'}
  };
  const tr=o=>o[lang()]||o.en;

  function toast(msg,type){
    let t=document.getElementById('calfToast');
    if(!t){t=document.createElement('div');t.id='calfToast';t.className='toast';document.body.appendChild(t);}
    t.textContent=msg;t.className='toast show '+(type||'info');
    clearTimeout(t._timer);t._timer=setTimeout(()=>t.classList.remove('show'),2400);
  }

  async function openSettings(){
    let s=null; try{ s=(typeof session==='function')?await session():null; }catch(_){}
    const I=tr(I18N);
    if(!s||!s.access_token){ if(typeof openModal==='function')openModal('authModal'); toast(I.login); return; }

    let ov=document.getElementById('settingsPanel');
    if(!ov){
      ov=document.createElement('div');ov.id='settingsPanel';ov.className='sp-overlay';
      ov.innerHTML=`<div class="sp-box">
        <button class="close" id="spClose">×</button>
        <h2 class="sp-title">⚙️ <span data-i="title"></span></h2>

        <h3 class="sp-sec" data-i="profile"></h3>
        <label class="sp-label" data-i="stage"></label>
        <select id="spStage" class="sp-select">${STAGES.map(x=>`<option value="${x.k}">${tr(x)}</option>`).join('')}</select>
        <p class="sp-hint" data-i="stageHint"></p>
        <label class="sp-label" data-i="subjects"></label>
        <div class="sp-chips" id="spSubjects">${SUBJECTS.map(x=>`<button type="button" class="sp-chip" data-k="${x.k}">${tr(x)}</button>`).join('')}</div>

        <h3 class="sp-sec" data-i="explain"></h3>
        <div class="sp-seg" id="spLevels">${LEVELS.map(x=>`<button type="button" class="sp-segbtn" data-k="${x.k}">${tr(x)}</button>`).join('')}</div>

        <h3 class="sp-sec" data-i="weekly"></h3>
        <p class="sp-hint" data-i="weeklyDesc"></p>
        <label class="sp-switch"><input type="checkbox" id="spWeeklyOn"><span data-i="weeklyOn"></span></label>
        <input type="email" id="spParentEmail" class="sp-input" style="margin-top:10px" autocomplete="email">

        <button class="btn primary sp-save" id="spSave"></button>
      </div>`;
      document.body.appendChild(ov);
      ov.querySelector('#spClose').onclick=()=>ov.classList.remove('open');
      ov.onclick=e=>{if(e.target===ov)ov.classList.remove('open');};
      ov.querySelectorAll('#spSubjects .sp-chip').forEach(c=>c.onclick=()=>c.classList.toggle('on'));
      ov.querySelectorAll('#spLevels .sp-segbtn').forEach(c=>c.onclick=()=>{ov.querySelectorAll('#spLevels .sp-segbtn').forEach(x=>x.classList.remove('on'));c.classList.add('on');});
      ov.querySelector('#spSave').onclick=()=>save(s);
    }
    localizePanel(ov);
    ov.classList.add('open');

    // load current values
    try{
      const r=await fetch('/api/profile',{headers:{Authorization:'Bearer '+s.access_token}});
      const j=await r.json(); const p=j.profile||{};
      ov.querySelector('#spStage').value=STAGES.some(x=>x.k===p.stage_band)?p.stage_band:'prefer_not';
      const subs=String(p.subject_pref||'').split(',').filter(Boolean);
      ov.querySelectorAll('#spSubjects .sp-chip').forEach(c=>c.classList.toggle('on',subs.includes(c.dataset.k)));
      const lvl=['answer_only','steps','detailed'].includes(p.explain_level)?p.explain_level:'steps';
      ov.querySelectorAll('#spLevels .sp-segbtn').forEach(c=>c.classList.toggle('on',c.dataset.k===lvl));
      ov.querySelector('#spWeeklyOn').checked=p.weekly_report_email!==false;
      ov.querySelector('#spParentEmail').value=p.weekly_report_to||'';
    }catch(e){}
  }
  window.openLearningSettings=openSettings;

  async function save(s){
    const ov=document.getElementById('settingsPanel');const I=tr(I18N);
    const payload={
      stage_band:ov.querySelector('#spStage').value,
      subject_pref:[...ov.querySelectorAll('#spSubjects .sp-chip.on')].map(c=>c.dataset.k).join(','),
      explain_level:ov.querySelector('#spLevels .sp-segbtn.on')?.dataset.k||'steps',
      weekly_report_email:ov.querySelector('#spWeeklyOn').checked,
      weekly_report_to:ov.querySelector('#spParentEmail').value.trim()
    };
    try{
      const r=await fetch('/api/profile',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+s.access_token},body:JSON.stringify(payload)});
      if(!r.ok)throw new Error('save failed');
      toast(I.saved,'success');ov.classList.remove('open');
      // 让主页学段/语言即时生效
      try{
        const st=document.getElementById('stage'); if(st){st.value=payload.stage_band;st.dispatchEvent(new Event('change'));}
      }catch(_){}
    }catch(e){ toast('✗ '+e.message,'error'); }
  }

  function localizePanel(ov){
    const I=tr(I18N);
    ov.querySelectorAll('[data-i]').forEach(el=>{el.textContent=I[el.dataset.i];});
    ov.querySelector('#spSave').textContent=I.save;
    ov.querySelector('#spParentEmail').placeholder=I.parentEmail;
    ov.querySelectorAll('#spSubjects .sp-chip').forEach(c=>{const x=SUBJECTS.find(q=>q.k===c.dataset.k);c.textContent=tr(x);});
    ov.querySelectorAll('#spLevels .sp-segbtn').forEach(c=>{const x=LEVELS.find(q=>q.k===c.dataset.k);c.textContent=tr(x);});
    const sel=ov.querySelector('#spStage');const cur=sel.value;
    sel.innerHTML=STAGES.map(x=>`<option value="${x.k}">${tr(x)}</option>`).join('');sel.value=cur;
  }
  window.calfLocalizeSettings=()=>{const ov=document.getElementById('settingsPanel');if(ov)localizePanel(ov);};
  document.addEventListener('calf:langchanged',()=>window.calfLocalizeSettings&&window.calfLocalizeSettings());

  function injectCss(){
    if(document.getElementById('spCss'))return;
    const s=document.createElement('style');s.id='spCss';
    s.textContent=`.sp-overlay{display:none;position:fixed;inset:0;z-index:320;background:rgba(15,23,42,.5);align-items:center;justify-content:center;padding:16px}
    .sp-overlay.open{display:flex}
    .sp-box{background:var(--card,#fff);color:var(--ink,#1f2937);border-radius:22px;max-width:560px;width:100%;max-height:90vh;overflow:auto;padding:24px;position:relative;box-shadow:0 30px 80px rgba(0,0,0,.35)}
    .sp-title{font-family:var(--display,inherit);margin:0 0 14px}
    .sp-sec{font-family:var(--display,inherit);font-size:16px;margin:20px 0 8px}
    .sp-label{display:block;font-weight:700;font-size:14px;margin-bottom:6px}
    .sp-hint{font-size:12px;color:var(--muted,#94a3b8);margin:6px 0}
    .sp-select,.sp-input{width:100%;box-sizing:border-box;padding:11px 13px;border:2px solid var(--line,#e5e7eb);border-radius:13px;font:inherit;font-size:14px;background:var(--card-soft,#f8fafc)}
    .sp-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}
    .sp-chip{border:2px solid var(--line,#e5e7eb);background:var(--card-soft,#f8fafc);border-radius:999px;padding:7px 14px;font-weight:700;font-size:13px;cursor:pointer;transition:all .12s}
    .sp-chip:hover{transform:translateY(-1px)}
    .sp-chip.on{background:linear-gradient(180deg,#5eead4,#14b8a6);border-color:#0d9488;color:#fff}
    .sp-seg{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
    .sp-segbtn{border:2px solid var(--line,#e5e7eb);background:var(--card-soft,#f8fafc);border-radius:13px;padding:11px 6px;font-weight:800;font-size:13px;cursor:pointer}
    .sp-segbtn.on{background:linear-gradient(180deg,#5eead4,#14b8a6);border-color:#0d9488;color:#fff;box-shadow:0 4px 0 #0f766e}
    .sp-switch{display:flex;align-items:center;gap:10px;font-weight:700;font-size:14px;cursor:pointer;margin:6px 0}
    .sp-switch input{width:20px;height:20px;accent-color:#14b8a6}
    .sp-save{width:100%;margin-top:22px;padding:13px;font-size:16px}`;
    document.head.appendChild(s);
  }

  // 头像下拉新增“学习设置”入口
  function addEntry(){
    const prof=[...document.querySelectorAll('#avatarDrop .ad-item')].find(b=>b.dataset.action==='profile');
    if(prof && !document.getElementById('settingsItem')){
      const b=document.createElement('button');b.id='settingsItem';b.className='ad-item';b.setAttribute('role','menuitem');
      b.style.cssText='width:100%;border:0;background:transparent;text-align:start;padding:10px 12px;border-radius:10px;cursor:pointer;font-weight:700;font-size:13.5px';
      b.onmouseenter=()=>b.style.background='var(--card-soft,#f1f5f9)';b.onmouseleave=()=>b.style.background='transparent';
      b.textContent='⚙️ '+tr(I18N).title;
      b.onclick=()=>openSettings();
      prof.parentNode.insertBefore(b,prof);
    }
  }
  function hookLang(){const prev=window.calfRefreshI18n;if(prev&&prev.__spWrapped)return;const fn=function(l){try{prev&&prev(l)}catch(_){}try{window.calfLocalizeSettings();const it=document.getElementById('settingsItem');if(it)it.textContent='⚙️ '+tr(I18N).title;}catch(_){}};fn.__spWrapped=true;window.calfRefreshI18n=fn;}
  function init(){injectCss();addEntry();hookLang();document.addEventListener('calf:avatar-menu-ready',addEntry);window.addEventListener('load',()=>setTimeout(()=>{hookLang();addEntry();},0));}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
