# Multilang i18n Regression Report

Generated: 2026-09-25T08:06:24.164Z

- Total problems: **396**
- Routing pass: **393 / 396** (99.2%)
- Answer pass: **364 / 396** (91.9%)
- Counterexample pass: **29 / 29**
- Regression pass: **2 / 2**

## Per-family / per-language answer pass rate

| card | en | zh-CN | zh-TW | ja | ko | fr | de | es | it | ar | fa |
|---|---|---|---|---|---|---|---|---|---|---|---|
| axis_motion | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| motion | 100% | 100% | 100% | 100% | 100% | 50% | 75% | 50% | 25% | 75% | 50% |
| numberline | 100% | 100% | 75% | 75% | 75% | 50% | 25% | 75% | 75% | 50% | 50% |
| bars | 100% | 100% | 100% | 100% | 100% | 100% | 75% | 100% | 100% | 100% | 100% |
| grid | 100% | 100% | 100% | 75% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| balance | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| geometry | 100% | 100% | 100% | 75% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |
| function-graph | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 75% |
| sequence | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 75% | 100% | 75% | 75% |

## Regressions

- [PASS] sequence term 2026 == 64 (want 64, got 64)
- [PASS] well 10m up3 down2 == 8 days (want 8, got 8)

## Counterexamples

- [PASS] (avoid-family) pure geometry must not hit axis_motion → got {"id":"geometry","score":12}
- [PASS] (avoid-family) 纯几何题不应被 axis_motion 命中 → got {"id":"grid","score":14}
- [PASS] (avoid-family) french geometry should not route to axis_motion → got {"id":"geometry","score":16}
- [PASS] (avoid-family) circle problem should not hit axis_motion → got {"id":"geometry","score":13}
- [PASS] (avoid-family) pure sequence must not hit balance → got {"id":"sequence","score":16}
- [PASS] (avoid-family) 纯数列题不应被 balance 命中 → got {"id":"sequence","score":13}
- [PASS] (avoid-family) pure sequence must not hit motion → got {"id":"sequence","score":13}
- [PASS] (avoid-family) equation must not hit motion → got {"id":"balance","score":4}
- [PASS] (avoid-family) 方程题不应被 motion 命中 → got {"id":"balance","score":12}
- [PASS] (avoid-family) equation must not hit bars → got {"id":"balance","score":11}
- [PASS] (avoid-family) equation must not hit grid → got {"id":"balance","score":12}
- [PASS] (avoid-family) well-climb must not hit geometry → got {"id":"axis_motion","score":16}
- [PASS] (avoid-family) well-climb must not hit geometry → got {"id":"axis_motion","score":16}
- [PASS] (avoid-family) parabola must not hit grid → got {"id":"function-graph","score":16}
- [PASS] (avoid-family) parabola must not hit grid → got {"id":"function-graph","score":15}
- [PASS] (avoid-family) pythagorean must not hit numberline → got {"id":"geometry","score":17}
- [PASS] (avoid-family) pythagorean must not hit numberline → got {"id":"geometry","score":15}
- [PASS] (avoid-family) motion must not hit sequence → got {"id":"motion","score":21}
- [PASS] (avoid-family) motion must not hit sequence → got {"id":"motion","score":17}
- [PASS] (board-reject) board must reject elementary → got null
- [PASS] (board-reject) board must reject grade-2 → got null
- [PASS] (board-reject) board must reject primary → got null
- [PASS] (board-reject) board must reject 5th grade → got null
- [PASS] (board-reject) board must reject cpa → got null
- [PASS] (board-reject) board must reject grade-3 → got null
- [PASS] (board-match) board should accept high-school function → got "board_function_graph"
- [PASS] (board-match) board should accept analytic geometry → got "board_analytic_geometry"
- [PASS] (avoid-family) word problem must not hit numberline compare → got {"id":"bars","score":6}
- [PASS] (avoid-family) percent word problem must not hit numberline → got {"id":"bars","score":11}

## Failure list (34)

- {"card":"motion","lang":"fr","tag":"meet","text":" Deux voitures partent de deux villes distantes de 120 km, l","routing":"motion","answer":"NOT_ELIGIBLE:extract_failed","narr":[]}
- {"card":"motion","lang":"es","tag":"meet","text":"Dos coches salen de dos pueblos distantes 120 km, uno hacia ","routing":"motion","answer":"NOT_ELIGIBLE:extract_failed","narr":[]}
- {"card":"motion","lang":"it","tag":"meet","text":"Due partenze partono da due città distanti 120 km, una verso","routing":"motion","answer":"NOT_ELIGIBLE:extract_failed","narr":[]}
- {"card":"motion","lang":"fa","tag":"meet","text":"دو خودرو از دو شهر به فاصله 120 کیلومتر حرکت می‌کنند و با سر","routing":"motion","answer":"NOT_ELIGIBLE:extract_failed","narr":[]}
- {"card":"motion","lang":"de","tag":"chase","text":"Ein Motorradfahrer ist 30 km hinter einem Radfahrer und fähr","routing":"motion","answer":"NOT_ELIGIBLE:extract_failed","narr":[]}
- {"card":"motion","lang":"it","tag":"away","text":"Due amici partono dallo stesso punto allontanandosi l'uno da","routing":"motion","answer":"NOT_ELIGIBLE:extract_failed","narr":[]}
- {"card":"motion","lang":"ar","tag":"away","text":"يبدأ صديقان من النقطة نفسها ويسيران في اتجاهين متعاكسين، أحد","routing":"motion","answer":"NOT_ELIGIBLE:extract_failed","narr":[]}
- {"card":"motion","lang":"fr","tag":"meet","text":" Deux villes sont distantes de 150 km. Une voiture part de l","routing":"motion","answer":"NOT_ELIGIBLE:extract_failed","narr":[]}
- {"card":"motion","lang":"es","tag":"meet","text":"Dos pueblos distan 150 km. Un coche sale de uno a 60 km/h y ","routing":"motion","answer":"NOT_ELIGIBLE:extract_failed","narr":[]}
- {"card":"motion","lang":"it","tag":"meet","text":"Due città distano 150 km. Un'auto parte da una a 60 km/h, un","routing":"motion","answer":"NOT_ELIGIBLE:extract_failed","narr":[]}
- {"card":"motion","lang":"fa","tag":"meet","text":"دو شهر 150 کیلومتر از هم فاصله دارند. خودرویی با سرعت 60 کیل","routing":"motion","answer":"NOT_ELIGIBLE:extract_failed","narr":[]}
- {"card":"numberline","lang":"de","tag":"jump-neg-start","text":"Auf einem Zahlenstrahl beginnt ein Frosch bei -3 und springt","routing":"numberline","answer":"NOT_ELIGIBLE:extract_failed","narr":[]}
- {"card":"numberline","lang":"ar","tag":"jump-neg-start","text":"على خط الأعداد، تبدأ الضفدع من -3 وتقفز 5 خانات إلى اليمين. ","routing":"numberline","answer":"NOT_ELIGIBLE:extract_failed","narr":[]}
- {"card":"numberline","lang":"fr","tag":"jump-left","text":"Un lapin part de 4 sur la droite numérique et saute de 6 cas","routing":"numberline","answer":"10","narr":[]}
- {"card":"numberline","lang":"de","tag":"jump-left","text":"Ein Hase startet bei 4 auf dem Zahlenstrahl und hüpft 6 Feld","routing":"numberline","answer":"NOT_ELIGIBLE:extract_failed","narr":[]}
- {"card":"numberline","lang":"fa","tag":"jump-left","text":"خرگوشی از 4 روی محور اعداد شروع می‌کند و 6 قدم به چپ می‌پردا","routing":"numberline","answer":"NOT_ELIGIBLE:extract_failed","narr":[]}
- {"card":"numberline","lang":"zh-TW","tag":"fraction-equal","text":"比較 1/2 和 2/4，它們相等嗎，還是有一個比較大？","routing":"numberline","answer":"一樣大","narr":[]}
- {"card":"numberline","lang":"ja","tag":"fraction-equal","text":"1/2 と 2/4 を比べなさい。等しいですか、それともどちらかが大きいですか？","routing":"numberline","answer":"同じ大きさ","narr":[]}
- {"card":"numberline","lang":"ko","tag":"fraction-equal","text":"1/2와 2/4를 비교하세요. 같습니까, 아니면 어느 쪽이 더 큽니까?","routing":"numberline","answer":"같음","narr":[]}
- {"card":"numberline","lang":"fr","tag":"fraction-equal","text":"Comparez 1/2 et 2/4. Sont-ils égaux ou l'un est-il plus gran","routing":"numberline","answer":"Ils sont égaux","narr":[]}
- {"card":"numberline","lang":"de","tag":"fraction-equal","text":"Vergleiche 1/2 und 2/4. Sind sie gleich oder ist einer größe","routing":"numberline","answer":"Sie sind gleich","narr":[]}
- {"card":"numberline","lang":"es","tag":"fraction-equal","text":"Compara 1/2 y 2/4. ¿Son iguales o uno es mayor?","routing":"numberline","answer":"Son iguales","narr":[]}
- {"card":"numberline","lang":"it","tag":"fraction-equal","text":"Confronta 1/2 e 2/4. Sono uguali o uno è maggiore?","routing":"numberline","answer":"Sono uguali","narr":[]}
- {"card":"numberline","lang":"ar","tag":"fraction-equal","text":"قارن بين 1/2 و 2/4. هل هما متساويان أم أن أحدهما أكبر؟","routing":"numberline","answer":"متساويان","narr":[]}
- {"card":"numberline","lang":"fa","tag":"fraction-equal","text":"1/2 و 2/4 را مقایسه کنید. آیا برابرند یا یکی بزرگ‌تر است؟","routing":"numberline","answer":"برابرند","narr":[]}
- {"card":"bars","lang":"ja","tag":"percent","text":"本が80ページあります。太郎はその25%を読みました。何ページ読みましたか？","routing":"bars","answer":"20","narr":["hasChinese:一部 = 80 × 25% = 80 × 0.25 = 20。"]}
- {"card":"bars","lang":"de","tag":"multiple","text":"Die Summe zweier Zahlen ist 36. Die größere Zahl ist dreimal","routing":"bars","answer":"NOT_ELIGIBLE:extract_failed","narr":[]}
- {"card":"bars","lang":"ar","tag":"multiple","text":"مجموع عددين هو 36. العدد الأكبر يساوي 3 أضعاف العدد الأصغر. ","routing":"numberline","answer":"9","narr":[]}
- {"card":"grid","lang":"ja","tag":"array","text":"星が5行に並んでいて、1行に6個あります。星は全部でいくつですか？","routing":"bars","answer":"5","narr":[]}
- {"card":"geometry","lang":"ja","tag":"circle-area","text":"半径5 cmの円の面積を求めなさい（π=3.14）。","routing":"grid","answer":"NOT_ELIGIBLE:extract_failed","narr":[]}
- {"card":"function-graph","lang":"fa","tag":"linear-points","text":"خطی از نقاط (0,1) و (2,5) می‌گذرد. معادله آن را پیدا کنید.","routing":"function-graph","answer":"NOT_ELIGIBLE:extract_failed","narr":[]}
- {"card":"sequence","lang":"es","tag":"boundary-n1","text":"En la secuencia 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, ... el número ","routing":"sequence","answer":"NOT_ELIGIBLE:extract_failed","narr":[]}
- {"card":"sequence","lang":"ar","tag":"n10","text":"اكتشف النمط: 1، 2، 2، 3، 3، 3، 4، 4، 4، 4، ... حيث يتكرر n ب","routing":"sequence","answer":"NOT_ELIGIBLE:extract_failed","narr":[]}
- {"card":"sequence","lang":"fa","tag":"n10","text":"الگو را پیدا کنید: 1، 2، 2، 3، 3، 3، 4، 4، 4، 4، ... که در آ","routing":"sequence","answer":"NOT_ELIGIBLE:extract_failed","narr":[]}
