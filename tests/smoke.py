#!/usr/bin/env python3
"""Smoke test for board players - loads each board, injects test data, screenshots."""
import json, subprocess, time, sys, os
from pathlib import Path

BASE = Path("/home/user/Doubao/chats/38442579084875522/_v6base")
SHOT_DIR = BASE / "tests" / "board-smoke"
SHOT_DIR.mkdir(parents=True, exist_ok=True)

# Load test data
test_data = {}
for name, path in [("2d", "/tmp/test-2d.json"), ("3d", "/tmp/test-3d.json"),
                    ("reaction", "/tmp/test-reaction.json"), ("solid", "/tmp/test-solid.json")]:
    with open(path) as f:
        test_data[name] = json.load(f)

from playwright.sync_api import sync_playwright

def run():
    errors = []
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path="/usr/local/bin/chromium",
                                     args=["--no-sandbox", "--disable-gpu", "--use-gl=swiftshader"])
        page = browser.new_page(viewport={"width": 1280, "height": 800})

        # Collect console errors and failed requests
        page.on("console", lambda msg: errors.append(f"CONSOLE [{msg.type}]: {msg.text}") if msg.type == "error" else None)
        page.on("response", lambda resp: errors.append(f"404: {resp.url}") if resp.status == 404 else None)

        tests = [
            ("2d", "http://localhost:8899/board/2d.html", test_data["2d"]),
            ("3d", "http://localhost:8899/board/3d.html", test_data["3d"]),
            ("reaction", "http://localhost:8899/board/reaction.html", test_data["reaction"]),
            ("solid", "http://localhost:8899/board/solid.html", test_data["solid"]),
        ]

        for name, url, data in tests:
            print(f"\n=== Testing {name} ===")
            errors.clear()
            page.goto(url, wait_until="networkidle")
            time.sleep(1)
            # Inject data via postMessage
            page.evaluate(f"window.postMessage({json.dumps(data)}, '*')")
            time.sleep(3)  # wait for render

            shot_path = SHOT_DIR / f"{name}.png"
            page.screenshot(path=str(shot_path))
            print(f"  Screenshot: {shot_path}")

            # Check for errors
            page_errors = [e for e in errors if "404" in e or "error" in e.lower()]
            if page_errors:
                print(f"  ISSUES: {page_errors}")
            else:
                print(f"  No errors/404s")

        browser.close()
        print("\n=== Done ===")

if __name__ == "__main__":
    run()
