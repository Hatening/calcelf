/* =========================================================
   CalcElf v5.5.8 —— 12 生肖 Q版头像选择器（仅图标，无文字）
   预设头像，禁止上传真人照（COPPA）。头像 key 持久化到
   localStorage + profiles.avatar（/api/profile）。
   ========================================================= */
(function(){
  const LS='calfelf_avatar';
  const DIR='/avatars/zodiac/';
  // 12 生肖，仅图标展示（不显示中/英文名称）
  const ZODIAC=['rat','ox','tiger','rabbit','dragon','snake','horse','goat','monkey','rooster','dog','pig'];
  const DEFAULT_AV='rabbit';
  function lang(){ return (typeof currentLang!=='undefined'?currentLang:(localStorage.getItem('calcelf_lang')||'en')); }
  function img(key,cls){ return `<img src="${DIR}${key}.svg" alt="" class="${cls||'calf-av-img'}" loading="lazy">`; }
  window.calfAvatarImg=(key)=>img(ZODIAC.includes(key)?key:DEFAULT_AV);

  function current(){ const v=localStorage.getItem(LS); return ZODIAC.includes(v)?v:DEFAULT_AV; }

  function paintHeader(key){
    const face=document.getElementById('avatarBtnFace');
    if(face){ face.innerHTML=img(key,'calf-av-img'); const im=face.querySelector('img'); if(im){im.style.width='30px';im.style.height='30px';im.style.borderRadius='50%';im.style.background='#fff';im.style.objectFit='cover';} return; }
    const btn=document.getElementById('avatarBtn');
    if(!btn)return;
    btn.querySelectorAll('.calf-av-face').forEach(n=>n.remove());
    const w=document.createElement('span');w.className='calf-av-face';w.innerHTML=img(key);
    btn.insertBefore(w,btn.firstChild);
  }
  window.calfSetAvatar=async function(key){
    if(!ZODIAC.includes(key))return;
    localStorage.setItem(LS,key); paintHeader(key);
    try{ if(typeof session==='function'){ const s=await session(); if(s){ await fetch('/api/profile',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+s.access_token},body:JSON.stringify({avatar:key})}); } } }catch(_){}
  };

  const AP_I18N={
    en:{title:'Choose your buddy',hint:'Tap an avatar — no real photos, keeping everyone safe.'},
    'zh-CN':{title:'选一个生肖小伙伴',hint:'点头像即可——不使用真人照片，保护每个人的隐私。'},
    'zh-TW':{title:'選一個生肖小夥伴',hint:'點頭像即可——不使用真人照片，保護每個人的隱私。'},
    ja:{title:'相棒を選ぼう',hint:'アバターをタップ — 写真は使えません、みんなのプライバシーを守るために。'},
    ko:{title:'친구를 고르세요',hint:'아바타를 누르세요 — 실제 사진은 쓸 수 없어요.'},
    fr:{title:'Choisis ton compagnon',hint:'Touche un avatar — pas de vraies photos, pour la sécurité de tous.'},
    de:{title:'Wähle deinen Freund',hint:'Tippe auf ein Avatar — keine echten Fotos, das schützt alle.'},
    es:{title:'Elige tu compañero',hint:'Toca un avatar — sin fotos reales, para cuidar a todos.'},
    it:{title:'Scegli il tuo compagno',hint:'Tocca un avatar — niente foto vere, per la sicurezza di tutti.'},
    ar:{title:'اختر رفيقك',hint:'اضغط على صورة رمزية — لا صور حقيقية، لحماية الجميع.'},
    fa:{title:'همراهت را انتخاب کن',hint:'روی تصویرک بزن — بدون عکس واقعی، برای حفظ امنیت همه.'}
  };

  function openPicker(){
    let ov=document.getElementById('avatarPicker');
    if(!ov){
      ov=document.createElement('div');ov.id='avatarPicker';ov.className='ap-overlay';
      ov.innerHTML=`<div class="ap-box">
        <button class="close" id="apClose" aria-label="×">×</button>
        <h2 class="ap-title" data-ap="title">Choose your buddy</h2>
        <p class="muted" data-ap="hint"></p>
        <div class="ap-grid ap-icongrid">${ZODIAC.map(k=>`<button class="ap-cell ap-iconcell" data-id="${k}" aria-label="avatar">${img(k)}</button>`).join('')}</div>
      </div>`;
      document.body.appendChild(ov);
      localize();
      ov.querySelector('#apClose').onclick=()=>ov.classList.remove('open');
      ov.onclick=e=>{if(e.target===ov)ov.classList.remove('open');};
      ov.querySelectorAll('.ap-cell').forEach(c=>c.onclick=()=>{
        window.calfSetAvatar(c.dataset.id);
        ov.querySelectorAll('.ap-cell').forEach(x=>x.classList.toggle('sel',x===c));
        setTimeout(()=>ov.classList.remove('open'),240);
      });
    }
    ov.querySelectorAll('.ap-cell').forEach(x=>x.classList.toggle('sel',x.dataset.id===current()));
    localize();
    ov.classList.add('open');
  }
  window.openAvatarPicker=openPicker;

  function localize(){
    const d=AP_I18N[lang()]||AP_I18N.en;const ov=document.getElementById('avatarPicker');if(!ov)return;
    ov.querySelectorAll('[data-ap]').forEach(el=>{el.textContent=d[el.dataset.ap];});
  }
  window.calfLocalizeAvatars=localize;

  function injectCss(){
    if(document.getElementById('apCss'))return;
    const s=document.createElement('style');s.id='apCss';
    s.textContent=`.ap-overlay{display:none;position:fixed;inset:0;z-index:300;background:rgba(15,23,42,.5);align-items:center;justify-content:center;padding:16px}
    .ap-overlay.open{display:flex}
    .ap-box{background:var(--card,#fff);color:var(--ink,#1f2937);border-radius:22px;max-width:520px;width:100%;max-height:88vh;overflow:auto;padding:22px;position:relative;box-shadow:0 30px 80px rgba(0,0,0,.35)}
    .ap-title{font-family:var(--display,inherit);margin:0 0 4px}
    .ap-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:16px}
    .ap-cell{border:2px solid var(--line,#e5e7eb);background:var(--card-soft,#f8fafc);border-radius:18px;padding:8px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .12s,border-color .12s,box-shadow .12s}
    .ap-cell:hover{transform:translateY(-3px) scale(1.03)}
    .ap-cell:active{transform:translateY(0) scale(.97)}
    .ap-cell.sel{border-color:var(--primary,#14b8a6);box-shadow:0 0 0 3px rgba(20,184,166,.20)}
    .ap-iconcell{aspect-ratio:1/1}
    .ap-iconcell .calf-av-img{width:100%;height:100%;display:block;border-radius:14px}
    .calf-av-img{display:block}
    #avatarBtn .calf-av-face{width:30px;height:30px;display:inline-flex;border-radius:50%;overflow:hidden;background:#fff;flex:0 0 auto;box-shadow:0 1px 3px rgba(0,0,0,.18)}
    #avatarBtn .calf-av-face .calf-av-img{width:100%;height:100%}
    @media(max-width:560px){.ap-grid{grid-template-columns:repeat(3,1fr)}}`;
    document.head.appendChild(s);
  }

  function menuLabel(){ return '🧑‍🎨 '+(AP_I18N[lang()]||AP_I18N.en).title; }
  function addMenuEntry(){
    const prof=[...document.querySelectorAll('#avatarDrop .ad-item')].find(b=>b.dataset.action==='profile');
    if(prof && !document.getElementById('avatarPickItem')){
      const b=document.createElement('button');b.id='avatarPickItem';b.className='ad-item';b.setAttribute('role','menuitem');
      b.style.cssText='width:100%;border:0;background:transparent;text-align:start;padding:10px 12px;border-radius:10px;cursor:pointer;font-weight:700;font-size:13.5px';
      b.onmouseenter=()=>b.style.background='var(--card-soft,#f1f5f9)';b.onmouseleave=()=>b.style.background='transparent';
      b.textContent=menuLabel();
      b.onclick=()=>openPicker();
      prof.parentNode.insertBefore(b,prof.nextSibling);
    }
  }
  function localizeMenuEntry(){ const b=document.getElementById('avatarPickItem'); if(b) b.textContent=menuLabel(); }
  function init(){
    injectCss(); paintHeader(current()); localize(); addMenuEntry();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
  document.addEventListener('calf:avatar-menu-ready',()=>{ addMenuEntry(); paintHeader(current()); });
  document.addEventListener('calf:langchanged',()=>{ localize(); localizeMenuEntry(); });
})();
