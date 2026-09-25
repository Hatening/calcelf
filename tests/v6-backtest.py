#!/usr/bin/env python3
"""
tests/v6-backtest.py — CalcElf v6.0 无头回测
验证：①kard Canvas 在主程序内真渲染（≥3帧）②5星评分可点可提交 ③log-animation 回补
用法：python3 tests/v6-backtest.py
"""
import json, sys, subprocess, time, pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "tests" / "v6-frames"
OUT.mkdir(parents=True, exist_ok=True)
PORT = 8741

# numberline 知识卡的真实 renderParams（与 lib/kards/numberline.js 输出结构一致）
KARD_RP = {
    "type": "numberline",
    "scene": {"mode": "jump", "start": 3, "end": 8, "op": "+", "jump": 5, "min": -2, "max": 12, "actor": "\U0001f438"},
    "beats": [
        {"id": "start", "duration": 3500, "label": "Start"},
        {"id": "jump", "duration": 4500, "label": "Jump"},
        {"id": "land", "duration": 3500, "label": "Land"},
        {"id": "eq", "duration": 3500, "label": "Equation"},
    ],
    "answer": "8",
    "scenes": [
        {"type": "numberline", "start": 3, "end": 8, "min": -2, "max": 12},
        {"type": "equation", "text": "3 + 5 = 8"},
    ],
}

def main():
    server = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(PORT), "--directory", str(ROOT)],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    time.sleep(1.5)

    console_errors = []
    api_calls = []
    passed = []
    failed = []

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(
                executable_path="/usr/local/bin/chromium", headless=True,
                args=["--no-sandbox", "--disable-dev-shm-usage"],
            )
            page = browser.new_page(viewport={"width": 900, "height": 950})
            page.on("console", lambda m: console_errors.append(m.text) if m.type == "error" else None)
            page.on("pageerror", lambda e: console_errors.append("PAGEERROR: " + str(e)))

            # ---- 拦截所有 /api/* 请求，返回 stub ----
            def handle_route(route):
                url = route.request.url
                post = route.request.post_data
                if "/api/kard" in url:
                    api_calls.append({"endpoint": "kard", "body": post})
                    route.fulfill(status=200, content_type="application/json",
                        body=json.dumps({"eligible": True, "family": "numberline",
                            "type": "numberline", "renderParams": KARD_RP, "answer": "8", "steps": []}))
                elif "/api/rate-animation" in url:
                    api_calls.append({"endpoint": "rate-animation", "body": post})
                    route.fulfill(status=200, content_type="application/json",
                        body=json.dumps({"ok": True, "thanks": True}))
                elif "/api/log-animation" in url:
                    api_calls.append({"endpoint": "log-animation", "body": post})
                    route.fulfill(status=200, content_type="application/json",
                        body=json.dumps({"ok": True}))
                elif "/api/animation" in url and "plan" not in url:
                    api_calls.append({"endpoint": "animation", "body": post})
                    route.fulfill(status=200, content_type="application/json",
                        body=json.dumps({"eligible": False, "html": ""}))
                elif "/api/animation-plan" in url:
                    api_calls.append({"endpoint": "animation-plan", "body": post})
                    route.fulfill(status=200, content_type="application/json",
                        body=json.dumps({"eligible": False}))
                else:
                    route.continue_()

            page.route("**/api/*", handle_route)

            # ---- 加载主页 ----
            page.goto(f"http://localhost:{PORT}/index.html", wait_until="domcontentloaded")
            page.wait_for_timeout(2500)  # 等 JS 初始化

            # ---- 注入 mock 状态并触发动画 ----
            # 注意：currentResult/currentLang 是 app.js 顶层 let，直接赋值（非 window.）
            page.evaluate("""
            () => {
                currentResult = {
                    question_text: "从3出发向右跳5格",
                    answer: "8",
                    subject: "Math",
                    solutions: [{name:"数轴法", recommended:true, steps:[
                        {step:1,description:"从数轴上的3出发",formula:""},
                        {step:2,description:"向右跳5格，做加法",formula:"3+5"},
                        {step:3,description:"落地后在8",formula:"8"}]}]
                };
                currentLang = 'zh-CN';
                window.__currentQid = "test-qid-v6-001";
                window.session = async () => ({access_token: "mock-token", user: {id: "test-user-001"}});
                window.authHeader = (s) => ({'Authorization': 'Bearer mock-token', 'Content-Type': 'application/json'});
            }
            """)

            # 确保结果区和动画面板可见（正常 solve 流程会自动显示，这里直接触发需手动显示）
            page.evaluate("""
            () => {
                document.getElementById('result').style.display='block';
                document.getElementById('animCard').style.display='';
                document.getElementById('animBox').style.display='block';
            }
            """)

            # 触发 animation()
            page.evaluate("animation(false)")
            print("[test] animation() triggered")

            # ---- 验证 ①：kard iframe 出现 ----
            try:
                page.wait_for_selector("iframe.kard-frame", timeout=12000)
                passed.append("kard iframe created in #animBox")
                print("[pass] kard iframe created")
            except Exception as e:
                failed.append(f"kard iframe not found: {e}")
                print(f"[fail] kard iframe: {e}")

            # 等 iframe 加载并 postMessage
            page.wait_for_timeout(2000)

            # 验证 iframe 内有 canvas
            try:
                frame = page.frame_locator("iframe.kard-frame")
                frame.locator("canvas").wait_for(timeout=8000)
                passed.append("canvas exists inside kard iframe")
                print("[pass] canvas inside kard iframe")
            except Exception as e:
                failed.append(f"canvas not found in iframe: {e}")
                print(f"[fail] canvas in iframe: {e}")

            # 滚动到动画面板以便截图可见
            page.evaluate("document.getElementById('animCard').scrollIntoView({behavior:'instant',block:'start'})")
            page.wait_for_timeout(500)

            # ---- 截图 1：首拍（出发点）----
            page.wait_for_timeout(1500)
            page.screenshot(path=str(OUT / "01_kard_first_beat.png"))
            passed.append("screenshot 01 (first beat) saved")

            # ---- 截图 2：中间（跳跃中）----
            page.wait_for_timeout(5000)
            page.screenshot(path=str(OUT / "02_kard_mid_beat.png"))
            passed.append("screenshot 02 (mid beat) saved")

            # ---- 截图 3：结论（算式）----
            page.wait_for_timeout(6000)
            page.screenshot(path=str(OUT / "03_kard_conclusion.png"))
            passed.append("screenshot 03 (conclusion) saved")

            # 验证 canvas 仍在（对象全程不消失）
            try:
                frame = page.frame_locator("iframe.kard-frame")
                canvas = frame.locator("canvas")
                assert canvas.count() > 0, "canvas disappeared"
                box = canvas.first.bounding_box()
                assert box and box["width"] > 50 and box["height"] > 50, f"canvas too small: {box}"
                passed.append(f"canvas still visible at conclusion ({box['width']:.0f}x{box['height']:.0f})")
                print(f"[pass] canvas persistent at conclusion")
            except Exception as e:
                failed.append(f"canvas persistence check: {e}")

            # ---- 验证 ②：评分组件出现 ----
            try:
                page.wait_for_selector(".anim-rating", timeout=8000)
                stars = page.query_selector_all(".anim-rating .star")
                assert len(stars) == 5, f"expected 5 stars, got {len(stars)}"
                passed.append(f"rating widget shown with {len(stars)} stars")
                print("[pass] rating widget with 5 stars")
            except Exception as e:
                failed.append(f"rating widget: {e}")
                print(f"[fail] rating widget: {e}")

            page.screenshot(path=str(OUT / "04_rating_before_click.png"))

            # ---- 点击第 4 颗星 ----
            try:
                stars = page.query_selector_all(".anim-rating .star")
                stars[3].click()
                page.wait_for_timeout(800)
                page.screenshot(path=str(OUT / "05_rating_after_click.png"))
                # 验证致谢出现
                thanks = page.query_selector(".rating-thanks")
                assert thanks is not None, "thanks message not found"
                thanks_text = thanks.inner_text()
                assert len(thanks_text) > 0, "thanks message empty"
                passed.append(f"rating submitted, thanks shown: '{thanks_text[:40]}'")
                print(f"[pass] rating submitted, thanks: {thanks_text[:40]}")
            except Exception as e:
                failed.append(f"rating click: {e}")
                print(f"[fail] rating click: {e}")

            # ---- 验证 ③：API 调用记录 ----
            page.wait_for_timeout(1000)  # 等异步请求完成

            kard_calls = [c for c in api_calls if c["endpoint"] == "kard"]
            rate_calls = [c for c in api_calls if c["endpoint"] == "rate-animation"]
            log_calls = [c for c in api_calls if c["endpoint"] == "log-animation"]

            if kard_calls:
                passed.append(f"/api/kard called ({len(kard_calls)}x)")
            else:
                failed.append("/api/kard was never called")

            if rate_calls:
                body = json.loads(rate_calls[0]["body"] or "{}")
                assert body.get("rating") == 4, f"expected rating 4, got {body.get('rating')}"
                assert body.get("source") == "kard", f"expected source kard, got {body.get('source')}"
                passed.append(f"/api/rate-animation called with rating={body.get('rating')}, source={body.get('source')}")
                print(f"[pass] rate-animation: rating={body.get('rating')} source={body.get('source')}")
            else:
                failed.append("/api/rate-animation was never called")

            if log_calls:
                body = json.loads(log_calls[0]["body"] or "{}")
                assert body.get("qid") == "test-qid-v6-001", f"qid mismatch: {body.get('qid')}"
                assert body.get("anim_source") == "kard", f"anim_source mismatch: {body.get('anim_source')}"
                assert body.get("kard_eligible") == True, f"kard_eligible mismatch"
                passed.append(f"/api/log-animation called with qid={body.get('qid')}, anim_source={body.get('anim_source')}, kard_eligible={body.get('kard_eligible')}")
                print(f"[pass] log-animation: qid={body.get('qid')} source={body.get('anim_source')} eligible={body.get('kard_eligible')}")
            else:
                failed.append("/api/log-animation was never called")

            browser.close()
    finally:
        server.terminate()
        server.wait(timeout=5)

    # ---- 汇总 ----
    print("\n" + "=" * 60)
    print("CalcElf v6.0 HEADLESS BACKTEST REPORT")
    print("=" * 60)
    print(f"\nPASSED ({len(passed)}):")
    for p_ in passed:
        print(f"  ✓ {p_}")
    if failed:
        print(f"\nFAILED ({len(failed)}):")
        for f_ in failed:
            print(f"  ✗ {f_}")
    if console_errors:
        print(f"\nCONSOLE ERRORS ({len(console_errors)}):")
        for e in console_errors:
            print(f"  - {e[:200]}")
    else:
        print("\nNo JS console errors.")
    print(f"\nScreenshots saved to: {OUT}/")
    for f in sorted(OUT.glob("*.png")):
        print(f"  {f.name} ({f.stat().st_size} bytes)")

    rc = 1 if failed else 0
    sys.exit(rc)

if __name__ == "__main__":
    main()
