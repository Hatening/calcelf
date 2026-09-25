// tests/_build-problems.js — 生成 multilang-problems.json（手写 11 语种题干模板）
// 运行：node tests/_build-problems.js
'use strict';
const fs = require('fs');
const path = require('path');

const LANGS = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'fr', 'de', 'es', 'it', 'ar', 'fa'];

// 每道题：{ card, lang, text, expect:{answer}, params, tag? }
const P = [];
function add(card, tag, params, expect, textByLang) {
  for (const lang of LANGS) {
    if (!textByLang[lang]) continue;
    P.push({
      card,
      lang,
      text: textByLang[lang],
      expect: { answer: expect },
      params,
      tag: tag || '',
    });
  }
}

/* ============================ axis_motion 爬井 ============================ */
// A1: 10米/3上/2滑 = 8天（经典回归）
add('axis_motion', 'classic', { depth: 10, up: 3, down: 2 }, '8 days', {
  'en': 'A snail is at the bottom of a 10 m well. Each day it climbs up 3 m, and each night it slips back 2 m. After how many days does it climb out of the well?',
  'zh-CN': '一只蜗牛在井底，井深 10 米。它白天向上爬 3 米，晚上滑下 2 米。问几天能爬出井口？',
  'zh-TW': '一隻蝸牛在井底，井深 10 公尺。牠白天向上爬 3 公尺，晚上滑下 2 公尺。問幾天能爬出井口？',
  'ja': 'カタツムリが深さ10 mの井戸の底にいます。昼に3 m登り、夜に2 m滑り落ちます。何日で井戸から出られますか？',
  'ko': '달팽이가 깊이 10 m인 우물 바닥에 있습니다. 낮에 3 m 올라가고 밤에 2 m 미끄러져 내려갑니다. 며칠 만에 우물에서 빠져나옵니까?',
  'fr': 'Un escargot est au fond d\'un puits de 10 m. Chaque jour il grimpe de 3 m, et chaque nuit il glisse de 2 m. Au bout de combien de jours sort-il du puits ?',
  'de': 'Eine Schnecke sitzt in einem 10 m tiefen Brunnen. Tagsüber klettert sie 3 m hoch, nachts rutscht sie 2 m zurück. Nach wie vielen Tagen klettert sie heraus?',
  'es': 'Un caracol está en el fondo de un pozo de 10 m. Cada día sube 3 m y cada noche resbala 2 m. ¿En cuántos días sale del pozo?',
  'it': 'Una lumaca si trova in fondo a un pozzo profondo 10 m. Ogni giorno sale di 3 m, ogni notte scivola di 2 m. Dopo quanti giorni esce dal pozzo?',
  'ar': 'حلزون في قاع بئر عمقها 10 أمتار. يتسلق نهارًا 3 أمتار، وينزلق ليلًا 2 أمتار. كم يومًا يحتاج حتى يخرج من البئر؟',
  'fa': 'حلزونی در کف چاهی به عمق 10 متر قرار دارد. هر روز 3 متر بالا می‌رود و هر شب 2 متر لغزش می‌کند. چند روز طول می‌کشد تا از چاه بیرون بیاید؟',
});

// A2: 边界 up>=depth → 1天
add('axis_motion', 'boundary-up-ge-depth', { depth: 5, up: 5, down: 1 }, '1 day', {
  'en': 'A frog is in a 5 m well. On the first day it jumps up 5 m. How many days does it take to escape?',
  'zh-CN': '一只青蛙在 5 米深的井里，第一天白天一下子跳上去 5 米。它几天能出去？',
  'zh-TW': '一隻青蛙在 5 公尺深的井裡，第一天白天一口氣跳上去 5 公尺。牠幾天能出去？',
  'ja': 'カエルが深さ5 mの井戸にいます。昼に5 mジャンプします。脱出するのに何日かかりますか？',
  'ko': '개구리가 깊이 5 m인 우물에 있습니다. 첫째 날 낮에 5 m 점프합니다. 탈출하는 데 며칠 걸립니까?',
  'fr': 'Une grenouille est dans un puits de 5 m. Le premier jour, elle saute de 5 m. Combien de jours lui faut-il pour s\'échapper ?',
  'de': 'Ein Frosch ist in einem 5 m tiefen Brunnen. Am ersten Tag springt er 5 m hoch. Nach wie vielen Tagen ist er frei?',
  'es': 'Una rana está en un pozo de 5 m. El primer día salta 5 m. ¿Cuántos días tarda en escapar?',
  'it': 'Una rana è in un pozzo di 5 m. Il primo giorno salta di 5 m. Quanti giorni impiega a fuggire?',
  'ar': 'ضفدع في بئر عمقها 5 أمتار. في اليوم الأول يقفز 5 أمتار. كم يومًا يحتاج حتى يخرج؟',
  'fa': 'قورباغه در چاهی به عمق 5 متر است. در روز اول 5 متر می‌پردازد. چند روز طول می‌کشد تا بیرون بیاید؟',
});

// A3: 普通题 depth=20 up=7 down=3 → 5天
add('axis_motion', 'normal', { depth: 20, up: 7, down: 3 }, '5 days', {
  'en': 'A worm crawls up a 20 m well: each day it rises 7 m and each night it drops 3 m. In how many days does it reach the top?',
  'zh-CN': '一条虫子爬 20 米深的井，每天白天上升 7 米，晚上下降 3 米。它第几天爬到井口？',
  'zh-TW': '一條蟲子爬 20 公尺深的井，每天白天上升 7 公尺，晚上下降 3 公尺。牠第幾天爬到井口？',
  'ja': 'ミミズが深さ20 mの井戸を登ります。昼に7 m上がり、夜に3 m下がります。何日で頂上に着きますか？',
  'ko': '지렁이가 깊이 20 m인 우물을 오릅니다. 낮에 7 m 오르고 밤에 3 m 내려갑니다. 며칠 만에 꼭대기에 닿습니까?',
  'fr': 'Un ver grimpe dans un puits de 20 m : chaque jour il monte de 7 m, chaque nuit il redescend de 3 m. En combien de jours atteint-il le sommet ?',
  'de': 'Ein Wurm klettert in einem 20 m tiefen Brunnen hoch: tagsüber steigt er 7 m, nachts sinkt er 3 m. Nach wie vielen Tagen ist er oben?',
  'es': 'Un gusano sube por un pozo de 20 m: cada día sube 7 m y cada noche baja 3 m. ¿En cuántos días llega arriba?',
  'it': 'Un verme risale un pozzo profondo 20 m: ogni giorno sale di 7 m, ogni notte scende di 3 m. In quanti giorni arriva in cima?',
  'ar': 'دودة تصعد بئرًا عمقها 20 مترًا: ترتفع نهارًا 7 أمتار وتهبط ليلًا 3 أمتار. في كم يومًا تصل إلى القمة؟',
  'fa': 'کرمی در چاهی به عمق 20 متر بالا می‌رود: هر روز 7 متر بالا می‌رود و هر شب 3 متر پایین می‌لغزد. در چند روز به دهانه می‌رسد؟',
});

// A4: 无解 up-down<=0 → 爬不出
add('axis_motion', 'unsolvable', { depth: 12, up: 4, down: 4 }, 'never escapes', {
  'en': 'A snail in a 12 m well climbs up 4 m by day but slides back 4 m each night. Can it ever get out?',
  'zh-CN': '井深 12 米，蜗牛白天爬 4 米，晚上又滑下 4 米。它能爬出去吗？',
  'zh-TW': '井深 12 公尺，蝸牛白天爬 4 公尺，晚上又滑下 4 公尺。牠爬得出去嗎？',
  'ja': '深さ12 mの井戸で、カタツムリは昼に4 m登り、夜に4 m滑り落ちます。脱出できますか？',
  'ko': '깊이 12 m인 우물에서 달팽이는 낮에 4 m 오르고 밤에 4 m 미끄러져 내려갑니다. 탈출할 수 있습니까?',
  'fr': 'Dans un puits de 12 m, l\'escargot monte de 4 m le jour mais redescend de 4 m la nuit. Peut-il vraiment sortir ?',
  'de': 'In einem 12 m tiefen Brunnen klettert die Schnecke tags 4 m hoch und rutscht nachts 4 m zurück. Kann sie jemals herauskommen?',
  'es': 'En un pozo de 12 m, el caracol sube 4 m de día pero resbala 4 m de noche. ¿Podrá alguna vez salir?',
  'it': 'In un pozzo di 12 m la lumaca sale di 4 m di giorno ma scivola di 4 m di notte. Riuscirà mai a uscire?',
  'ar': 'في بئر عمقها 12 مترًا، يتسلق الحلزون نهارًا 4 أمتار لكنه ينزلق ليلًا 4 أمتار. هل يستطيع الخروج أصلًا؟',
  'fa': 'در چاهی به عمق 12 متر، حلزون روزها 4 متر بالا می‌رود اما شب‌ها 4 متر لغزش می‌کند. آیا اصلاً می‌تواند بیرون بیاید؟',
});

/* ============================ motion 行程 ============================ */
// M1 相遇 120km / 40+20 → 2h
add('motion', 'meet', { mode: 'meet', distance: 120, vA: 40, vB: 20 }, '2 hours', {
  'en': 'Two cars start from towns 120 km apart, driving toward each other at 40 km per hour and 20 km per hour. After how many hours do they meet?',
  'zh-CN': '甲、乙两车从相距 120 千米的两地同时出发，相向而行，甲车每小时行 40 千米，乙车每小时行 20 千米。几小时后相遇？',
  'zh-TW': '甲、乙兩車從相距 120 公里的兩地同時出發，相向而行，甲車每小時行 40 公里，乙車每小時行 20 公里。幾小時後相遇？',
  'ja': '2台の車が120 km離れた町から同時に向かい合って出発します。時速40 kmと時速20 kmで進むとき、出会うのは何時間後ですか？',
  'ko': '두 자동차가 120 km 떨어진 두 도시에서 동시에 서로를 향해 출발합니다. 시속 40 km와 시속 20 km로 달릴 때 몇 시간 만에 만납니까?',
  'fr': ' Deux voitures partent de deux villes distantes de 120 km, l\'une vers l\'autre à 40 km/h et 20 km/h. Au bout de combien d\'heures se rencontrent-elles ?',
  'de': 'Zwei Autos starten gleichzeitig in 120 km entfernten Orten und fahren mit 40 km/h und 20 km/h aufeinander zu. Nach wie vielen Stunden treffen sie sich?',
  'es': 'Dos coches salen de dos pueblos distantes 120 km, uno hacia el otro a 40 km/h y 20 km/h. ¿Después de cuántas horas se encuentran?',
  'it': 'Due partenze partono da due città distanti 120 km, una verso l\'altra a 40 km/h e 20 km/h. Dopo quante ore si incontrano?',
  'ar': 'تنطلق سيارتان من مدينتين تبعدان 120 كيلومترًا، إحداهما بسرعة 40 كم/ساعة والأخرى 20 كم/ساعة متجهتين نحو بعضهما. بعد كم ساعة تلتقيان؟',
  'fa': 'دو خودرو از دو شهر به فاصله 120 کیلومتر حرکت می‌کنند و با سرعت‌های 40 و 20 کیلومتر بر ساعت به‌سمت هم می‌روند. بعد از چند ساعت به هم می‌رسند؟',
});

// M2 追及 gap=30 / (60-40)=1.5h
add('motion', 'chase', { mode: 'chase', headStart: 30, vA: 60, vB: 40 }, '1.5 hours', {
  'en': 'A motorcyclist 30 km behind a cyclist rides at 60 km per hour, while the cyclist travels at 40 km per hour. After how long does the motorcyclist catch up?',
  'zh-CN': '一人骑自行车在前面，速度每小时 40 千米；另一人骑摩托车在后面 30 千米处追，每小时 60 千米。多久能追上？',
  'zh-TW': '一人騎自行車在前面，速度每小時 40 公里；另一人騎摩托車在後面 30 公里處追，每小時 60 公里。多久能追上？',
  'ja': 'バイクが自転車を時速60 kmで追いかけます。自転車は時速40 km、バイクは30 km後ろにいます。追いつくのは何時間後ですか？',
  'ko': '오토바이가 자전거를 시속 60 km로 추월합니다. 자전거는 시속 40 km, 오토바이는 30 km 뒤에 있습니다. 몇 시간 만에 따라잡습니까?',
  'fr': 'Un motard, 30 km derrière un cycliste, roule à 60 km/h tandis que le cycliste va à 40 km/h. Après combien de temps le motard le rattrape-t-il ?',
  'de': 'Ein Motorradfahrer ist 30 km hinter einem Radfahrer und fährt 60 km/h, der Radfahrer 40 km/h. Nach wie langer Zeit holt er auf?',
  'es': 'Un motorista, 30 km detrás de un ciclista, va a 60 km/h mientras el ciclista va a 40 km/h. ¿Después de cuánto lo alcanza?',
  'it': 'Un motociclista, 30 km dietro a un ciclista, va a 60 km/h mentre il ciclista va a 40 km/h. Dopo quanto tempo lo raggiunge?',
  'ar': 'دراج ناري يبعد 30 كم عن راكب دراجة هوائية، يسير بسرعة 60 كم/ساعة بينما يسير راكب الدراجة بسرعة 40 كم/ساعة. بعد كم يلحق به؟',
  'fa': 'موتورسوختی به فاصله 30 کیلومتری دوچرخه‌سوار، با سرعت 60 کیلومتر بر ساعت تعقیب می‌کند و دوچرخه‌سوار 40 کیلومتر بر ساعت می‌راند. بعد از چند وقت به او می‌رسد؟',
});

// M3 背向 (5+3)*2=16km
add('motion', 'away', { mode: 'away', vA: 5, vB: 3, givenTime: 2 }, '16 km', {
  'en': 'Two friends start from the same point and walk away from each other, one at 5 km per hour and the other at 3 km per hour. How far apart are they after 2 hours?',
  'zh-CN': '甲、乙两人从同一地点同时背向而行，甲每小时走 5 千米，乙每小时走 3 千米。2 小时后两人相距多远？',
  'zh-TW': '甲、乙兩人從同一地點同時背向而行，甲每小時走 5 公里，乙每小時走 3 公里。2 小時後兩人相距多遠？',
  'ja': '二人が同じ地点から同時に反対方向に歩きます。一方は時速5 km、もう一方は時速3 kmです。2時間後、二人の距離は何 kmですか？',
  'ko': '두 사람이 같은 지점에서 동시에 반대 방향으로 걸어갑니다. 한 사람은 시속 5 km, 다른 사람은 시속 3 km입니다. 2시간 후 두 사람은 몇 km 떨어져 있습니까?',
  'fr': 'Deux amis partent du même point en s\'éloignant l\'un de l\'autre, l\'un à 5 km/h, l\'autre à 3 km/h. Quelle est leur distance après 2 heures ?',
  'de': 'Zwei Freunde gehen vom selben Punkt in entgegengesetzte Richtungen, einer mit 5 km/h, der andere mit 3 km/h. Wie weit sind sie nach 2 Stunden voneinander entfernt?',
  'es': 'Dos amigos salen del mismo punto alejándose uno del otro, uno a 5 km/h y otro a 3 km/h. ¿A qué distancia están tras 2 horas?',
  'it': 'Due amici partono dallo stesso punto allontanandosi l\'uno dall\'altro, uno a 5 km/h e l\'altro a 3 km/h. Quanto distano dopo 2 ore?',
  'ar': 'يبدأ صديقان من النقطة نفسها ويسيران في اتجاهين متعاكسين، أحدهما بسرعة 5 كم/ساعة والآخر 3 كم/ساعة. بعد ساعتين كم تصبح المسافة بينهما؟',
  'fa': 'دو نفر از یک نقطه همزمان در دو جهت مخالف حرکت می‌کنند، یکی 5 کیلومتر بر ساعت و دیگری 3 کیلومتر بر ساعت. بعد از 2 ساعت فاصله‌شان چقدر است؟',
});

// M4 相遇 150/(60+40)=1.5h
add('motion', 'meet', { mode: 'meet', distance: 150, vA: 60, vB: 40 }, '1.5 hours', {
  'en': 'Two towns are 150 km apart. A car leaves the first town at 60 km per hour while a bus leaves the second at 40 km per hour, both heading toward each other. When do they meet?',
  'zh-CN': '两地相距 150 千米，一车从一地以每小时 60 千米开往另一地，一车以每小时 40 千米同时相向开出。几小时后相遇？',
  'zh-TW': '兩地相距 150 公里，一車從一地以每小時 60 公里開往另一地，一車以每小時 40 公里同時相向開出。幾小時後相遇？',
  'ja': '2つの町は150 km離れています。一方は時速60 km、他方は時速40 kmで同時に向かい合って進みます。出会うのは何時間後ですか？',
  'ko': '두 도시는 150 km 떨어져 있습니다. 한쪽은 시속 60 km, 다른 쪽은 시속 40 km로 동시에 마주 향해 출발합니다. 몇 시간 만에 만납니까?',
  'fr': ' Deux villes sont distantes de 150 km. Une voiture part de l\'une à 60 km/h, un bus de l\'autre à 40 km/h, en se dirigeant l\'un vers l\'autre. Quand se rencontrent-ils ?',
  'de': 'Zwei Orte sind 150 km voneinander entfernt. Ein Auto fährt mit 60 km/h, ein Bus mit 40 km/h aufeinander zu. Wann treffen sie sich?',
  'es': 'Dos pueblos distan 150 km. Un coche sale de uno a 60 km/h y un autobús del otro a 40 km/h, uno hacia el otro. ¿Cuándo se encuentran?',
  'it': 'Due città distano 150 km. Un\'auto parte da una a 60 km/h, un autobus dall\'altra a 40 km/h, uno verso l\'altra. Quando si incontrano?',
  'ar': 'تبعد مدينتان 150 كيلومترًا. تغادر سيارة إحداهما بسرعة 60 كم/ساعة وتغادر حافلة الأخرى بسرعة 40 كم/ساعة متجهتين نحو بعضهما. متى تلتقيان؟',
  'fa': 'دو شهر 150 کیلومتر از هم فاصله دارند. خودرویی با سرعت 60 کیلومتر بر ساعت از یکی و اتوبوسی با 40 کیلومتر بر ساعت از دیگری به‌سمت هم حرکت می‌کنند. چه زمانی به هم می‌رسند؟',
});

/* ============================ numberline 数轴 ============================ */
// N1 jump start=-3 right 5 → 2
add('numberline', 'jump-neg-start', { mode: 'jump', start: -3, dir: 1, jump: 5 }, '2', {
  'en': 'On a number line, a frog starts at -3 and jumps 5 spaces to the right. At which number does it land?',
  'zh-CN': '一只青蛙在数轴上从 -3 出发，向右跳 5 格，它落在哪个数上？',
  'zh-TW': '一隻青蛙在數線上從 -3 出發，向右跳 5 格，牠落在哪個數上？',
  'ja': '数直線上で、カエルは -3 から右へ5マスジャンプします。着地する数はいくつですか？',
  'ko': '수직선에서 개구리가 -3에서 시작해 오른쪽으로 5칸 점프합니다. 어느 숫자에 내려앉습니까?',
  'fr': 'Sur une droite numérique, une grenouille part de -3 et saute de 5 cases vers la droite. Sur quel nombre atterrit-elle ?',
  'de': 'Auf einem Zahlenstrahl beginnt ein Frosch bei -3 und springt 5 Felder nach rechts. Auf welcher Zahl landet er?',
  'es': 'En una recta numérica, una rana parte de -3 y salta 5 espacios a la derecha. ¿En qué número aterriza?',
  'it': 'Su una retta numerica, una rana parte da -3 e salta 5 caselle verso destra. Su quale numero atterra?',
  'ar': 'على خط الأعداد، تبدأ الضفدع من -3 وتقفز 5 خانات إلى اليمين. على أي عدد تستقر؟',
  'fa': 'روی محور اعداد، قورباغه‌ای از -3 شروع می‌کند و 5 خانه به راست می‌پردازد. روی چه عددی فرود می‌آید؟',
});

// N2 jump start=4 left 6 → -2
add('numberline', 'jump-left', { mode: 'jump', start: 4, dir: -1, jump: 6 }, '-2', {
  'en': 'A rabbit starts at 4 on the number line and hops 6 steps to the left. Where does it end up?',
  'zh-CN': '一只兔子在数轴上从 4 出发，向左跳 6 步，最后到了哪里？',
  'zh-TW': '一隻兔子在數線上從 4 出發，向左跳 6 步，最後到了哪裡？',
  'ja': 'ウサギが数直線上の4から左へ6マス跳びます。最終的にどこに着きますか？',
  'ko': '토끼가 수직선의 4에서 시작해 왼쪽으로 6칸 뜁니다. 최종적으로 어디에 도착합니까?',
  'fr': 'Un lapin part de 4 sur la droite numérique et saute de 6 cases vers la gauche. Où arrive-t-il ?',
  'de': 'Ein Hase startet bei 4 auf dem Zahlenstrahl und hüpft 6 Felder nach links. Wo landet er?',
  'es': 'Un conejo parte de 4 en la recta numérica y salta 6 pasos a la izquierda. ¿Dónde termina?',
  'it': 'Un coniglio parte da 4 sulla retta numerica e salta 6 caselle a sinistra. Dove arriva?',
  'ar': 'يبدأ أرنب من 4 على خط الأعداد ويقفز 6 خطوات إلى اليسار. أين ينتهي به المطاف؟',
  'fa': 'خرگوشی از 4 روی محور اعداد شروع می‌کند و 6 قدم به چپ می‌پردازد. سرانجام کجا می‌رسد؟',
});

// N3 fraction compare 2/3 vs 3/5 → 2/3 bigger
add('numberline', 'fraction-compare', { mode: 'fractionCompare', n1: 2, d1: 3, n2: 3, d2: 5 }, '2/3 is larger', {
  'en': 'Compare the fractions 2/3 and 3/5. Which one is larger?',
  'zh-CN': '比较分数 2/3 和 3/5，哪个更大？',
  'zh-TW': '比較分數 2/3 和 3/5，哪個比較大？',
  'ja': '分数 2/3 と 3/5 を比べなさい。どちらが大きいですか？',
  'ko': '분수 2/3과 3/5를 비교하세요. 어느 것이 더 큽니까?',
  'fr': 'Comparez les fractions 2/3 et 3/5. Laquelle est la plus grande ?',
  'de': 'Vergleiche die Brüche 2/3 und 3/5. Welcher ist größer?',
  'es': 'Compara las fracciones 2/3 y 3/5. ¿Cuál es mayor?',
  'it': 'Confronta le frazioni 2/3 e 3/5. Qual è la maggiore?',
  'ar': 'قارن بين الكسرين 2/3 و 3/5. أيهما أكبر؟',
  'fa': 'دو کسر 2/3 و 3/5 را مقایسه کنید. کدام بزرگ‌تر است؟',
});

// N4 equal fractions 1/2 vs 2/4 → equal
add('numberline', 'fraction-equal', { mode: 'fractionCompare', n1: 1, d1: 2, n2: 2, d2: 4 }, 'equal', {
  'en': 'Compare 1/2 and 2/4. Are they equal or is one larger?',
  'zh-CN': '比较 1/2 和 2/4，它们相等吗，还是有一个更大？',
  'zh-TW': '比較 1/2 和 2/4，它們相等嗎，還是有一個比較大？',
  'ja': '1/2 と 2/4 を比べなさい。等しいですか、それともどちらかが大きいですか？',
  'ko': '1/2와 2/4를 비교하세요. 같습니까, 아니면 어느 쪽이 더 큽니까?',
  'fr': 'Comparez 1/2 et 2/4. Sont-ils égaux ou l\'un est-il plus grand ?',
  'de': 'Vergleiche 1/2 und 2/4. Sind sie gleich oder ist einer größer?',
  'es': 'Compara 1/2 y 2/4. ¿Son iguales o uno es mayor?',
  'it': 'Confronta 1/2 e 2/4. Sono uguali o uno è maggiore?',
  'ar': 'قارن بين 1/2 و 2/4. هل هما متساويان أم أن أحدهما أكبر؟',
  'fa': '1/2 و 2/4 را مقایسه کنید. آیا برابرند یا یکی بزرگ‌تر است؟',
});

/* ============================ bars 条形 ============================ */
// B1 fraction total=24, 3/4 → 18
add('bars', 'fraction', { mode: 'fraction', total: 24, num: 3, den: 4 }, '18', {
  'en': 'There are 24 apples. If 3/4 of them are eaten, how many apples are eaten?',
  'zh-CN': '有 24 个苹果，吃掉了其中的 3/4，吃掉了多少个苹果？',
  'zh-TW': '有 24 顆蘋果，吃掉了其中的 3/4，吃掉了多少顆蘋果？',
  'ja': 'リンゴが24個あります。その3/4を食べました。食べたリンゴは何個ですか？',
  'ko': '사과가 24개 있습니다. 그중 3/4를 먹었습니다. 먹은 사과는 몇 개입니까?',
  'fr': 'Il y a 24 pommes. Si on en mange les 3/4, combien de pommes sont mangées ?',
  'de': 'Es gibt 24 Äpfel. Wenn man 3/4 davon isst, wie viele Äpfel werden gegessen?',
  'es': 'Hay 24 manzanas. Si se comen 3/4, ¿cuántas manzanas se comen?',
  'it': 'Ci sono 24 mele. Se se ne mangiano i 3/4, quante mele si mangiano?',
  'ar': 'يوجد 24 تفاحة. إذا أُكل منها 3/4، فكم تفاحة أُكلت؟',
  'fa': '24 سیب وجود دارد. اگر 3/4 آن‌ها خورده شود، چند سیب خورده می‌شود؟',
});

// B2 percent total=80 pct=25 → 20
add('bars', 'percent', { mode: 'percent', total: 80, pct: 25 }, '20', {
  'en': 'A book has 80 pages. A student read 25% of it. How many pages did the student read?',
  'zh-CN': '一本书共 80 页，小明读了 25%，他读了多少页？',
  'zh-TW': '一本書共 80 頁，小明讀了 25%，他讀了多少頁？',
  'ja': '本が80ページあります。太郎はその25%を読みました。何ページ読みましたか？',
  'ko': '책이 80페이지 있습니다. 학생이 그중 25%를 읽었습니다. 몇 페이지 읽었습니까?',
  'fr': 'Un livre compte 80 pages. Un élève en a lu 25 %. Combien de pages a-t-il lues ?',
  'de': 'Ein Buch hat 80 Seiten. Ein Schüler hat 25 % gelesen. Wie viele Seiten hat er gelesen?',
  'es': 'Un libro tiene 80 páginas. Un alumno leyó el 25 %. ¿Cuántas páginas leyó?',
  'it': 'Un libro ha 80 pagine. Uno studente ne ha letto il 25 %. Quante pagine ha letto?',
  'ar': 'كتاب به 80 صفحة. قرأ طالب 25 % منها. كم صفحة قرأ؟',
  'fa': 'کتابی 80 صفحه دارد. دانش‌آموزی 25 % آن را خوانده است. چند صفحه خوانده است؟',
});

// B3 multiple sum=36 k=3 → 9
add('bars', 'multiple', { mode: 'multiple', sum: 36, k: 3 }, '9', {
  'en': 'Two numbers, total is 36. The larger number is 3 times as many as the smaller. Find the smaller number.',
  'zh-CN': '两个数的和是 36，大数是小数的 3 倍，求小数。',
  'zh-TW': '兩數的和是 36，大數是小數的 3 倍，求小數。',
  'ja': '2つの数の合計は36です。大きい数は小さい数の3倍です。小さい数を求めなさい。',
  'ko': '두 수의 합은 36입니다. 큰 수는 작은 수의 3배입니다. 작은 수를 구하세요.',
  'fr': 'La somme de deux nombres est 36. Le plus grand est 3 fois le plus petit. Trouvez le plus petit nombre.',
  'de': 'Die Summe zweier Zahlen ist 36. Die größere Zahl ist dreimal so groß wie die kleinere. Finde die kleinere Zahl.',
  'es': 'La suma de dos números es 36. El mayor es 3 veces el menor. Halla el número menor.',
  'it': 'La somma di due numeri è 36. Il maggiore è 3 volte il minore. Trova il numero minore.',
  'ar': 'مجموع عددين هو 36. العدد الأكبر يساوي 3 أضعاف العدد الأصغر. أوجد العدد الأصغر.',
  'fa': 'مجموع دو عدد 36 است. عدد بزرگ‌تر 3 برابر عدد کوچک‌تر است. عدد کوچک‌تر را پیدا کنید.',
});

// B4 fraction total=40, 2/5 → 16
add('bars', 'fraction', { mode: 'fraction', total: 40, num: 2, den: 5 }, '16', {
  'en': 'A rope is 40 m long. If 2/5 of it is cut, how many meters are cut?',
  'zh-CN': '一根绳子长 40 米，用去了它的 2/5，用去了多少米？',
  'zh-TW': '一條繩子長 40 公尺，用去了它的 2/5，用去了多少公尺？',
  'ja': '長さ40 mのロープがあります。その2/5を切り取ります。切り取る長さは何 mですか？',
  'ko': '길이 40 m인 밧줄이 있습니다. 그중 2/5를 자르면 몇 미터를 자르게 됩니까?',
  'fr': 'Une corde mesure 40 m. Si on en coupe les 2/5, combien de mètres sont coupés ?',
  'de': 'Ein Seil ist 40 m lang. Wenn man 2/5 davon abschneidet, wie viele Meter werden abgeschnitten?',
  'es': 'Una cuerda mide 40 m. Si se cortan los 2/5, ¿cuántos metros se cortan?',
  'it': 'Una corda è lunga 40 m. Se ne tagliano i 2/5, quanti metri si tagliano?',
  'ar': 'حبل طوله 40 مترًا. إذا قُطع منه 2/5، فكم مترًا قُطع؟',
  'fa': 'طنابی 40 متر طول دارد. اگر 2/5 آن بریده شود، چند متر بریده می‌شود؟',
});

/* ============================ grid 阵列/面积 ============================ */
// G1 rows=3 cols=4 → 12
add('grid', 'array', { mode: 'multiply', rows: 3, cols: 4 }, '12', {
  'en': 'Arrange apples in 3 rows and 4 columns. How many apples are there in all?',
  'zh-CN': '把苹果摆成 3 行 4 列，一共有多少个苹果？',
  'zh-TW': '把蘋果擺成 3 行 4 列，一共有多少顆蘋果？',
  'ja': 'リンゴを3行4列に並べます。全部で何個のリンゴがありますか？',
  'ko': '사과를 3행 4열로 배열하세요. 모두 몇 개의 사과가 있습니까?',
  'fr': 'Rangez des pommes en 3 rangées et 4 colonnes. Combien y a-t-il de pommes en tout ?',
  'de': 'Lege Äpfel in 3 Reihen und 4 Spalten an. Wie viele Äpfel gibt es insgesamt?',
  'es': 'Coloca manzanas en 3 filas y 4 columnas. ¿Cuántas manzanas hay en total?',
  'it': 'Disponi le mele in 3 file e 4 colonne. Quante mele ci sono in tutto?',
  'ar': 'رتب التفاح في 3 صفوف و 4 أعمدة. كم تفاحة يوجد في المجموع؟',
  'fa': 'سیب‌ها را در 3 ردیف و 4 ستون بچینید. روی هم چند سیب وجود دارد؟',
});

// G2 rows=5 cols=6 → 30
add('grid', 'array', { mode: 'multiply', rows: 5, cols: 6 }, '30', {
  'en': 'Stars are arranged in an array with 5 rows, and each row has 6 stars. How many stars are there?',
  'zh-CN': '星星排成阵列，有 5 行，每行 6 颗，一共有多少颗星？',
  'zh-TW': '星星排成陣列，有 5 行，每行 6 顆，一共有多少顆星？',
  'ja': '星が5行に並んでいて、1行に6個あります。星は全部でいくつですか？',
  'ko': '별이 5행으로 배열되어 있고, 각 행에 6개씩 있습니다. 별은 모두 몇 개입니까?',
  'fr': 'Des étoiles sont disposées en 5 rangées, chaque rangée a 6 étoiles. Combien d\'étoiles y a-t-il ?',
  'de': 'Sterne sind in 5 Reihen angeordnet, jede Reihe hat 6 Sterne. Wie viele Sterne gibt es?',
  'es': 'Las estrellas se organizan en 5 filas, y cada fila tiene 6 estrellas. ¿Cuántas estrellas hay?',
  'it': 'Le stelle sono disposte in 5 file e ogni fila ne ha 6. Quante stelle ci sono?',
  'ar': 'النجوم مرتبة في 5 صفوف، وكل صف فيه 6 نجوم. كم نجمة يوجد؟',
  'fa': 'ستاره‌ها در 5 ردیف چیده شده‌اند و هر ردیف 6 ستاره دارد. چند ستاره وجود دارد؟',
});

// G3 area length=8 width=5 → 40
add('grid', 'area', { mode: 'area', rows: 5, cols: 8 }, '40', {
  'en': 'A rectangle has length 8 and width 5. What is its area?',
  'zh-CN': '一个长方形长 8、宽 5，它的面积是多少？',
  'zh-TW': '一個長方形長 8、寬 5，它的面積是多少？',
  'ja': '長方形の縦が8、横が5です。面積はいくつですか？',
  'ko': '직사각형의 가로가 8, 세로가 5입니다. 넓이는 얼마입니까?',
  'fr': 'Un rectangle a une longueur de 8 et une largeur de 5. Quelle est son aire ?',
  'de': 'Ein Rechteck ist 8 lang und 5 breit. Wie groß ist seine Fläche?',
  'es': 'Un rectángulo tiene largo 8 y ancho 5. ¿Cuál es su área?',
  'it': 'Un rettangolo ha lunghezza 8 e larghezza 5. Qual è la sua area?',
  'ar': 'مستطيل طوله 8 وعرضه 5. ما مساحته؟',
  'fa': 'مستطیلی طول 8 و عرض 5 دارد. مساحت آن چقدر است؟',
});

// G4 rows=4 cols=4 → 16
add('grid', 'array', { mode: 'multiply', rows: 4, cols: 4 }, '16', {
  'en': 'Books are put on shelves in 4 rows, with 4 books on each row. How many books are there altogether?',
  'zh-CN': '书摆在书架上，有 4 层，每层放 4 本，一共有多少本书？',
  'zh-TW': '書擺在書架上，有 4 層，每層放 4 本，一共有多少本書？',
  'ja': '本が4段の棚にあり、各段に4冊ずつ並んでいます。本は全部で何冊ですか？',
  'ko': '책이 4단 책꽂이에 꽂혀 있고, 각 단에 4권씩 있습니다. 책은 모두 몇 권입니까?',
  'fr': 'Des livres sont rangés sur 4 étagères, 4 livres par étagère. Combien y a-t-il de livres en tout ?',
  'de': 'Bücher stehen in 4 Reihen, 4 Bücher pro Reihe. Wie viele Bücher gibt es insgesamt?',
  'es': 'Los libros se colocan en 4 filas, con 4 libros en cada fila. ¿Cuántos libros hay en total?',
  'it': 'I libri sono disposti su 4 file, con 4 libri per fila. Quanti libri ci sono in tutto?',
  'ar': 'تُوضع الكتب في 4 صفوف، في كل صف 4 كتب. كم كتابًا يوجد في المجموع؟',
  'fa': 'کتاب‌ها در 4 ردیف چیده شده‌اند و در هر ردیف 4 کتاب است. روی هم چند کتاب وجود دارد؟',
});

/* ============================ balance 方程 ============================ */
// Eq1: 2x+5=17 → x=6
add('balance', 'linear-eq', { a: 2, bSigned: 5, c: 17 }, '6', {
  'en': 'Solve for x: 2x + 5 = 17.',
  'zh-CN': '解方程：2x + 5 = 17。',
  'zh-TW': '解方程：2x + 5 = 17。',
  'ja': '次の方程式を解きなさい：2x + 5 = 17。',
  'ko': '다음 방정식을 푸세요: 2x + 5 = 17.',
  'fr': 'Résoudre pour x : 2x + 5 = 17.',
  'de': 'Löse nach x auf: 2x + 5 = 17.',
  'es': 'Resuelve para x: 2x + 5 = 17.',
  'it': 'Risolvi per x: 2x + 5 = 17.',
  'ar': 'أوجد قيمة x: 2x + 5 = 17.',
  'fa': 'مقدار x را پیدا کنید: 2x + 5 = 17.',
});

// Eq2: 3x-4=11 → x=5
add('balance', 'linear-eq', { a: 3, bSigned: -4, c: 11 }, '5', {
  'en': 'Solve the equation 3x - 4 = 11 for x.',
  'zh-CN': '求方程 3x - 4 = 11 的解 x。',
  'zh-TW': '求方程式 3x - 4 = 11 的解 x。',
  'ja': '方程式 3x - 4 = 11 を解きなさい。',
  'ko': '방정식 3x - 4 = 11을 푸세요.',
  'fr': 'Résoudre l\'équation 3x - 4 = 11 en x.',
  'de': 'Löse die Gleichung 3x - 4 = 11 nach x auf.',
  'es': 'Resuelve la ecuación 3x - 4 = 11 para x.',
  'it': 'Risolvi l\'equazione 3x - 4 = 11 rispetto a x.',
  'ar': 'حل المعادلة 3x - 4 = 11 لإيجاد x.',
  'fa': 'معادله 3x - 4 = 11 را برای x حل کنید.',
});

// Eq3: 4x+8=24 → x=4
add('balance', 'linear-eq', { a: 4, bSigned: 8, c: 24 }, '4', {
  'en': 'Find x when 4x + 8 = 24.',
  'zh-CN': '当 4x + 8 = 24 时，求 x。',
  'zh-TW': '當 4x + 8 = 24 時，求 x。',
  'ja': '4x + 8 = 24 のとき、x を求めなさい。',
  'ko': '4x + 8 = 24일 때 x를 구하세요.',
  'fr': 'Trouver x quand 4x + 8 = 24.',
  'de': 'Bestimme x, wenn 4x + 8 = 24 gilt.',
  'es': 'Halla x cuando 4x + 8 = 24.',
  'it': 'Trova x quando 4x + 8 = 24.',
  'ar': 'أوجد x عندما 4x + 8 = 24.',
  'fa': 'وقتی 4x + 8 = 24 است، x را پیدا کنید.',
});

// Eq4: x+7=12 → x=5
add('balance', 'linear-eq', { a: 1, bSigned: 7, c: 12 }, '5', {
  'en': 'A balance scale has 1 box and 7 g on the left, balancing 12 g on the right. What is the mass of the box?',
  'zh-CN': '天平左边放 1 个盒子和 7 克砝码，右边放 12 克砝码，天平平衡。盒子重多少克？',
  'zh-TW': '天平左邊放 1 個盒子和 7 克砝码，右邊放 12 克砝码，天平平衡。盒子重多少克？',
  'ja': 'てんびんの左に箱1個と7 gのおもり、右に12 gのおもりがあり、釣り合っています。箱の重さは何 gですか？',
  'ko': '저울 왼쪽에 상자 1개와 7g 추, 오른쪽에 12g 추가 있어 균형을 이룹니다. 상자의 무게는 몇 g입니까?',
  'fr': 'Une balance a un poids de 7 g et une boîte à gauche, et 12 g à droite, équilibrée. Quelle est la masse de la boîte ?',
  'de': 'Eine Waage links: eine Box und 7 g, rechts: 12 g, im Gleichgewicht. Wie schwer ist die Box?',
  'es': 'Una balanza tiene una caja y 7 g a la izquierda, y 12 g a la derecha, equilibrada. ¿Cuál es la masa de la caja?',
  'it': 'Una bilancia ha una scatola e 7 g a sinistra, e 12 g a destra, in equilibrio. Qual è la massa della scatola?',
  'ar': 'ميزان كفتة اليسرى صندوق و 7 غرام، واليمنى 12 غرامًا، وهو متوازن. ما كتلة الصندوق؟',
  'fa': 'ترازو در کفه چپ یک جعبه و 7 گرم، و در کفه راست 12 گرم دارد و موازنه است. جرم جعبه چقدر است؟',
});

/* ============================ geometry 几何 ============================ */
// H1 rect perimeter 6,4 → 20
add('geometry', 'rect-perimeter', { task: 'rect_perimeter', width: 6, height: 4 }, '20', {
  'en': 'A rectangle is 6 cm long and 4 cm wide. What is its perimeter?',
  'zh-CN': '一个长方形长 6 厘米，宽 4 厘米，它的周长是多少？',
  'zh-TW': '一個長方形長 6 公分，寬 4 公分，它的周長是多少？',
  'ja': '長方形の縦が6 cm、横が4 cmです。周の長さはいくつですか？',
  'ko': '직사각형의 가로가 6 cm, 세로가 4 cm입니다. 둘레는 얼마입니까?',
  'fr': 'Un rectangle mesure 6 cm de long et 4 cm de large. Quel est son périmètre ?',
  'de': 'Ein Rechteck ist 6 cm lang und 4 cm breit. Wie ist sein Umfang?',
  'es': 'Un rectángulo mide 6 cm de largo y 4 cm de ancho. ¿Cuál es su perímetro?',
  'it': 'Un rettangolo è lungo 6 cm e largo 4 cm. Qual è il suo perimetro?',
  'ar': 'مستطيل طوله 6 سم وعرضه 4 سم. ما محيطه؟',
  'fa': 'مستطیلی به طول 6 سانتی‌متر و عرض 4 سانتی‌متر داریم. محیط آن چقدر است؟',
});

// H2 circle area r=5 → 78.54
add('geometry', 'circle-area', { task: 'circle_area', radius: 5 }, '78.54', {
  'en': 'A circle has radius 5 cm. Find its area (use 3.14 for pi).',
  'zh-CN': '一个圆的半径是 5 厘米，求它的面积（π取 3.14）。',
  'zh-TW': '一個圓的半徑是 5 公分，求它的面積（π取 3.14）。',
  'ja': '半径5 cmの円の面積を求めなさい（π=3.14）。',
  'ko': '반지름이 5 cm인 원의 넓이를 구하세요 (π=3.14).',
  'fr': 'Un cercle a un rayon de 5 cm. Calculez son aire (π = 3,14).',
  'de': 'Ein Kreis hat den Radius 5 cm. Berechne seine Fläche (π = 3,14).',
  'es': 'Un círculo tiene radio 5 cm. Halla su área (π = 3,14).',
  'it': 'Un cerchio ha raggio 5 cm. Calcola la sua area (π = 3,14).',
  'ar': 'دائرة نصف قطرها 5 سم. أوجد مساحتها (π = 3.14).',
  'fa': 'دایره‌ای شعاع 5 سانتی‌متر دارد. مساحت آن را بیابید (π = 3.14).',
});

// H3 triangle angle 60,70 → 50
add('geometry', 'triangle-angle', { task: 'triangle_angle', known: [60, 70] }, '50°', {
  'en': 'Two angles of a triangle are 60° and 70°. Find the third angle.',
  'zh-CN': '一个三角形的两个内角分别是 60° 和 70°，求第三个角。',
  'zh-TW': '一個三角形的兩個內角分別是 60° 和 70°，求第三個角。',
  'ja': '三角形の2つの角がそれぞれ60°、70°です。残りの角を求めなさい。',
  'ko': '삼각형의 두 각이 각각 60°, 70°입니다. 나머지 한 각을 구하세요.',
  'fr': ' Deux angles d\'un triangle valent 60° et 70°. Trouvez le troisième angle.',
  'de': 'Zwei Winkel eines Dreiecks sind 60° und 70°. Finde den dritten Winkel.',
  'es': 'Dos ángulos de un triángulo son 60° y 70°. Halla el tercer ángulo.',
  'it': 'Due angoli di un triangolo sono 60° e 70°. Trova il terzo angolo.',
  'ar': 'زاويتان في مثلث قياسهما 60° و 70°. أوجد الزاوية الثالثة.',
  'fa': 'دو زاویه از یک مثلث 60° و 70° است. زاویه سوم را پیدا کنید.',
});

// H4 pythagorean legs 3,4 → 5
add('geometry', 'pythagorean', { task: 'pythagorean', legA: 3, legB: 4 }, '5', {
  'en': 'A right triangle has legs 3 cm and 4 cm. Find the length of the hypotenuse.',
  'zh-CN': '一个直角三角形两条直角边分别是 3 厘米和 4 厘米，求斜边的长。',
  'zh-TW': '一個直角三角形兩條直角邊分別是 3 公分和 4 公分，求斜邊的長。',
  'ja': '直角三角形の2本の直角辺がそれぞれ3 cm、4 cmです。斜辺の長さを求めなさい。',
  'ko': '직각삼각형의 두 직각변이 각각 3 cm, 4 cm입니다. 빗변의 길이를 구하세요.',
  'fr': 'Un triangle rectangle a des côtés de 3 cm et 4 cm. Trouvez la longueur de l\'hypoténuse.',
  'de': 'Ein rechtwinkliges Dreieck hat die Katheten 3 cm und 4 cm. Berechne die Hypotenuse.',
  'es': 'Un triángulo rectángulo tiene catetos de 3 cm y 4 cm. Halla la longitud de la hipotenusa.',
  'it': 'Un triangolo rettolo ha i cateti di 3 cm e 4 cm. Trova la lunghezza dell\'ipotenusa.',
  'ar': 'مثلث قائم الزاوية ضلعاه القائمتان 3 سم و 4 سم. أوجد طول الوتر.',
  'fa': 'مثلث قائم‌الزاویه‌ای دو ضلع قائمه 3 و 4 سانتی‌متر دارد. طول وتر را پیدا کنید.',
});

/* ============================ function-graph 函数图像 ============================ */
// F1 linear value y=2x+1 at x=3 → 7
add('function-graph', 'linear-value', { task: 'linear_value', k: 2, b: 1, x: 3 }, '7', {
  'en': 'Evaluate the function y = 2x + 1 at x = 3.',
  'zh-CN': '求函数 y = 2x + 1 在 x = 3 时的函数值。',
  'zh-TW': '求函數 y = 2x + 1 在 x = 3 時的函數值。',
  'ja': '関数 y = 2x + 1 について、x = 3 のときの y の値を求めなさい。',
  'ko': '함수 y = 2x + 1에서 x = 3일 때 함숫값을 구하세요.',
  'fr': 'Évaluez la fonction y = 2x + 1 en x = 3.',
  'de': 'Werte die Funktion y = 2x + 1 an der Stelle x = 3 aus.',
  'es': 'Evalúa la función y = 2x + 1 en x = 3.',
  'it': 'Valuta la funzione y = 2x + 1 in x = 3.',
  'ar': 'احسب قيمة الدالة y = 2x + 1 عندما x = 3.',
  'fa': 'مقدار تابع y = 2x + 1 را در x = 3 محاسبه کنید.',
});

// F2 linear points (0,1),(2,5) → y=2x+1
add('function-graph', 'linear-points', { task: 'linear_points', p1: [0, 1], p2: [2, 5], k: 2, b: 1 }, 'y=2x+1', {
  'en': 'A straight line passes through the points (0,1) and (2,5). Find its equation.',
  'zh-CN': '一条直线经过点 (0,1) 和 (2,5)，求这条直线的解析式。',
  'zh-TW': '一條直線通過點 (0,1) 和 (2,5)，求這條直線的解析式。',
  'ja': '直線が点 (0,1) と点 (2,5) を通ります。直線の式を求めなさい。',
  'ko': '직선이 점 (0,1)과 점 (2,5)를 지납니다. 직선의 방정식을 구하세요.',
  'fr': 'Une droite passe par les points (0,1) et (2,5). Trouvez son équation.',
  'de': 'Eine Gerade geht durch die Punkte (0,1) und (2,5). Finde ihre Gleichung.',
  'es': 'Una recta pasa por los puntos (0,1) y (2,5). Halla su ecuación.',
  'it': 'Una retta passa per i punti (0,1) e (2,5). Trova la sua equazione.',
  'ar': 'يمر مستقيم بالنقطتين (0,1) و (2,5). أوجد معادلته.',
  'fa': 'خطی از نقاط (0,1) و (2,5) می‌گذرد. معادله آن را پیدا کنید.',
});

// F3 quadratic vertex y=x²-4x+3 → (2,-1)
add('function-graph', 'quadratic-vertex', { task: 'quadratic_vertex', a: 1, b: -4, c: 3, h: 2, vk: -1 }, '(2,-1)', {
  'en': 'Find the vertex of the parabola y = x² - 4x + 3.',
  'zh-CN': '求抛物线 y = x² - 4x + 3 的顶点坐标。',
  'zh-TW': '求拋物線 y = x² - 4x + 3 的頂點座標。',
  'ja': '放物線 y = x² - 4x + 3 の頂点を求めなさい。',
  'ko': '포물선 y = x² - 4x + 3의 꼭짓점을 구하세요.',
  'fr': 'Trouvez le sommet de la parabole y = x² - 4x + 3.',
  'de': 'Finde den Scheitelpunkt der Parabel y = x² - 4x + 3.',
  'es': 'Halla el vértice de la parábola y = x² - 4x + 3.',
  'it': 'Trova il vertice della parabola y = x² - 4x + 3.',
  'ar': 'أوجد رأس القطع المكافئ y = x² - 4x + 3.',
  'fa': 'رأس سهمی y = x² - 4x + 3 را پیدا کنید.',
});

// F4 intersection y=x+1, y=2x-1 → (2,3)
add('function-graph', 'intersection', { task: 'intersection', k1: 1, b1: 1, k2: 2, b2: -1, xi: 2, yi: 3 }, '(2,3)', {
  'en': 'Find the intersection point of y = x + 1 and y = 2x - 1.',
  'zh-CN': '求直线 y = x + 1 与 y = 2x - 1 的交点坐标。',
  'zh-TW': '求直線 y = x + 1 與 y = 2x - 1 的交點座標。',
  'ja': '直線 y = x + 1 と y = 2x - 1 の交点を求めなさい。',
  'ko': '직선 y = x + 1과 y = 2x - 1의 교점을 구하세요.',
  'fr': 'Trouvez le point d\'intersection de y = x + 1 et y = 2x - 1.',
  'de': 'Finde den Schnittpunkt von y = x + 1 und y = 2x - 1.',
  'es': 'Halla el punto de intersección de y = x + 1 e y = 2x - 1.',
  'it': 'Trova il punto di intersezione di y = x + 1 e y = 2x - 1.',
  'ar': 'أوجد نقطة تقاطع المستقيمين y = x + 1 و y = 2x - 1.',
  'fa': 'نقطه تقاطع دو خط y = x + 1 و y = 2x - 1 را پیدا کنید.',
});

/* ============================ sequence 数列 ============================ */
// S1 N=1 → 1
add('sequence', 'boundary-n1', { mode: 'grouped', N: 1 }, '1', {
  'en': 'In the sequence 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... the number n appears n times. What is the 1st term?',
  'zh-CN': '有一串数：1, 2, 2, 3, 3, 3, 4, 4, 4, 4…… 自然数 n 连续出现 n 次。第 1 个数是多少？',
  'zh-TW': '有一串數：1, 2, 2, 3, 3, 3, 4, 4, 4, 4…… 自然數 n 連續出現 n 次。第 1 個數是多少？',
  'ja': '数列 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... では、数 n が n 回現れます。第1項はいくつですか？',
  'ko': '수열 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... 에서 자연수 n은 n번 나타납니다. 첫 번째 항은 무엇입니까?',
  'fr': 'Dans la suite 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... le nombre n apparaît n fois. Quel est le 1er terme ?',
  'de': 'In der Folge 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... kommt die Zahl n genau n mal vor. Was ist das 1. Glied?',
  'es': 'En la secuencia 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... el número n aparece n veces. ¿Cuál es el primer término?',
  'it': 'Nella successione 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... il numero n compare n volte. Qual è il 1° termine?',
  'ar': 'في المتتالية 1، 2، 2، 3، 3، 3، 4، 4، 4، 4، ... يظهر العدد n بمقدار n مرات. ما هو الحد الأول؟',
  'fa': 'در دنباله 1، 2، 2، 3، 3، 3، 4، 4، 4، 4، ... عدد دقیقاً n بار تکرار می‌شود. جمله اول چیست؟',
});

// S2 N=3 → 2
add('sequence', 'small-n', { mode: 'grouped', N: 3 }, '2', {
  'en': 'Consider the sequence 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... where n appears n times in a row. What is the 3rd term?',
  'zh-CN': '观察数列 1, 2, 2, 3, 3, 3, 4, 4, 4, 4…… 其中 n 连续出现 n 次，第 3 个数是多少？',
  'zh-TW': '觀察數列 1, 2, 2, 3, 3, 3, 4, 4, 4, 4…… 其中 n 連續出現 n 次，第 3 個數是多少？',
  'ja': '数列 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ...（n が n 回連続）の第3項はいくつですか？',
  'ko': '수열 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... (n이 n번 연속)에서 세 번째 항은 무엇입니까?',
  'fr': 'Suite 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... où n apparaît n fois de suite. Quel est le 3e terme ?',
  'de': 'Folge 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... bei der n n-mal hintereinander vorkommt. Was ist das 3. Glied?',
  'es': 'Secuencia 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... donde n aparece n veces seguidas. ¿Cuál es el tercer término?',
  'it': 'Successione 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... dove n compare n volte di seguito. Qual è il 3° termine?',
  'ar': 'المتتالية 1، 2، 2، 3، 3، 3، 4، 4، 4، 4، ... حيث يتكرر n مرات متتالية. ما هو الحد الثالث؟',
  'fa': 'دنباله 1، 2، 2، 3، 3، 3، 4، 4، 4، 4، ... که در آن n دقیقاً n بار تکرار می‌شود. جمله سوم چیست؟',
});

// S3 N=2026 → 64（回归口径）
add('sequence', 'regression-2026', { mode: 'grouped', N: 2026 }, '64', {
  'en': 'In the sequence 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... each number n appears exactly n times. What is the 2026th term?',
  'zh-CN': '在数列 1, 2, 2, 3, 3, 3, 4, 4, 4, 4…… 中，每个数 n 恰好出现 n 次。第 2026 个数是多少？',
  'zh-TW': '在數列 1, 2, 2, 3, 3, 3, 4, 4, 4, 4…… 中，每個數 n 恰好出現 n 次。第 2026 個數是多少？',
  'ja': '数列 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... で、各数 n はちょうど n 回現れます。第2026項はいくつですか？',
  'ko': '수열 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... 에서 각 수 n은 정확히 n번 나타납니다. 제2026항은 무엇입니까?',
  'fr': 'Dans la suite 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... chaque nombre n apparaît exactement n fois. Quel est le 2026e terme ?',
  'de': 'In der Folge 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... kommt jede Zahl n genau n-mal vor. Was ist das 2026. Glied?',
  'es': 'En la secuencia 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... cada número n aparece exactamente n veces. ¿Cuál es el término 2026?',
  'it': 'Nella successione 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... ogni numero n compare esattamente n volte. Qual è il termine 2026?',
  'ar': 'في المتتالية 1، 2، 2، 3، 3، 3، 4، 4، 4، 4، ... كل عدد n يظهر n مرات بالضبط. ما هو الحد 2026؟',
  'fa': 'در دنباله 1، 2، 2، 3، 3، 3، 4، 4، 4، 4، ... هر عدد دقیقاً n بار ظاهر می‌شود. جمله 2026ام چیست؟',
});

// S4 N=10 → 4
add('sequence', 'n10', { mode: 'grouped', N: 10 }, '4', {
  'en': 'Look at the pattern 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... where n repeats n times. What number is the 10th term?',
  'zh-CN': '找规律：1, 2, 2, 3, 3, 3, 4, 4, 4, 4…… n 重复出现 n 次。第 10 个数是几？',
  'zh-TW': '找規律：1, 2, 2, 3, 3, 3, 4, 4, 4, 4…… n 重複出現 n 次。第 10 個數是幾？',
  'ja': '規則性を見つけよ：1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ...（n は n 回繰り返す）。第10項はいくつですか？',
  'ko': '규칙을 찾으세요: 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... (n은 n번 반복). 열 번째 항은 무엇입니까?',
  'fr': 'Trouvez la règle : 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... où n se répète n fois. Quel est le 10e terme ?',
  'de': 'Finde die Regel: 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... wobei sich n n-mal wiederholt. Was ist das 10. Glied?',
  'es': 'Halla la regla: 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... donde n se repite n veces. ¿Cuál es el décimo término?',
  'it': 'Trova la regola: 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... dove n si ripete n volte. Qual è il 10° termine?',
  'ar': 'اكتشف النمط: 1، 2، 2، 3، 3، 3، 4، 4، 4، 4، ... حيث يتكرر n بمقدار n. ما هو الحلقة العاشرة؟',
  'fa': 'الگو را پیدا کنید: 1، 2، 2، 3، 3، 3، 4، 4، 4، 4، ... که در آن n به اندازه n تکرار می‌شود. جمله دهم چیست؟',
});

/* ============================ 反例（误接测试） ============================ */
// 格式：{ counter: true, text, expectCard: '应被路由到或拒绝', mustReject?: bool, note }
const COUNTERS = [
  // ---- 纯几何题喂给 axis_motion：不应被 axis_motion 命中 ----
  { text: 'A rectangle is 6 cm long and 4 cm wide. What is its area?', lang: 'en', avoid: 'axis_motion', note: 'pure geometry must not hit axis_motion' },
  { text: '一个长方形长 6 厘米宽 4 厘米，面积是多少？', lang: 'zh-CN', avoid: 'axis_motion', note: '纯几何题不应被 axis_motion 命中' },
  { text: 'Un cercle de rayon 5 cm, calculez son aire.', lang: 'fr', avoid: 'axis_motion', note: 'french geometry should not route to axis_motion' },
  { text: '半径 5 cm 的圆，周长是多少？', lang: 'zh-CN', avoid: 'axis_motion', note: 'circle problem should not hit axis_motion' },
  // ---- 纯数列题喂给 balance：不应被 balance 命中 ----
  { text: 'In the sequence 1, 2, 2, 3, 3, 3, ... what is the 2026th term?', lang: 'en', avoid: 'balance', note: 'pure sequence must not hit balance' },
  { text: '数列 1, 2, 2, 3, 3, 3…… 第 2026 个数是几？', lang: 'zh-CN', avoid: 'balance', note: '纯数列题不应被 balance 命中' },
  { text: '数列 1, 2, 2, 3, 3, 3, 4, 4, 4, 4…… 第 10 个数是几？', lang: 'zh-CN', avoid: 'motion', note: 'pure sequence must not hit motion' },
  // ---- 方程题喂给 motion / bars：不应误接 ----
  { text: 'Solve 5x - 3 = 22 for x.', lang: 'en', avoid: 'motion', note: 'equation must not hit motion' },
  { text: '解方程 5x - 3 = 22。', lang: 'zh-CN', avoid: 'motion', note: '方程题不应被 motion 命中' },
  { text: '2x + 9 = 27, solve for x.', lang: 'en', avoid: 'bars', note: 'equation must not hit bars' },
  { text: '解方程 4x + 8 = 24。', lang: 'zh-CN', avoid: 'grid', note: 'equation must not hit grid' },
  // ---- 爬井题喂给 geometry：不应误接 ----
  { text: 'A snail climbs out of a 10 m well, up 3 m by day, down 2 m by night.', lang: 'en', avoid: 'geometry', note: 'well-climb must not hit geometry' },
  { text: '井深 10 米，蜗牛白天爬 3 米晚上滑 2 米，几天爬出？', lang: 'zh-CN', avoid: 'geometry', note: 'well-climb must not hit geometry' },
  // ---- 函数题喂给 grid ----
  { text: 'Find the vertex of the parabola y = x² - 4x + 3.', lang: 'en', avoid: 'grid', note: 'parabola must not hit grid' },
  { text: '求抛物线 y = x² - 4x + 3 的顶点。', lang: 'zh-CN', avoid: 'grid', note: 'parabola must not hit grid' },
  // ---- 几何题喂给 numberline ----
  { text: 'Find the hypotenuse of a right triangle with legs 3 and 4.', lang: 'en', avoid: 'numberline', note: 'pythagorean must not hit numberline' },
  { text: '直角三角形两直角边 3 和 4，求斜边。', lang: 'zh-CN', avoid: 'numberline', note: 'pythagorean must not hit numberline' },
  // ---- 行程题喂给 sequence ----
  { text: 'Two cars 120 km apart drive toward each other at 40 and 20 km per hour.', lang: 'en', avoid: 'sequence', note: 'motion must not hit sequence' },
  { text: '两车相距 120 千米相向而行，40 和 20 千米每小时，几小时相遇？', lang: 'zh-CN', avoid: 'sequence', note: 'motion must not hit sequence' },
  // ---- board classifyBoard 对小学题必须拒绝 ----
  { text: '小学一年级：3 + 5 等于几？', lang: 'zh-CN', stage: 'elementary', boardMustReject: true, note: 'board must reject elementary' },
  { text: '这是二年级的数数题，数一数一共有几个苹果', lang: 'zh-CN', stage: 'grade 2', boardMustReject: true, note: 'board must reject grade-2' },
  { text: 'elementary arithmetic: what is 7 times 8?', lang: 'en', stage: 'primary school', boardMustReject: true, note: 'board must reject primary' },
  { text: '小学五年级分数应用题', lang: 'zh-CN', stage: 'elementary', boardMustReject: true, note: 'board must reject 5th grade' },
  { text: 'CPA counting exercise for young learners', lang: 'en', stage: 'cpa', boardMustReject: true, note: 'board must reject cpa' },
  { text: '小学三年级乘法表练习', lang: 'zh-CN', stage: 'grade 3', boardMustReject: true, note: 'board must reject grade-3' },
  // ---- board 对高中函数题应命中（不拒绝） ----
  { text: '求二次函数 y=x²-4x+3 的顶点与对称轴', lang: 'zh-CN', stage: 'high', boardShouldMatch: 'board_function_graph', note: 'board should accept high-school function' },
  { text: '解析几何：求直线 y=2x+1 与坐标轴围成的三角形面积', lang: 'zh-CN', stage: 'high', boardShouldMatch: 'board_analytic_geometry', note: 'board should accept analytic geometry' },
  // ---- 分数应用题喂给 numberline（不应高分误接） ----
  { text: 'There are 24 apples, 3/4 are eaten, how many eaten?', lang: 'en', avoid: 'numberline', note: 'word problem must not hit numberline compare' },
  { text: '一本书 80 页，读了 25%，读了多少页？', lang: 'zh-CN', avoid: 'numberline', note: 'percent word problem must not hit numberline' },
];


// 输出
const out = {
  meta: {
    generated: new Date().toISOString(),
    langs: LANGS,
    families: ['axis_motion', 'motion', 'numberline', 'bars', 'grid', 'balance', 'geometry', 'function-graph', 'sequence'],
    note: '题目文本为各语种自然表达；expect.answer 为期望答案展示串；params 供独立参考实现验算。',
  },
  problems: P,
  counters: COUNTERS,
};

const outPath = path.join(__dirname, 'multilang-problems.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
console.log('Wrote', outPath);
console.log('problems:', P.length, 'counters:', COUNTERS.length, 'total:', P.length + COUNTERS.length);
