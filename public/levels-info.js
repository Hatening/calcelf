/* =========================================================
   CalcElf v5.6.1 —— 等级与特权说明（万豪旅享家式）
   点击会员卡片 / 头像菜单“Levels & progress”打开。
   终身 7 级（按累计答对题数，只升不降）+ 本月 6 级（按月解题/
   正确率/连续天数，每月重置）。规则与后端 lib/levels.js 完全一致。
   11 语外置，不阻塞首屏。
   ========================================================= */
(function(){
  const LIFE=[{lv:1,at:0,scarf:'blue'},{lv:2,at:50,scarf:'blue'},{lv:3,at:200,scarf:'green'},{lv:4,at:500,scarf:'green'},{lv:5,at:1000,scarf:'purple'},{lv:6,at:2500,scarf:'purple'},{lv:7,at:5000,scarf:'rainbow'}];
  const MONTH=[{lv:1,s:0},{lv:2,s:10},{lv:3,s:30,crown:'silver'},{lv:4,s:60,crown:'silver'},{lv:5,s:100,acc:80,crown:'gold'},{lv:6,s:100,acc:90,streak:7,crown:'gold'}];
  const I18N={
    en:{title:'Levels & rewards',sub:'Everyone starts free. Learn to level up — two ranks run together.',freeTitle:'What does “Free” mean?',freeDesc:'“Free” is your payment plan (free vs Student/Plus/Family). It is NOT a learning level. Your learning ranks below are 100% free and only grow by solving problems.',tabLife:'Lifetime rank',tabMonth:'This month',you:'You are here',locked:'Locked',rewards:'Rewards',close:'Close',noteLife:'Lifetime rank never drops — it follows your total correct answers forever.',noteMonth:'Monthly rank resets at the start of each month. Keep accuracy and streak high to reach the top.',next:'Next rank',progress:'Progress',correct:'lifetime correct',solved:'solved this month',acc:'accuracy',streak:'day streak',start:'Starting rank',reachLife:'Reach {n} lifetime correct answers',reachMonth:'Solve {n} problems this month',reachMonthAcc:'Solve 100 problems this month with ≥{a}% accuracy',reachMonthTop:'Solve 100 this month, ≥90% accuracy and a 7-day streak',mainColor:'Rank theme color unlocked',scarf:'Explorer scarf',crown:'Rank crown',cBlue:'blue',cGreen:'green',cPurple:'purple',cRainbow:'rainbow + legendary glow',bronze:'bronze',silver:'silver',gold:'gold',topAccent:'special top-rank accent',
      ld:['Every correct answer begins your journey.','You are finding your rhythm.','You seek out the why behind answers.','You solve with growing independence.','A wise, steady problem solver.','A master who teaches by example.','A legendary CalcElf explorer.'],
      md:['Take your first steps this month.','Practice is becoming a habit.','Real momentum is building.','A strong, reliable solver.','Excellent accuracy — Elf Master.','The crown rank: volume, accuracy, streak.']},
    'zh-CN':{title:'等级与特权',sub:'所有人都从免费开始，靠学习升级——两条等级线同时进行。',freeTitle:'“Free（免费）”是什么意思？',freeDesc:'Free 是你的付费方案（免费 / Student / Plus / Family），不是学习等级。下面的学习等级完全免费，只靠解题成长。',tabLife:'永久等级',tabMonth:'本月等级',you:'你在这里',locked:'未解锁',rewards:'特权',close:'关闭',noteLife:'永久等级只升不降，永远跟随你的累计答对题数。',noteMonth:'本月等级每月初重置；保持高正确率和连续天数可冲顶。',next:'下一等级',progress:'进度',correct:'累计答对',solved:'本月解题',acc:'正确率',streak:'连续天数',start:'初始等级',reachLife:'累计答对 {n} 题',reachMonth:'本月解 {n} 题',reachMonthAcc:'本月解 100 题且正确率 ≥{a}%',reachMonthTop:'本月解 100 题、正确率 ≥90% 且连续 7 天',mainColor:'解锁该等级主题色',scarf:'探索者领巾',crown:'等级皇冠',cBlue:'蓝色',cGreen:'绿色',cPurple:'紫色',cRainbow:'彩虹色 + 传奇光效',bronze:'铜色',silver:'银色',gold:'金色',topAccent:'顶级专属点缀',
      ld:['每一次答对都开启旅程。','你正在找到学习节奏。','你开始追问答案背后的为什么。','你越来越能独立解题。','沉稳而智慧的解题者。','以身作则的大师。','传奇般的 CalcElf 探索者。'],
      md:['本月迈出第一步。','练习正在成为习惯。','开始有了真正的势头。','稳定可靠的解题者。','出色的正确率——精灵大师。','皇冠等级：题量、正确率、坚持兼备。']},
    'zh-TW':{title:'等級與特權',sub:'所有人都從免費開始，靠學習升級——兩條等級線同時進行。',freeTitle:'「Free（免費）」是什麼意思？',freeDesc:'Free 是你的付費方案（免費 / Student / Plus / Family），不是學習等級。下面的學習等級完全免費，只靠解題成長。',tabLife:'永久等級',tabMonth:'本月等級',you:'你在這裡',locked:'未解鎖',rewards:'特權',close:'關閉',noteLife:'永久等級只升不降，永遠跟隨你的累計答對題數。',noteMonth:'本月等級每月初重置；保持高正確率與連續天數可衝頂。',next:'下一級',progress:'進度',correct:'累計答對',solved:'本月解題',acc:'正確率',streak:'連續天數',start:'初始等級',reachLife:'累計答對 {n} 題',reachMonth:'本月解 {n} 題',reachMonthAcc:'本月解 100 題且正確率 ≥{a}%',reachMonthTop:'本月解 100 題、正確率 ≥90% 且連續 7 天',mainColor:'解鎖該等級主題色',scarf:'探索者領巾',crown:'等級皇冠',cBlue:'藍色',cGreen:'綠色',cPurple:'紫色',cRainbow:'彩虹色 + 傳奇光效',bronze:'銅色',silver:'銀色',gold:'金色',topAccent:'頂級專屬點綴',
      ld:['每一次答對都開啟旅程。','你正在找到學習節奏。','你開始追問答案背後的原因。','你越來越能獨立解題。','沉穩而睿智的解題者。','以身作則的大師。','傳奇般的 CalcElf 探索者。'],
      md:['本月邁出第一步。','練習正在成為習慣。','開始有真正的氣勢。','穩定可靠的解題者。','出色的正確率——精靈大師。','皇冠等級：題量、正確率、堅持兼備。']},
    ja:{title:'レベルと特典',sub:'誰もが無料でスタート。学習でレベルアップします。2 つのランクが同時に進みます。',freeTitle:'「Free（無料）」とは？',freeDesc:'Free は料金プラン（無料 / Student / Plus / Family）で、学習レベルではありません。学習ランクは完全無料で、問題を解くだけで上がります。',tabLife:'生涯ランク',tabMonth:'今月のランク',you:'あなたはここ',locked:'未解放',rewards:'特典',close:'閉じる',noteLife:'生涯ランクは下がりません。累計正解数に応じて永久に上がります。',noteMonth:'月間ランクは毎月初にリセット。正解率と連続日数で頂上を目指せます。',next:'次のランク',progress:'進捗',correct:'累計正解',solved:'今月の解答',acc:'正解率',streak:'連続日数',start:'スタート',reachLife:'累計正解 {n} 問に到達',reachMonth:'今月 {n} 問解く',reachMonthAcc:'今月100問を正解率 {a}% 以上で解く',reachMonthTop:'今月100問・正解率90%以上・7日連続',mainColor:'ランクのテーマカラー解放',scarf:'探検家のマフラー',crown:'ランククラウン',cBlue:'ブルー',cGreen:'グリーン',cPurple:'パープル',cRainbow:'レインボー＋伝説の光',bronze:'ブロンズ',silver:'シルバー',gold:'ゴールド',topAccent:'トップ専用アクセント',
      ld:['正解が旅の始まりです。','学習のリズムがつかめてきました。','答えの「なぜ」を探しています。','自立して解けるようになっています。','落ち着いた賢い解決者。','手本となるマスター。','伝説の CalcElf 探検家。'],
      md:['今月の一歩を踏み出そう。','練習が習慣になりつつあります。','勢いが出てきました。','頼れる解き手。','素晴らしい正解率——エルフマスター。','クラウンランク：量・正確さ・継続。']},
    ko:{title:'레벨과 특전',sub:'모두 무료로 시작하고 학습으로 레벨업합니다. 두 가지 랭크가 함께 올라갑니다.',freeTitle:'“Free(무료)”란?',freeDesc:'Free는 요금제(무료/Student/Plus/Family)이며 학습 레벨이 아닙니다. 학습 랭크는 완전 무료이고 문제를 풀어야 올라갑니다.',tabLife:'평생 랭크',tabMonth:'이번 달 랭크',you:'현재 위치',locked:'잠김',rewards:'특전',close:'닫기',noteLife:'평생 랭크는 내려가지 않고 누적 정답 수와 함께합니다.',noteMonth:'월간 랭크는 매달 초 초기화됩니다. 정답률과 연속일수를 높여 정상에 도전하세요.',next:'다음 랭크',progress:'진행',correct:'누적 정답',solved:'이번 달 풀이',acc:'정답률',streak:'연속 일수',start:'시작 랭크',reachLife:'누적 정답 {n}문제 달성',reachMonth:'이번 달 {n}문제 풀기',reachMonthAcc:'이번 달 100문제를 정답률 {a}% 이상으로 풀기',reachMonthTop:'이번 달 100문제·정답률 90% 이상·7일 연속',mainColor:'랭크 테마색 해제',scarf:'탐험가 스카프',crown:'랭크 왕관',cBlue:'파랑',cGreen:'초록',cPurple:'보라',cRainbow:'무지개＋전설 효과',bronze:'동',silver:'은',gold:'금',topAccent:'최고 랭크 전용 액센트',
      ld:['정답이 여정을 시작해요.','학습 리듬을 찾고 있어요.','답의 이유를 탐구해요.','스스로 푸는 힘이 자랍니다.','차분하고 현명한 해결사.','모범이 되는 마스터.','전설의 CalcElf 탐험가.'],
      md:['이번 달 첫걸음.','연습이 습관이 되어가요.','실제 탄력이 붙었어요.','든든한 풀이사.','뛰어난 정답률——엘프 마스터.','왕관 랭크: 분량·정확성·꾸준함.']},
    fr:{title:'Niveaux & récompenses',sub:'Tout le monde commence gratuitement et progresse en apprenant. Deux classements évoluent ensemble.',freeTitle:'Que veut dire « Free » ?',freeDesc:'Free est votre offre tarifaire (gratuit / Student / Plus / Family), pas un niveau d’apprentissage. Vos rangs ci-dessous sont 100 % gratuits et montent en résolvant des problèmes.',tabLife:'Rang à vie',tabMonth:'Ce mois-ci',you:'Vous êtes ici',locked:'Verrouillé',rewards:'Avantages',close:'Fermer',noteLife:'Le rang à vie ne baisse jamais : il suit votre total de bonnes réponses.',noteMonth:'Le rang mensuel se réinitialise au début du mois. Visez justesse et série pour le sommet.',next:'Rang suivant',progress:'Progression',correct:'bonnes réponses à vie',solved:'résolus ce mois-ci',acc:'précision',streak:'jours consécutifs',start:'Rang de départ',reachLife:'Atteindre {n} bonnes réponses à vie',reachMonth:'Résoudre {n} problèmes ce mois-ci',reachMonthAcc:'Résoudre 100 problèmes ce mois-ci avec ≥{a} % de justesse',reachMonthTop:'100 problèmes ce mois-ci, ≥90 % et 7 jours consécutifs',mainColor:'Couleur de thème du rang débloquée',scarf:'Écharpe d’explorateur',crown:'Couronne de rang',cBlue:'bleue',cGreen:'verte',cPurple:'violette',cRainow:'arc-en-ciel + lueur légendaire',cRainbow:'arc-en-ciel + lueur légendaire',bronze:'bronze',silver:'argent',gold:'or',topAccent:'accent spécial du sommet',
      ld:['Chaque bonne réponse lance le voyage.','Vous trouvez votre rythme.','Vous cherchez le pourquoi.','Vous résolvez avec autonomie.','Un résolveur sage et régulier.','Un maître qui montre l’exemple.','Un explorateur légendaire.'],
      md:['Vos premiers pas du mois.','La pratique devient une habitude.','Une vraie dynamique se crée.','Un résolveur solide et fiable.','Excellente justesse — Maître elfe.','Rang couronne : volume, justesse, série.']},
    de:{title:'Level & Belohnungen',sub:'Alle starten kostenlos und steigen durch Lernen auf. Zwei Ränge laufen gemeinsam.',freeTitle:'Was bedeutet „Free“?',freeDesc:'Free ist dein Tarif (kostenlos / Student / Plus / Family), kein Lernlevel. Deine Lernränge unten sind 100 % kostenlos und steigen nur durch Lösen.',tabLife:'Lifetime-Rang',tabMonth:'Dieser Monat',you:'Du bist hier',locked:'Gesperrt',rewards:'Vorteile',close:'Schließen',noteLife:'Der Lifetime-Rang sinkt nie und folgt deinen gesamten richtigen Antworten.',noteMonth:'Der Monatsrang wird jeden Monat zurückgesetzt. Halte Genauigkeit und Serie hoch.',next:'Nächster Rang',progress:'Fortschritt',correct:'richtige insgesamt',solved:'diesen Monat gelöst',acc:'Genauigkeit',streak:'Tage Serie',start:'Startrang',reachLife:'{n} richtige Antworten insgesamt erreichen',reachMonth:'Diesen Monat {n} Probleme lösen',reachMonthAcc:'Diesen Monat 100 Probleme mit ≥{a} % Genauigkeit',reachMonthTop:'100 Probleme, ≥90 % und 7-Tage-Serie diesen Monat',mainColor:'Rang-Designfarbe freigeschaltet',scarf:'Entdecker-Schal',crown:'Rang-Krone',cBlue:'blau',cGreen:'grün',cPurple:'lila',cRainbow:'Regenbogen + legendäres Leuchten',bronze:'Bronze',silver:'Silber',gold:'Gold',topAccent:'spezielles Top-Akzent',
      ld:['Jede richtige Antwort beginnt die Reise.','Du findest deinen Rhythmus.','Du suchst das Warum.','Du löst zunehmend selbstständig.','Ein ruhiger, kluger Löser.','Ein Meister mit Vorbildwirkung.','Ein legendärer CalcElf-Entdecker.'],
      md:['Deine ersten Schritte diesen Monat.','Übung wird zur Gewohnheit.','Echter Schwung entsteht.','Ein starker, verlässlicher Löser.','Hervorragende Genauigkeit — Elfen-Meister.','Kronenrang: Umfang, Genauigkeit, Serie.']},
    es:{title:'Niveles y recompensas',sub:'Todos empiezan gratis y suben al aprender. Dos rangos avanzan juntos.',freeTitle:'¿Qué significa «Free»?',freeDesc:'Free es tu plan de pago (gratis / Student / Plus / Family), no un nivel de aprendizaje. Tus rangos son 100 % gratis y suben resolviendo.',tabLife:'Rango de por vida',tabMonth:'Este mes',you:'Estás aquí',locked:'Bloqueado',rewards:'Ventajas',close:'Cerrar',noteLife:'El rango de por vida nunca baja: sigue tu total de aciertos.',noteMonth:'El rango mensual se reinicia cada mes. Mantén precisión y racha para llegar arriba.',next:'Siguiente rango',progress:'Progreso',correct:'aciertos de por vida',solved:'resueltos este mes',acc:'precisión',streak:'días de racha',start:'Rango inicial',reachLife:'Alcanza {n} aciertos de por vida',reachMonth:'Resuelve {n} problemas este mes',reachMonthAcc:'Resuelve 100 este mes con ≥{a} % de precisión',reachMonthTop:'100 este mes, ≥90 % y racha de 7 días',mainColor:'Color de tema del rango desbloqueado',scarf:'Bufanda de explorador',crown:'Corona de rango',cBlue:'azul',cGreen:'verde',cPurple:'morada',cRainbow:'arcoíris + brillo legendario',bronze:'bronce',silver:'plata',gold:'oro',topAccent:'acento especial del top',
      ld:['Cada acierto inicia el viaje.','Estás encontrando tu ritmo.','Buscas el porqué.','Resuelves con más autonomía.','Un resolvedor sabio y constante.','Un maestro que da ejemplo.','Un explorador legendario.'],
      md:['Tus primeros pasos del mes.','La práctica se vuelve hábito.','Se crea un impulso real.','Un resolvedor sólido y fiable.','Excelente precisión — Maestro elfo.','Rango corona: volumen, precisión, racha.']},
    it:{title:'Livelli e ricompense',sub:'Tutti iniziano gratis e salgono imparando. Due ranghe avanzano insieme.',freeTitle:'Cosa significa «Free»?',freeDesc:'Free è il tuo piano tariffario (gratis / Student / Plus / Family), non un livello di apprendimento. I ranghi qui sotto sono gratis al 100% e salgono risolvendo.',tabLife:'Grado a vita',tabMonth:'Questo mese',you:'Sei qui',locked:'Bloccato',rewards:'Vantaggi',close:'Chiudi',noteLife:'Il grado a vita non scende mai: segue i tuoi risposti corretti totali.',noteMonth:'Il grado mensile si azzera a inizio mese. Mantieni precisione e serie per la vetta.',next:'Grado successivo',progress:'Avanzamento',correct:'corrette a vita',solved:'risolti questo mese',acc:'precisione',streak:'giorni di serie',start:'Grado iniziale',reachLife:'Raggiungi {n} corrette a vita',reachMonth:'Risolvi {n} problemi questo mese',reachMonthAcc:'Risolvi 100 problemi questo mese con ≥{a}% di precisione',reachMonthTop:'100 problemi, ≥90% e 7 giorni di serie questo mese',mainColor:'Colore del tema sbloccato',scarf:'Sciarpa dell’esploratore',crown:'Corona di grado',cBlue:'blu',cGreen:'verde',cPurple:'viola',cRainbow:'arcobaleno + bagliore leggendario',bronze:'bronzo',silver:'argento',gold:'oro',topAccent:'accento speciale del top',
      ld:['Ogni corretta inizia il viaggio.','Stai trovando il ritmo.','Cerchi il perché.','Risolvi con più autonomia.','Un risolutore saggio e costante.','Un maestro d’esempio.','Un esploratore leggendario.'],
      md:['I primi passi del mese.','La pratica diventa abitudine.','Sta nascendo un vero slancio.','Un risolutore solido e affidabile.','Ottima precisione — Maestro elfo.','Grado corona: volume, precisione, serie.']},
    ar:{title:'المستويات والمكافآت',sub:'يبدأ الجميع مجانًا ويرتقون بالتعلم. رتبتان تتقدمان معًا.',freeTitle:'ماذا تعني «Free»؟',freeDesc:'Free هي خطة الدفع (مجاني / Student / Plus / Family) وليست مستوى تعليميًا. رتب التعلم بالأسفل مجانية 100% وترتفع بالحل فقط.',tabLife:'رتبة مدى الحياة',tabMonth:'هذا الشهر',you:'أنت هنا',locked:'مقفل',rewards:'المزايا',close:'إغلاق',noteLife:'رتبة مدى الحياة لا تنزل أبدًا وتتبع إجمالي إجاباتك الصحيحة.',noteMonth:'تُعاد الرتبة الشهرية في بداية كل شهر. حافظ على الدقة والاستمرارية للوصول للقمة.',next:'الرتبة التالية',progress:'التقدم',correct:'إجابة صحيحة مدى الحياة',solved:'تم حلها هذا الشهر',acc:'الدقة',streak:'أيام متتالية',start:'رتبة البداية',reachLife:'حقّق {n} إجابة صحيحة مدى الحياة',reachMonth:'حل {n} مسألة هذا الشهر',reachMonthAcc:'حل 100 مسألة هذا الشهر بدقة ≥{a}%',reachMonthTop:'حل 100 مسألة بدقة ≥90% و7 أيام متتالية هذا الشهر',mainColor:'لون واجهة الرتبة مفتوح',scarf:'وشاح المستكشف',crown:'تاج الرتبة',cBlue:'أزرق',cGreen:'أخضر',cPurple:'بنفسجي',cRainbow:'قوس قزح + توهج أسطوري',bronze:'برونزي',silver:'فضي',gold:'ذهبي',topAccent:'لمسة خاصة للقمة',
      ld:['كل إجابة صحيحة تبدأ الرحلة.','تجد إيقاعك.','تبحث عن السبب.','تحل باستقلالية متزايدة.','حلّ حكيم وثابت.','معلّم يضرب المثل.','مستكشف أسطوري.'],
      md:['خطواتك الأولى هذا الشهر.','الممارسة تصبح عادة.','يبدأ زخم حقيقي.','حلّ قوي وموثوق.','دقة ممتازة — سيد الجن.','رتبة التاج: الكم والدقة والاستمرار.']},
    fa:{title:'سطح‌ها و پاداش‌ها',sub:'همه رایگان شروع می‌کنند و با یادگیری بالا می‌روند. دو رتبه هم‌زمان پیش می‌رود.',freeTitle:'«Free» یعنی چه؟',freeDesc:'Free طرح پرداختی شماست (رایگان/Student/Plus/Family) و سطح یادگیری نیست. رتبه‌های یادگیری زیر کاملاً رایگان‌اند و فقط با حل مسئله بالا می‌روند.',tabLife:'رتبه مادام‌العمر',tabMonth:'این ماه',you:'اینجا هستید',locked:'قفل',rewards:'امتیازها',close:'بستن',noteLife:'رتبه مادام‌العمر هرگز پایین نمی‌آید و با مجموع پاسخ‌های درست شماست.',noteMonth:'رتبه ماهانه در ابتدای هر ماه بازنشانی می‌شود. دقت و استمرار را برای قله بالا نگه دارید.',next:'رتبه بعدی',progress:'پیشرفت',correct:'پاسخ درست مادام‌العمر',solved:'حل‌شده این ماه',acc:'دقت',streak:'روز متوالی',start:'رتبه شروع',reachLife:'به {n} پاسخ درست مادام‌العمر برسید',reachMonth:'این ماه {n} مسئله حل کنید',reachMonthAcc:'این ماه ۱۰۰ مسئله با دقت ≥{a}٪ حل کنید',reachMonthTop:'۱۰۰ مسئله، دقت ≥۹۰٪ و ۷ روز متوالی این ماه',mainColor:'رنگ پوسته رتبه باز شد',scarf:'شال کاوشگر',crown:'تاج رتبه',cBlue:'آبی',cGreen:'سبز',cPurple:'بنفش',cRainbow:'رنگین‌کمان + درخشش افسانه‌ای',bronze:'برنزی',silver:'نقره‌ای',gold:'طلایی',topAccent:'افکت ویژه قله',
      ld:['هر پاسخ درست سفر را آغاز می‌کند.','ریتم خود را می‌یابید.','دنبال چرایی هستید.','مستقل‌تر حل می‌کنید.','حل‌کننده‌ای خردمند و باثبات.','استادی که الگوست.','کاوشگر افسانه‌ای CalcElf.'],
      md:['اولین گام‌های این ماه.','تمرین به عادت تبدیل می‌شود.','حرکت واقعی شکل گرفته.','حل‌کننده‌ای قوی و قابل‌اتکا.','دقت عالی — استاد جن.','رتبه تاج: حجم، دقت، استمرار.']}
  };
  function lang(){try{return window.CALF_LANG||localStorage.getItem('calcelf_lang')||'en';}catch(e){return'en';}}
  function tr(){return I18N[lang()]||I18N.en;}
  function names(){try{return (window.CREDIT_METER_UI||null);}catch(e){return null;}}
  function nm(){ // level names from CREDIT_METER_UI, fallback English
    const C=names();const L=(C&&(C[lang()]||C.en))||null;
    const en={ln:['Beginner','Explorer','Seeker','Scholar','Sage','Master','Legend'],mn:['Little Elf','Elf Apprentice','Elf Scholar','Elf Expert','Elf Master','Crown Elf']};
    return {ln:(L&&L.ln)||en.ln, mn:(L&&L.mn)||en.mn};
  }
  function lifeRule(t,def){ if(def.at===0)return t.start; return t.reachLife.replace('{n}',def.at); }
  function monthRule(t,def){
    if(def.lv===1)return t.start;
    if(def.lv===5)return t.reachMonthAcc.replace('{a}',def.acc);
    if(def.lv===6)return t.reachMonthTop;
    return t.reachMonth.replace('{n}',def.s);
  }
  function scarfName(t,k){return {blue:t.cBlue,green:t.cGreen,purple:t.cPurple,rainbow:t.cRainbow}[k];}
  function crownName(t,k){return {bronze:t.bronze,silver:t.silver,gold:t.gold}[k]||t.bronze;}
  async function getStats(){
    let p=null;
    try{const s=(typeof session==='function')?await session():null;if(s&&s.access_token){const r=await fetch('/api/profile',{headers:{Authorization:'Bearer '+s.access_token}});if(r.ok)p=(await r.json()).profile;}}catch(e){}
    const num=id=>{const el=document.getElementById(id);return el?parseInt(el.textContent)||0:0;};
    return {
      lifeLv:(p&&p.lifetime_level)||num('lifetimeLevel')||1,
      monthLv:(p&&p.monthly_level)||num('monthlyLevel')||1,
      lifeCorrect:(p&&typeof p.lifetime_correct==='number')?p.lifetime_correct:null,
      monthSolved:(p&&typeof p.monthly_solved==='number')?p.monthly_solved:null,
      monthAcc:(p&&p.monthly_solved)?Math.round((p.monthly_correct/p.monthly_solved)*100):null,
      monthStreak:(p&&p.monthly_streak)||0
    };
  }
  function lifeRewards(t,lv){
    const def=LIFE[lv-1];const arr=[t.mainColor,t.scarf+'：'+scarfName(t,def.scarf)];
    if(lv>=7)arr[1]=t.scarf+'：'+t.cRainbow;
    return arr;
  }
  function monthRewards(t,lv){
    const def=MONTH[lv-1];const arr=[t.crown+'：'+crownName(t,def.crown||'bronze')];
    if(lv>=3)arr.push(t.mainColor);
    if(lv>=6)arr.push(t.topAccent);
    return arr;
  }
  function pct(cur,prev,next){if(next<=prev)return 100;return Math.max(6,Math.min(100,Math.round(((cur-prev)/(next-prev))*100)));}

  function tierRow(o){
    const {t,name,lv,cur,rule,desc,rewards,swatch,progressHtml}=o;
    const isCur=lv===cur;
    return `<div class="lv-row${isCur?' cur':''}${lv>cur?' locked':''}">
      <div class="lv-badge lv-badge-${swatch}">${lv}</div>
      <div class="lv-body">
        <div class="lv-head"><b>${name}</b>${isCur?`<span class="lv-here">${t.you}</span>`:(lv>cur?`<span class="lv-lock">${t.locked}</span>`:'')}</div>
        <div class="lv-rule">${rule}</div>
        <div class="lv-desc">${desc}</div>
        <div class="lv-rewards">${rewards.map(r=>`<span class="lv-perk">✦ ${r}</span>`).join('')}</div>
        ${progressHtml||''}
      </div>
    </div>`;
  }

  async function render(tab){
    const t=tr(),N=nm(),st=await getStats(),box=document.getElementById('lvModalList');
    let html='';
    if(tab==='life'){
      html=LIFE.map(def=>{
        const cur=st.lifeLv;
        let ph='';
        if(st.lifeCorrect!==null&&def.lv<7){const next=LIFE[def.lv].at;const prev=def.at;const curC=Math.min(st.lifeCorrect,next);
          ph=`<div class="lv-prog"><i style="width:${pct(curC,prev,next)}%"></i></div><div class="lv-prog-t">${st.lifeCorrect} / ${next} · ${t.progress} → ${t.next}</div>`;}
        return tierRow({t,name:N.ln[def.lv-1],lv:def.lv,cur,rule:lifeRule(t,def),desc:t.ld[def.lv-1],rewards:lifeRewards(t,def.lv),swatch:'life-'+def.lv,progressHtml:ph});
      }).join('');
      html+=`<p class="lv-note">🔒 ${t.noteLife}</p>`;
    }else{
      html=MONTH.map(def=>{
        const cur=st.monthLv;
        let ph='';
        if(st.monthSolved!==null&&def.lv<6){const next=Math.max(def.s||0,def.lv===1?10:def.s);const prev=def.s||0;const curC=Math.min(st.monthSolved,next||100);
          ph=`<div class="lv-prog"><i style="width:${pct(curC,prev,next||100)}%"></i></div><div class="lv-prog-t">${st.monthSolved} / ${next||100} · ${t.progress} → ${t.next}</div>`;}
        return tierRow({t,name:N.mn[def.lv-1],lv:def.lv,cur,rule:monthRule(t,def),desc:t.md[def.lv-1],rewards:monthRewards(t,def.lv),swatch:'month-'+def.lv,progressHtml:ph});
      }).join('');
      const meta=(st.monthAcc!==null?` · ${t.acc} ${st.monthAcc}% · ${st.monthStreak} ${t.streak}`:'');
      html=`<div class="lv-meta">${t.solved}${meta}</div>`+html;
      html+=`<p class="lv-note">🔄 ${t.noteMonth}</p>`;
    }
    box.innerHTML=html;
    document.getElementById('lvTabLife').classList.toggle('on',tab==='life');
    document.getElementById('lvTabMonth').classList.toggle('on',tab==='month');
    // auto-scroll to current
    setTimeout(()=>{const c=box.querySelector('.lv-row.cur');if(c)c.scrollIntoView({block:'center',behavior:'smooth'});},80);
  }

  function build(){
    if(document.getElementById('levelsModal'))return;
    const ov=document.createElement('div');ov.id='levelsModal';ov.className='lv-overlay';
    ov.innerHTML=`<div class="lv-box" role="dialog" aria-modal="true">
      <button class="close" id="lvClose" aria-label="×">×</button>
      <h2 class="lv-title" data-lv="title"></h2>
      <p class="lv-sub" data-lv="sub"></p>
      <div class="lv-free"><b data-lv="freeTitle"></b><span data-lv="freeDesc"></span></div>
      <div class="lv-tabs"><button id="lvTabLife" class="lv-tab"></button><button id="lvTabMonth" class="lv-tab"></button></div>
      <div class="lv-list" id="lvModalList"></div>
    </div>`;
    document.body.appendChild(ov);
    const t=tr();
    ov.querySelectorAll('[data-lv]').forEach(el=>el.textContent=t[el.dataset.lv]);
    document.getElementById('lvTabLife').onclick=()=>render('life');
    document.getElementById('lvTabMonth').onclick=()=>render('month');
    document.getElementById('lvClose').onclick=()=>ov.classList.remove('open');
    ov.onclick=e=>{if(e.target===ov)ov.classList.remove('open');};
    injectCss();
  }
  function open(tab){
    build();
    const t0=tr();const ov=document.getElementById('levelsModal');
    ov.querySelectorAll('[data-lv]').forEach(el=>el.textContent=t0[el.dataset.lv]);
    document.getElementById('lvTabLife').textContent=t0.tabLife;
    document.getElementById('lvTabMonth').textContent=t0.tabMonth;
    ov.classList.add('open');
    render(tab||'life');
  }
  window.openLevelsModal=open;
  document.addEventListener('calf:langchanged',()=>{const ov=document.getElementById('levelsModal');if(ov&&ov.classList.contains('open')){const on=document.getElementById('lvTabMonth').classList.contains('on');open(on?'month':'life');}});

  function injectCss(){
    if(document.getElementById('lvCss'))return;const s=document.createElement('style');s.id='lvCss';
    s.textContent=`.lv-overlay{display:none;position:fixed;inset:0;z-index:340;background:rgba(15,23,42,.55);align-items:center;justify-content:center;padding:16px}
    .lv-overlay.open{display:flex}
    .lv-box{background:var(--card,#fff);color:var(--ink,#1f2937);border-radius:24px;max-width:620px;width:100%;max-height:90vh;overflow:auto;padding:24px 22px;position:relative;box-shadow:0 30px 90px rgba(0,0,0,.38)}
    .lv-title{font-family:var(--display,inherit);margin:0 0 4px;font-size:22px}
    .lv-sub{color:var(--muted,#64748b);font-size:13px;margin:0 0 12px}
    .lv-free{background:#fff8ec;border:1.5px dashed #f2c879;border-radius:14px;padding:10px 13px;font-size:12.5px;line-height:1.5;margin-bottom:12px}
    .lv-free b{display:block;color:#b45309;margin-bottom:2px}
    .lv-tabs{display:flex;gap:8px;margin:6px 0 12px;position:sticky;top:0;background:var(--card,#fff);padding:4px 0;z-index:2}
    .lv-tab{flex:1;padding:11px 8px;border-radius:13px;border:2px solid var(--line,#e5e7eb);background:var(--card-soft,#f8fafc);font-weight:900;font-size:13.5px;cursor:pointer}
    .lv-tab.on{background:linear-gradient(180deg,#5eead4,#14b8a6);border-color:#0d9488;color:#fff;box-shadow:0 4px 0 #0f766e}
    .lv-list{display:flex;flex-direction:column;gap:10px}
    .lv-row{display:flex;gap:12px;border:1.5px solid var(--line,#e9eef5);border-radius:16px;padding:12px;background:#fff}
    .lv-row.cur{border-color:#14b8a6;box-shadow:0 0 0 3px rgba(20,184,166,.16);background:linear-gradient(180deg,#f2fffc,#fff)}
    .lv-row.locked{opacity:.62}
    .lv-badge{width:46px;height:46px;flex:0 0 46px;border-radius:15px;display:grid;place-items:center;font-weight:900;font-size:20px;color:#fff;font-family:var(--display,inherit)}
    .lv-badge-life-1{background:linear-gradient(145deg,#9bd2ff,#5aa9f0)}
    .lv-badge-life-2{background:linear-gradient(145deg,#7fd9c6,#34b7a0)}
    .lv-badge-life-3{background:linear-gradient(145deg,#5ec7a0,#22a06b)}
    .lv-badge-life-4{background:linear-gradient(145deg,#8aa6f5,#6366f1)}
    .lv-badge-life-5{background:linear-gradient(145deg,#b79af5,#8b5cf6)}
    .lv-badge-life-6{background:linear-gradient(145deg,#f6c36b,#e0922f)}
    .lv-badge-life-7{background:linear-gradient(145deg,#c9a0ff,#7c3aed);box-shadow:0 0 0 4px rgba(124,58,237,.15)}
    .lv-badge-month-1,.lv-badge-month-2{background:linear-gradient(145deg,#e0a46a,#b8793d)}
    .lv-badge-month-3,.lv-badge-month-4{background:linear-gradient(145deg,#c7cede,#8d99b5)}
    .lv-badge-month-5,.lv-badge-month-6{background:linear-gradient(145deg,#ffd66b,#e8a91f)}
    .lv-body{flex:1;min-width:0}
    .lv-head{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .lv-head b{font-family:var(--display,inherit);font-size:15.5px}
    .lv-here{background:#14b8a6;color:#fff;font-size:10.5px;font-weight:900;padding:2px 8px;border-radius:99px}
    .lv-lock{background:#eef2f7;color:#94a3b8;font-size:10.5px;font-weight:900;padding:2px 8px;border-radius:99px}
    .lv-rule{font-size:12.5px;font-weight:800;color:#334155;margin:3px 0 2px}
    .lv-desc{font-size:12px;color:var(--muted,#7b8798);line-height:1.45}
    .lv-rewards{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
    .lv-perk{font-size:11px;font-weight:800;color:#0f766e;background:#ecfdf7;border:1px solid #cdeee4;border-radius:99px;padding:2px 9px}
    .lv-prog{height:8px;border-radius:99px;background:#e9eef5;overflow:hidden;margin-top:8px}
    .lv-prog i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--primary,#14b8a6),var(--accent,#f59e0b))}
    .lv-prog-t{font-size:10.5px;color:#94a3b8;margin-top:4px;font-weight:700}
    .lv-meta{font-size:12px;font-weight:800;color:#475569;background:#f8fafc;border-radius:10px;padding:8px 11px;margin-bottom:8px}
    .lv-note{font-size:11.5px;color:#8491a5;line-height:1.5;margin:10px 2px 2px}
    [dir="rtl"] .lv-row{flex-direction:row-reverse;text-align:right}`;
    document.head.appendChild(s);
  }
  function init(){
    build();
    // 头像菜单“等级与进度”
    document.addEventListener('click',e=>{const it=e.target.closest&&e.target.closest('#avatarDrop .ad-item[data-action="levels"]');if(it){e.preventDefault();open('life');}});
    // 会员卡片：点头像/两个等级盒/查看进度按钮打开
    const hook=()=>{
      ['membershipAvatar','monthlyLevelValue','lifetimeLevelValue'].forEach(id=>{const el=document.getElementById(id);if(el&&!el.dataset.lvHook){el.dataset.lvHook='1';el.style.cursor='pointer';el.addEventListener('click',ev=>{ev.stopPropagation();open(id.indexOf('monthly')===0?'month':'life');});}});
      const mbtn=document.getElementById('membershipBtn');if(mbtn){mbtn.style.cursor='pointer';mbtn.onclick=function(ev){ev.preventDefault();ev.stopPropagation();open('life');};}
      const mb=document.getElementById('membershipCard');if(mb&&!mb.dataset.lvHook){mb.dataset.lvHook='1';}
      const mbox=document.getElementById('monthlyLevelName');if(mbox&&!mbox.dataset.lvHook){mbox.dataset.lvHook='1';mbox.style.cursor='pointer';mbox.addEventListener('click',ev=>{ev.stopPropagation();open('month');});}
      const lbox=document.getElementById('lifetimeLevelName');if(lbox&&!lbox.dataset.lvHook){lbox.dataset.lvHook='1';lbox.style.cursor='pointer';lbox.addEventListener('click',ev=>{ev.stopPropagation();open('life');});}
    };
    hook();setInterval(hook,1200);
    document.addEventListener('calf:avatar-menu-ready',()=>setTimeout(hook,50));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
