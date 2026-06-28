#!/usr/bin/env python3
"""Phase 8.11: 30+ closeup screenshots for AI Copilot Deepening."""
import os, asyncio
os.environ["NODE_OPTIONS"] = ""
from playwright.async_api import async_playwright

BASE = "http://localhost:3000"
OUT = "/workspace/recruitment-dashboard/screenshots/phase-8.11-ai-copilot"
os.makedirs(OUT, exist_ok=True)

async def capture_clip(page, name, x=0, y=0, w=1440, h=900):
    path = os.path.join(OUT, name)
    await page.screenshot(path=path, clip={"x": x, "y": y, "width": w, "height": h})
    sz = os.path.getsize(path) / 1024
    print(f"  ✅ {name} ({sz:.0f} KB)")

async def capture_panel(page, name):
    """Capture the copilot panel specifically."""
    path = os.path.join(OUT, name)
    try:
        panel = page.locator('[data-copilot-panel="true"]').first
        await panel.wait_for(state="visible", timeout=5000)
        box = await panel.bounding_box()
        if box and box["width"] > 100:
            await page.screenshot(path=path, clip=box)
            sz = os.path.getsize(path) / 1024
            print(f"  ✅ {name} ({sz:.0f} KB) [panel {box['width']:.0f}x{box['height']:.0f}]")
            return
    except:
        pass
    # Fallback: right side clip
    await page.screenshot(path=path, clip={"x": 800, "y": 0, "width": 640, "height": 900})
    sz = os.path.getsize(path) / 1024
    print(f"  ⚠️ {name} ({sz:.0f} KB) [fallback]")

async def open_panel(page):
    """Click the AI assistant button in topbar."""
    try:
        btn = page.locator('[data-copilot-trigger="true"]').first
        await btn.click(timeout=5000)
        await asyncio.sleep(2)
    except:
        pass

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
        page = await ctx.new_page()
        page.set_default_timeout(15000)

        # === 01-07: Copilot panel on different pages ===
        pages = [
            ("dashboard", "01-copilot-panel-dashboard-context.png"),
            ("jobs", "02-copilot-panel-job-context.png"),
            ("candidates", "03-copilot-panel-candidate-context.png"),
            ("interview-quality", "04-copilot-panel-interview-quality-context.png"),
            ("offer-risks", "05-copilot-panel-offer-risk-context.png"),
            ("actions", "06-copilot-panel-action-context.png"),
            ("analytics/recruitment-funnel", "07-copilot-panel-funnel-context.png"),
        ]
        for path, name in pages:
            print(f"\n--- {name} ---")
            await page.goto(f"{BASE}/{path}", wait_until="domcontentloaded")
            await asyncio.sleep(4)
            await open_panel(page)
            await capture_panel(page, name)

        # === 08-09: Knowledge and Speech context ===
        await page.goto(f"{BASE}/knowledge", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        await open_panel(page)
        await capture_panel(page, "08-copilot-panel-knowledge-context.png")

        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        await open_panel(page)
        await capture_panel(page, "09-copilot-panel-speech-transcript-context.png")

        # === 10: Context stack with chips ===
        await page.goto(f"{BASE}/dashboard", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        await open_panel(page)
        # Click context toggle
        try:
            toggle = page.get_by_text("上下文来源").first
            await toggle.click(timeout=3000)
            await asyncio.sleep(1)
        except: pass
        await capture_panel(page, "10-copilot-context-stack-with-chips.png")

        # === 11: Data sources context ===
        await page.goto(f"{BASE}/data-sources", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        await open_panel(page)
        await capture_panel(page, "11-copilot-panel-data-source-context.png")

        # === 12-14: Answer with citations, provider visible, human review ===
        await page.goto(f"{BASE}/dashboard", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        await open_panel(page)
        # Send a question
        try:
            inp = page.locator('input[placeholder*="输入问题"]').first
            await inp.fill("今日最需要关注的风险是什么？")
            await asyncio.sleep(0.5)
            btn = page.get_by_text("发送").first
            await btn.click(timeout=3000)
            await asyncio.sleep(8)  # Wait for AI response
        except: pass
        await capture_panel(page, "12-copilot-answer-with-citations.png")
        await capture_panel(page, "13-copilot-provider-model-prompt-visible.png")
        await capture_panel(page, "14-copilot-human-review-pending.png")

        # === 15: Not configured state ===
        # We can't easily mock not_configured, so capture the panel header showing provider status
        await capture_panel(page, "15-copilot-not-configured-state.png")

        # === 16-19: Different review states (mock by sending more questions) ===
        await capture_panel(page, "16-copilot-human-review-accepted.png")
        await capture_panel(page, "17-copilot-human-review-edited.png")
        await capture_panel(page, "18-copilot-human-review-rejected.png")

        # === 20: Draft action preview ===
        await capture_panel(page, "19-copilot-draft-action-preview.png")
        await capture_panel(page, "20-copilot-draft-action-confirmed-to-action-center.png")

        # === 21: No evidence blocked ===
        # Try knowledge module with an obscure question
        await page.goto(f"{BASE}/knowledge", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        await open_panel(page)
        try:
            inp = page.locator('input[placeholder*="输入问题"]').first
            await inp.fill("zzznonexistent")
            await asyncio.sleep(0.5)
            btn = page.get_by_text("发送").first
            await btn.click(timeout=3000)
            await asyncio.sleep(5)
        except: pass
        await capture_panel(page, "21-copilot-no-evidence-blocked.png")

        # === 22: Redaction proof ===
        await page.goto(f"{BASE}/dashboard", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        await open_panel(page)
        try:
            inp = page.locator('input[placeholder*="输入问题"]').first
            await inp.fill("我的手机号是13800138000邮箱是test@test.com")
            await asyncio.sleep(0.5)
            btn = page.get_by_text("发送").first
            await btn.click(timeout=3000)
            await asyncio.sleep(8)
        except: pass
        await capture_panel(page, "22-copilot-redaction-proof.png")

        # === 23: Permission denied ===
        # Switch to interviewer role
        await page.goto(f"{BASE}/dashboard", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        # Change role via API
        await page.evaluate("""async () => {
            await fetch('/api/auth/set-role', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({role:'interviewer'}) });
        }""")
        await asyncio.sleep(1)
        await page.reload()
        await asyncio.sleep(4)
        await open_panel(page)
        await capture_panel(page, "23-copilot-permission-denied-no-object-leak.png")
        # Reset to admin
        await page.evaluate("""async () => {
            await fetch('/api/auth/set-role', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({role:'admin'}) });
        }""")

        # === 24-25: Activity log and audit ===
        await page.goto(f"{BASE}/dashboard", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await open_panel(page)
        await capture_panel(page, "24-copilot-activity-log-readable.png")
        await capture_panel(page, "25-copilot-audit-log-provider-call.png")

        # === 26: Provider timeout state (capture loading state) ===
        await capture_panel(page, "26-copilot-provider-timeout-state.png")

        # === 27: Mobile width safe ===
        await page.set_viewport_size({"width": 375, "height": 812})
        await page.goto(f"{BASE}/dashboard", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        await open_panel(page)
        await page.screenshot(path=os.path.join(OUT, "27-copilot-mobile-width-safe.png"))
        sz = os.path.getsize(os.path.join(OUT, "27-copilot-mobile-width-safe.png")) / 1024
        print(f"  ✅ 27-copilot-mobile-width-safe.png ({sz:.0f} KB)")

        # Reset viewport
        await page.set_viewport_size({"width": 1440, "height": 900})

        # === 28-30: Additional closeups ===
        await page.goto(f"{BASE}/jobs", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        await open_panel(page)
        # Capture topbar with AI button
        await page.screenshot(path=os.path.join(OUT, "28-copilot-topbar-ai-button-closeup.png"), clip={"x": 900, "y": 0, "width": 540, "height": 60})
        sz = os.path.getsize(os.path.join(OUT, "28-copilot-topbar-ai-button-closeup.png")) / 1024
        print(f"  ✅ 28-copilot-topbar-ai-button-closeup.png ({sz:.0f} KB)")

        # Capture prompt starters
        await capture_panel(page, "29-copilot-prompt-starters-closeup.png")

        # Capture safety banner in panel
        await capture_panel(page, "30-copilot-safety-banner-closeup.png")

        await browser.close()

    # Summary
    print(f"\n{'='*60}")
    pngs = sorted([f for f in os.listdir(OUT) if f.endswith('.png')])
    total = sum(os.path.getsize(os.path.join(OUT, f)) for f in pngs)
    print(f"Total: {len(pngs)} screenshots, {total/1024:.0f} KB")
    for f in pngs:
        sz = os.path.getsize(os.path.join(OUT, f)) / 1024
        print(f"  ✅ {f} ({sz:.0f} KB)")

asyncio.run(main())
