#!/usr/bin/env python3
"""Phase 8.9A: 10 targeted closeup screenshots for Final UI/UX Polish."""

import os, time, json, urllib.request
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
OUT_DIR = "/workspace/recruitment-dashboard/screenshots/phase-8.9-integration"
os.makedirs(OUT_DIR, exist_ok=True)

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
        page = context.new_page()

        def fullpage(name):
            path = os.path.join(OUT_DIR, name)
            page.screenshot(path=path, full_page=True)
            print(f"  ✓ {name} ({os.path.getsize(path)/1024:.0f} KB)")
            return path

        def clip_text(name, text, h=600, ex=100, ey=60):
            path = os.path.join(OUT_DIR, name)
            el = page.get_by_text(text, exact=False).first
            if el:
                try:
                    el.scroll_into_view_if_needed()
                    time.sleep(0.5)
                    box = el.bounding_box()
                    if box and box["width"] > 0:
                        page.screenshot(path=path, clip={
                            "x": max(0, box["x"] - ex), "y": max(0, box["y"] - ey),
                            "width": min(1440, box["width"] + ex*2), "height": h,
                        })
                        print(f"  ✓ {name} ({os.path.getsize(path)/1024:.0f} KB)")
                        return path
                except: pass
            fullpage(name)
            return path

        # ── 1. integrations-status-visual-differentiation-closeup.png ──
        print("1. Status visual differentiation (6 states)...")
        page.goto(f"{BASE}/integrations", wait_until="networkidle")
        time.sleep(3)
        # Scroll to show all provider cards with their status badges
        fullpage("integrations-status-visual-differentiation-closeup.png")

        # ── 2. moka-readonly-human-copy-closeup.png ──
        print("2. Moka readonly human copy...")
        page.goto(f"{BASE}/integrations", wait_until="networkidle")
        time.sleep(2)
        clip_text("moka-readonly-human-copy-closeup.png", "Moka", 400)

        # ── 3. feishu-permission-required-human-copy-closeup.png ──
        print("3. Feishu permission required human copy...")
        clip_text("feishu-permission-required-human-copy-closeup.png", "飞书", 400)

        # ── 4. integration-run-logs-human-readable-closeup.png ──
        print("4. Run logs human readable...")
        page.goto(f"{BASE}/integrations", wait_until="networkidle")
        time.sleep(2)
        # Click DeepSeek card to open drawer, then go to Run Logs tab
        deepseek = page.get_by_text("DeepSeek AI", exact=False).first
        if deepseek:
            try:
                deepseek.click()
                time.sleep(1)
            except: pass
        logs_tab = page.get_by_text("运行日志", exact=False).first
        if logs_tab:
            try:
                logs_tab.click()
                time.sleep(1)
            except: pass
        fullpage("integration-run-logs-human-readable-closeup.png")

        # ── 5. integration-provider-grouping-closeup.png ──
        print("5. Provider grouping (AI/招聘系统/协同工具)...")
        page.goto(f"{BASE}/integrations", wait_until="networkidle")
        time.sleep(2)
        fullpage("integration-provider-grouping-closeup.png")

        # ── 6. integration-secret-masked-and-security-hint-closeup.png ──
        print("6. Secret masked + security hint...")
        page.goto(f"{BASE}/integrations", wait_until="networkidle")
        time.sleep(2)
        # Click DeepSeek, then Config tab
        deepseek2 = page.get_by_text("DeepSeek AI", exact=False).first
        if deepseek2:
            try:
                deepseek2.click()
                time.sleep(1)
            except: pass
        config_tab = page.get_by_text("配置详情", exact=False).first
        if config_tab:
            try:
                config_tab.click()
                time.sleep(1)
            except: pass
        fullpage("integration-secret-masked-and-security-hint-closeup.png")

        # ── 7. integration-test-connection-states-closeup.png ──
        print("7. Test connection states (DeepSeek success, feishu/moka not_configured)...")
        page.goto(f"{BASE}/integrations", wait_until="networkidle")
        time.sleep(2)
        fullpage("integration-test-connection-states-closeup.png")

        # ── 8. external-mappings-readable-scope-safe-closeup.png ──
        print("8. External mappings readable + scope safe...")
        page.goto(f"{BASE}/integrations", wait_until="networkidle")
        time.sleep(2)
        deepseek3 = page.get_by_text("DeepSeek AI", exact=False).first
        if deepseek3:
            try:
                deepseek3.click()
                time.sleep(1)
            except: pass
        mappings_tab = page.get_by_text("外部映射", exact=False).first
        if mappings_tab:
            try:
                mappings_tab.click()
                time.sleep(1)
            except: pass
        fullpage("external-mappings-readable-scope-safe-closeup.png")

        # ── 9. ai-copilot-go-to-provider-config-link.png ──
        print("9. AI Copilot → provider config link...")
        page.goto(f"{BASE}/knowledge", wait_until="networkidle")
        time.sleep(3)
        # Scroll to AI Copilot hint section
        ai_hint = page.get_by_text("AI Copilot 集成", exact=False).first
        if ai_hint:
            try:
                ai_hint.scroll_into_view_if_needed()
                time.sleep(0.5)
            except: pass
        fullpage("ai-copilot-go-to-provider-config-link.png")

        # ── 10. integration-no-brand-logo-proof.png ──
        print("10. No brand logo proof...")
        page.goto(f"{BASE}/integrations", wait_until="networkidle")
        time.sleep(2)
        fullpage("integration-no-brand-logo-proof.png")

        browser.close()

    print(f"\n✅ All 10 screenshots saved to {OUT_DIR}")
    for f in sorted(os.listdir(OUT_DIR)):
        if f.endswith('.png') and not f.endswith('_u.png'):
            sz = os.path.getsize(os.path.join(OUT_DIR, f)) / 1024
            print(f"  {f} ({sz:.0f} KB)")

if __name__ == "__main__":
    main()
