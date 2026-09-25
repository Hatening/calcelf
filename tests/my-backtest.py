#!/usr/bin/env python3
# tests/my-backtest.py — 仅 geometry / function-graph 的无头回测（独立端口，不依赖共享 server）
import json, sys, subprocess, time, urllib.parse, pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
FRAMES = ROOT / "tests" / "frames"
FRAMES.mkdir(parents=True, exist_ok=True)
RP = ROOT / "tests" / "rp"
PORT = 8799

# fam -> (rp file stem, shot times ms)
JOBS = [
    ("geometry", "geometry_0", [(1800, "concrete"), (7500, "shape"), (13000, "answer")]),
    ("geometry", "geometry_6", [(1800, "concrete"), (7500, "shape"), (13000, "answer")]),
    ("geometry", "geometry_16", [(1800, "concrete"), (7500, "shape"), (13000, "answer")]),
    ("function-graph", "function-graph_0", [(1800, "concrete"), (7500, "graph"), (13000, "answer")]),
    ("function-graph", "function-graph_9", [(1800, "concrete"), (7500, "graph"), (13000, "answer")]),
    ("function-graph", "function-graph_14", [(1800, "concrete"), (7500, "graph"), (13000, "answer")]),
]

def main():
    server = subprocess.Popen(
        [sys.executable, str(ROOT / "tests" / "serve.py"), str(PORT)],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    time.sleep(1.5)
    errors = []
    saved = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(
                executable_path="/usr/local/bin/chromium", headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage"],
            )
            page = browser.new_page(viewport={"width": 1000, "height": 680})
            page.on("console", lambda m: errors.append(m.text) if m.type == "error" and "favicon" not in m.text else None)
            page.on("pageerror", lambda e: errors.append("PAGEERROR: " + str(e)))
            for fam, stem, shots in JOBS:
                rp = json.loads((RP / f"{stem}.json").read_text())
                data = urllib.parse.quote(json.dumps(rp, ensure_ascii=False))
                url = f"http://localhost:{PORT}/public/renderer/index.html?data={data}"
                print("->", stem)
                page.goto(url, wait_until="load")
                page.wait_for_selector("canvas", timeout=5000)
                page.wait_for_timeout(500)
                prev = 0
                for at_ms, step in shots:
                    page.wait_for_timeout(at_ms - prev)
                    prev = at_ms
                    out = FRAMES / f"{fam}_{stem.split('_')[1]}_{step}.png"
                    page.screenshot(path=str(out))
                    saved.append(str(out.relative_to(ROOT)))
            browser.close()
    finally:
        server.terminate()

    print("\n==== MY BACKTEST RESULT ====")
    print("frames saved:", len(saved))
    for s in saved: print("  ", s)
    if errors:
        print("\nCONSOLE ERRORS:")
        for e in errors: print("  -", e)
        sys.exit(1)
    print("\nNo JS console errors.")

if __name__ == "__main__":
    main()
