/* CalcElf v5.5.2 Frontend Enhancements
 * Modules: Weekly Report, Registration Hardening (server-verified CAPTCHA),
 *          Credits Ledger (real transaction history), Text-only Feedback,
 *          Privacy Center entry points.
 * Font scaling by learning stage lives in app.js applyStage() (body zoom).
 * No external dependencies — pure vanilla JS.
 */
(function(){
'use strict';

const $ = (s, p=document) => p.querySelector(s);
const $$ = (s, p=document) => [...p.querySelectorAll(s)];

// ========== i18n strings (v5.5 new strings, 10 shipped languages) ==========
const I18N = {
  'en': {
    weekly_report:'Weekly Report', weekly_new:'New!', weekly_view:'View your weekly learning report',
    weekly_settings:'Weekly report email', weekly_settings_desc:"Receive a weekly summary of your child's learning progress",
    confirm_password:'Confirm password', password_mismatch:'Passwords do not match',
    agree_privacy:'I have read and agree to the Privacy Policy',
    agree_coppa:'I am a parent / I have parental consent (COPPA)',
    agree_required:'Please tick both boxes to continue.',
    captcha_label:'🤖 Robot check: {{a}} + {{b}} = ?', captcha_required:'Please answer the security question',
    captcha_wrong:'Incorrect answer. Please try again.', captcha_refresh:'Refresh question',
    captcha_loading:'Loading security question…', guard_wait:'Please take a moment to review before submitting.',
    feedback_title:'💌 Send Feedback', feedback_desc:'Suggestions adopted may earn Credits as a reward!',
    feedback_placeholder:'Tell us your ideas to improve CalcElf... (minimum 5 characters)',
    feedback_submit:'Send Feedback', feedback_cancel:'Cancel', feedback_thanks:'Thank you! Your feedback has been received.',
    feedback_empty:'Please enter at least 5 characters.', feedback_fail:'Submission failed. Please try again later.',
    credits_history:'Transaction History', credits_history_hint:'Credits spent and earned',
    ledger_loading:'Loading history…', ledger_signin:'Sign in to view your transaction history.',
    ledger_empty:'No transactions yet. Solve your first problem!',
    credits_solve:'Solve problem', credits_chat:'Chat', credits_voice:'Voice input', credits_practice:'Practice',
    credits_subscription:'Subscription', credits_recharge:'Top up / pack', credits_reward:'Reward',
    credits_free:'Free daily solve', credits_care:'Care reset',
    privacy_center:'Privacy Center', privacy_center_open:'Privacy Center',
    weekly_loading:'Loading your report…', weekly_login:'Please sign in to view your weekly report.',
    weekly_practice:'practice questions', weekly_weak:'Let’s practice this week',
    weekly_mastery:'Practice levels this week',
    weekly_credits:'Credits used: {{a}} · remaining: {{b}}',
    weekly_empty:'No learning activity this week yet. Snap your first problem!',
    weekly_badges:'Badges earned', weekly_no_weak:'Great work! No weak spots detected this week.',
    weekly_retry:'Refresh report', weekly_close:'Close',
    today_solved:'problems solved today', today_accuracy:"today's accuracy", today_streak:'day streak'
  },
  'zh-CN': {
    weekly_report:'学习周报', weekly_new:'新！', weekly_view:'查看本周学习报告',
    weekly_settings:'周报邮件', weekly_settings_desc:'每周接收孩子学习进度总结',
    confirm_password:'确认密码', password_mismatch:'两次密码不一致',
    agree_privacy:'我已阅读并同意《隐私政策》',
    agree_coppa:'我是家长 / 已获得家长同意（COPPA）',
    agree_required:'请勾选两个确认框后继续。',
    captcha_label:'🤖 机器人小考验：{{a}} + {{b}} = ?', captcha_required:'请回答安全问题',
    captcha_wrong:'答案错误，请重试。', captcha_refresh:'换一题',
    captcha_loading:'安全题加载中…', guard_wait:'请稍等片刻，确认信息后再提交。',
    feedback_title:'💌 意见反馈', feedback_desc:'建议一经采纳，将获得 Credits 奖励！',
    feedback_placeholder:'告诉我们您的想法，帮助 CalcElf 变得更好…（至少 5 个字）',
    feedback_submit:'提交反馈', feedback_cancel:'取消', feedback_thanks:'感谢！您的反馈已收到。',
    feedback_empty:'请至少输入 5 个字。', feedback_fail:'提交失败，请稍后再试。',
    credits_history:'使用记录', credits_history_hint:'Credits 的消耗与获得明细',
    ledger_loading:'正在加载记录…', ledger_signin:'登录后可查看使用记录。',
    ledger_empty:'还没有记录，去解第一道题吧！',
    credits_solve:'解题', credits_chat:'对话提问', credits_voice:'语音输入', credits_practice:'练习',
    credits_subscription:'订阅发放', credits_recharge:'充值 / 加油包', credits_reward:'奖励',
    credits_free:'每日免费解题', credits_care:'关怀重置',
    privacy_center:'隐私中心', privacy_center_open:'隐私中心',
    weekly_loading:'正在加载你的学习简报…', weekly_login:'请先登录后查看学习简报。',
    weekly_practice:'道练习题', weekly_weak:'本周建议加强',
    weekly_mastery:'本周各难度练习',
    weekly_credits:'本周消耗 Credits：{{a}} · 剩余：{{b}}',
    weekly_empty:'本周还没有学习记录，去拍下第一道题吧！',
    weekly_badges:'获得徽章', weekly_no_weak:'表现很棒！本周没有发现明显薄弱项。',
    weekly_retry:'刷新简报', weekly_close:'关闭',
    today_solved:'今日解题数', today_accuracy:'今日正确率', today_streak:'连续天数'
  },
'zh-TW': {
    weekly_report:'學習週報', weekly_new:'新！', weekly_view:'檢視本週學習報告',
    weekly_settings:'週報郵件', weekly_settings_desc:'每週接收孩子學習進度總結',
    confirm_password:'確認密碼', password_mismatch:'兩次密碼不一致',
    agree_privacy:'我已閱讀並同意《隱私政策》',
    agree_coppa:'我是家長 / 已獲得家長同意（COPPA）',
    agree_required:'請勾選兩個確認框後繼續。',
    captcha_label:'🤖 機器人小考驗：{{a}} + {{b}} = ?', captcha_required:'請回答安全問題',
    captcha_wrong:'答案錯誤，請重試。', captcha_refresh:'換一題',
    captcha_loading:'安全題載入中…', guard_wait:'請稍等片刻，確認資訊後再提交。',
    feedback_title:'💌 意見反饋', feedback_desc:'建議一經採納，將獲得 Credits 獎勵！',
    feedback_placeholder:'告訴我們您的想法，幫助 CalcElf 變得更好…（至少 5 個字）',
    feedback_submit:'提交反饋', feedback_cancel:'取消', feedback_thanks:'感謝！您的反饋已收到。',
    feedback_empty:'請至少輸入 5 個字。', feedback_fail:'提交失敗，請稍後再試。',
    credits_history:'使用記錄', credits_history_hint:'Credits 的消耗與獲得明細',
    ledger_loading:'正在載入記錄…', ledger_signin:'登入後可檢視使用記錄。',
    ledger_empty:'還沒有記錄，去解第一道題吧！',
    credits_solve:'解題', credits_chat:'對話提問', credits_voice:'語音輸入', credits_practice:'練習',
    credits_subscription:'訂閱發放', credits_recharge:'充值 / 加油包', credits_reward:'獎勵',
    credits_free:'每日免費解題', credits_care:'關懷重置',
    privacy_center:'隱私中心', privacy_center_open:'隱私中心',
    weekly_loading:'正在載入你的學習簡報…', weekly_login:'請先登入後檢視學習簡報。',
    weekly_practice:'道練習題', weekly_weak:'本週建議加強',
    weekly_mastery:'本週各難度練習',
    weekly_credits:'本週消耗 Credits：{{a}} · 剩餘：{{b}}',
    weekly_empty:'本週還沒有學習記錄，去拍下第一道題吧！',
    weekly_badges:'獲得徽章', weekly_no_weak:'表現很棒！本週沒有發現明顯薄弱項。',
    weekly_retry:'重新整理簡報', weekly_close:'關閉',
    today_solved:'今日解題數', today_accuracy:'今日正確率', today_streak:'連續天數'
  },
  'ja': {
    weekly_report:'週間レポート', weekly_new:'新着！', weekly_view:'今週の学習レポートを見る',
    weekly_settings:'週間レポートメール', weekly_settings_desc:'お子様の学習進捗の週次サマリーを受け取る',
    confirm_password:'パスワード（確認）', password_mismatch:'パスワードが一致しません',
    agree_privacy:'プライバシーポリシーを読み、同意します',
    agree_coppa:'保護者です／保護者の同意を得ています（COPPA）',
    agree_required:'続行するには両方のチェックボックスにチェックしてください。',
    captcha_label:'🤖 ロボットチェック：{{a}} + {{b}} = ?', captcha_required:'セキュリティ質問に答えてください',
    captcha_wrong:'不正解です。もう一度お試しください。', captcha_refresh:'別の問題',
    captcha_loading:'セキュリティ質問を読み込み中…', guard_wait:'内容を確認してから送信してください。',
    feedback_title:'💌 フィードバック', feedback_desc:'採用されたご提案には Credits を差し上げます！',
    feedback_placeholder:'CalcElf をより良くするアイデアをお聞かせください…（5文字以上）',
    feedback_submit:'送信', feedback_cancel:'キャンセル', feedback_thanks:'ありがとうございます！フィードバックを受け取りました。',
    feedback_empty:'5文字以上入力してください。', feedback_fail:'送信に失敗しました。後でもう一度お試しください。',
    credits_history:'利用履歴', credits_history_hint:'Credits の消費・獲得明細',
    ledger_loading:'履歴を読み込み中…', ledger_signin:'利用履歴を見るにはログインしてください。',
    ledger_empty:'履歴はまだありません。最初の問題を解きましょう！',
    credits_solve:'問題を解く', credits_chat:'チャット', credits_voice:'音声入力', credits_practice:'練習',
    credits_subscription:'サブスクリプション付与', credits_recharge:'チャージ／パック', credits_reward:'報酬',
    credits_free:'毎日の無料利用', credits_care:'ケアリセット',
    privacy_center:'プライバシーセンター', privacy_center_open:'プライバシーセンター',
    weekly_loading:'レポートを読み込み中…', weekly_login:'週間レポートを見るにはログインしてください。',
    weekly_practice:'練習問題', weekly_weak:'今週の練習ポイント',
    weekly_mastery:'今週の練習レベル',
    weekly_credits:'今週のクレジット使用：{{a}}・残り：{{b}}',
    weekly_empty:'今週はまだ学習記録がありません。最初の問題を撮影しましょう！',
    weekly_badges:'獲得バッジ', weekly_no_weak:'素晴らしい！今週、弱点は見つかりませんでした。',
    weekly_retry:'レポートを更新', weekly_close:'閉じる',
    today_solved:'今日解いた問題', today_accuracy:'今日の正答率', today_streak:'連続日数'
  },
  'ko': {
    weekly_report:'주간 보고서', weekly_new:'새로운!', weekly_view:'이번 주 학습 보고서 보기',
    weekly_settings:'주간 보고서 이메일', weekly_settings_desc:'자녀의 학습 진도 주간 요약 받기',
    confirm_password:'비밀번호 확인', password_mismatch:'비밀번호가 일치하지 않습니다',
    agree_privacy:'개인정보 처리방침을 읽고 동의합니다',
    agree_coppa:'부모입니다 / 부모 동의를 받았습니다 (COPPA)',
    agree_required:'계속하려면 두 확인란을 모두 체크하세요.',
    captcha_label:'🤖 로봇 확인: {{a}} + {{b}} = ?', captcha_required:'보안 질문에 답해주세요',
    captcha_wrong:'오답입니다. 다시 시도해주세요.', captcha_refresh:'다른 문제',
    captcha_loading:'보안 질문 불러오는 중…', guard_wait:'잠시 내용을 확인한 뒤 제출해 주세요.',
    feedback_title:'💌 피드백', feedback_desc:'채택된 제안에는 Credits 보상이 있습니다!',
    feedback_placeholder:'CalcElf를 더 좋게 만들 아이디어를 들려주세요... (5자 이상)',
    feedback_submit:'피드백 보내기', feedback_cancel:'취소', feedback_thanks:'감사합니다! 피드백이 접수되었습니다.',
    feedback_empty:'5자 이상 입력해 주세요.', feedback_fail:'전송에 실패했습니다. 나중에 다시 시도해 주세요.',
    credits_history:'이용 내역', credits_history_hint:'Credits 소모·획득 명세',
    ledger_loading:'내역 불러오는 중…', ledger_signin:'이용 내역을 보려면 로그인하세요.',
    ledger_empty:'아직 내역이 없어요. 첫 문제를 풀어보세요!',
    credits_solve:'문제 풀기', credits_chat:'채팅', credits_voice:'음성 입력', credits_practice:'연습',
    credits_subscription:'구독 지급', credits_recharge:'충전 / 패키지', credits_reward:'보상',
    credits_free:'오늘의 무료 풀이', credits_care:'케어 리셋',
    privacy_center:'개인정보 센터', privacy_center_open:'개인정보 센터',
    weekly_loading:'보고서 불러오는 중…', weekly_login:'주간 보고서를 보려면 로그인하세요.',
    weekly_practice:'연습 문제', weekly_weak:'이번 주 연습할 부분',
    weekly_mastery:'이번 주 연습 난이도',
    weekly_credits:'이번 주 사용 크레딧: {{a}} · 남은 크레딧: {{b}}',
    weekly_empty:'이번 주 학습 기록이 아직 없어요. 첫 문제를 찍어보세요!',
    weekly_badges:'획득 배지', weekly_no_weak:'잘했어요! 이번 주에 약점이 발견되지 않았어요.',
    weekly_retry:'보고서 새로고침', weekly_close:'닫기',
    today_solved:'오늘 푼 문제', today_accuracy:'오늘의 정답률', today_streak:'연속 일수'
  },
  'ar': {
    weekly_report:'التقرير الأسبوعي', weekly_new:'جديد!', weekly_view:'عرض تقرير التعلم الأسبوعي',
    weekly_settings:'البريد الأسبوعي', weekly_settings_desc:'استلام ملخص أسبوعي لتقدم طفلك التعليمي',
    confirm_password:'تأكيد كلمة المرور', password_mismatch:'كلمتا المرور غير متطابقتين',
    agree_privacy:'لقد قرأت ووافقت على سياسة الخصوصية',
    agree_coppa:'أنا والد / لدي موافقة الوالدين (COPPA)',
    agree_required:'يرجى تحديد كلا المربعين للمتابعة.',
    captcha_label:'🤖 اختبار الروبوت: {{a}} + {{b}} = ؟', captcha_required:'يرجى الإجابة على سؤال الأمان',
    captcha_wrong:'إجابة خاطئة. حاول مرة أخرى.', captcha_refresh:'سؤال آخر',
    captcha_loading:'جارٍ تحميل سؤال الأمان…', guard_wait:'يرجى مراجعة المحتوى قبل الإرسال.',
    feedback_title:'💌 إرسال ملاحظات', feedback_desc:'الاقتراحات المعتمدة تحصل على Credits كمكافأة!',
    feedback_placeholder:'أخبرنا بأفكارك لتحسين CalcElf... (5 أحرف على الأقل)',
    feedback_submit:'إرسال', feedback_cancel:'إلغاء', feedback_thanks:'شكراً لك! تم استلام ملاحظاتك.',
    feedback_empty:'يرجى إدخال 5 أحرف على الأقل.', feedback_fail:'فشل الإرسال. حاول مرة أخرى لاحقاً.',
    credits_history:'سجل المعاملات', credits_history_hint:'تفاصيل استهلاك واكتساب الأرصدة',
    ledger_loading:'جارٍ تحميل السجل…', ledger_signin:'سجّل الدخول لعرض سجل المعاملات.',
    ledger_empty:'لا توجد معاملات بعد. حل أول مسألة!',
    credits_solve:'حل مسألة', credits_chat:'محادثة', credits_voice:'إدخال صوتي', credits_practice:'تدريب',
    credits_subscription:'منح الاشتراك', credits_recharge:'شحن / باقة', credits_reward:'مكافأة',
    credits_free:'حل مجاني يومي', credits_care:'إعادة ضبط الرعاية',
    privacy_center:'مركز الخصوصية', privacy_center_open:'مركز الخصوصية',
    weekly_loading:'جارٍ تحميل تقريرك…', weekly_login:'يرجى تسجيل الدخول لعرض التقرير الأسبوعي.',
    weekly_practice:'تمارين', weekly_weak:'لنتمرن هذا الأسبوع',
    weekly_mastery:'مستويات التمرين هذا الأسبوع',
    weekly_credits:'الأرصدة المستخدمة هذا الأسبوع: {{a}} · المتبقي: {{b}}',
    weekly_empty:'لا يوجد نشاط تعليمي هذا الأسبوع بعد. التقط أول مسألة!',
    weekly_badges:'شارات مكتسبة', weekly_no_weak:'عمل رائع! لم يتم رصد نقاط ضعف هذا الأسبوع.',
    weekly_retry:'تحديث التقرير', weekly_close:'إغلاق',
    today_solved:'مسائل تم حلها اليوم', today_accuracy:'دقة اليوم', today_streak:'أيام متتالية'
  },
  'fr': {
    weekly_report:'Rapport hebdomadaire', weekly_new:'Nouveau !', weekly_view:'Voir le rapport hebdomadaire',
    weekly_settings:'Email de rapport hebdomadaire', weekly_settings_desc:'Recevoir un résumé hebdomadaire des progrès de votre enfant',
    confirm_password:'Confirmer le mot de passe', password_mismatch:'Les mots de passe ne correspondent pas',
    agree_privacy:"J'ai lu et j'accepte la politique de confidentialité",
    agree_coppa:"Je suis un parent / J'ai le consentement parental (COPPA)",
    agree_required:'Veuillez cocher les deux cases pour continuer.',
    captcha_label:'🤖 Test robot : {{a}} + {{b}} = ?', captcha_required:'Veuillez répondre à la question de sécurité',
    captcha_wrong:'Réponse incorrecte. Veuillez réessayer.', captcha_refresh:'Autre question',
    captcha_loading:'Chargement de la question…', guard_wait:'Veuillez vérifier vos informations avant d’envoyer.',
    feedback_title:'💌 Envoyer un commentaire', feedback_desc:'Les suggestions adoptées rapportent des Credits !',
    feedback_placeholder:'Dites-nous comment améliorer CalcElf... (5 caractères min.)',
    feedback_submit:'Envoyer', feedback_cancel:'Annuler', feedback_thanks:'Merci ! Votre commentaire a été reçu.',
    feedback_empty:'Veuillez saisir au moins 5 caractères.', feedback_fail:'Échec de l’envoi. Réessayez plus tard.',
    credits_history:'Historique', credits_history_hint:'Détail des crédits dépensés et gagnés',
    ledger_loading:'Chargement de l’historique…', ledger_signin:'Connectez-vous pour voir l’historique.',
    ledger_empty:'Aucune transaction pour le moment. Résolvez votre premier problème !',
    credits_solve:'Résoudre', credits_chat:'Chat', credits_voice:'Saisie vocale', credits_practice:'Pratique',
    credits_subscription:'Abonnement', credits_recharge:'Recharge / pack', credits_reward:'Récompense',
    credits_free:'Résolution gratuite du jour', credits_care:'Reset de fidélité',
    privacy_center:'Centre de confidentialité', privacy_center_open:'Centre de confidentialité',
    weekly_loading:'Chargement de votre rapport…', weekly_login:'Connectez-vous pour voir votre rapport hebdomadaire.',
    weekly_practice:'exercices', weekly_weak:'À pratiquer cette semaine',
    weekly_mastery:'Niveaux d’exercice cette semaine',
    weekly_credits:'Crédits utilisés : {{a}} · restants : {{b}}',
    weekly_empty:'Pas encore d’activité cette semaine. Photographiez votre premier problème !',
    weekly_badges:'Badges obtenus', weekly_no_weak:'Bravo ! Aucun point faible détecté cette semaine.',
    weekly_retry:'Actualiser le rapport', weekly_close:'Fermer',
    today_solved:"problèmes résolus aujourd'hui", today_accuracy:'précision du jour', today_streak:'jours de suite'
  },
  'de': {
    weekly_report:'Wochenbericht', weekly_new:'Neu!', weekly_view:'Wochenbericht ansehen',
    weekly_settings:'Wochenbericht per E-Mail', weekly_settings_desc:'Wöchentliche Zusammenfassung der Lernfortschritte Ihres Kindes erhalten',
    confirm_password:'Passwort bestätigen', password_mismatch:'Passwörter stimmen nicht überein',
    agree_privacy:'Ich habe die Datenschutzerklärung gelesen und stimme zu',
    agree_coppa:'Ich bin Elternteil / habe elterliche Zustimmung (COPPA)',
    agree_required:'Bitte beide Kästchen anhaken, um fortzufahren.',
    captcha_label:'🤖 Roboter-Check: {{a}} + {{b}} = ?', captcha_required:'Bitte die Sicherheitsfrage beantworten',
    captcha_wrong:'Falsche Antwort. Bitte erneut versuchen.', captcha_refresh:'Andere Frage',
    captcha_loading:'Sicherheitsfrage wird geladen…', guard_wait:'Bitte vor dem Absenden kurz prüfen.',
    feedback_title:'💌 Feedback senden', feedback_desc:'Übernommene Vorschläge erhalten Credits als Belohnung!',
    feedback_placeholder:'Sag uns, wie wir CalcElf verbessern können... (mind. 5 Zeichen)',
    feedback_submit:'Feedback senden', feedback_cancel:'Abbrechen', feedback_thanks:'Danke! Dein Feedback wurde empfangen.',
    feedback_empty:'Bitte mindestens 5 Zeichen eingeben.', feedback_fail:'Senden fehlgeschlagen. Bitte später erneut versuchen.',
    credits_history:'Transaktionsverlauf', credits_history_hint:'Ausgaben und Gutschriften',
    ledger_loading:'Verlauf wird geladen…', ledger_signin:'Zum Ansehen bitte anmelden.',
    ledger_empty:'Noch keine Transaktionen. Löse deine erste Aufgabe!',
    credits_solve:'Aufgabe lösen', credits_chat:'Chat', credits_voice:'Spracheingabe', credits_practice:'Übung',
    credits_subscription:'Abo-Gutschrift', credits_recharge:'Aufladen / Paket', credits_reward:'Belohnung',
    credits_free:'Tägliches Freikontingent', credits_care:'Kulanz-Reset',
    privacy_center:'Datenschutz-Zentrum', privacy_center_open:'Datenschutz-Zentrum',
    weekly_loading:'Bericht wird geladen…', weekly_login:'Bitte anmelden, um den Wochenbericht zu sehen.',
    weekly_practice:'Übungsfragen', weekly_weak:'Diese Woche üben',
    weekly_mastery:'Übungslevel diese Woche',
    weekly_credits:'Genutzte Credits: {{a}} · verbleibend: {{b}}',
    weekly_empty:'Diese Woche noch keine Lernaktivität. Mach ein Foto deiner ersten Aufgabe!',
    weekly_badges:'Erhaltene Abzeichen', weekly_no_weak:'Super! Diese Woche keine Schwächen erkannt.',
    weekly_retry:'Bericht aktualisieren', weekly_close:'Schließen',
    today_solved:'heute gelöste Aufgaben', today_accuracy:'heutige Genauigkeit', today_streak:'Tage in Folge'
  },
  'es': {
    weekly_report:'Informe semanal', weekly_new:'¡Nuevo!', weekly_view:'Ver tu informe semanal',
    weekly_settings:'Correo de informe semanal', weekly_settings_desc:'Recibe un resumen semanal del progreso de tu hijo',
    confirm_password:'Confirmar contraseña', password_mismatch:'Las contraseñas no coinciden',
    agree_privacy:'He leído y acepto la política de privacidad',
    agree_coppa:'Soy padre/madre / tengo consentimiento parental (COPPA)',
    agree_required:'Marca las dos casillas para continuar.',
    captcha_label:'🤖 Control robot: {{a}} + {{b}} = ?', captcha_required:'Responde a la pregunta de seguridad',
    captcha_wrong:'Respuesta incorrecta. Inténtalo de nuevo.', captcha_refresh:'Otra pregunta',
    captcha_loading:'Cargando pregunta de seguridad…', guard_wait:'Revisa la información antes de enviar.',
    feedback_title:'💌 Enviar comentarios', feedback_desc:'¡Las sugerencias adoptadas reciben Credits!',
    feedback_placeholder:'Cuéntanos cómo mejorar CalcElf... (mínimo 5 caracteres)',
    feedback_submit:'Enviar comentarios', feedback_cancel:'Cancelar', feedback_thanks:'¡Gracias! Hemos recibido tu comentario.',
    feedback_empty:'Introduce al menos 5 caracteres.', feedback_fail:'Error al enviar. Inténtalo más tarde.',
    credits_history:'Historial', credits_history_hint:'Detalle de créditos gastados y ganados',
    ledger_loading:'Cargando historial…', ledger_signin:'Inicia sesión para ver el historial.',
    ledger_empty:'Aún no hay transacciones. ¡Resuelve tu primer problema!',
    credits_solve:'Resolver problema', credits_chat:'Chat', credits_voice:'Entrada de voz', credits_practice:'Práctica',
    credits_subscription:'Suscripción', credits_recharge:'Recarga / pack', credits_reward:'Recompensa',
    credits_free:'Resolución gratuita diaria', credits_care:'Reinicio de cortesía',
    privacy_center:'Centro de privacidad', privacy_center_open:'Centro de privacidad',
    weekly_loading:'Cargando tu informe…', weekly_login:'Inicia sesión para ver tu informe semanal.',
    weekly_practice:'preguntas de práctica', weekly_weak:'A practicar esta semana',
    weekly_mastery:'Niveles de práctica esta semana',
    weekly_credits:'Créditos usados: {{a}} · restantes: {{b}}',
    weekly_empty:'Aún no hay actividad esta semana. ¡Haz una foto de tu primer problema!',
    weekly_badges:'Insignias obtenidas', weekly_no_weak:'¡Buen trabajo! Sin puntos débiles esta semana.',
    weekly_retry:'Actualizar informe', weekly_close:'Cerrar',
    today_solved:'problemas resueltos hoy', today_accuracy:'precisión de hoy', today_streak:'días seguidos'
  },
  'it': {
    weekly_report:'Rapporto settimanale', weekly_new:'Novità!', weekly_view:'Vedi il rapporto settimanale',
    weekly_settings:'Email del rapporto settimanale', weekly_settings_desc:'Ricevi un riepilogo settimanale dei progressi di tuo figlio',
    confirm_password:'Conferma password', password_mismatch:'Le password non corrispondono',
    agree_privacy:'Ho letto e accetto l’informativa sulla privacy',
    agree_coppa:'Sono un genitore / ho il consenso dei genitori (COPPA)',
    agree_required:'Seleziona entrambe le caselle per continuare.',
    captcha_label:'🤖 Test robot: {{a}} + {{b}} = ?', captcha_required:'Rispondi alla domanda di sicurezza',
    captcha_wrong:'Risposta errata. Riprova.', captcha_refresh:'Altra domanda',
    captcha_loading:'Caricamento domanda di sicurezza…', guard_wait:'Controlla i dati prima di inviare.',
    feedback_title:'💌 Invia un commento', feedback_desc:'I suggerimenti adottati ricevono Credits!',
    feedback_placeholder:'Dicci come migliorare CalcElf... (almeno 5 caratteri)',
    feedback_submit:'Invia', feedback_cancel:'Annulla', feedback_thanks:'Grazie! Il tuo commento è stato ricevuto.',
    feedback_empty:'Inserisci almeno 5 caratteri.', feedback_fail:'Invio non riuscito. Riprova più tardi.',
    credits_history:'Cronologia', credits_history_hint:'Dettaglio crediti usati e guadagnati',
    ledger_loading:'Caricamento cronologia…', ledger_signin:'Accedi per vedere la cronologia.',
    ledger_empty:'Nessuna transazione. Risolvi il tuo primo problema!',
    credits_solve:'Risolvi problema', credits_chat:'Chat', credits_voice:'Input vocale', credits_practice:'Esercizio',
    credits_subscription:'Abbonamento', credits_recharge:'Ricarica / pacchetto', credits_reward:'Ricompensa',
    credits_free:'Risoluzione gratuita giornaliera', credits_care:'Reset di cortesia',
    privacy_center:'Centro privacy', privacy_center_open:'Centro privacy',
    weekly_loading:'Caricamento del rapporto…', weekly_login:'Accedi per vedere il rapporto settimanale.',
    weekly_practice:'esercizi', weekly_weak:'Da esercitare questa settimana',
    weekly_mastery:'Livelli di esercizio questa settimana',
    weekly_credits:'Crediti usati: {{a}} · rimanenti: {{b}}',
    weekly_empty:'Nessuna attività questa settimana. Fotografa il tuo primo problema!',
    weekly_badges:'Badge ottenuti', weekly_no_weak:'Ottimo lavoro! Nessun punto debole questa settimana.',
    weekly_retry:'Aggiorna rapporto', weekly_close:'Chiudi',
    today_solved:'problemi risolti oggi', today_accuracy:'precisione di oggi', today_streak:'giorni di fila'
  },
  'fa': {
    weekly_report:'گزارش هفتگی', weekly_new:'جدید!', weekly_view:'مشاهده گزارش هفتگی یادگیری',
    weekly_settings:'ایمیل گزارش هفتگی', weekly_settings_desc:'خلاصه هفتگی پیشرفت فرزندتان را دریافت کنید',
    confirm_password:'تکرار رمز عبور', password_mismatch:'رمزهای عبور مطابقت ندارند',
    agree_privacy:'سیاست حریم خصوصی را خوانده‌ام و می‌پذیرم',
    agree_coppa:'والد هستم / رضایت والدین را دارم (COPPA)',
    agree_required:'برای ادامه هر دو کادر را علامت بزنید.',
    captcha_label:'🤖 بررسی ربات: {{a}} + {{b}} = ?', captcha_required:'به پرسش امنیتی پاسخ دهید',
    captcha_wrong:'پاسخ نادرست است. دوباره تلاش کنید.', captcha_refresh:'پرسش دیگر',
    captcha_loading:'در حال بارگذاری پرسش امنیتی…', guard_wait:'لطفاً پیش از ارسال، اطلاعات را مرور کنید.',
    feedback_title:'💌 ارسال بازخورد', feedback_desc:'پیشنهادهای پذیرفته‌شده Credits پاداش می‌گیرند!',
    feedback_placeholder:'ایده‌های خود را برای بهبود CalcElf بنویسید... (حداقل ۵ نویسه)',
    feedback_submit:'ارسال بازخورد', feedback_cancel:'انصراف', feedback_thanks:'سپاس! بازخورد شما دریافت شد.',
    feedback_empty:'لطفاً حداقل ۵ نویسه وارد کنید.', feedback_fail:'ارسال ناموفق بود. بعداً تلاش کنید.',
    credits_history:'سابقه تراکنش', credits_history_hint:'جزئیات مصرف و کسب اعتبار',
    ledger_loading:'در حال بارگذاری سابقه…', ledger_signin:'برای مشاهده سابقه وارد شوید.',
    ledger_empty:'هنوز تراکنشی نیست. اولین مسئله را حل کنید!',
    credits_solve:'حل مسئله', credits_chat:'گفتگو', credits_voice:'ورودی صوتی', credits_practice:'تمرین',
    credits_subscription:'اعتبار اشتراک', credits_recharge:'شارژ / بسته', credits_reward:'پاداش',
    credits_free:'حل رایگان روزانه', credits_care:'بازنشانی وفاداری',
    privacy_center:'مرکز حریم خصوصی', privacy_center_open:'مرکز حریم خصوصی',
    weekly_loading:'در حال بارگذاری گزارش…', weekly_login:'برای مشاهده گزارش هفتگی وارد شوید.',
    weekly_practice:'تمرین', weekly_weak:'تمرین این هفته',
    weekly_mastery:'سطوح تمرین این هفته',
    weekly_credits:'اعتبار مصرف‌شده این هفته: {{a}} · باقی‌مانده: {{b}}',
    weekly_empty:'این هفته هنوز فعالیتی نیست. از اولین مسئله عکس بگیرید!',
    weekly_badges:'نشان‌های کسب‌شده', weekly_no_weak:'عالی! این هفته نقطه ضعفی دیده نشد.',
    weekly_retry:'تازه‌سازی گزارش', weekly_close:'بستن',
    today_solved:'مسائل حل‌شده امروز', today_accuracy:'دقت امروز', today_streak:'روزهای متوالی'
  }
};

function t(key, vars = {}) {
  let lang = (window.CALF_LANG || 'en').replace('_', '-');
  if (lang === 'zh') lang = 'zh-CN';
  if (lang === 'zh-HK') lang = 'zh-TW';
  if (lang === 'pt') lang = 'pt-BR';
  const dict = I18N[lang] || I18N['en'];
  let s = dict[key] || I18N['en'][key] || key;
  for (const [k, v] of Object.entries(vars)) s = s.replace('{{' + k + '}}', v);
  return s;
}
function curLang() {
  const lang = (window.CALF_LANG || 'en').replace('_', '-');
  if (lang === 'zh') return 'zh-CN';
  if (lang === 'zh-HK') return 'zh-TW';
  return lang;
}

// Auth modal static strings (the original markup shipped English-only)
const AUTH = {
  en:      { tabLogin:'Log In', tabSignup:'Start Adventure', loginBtn:'Log In', signupBtn:'Create', emailPh:'Email address', loginPwPh:'🔑 Secret Code', signupPwPh:'🔑 Secret Code (min 8)', namePh:'Your Explorer Name (optional)', or:'or', roleParent:'🧑‍🦱 Grown-up Helper / Parent', roleAdult:'Adult / learner' },
  'zh-CN': { tabLogin:'登录', tabSignup:'开始冒险', loginBtn:'登录', signupBtn:'Create', emailPh:'邮箱地址', loginPwPh:'🔑 秘密代码', signupPwPh:'🔑 秘密代码（至少 8 位）', namePh:'你的探险家昵称（可选）', or:'或', roleParent:'🧑‍🦱 家长 / 监护人', roleAdult:'成人 / 学习者' },
  'zh-TW': { tabLogin:'登入', tabSignup:'開始冒險', loginBtn:'登入', signupBtn:'Create', emailPh:'郵箱地址', loginPwPh:'🔑 秘密代碼', signupPwPh:'🔑 秘密代碼（至少 8 位）', namePh:'你的探險家暱稱（可選）', or:'或', roleParent:'🧑‍🦱 家長 / 監護人', roleAdult:'成人 / 學習者' },
  ja:      { tabLogin:'ログイン', tabSignup:'冒険を始めよう', loginBtn:'ログイン', signupBtn:'Create', emailPh:'メールアドレス', loginPwPh:'🔑 ひみつのコード', signupPwPh:'🔑 ひみつのコード（8文字以上）', namePh:'探検家のなまえ（任意）', or:'または', roleParent:'🧑‍🦱 保護者（おとな）', roleAdult:'成人 / 学習者' },
  ko:      { tabLogin:'로그인', tabSignup:'모험 시작', loginBtn:'로그인', signupBtn:'Create', emailPh:'이메일 주소', loginPwPh:'🔑 비밀 코드', signupPwPh:'🔑 비밀 코드(최소 8자)', namePh:'탐험가 이름(선택)', or:'또는', roleParent:'🧑‍🦱 보호자/학부모', roleAdult:'성인/학습자' },
  ar:      { tabLogin:'تسجيل الدخول', tabSignup:'ابدأ المغامرة', loginBtn:'دخول', signupBtn:'Create', emailPh:'البريد الإلكتروني', loginPwPh:'🔑 الرمز السري', signupPwPh:'🔑 الرمز السري (8 أحرف على الأقل)', namePh:'اسم المستكشف (اختياري)', or:'أو', roleParent:'🧑‍🦱 ولي الأمر', roleAdult:'بالغ / متعلم' },
  fr:      { tabLogin:'Connexion', tabSignup:"Commencer l’aventure", loginBtn:'Connexion', signupBtn:'Create', emailPh:'Adresse e-mail', loginPwPh:'🔑 Code secret', signupPwPh:'🔑 Code secret (8 caractères min.)', namePh:"Ton nom d’explorateur (facultatif)", or:'ou', roleParent:'🧑‍🦱 Parent / tuteur', roleAdult:'Adulte / apprenant' },
  de:      { tabLogin:'Anmelden', tabSignup:'Abenteuer starten', loginBtn:'Anmelden', signupBtn:'Create', emailPh:'E-Mail-Adresse', loginPwPh:'🔑 Geheimcode', signupPwPh:'🔑 Geheimcode (mind. 8 Zeichen)', namePh:'Dein Entdeckername (optional)', or:'oder', roleParent:'🧑‍🦱 Erziehungsberechtigte/r', roleAdult:'Erwachsene/r Lernende/r' },
  es:      { tabLogin:'Entrar', tabSignup:'Iniciar aventura', loginBtn:'Entrar', signupBtn:'Create', emailPh:'Correo electrónico', loginPwPh:'🔑 Código secreto', signupPwPh:'🔑 Código secreto (mín. 8)', namePh:'Tu nombre de explorador (opcional)', or:'o', roleParent:'🧑‍🦱 Padre / tutor', roleAdult:'Adulto / estudiante' },
  it:      { tabLogin:'Accedi', tabSignup:'Inizia l’avventura', loginBtn:'Accedi', signupBtn:'Create', emailPh:'Indirizzo email', loginPwPh:'🔑 Codice segreto', signupPwPh:'🔑 Codice segreto (almeno 8 caratteri)', namePh:'Il tuo nome da esploratore (facoltativo)', or:'oppure', roleParent:'🧑‍🦱 Genitore / tutore', roleAdult:'Adulto / studente' },
  fa:      { tabLogin:'ورود', tabSignup:'ماجراجویی را شروع کن', loginBtn:'ورود', signupBtn:'Create', emailPh:'آدرس ایمیل', loginPwPh:'🔑 رمز مخفی', signupPwPh:'🔑 رمز مخفی (حداقل ۸ نویسه)', namePh:'نام کاوشگر (اختیاری)', or:'یا', roleParent:'🧑‍🦱 والد/سرپرست', roleAdult:'بزرگسال/یادگیرنده' }
};
function localizeAuth() {
  const a = AUTH[curLang()] || AUTH.en;
  const set = (id, txt, attr) => { const el = $(id); if (el) { if (attr === 'ph') el.placeholder = txt; else el.textContent = txt; } };
  set('#tabLogin', a.tabLogin); set('#tabSignup', a.tabSignup);
  set('#loginWithPasswordBtn', a.loginBtn);
  const _at=$('#accountModalTitle'); if(_at) _at.innerHTML='<span class="explorer-word" style="color:#FF9F1C;font-weight:800;letter-spacing:.3px;font-size:26px;">Explorer Profile</span>';
  const sb=$('#signupBtn'); if(sb) sb.innerHTML=a.signupBtn;
  set('#loginEmail', a.emailPh, 'ph'); set('#loginPassword', a.loginPwPh, 'ph');
  set('#signupEmail', a.emailPh, 'ph'); set('#signupPassword', a.signupPwPh, 'ph'); set('#signupName', a.namePh, 'ph');
  set('#authOr', a.or);
  const rp=document.querySelector('#signupRole option[value="parent"]'); if(rp&&a.roleParent)rp.textContent=a.roleParent;
  const ra=document.querySelector('#signupRole option[value="adult"]'); if(ra&&a.roleAdult)ra.textContent=a.roleAdult;
}

// ========== 1. Weekly Report Floating Button ==========
function buildWeeklyReportButton() {
  if ($('#weeklyReportBtn')) return;
  const btn = document.createElement('button');
  btn.id = 'weeklyReportBtn';
  btn.type = 'button';
  btn.title = t('weekly_view');
  btn.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#14B8A6,#0F766E);border:3px solid #fff;cursor:pointer;box-shadow:0 6px 20px rgba(20,184,166,.4);font-size:24px;display:flex;align-items:center;justify-content:center;transition:transform .2s;';
  btn.innerHTML = '📬';
  btn.onmouseenter = () => btn.style.transform = 'scale(1.1)';
  btn.onmouseleave = () => btn.style.transform = 'scale(1)';
  btn.onclick = openWeeklyReportModal;
  document.body.appendChild(btn);
}

function weeklyStat(num, label) {
  return `<div style="flex:1;text-align:center;padding:16px 8px;background:#f0fdfa;border-radius:12px;"><div style="font-size:28px;font-weight:800;color:#0F766E;">${num}</div><div style="font-size:12px;color:#64748b;margin-top:4px;">${label}</div></div>`;
}
function weeklyBars(report) {
  const lvls = report.by_level || [];
  if (!lvls.length) return '';
  return `<div style="margin:18px 0;"><h3 style="margin:0 0 8px;font-size:14px;color:#334155;">${t('weekly_mastery')}</h3>` +
    lvls.map(x => {
      const p = Math.round((x.accuracy || 0) * 100);
      const color = p >= 80 ? '#10b981' : p >= 60 ? '#f59e0b' : '#ef4444';
      return `<div style="margin:8px 0;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#475569;margin-bottom:4px;"><span>L${x.level}</span><span>${p}%</span></div><div style="height:10px;background:#e2e8f0;border-radius:6px;overflow:hidden;"><div style="height:10px;width:${p}%;background:${color};border-radius:6px;"></div></div></div>`;
    }).join('') + `</div>`;
}
function weeklyBodyHTML(report, enabled) {
  if (!report || !report.active) {
    return `<div style="text-align:center;padding:30px 10px;color:#64748b;font-size:14px;line-height:1.7;">🌱<br>${t('weekly_empty')}</div>
      <label style="display:flex;align-items:center;gap:8px;margin:8px 0 16px;font-size:13px;color:#475569;">
        <input type="checkbox" id="weeklyEmailToggle" ${enabled !== false ? 'checked' : ''} style="width:18px;height:18px;">${t('weekly_settings')}</label>`;
  }
  const acc = report.accuracy == null ? '—' : Math.round(report.accuracy * 100) + '%';
  const weak = (report.weak_topics && report.weak_topics.length)
    ? report.weak_topics.map(w => `<li style="margin:6px 0;padding:10px 14px;background:#fff7ed;border-radius:8px;color:#9a3412;font-size:14px;">${w}</li>`).join('')
    : `<li style="margin:6px 0;padding:10px 14px;background:#f0fdf4;border-radius:8px;color:#166534;font-size:14px;">${t('weekly_no_weak')}</li>`;
  const badges = (report.badges && report.badges.length)
    ? `<div style="margin:16px 0;"><h3 style="margin:0 0 8px;font-size:14px;color:#334155;">${t('weekly_badges')}</h3><div>${report.badges.map(b => `<span style="display:inline-block;margin:3px;padding:5px 11px;background:#fefce8;border-radius:999px;font-size:13px;">${b.icon || '🏅'} ${b.name || ''}</span>`).join('')}</div></div>` : '';
  return `<div style="display:flex;gap:12px;margin:16px 0;">
      ${weeklyStat(report.solve_count || 0, t('today_solved'))}
      ${weeklyStat(acc, t('today_accuracy'))}
      ${weeklyStat(report.streak || 0, t('today_streak'))}
    </div>
    ${weeklyBars(report)}
    <div style="margin:16px 0;"><h3 style="margin:0 0 8px;font-size:14px;color:#334155;">💡 ${t('weekly_weak')}</h3><ul style="list-style:none;padding:0;margin:0;">${weak}</ul></div>
    ${badges}
    <div style="margin:16px 0;text-align:center;font-size:13px;color:#64748b;background:#f8fafc;border-radius:12px;padding:11px;">${t('weekly_credits', { a: report.credits_spent || 0, b: report.credits_left || 0 })}</div>
    <label style="display:flex;align-items:center;gap:8px;margin:8px 0 16px;font-size:13px;color:#475569;">
      <input type="checkbox" id="weeklyEmailToggle" ${enabled !== false ? 'checked' : ''} style="width:18px;height:18px;">${t('weekly_settings')}</label>
    <p style="font-size:12px;color:#94a3b8;margin:0 0 14px;">${t('weekly_settings_desc')}</p>`;
}
async function openWeeklyReportModal() {
  if ($('#weeklyReportModal')) { $('#weeklyReportModal').style.display = 'flex'; return; }
  const modal = document.createElement('div');
  modal.id = 'weeklyReportModal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:20px;';
  modal.innerHTML = `<div style="background:#fff;border-radius:24px;max-width:520px;width:100%;max-height:90vh;overflow-y:auto;padding:0;">
      <div style="background:linear-gradient(135deg,#14B8A6,#0F766E);padding:28px;border-radius:24px 24px 0 0;text-align:center;color:#fff;">
        <h2 style="margin:0;font-size:22px;">📬 ${t('weekly_report')}</h2></div>
      <div id="weeklyModalBody" style="padding:24px;"><div style="text-align:center;color:#94a3b8;padding:30px 0;">${t('weekly_loading')}</div></div>
    </div>`;
  document.body.appendChild(modal);
  modal.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

  const body = $('#weeklyModalBody', modal);
  let session = null;
  try { session = (typeof window.session === 'function') ? await window.session() : null; } catch (e) { session = null; }
  if (!session || !session.access_token) {
    body.innerHTML = `<div style="text-align:center;color:#b91c1c;font-size:14px;padding:24px 0;">${t('weekly_login')}</div>
      <button id="weeklyCloseBtn0" style="width:100%;padding:14px;border-radius:12px;background:#14B8A6;color:#fff;border:0;font-weight:700;cursor:pointer;">${t('weekly_close')}</button>`;
    $('#weeklyCloseBtn0', body).onclick = () => modal.remove();
    return;
  }
  const H = { Authorization: 'Bearer ' + session.access_token, 'Content-Type': 'application/json' };
  let j = {};
  try {
    const r = await fetch('/api/weekly-report', { headers: H });
    j = await r.json();
    if (!j.report) {
      const g = await fetch('/api/weekly-report', { method: 'POST', headers: H, body: JSON.stringify({ action: 'generate' }) });
      j = await g.json();
    }
  } catch (e) { /* fall through to empty state */ }

  const render = (report, enabled) => {
    body.innerHTML = weeklyBodyHTML(report, enabled) +
      `<button id="weeklyCloseBtn" style="width:100%;padding:14px;border-radius:12px;background:#14B8A6;color:#fff;border:0;font-weight:700;cursor:pointer;">${t('weekly_close')}</button>`;
    $('#weeklyCloseBtn', body).onclick = () => modal.remove();
    const cbox = $('#weeklyEmailToggle', body);
    if (cbox) cbox.onchange = async () => {
      await fetch('/api/weekly-report', { method: 'POST', headers: H, body: JSON.stringify({ action: 'toggle', enabled: cbox.checked }) });
    };
  };
  render(j.report, j.enabled);
}

// ========== 2. Registration Hardening ==========
let captchaState = { token: null, a: 0, b: 0 };
async function loadCaptcha() {
  const q = $('#captchaQuestion');
  try {
    if (q) q.textContent = t('captcha_loading');
    const r = await fetch('/api/captcha');
    const j = await r.json();
    captchaState = { token: j.token, a: j.q.a, b: j.q.b };
    if (q) q.textContent = t('captcha_label', { a: j.q.a, b: j.q.b });
    const ans = $('#captchaAnswer'); if (ans) ans.value = '';
  } catch (e) {
    if (q) q.textContent = t('captcha_loading');
  }
}
function guardMsg(msg) {
  const el = $('#signupGuardMsg');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}
function enhanceRegistration() {
  const pw = $('#signupPassword');
  const form = $('#signupForm');
  if (!pw || !form || pw.dataset.v552) return;
  pw.dataset.v552 = '1';

  // Confirm password
  const confirmPw = document.createElement('input');
  confirmPw.type = 'password';
  confirmPw.id = 'signupPasswordConfirm';
  confirmPw.placeholder = t('confirm_password');
  confirmPw.autocomplete = 'new-password';
  confirmPw.style.cssText = 'margin-top:8px;';
  pw.insertAdjacentElement('afterend', confirmPw);

  // Two mandatory consents (with links)
  const privacyText = t('agree_privacy');
  const privacyLinked = privacyText.replace(/(Privacy Policy|《隐私政策》|プライバシーポリシー|개인정보 처리방침|سياسة الخصوصية|politique de confidentialité|Datenschutzerklärung|política de privacidad|informativa sulla privacy|سیاست حریم خصوصی)/,
    m => `<a href="/privacy-center.html" target="_blank" style="color:#0F766E;font-weight:700;">${m}</a>`);
  const checkBox = document.createElement('div');
  checkBox.style.cssText = 'margin:12px 0 6px;font-size:13px;text-align:left;';
  checkBox.innerHTML = `
    <label style="display:flex;align-items:flex-start;gap:8px;margin:8px 0;cursor:pointer;line-height:1.5;">
      <input type="checkbox" id="agreePrivacy" class="kcbx">
      <span id="agreePrivacyText">${privacyLinked}</span>
    </label>
    <label class="coppa-row" style="display:flex;align-items:flex-start;gap:8px;margin:8px 0;padding:9px 11px;border-radius:12px;background:#fff8ec;border:1.5px solid #ffe3b3;cursor:pointer;line-height:1.5;">
      <input type="checkbox" id="agreeCoppa" class="kcbx">
      <span id="agreeCoppaText" style="color:#9a6a1f;font-weight:700">🧑‍🦱 ${t('agree_coppa')}</span>
    </label>`;

  // Honeypot (hidden from humans)
  const honeypot = document.createElement('input');
  honeypot.type = 'text';
  honeypot.name = 'website_hp';
  honeypot.tabIndex = -1;
  honeypot.autocomplete = 'off';
  honeypot.setAttribute('aria-hidden', 'true');
  honeypot.style.cssText = 'position:absolute;left:-9999px;opacity:0;height:0;width:0;';

  // Server-signed arithmetic CAPTCHA
  const captchaBox = document.createElement('div');
  captchaBox.style.cssText = 'margin:10px 0;';
  captchaBox.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
      <label id="captchaQuestion" for="captchaAnswer" style="font-size:13px;color:#475569;">${t('captcha_loading')}</label>
      <button type="button" id="captchaRefresh" style="border:0;background:none;color:#0F766E;font-size:12px;cursor:pointer;text-decoration:underline;">${t('captcha_refresh')}</button>
    </div>
    <input type="number" id="captchaAnswer" inputmode="numeric" placeholder="?" style="width:100%;margin-top:6px;padding:10px;border-radius:10px;border:2px solid #e2e8f0;font-size:15px;box-sizing:border-box;">`;

  // Inline guard message
  const msg = document.createElement('div');
  msg.id = 'signupGuardMsg';
  msg.style.cssText = 'display:none;color:#dc2626;font-size:13px;margin:6px 0;text-align:left;line-height:1.5;';

  const btn = $('#signupBtn');
  form.insertBefore(checkBox, btn);
  form.insertBefore(honeypot, btn);
  form.insertBefore(captchaBox, btn);
  form.insertBefore(msg, btn);

  $('#captchaRefresh').onclick = (e) => { e.preventDefault(); loadCaptcha(); };
  loadCaptcha();

  // Live mismatch hint
  confirmPw.addEventListener('input', () => {
    if (confirmPw.value && pw.value !== confirmPw.value) { confirmPw.style.borderColor = '#fca5a5'; }
    else { confirmPw.style.borderColor = '#e2e8f0'; msg.style.display = 'none'; }
  });

  // ===== 合规门控：两个同意框禁止手动勾选 =====
  // 只有在隐私弹窗里读完（滚到底+计时）并点确认，两个勾才会自动打上；
  // 已勾选可手动取消；取消后不能手动重新勾选，必须再次走弹窗；任一未勾选时 Create 被拦截。
  const _privBox = $('#agreePrivacy'), _coppaBox = $('#agreeCoppa');
  let _consentGranted = false;
  function _setConsent(v){
    _consentGranted = !!v;
    if(_privBox) _privBox.checked = !!v;
    if(_coppaBox) _coppaBox.checked = !!v;
  }
  function _openConsentModal(){
    if(window.CalcElfPrivacy && typeof window.CalcElfPrivacy.forceOpen === 'function'){
      window.CalcElfPrivacy.forceOpen().then(function(ok){
        _setConsent(ok);
        // 点击事件与原生勾选状态提交存在时序，下一帧/稍后再断言一次，防止被浏览器回写
        setTimeout(function(){ _setConsent(ok); }, 0);
        setTimeout(function(){ _setConsent(ok); }, 60);
      });
    }
  }
  // 容器层（捕获）：处理点在文字/标签上的情况 + 政策链接新标签打开
  checkBox.addEventListener('click', function(e){
    const link = e.target && e.target.closest ? e.target.closest('a') : null;
    if(link){ e.preventDefault(); e.stopPropagation(); if(link.href) window.open(link.href, '_blank', 'noopener'); return; }
    const lab = e.target && e.target.closest ? e.target.closest('label') : null;
    if(!lab) return;
    if(!_consentGranted){ e.preventDefault(); e.stopPropagation(); _openConsentModal(); }
  }, true);
  // 每个勾选框：捕获阶段直接拦截手动勾选，change 兜底（防 label 合成激活漏网）
  [_privBox, _coppaBox].forEach(function(inp){
    if(!inp) return;
    inp.addEventListener('click', function(e){
      if(!_consentGranted){ e.preventDefault(); e.stopPropagation(); _openConsentModal(); }
    }, true);
    inp.addEventListener('change', function(){
      if(!_consentGranted && inp.checked){ inp.checked = false; }
      if(_consentGranted){ _consentGranted = !!( (_privBox&&_privBox.checked) && (_coppaBox&&_coppaBox.checked) ); }
    });
    inp.addEventListener('keydown', function(e){
      if((e.key === ' ' || e.code === 'Space' || e.key === 'Enter') && !_consentGranted){
        e.preventDefault(); _openConsentModal();
      }
    });
  });

  // Reload captcha whenever the Sign Up tab is opened
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'tabSignup') loadCaptcha();
  });

  const installedAt = Date.now();

  // Wrap the real signup handler so guards cannot be bypassed
  if (btn && typeof btn.onclick === 'function') {
    const orig = btn.onclick;
    btn.onclick = async function(ev) {
      msg.style.display = 'none';
      if (pw.value !== confirmPw.value) { guardMsg(t('password_mismatch')); confirmPw.focus(); return false; }
      if (!$('#agreePrivacy').checked || !$('#agreeCoppa').checked) { guardMsg(t('agree_required')); return false; }
      if (honeypot.value) return false;
      if (Date.now() - installedAt < 2500) { guardMsg(t('guard_wait')); return false; }
      const ans = parseInt($('#captchaAnswer').value, 10);
      if (!captchaState.token || !Number.isFinite(ans)) { guardMsg(t('captcha_required')); return false; }
      btn.disabled = true;
      let ok = false;
      try {
        const r = await fetch('/api/captcha', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: captchaState.token, answer: ans })
        });
        const j = await r.json().catch(() => ({}));
        ok = r.ok && j.ok === true;
      } catch (e) { ok = false; }
      btn.disabled = false;
      if (!ok) { guardMsg(t('captcha_wrong')); loadCaptcha(); return false; }
      window.__calfSignupConsent = { privacy: true, coppa: true, at: new Date().toISOString() };
      try { return await orig.call(this, ev); }
      finally { setTimeout(() => { window.__calfSignupConsent = null; }, 5000); }
    };
  }
}

// Re-localize injected registration UI after a language switch
function localizeRegistration() {
  const cp = $('#signupPasswordConfirm'); if (cp) cp.placeholder = t('confirm_password');
  const p = $('#agreePrivacyText');
  if (p) p.innerHTML = t('agree_privacy').replace(/(Privacy Policy|《隐私政策》|プライバシーポリシー|개인정보 처리방침|سياسة الخصوصية|politique de confidentialité|Datenschutzerklärung|política de privacidad|informativa sulla privacy|سیاست حریم خصوصی)/,
    m => `<a href="/privacy-center.html" target="_blank" style="color:#0F766E;font-weight:700;">${m}</a>`);
  const c = $('#agreeCoppaText'); if (c) c.textContent = t('agree_coppa');
  const rf = $('#captchaRefresh'); if (rf) rf.textContent = t('captcha_refresh');
  const q = $('#captchaQuestion');
  if (q && captchaState.token) q.textContent = t('captcha_label', { a: captchaState.a, b: captchaState.b });
}

// ========== 3. Text-only Feedback (wires the existing modal) ==========
function enhanceFeedback() {
  // Remove the voice button entirely — text-only by product decision
  const voice = $('#feedbackVoiceBtn');
  if (voice && voice.parentNode) voice.parentNode.removeChild(voice);

  const entry = $('#feedbackEntry');
  if (entry && !entry.dataset.v552) {
    entry.dataset.v552 = '1';
    entry.style.cursor = 'pointer';
    entry.setAttribute('role', 'button');
    entry.onclick = () => { if (typeof openModal === 'function') openModal('feedbackModal'); else $('#feedbackModal')?.classList.add('open'); };
  }

  const submit = $('#submitFeedbackBtn');
  if (!submit || submit.dataset.v552) return;
  submit.dataset.v552 = '1';
  submit.onclick = async () => {
    const ta = $('#feedbackText'), status = $('#feedbackMsg');
    const content = (ta?.value || '').trim();
    if (content.length < 5) { if (status) status.textContent = t('feedback_empty'); return; }
    const lang = curLang();
    submit.disabled = true; const old = submit.textContent; submit.textContent = '...';
    try {
      const r = await fetch('/api/feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, lang, email: ($('#feedbackEmail')?.value || '').trim() })
      });
      if (!r.ok) throw new Error('feedback failed');
      if (status) status.textContent = '✅ ' + t('feedback_thanks');
      ta.value = '';
      setTimeout(() => { const m = $('#feedbackModal'); if (m) m.classList.remove('open'); }, 1600);
    } catch (e) {
      if (status) status.textContent = '⚠️ ' + t('feedback_fail');
    } finally {
      submit.disabled = false; submit.textContent = old;
    }
  };
}
function localizeFeedback() {
  const title = $('#feedbackTitle'); if (title) title.textContent = t('feedback_title');
  const desc = $('#feedbackDesc'); if (desc) desc.textContent = t('feedback_desc');
  const ta = $('#feedbackText'); if (ta) ta.placeholder = t('feedback_placeholder');
  const btn = $('#submitFeedbackBtn'); if (btn && btn.dataset.v552) btn.textContent = t('feedback_submit');
}

// ========== 4. Credits transaction history (real ledger data) ==========
const REASON_META = {
  solve: { icon: '✏️', key: 'credits_solve' },
  chat: { icon: '💬', key: 'credits_chat' },
  voice: { icon: '🎤', key: 'credits_voice' },
  practice: { icon: '🎯', key: 'credits_practice' },
  free_daily_solve: { icon: '🎁', key: 'credits_free' },
  grant_credits: { icon: '💳', key: 'credits_recharge' },
  star_to_credit: { icon: '⭐', key: 'credits_reward' },
  loyalty_care_reset: { icon: '💧', key: 'credits_care' },
  bonus: { icon: '🎁', key: 'credits_reward' }
};
function buildLedgerUI() {
  const card = $('#creditCard');
  if (!card || $('#ceLedgerWrap')) return;
  const wrap = document.createElement('div');
  wrap.id = 'ceLedgerWrap';
  wrap.style.cssText = 'margin-top:14px;padding-top:12px;border-top:1px solid var(--line,#e2e8f0);';
  wrap.innerHTML = `
    <button id="ceLedgerToggle" type="button" style="width:100%;display:flex;align-items:center;justify-content:space-between;gap:8px;border:0;background:transparent;cursor:pointer;padding:6px 2px;">
      <span style="font-size:13px;font-weight:700;color:var(--ink,#334155);">📋 ${t('credits_history')}</span>
      <span id="ceLedgerArrow" style="font-size:12px;color:var(--muted,#94a3b8);transition:transform .2s;">▾</span>
    </button>
    <div id="ceLedgerList" style="display:none;max-height:260px;overflow-y:auto;margin-top:6px;"></div>`;
  card.appendChild(wrap);
  let loaded = false;
  $('#ceLedgerToggle').onclick = async () => {
    const list = $('#ceLedgerList'), arrow = $('#ceLedgerArrow');
    const openNow = list.style.display === 'none';
    list.style.display = openNow ? 'block' : 'none';
    arrow.style.transform = openNow ? 'rotate(180deg)' : 'rotate(0)';
    if (!openNow || loaded) return;
    loaded = true;
    list.innerHTML = `<div style="text-align:center;color:#94a3b8;font-size:13px;padding:16px;">${t('ledger_loading')}</div>`;
    let session = null;
    try { session = (typeof window.session === 'function') ? await window.session() : null; } catch (e) {}
    if (!session || !session.access_token) { list.innerHTML = `<div style="color:#94a3b8;font-size:13px;padding:14px;text-align:center;">${t('ledger_signin')}</div>`; return; }
    try {
      const r = await fetch('/api/credits?history=1', { headers: { Authorization: 'Bearer ' + session.access_token } });
      const j = await r.json();
      const rows = j.ledger || [];
      if (!rows.length) { list.innerHTML = `<div style="color:#94a3b8;font-size:13px;padding:14px;text-align:center;">${t('ledger_empty')}</div>`; return; }
      const lang = curLang();
      list.innerHTML = rows.map(row => {
        const meta = REASON_META[row.reason] || { icon: '🪙', key: null };
        const label = meta.key ? t(meta.key) : String(row.reason).replace(/_/g, ' ');
        const d = Number(row.delta) || 0;
        const col = d > 0 ? '#059669' : d < 0 ? '#dc2626' : '#64748b';
        const sign = d > 0 ? '+' : '';
        let when = '';
        try { when = new Date(row.created_at).toLocaleString(lang, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) {}
        return `<div style="display:flex;align-items:center;gap:10px;padding:9px 4px;border-bottom:1px solid #f1f5f9;">
          <span style="font-size:18px;">${meta.icon}</span>
          <span style="flex:1;min-width:0;">
            <span style="display:block;font-size:13px;font-weight:600;color:#334155;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${label}</span>
            <span style="display:block;font-size:11px;color:#94a3b8;">${when}</span>
          </span>
          <span style="font-size:14px;font-weight:800;color:${col};">${sign}${d}</span>
        </div>`;
      }).join('');
    } catch (e) {
      loaded = false;
      list.innerHTML = `<div style="color:#dc2626;font-size:13px;padding:14px;text-align:center;">${t('feedback_fail')}</div>`;
    }
  };
}

// ========== 5. Privacy Center entry points ==========
function enhancePrivacyEntry() {
  // Footer link
  const footer = $('footer');
  if (footer && !footer.querySelector('[data-privacy-center]')) {
    const link = document.createElement('a');
    link.href = '/privacy-center.html';
    link.setAttribute('data-privacy-center', '1');
    link.style.cssText = 'color:inherit;';
    link.textContent = ' · ' + t('privacy_center');
    footer.appendChild(link);
  }
  // Aside "Privacy-first" card becomes a clickable entry to the Privacy Center
  const title = $('#privacyTitle');
  const card = title ? title.closest('.card') : null;
  if (card && !card.dataset.v552) {
    card.dataset.v552 = '1';
    card.style.cursor = 'pointer';
    card.setAttribute('role', 'button');
    card.title = t('privacy_center_open');
    card.onclick = () => { location.href = '/privacy-center.html'; };
    const hint = document.createElement('div');
    hint.style.cssText = 'margin-top:8px;font-size:12px;font-weight:700;color:#0F766E;';
    hint.textContent = '🔒 ' + t('privacy_center_open') + ' →';
    card.appendChild(hint);
  }
}

// ========== Init ==========
function init() {
  buildWeeklyReportButton();
  enhanceRegistration();
  localizeAuth();
  enhanceFeedback();
  localizeFeedback();
  buildLedgerUI();
  enhancePrivacyEntry();

  try { if (location.search.includes('weekly=1')) setTimeout(openWeeklyReportModal, 800); } catch (e) {}

  const prevHook = window.calfRefreshI18n || function() {};
  window.calfRefreshI18n = function(lang) {
    try { prevHook(lang); } catch (e) {}
    const btn = $('#weeklyReportBtn'); if (btn) btn.title = t('weekly_view');
    localizeAuth();
    localizeFeedback();
    localizeRegistration();
    const lt = $('#ceLedgerToggle span:first-child');
    if (lt) lt.textContent = '📋 ' + t('credits_history');
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else { init(); }

})();
