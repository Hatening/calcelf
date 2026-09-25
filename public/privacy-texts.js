/* =========================================================
   CalcElf 隐私弹窗短文案包 v5.5.3（11 语种）
   只包含标题/滚动提示/两个确认勾选项等短标签；
   完整 14 节《隐私声明与教育免责》正文已按语种外置为
   /legal/privacy.<lang>.html，由 PRIVACY_TEXTS.fetchNotice()
   在需要时按需加载，不占用主程序体积。修改法律正文请直接改
   /legal/ 下对应语种文件。
   ========================================================= */
window.PRIVACY_TEXTS = {
  "en": {
    title: "CalcElf Privacy Notice & Educational Use Disclaimer",
    scrollHint: "Please read to the end before confirming.",
    ack: "I have read and understood the Privacy Notice.",
    parentAck: "I am the parent/guardian authorised to provide consent for the relevant minor, where required."
  },
  "zh-CN": {
    title: "CalcElf 隐私声明与教育用途免责声明",
    scrollHint: "请阅读至底部，再进行确认。",
    ack: "我已阅读并理解《隐私声明》。",
    parentAck: "我是有权为相关未成年人作出该决定的家长/监护人（如适用）。"
  },
  "zh-TW": {
    title: "CalcElf 隱私聲明與教育用途免責聲明",
    scrollHint: "請閱讀至底部，再進行確認。",
    ack: "我已閱讀並理解《隱私聲明》。",
    parentAck: "我是有權為相關未成年人作成該決定的家長／監護人（如適用）。"
  },
  "ja": {
    title: "CalcElf プライバシー通知および教育利用に関する免責事項",
    scrollHint: "最後までお読みになってから確認してください。",
    ack: "プライバシー通知を読み、内容を理解しました。",
    parentAck: "私は、必要な場合に当該未成年者について同意する権限を有する保護者です。"
  },
  "ko": {
    title: "CalcElf 개인정보 처리방침 및 교육용 면책 고지",
    scrollHint: "끝까지 읽은 후 확인해 주세요.",
    ack: "개인정보 처리방침을 읽고 이해했습니다.",
    parentAck: "필요한 경우 해당 미성년자에 대해 동의할 권한이 있는 부모 또는 법정대리인입니다."
  },
  "fr": {
    title: "Avis de confidentialité et avis de non-responsabilité pédagogique de CalcElf",
    scrollHint: "Veuillez lire jusqu’à la fin avant de confirmer.",
    ack: "J’ai lu et compris l’avis de confidentialité.",
    parentAck: "Je suis le parent/tuteur habilité à consentir pour le mineur concerné, lorsque requis."
  },
  "de": {
    title: "CalcElf Datenschutzhinweis und Haftungsausschluss für Bildungszwecke",
    scrollHint: "Bitte lesen Sie bis zum Ende, bevor Sie bestätigen.",
    ack: "Ich habe den Datenschutzhinweis gelesen und verstanden.",
    parentAck: "Ich bin, soweit erforderlich, der zur Einwilligung berechtigte Elternteil/gesetzliche Vertreter."
  },
  "es": {
    title: "Aviso de privacidad y exención de responsabilidad educativa de CalcElf",
    scrollHint: "Lea hasta el final antes de confirmar.",
    ack: "He leído y comprendido el aviso de privacidad.",
    parentAck: "Soy el padre/madre o tutor autorizado para consentir en nombre del menor, cuando sea necesario."
  },
  "it": {
    title: "Informativa sulla privacy e limitazione di responsabilità educativa di CalcElf",
    scrollHint: "Leggere fino alla fine prima di confermare.",
    ack: "Ho letto e compreso l’informativa sulla privacy.",
    parentAck: "Sono il genitore/tutore autorizzato a prestare il consenso per il minore, quando richiesto."
  },
  "ar": {
    title: "إشعار الخصوصية وإخلاء المسؤولية عن الاستخدام التعليمي في CalcElf",
    scrollHint: "يرجى القراءة حتى النهاية قبل التأكيد.",
    ack: "لقد قرأت إشعار الخصوصية وفهمته.",
    parentAck: "أنا الوالد/ولي الأمر المخول بالموافقة نيابة عن القاصر عند الاقتضاء."
  },
  "fa": {
    title: "اعلامیه حریم خصوصی و سلب مسئولیت آموزشی CalcElf",
    scrollHint: "لطفاً پیش از تأیید، تا پایان مطالعه کنید.",
    ack: "اعلامیه حریم خصوصی را خوانده و درک کرده‌ام.",
    parentAck: "در صورت لزوم، والد یا سرپرست قانونی دارای اختیار برای رضایت از طرف کودک هستم."
  },
};


/* =========================================================
   v5.5.3 适配器：语言解析 + 弹窗/页面 UI 文案（11 语种）
   正文 PRIVACY_TEXTS 按语言独立维护；本块只负责：
   1) 按 localStorage(calcelf_lang) / 浏览器语言选择语种；
   2) 提供弹窗按钮、状态提示等短文案；
   3) 法律正文片段由 /legal/notice.<lang>.html 按需 fetch，
      不打包进主程序（见 privacy-center.html）。
   ========================================================= */
(function () {
  var UI = {
    en: { agree: "Agree & Continue", confirm: "I agree — continue", wait: "Please keep reading", close: "Close", overlay: "Please scroll to the bottom to read the full notice", parentReq: "Please tick both confirmations to continue.", center: "Open the full Privacy Center", terms: "Terms of Service", matrixTitle: "Regional legal framework matrix (reference, English)", matrixNote: "The matrix below summarises the frameworks reviewed on September 20, 2026. It is reference material, not legal advice, and is kept in English for accuracy.", draft: "Template notice — not legal advice. Validate with local counsel before launch in each jurisdiction.", eff: "Effective date", loading: "Loading the privacy notice in your language…", loadFail: "Could not load this language version. Showing English instead.", langLabel: "Language", backApp: "← Back to CalcElf", consent1: "Acknowledgement", consent2: "Parent / guardian consent", consent1Hint: "I have read and understood the Privacy Notice.", consent2Hint: "Required where the learner is a minor", fullCenterLink: "Full privacy notice, regional matrix & rights requests →" },
    "zh-CN": { agree: "同意并继续", confirm: "我已阅读，同意并继续", wait: "请继续停留阅读", close: "关闭", overlay: "请滑动到底部阅读完整声明", parentReq: "请勾选两项确认后再继续。", center: "打开完整隐私中心", terms: "服务条款", matrixTitle: "各地区法律框架矩阵（英文参考资料）", matrixNote: "以下矩阵汇总了 2026 年 9 月 20 日梳理的各司法辖区框架，仅供参考，不构成法律意见；为保证准确性保留英文原文。", draft: "模板声明，不构成法律意见。在各司法辖区上线前请交由当地律师审核。", eff: "生效日期", loading: "正在加载您所选语言的隐私声明…", loadFail: "该语言版本加载失败，已为您显示英文版本。", langLabel: "语言", backApp: "← 返回 CalcElf", consent1: "已读确认", consent2: "家长 / 监护人同意", consent1Hint: "我已阅读并理解《隐私声明》。", consent2Hint: "学习者为未成年人时必勾", fullCenterLink: "完整隐私声明、地区法律矩阵与权利请求 →" },
    "zh-TW": { agree: "同意並繼續", confirm: "我已閱讀，同意並繼續", wait: "請繼續停留閱讀", close: "關閉", overlay: "請滑動到底部閱讀完整聲明", parentReq: "請勾選兩項確認後再繼續。", center: "開啟完整隱私中心", terms: "服務條款", matrixTitle: "各地區法律框架矩陣（英文參考資料）", matrixNote: "以下矩陣彙整 2026 年 9 月 20 日梳理的各司法轄區框架，僅供參考，不構成法律意見；為確保準確性保留英文原文。", draft: "範本聲明，不構成法律意見。於各司法轄區上線前請交由當地律師審核。", eff: "生效日期", loading: "正在載入您所選語言的隱私聲明…", loadFail: "此語言版本載入失敗，已改為顯示英文版本。", langLabel: "語言", backApp: "← 返回 CalcElf", consent1: "已讀確認", consent2: "家長／監護人同意", consent1Hint: "我已閱讀並理解《隱私聲明》。", consent2Hint: "學習者為未成年人時必勾", fullCenterLink: "完整隱私聲明、地區法律矩陣與權利請求 →" },
    ja: { agree: "同意して続ける", confirm: "同意して続行", wait: "最後までお読みください", close: "閉じる", overlay: "最後までスクロールしてお読みください", parentReq: "続行するには両方の確認にチェックしてください。", center: "完全なプライバシーセンターを開く", terms: "利用規約", matrixTitle: "地域別法的フレームワーク一覧（参考・英語）", matrixNote: "以下は2026年9月20日時点で整理した各国・地域のフレームワークの参考資料であり、法的助言ではありません。正確性のため英語原文を保持しています。", draft: "ひな形であり、法的助言ではありません。各地域での公開前に現地の弁護士による確認を受けてください。", eff: "発効日", loading: "選択した言語のプライバシー通知を読み込み中…", loadFail: "この言語版の読み込みに失敗したため、英語版を表示しています。", langLabel: "言語", backApp: "← CalcElf に戻る", consent1: "確認", consent2: "保護者の同意", consent1Hint: "プライバシー通知を読み、理解しました。", consent2Hint: "学習者が未成年の場合は必須", fullCenterLink: "完全なプライバシー通知・地域別一覧・権利請求 →" },
    ko: { agree: "동의하고 계속", confirm: "동의하고 진행", wait: "끝까지 읽어 주세요", close: "닫기", overlay: "맨 아래까지 스크롤하여 전체 내용을 읽어 주세요", parentReq: "계속하려면 두 확인란을 모두 체크해 주세요.", center: "전체 개인정보 보호 센터 열기", terms: "서비스 약관", matrixTitle: "지역별 법적 프레임워크 표 (참고용, 영어)", matrixNote: "아래 표는 2026년 9월 20일에 정리한 각 관할 구역 프레임워크의 참고 자료이며 법률 조언이 아닙니다. 정확성을 위해 영어 원문을 유지합니다.", draft: "초안 고지이며 법률 조언이 아닙니다. 각 지역 출시 전 현지 변호사의 검토를 받으세요.", eff: "시행일", loading: "선택한 언어의 개인정보 처리방침을 불러오는 중…", loadFail: "해당 언어 버전을 불러오지 못해 영어 버전을 표시합니다.", langLabel: "언어", backApp: "← CalcElf로 돌아가기", consent1: "확인", consent2: "부모/법정대리인 동의", consent1Hint: "개인정보 처리방침을 읽고 이해했습니다.", consent2Hint: "학습자가 미성년자인 경우 필수", fullCenterLink: "전체 처리방침·지역별 표·권리 요청 →" },
    fr: { agree: "Accepter et continuer", confirm: "J’accepte — continuer", wait: "Veuillez continuer la lecture", close: "Fermer", overlay: "Faites défiler jusqu’en bas pour lire l’avis complet", parentReq: "Veuillez cocher les deux confirmations pour continuer.", center: "Ouvrir le centre de confidentialité complet", terms: "Conditions d’utilisation", matrixTitle: "Matrice des cadres juridiques régionaux (référence, anglais)", matrixNote: "La matrice ci-dessous synthétise les cadres examinés au 20 septembre 2026. Elle est fournie à titre de référence, ne constitue pas un avis juridique et reste en anglais par souci d’exactitude.", draft: "Avis type — non constitutif d’un avis juridique. À valider par un conseil local avant lancement dans chaque juridiction.", eff: "Date d’effet", loading: "Chargement de l’avis de confidentialité dans votre langue…", loadFail: "Impossible de charger cette version linguistique ; version anglaise affichée.", langLabel: "Langue", backApp: "← Retour à CalcElf", consent1: "Accusé de lecture", consent2: "Consentement parent / tuteur", consent1Hint: "J’ai lu et compris l’avis de confidentialité.", consent2Hint: "Requis si l’apprenant est mineur", fullCenterLink: "Avis complet, matrice régionale et demandes de droits →" },
    de: { agree: "Zustimmen und fortfahren", confirm: "Ich stimme zu — fortfahren", wait: "Bitte weiterlesen", close: "Schließen", overlay: "Bitte bis zum Ende scrollen, um den vollständigen Hinweis zu lesen", parentReq: "Bitte beide Bestätigungen anhaken, um fortzufahren.", center: "Vollständiges Datenschutz-Center öffnen", terms: "Nutzungsbedingungen", matrixTitle: "Regionale Rechtsrahmen-Matrix (Referenz, Englisch)", matrixNote: "Die folgende Matrix fasst die am 20. September 2026 geprüften Rahmenwerke zusammen. Sie dient als Referenz, stellt keine Rechtsberatung dar und bleibt aus Gründen der Genauigkeit auf Englisch.", draft: "Musterhinweis — keine Rechtsberatung. Vor dem Start in jeder Rechtsordnung von lokalem Anwalt prüfen lassen.", eff: "Gültig ab", loading: "Datenschutzhinweis in Ihrer Sprache wird geladen…", loadFail: "Diese Sprachversion konnte nicht geladen werden; es wird die englische Version angezeigt.", langLabel: "Sprache", backApp: "← Zurück zu CalcElf", consent1: "Bestätigung", consent2: "Eltern-/Erziehungsberechtigten-Einwilligung", consent1Hint: "Ich habe den Datenschutzhinweis gelesen und verstanden.", consent2Hint: "Erforderlich, wenn die lernende Person minderjährig ist", fullCenterLink: "Vollständiger Hinweis, regionale Matrix & Rechteanfragen →" },
    es: { agree: "Aceptar y continuar", confirm: "Acepto — continuar", wait: "Sigue leyendo, por favor", close: "Cerrar", overlay: "Desplázate hasta el final para leer el aviso completo", parentReq: "Marca las dos confirmaciones para continuar.", center: "Abrir el centro de privacidad completo", terms: "Términos del servicio", matrixTitle: "Matriz de marcos legales regionales (referencia, en inglés)", matrixNote: "La siguiente matriz resume los marcos revisados el 20 de septiembre de 2026. Es material de referencia, no asesoramiento legal, y se mantiene en inglés por precisión.", draft: "Aviso de plantilla, no es asesoramiento legal. Valídalo con asesoría local antes del lanzamiento en cada jurisdicción.", eff: "Fecha de entrada en vigor", loading: "Cargando el aviso de privacidad en tu idioma…", loadFail: "No se pudo cargar esta versión en tu idioma; se muestra la versión en inglés.", langLabel: "Idioma", backApp: "← Volver a CalcElf", consent1: "Confirmación de lectura", consent2: "Consentimiento del padre/madre/tutor", consent1Hint: "He leído y comprendido el aviso de privacidad.", consent2Hint: "Obligatorio si el alumno es menor de edad", fullCenterLink: "Aviso completo, matriz regional y solicitudes de derechos →" },
    it: { agree: "Accetta e continua", confirm: "Accetto — continua", wait: "Ti preghiamo di continuare la lettura", close: "Chiudi", overlay: "Scorri fino in fondo per leggere l’informativa completa", parentReq: "Seleziona entrambe le conferme per continuare.", center: "Apri il centro privacy completo", terms: "Termini di servizio", matrixTitle: "Matrice dei quadri giuridici regionali (riferimento, inglese)", matrixNote: "La matrice seguente riassume i quadri esaminati al 20 settembre 2026. È materiale di riferimento, non consulenza legale, ed è mantenuta in inglese per accuratezza.", draft: "Informativa modello — non costituisce consulenza legale. Da convalidare con un legale locale prima del lancio in ciascuna giurisdizione.", eff: "Data di entrata in vigore", loading: "Caricamento dell’informativa sulla privacy nella tua lingua…", loadFail: "Impossibile caricare questa lingua; viene mostrata la versione inglese.", langLabel: "Lingua", backApp: "← Torna a CalcElf", consent1: "Presa visione", consent2: "Consenso del genitore/tutore", consent1Hint: "Ho letto e compreso l’informativa sulla privacy.", consent2Hint: "Richiesto se lo studente è minorenne", fullCenterLink: "Informativa completa, matrice regionale e richieste di diritti →" },
    ar: { agree: "أوافق وأتابع", confirm: "أوافق — متابعة", wait: "يرجى متابعة القراءة", close: "إغلاق", overlay: "يرجى التمرير إلى الأسفل لقراءة الإشعار كاملاً", parentReq: "يرجى تحديد مربعَي التأكيد للمتابعة.", center: "فتح مركز الخصوصية الكامل", terms: "شروط الخدمة", matrixTitle: "مصفوفة الأطر القانونية الإقليمية (مرجعي، بالإنجليزية)", matrixNote: "تلخص المصفوفة أدناه الأطر التي تمت مراجعتها في 20 سبتمبر 2026. هي مادة مرجعية وليست استشارة قانونية، وتبقى بالإنجليزية لضمان الدقة.", draft: "إشعار نموذجي — ليس استشارة قانونية. يُراجَع من مستشار محلي قبل الإطلاق في كل ولاية قضائية.", eff: "تاريخ السريان", loading: "جارٍ تحميل إشعار الخصوصية بلغتك…", loadFail: "تعذّر تحميل هذه النسخة اللغوية؛ يُعرض الإصدار الإنجليزي.", langLabel: "اللغة", backApp: "← العودة إلى CalcElf", consent1: "إقرار بالقراءة", consent2: "موافقة الوالد/ولي الأمر", consent1Hint: "لقد قرأت إشعار الخصوصية وفهمته.", consent2Hint: "مطلوب إذا كان المتعلم قاصراً", fullCenterLink: "الإشعار الكامل والمصفوفة الإقليمية وطلبات الحقوق →" },
    fa: { agree: "می‌پذیرم و ادامه می‌دهم", confirm: "موافقم — ادامه", wait: "لطفاً تا پایان مطالعه کنید", close: "بستن", overlay: "برای خواندن کامل اعلامیه تا انتها اسکرول کنید", parentReq: "برای ادامه هر دو تأیید را علامت بزنید.", center: "باز کردن مرکز کامل حریم خصوصی", terms: "شرایط خدمات", matrixTitle: "ماتریس چارچوب‌های حقوقی منطقه‌ای (مرجع، انگلیسی)", matrixNote: "ماتریس زیر چارچوب‌های بررسی‌شده در ۲۰ سپتامبر ۲۰۲۶ را خلاصه می‌کند. این مطلب مرجع است و مشاوره حقوقی نیست و برای دقت بیشتر به انگلیسی نگه داشته شده است.", draft: "اعلامیه الگوست و مشاوره حقوقی نیست. پیش از راه‌اندازی در هر حوزه قضایی با مشاور محلی بررسی شود.", eff: "تاریخ اجرا", loading: "در حال بارگذاری اعلامیه حریم خصوصی به زبان شما…", loadFail: "بارگذاری این نسخه زبانی ممکن نشد؛ نسخه انگلیسی نمایش داده می‌شود.", langLabel: "زبان", backApp: "← بازگشت به CalcElf", consent1: "تأیید مطالعه", consent2: "رضایت والد/سرپرست", consent1Hint: "اعلامیه حریم خصوصی را خوانده و درک کرده‌ام.", consent2Hint: "در صورتی که یادگیرنده خردسال است الزامی است", fullCenterLink: "اعلامیه کامل، ماتریس منطقه‌ای و درخواست حقوق →" }
  };

  var ALIASES = {
    zh: "zh-CN", "zh-hans": "zh-CN", "zh-cn": "zh-CN", "zh-sg": "zh-CN",
    "zh-hant": "zh-TW", "zh-tw": "zh-TW", "zh-hk": "zh-TW", "zh-mo": "zh-TW",
    "ja-jp": "ja", "ko-kr": "ko", "fr-fr": "fr", "de-de": "de", "de-at": "de", "de-ch": "de",
    "es-es": "es", "es-mx": "es", "es-419": "es", "it-it": "it", "ar-sa": "ar", "ar-ae": "ar",
    "fa-ir": "fa", "en-us": "en", "en-gb": "en"
  };

  function normalize(raw) {
    if (!raw) return "en";
    var l = String(raw).replace(/_/g, "-").toLowerCase();
    if (UI[l]) return l;
    if (ALIASES[l]) return ALIASES[l];
    var base = l.split("-")[0];
    if (UI[base]) return base;
    return "en";
  }

  function currentLang() {
    var saved = null;
    try { saved = localStorage.getItem("calcelf_lang"); } catch (e) {}
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || "en";
    return normalize(saved || nav);
  }

  var noticeCache = {};
  // 按需加载对应语种的完整法律正文（独立文件，不打进主程序）
  window.PRIVACY_TEXTS.fetchNotice = function (lang) {
    var l = normalize(lang || currentLang());
    if (noticeCache[l]) return Promise.resolve(noticeCache[l]);
    var url = "/legal/privacy." + l + ".html";
    return fetch(url, { cache: "force-cache" })
      .then(function (r) {
        if (!r.ok) throw new Error("notice " + l + " HTTP " + r.status);
        return r.text();
      })
      .then(function (txt) {
        var doc = new DOMParser().parseFromString(txt, "text/html");
        var main = doc.getElementById("legalMain");
        var out = { lang: l, html: main ? main.innerHTML : txt, title: (doc.querySelector("h1") || {}).textContent || "" };
        noticeCache[l] = out;
        return out;
      })
      .catch(function (e) {
        if (l !== "en") return window.PRIVACY_TEXTS.fetchNotice("en");
        return { lang: "en", html: "<p>Privacy notice could not be loaded. Please contact privacy@calcelf.com.</p>", title: "Privacy Notice", error: true };
      });
  };

  window.PRIVACY_TEXTS.resolveLang = currentLang;
  window.PRIVACY_TEXTS.normalizeLang = normalize;
  window.PRIVACY_TEXTS.uiStrings = function (lang) {
    var l = normalize(lang || currentLang());
    return UI[l] || UI.en;
  };

  window.PRIVACY_TEXTS.get = function (lang) {
    var l = normalize(lang || currentLang());
    var pack = this[l] || this.en;
    var u = UI[l] || UI.en;
    return {
      lang: l,
      rtl: (l === "ar" || l === "fa"),
      title: pack.title,
      body: '',
      scrollHint: pack.scrollHint,
      checkboxText: pack.ack,
      parentText: pack.parentAck,
      agreeBtn: u.agree,
      readBtn: u.confirm,
      waitText: u.wait,
      closeBtn: u.close,
      overlayHint: u.overlay,
      parentReq: u.parentReq,
      centerLink: u.center,
      termsLabel: u.terms,
      ui: u
    };
  };
})();
