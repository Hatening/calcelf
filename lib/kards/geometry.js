// lib/kards/geometry.js — 几何族知识卡（11 语种版）
// 承载：三角形/矩形/正方形/圆的周长面积、三角形内角、余角补角、勾股定理
// CPA：具象(围栏/地砖/钟表/梯子) → 图示(Canvas path 多边形+角度边长标注) → 抽象(公式/算式)
'use strict';
const i18n = require('./i18n');

i18n.register('geometry', {
  en: {
    _keywords: ['perimeter','area','rectangle','square','triangle','circle','radius','angle','supplement','complement','hypotenuse','pythagorean','diameter','base','height','right angle'],
    f_rect_perim: "2×(l+w) = 2×({a}+{b}) = {ans}{u}",
    f_rect_area: "l×w = {a}×{b} = {ans}{u}",
    f_sq_perim: "4×s = 4×{s} = {ans}{u}",
    f_sq_area: "s×s = {s}×{s} = {ans}{u}",
    f_tri_area: "b×h÷2 = {a}×{h}÷2 = {ans}{u}",
    f_circle_circ: "2πr = 2×3.14×{r} ≈ {ans}{u}",
    f_circle_area: "πr² = 3.14×{r}×{r} ≈ {ans}{u}",
    f_tri_angle: "180° − {a}° − {b}° = {ans}°",
    f_supp: "180° − {g}° = {ans}°",
    f_comp: "90° − {g}° = {ans}°",
    f_pyth: "a²+b² = {a}²+{b}² = {a2}+{b2} = {sum}, c = √{sum} ≈ {c}{u}",
    n_rect_perim_1: "A rectangular garden needs a fence all around.",
    n_rect_perim_2: "Length {a}{u}, width {b}{u}; measure all four sides.",
    n_rect_area_1: "A rectangle floor to tile.",
    n_rect_area_2: "{a} tiles per row, {b} rows.",
    n_sq_perim_1: "A square flower bed needs a border.",
    n_sq_perim_2: "All 4 sides are equal, each {s}{u}.",
    n_sq_area_1: "A square floor to tile.",
    n_sq_area_2: "{s} tiles per row, {s} rows.",
    n_tri_area_1: "A triangular sandbox to fill.",
    n_tri_area_2: "Double the triangle into a rectangle; the triangle is half.",
    n_circle_circ_1: "Walking all the way around a circular garden.",
    n_circle_circ_2: "Radius {r}{u}; trace the circle once.",
    n_circle_area_1: "Covering a round tabletop.",
    n_circle_area_2: "Radius {r}{u}; fill the whole disk.",
    n_tri_angle_1: "The three angles of a triangle make a straight line (180°).",
    n_tri_angle_2: "Given two angles {a}° and {b}°.",
    n_supp_1: "Two angles together make a straight angle (180°).",
    n_supp_2: "One angle is {g}°.",
    n_comp_1: "Two angles together make a right angle (90°).",
    n_comp_2: "One angle is {g}°.",
    n_pyth_1: "A ladder leans against a wall; find its length.",
    n_pyth_2: "Vertical leg {a}{u}, horizontal leg {b}{u}, right angle between them.",
    beat_concrete: "See it", beat_shape: "Draw it", beat_formula: "Formula",
  },
  'zh-CN': {
    _keywords: ['长方形','矩形','正方形','三角形','圆','周长','面积','内角','余角','补角','直角','勾股','斜边','边长','半径','直径','底','高'],
    f_rect_perim: "2×(长+宽) = 2×({a}+{b}) = {ans}{u}",
    f_rect_area: "长×宽 = {a}×{b} = {ans}{u}",
    f_sq_perim: "4×边长 = 4×{s} = {ans}{u}",
    f_sq_area: "边长×边长 = {s}×{s} = {ans}{u}",
    f_tri_area: "底×高÷2 = {a}×{h}÷2 = {ans}{u}",
    f_circle_circ: "2πr = 2×3.14×{r} ≈ {ans}{u}",
    f_circle_area: "πr² = 3.14×{r}×{r} ≈ {ans}{u}",
    f_tri_angle: "180° − {a}° − {b}° = {ans}°",
    f_supp: "180° − {g}° = {ans}°",
    f_comp: "90° − {g}° = {ans}°",
    f_pyth: "a²+b² = {a}²+{b}² = {a2}+{b2} = {sum}，c = √{sum} ≈ {c}{u}",
    n_rect_perim_1: "一块长方形菜地，四周围上围栏。",
    n_rect_perim_2: "长 {a}{u}，宽 {b}{u}，四条边依次量一圈。",
    n_rect_area_1: "长方形地面铺满地砖。",
    n_rect_area_2: "每排 {a} 块，共 {b} 排。",
    n_sq_perim_1: "正方形花坛围边。",
    n_sq_perim_2: "四条边都相等，每条 {s}{u}。",
    n_sq_area_1: "正方形地面铺满地砖。",
    n_sq_area_2: "每排 {s} 块，共 {s} 排。",
    n_tri_area_1: "三角形沙坑的地面要填平。",
    n_tri_area_2: "把三角形补成一个长方形，三角形占一半。",
    n_circle_circ_1: "绕圆形花坛走一圈。",
    n_circle_circ_2: "半径 {r}{u}，描出圆的一周。",
    n_circle_area_1: "给圆形桌面铺桌布。",
    n_circle_area_2: "半径 {r}{u}，把圆面铺满。",
    n_tri_angle_1: "三角形三个角拼在一起是一条直线（180°）。",
    n_tri_angle_2: "已知两个角 {a}°、{b}°。",
    n_supp_1: "两个角拼成一个平角（一条直线，180°）。",
    n_supp_2: "已知一个角 {g}°。",
    n_comp_1: "两个角拼成一个直角（90°）。",
    n_comp_2: "已知一个角 {g}°。",
    n_pyth_1: "一架梯子斜靠墙上，求梯子长度。",
    n_pyth_2: "竖直边 {a}{u}，水平边 {b}{u}，夹角是直角。",
    beat_concrete: "具象", beat_shape: "看图", beat_formula: "列式",
  },
  'zh-TW': {
    _keywords: ['長方形','矩形','正方形','三角形','圓','周長','面積','內角','餘角','補角','直角','勾股','斜邊','邊長','半徑','直徑','底','高'],
    f_rect_perim: "2×(長+寬) = 2×({a}+{b}) = {ans}{u}",
    f_rect_area: "長×寬 = {a}×{b} = {ans}{u}",
    f_sq_perim: "4×邊長 = 4×{s} = {ans}{u}",
    f_sq_area: "邊長×邊長 = {s}×{s} = {ans}{u}",
    f_tri_area: "底×高÷2 = {a}×{h}÷2 = {ans}{u}",
    f_circle_circ: "2πr = 2×3.14×{r} ≈ {ans}{u}",
    f_circle_area: "πr² = 3.14×{r}×{r} ≈ {ans}{u}",
    f_tri_angle: "180° − {a}° − {b}° = {ans}°",
    f_supp: "180° − {g}° = {ans}°",
    f_comp: "90° − {g}° = {ans}°",
    f_pyth: "a²+b² = {a}²+{b}² = {a2}+{b2} = {sum}，c = √{sum} ≈ {c}{u}",
    n_rect_perim_1: "一塊長方形菜地，四周圍上圍欄。",
    n_rect_perim_2: "長 {a}{u}，寬 {b}{u}，四條邊依次量一圈。",
    n_rect_area_1: "長方形地面鋪滿地磚。",
    n_rect_area_2: "每排 {a} 塊，共 {b} 排。",
    n_sq_perim_1: "正方形花壇圍邊。",
    n_sq_perim_2: "四條邊都相等，每條 {s}{u}。",
    n_sq_area_1: "正方形地面鋪滿地磚。",
    n_sq_area_2: "每排 {s} 塊，共 {s} 排。",
    n_tri_area_1: "三角形沙坑的地面要填平。",
    n_tri_area_2: "把三角形補成一個長方形，三角形占一半。",
    n_circle_circ_1: "繞圓形花壇走一圈。",
    n_circle_circ_2: "半徑 {r}{u}，描出圓的一週。",
    n_circle_area_1: "給圓形桌面鋪桌布。",
    n_circle_area_2: "半徑 {r}{u}，把圓面鋪滿。",
    n_tri_angle_1: "三角形三個角拼在一起是一條直線（180°）。",
    n_tri_angle_2: "已知兩個角 {a}°、{b}°。",
    n_supp_1: "兩個角拼成一個平角（一條直線，180°）。",
    n_supp_2: "已知一個角 {g}°。",
    n_comp_1: "兩個角拼成一個直角（90°）。",
    n_comp_2: "已知一個角 {g}°。",
    n_pyth_1: "一架梯子斜靠牆上，求梯子長度。",
    n_pyth_2: "鉛直邊 {a}{u}，水平邊 {b}{u}，夾角是直角。",
    beat_concrete: "具象", beat_shape: "看圖", beat_formula: "列式",
  },
  ja: {
    _keywords: ['三角形','長方形','正方形','円','周り','面積','内角','余角','補角','直角','三平方','斜辺','辺','半径','直径','底辺','高さ'],
    f_rect_perim: "2×(たて+よこ) = 2×({a}+{b}) = {ans}{u}",
    f_rect_area: "よこ×たて = {a}×{b} = {ans}{u}",
    f_sq_perim: "4×辺 = 4×{s} = {ans}{u}",
    f_sq_area: "辺×辺 = {s}×{s} = {ans}{u}",
    f_tri_area: "底辺×高さ÷2 = {a}×{h}÷2 = {ans}{u}",
    f_circle_circ: "2πr = 2×3.14×{r} ≈ {ans}{u}",
    f_circle_area: "πr² = 3.14×{r}×{r} ≈ {ans}{u}",
    f_tri_angle: "180° − {a}° − {b}° = {ans}°",
    f_supp: "180° − {g}° = {ans}°",
    f_comp: "90° − {g}° = {ans}°",
    f_pyth: "a²+b² = {a}²+{b}² = {a2}+{b2} = {sum}, c = √{sum} ≈ {c}{u}",
    n_rect_perim_1: "長方形の花壇の周りにフェンスを張ります。",
    n_rect_perim_2: "たて {a}{u}、よこ {b}{u}。四辺をぐるりと測ります。",
    n_rect_area_1: "長方形の床にタイルを敷き詰めます。",
    n_rect_area_2: "1列に {a} 枚、{b} 列分です。",
    n_sq_perim_1: "正方形の花壇の縁を囲みます。",
    n_sq_perim_2: "4辺すべて等しく、1辺 {s}{u} です。",
    n_sq_area_1: "正方形の床にタイルを敷き詰めます。",
    n_sq_area_2: "1列に {s} 枚、{s} 列分です。",
    n_tri_area_1: "三角形の砂場の面積を求めます。",
    n_tri_area_2: "三角形を2つで長方形にすると、三角形は半分です。",
    n_circle_circ_1: "円形の花壇の周りを一周します。",
    n_circle_circ_2: "半径 {r}{u}。円を一周なぞります。",
    n_circle_area_1: "円形のテーブルに布をかけます。",
    n_circle_area_2: "半径 {r}{u}。円盤全体を埋めます。",
    n_tri_angle_1: "三角形の3つの角を合わせると一直線（180°）になります。",
    n_tri_angle_2: "2つの角 {a}°、{b}° が分かっています。",
    n_supp_1: "2つの角を合わせると平角（一直線、180°）になります。",
    n_supp_2: "一方の角は {g}° です。",
    n_comp_1: "2つの角を合わせると直角（90°）になります。",
    n_comp_2: "一方の角は {g}° です。",
    n_pyth_1: "はしごが壁に斜めにかかっています。長さを求めます。",
    n_pyth_2: "鉛直辺 {a}{u}、水平辺 {b}{u}、間は直角です。",
    beat_concrete: "具象", beat_shape: "図をかく", beat_formula: "式を立てる",
  },
  ko: {
    _keywords: ['삼각형','직사각형','정사각형','원','둘레','넓이','내각','여각','보각','직각','피타고라스','빗변','변','반지름','지름','밑변','높이'],
    f_rect_perim: "2×(가로+세로) = 2×({a}+{b}) = {ans}{u}",
    f_rect_area: "가로×세로 = {a}×{b} = {ans}{u}",
    f_sq_perim: "4×변 = 4×{s} = {ans}{u}",
    f_sq_area: "변×변 = {s}×{s} = {ans}{u}",
    f_tri_area: "밑변×높이÷2 = {a}×{h}÷2 = {ans}{u}",
    f_circle_circ: "2πr = 2×3.14×{r} ≈ {ans}{u}",
    f_circle_area: "πr² = 3.14×{r}×{r} ≈ {ans}{u}",
    f_tri_angle: "180° − {a}° − {b}° = {ans}°",
    f_supp: "180° − {g}° = {ans}°",
    f_comp: "90° − {g}° = {ans}°",
    f_pyth: "a²+b² = {a}²+{b}² = {a2}+{b2} = {sum}, c = √{sum} ≈ {c}{u}",
    n_rect_perim_1: "직사각형 밭 둘레에 울타리를 칩니다.",
    n_rect_perim_2: "가로 {a}{u}, 세로 {b}{u}; 네 변을 한 바퀴 잽니다.",
    n_rect_area_1: "직사각형 바닥에 타일을 깝니다.",
    n_rect_area_2: "한 줄에 {a}개씩, {b}줄입니다.",
    n_sq_perim_1: "정사각형 화단 둘레를 둘러줍니다.",
    n_sq_perim_2: "네 변은 모두 같고, 한 변은 {s}{u}입니다.",
    n_sq_area_1: "정사각형 바닥에 타일을 깝니다.",
    n_sq_area_2: "한 줄에 {s}개씩, {s}줄입니다.",
    n_tri_area_1: "삼각형 모래밭의 넓이를 구합니다.",
    n_tri_area_2: "삼각형을 두 개 붙여 직사각형으로 만들면 절반입니다.",
    n_circle_circ_1: "원형 화단을 한 바퀴 돕니다.",
    n_circle_circ_2: "반지름 {r}{u}; 원을 한 바퀴 그립니다.",
    n_circle_area_1: "원형 탁자를 덮습니다.",
    n_circle_area_2: "반지름 {r}{u}; 원판 전체를 채웁니다.",
    n_tri_angle_1: "삼각형의 세 각을 합치면 한 직선(180°)이 됩니다.",
    n_tri_angle_2: "두 각 {a}°와 {b}°가 주어졌어요.",
    n_supp_1: "두 각을 합치면 평각(한 직선, 180°)이 됩니다.",
    n_supp_2: "한 각은 {g}°입니다.",
    n_comp_1: "두 각을 합치면 직각(90°)이 됩니다.",
    n_comp_2: "한 각은 {g}°입니다.",
    n_pyth_1: "사다리가 벽에 비스듬히 기대어 있어요. 길이를 구해요.",
    n_pyth_2: "세로변 {a}{u}, 가로변 {b}{u}, 사이는 직각이에요.",
    beat_concrete: "구체적", beat_shape: "그리기", beat_formula: "식 세우기",
  },
  fr: {
    _keywords: ['triangle','rectangle','carré','cercle','périmètre','aire','angle','supplément','complément','hypoténuse','rayon','diamètre','base','hauteur','angle droit'],
    f_rect_perim: "2×(L+l) = 2×({a}+{b}) = {ans}{u}",
    f_rect_area: "L×l = {a}×{b} = {ans}{u}",
    f_sq_perim: "4×c = 4×{s} = {ans}{u}",
    f_sq_area: "c×c = {s}×{s} = {ans}{u}",
    f_tri_area: "b×h÷2 = {a}×{h}÷2 = {ans}{u}",
    f_circle_circ: "2πr = 2×3.14×{r} ≈ {ans}{u}",
    f_circle_area: "πr² = 3.14×{r}×{r} ≈ {ans}{u}",
    f_tri_angle: "180° − {a}° − {b}° = {ans}°",
    f_supp: "180° − {g}° = {ans}°",
    f_comp: "90° − {g}° = {ans}°",
    f_pyth: "a²+b² = {a}²+{b}² = {a2}+{b2} = {sum}, c = √{sum} ≈ {c}{u}",
    n_rect_perim_1: "Un jardin rectangulaire a besoin d'une clôture tout autour.",
    n_rect_perim_2: "Longueur {a}{u}, largeur {b}{u} ; mesurons les quatre côtés.",
    n_rect_area_1: "Un sol rectangulaire à carreler.",
    n_rect_area_2: "{a} carreaux par rangée, {b} rangées.",
    n_sq_perim_1: "Un parterre carré a besoin d'une bordure.",
    n_sq_perim_2: "Les 4 côtés sont égaux, chacun {s}{u}.",
    n_sq_area_1: "Un sol carré à carreler.",
    n_sq_area_2: "{s} carreaux par rangée, {s} rangées.",
    n_tri_area_1: "Un bac à sable triangulaire à remplir.",
    n_tri_area_2: "Double le triangle en rectangle ; le triangle en est la moitié.",
    n_circle_circ_1: "Faire le tour d'un jardin circulaire.",
    n_circle_circ_2: "Rayon {r}{u} ; trace le cercle une fois.",
    n_circle_area_1: "Couvrir une table ronde.",
    n_circle_area_2: "Rayon {r}{u} ; remplis tout le disque.",
    n_tri_angle_1: "Les trois angles d'un triangle forment une ligne droite (180°).",
    n_tri_angle_2: "On donne deux angles {a}° et {b}°.",
    n_supp_1: "Deux angles forment un angle plat (une ligne droite, 180°).",
    n_supp_2: "Un angle vaut {g}°.",
    n_comp_1: "Deux angles forment un angle droit (90°).",
    n_comp_2: "Un angle vaut {g}°.",
    n_pyth_1: "Une échelle est appuyée contre un mur ; trouve sa longueur.",
    n_pyth_2: "Côté vertical {a}{u}, côté horizontal {b}{u}, angle droit entre eux.",
    beat_concrete: "Concret", beat_shape: "Dessiner", beat_formula: "Formule",
  },
  de: {
    _keywords: ['dreieck','rechteck','quadrat','kreis','umfang','fläche','winkel','ergänzungswinkel','komplement','hypotenuse','radius','durchmesser','grundseite','höhe','rechter winkel'],
    f_rect_perim: "2×(l+b) = 2×({a}+{b}) = {ans}{u}",
    f_rect_area: "l×b = {a}×{b} = {ans}{u}",
    f_sq_perim: "4×a = 4×{s} = {ans}{u}",
    f_sq_area: "a×a = {s}×{s} = {ans}{u}",
    f_tri_area: "g×h÷2 = {a}×{h}÷2 = {ans}{u}",
    f_circle_circ: "2πr = 2×3.14×{r} ≈ {ans}{u}",
    f_circle_area: "πr² = 3.14×{r}×{r} ≈ {ans}{u}",
    f_tri_angle: "180° − {a}° − {b}° = {ans}°",
    f_supp: "180° − {g}° = {ans}°",
    f_comp: "90° − {g}° = {ans}°",
    f_pyth: "a²+b² = {a}²+{b}² = {a2}+{b2} = {sum}, c = √{sum} ≈ {c}{u}",
    n_rect_perim_1: "Ein rechteckiges Beet braucht einen Zaun rundherum.",
    n_rect_perim_2: "Länge {a}{u}, Breite {b}{u}; miss alle vier Seiten.",
    n_rect_area_1: "Ein rechteckiger Boden wird gefliest.",
    n_rect_area_2: "{a} Fliesen pro Reihe, {b} Reihen.",
    n_sq_perim_1: "Ein quadratisches Blumenbeet bekommt einen Rand.",
    n_sq_perim_2: "Alle 4 Seiten sind gleich, jede {s}{u}.",
    n_sq_area_1: "Ein quadratischer Boden wird gefliest.",
    n_sq_area_2: "{s} Fliesen pro Reihe, {s} Reihen.",
    n_tri_area_1: "Eine dreieckige Sandkiste wird gefüllt.",
    n_tri_area_2: "Verdopple das Dreieck zum Rechteck; das Dreieck ist die Hälfte.",
    n_circle_circ_1: "Einmal um einen kreisförmigen Garten herumgehen.",
    n_circle_circ_2: "Radius {r}{u}; ziehe den Kreis einmal nach.",
    n_circle_area_1: "Einen runden Tisch bedecken.",
    n_circle_area_2: "Radius {r}{u}; fülle die ganze Scheibe.",
    n_tri_angle_1: "Die drei Winkel eines Dreiecks ergeben eine Gerade (180°).",
    n_tri_angle_2: "Gegeben sind zwei Winkel {a}° und {b}°.",
    n_supp_1: "Zwei Winkel zusammen geben einen gestreckten Winkel (180°).",
    n_supp_2: "Ein Winkel ist {g}°.",
    n_comp_1: "Zwei Winkel zusammen ergeben einen rechten Winkel (90°).",
    n_comp_2: "Ein Winkel ist {g}°.",
    n_pyth_1: "Eine Leiter lehnt an einer Wand; finde ihre Länge.",
    n_pyth_2: "Senkrechte Seite {a}{u}, waagerechte Seite {b}{u}, dazwischen rechter Winkel.",
    beat_concrete: "Anschauen", beat_shape: "Zeichnen", beat_formula: "Formel",
  },
  es: {
    _keywords: ['triángulo','rectángulo','cuadrado','círculo','perímetro','área','ángulo','suplemento','complemento','hipotenusa','radio','diámetro','base','altura','ángulo recto'],
    f_rect_perim: "2×(l+w) = 2×({a}+{b}) = {ans}{u}",
    f_rect_area: "l×w = {a}×{b} = {ans}{u}",
    f_sq_perim: "4×l = 4×{s} = {ans}{u}",
    f_sq_area: "l×l = {s}×{s} = {ans}{u}",
    f_tri_area: "b×h÷2 = {a}×{h}÷2 = {ans}{u}",
    f_circle_circ: "2πr = 2×3.14×{r} ≈ {ans}{u}",
    f_circle_area: "πr² = 3.14×{r}×{r} ≈ {ans}{u}",
    f_tri_angle: "180° − {a}° − {b}° = {ans}°",
    f_supp: "180° − {g}° = {ans}°",
    f_comp: "90° − {g}° = {ans}°",
    f_pyth: "a²+b² = {a}²+{b}² = {a2}+{b2} = {sum}, c = √{sum} ≈ {c}{u}",
    n_rect_perim_1: "Un jardín rectangular necesita una cerca alrededor.",
    n_rect_perim_2: "Largo {a}{u}, ancho {b}{u}; mide los cuatro lados.",
    n_rect_area_1: "Un suelo rectangular para embaldosar.",
    n_rect_area_2: "{a} baldosas por fila, {b} filas.",
    n_sq_perim_1: "Un cantero cuadrado lleva un borde.",
    n_sq_perim_2: "Los 4 lados son iguales, cada uno {s}{u}.",
    n_sq_area_1: "Un suelo cuadrado para embaldosar.",
    n_sq_area_2: "{s} baldosas por fila, {s} filas.",
    n_tri_area_1: "Un arenero triangular que llenar.",
    n_tri_area_2: "Dobla el triángulo hasta formar un rectángulo; el triángulo es la mitad.",
    n_circle_circ_1: "Dar la vuelta a un jardín circular.",
    n_circle_circ_2: "Radio {r}{u}; traza el círculo una vez.",
    n_circle_area_1: "Cubrir una mesa redonda.",
    n_circle_area_2: "Radio {r}{u}; llena todo el disco.",
    n_tri_angle_1: "Los tres ángulos de un triángulo forman una línea recta (180°).",
    n_tri_angle_2: "Dados dos ángulos {a}° y {b}°.",
    n_supp_1: "Dos ángulos juntos forman un llano (una línea recta, 180°).",
    n_supp_2: "Un ángulo mide {g}°.",
    n_comp_1: "Dos ángulos juntos forman un recto (90°).",
    n_comp_2: "Un ángulo mide {g}°.",
    n_pyth_1: "Una escalera está apoyada contra una pared; halla su longitud.",
    n_pyth_2: "Cateto vertical {a}{u}, cateto horizontal {b}{u}, ángulo recto entre ellos.",
    beat_concrete: "Verlo", beat_shape: "Dibujar", beat_formula: "Fórmula",
  },
  it: {
    _keywords: ['triangolo','rettangolo','quadrato','cerchio','perimetro','area','angolo','supplementare','complementare','ipotenusa','raggio','diametro','base','altezza','angolo retto'],
    f_rect_perim: "2×(l+w) = 2×({a}+{b}) = {ans}{u}",
    f_rect_area: "l×w = {a}×{b} = {ans}{u}",
    f_sq_perim: "4×lato = 4×{s} = {ans}{u}",
    f_sq_area: "lato×lato = {s}×{s} = {ans}{u}",
    f_tri_area: "base×h÷2 = {a}×{h}÷2 = {ans}{u}",
    f_circle_circ: "2πr = 2×3.14×{r} ≈ {ans}{u}",
    f_circle_area: "πr² = 3.14×{r}×{r} ≈ {ans}{u}",
    f_tri_angle: "180° − {a}° − {b}° = {ans}°",
    f_supp: "180° − {g}° = {ans}°",
    f_comp: "90° − {g}° = {ans}°",
    f_pyth: "a²+b² = {a}²+{b}² = {a2}+{b2} = {sum}, c = √{sum} ≈ {c}{u}",
    n_rect_perim_1: "Un'aiuola rettangolare necessita di una recinzione intorno.",
    n_rect_perim_2: "Lunghezza {a}{u}, larghezza {b}{u}; misura i quattro lati.",
    n_rect_area_1: "Un pavimento rettangolare da piastrellare.",
    n_rect_area_2: "{a} piastrelle per fila, {b} file.",
    n_sq_perim_1: "Un'aiuola quadrata con un bordo.",
    n_sq_perim_2: "I 4 lati sono uguali, ciascuno {s}{u}.",
    n_sq_area_1: "Un pavimento quadrato da piastrellare.",
    n_sq_area_2: "{s} piastrelle per fila, {s} file.",
    n_tri_area_1: "Una sabbiera triangolare da riempire.",
    n_tri_area_2: "Raddoppia il triangolo in un rettangolo; il triangolo è metà.",
    n_circle_circ_1: "Fare il giro di un giardino circolare.",
    n_circle_circ_2: "Raggio {r}{u}; traccia il cerchio una volta.",
    n_circle_area_1: "Coprire un tavolo rotondo.",
    n_circle_area_2: "Raggio {r}{u}; riempi tutto il disco.",
    n_tri_angle_1: "I tre angoli di un triangolo formano una retta (180°).",
    n_tri_angle_2: "Dati due angoli {a}° e {b}°.",
    n_supp_1: "Due angoli insieme formano un angolo piatto (una retta, 180°).",
    n_supp_2: "Un angolo vale {g}°.",
    n_comp_1: "Due angoli insieme formano un retto (90°).",
    n_comp_2: "Un angolo vale {g}°.",
    n_pyth_1: "Una scala è appoggiata a un muro; trova la sua lunghezza.",
    n_pyth_2: "Cateto verticale {a}{u}, cateto orizzontale {b}{u}, angolo retto in mezzo.",
    beat_concrete: "Vedere", beat_shape: "Disegnare", beat_formula: "Formula",
  },
  ar: {
    _keywords: ['مثلث','مستطيل','مربع','دائرة','محيط','مساحة','زاوية','زاوية متكاملة','زاوية متممة','وتر','نصف القطر','قطر','قاعدة','ارتفاع','زاوية قائمة','ضلع'],
    f_rect_perim: "2×(طول+عرض) = 2×({a}+{b}) = {ans}{u}",
    f_rect_area: "طول×عرض = {a}×{b} = {ans}{u}",
    f_sq_perim: "4×ضلع = 4×{s} = {ans}{u}",
    f_sq_area: "ضلع×ضلع = {s}×{s} = {ans}{u}",
    f_tri_area: "قاعدة×ارتفاع÷2 = {a}×{h}÷2 = {ans}{u}",
    f_circle_circ: "2πr = 2×3.14×{r} ≈ {ans}{u}",
    f_circle_area: "πr² = 3.14×{r}×{r} ≈ {ans}{u}",
    f_tri_angle: "180° − {a}° − {b}° = {ans}°",
    f_supp: "180° − {g}° = {ans}°",
    f_comp: "90° − {g}° = {ans}°",
    f_pyth: "a²+b² = {a}²+{b}² = {a2}+{b2} = {sum}، c = √{sum} ≈ {c}{u}",
    n_rect_perim_1: "حديقة مستطيلة تحتاج إلى سياج حولها.",
    n_rect_perim_2: "الطول {a}{u}، العرض {b}{u}; نقيس الأضلاع الأربعة.",
    n_rect_area_1: "أرضية مستطيلة نغطيها بالبلاط.",
    n_rect_area_2: "{a} بلاطة في كل صف، و{b} صفوف.",
    n_sq_perim_1: "فراش زهري مربع يحتاج إلى حافة.",
    n_sq_perim_2: "الأضلاع الأربعة متساوية، طول كل منها {s}{u}.",
    n_sq_area_1: "أرضية مربعة نغطيها بالبلاط.",
    n_sq_area_2: "{s} بلاطة في كل صف، و{s} صفوف.",
    n_tri_area_1: "مثلث رملي نريد مساحته.",
    n_tri_area_2: "نضاعف المثلث ليصبح مستطيلاً؛ فيكون المثلث نصفه.",
    n_circle_circ_1: "نطوف حول حديقة دائرية.",
    n_circle_circ_2: "نصف القطر {r}{u}; نرسم الدائرة مرة.",
    n_circle_area_1: "نغطي طاولة مستديرة.",
    n_circle_area_2: "نصف القطر {r}{u}; نملأ القرص كاملاً.",
    n_tri_angle_1: "زوايا المثلث الثلاث تكوّن خطاً مستقيماً (180°).",
    n_tri_angle_2: "نعلمنا زاويتان هما {a}° و{b}°.",
    n_supp_1: "زاويتان معاً تكوّنان زاوية مستقيمة (خط مستقيم، 180°).",
    n_supp_2: "إحداهما تساوي {g}°.",
    n_comp_1: "زاويتان معاً تكوّنان زاوية قائمة (90°).",
    n_comp_2: "إحداهما تساوي {g}°.",
    n_pyth_1: "سلم مستند إلى جدار؛ نجد طوله.",
    n_pyth_2: "الضلع الرأسي {a}{u}، الضلع الأفقي {b}{u}، وبينهما زاوية قائمة.",
    beat_concrete: "عاين", beat_shape: "ارسم", beat_formula: "المعادلة",
  },
  fa: {
    _keywords: ['مثلث','مستطیل','مربع','دایره','محیط','مساحت','زاویه','زاویه متمم','زاویه مکمل','وتر','شعاع','قطر','قاعده','ارتفاع','زاویه قائمه','ضلع'],
    f_rect_perim: "2×(طول+عرض) = 2×({a}+{b}) = {ans}{u}",
    f_rect_area: "طول×عرض = {a}×{b} = {ans}{u}",
    f_sq_perim: "4×ضلع = 4×{s} = {ans}{u}",
    f_sq_area: "ضلع×ضلع = {s}×{s} = {ans}{u}",
    f_tri_area: "قاعده×ارتفاع÷2 = {a}×{h}÷2 = {ans}{u}",
    f_circle_circ: "2πr = 2×3.14×{r} ≈ {ans}{u}",
    f_circle_area: "πr² = 3.14×{r}×{r} ≈ {ans}{u}",
    f_tri_angle: "180° − {a}° − {b}° = {ans}°",
    f_supp: "180° − {g}° = {ans}°",
    f_comp: "90° − {g}° = {ans}°",
    f_pyth: "a²+b² = {a}²+{b}² = {a2}+{b2} = {sum}، c = √{sum} ≈ {c}{u}",
    n_rect_perim_1: "باغ مستطیلی دور تا دور به نرده نیاز دارد.",
    n_rect_perim_2: "طول {a}{u}، عرض {b}{u}; هر چهار ضلع را اندازه می‌گیریم.",
    n_rect_area_1: "کف مستطیل شکل را کاشی می‌کنیم.",
    n_rect_area_2: "هر ردیف {a} کاشی، و {b} ردیف.",
    n_sq_perim_1: "گلدان مربع شکل دور به دور لبه می‌خواهد.",
    n_sq_perim_2: "هر چهار ضلع برابرند، هر ضلع {s}{u}.",
    n_sq_area_1: "کف مربع شکل را کاشی می‌کنیم.",
    n_sq_area_2: "هر ردیف {s} کاشی، و {s} ردیف.",
    n_tri_area_1: "محوطه ماسه‌ای مثلث شکل را پر می‌کنیم.",
    n_tri_area_2: "مثلث را دو برابر می‌کنیم تا مستطیل شود؛ مثلث نصف آن است.",
    n_circle_circ_1: "دور باغچه‌ای دایره‌ای یک قدم می‌زنیم.",
    n_circle_circ_2: "شعاع {r}{u}; دایره را یک دور رسم می‌کنیم.",
    n_circle_area_1: "روی میز گرد را رومیزی می‌اندازیم.",
    n_circle_area_2: "شعاع {r}{u}; کل قرص را پر می‌کنیم.",
    n_tri_angle_1: "سه زاویه مثلث کنار هم یک خط راست می‌سازند (180°).",
    n_tri_angle_2: "دو زاویه {a}° و {b}° داده شده است.",
    n_supp_1: "دو زاویه با هم یک زاویه باز (خط راست، 180°) می‌سازند.",
    n_supp_2: "یک زاویه {g}° است.",
    n_comp_1: "دو زاویه با هم یک زاویه قائمه (90°) می‌سازند.",
    n_comp_2: "یک زاویه {g}° است.",
    n_pyth_1: "نردبانی به دیوار تکیه داده‌ایم؛ طولش را پیدا کنید.",
    n_pyth_2: "ضلع قائم {a}{u}، ضلع افقی {b}{u}، میانشان زاویه قائمه است.",
    beat_concrete: "ببینید", beat_shape: "رسم کنید", beat_formula: "فرمول",
  },
});

// —— 工具函数（保持原逻辑）——
function r2(x) {
  if (typeof x !== 'number' || !isFinite(x)) return x;
  const r = Math.round(x * 100) / 100;
  return Object.is(r, -0) ? 0 : r;
}
function allNums(t) {
  return (String(t).match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
}
function sqUnit(u) {
  if (!u) return u;
  if (/²/.test(u) || /平方/.test(u)) return u;
  const map = { '米': '平方米', '厘米': '平方厘米', '分米': '平方分米', '毫米': '平方毫米',
    'm': 'm²', 'cm': 'cm²', 'dm': 'dm²', 'mm': 'mm²', 'inch': 'inch²', 'feet': 'ft²', 'ft': 'ft²' };
  return map[u] || (u + '²');
}

// 多语种词干
const TRI_W = '三角形|三角形|triangle|مثلث|مثلث|삼각형|triangle|dreieck|triángulo|triangolo';
const RECT_W = '长方形|矩形|長方形|rectangle|مستطيل|مستطیل|직사각형|rectangle|rechteck|rectángulo|rettangolo';
const SQ_W = '正方形|正方形|square|مربع|مربع|정사각형|carré|quadrat|cuadrado|quadrato';
const CIRC_W = '圆|圓|circle|دائرة|دایره|원|cercle|kreis|círculo|cerchio';
const PERIM_W = '周长|周長|perimeter|circumference|篱笆|围栏|圍欄|محيط|محیط|둘레|périmètre|umfang|perímetro|perimetro';
const AREA_W = '面积|面積|area|铺.*砖|草坪|مساحة|مساحت|넓이|aire|fläche|área';
const RAD_W = '半径|半徑|radius|نصف القطر|نصف قطر|شعاع|반지름|rayon|radio|raggio';
const DIA_W = '直径|直徑|diameter|قطر|قطر|지름|diamètre|durchmesser|diámetro|diametro';
const ANG_W = '内角|外角|補角|补角|余角|angle|زاوية|زاویه|角度|각|winkel|ángulo|angolo';
const SUPP_W = '补角|補角|supplement|زاوية متكاملة|متكاملة|زاویه متمم|보각|supplément|ergänzungswinkel|suplemento|supplementare';
const COMP_W = '余角|complement|زاوية متممة|متممة|زاویه مکمل|여각|complément|komplement|complemento|complementare';
const PYTH_W = '勾股|斜边|斜邊|hypotenuse|pythagorean|وتر|وتر|빗변|hypoténuse|hypotenuse|hipotenusa|ipotenusa';
const BASE_W = '底|base|قاعدة|قاعده|底辺|밑변|base|grundseite|base';
const HEIGHT_W = '高|height|altitude|ارتفاع|ارتفاع|高さ|높이|hauteur|höhe|altura|altezza';
const THIRD_W = '第三|剩下|残り|另一个|other|third|troisi|remaining|الثالث|الباقي|سوم|باقی|三つ目|나머지|autre|dritt|tercer|terzo';
const RIGHTTRI_W = '直角三角形|直角三角形|right triangle|مثلث قائم|مثلث قائمه|직각삼각형|triangle rectangle|rechtwinklig|triángulo rectángulo|triangolo rettangolo';

module.exports = {
  id: 'geometry',
  name: '几何图形',
  keywords: i18n.keywords('geometry'),

  match(problem, opts = {}) {
    const t = String(problem || '').toLowerCase();
    let s = 0;
    if (new RegExp('(' + RECT_W + ')', 'i').test(t)) s += 4;
    if (new RegExp('(' + SQ_W + ')', 'i').test(t)) s += 4;
    if (new RegExp('(' + TRI_W + ')', 'i').test(t)) s += 4;
    if (/(平行四边形|平行四邊形)/.test(t)) s += 4;
    if (new RegExp('(' + CIRC_W + ')', 'i').test(t) && new RegExp('(' + RAD_W + '|' + DIA_W + ')', 'i').test(t)) s += 8;
    if (new RegExp('(' + PERIM_W + ')', 'i').test(t)) s += 2;
    if (new RegExp('(' + AREA_W + ')', 'i').test(t)) s += 2;
    if (new RegExp('(' + SUPP_W + '|' + COMP_W + ')', 'i').test(t)) s += 3;
    if (new RegExp('(' + PYTH_W + '|' + RIGHTTRI_W + ')', 'i').test(t)) s += 7;
    if (/(围栏|篱笆|地砖|草坪|花坛|钟表|梯子|fence|til|ladder|clock)/.test(t)) s += 1;
    return s;
  },

  // 从题目抽参（多语种上下文词）
  extract(problem, opts = {}) {
    const t = String(problem || '');
    const low = t.toLowerCase();
    const nums = allNums(t);
    let conf = 0.4;

    const isPerimeter = new RegExp('(' + PERIM_W + ')', 'i').test(low);
    const isArea = new RegExp('(' + AREA_W + ')', 'i').test(low);
    const isZh = /[一-龥]/.test(t);
    const sqMatch = t.match(/(平方厘米|平方米|平方分米|cm²|m²|dm²|cm2|m2)/i);
    const linMatch = t.match(/(厘米|米|分米|毫米|cm|m|dm|mm|英寸|inch|feet|ft)/i);
    let unit;
    if (isArea) {
      unit = sqMatch ? sqMatch[1] : (linMatch ? sqUnit(linMatch[1]) : (isZh ? '平方厘米' : 'cm²'));
    } else {
      unit = linMatch ? linMatch[1] : (isZh ? '厘米' : 'cm');
    }

    // —— 三角形内角和：已知两个角，求第三个 ——
    const angleNums = (t.match(/\d+(?:\.\d+)?\s*°/g) || []).map(s => parseFloat(s));
    if (new RegExp('(' + TRI_W + ')', 'i').test(low) && angleNums.length >= 2 && (new RegExp('(' + THIRD_W + ')', 'i').test(low) || angleNums.length >= 2)) {
      return { task: 'triangle_angle', known: angleNums.slice(0, 2), unit: '°', confidence: 0.9, raw: t };
    }

    // —— 补角 / 余角 ——
    if (new RegExp('(' + SUPP_W + ')', 'i').test(low)) {
      const m = t.match(/(\d+(?:\.\d+)?)/);
      if (m) return { task: 'supplementary', given: parseFloat(m[1]), unit: '°', confidence: 0.85, raw: t };
    }
    if (new RegExp('(' + COMP_W + ')', 'i').test(low)) {
      const m = t.match(/(\d+(?:\.\d+)?)/);
      if (m) return { task: 'complementary', given: parseFloat(m[1]), unit: '°', confidence: 0.85, raw: t };
    }

    // —— 勾股定理：直角三角形两直角边求斜边 ——
    if ((new RegExp('(' + RIGHTTRI_W + '|' + PYTH_W + ')', 'i').test(low)) && nums.length >= 2) {
      // 只取带长度单位的数字，跳过"2本""3つ"等计数器
      const legNums = (t.match(/(\d+(?:\.\d+)?)\s*(?:cm|m\b|mm|km|センチ|メートル|centimeters?|meters?|c[mc]\b)/gi) || [])
        .map(s => parseFloat(s));
      const useLegs = legNums.length >= 2 ? legNums : nums.filter(n => n > 0 && n < 100);
      const legs = useLegs.slice(0, 2).sort((a, b) => a - b);
      return { task: 'pythagorean', legA: legs[0], legB: legs[1], unit, confidence: 0.85, raw: t };
    }

    // —— 圆：半径 r，周长或面积 ——
    if (new RegExp('(' + CIRC_W + ')').test(low) && new RegExp('(' + RAD_W + ')', 'i').test(low)) {
      const m = t.match(new RegExp('(?:' + RAD_W + ')\\s*(?:是|为|=|is|:)?\\s*(\\d+(?:\\.\\d+)?)', 'i'));
      const r = m ? parseFloat(m[1]) : nums[0];
      if (r > 0) {
        return { task: isArea ? 'circle_area' : 'circle_circumference', radius: r, unit, confidence: 0.85, raw: t };
      }
    }

    // —— 正方形：边长 s ——
    if (new RegExp('(' + SQ_W + ')', 'i').test(low) && nums.length >= 1) {
      const side = nums[0];
      if (side > 0) {
        return { task: isArea ? 'square_area' : 'square_perimeter', side, unit, confidence: 0.85, raw: t };
      }
    }

    // —— 三角形面积：底 a 高 h ——
    if (new RegExp('(' + TRI_W + ')').test(low) && new RegExp('(' + BASE_W + ')', 'i').test(low) && new RegExp('(' + HEIGHT_W + ')', 'i').test(low)) {
      const baseM = t.match(new RegExp('(?:' + BASE_W + ')\\s*(?:是|为|长|=|is|:)?\\s*(\\d+(?:\\.\\d+)?)', 'i'));
      const hM = t.match(new RegExp('(?:' + HEIGHT_W + ')\\s*(?:是|为|=|is|:)?\\s*(\\d+(?:\\.\\d+)?)', 'i'));
      const base = baseM ? parseFloat(baseM[1]) : nums[0];
      const height = hM ? parseFloat(hM[1]) : nums[1];
      if (base > 0 && height > 0) {
        return { task: 'tri_area', base, height, unit, confidence: 0.9, raw: t };
      }
    }

    // —— 长方形/矩形：长 a 宽 b ——
    if (new RegExp('(' + RECT_W + ')').test(low) && nums.length >= 2) {
      let w, h;
      const lenM = t.match(/(?:长|長|length|Länge|longueur|largo|lunghezza|طول|درازا|길이)\s*(?:是|为|=|is|:)?\s*(\d+(?:\.\d+)?)/i);
      const widM = t.match(/(?:宽|寬|width|Breite|largeur|ancho|larghezza|عرض|너비)\s*(?:是|为|=|is|:)?\s*(\d+(?:\.\d+)?)/i);
      if (lenM && widM) { w = parseFloat(lenM[1]); h = parseFloat(widM[1]); conf = 0.92; }
      else { w = nums[0]; h = nums[1]; conf = 0.6; }
      if (w > 0 && h > 0) {
        return { task: isArea ? 'rect_area' : 'rect_perimeter', width: w, height: h, unit, confidence: conf, raw: t };
      }
    }

    // —— 平行四边形面积（兜底）——
    if (/平行四边形|平行四邊形/.test(t) && nums.length >= 2) {
      return { task: 'tri_area', base: nums[0], height: nums[1], unit, confidence: 0.6, raw: t, isPara: true };
    }

    return null;
  },

  // 确定性求解（旁白全语种本地化）
  solve(params, opts = {}) {
    const lang = i18n.langOf(opts);
    const T = (key, v) => i18n.t('geometry', lang, key, v);
    const steps = [];
    const u = params.unit || '';

    let answer, shape = {}, formula = '';

    switch (params.task) {
      case 'rect_perimeter': {
        const { width: a, height: b } = params;
        answer = r2(2 * (a + b));
        shape = { kind: 'rect', w: a, h: b, measure: 'perimeter' };
        formula = T('f_rect_perim', { a, b, ans: answer, u });
        steps.push({ narration: T('n_rect_perim_1'), visualHint: 'concrete_fence' });
        steps.push({ narration: T('n_rect_perim_2', { a, b, u }), visualHint: 'shape_rect' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'rect_area': {
        const { width: a, height: b } = params;
        answer = r2(a * b);
        shape = { kind: 'rect', w: a, h: b, measure: 'area' };
        formula = T('f_rect_area', { a, b, ans: answer, u });
        steps.push({ narration: T('n_rect_area_1'), visualHint: 'concrete_tiles' });
        steps.push({ narration: T('n_rect_area_2', { a, b }), visualHint: 'shape_rect' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'square_perimeter': {
        const s = params.side;
        answer = r2(4 * s);
        shape = { kind: 'square', s, measure: 'perimeter' };
        formula = T('f_sq_perim', { s, ans: answer, u });
        steps.push({ narration: T('n_sq_perim_1'), visualHint: 'concrete_fence' });
        steps.push({ narration: T('n_sq_perim_2', { s, u }), visualHint: 'shape_square' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'square_area': {
        const s = params.side;
        answer = r2(s * s);
        shape = { kind: 'square', s, measure: 'area' };
        formula = T('f_sq_area', { s, ans: answer, u });
        steps.push({ narration: T('n_sq_area_1'), visualHint: 'concrete_tiles' });
        steps.push({ narration: T('n_sq_area_2', { s }), visualHint: 'shape_square' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'tri_area': {
        const { base: a, height: h } = params;
        answer = r2(a * h / 2);
        shape = { kind: 'triangle', base: a, height: h, measure: 'area' };
        formula = T('f_tri_area', { a, h, ans: answer, u });
        steps.push({ narration: T('n_tri_area_1'), visualHint: 'concrete_sandbox' });
        steps.push({ narration: T('n_tri_area_2'), visualHint: 'shape_triangle' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'circle_circumference': {
        const r = params.radius;
        answer = r2(2 * Math.PI * r);
        shape = { kind: 'circle', r, measure: 'perimeter' };
        formula = T('f_circle_circ', { r, ans: answer, u });
        steps.push({ narration: T('n_circle_circ_1'), visualHint: 'concrete_wheel' });
        steps.push({ narration: T('n_circle_circ_2', { r, u }), visualHint: 'shape_circle' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'circle_area': {
        const r = params.radius;
        answer = r2(Math.PI * r * r);
        shape = { kind: 'circle', r, measure: 'area' };
        formula = T('f_circle_area', { r, ans: answer, u });
        steps.push({ narration: T('n_circle_area_1'), visualHint: 'concrete_pie' });
        steps.push({ narration: T('n_circle_area_2', { r, u }), visualHint: 'shape_circle' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'triangle_angle': {
        const [a, b] = params.known;
        answer = r2(180 - a - b);
        shape = { kind: 'triangle_angle', angles: [a, b, answer], measure: 'angle' };
        formula = T('f_tri_angle', { a, b, ans: answer });
        steps.push({ narration: T('n_tri_angle_1'), visualHint: 'concrete_clock' });
        steps.push({ narration: T('n_tri_angle_2', { a, b }), visualHint: 'shape_angle' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'supplementary': {
        const g = params.given;
        answer = r2(180 - g);
        shape = { kind: 'angle_pair', a: g, b: answer, straight: true };
        formula = T('f_supp', { g, ans: answer });
        steps.push({ narration: T('n_supp_1'), visualHint: 'concrete_clock' });
        steps.push({ narration: T('n_supp_2', { g }), visualHint: 'shape_angle' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'complementary': {
        const g = params.given;
        answer = r2(90 - g);
        shape = { kind: 'angle_pair', a: g, b: answer, straight: false };
        formula = T('f_comp', { g, ans: answer });
        steps.push({ narration: T('n_comp_1'), visualHint: 'concrete_clock' });
        steps.push({ narration: T('n_comp_2', { g }), visualHint: 'shape_angle' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      case 'pythagorean': {
        const a = params.legA, b = params.legB;
        const c = r2(Math.sqrt(a * a + b * b));
        answer = c;
        shape = { kind: 'righttri', a, b, c, measure: 'side' };
        formula = T('f_pyth', { a, b, a2: a * a, b2: b * b, sum: a * a + b * b, c, u });
        steps.push({ narration: T('n_pyth_1'), visualHint: 'concrete_ladder' });
        steps.push({ narration: T('n_pyth_2', { a, b, u }), visualHint: 'shape_righttri' });
        steps.push({ narration: formula, visualHint: 'formula' });
        break;
      }
      default:
        return { answer: null, steps: [], error: 'unknown_task' };
    }

    const angleTask = (params.task === 'triangle_angle' || params.task === 'supplementary' || params.task === 'complementary');
    const ansText = angleTask ? String(answer) + '°' : (u ? String(answer) + u : String(answer));
    return { answer: ansText, steps, shape, formula, unit: u, task: params.task, numeric: answer };
  },

  validate(params, solved, opts = {}) {
    if (!solved || solved.answer == null || solved.answer === '') return { ok: false, reason: 'no_answer' };
    if (!solved.steps || solved.steps.length < 3) return { ok: false, reason: 'need_3_cpa_steps' };
    if (typeof solved.numeric !== 'number' || !isFinite(solved.numeric)) return { ok: false, reason: 'bad_number' };
    if (!solved.shape || !solved.shape.kind) return { ok: false, reason: 'no_shape' };
    return { ok: true };
  },

  renderParams(solved, opts = {}) {
    const lang = i18n.langOf(opts);
    const T = (key) => i18n.t('geometry', lang, key);
    return {
      type: 'geometry',
      rtl: i18n.isRTL(lang),
      language: lang,
      task: solved.task,
      shape: solved.shape,
      answer: solved.answer,
      formula: solved.formula,
      beats: [
        { id: 'concrete', duration: 5000, label: T('beat_concrete') },
        { id: 'shape', duration: 5000, label: T('beat_shape') },
        { id: 'formula', duration: 5000, label: T('beat_formula') },
      ],
      scenes: [
        { type: 'concrete', hint: solved.steps[0] && solved.steps[0].visualHint },
        { type: 'shape', shape: solved.shape },
        { type: 'formula', text: solved.formula },
      ],
    };
  },
};
