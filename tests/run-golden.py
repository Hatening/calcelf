#!/usr/bin/env python3
"""v6.1 Golden-set headless backtest: evidence frames + console audit."""
import json, os, sys, time, shutil, glob, re
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = Path("/home/user/Doubao/chats/38442579084875522/_v6base")
LESSON_DIR = Path("/home/user/Doubao/chats/38442579084875522/_ds2/all_lessons/_all_lessons")
DOCS_DIR = Path("/home/user/Doubao/chats/38442579084875522/_ds2/edulab/edulab/docs")
GOLDEN_DIR = BASE / "tests" / "golden"
DOCS_SAMPLE_DIR = BASE / "tests" / "docs-sample"
CHROMIUM = "/usr/local/bin/chromium"
VIEWPORT = {"width": 1400, "height": 900}

GOLDEN_DIR.mkdir(parents=True, exist_ok=True)
DOCS_SAMPLE_DIR.mkdir(parents=True, exist_ok=True)

# ---------- classification ----------
def classify(d):
    if "board3d" in d:
        return "3d", {"board3d": d["board3d"], "lesson": d.get("lesson"), "steps": d.get("steps")}
    if "model" in d:
        return "solid", {"model": d["model"], "lesson": d.get("lesson"), "steps": d.get("steps")}
    if "board" in d:
        b = d["board"]
        v = b.get("view", {}) or {}
        # chemistry features
        if any(k in b for k in ("reaction", "molecules", "atoms")) or any(k in d for k in ("reaction","molecules","atoms")):
            return "reaction", {"board": b, "lesson": d.get("lesson"), "steps": d.get("steps")}
        # solid features in board
        if any(k in b for k in ("solidType", "vertices")) or (isinstance(b.get("objects"), list) and len(b.get("objects",[])) and isinstance(b["objects"][0], dict) and any(c in b["objects"][0] for c in ("x","y","z"))):
            return "solid", {"model": b, "lesson": d.get("lesson"), "steps": d.get("steps")}
        if "xRange" in v or "yRange" in v:
            return "2d", {"board": b, "lesson": d.get("lesson"), "steps": d.get("steps")}
        # fallback: logic / venn — try 2d
        return "2d", {"board": b, "lesson": d.get("lesson"), "steps": d.get("steps")}
    return "2d", {"lesson": d.get("lesson"), "steps": d.get("steps")}

# ---------- canvas non-blank check ----------
def canvas_nonblank(page, selectors):
    """Return dict selector -> (hasContent:bool, nonBgRatio:float)."""
    results = {}
    for sel in selectors:
        try:
            info = page.evaluate("""(sel) => {
                const c = document.querySelector(sel);
                if (!c || !c.getContext) return null;
                const ctx = c.getContext('webgl2') || c.getContext('webgl') || c.getContext('2d');
                if (!ctx) return null;
                const w = c.width, h = c.height;
                if (!w || !h) return null;
                // sample a downscaled grid
                const sw = 64, sh = Math.max(1, Math.round(64 * h / w));
                let data;
                try {
                    if (ctx.constructor.name === 'WebGL2RenderingContext' || ctx.constructor.name === 'WebGLRenderingContext') {
                        const px = new Uint8Array(w*h*4);
                        ctx.readPixels(0,0,w,h,ctx.RGBA,ctx.UNSIGNED_BYTE,px);
                        // build ImageData from px (note WebGL origin bottom-left)
                        const tmp = document.createElement('canvas');
                        tmp.width=w; tmp.height=h;
                        const tctx=tmp.getContext('2d');
                        const img = tctx.createImageData(w,h);
                        // WebGL reads bottom-up; flip vertically
                        for (let y=0;y<h;y++){
                            for(let x=0;x<w;x++){
                                const si = ((h-1-y)*w+x)*4;
                                const di = (y*w+x)*4;
                                img.data[di]=px[si]; img.data[di+1]=px[si+1]; img.data[di+2]=px[si+2]; img.data[di+3]=px[si+3];
                            }
                        }
                        tctx.putImageData(img,0,0);
                        data = tctx.getImageData(0,0,sw,sh).data;
                    } else {
                        data = ctx.getImageData(0,0,sw,sh).data;
                    }
                } catch(e) { return {error: String(e)}; }
                let nonBg=0, total=sw*sh;
                let colors=new Set();
                for (let i=0;i<total;i++){
                    const r=data[i*4],g=data[i*4+1],b=data[i*4+2],a=data[i*4+3];
                    colors.add((r>>4)+'_'+(g>>4)+'_'+(b>>4));
                    // consider non-background if not near-uniform dark/clear
                    if (a>10 && (Math.abs(r-13)+Math.abs(g-18)+Math.abs(b-40))>40) nonBg++;
                }
                return {nonBg: nonBg, total: total, distinctColors: colors.size};
            }""", sel)
            if info is None:
                results[sel] = None
            elif "error" in info:
                results[sel] = {"error": info["error"]}
            else:
                ratio = info["nonBg"] / max(1, info["total"])
                results[sel] = {"hasContent": info["nonBg"] > 2, "nonBgRatio": round(ratio,3),
                                "distinctColors": info["distinctColors"]}
        except Exception as e:
            results[sel] = {"error": str(e)}
    return results

# ---------- Test 1: golden lessons ----------
def test_golden(page, results):
    lessons = sorted(LESSON_DIR.glob("*.json"))
    for jf in lessons:
        d = json.loads(jf.read_text(encoding="utf-8"))
        host, payload = classify(d)
        stem = jf.stem  # e.g. solution-quadratic
        shot = GOLDEN_DIR / f"{stem}-{host}.png"
        errors = []
        page_errors = []
        console_msgs = []

        page.on("console", lambda msg: console_msgs.append(f"[{msg.type}] {msg.text}") if msg.type in ("error","warning") else None)
        page.on("pageerror", lambda err: page_errors.append(str(err)))

        url = f"http://localhost:8899/board/{host}.html"
        try:
            page.goto(url, wait_until="networkidle", timeout=15000)
            # inject data
            page.evaluate("""(payload) => { window.postMessage(payload, '*'); }""", payload)
            page.wait_for_timeout(1800)
            page.screenshot(path=str(shot), full_page=False)
            # check canvas
            sel_map = {
                "2d": ["#geometry-canvas", "#draw-canvas"],
                "3d": ["canvas"],
                "solid": ["canvas"],
                "reaction": ["#energy-canvas", "canvas"],
            }
            canv_info = canvas_nonblank(page, sel_map.get(host, ["canvas"]))
        except Exception as e:
            errors.append(f"NAV/RENDER: {e}")
            canv_info = None

        # filter console errors (ignore known favicon 404 etc)
        real_errors = [m for m in console_msgs if m.startswith("[error]") and "favicon" not in m.lower()]
        results["golden"].append({
            "file": jf.name, "host": host, "screenshot": str(shot.relative_to(BASE)),
            "rendered": not errors and shot.exists(),
            "errors": errors + page_errors,
            "console_error_count": len(real_errors),
            "console_errors": real_errors[:5],
            "canvas": canv_info,
        })
        # listeners accumulate across iterations but closure lists are local; harmless
        print(f"  [golden] {jf.name} -> {host} | errors={len(real_errors)} | canv={canv_info}")

# ---------- Test 2: docs sample ----------
def test_docs_sample(page, results):
    all_docs = sorted(DOCS_DIR.glob("*.html"))
    # categorize
    cats = {"function": [], "conic": [], "geometry": [], "physics": [], "chemistry": [], "solid": [], "other": []}
    for f in all_docs:
        n = f.name.lower()
        if any(k in n for k in ["quadratic","normal-distribution","vector-addition","projectile","lorentz"]):
            cats["function"].append(f)
        elif any(k in n for k in ["rutherford","einstein","garfield","pythagoras"]):
            cats["conic"].append(f)
        elif any(k in n for k in ["pyramid","space-angles","geometry","shell-sort"]):
            cats["geometry"].append(f)
        elif any(k in n for k in ["physics","projectile","lorentz","sr","minkowski","thermite","sr.html","grf","ms","ms.html"]):
            cats["physics"].append(f)
        elif any(k in n for k in ["reaction","redox","mg-burn","cu-reduction","fe-cuso4","zn","na-water","iron-rusting","hydrogen","过氧化氢","镁条","electrolyte","metal-activity","base-properties"]):
            cats["chemistry"].append(f)
        elif any(k in n for k in ["dna","cell","circulatory","immune","mendel","pcr","enso","pop","cardio"]):
            cats["other"].append(f)
        else:
            cats["other"].append(f)

    # pick 15: ensure coverage
    picked = []
    quota = {"function":3, "conic":2, "geometry":2, "physics":2, "chemistry":3, "solid":1, "other":2}
    for cat, q in quota.items():
        pool = cats.get(cat, [])
        picked.extend(pool[:q])
    # dedupe
    seen=set(); uniq=[]
    for f in picked:
        if f.name not in seen:
            seen.add(f.name); uniq.append(f)
    picked = uniq[:15]

    for f in picked:
        # copy into docs-sample
        dst = DOCS_SAMPLE_DIR / f.name
        shutil.copy2(f, dst)
        # check CDN deps by scanning HTML
        html = f.read_text(encoding="utf-8", errors="replace")
        cdn_srcs = re.findall(r'(?:src|href)\s*=\s*["\'](https?://[^"\']+)["\']', html)
        cdn_deps = [u for u in cdn_srcs if "localhost" not in u and "127.0.0.1" not in u]
        has_cdn = len(cdn_deps) > 0

        errors = []
        page_errors = []
        console_msgs = []
        failed_reqs = []
        page.on("console", lambda msg: console_msgs.append(f"[{msg.type}] {msg.text}") if msg.type=="error" else None)
        page.on("pageerror", lambda err: page_errors.append(str(err)))
        page.on("requestfailed", lambda req: failed_reqs.append(f"{req.url} :: {req.failure}") if "favicon" not in req.url else None)

        shot = DOCS_SAMPLE_DIR / f"{f.stem}.png"
        try:
            # serve docs-sample via the same server (it's under _v6base/tests/docs-sample/)
            url = f"http://localhost:8899/tests/docs-sample/{f.name}"
            page.goto(url, wait_until="networkidle", timeout=20000)
            page.wait_for_timeout(1500)
            page.screenshot(path=str(shot), full_page=False)
        except Exception as e:
            errors.append(f"NAV: {e}")

        real_errs = [m for m in console_msgs if "favicon" not in m.lower()]
        results["docs"].append({
            "file": f.name, "category": cat, "screenshot": str(shot.relative_to(BASE)),
            "has_cdn": has_cdn, "cdn_deps": cdn_deps[:5],
            "rendered": not errors and shot.exists(),
            "console_error_count": len(real_errs),
            "console_errors": real_errs[:5],
            "failed_requests": failed_reqs[:5],
        })
        print(f"  [docs] {f.name} | cdn={has_cdn} | errs={len(real_errs)}")

# ---------- Test 3: renderer regression ----------
def test_renderer(page, results):
    # axis_motion renderParams
    rp = {
        "type": "axis_motion",
        "scene": {"wellDepth": 10, "unit": "米"},
        "actor": {"emoji": "🐸"},
        "phases": [
            {"from": 0, "to": 4, "type": "day", "label": "白天爬4米"},
            {"from": 4, "to": 2, "type": "night", "label": "晚上滑2米"},
            {"from": 2, "to": 7, "type": "day", "label": "白天爬5米"},
            {"from": 7, "to": 7, "type": "done", "label": "白天爬3米到顶"},
        ],
        "beats": [
            {"id":"p0","duration":2000},
            {"id":"p1","duration":1500},
            {"id":"p2","duration":2000},
            {"id":"p3","duration":2500},
        ],
        "answer": "第4天白天爬出井口",
    }
    errors=[]; page_errors=[]; console_msgs=[]
    page.on("console", lambda msg: console_msgs.append(f"[{msg.type}] {msg.text}") if msg.type in ("error","warning") else None)
    page.on("pageerror", lambda err: page_errors.append(str(err)))

    shot = GOLDEN_DIR / "renderer-axis_motion.png"
    try:
        page.goto("http://localhost:8899/renderer/index.html", wait_until="networkidle", timeout=15000)
        page.evaluate("""(rp) => { window.postMessage(rp, '*'); }""", rp)
        page.wait_for_timeout(2000)
        page.screenshot(path=str(shot), full_page=False)
        canv = canvas_nonblank(page, ["#stage", "canvas"])
    except Exception as e:
        errors.append(str(e)); canv=None

    # check showRatingWidget exists in app.js source (static check)
    appjs = (BASE/"app.js").read_text(encoding="utf-8", errors="replace")
    has_rating_fn = "function showRatingWidget" in appjs or "showRatingWidget" in appjs
    has_rating_stars = "rating-stars" in appjs
    real_errs = [m for m in console_msgs if "favicon" not in m.lower()]
    results["renderer"] = {
        "screenshot": str(shot.relative_to(BASE)),
        "axis_motion_rendered": not errors and shot.exists(),
        "canvas": canv,
        "console_error_count": len(real_errs),
        "console_errors": real_errs[:5],
        "page_errors": page_errors[:5],
        "showRatingWidget_present": has_rating_fn,
        "ratingStars_html_present": has_rating_stars,
    }
    print(f"  [renderer] axis_motion | errs={len(real_errs)} | ratingFn={has_rating_fn}")

# ---------- main ----------
def main():
    results = {"golden": [], "docs": [], "renderer": None}
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=CHROMIUM, headless=True,
                                     args=["--no-sandbox","--disable-dev-shm-usage","--disable-gpu"])
        ctx = browser.new_context(viewport=VIEWPORT, ignore_https_errors=True)
        page = ctx.new_page()

        print("=== Test 1: Golden lessons ===")
        test_golden(page, results)
        print("=== Test 2: Docs sample ===")
        test_docs_sample(page, results)
        print("=== Test 3: Renderer regression ===")
        test_renderer(page, results)

        browser.close()

    (BASE/"tests"/"raw-results.json").write_text(json.dumps(results, ensure_ascii=False, indent=2))
    print("\nDone. Raw results saved.")

if __name__ == "__main__":
    main()
