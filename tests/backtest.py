#!/usr/bin/env python3
# tests/backtest.py — Playwright 无头渲染回测：加载 renderParams，截 3 帧，收集 console 错误
import json, sys, subprocess, time, urllib.parse, pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
FRAMES = ROOT / "tests" / "frames"
FRAMES.mkdir(parents=True, exist_ok=True)
RP_DIR = ROOT / "tests" / "rp"
PORT = 8731

# 每族三个截图时刻（相对动画开始的毫秒）：首步 / 中间 / 结论
SHOTS = {
    "grid": [(2000, "concrete"), (8000, "pictorial"), (13500, "conclusion")],
    "balance": [(2000, "concrete"), (11000, "divide"), (18500, "conclusion")],
    "geometry": [(1800, "concrete"), (7500, "shape"), (13000, "answer")],
    "function-graph": [(1800, "concrete"), (7500, "graph"), (13000, "answer")],
}

def main():
    manifest = json.loads((RP_DIR / "manifest.json").read_text())
    server = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(PORT), "--directory", str(ROOT)],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    time.sleep(1.2)

    console_errors = []
    saved = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(
                executable_path="/usr/local/bin/chromium", headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage"],
            )
            page = browser.new_page(viewport={"width": 900, "height": 600})
            page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
            page.on("pageerror", lambda e: console_errors.append("PAGEERROR: " + str(e)))

            for item in manifest:
                fam = item["fam"]; idx = item["idx"]
                rp = json.loads((RP_DIR / item["file"]).read_text())
                data = urllib.parse.quote(json.dumps(rp))
                url = f"http://localhost:{PORT}/public/renderer/index.html?data={data}"
                page.goto(url, wait_until="load")
                page.wait_for_selector("canvas", timeout=5000)
                page.wait_for_timeout(500)  # 让 RAF 跑起来，t 从 ~0 开始
                prev = 0
                for at_ms, step in SHOTS[fam]:
                    page.wait_for_timeout(at_ms - prev)
                    prev = at_ms
                    out = FRAMES / f"{fam}_{idx}_{step}.png"
                    page.screenshot(path=str(out))
                    saved.append(str(out.relative_to(ROOT)))
                    print("shot", out.name)
            browser.close()
    finally:
        server.terminate()

    print("\n==== BACKTEST RESULT ====")
    print("frames saved:", len(saved))
    for s in saved: print("  ", s)
    if console_errors:
        print("\nCONSOLE ERRORS:")
        for e in console_errors: print("  -", e)
        sys.exit(1)
    else:
        print("\nNo JS console errors.")

if __name__ == "__main__":
    main()
