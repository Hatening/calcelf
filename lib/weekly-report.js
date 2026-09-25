// lib/weekly-report.js — CalcElf 家长周报：真实数据聚合 + 多语言邮件渲染 + 退订签名
// 数据来源：profiles / credit_ledger / practice_results / practice_items / user_badges / badges
const crypto = require('crypto');

const DICT = {
  en: { title: 'Your Weekly Learning Report', subject: '📬 Your CalcElf weekly learning report', hello: 'Hello,', solved: 'problems solved', practice_done: 'practice questions', accuracy: 'practice accuracy', streak: 'day streak', mastery: 'Practice levels this week', weak: 'Let\u2019s practice this week', weak_fmt: '%1 practice \u2014 accuracy %2', no_weak: 'Great work! No weak spots detected this week.', badges: 'Badges earned', no_badges: '', credits_line: 'Credits used this week: %1 \u00b7 remaining: %2', cta: 'Open CalcElf', empty: 'No learning activity this week. Snap the first problem together!', unsub: 'You received this email because weekly reports are on. <a href="{{link}}">Unsubscribe</a>.', confirmed: 'You have been unsubscribed from weekly reports.', lvl: ['Level 1', 'Level 2', 'Level 3'] },
  zh: { title: '本周学习简报', subject: '📬 CalcElf 本周学习简报', hello: '您好，', solved: '道解题', practice_done: '道练习题', accuracy: '练习正确率', streak: '连续学习天数', mastery: '本周各难度练习', weak: '本周建议加强', weak_fmt: '%1 练习 \u2014\u2014 正确率 %2', no_weak: '表现很棒！本周没有发现明显薄弱项。', badges: '获得徽章', no_badges: '', credits_line: '本周消耗 Credits：%1，剩余：%2', cta: '打开 CalcElf', empty: '本周还没有学习记录，和孩子一起拍下第一道题吧！', unsub: '您收到此邮件是因为开启了周报。<a href="{{link}}">退订</a>。', confirmed: '您已成功退订每周学习简报。', lvl: ['难度一', '难度二', '难度三'] },
  ja: { title: '今週の学習レポート', subject: '📬 CalcElf 今週の学習レポート', hello: 'こんにちは、', solved: '問を解決', practice_done: '練習問題', accuracy: '練習の正答率', streak: '連続学習日数', mastery: '今週の練習レベル', weak: '今週の練習ポイント', weak_fmt: '%1練習 \u2014 正答率 %2', no_weak: '素晴らしい！今逌、弱点は見つかりませんでした。', badges: '獲得バッジ', no_badges: '', credits_line: '今週のクレジット使用：%1・残り：%2', cta: 'CalcElfを開く', empty: '今週の学習記録がありません。最初の問題を一緒に撮影しましょう！', unsub: '週間レポートが有効なため受信しました。<a href="{{link}}">配信停止</a>。', confirmed: '週間レポートを配信停止しました。', lvl: ['レベル1', 'レベル2', 'レベル3'] },
  ko: { title: '이번 주 학습 보고서', subject: '📬 CalcElf 주간 학습 보고서', hello: '안녕하세요,', solved: '문제 해결', practice_done: '연습 문제', accuracy: '연습 정답률', streak: '연속 학습일', mastery: '이번 주 연습 난이도', weak: '이번 주 연습할 부분', weak_fmt: '%1 연습 \u2014 정답률 %2', no_weak: '잘했어요! 이번 주에 약점이 발견되지 않았어요.', badges: '획득 배지', no_badges: '', credits_line: '이번 주 사용 크레딧: %1 · 남은 크레딧: %2', cta: 'CalcElf 열기', empty: '이번 주 학습 기록이 없어요. 함께 첫 문제를 찍어보세요!', unsub: '주간 보고서가 켜져 있어 수신되었습니다. <a href="{{link}}">수신 거부</a>.', confirmed: '주간 보고서 수신을 거부했습니다.', lvl: ['레벨 1', '레벨 2', '레벨 3'] },
  fr: { title: 'Votre rapport hebdomadaire', subject: '📬 Votre rapport CalcElf de la semaine', hello: 'Bonjour,', solved: 'probl\u00e8mes r\u00e9solus', practice_done: 'exercices', accuracy: 'r\u00e9ussite aux exercices', streak: 'jours cons\u00e9cutifs', mastery: 'Niveaux d\u2019exercice cette semaine', weak: '\u00c0 pratiquer cette semaine', weak_fmt: 'Exercice %1 \u2014 r\u00e9ussite %2', no_weak: 'Bravo ! Aucun point faible d\u00e9tect\u00e9 cette semaine.', badges: 'Badges obtenus', no_badges: '', credits_line: 'Cr\u00e9dits utilis\u00e9s cette semaine : %1 \u00b7 restants : %2', cta: 'Ouvrir CalcElf', empty: 'Aucune activit\u00e9 cette semaine. Photographiez le premier probl\u00e8me ensemble !', unsub: 'Vous recevez ceci car les rapports sont activ\u00e9s. <a href="{{link}}">Se d\u00e9sabonner</a>.', confirmed: 'Vous vous \u00eates d\u00e9sabonn\u00e9 des rapports hebdomadaires.', lvl: ['Niveau 1', 'Niveau 2', 'Niveau 3'] },
  de: { title: 'Ihr Wochenbericht', subject: '📬 Ihr w\u00f6chentlicher CalcElf-Bericht', hello: 'Hallo,', solved: 'gel\u00f6ste Aufgaben', practice_done: '\u00dcbungsaufgaben', accuracy: '\u00dcbungs-Erfolgsquote', streak: 'Tage in Folge', mastery: '\u00dcbungslevel diese Woche', weak: 'Diese Woche \u00fcben', weak_fmt: '%1-\u00dcbung \u2014 Erfolgsquote %2', no_weak: 'Super! Diese Woche wurden keine Schw\u00e4chen erkannt.', badges: 'Abzeichen erhalten', no_badges: '', credits_line: 'Credits diese Woche verbraucht: %1 \u00b7 verbleibend: %2', cta: 'CalcElf \u00f6ffnen', empty: 'Diese Woche keine Lernaktivit\u00e4t. Fotografieren Sie gemeinsam die erste Aufgabe!', unsub: 'Sie erhalten dies, weil Wochenberichte aktiviert sind. <a href="{{link}}">Abmelden</a>.', confirmed: 'Sie wurden von den Wochenberichten abgemeldet.', lvl: ['Level 1', 'Level 2', 'Level 3'] },
  es: { title: 'Tu informe semanal', subject: '📬 Tu informe semanal de CalcElf', hello: 'Hola,', solved: 'problemas resueltos', practice_done: 'ejercicios de pr\u00e1ctica', accuracy: 'precisi\u00f3n en pr\u00e1ctica', streak: 'd\u00edas seguidos', mastery: 'Niveles de pr\u00e1ctica esta semana', weak: 'A practicar esta semana', weak_fmt: 'Pr\u00e1ctica %1 \u2014 precisi\u00f3n %2', no_weak: '\xa1Excelente! No se detectaron puntos d\u00e9biles esta semana.', badges: 'Insignias obtenidas', no_badges: '', credits_line: 'Cr\u00e9ditos usados esta semana: %1 \u00b7 restantes: %2', cta: 'Abrir CalcElf', empty: 'Sin actividad esta semana. \xa1Fotograf\u00eden juntos el primer problema!', unsub: 'Recibes esto porque los informes est\u00e1n activados. <a href="{{link}}">Darse de baja</a>.', confirmed: 'Te has dado de baja de los informes semanales.', lvl: ['Nivel 1', 'Nivel 2', 'Nivel 3'] },
  it: { title: 'Il tuo rapporto settimanale', subject: '📬 Il tuo rapporto settimanale CalcElf', hello: 'Ciao,', solved: 'problemi risolti', practice_done: 'esercizi', accuracy: 'accuratezza esercizi', streak: 'giorni consecutivi', mastery: 'Livelli di esercizio questa settimana', weak: 'Da esercitare questa settimana', weak_fmt: 'Esercizio %1 \u2014 accuratezza %2', no_weak: 'Ottimo lavoro! Nessun punto debole rilevato questa settimana.', badges: 'Badge ottenuti', no_badges: '', credits_line: 'Crediti usati questa settimana: %1 \u00b7 rimanenti: %2', cta: 'Apri CalcElf', empty: 'Nessuna attivit\u00e0 questa settimana. Fotografate insieme il primo problema!', unsub: 'Ricevi questo perch\u00e9 i rapporti sono attivi. <a href="{{link}}">Annulla iscrizione</a>.', confirmed: 'Iscrizione ai rapporti settimanali annullata.', lvl: ['Livello 1', 'Livello 2', 'Livello 3'] },
  ar: { title: 'تقرير التعلم الأسبوعي', subject: '📬 تقرير CalcElf الأسبوعي', hello: 'مرحباً،', solved: 'مسألة محلولة', practice_done: 'تمارين', accuracy: 'دقة التمارين', streak: 'أيام متتالية', mastery: 'مستويات التمرين هذا الأسبوع', weak: 'لنتمرن هذا الأسبوع', weak_fmt: 'تمرين %1 — الدقة %2', no_weak: 'عمل رائع! لم يتم رصد نقاط ضعف هذا الأسبوع.', badges: 'شارات مكتسبة', no_badges: '', credits_line: 'الأرصدة المستخدمة هذا الأسبوع: %1 · المتبقي: %2', cta: 'افتح CalcElf', empty: 'لا يوجد نشاط تعليمي هذا الأسبوع. التقط أول مسألة معاً!', unsub: 'تتلقى هذا لأن التقارير مفعلة. <a href="{{link}}">إلغاء الاشتراك</a>.', confirmed: 'تم إلغاء اشتراكك في التقارير الأسبوعية.', lvl: ['المستوى 1', 'المستوى 2', 'المستوى 3'] },
  fa: { title: 'گزارش هفتگی یادگیری', subject: '📬 گزارش هفتگی CalcElf', hello: 'سلام،', solved: 'مسئله حل‌شده', practice_done: 'تمرین', accuracy: 'دقت تمرین', streak: 'روز پیاپی', mastery: 'سطوح تمرین این هفته', weak: 'تمرین این هفته', weak_fmt: 'تمرین %1 — دقت %2', no_weak: 'عالی! این هفته نقطه‌ضعفی شناسایی نشد.', badges: 'نشان‌های دریافتی', no_badges: '', credits_line: 'اعتبار مصرف‌شده این هفته: %1 · باقی‌مانده: %2', cta: 'باز کردن CalcElf', empty: 'این هفته فعالیتی ثبت نشده. اولین مسئله را با هم عکس بگیرید!', unsub: 'این ایمیل به‌دلیل فعال‌بودن گزارش ارسال شد. <a href="{{link}}">لغو اشتراک</a>.', confirmed: 'اشتراک گزارش هفتگی لغو شد.', lvl: ['سطح ۱', 'سطح ۲', 'سطح ۳'] },
  'pt-BR': { title: 'Seu relat\u00f3rio semanal', subject: '📬 Seu relat\u00f3rio semanal do CalcElf', hello: 'Ol\u00e1,', solved: 'problemas resolvidos', practice_done: 'exerc\u00edcios', accuracy: 'aproveitamento nos exerc\u00edcios', streak: 'dias seguidos', mastery: 'N\u00edveis de exerc\u00edcio nesta semana', weak: 'Praticar nesta semana', weak_fmt: 'Exerc\u00edcio %1 \u2014 aproveitamento %2', no_weak: '\u00d3timo trabalho! Nenhum ponto fraco detectado nesta semana.', badges: 'Distintivos conquistados', no_badges: '', credits_line: 'Cr\u00e9ditos usados nesta semana: %1 \u00b7 restantes: %2', cta: 'Abrir CalcElf', empty: 'Nenhuma atividade esta semana. Fotografem o primeiro problema juntos!', unsub: 'Voc\u00ea recebe isto porque os relat\u00f3rios est\u00e3o ativos. <a href="{{link}}">Cancelar inscri\u00e7\u00e3o</a>.', confirmed: 'Inscri\u00e7\u00e3o nos relat\u00f3rios semanais cancelada.', lvl: ['N\u00edvel 1', 'N\u00edvel 2', 'N\u00edvel 3'] },
  id: { title: 'Laporan Mingguan Anda', subject: '📬 Laporan mingguan CalcElf Anda', hello: 'Halo,', solved: 'soal diselesaikan', practice_done: 'latihan', accuracy: 'akurasi latihan', streak: 'hari beruntun', mastery: 'Level latihan minggu ini', weak: 'Latihan minggu ini', weak_fmt: 'Latihan %1 \u2014 akurasi %2', no_weak: 'Kerja bagus! Tidak ada bagian lemah minggu ini.', badges: 'Lencana didapat', no_badges: '', credits_line: 'Kredit dipakai minggu ini: %1 \u00b7 tersisa: %2', cta: 'Buka CalcElf', empty: 'Belum ada aktivitas minggu ini. Foto soal pertama bersama!', unsub: 'Anda menerima ini karena laporan aktif. <a href="{{link}}">Berhenti berlangganan</a>.', confirmed: 'Anda berhenti berlangganan laporan mingguan.', lvl: ['Level 1', 'Level 2', 'Level 3'] },
  vi: { title: 'B\u00e1o c\u00e1o h\u00e0ng tu\u1ea7n c\u1ee7a b\u1ea1n', subject: '📬 B\u00e1o c\u00e1o h\u00e0ng tu\u1ea7n CalcElf', hello: 'Xin ch\u00e0o,', solved: 'b\u00e0i \u0111\u00e3 gi\u1ea3i', practice_done: 'b\u00e0i luy\u1ec7n t\u1eadp', accuracy: '\u0111\u1ed9 ch\u00ednh x\u00e1c', streak: 'ng\u00e0y li\u00ean ti\u1ebfp', mastery: 'C\u1ea5p \u0111\u1ed9 luy\u1ec7n t\u1eadp tu\u1ea7n n\u00e0y', weak: 'C\u1ea7n luy\u1ec7n tu\u1ea7n n\u00e0y', weak_fmt: 'Luy\u1ec7n %1 \u2014 \u0111\u1ed9 ch\u00ednh x\u00e1c %2', no_weak: 'L\u00e0m t\u1ed1t l\u1eafm! Tu\u1ea7n n\u00e0y ch\u01b0a th\u1ea5y \u0111i\u1ec3m y\u1ebfu.', badges: 'Huy hi\u1ec7u nh\u1eadn \u0111\u01b0\u1ee3c', no_badges: '', credits_line: 'Credits \u0111\u00e3 d\u00f9ng tu\u1ea7n n\u00e0y: %1 \u00b7 c\u00f2n l\u1ea1i: %2', cta: 'M\u1edf CalcElf', empty: 'Tu\u1ea7n n\u00e0y ch\u01b0a c\u00f3 ho\u1ea1t \u0111\u1ed9ng. H\u00e3y ch\u1ee5p b\u00e0i \u0111\u1ea7u ti\u00ean c\u00f9ng nhau!', unsub: 'B\u1ea1n nh\u1eadn \u0111\u01b0\u1ee3c v\u00ec b\u00e1o c\u00e1o \u0111ang b\u1eadt. <a href="{{link}}">H\u1ee7y \u0111\u0103ng k\u00fd</a>.', confirmed: '\u0110\u00e3 h\u1ee7y \u0111\u0103ng k\u00fd b\u00e1o c\u00e1o h\u00e0ng tu\u1ea7n.', lvl: ['C\u1ea5p 1', 'C\u1ea5p 2', 'C\u1ea5p 3'] },
  th: { title: 'รายงานการเรียนประจำสัปดาห์', subject: '📬 รายงานการเรียนประจำสัปดาห์จาก CalcElf', hello: 'สวัสดีครับ/ค่ะ,', solved: 'โจทย์ที่แก้แล้ว', practice_done: 'แบบฝึกหัด', accuracy: 'ความแม่นยำ', streak: 'วันที่ทำติดต่อ', mastery: 'ระดับแบบฝึกหัดสัปดาห์นี้', weak: 'ควรฝึกสัปดาห์นี้', weak_fmt: 'แบบฝึกหัด %1 — ความแม่นยำ %2', no_weak: 'ยอดเยี่ยม! สัปดาห์นี้ไม่พบจุดที่ต้องปรับ', badges: 'เหรียญที่ได้รับ', no_badges: '', credits_line: 'เครดิตที่ใช้สัปดาห์นี้: %1 · คงเหลือ: %2', cta: 'เปิด CalcElf', empty: 'สัปดาห์นี้ยังไม่มีกิจกรรม ลองถ่ายโจทย์ข้อแรกด้วยกัน!', unsub: 'คุณได้รับเพราะเปิดรายงานสัปดาห์ไว้ <a href="{{link}}">ยกเลิก</a>.', confirmed: 'ยกเลิกรายงานสัปดาห์แล้ว', lvl: ['ระดับ 1', 'ระดับ 2', 'ระดับ 3'] },
  tr: { title: 'Haftalık Öğrenme Raporunuz', subject: '📬 CalcElf haftalık öğrenme raporunuz', hello: 'Merhaba,', solved: 'çözülen problem', practice_done: 'alıştırma', accuracy: 'alıştırma doğruluğu', streak: 'gün üst üste', mastery: 'Bu haftaki alıştırma seviyeleri', weak: 'Bu hafta çalışılacaklar', weak_fmt: '%1 alıştırması — doğruluk %2', no_weak: 'Aferin! Bu hafta zayıf nokta görülmedi.', badges: 'Kazanılan rozetler', no_badges: '', credits_line: 'Bu hafta kullanılan kredi: %1 · kalan: %2', cta: 'CalcElf\u2019i aç', empty: 'Bu hafta öğrenme etkinliği yok. İlk problemi birlikte fotoğraflayın!', unsub: 'Haftalık raporlar açık olduğu için aldınız. <a href="{{link}}">Aboneliği iptal et</a>.', confirmed: 'Haftalık rapor aboneliği iptal edildi.', lvl: ['Seviye 1', 'Seviye 2', 'Seviye 3'] },
  hi: { title: 'आपकी साप्ताहिक रिपोर्ट', subject: '📬 आपकी CalcElf साप्ताहिक शिक्षण रिपोर्ट', hello: 'नमस्ते,', solved: 'समस्याएँ हल', practice_done: 'अभ्यास प्रश्न', accuracy: 'अभ्यास सटीकता', streak: 'दिन लगातार', mastery: 'इस सप्ताह अभ्यास स्तर', weak: 'इस सप्ताह अभ्यास करें', weak_fmt: '%1 अभ्यास — सटीकता %2', no_weak: 'बहुत बढ़िया! इस सप्ताह कोई कमज़ोरी नहीं मिली।', badges: 'बैज मिले', no_badges: '', credits_line: 'इस सप्ताह उपयोग किए गए क्रेडिट: %1 · शेष: %2', cta: 'CalcElf खोलें', empty: 'इस सप्ताह कोई गतिविधि नहीं। पहला सवाल साथ मिलकर फ़ोटो लें!', unsub: 'साप्ताहिक रिपोर्ट चालू होने के कारण प्राप्त हुई। <a href="{{link}}">अनसब्सक्राइब</a>.', confirmed: 'आपको साप्ताहिक रिपोर्ट से अनसब्सक्राइब कर दिया गया है।', lvl: ['स्तर 1', 'स्तर 2', 'स्तर 3'] },
  bn: { title: 'আপনার সাপ্তাহিক রিপোর্ট', subject: '📬 আপনার CalcElf সাপ্তাহিক শিক্ষা রিপোর্ট', hello: 'হ্যালো,', solved: 'সমস্যা সমাধান', practice_done: 'অনুশীলনী', accuracy: 'অনুশীলনে নির্ভুলতা', streak: 'দিন পরপর', mastery: 'এই সপ্তাহের অনুশীলন স্তর', weak: 'এই সপ্তাহ যা অনুশীলন করবেন', weak_fmt: '%1 অনুশীলন — নির্ভুলতা %2', no_weak: 'দারুণ! এই সপ্তাহে কোনো দুর্বল দিক পাওয়া যায়নি।', badges: 'ব্যাজ পেয়েছেন', no_badges: '', credits_line: 'এই সপ্তাহে ব্যবহৃত ক্রেডিট: %1 · বাকি: %2', cta: 'CalcElf খুলুন', empty: 'এই সপ্তাহে কোনো শেখার কার্যক্রম নেই। একসাথে প্রথম সমস্যাটির ছবি তুলুন!', unsub: 'সাপ্তাহিক রিপোর্ট চালু থাকায় পেয়েছেন। <a href="{{link}}">আনসাবস্ক্রাইব</a>.', confirmed: 'সাপ্তাহিক রিপোর্ট থেকে আনসাবস্ক্রাইব করা হয়েছে।', lvl: ['লেভেল 1', 'লেভেল 2', 'লেভেল 3'] }
};

function normLang(l) {
  if (!l) return 'en';
  if (l === 'zh-CN' || l === 'zh-TW' || l === 'zh-Hans' || l === 'zh-Hant') return 'zh';
  if (l === 'pt') return 'pt-BR';
  return DICT[l] ? l : 'en';
}
function tr(lang, key, vars) {
  const d = DICT[normLang(lang)] || DICT.en;
  let s = d[key] != null ? d[key] : (DICT.en[key] != null ? DICT.en[key] : key);
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.split('%' + k).join(v);
  return s;
}
function fill(s, vars) { let out = s; for (const [k, v] of Object.entries(vars || {})) out = out.split('{{' + k + '}}').join(v); return out; }
function pct(x) { return x == null ? '—' : Math.round(x * 100) + '%'; }
function barColor(x) { return x == null ? '#cbd5e1' : (x >= 0.8 ? '#10b981' : x >= 0.6 ? '#f59e0b' : '#ef4444'); }

function secret() { return process.env.CRON_SECRET || process.env.RESEND_API_KEY || 'calcelf-dev-secret'; }
function unsubToken(userId) { return crypto.createHmac('sha256', secret()).update('unsub:' + userId).digest('hex'); }
function verifyUnsub(userId, token) {
  const expect = unsubToken(userId);
  if (!token || token.length !== expect.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expect));
}

// 聚合某用户最近 7 天真实数据
async function buildReport(sb, userId, fromDate) {
  const fromISO = fromDate.toISOString();
  const { data: p } = await sb.from('profiles')
    .select('language,plan,credits_monthly,credits_paid,credits_bonus,monthly_streak,stars')
    .eq('id', userId).maybeSingle();
  const lang = normLang(p?.language || 'en');

  const { data: ledger } = await sb.from('credit_ledger')
    .select('delta,reason,created_at').eq('user_id', userId).gte('created_at', fromISO);
  const rows = ledger || [];
  const solves = rows.filter(r => r.reason === 'solve' || r.reason === 'free_daily_solve').length;
  const creditsSpent = rows.filter(r => r.delta < 0).reduce((s, r) => s + (-r.delta), 0);

  const { data: results } = await sb.from('practice_results')
    .select('practice_id,correct,created_at').eq('user_id', userId).gte('created_at', fromISO);
  const rlist = results || [];
  const practiceTotal = rlist.length;
  const practiceCorrect = rlist.filter(r => r.correct).length;
  const accuracy = practiceTotal ? practiceCorrect / practiceTotal : null;

  const byLevel = [];
  if (practiceTotal) {
    const ids = [...new Set(rlist.map(r => r.practice_id).filter(Boolean))];
    const { data: items } = await sb.from('practice_items')
      .select('id,level').in('id', ids);
    const lvlOf = {};
    (items || []).forEach(it => { lvlOf[it.id] = it.level; });
    const acc = { 1: { n: 0, c: 0 }, 2: { n: 0, c: 0 }, 3: { n: 0, c: 0 } };
    rlist.forEach(r => { const L = lvlOf[r.practice_id]; if (L && acc[L]) { acc[L].n++; if (r.correct) acc[L].c++; } });
    [1, 2, 3].forEach(L => { if (acc[L].n) byLevel.push({ level: L, total: acc[L].n, correct: acc[L].c, accuracy: acc[L].c / acc[L].n }); });
  }

  // 连续学习天数：解题/练习/聊天有活动的自然日
  const days = new Set();
  rows.forEach(r => days.add(String(r.created_at).slice(0, 10)));
  rlist.forEach(r => days.add(String(r.created_at).slice(0, 10)));
  let streak = 0;
  const cursor = new Date(); cursor.setUTCHours(0, 0, 0, 0);
  if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (days.has(cursor.toISOString().slice(0, 10))) { streak++; cursor.setUTCDate(cursor.getUTCDate() - 1); }

  const { data: badgeRows } = await sb.from('user_badges')
    .select('earned_at,badges(name,icon)').eq('user_id', userId).gte('earned_at', fromISO);
  const badges = (badgeRows || []).map(b => ({ name: b.badges?.name || '', icon: b.badges?.icon || '🏅' }));

  const weakLevels = byLevel.filter(x => x.total >= 2 && x.accuracy < 0.7).sort((a, b) => a.accuracy - b.accuracy).slice(0, 3);
  const weakTopics = weakLevels.map(w => tr(lang, 'weak_fmt', { 1: tr(lang, 'lvl')[w.level - 1], 2: pct(w.accuracy) }));

  const creditsLeft = (p?.credits_monthly || 0) + (p?.credits_paid || 0) + (p?.credits_bonus || 0);

  return {
    version: 2,
    generated_at: new Date().toISOString(),
    lang,
    solve_count: solves,
    practice_total: practiceTotal,
    practice_correct: practiceCorrect,
    accuracy,
    streak,
    by_level: byLevel,
    weak_levels: weakLevels.map(w => w.level),
    weak_topics: weakTopics,
    badges,
    credits_spent: creditsSpent,
    credits_left: creditsLeft,
    plan: p?.plan || 'free',
    active: solves + practiceTotal > 0
  };
}

function renderEmail(report, appUrl, unsubUrl) {
  const lang = report.lang || 'en';
  const dir = (lang === 'ar' || lang === 'fa') ? 'rtl' : 'ltr';
  const bars = (report.by_level || []).map(x => {
    const p = Math.round(x.accuracy * 100);
    return `<div style="margin:10px 0;"><div style="display:flex;justify-content:space-between;font-size:13px;color:#475569;margin-bottom:4px;"><span>${tr(lang, 'lvl')[x.level - 1]}</span><span>${p}%</span></div><div style="height:10px;background:#e2e8f0;border-radius:6px;overflow:hidden;"><div style="height:10px;width:${p}%;background:${barColor(x.accuracy)};border-radius:6px;"></div></div></div>`;
  }).join('');
  const weakHTML = (report.weak_topics && report.weak_topics.length)
    ? report.weak_topics.map(w => `<li style="margin:6px 0;padding:10px 14px;background:#fff7ed;border-radius:10px;font-size:14px;color:#9a3412;">${w}</li>`).join('')
    : `<li style="margin:6px 0;padding:10px 14px;background:#f0fdf4;border-radius:10px;font-size:14px;color:#166534;">${tr(lang, 'no_weak')}</li>`;
  const badgeHTML = (report.badges && report.badges.length)
    ? report.badges.map(b => `<span style="display:inline-block;margin:4px;padding:6px 12px;background:#fefce8;border-radius:999px;font-size:14px;">${b.icon || '🏅'} ${b.name || ''}</span>`).join('')
    : '';
  const stat = (num, label) => `<div style="flex:1;text-align:center;padding:14px 6px;background:#f0fdfa;border-radius:14px;"><div style="font-size:26px;font-weight:800;color:#0F766E;line-height:1.2;">${num}</div><div style="font-size:11px;color:#64748b;margin-top:4px;">${label}</div></div>`;

  return `<!DOCTYPE html><html dir="${dir}" lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:20px;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Noto Sans SC','Noto Sans Arabic','Noto Sans Thai','Noto Sans Devanagari','Noto Sans Bengali',sans-serif;color:#1e293b;">
<div style="max-width:540px;margin:0 auto;background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,.08);">
  <div style="background:linear-gradient(135deg,#14B8A6,#0F766E);padding:30px 24px;color:#fff;text-align:center;">
    <div style="font-size:34px;line-height:1;">🧚</div>
    <h1 style="margin:8px 0 0;font-size:21px;">${tr(lang, 'title')}</h1>
  </div>
  <div style="padding:24px;">
    <p style="margin:0 0 16px;font-size:15px;">${tr(lang, 'hello')}</p>
    <div style="display:flex;gap:10px;margin:16px 0;">
      ${stat(report.solve_count || 0, tr(lang, 'solved'))}
      ${stat(pct(report.accuracy), tr(lang, 'accuracy'))}
      ${stat(report.streak || 0, tr(lang, 'streak'))}
    </div>
    ${bars ? `<div style="margin:20px 0;"><h3 style="margin:0 0 6px;font-size:14px;color:#334155;">${tr(lang, 'mastery')}</h3>${bars}</div>` : ''}
    <div style="margin:20px 0;"><h3 style="margin:0 0 8px;font-size:14px;color:#334155;">💡 ${tr(lang, 'weak')}</h3><ul style="list-style:none;padding:0;margin:0;">${weakHTML}</ul></div>
    ${badgeHTML ? `<div style="margin:20px 0;"><h3 style="margin:0 0 8px;font-size:14px;color:#334155;">${tr(lang, 'badges')}</h3><div>${badgeHTML}</div></div>` : ''}
    <div style="margin:20px 0;text-align:center;font-size:13px;color:#64748b;background:#f8fafc;border-radius:12px;padding:12px;">${tr(lang, 'credits_line', { 1: report.credits_spent || 0, 2: report.credits_left || 0 })}</div>
    <a href="${appUrl}/?weekly=1" style="display:block;text-align:center;background:#14B8A6;color:#fff;padding:15px;border-radius:14px;text-decoration:none;font-weight:700;font-size:16px;margin:18px 0;">${tr(lang, 'cta')} →</a>
  </div>
  <div style="font-size:11px;color:#94a3b8;text-align:center;padding:16px 24px;border-top:1px solid #e2e8f0;line-height:1.6;">CalcElf · ${fill(tr(lang, 'unsub'), { link: unsubUrl })}</div>
</div></body></html>`;
}

function renderConfirmPage(lang) {
  const dir = (lang === 'ar' || lang === 'fa') ? 'rtl' : 'ltr';
  return `<!DOCTYPE html><html dir="${dir}" lang="${normLang(lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;display:flex;min-height:100vh;align-items:center;justify-content:center;background:#f1f5f9;font-family:-apple-system,'Segoe UI',sans-serif;"><div style="background:#fff;border-radius:20px;padding:40px;max-width:420px;text-align:center;box-shadow:0 4px 24px rgba(15,23,42,.08);"><div style="font-size:40px;">✅</div><p style="font-size:17px;color:#1e293b;">${tr(lang, 'confirmed')}</p></div></body></html>`;
}

module.exports = { DICT, normLang, tr, buildReport, renderEmail, renderConfirmPage, unsubToken, verifyUnsub, pct, barColor };
