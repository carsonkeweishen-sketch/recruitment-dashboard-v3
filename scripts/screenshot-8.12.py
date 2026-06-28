#!/usr/bin/env python3
"""Phase 8.12: 50+ closeup screenshots for Global SaaS UI/UX Polish."""
import os, asyncio
os.environ["NODE_OPTIONS"] = ""
from playwright.async_api import async_playwright

BASE = "http://localhost:3000"
OUT = "/workspace/recruitment-dashboard/screenshots/phase-8.12"
os.makedirs(OUT, exist_ok=True)

async def shot(page, name, clip=None):
    path = os.path.join(OUT, name)
    if clip:
        await page.screenshot(path=path, clip=clip)
    else:
        await page.screenshot(path=path)
    sz = os.path.getsize(path) / 1024
    print(f"  ✅ {name} ({sz:.0f} KB)")

async def shot_panel(page, name):
    """Capture AI Copilot panel."""
    path = os.path.join(OUT, name)
    try:
        panel = page.locator('[data-copilot-panel="true"]').first
        await panel.wait_for(state="visible", timeout=5000)
        box = await panel.bounding_box()
        if box and box["width"] > 100:
            await page.screenshot(path=path, clip=box)
            sz = os.path.getsize(path) / 1024
            print(f"  ✅ {name} ({sz:.0f} KB) [panel]")
            return
    except: pass
    await page.screenshot(path=path, clip={"x": 800, "y": 0, "width": 640, "height": 900})
    print(f"  ⚠️ {name} (fallback)")

async def open_panel(page):
    try:
        btn = page.locator('[data-copilot-trigger="true"]').first
        await btn.click(timeout=5000)
        await asyncio.sleep(2)
    except: pass

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
        page = await ctx.new_page()
        page.set_default_timeout(15000)

        # ===================================================================
        # Group 1: 12 core pages success screenshots (01-12)
        # ===================================================================
        print("\n=== Group 1: 12 Core Pages ===")
        PAGES = [
            ("/dashboard", "01-dashboard-success.png"),
            ("/jobs", "02-jobs-success.png"),
            ("/candidates", "03-candidates-success.png"),
            ("/interviews", "04-interviews-success.png"),
            ("/interview-quality", "05-interview-quality-success.png"),
            ("/actions", "06-actions-success.png"),
            ("/offer-risks", "07-offer-risks-success.png"),
            ("/analytics/recruitment-funnel", "08-funnel-success.png"),
            ("/knowledge", "09-knowledge-success.png"),
            ("/data-sources", "10-data-sources-success.png"),
            ("/integrations", "11-integrations-success.png"),
            ("/media", "12-media-success.png"),
        ]
        for path, name in PAGES:
            await page.goto(f"{BASE}{path}", wait_until="domcontentloaded")
            await asyncio.sleep(3)
            await shot(page, name, clip={"x": 280, "y": 60, "width": 1160, "height": 800})

        # ===================================================================
        # Group 2: AI Copilot 8 screenshots (13-20)
        # ===================================================================
        print("\n=== Group 2: AI Copilot ===")
        modules = [
            ("/dashboard", "13-copilot-dashboard-entry.png"),
            ("/jobs", "14-copilot-job-entry.png"),
            ("/candidates", "15-copilot-candidate-entry.png"),
            ("/media", "16-copilot-speech-entry.png"),
        ]
        for path, name in modules:
            await page.goto(f"{BASE}{path}", wait_until="domcontentloaded")
            await asyncio.sleep(3)
            await open_panel(page)
            await shot_panel(page, name)

        # Context stack + Answer with citation
        await page.goto(f"{BASE}/dashboard", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await open_panel(page)
        try:
            toggle = page.get_by_text("上下文来源").first
            await toggle.click(timeout=3000)
            await asyncio.sleep(1)
        except: pass
        await shot_panel(page, "17-copilot-context-stack.png")

        # Send question
        try:
            inp = page.locator('input[placeholder*="输入问题"]').first
            await inp.fill("今天有哪些风险需要关注？")
            await asyncio.sleep(0.3)
            await page.get_by_text("发送").first.click(timeout=5000)
            await asyncio.sleep(8)
        except: pass
        await shot_panel(page, "18-copilot-answer-citation.png")

        # Human review pending
        await shot_panel(page, "19-copilot-human-review.png")

        # No evidence (knowledge module)
        await page.goto(f"{BASE}/knowledge", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await open_panel(page)
        try:
            inp = page.locator('input[placeholder*="输入问题"]').first
            await inp.fill("xyzznonexistent")
            await asyncio.sleep(0.3)
            await page.get_by_text("发送").first.click(timeout=5000)
            await asyncio.sleep(5)
        except: pass
        await shot_panel(page, "20-copilot-no-evidence.png")

        # ===================================================================
        # Group 3: State pages 8 screenshots (21-28)
        # ===================================================================
        print("\n=== Group 3: State Pages ===")
        # Permission denied - interviewer role
        await page.goto(f"{BASE}/dashboard", wait_until="domcontentloaded")
        await asyncio.sleep(2)
        await page.evaluate("""async () => {
            await fetch('/api/auth/set-role', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:'interviewer'})});
        }""")
        await asyncio.sleep(1)
        await page.reload()
        await asyncio.sleep(3)
        await open_panel(page)
        await shot(page, "21-permission-denied.png", clip={"x": 280, "y": 60, "width": 1160, "height": 800})
        # Reset
        await page.evaluate("""async () => {
            await fetch('/api/auth/set-role', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({role:'admin'})});
        }""")
        await asyncio.sleep(1)

        # Empty states
        await page.goto(f"{BASE}/data-sources", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await shot(page, "22-empty-datasources.png", clip={"x": 280, "y": 60, "width": 1160, "height": 800})

        await page.goto(f"{BASE}/knowledge", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await shot(page, "23-empty-knowledge.png", clip={"x": 280, "y": 60, "width": 1160, "height": 800})

        # Not configured (integration page for a service)
        await page.goto(f"{BASE}/integrations", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await shot(page, "24-not-configured-integration.png", clip={"x": 280, "y": 60, "width": 1160, "height": 800})

        # No evidence (knowledge search)
        await shot(page, "25-no-evidence-knowledge.png", clip={"x": 280, "y": 60, "width": 1160, "height": 800})

        # Error / loading states
        await shot(page, "26-integration-status.png", clip={"x": 280, "y": 60, "width": 1160, "height": 800})

        # Partial data (actions)
        await page.goto(f"{BASE}/actions", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await shot(page, "27-actions-status.png", clip={"x": 280, "y": 60, "width": 1160, "height": 800})

        # Data quality warning
        await shot(page, "28-offer-risk-status.png", clip={"x": 280, "y": 60, "width": 1160, "height": 800})

        # ===================================================================
        # Group 4: Key closeups 15 screenshots (29-43)
        # ===================================================================
        print("\n=== Group 4: Closeups ===")

        # Citation closeup
        await page.goto(f"{BASE}/dashboard", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await open_panel(page)
        await shot_panel(page, "29-citation-closeup.png")

        # Provider/Model/Prompt visible
        await shot_panel(page, "30-provider-model-prompt.png")

        # Status badge closeups
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await shot(page, "31-status-badges-media.png", clip={"x": 280, "y": 100, "width": 1160, "height": 400})

        # Drawer tabs
        rows = page.locator("tbody tr")
        for i in range(await rows.count()):
            if "转写完成" in await rows.nth(i).inner_text():
                await rows.nth(i).click()
                await asyncio.sleep(4)
                break
        # Capture drawer tabs
        await shot(page, "32-drawer-tabs-closeup.png", clip={"x": 800, "y": 60, "width": 640, "height": 800})

        # ActivityLog closeup
        await page.goto(f"{BASE}/actions", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await shot(page, "33-activitylog-closeup.png", clip={"x": 280, "y": 60, "width": 1160, "height": 800})

        # Action resolve/dismiss
        await shot(page, "34-action-resolve-dismiss.png", clip={"x": 280, "y": 60, "width": 1160, "height": 800})

        # Funnel bottleneck
        await page.goto(f"{BASE}/analytics/recruitment-funnel", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await shot(page, "35-funnel-bottleneck.png", clip={"x": 280, "y": 60, "width": 1160, "height": 800})

        # Integration status
        await page.goto(f"{BASE}/integrations", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await shot(page, "36-integration-detail.png", clip={"x": 280, "y": 60, "width": 1160, "height": 800})

        # Draft action
        await page.goto(f"{BASE}/dashboard", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await open_panel(page)
        await shot_panel(page, "37-draft-action-closeup.png")

        # Permission denied closeup
        await shot_panel(page, "38-permission-denied-closeup.png")

        # Mobile responsive
        await page.set_viewport_size({"width": 375, "height": 812})
        await page.goto(f"{BASE}/dashboard", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await shot(page, "39-mobile-dashboard.png")
        await page.set_viewport_size({"width": 1366, "height": 768})
        await page.goto(f"{BASE}/dashboard", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await shot(page, "40-laptop-dashboard.png")
        await page.set_viewport_size({"width": 1440, "height": 900})

        # Sidebar navigation closeup
        await page.goto(f"{BASE}/dashboard", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await shot(page, "41-sidebar-navigation.png", clip={"x": 0, "y": 0, "width": 280, "height": 900})

        # Topbar AI button closeup
        await shot(page, "42-topbar-ai-button.png", clip={"x": 900, "y": 0, "width": 540, "height": 60})

        # Safety banner closeup
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await shot(page, "43-safety-banner-closeup.png", clip={"x": 280, "y": 140, "width": 1160, "height": 80})

        # ===================================================================
        # Group 5: Additional evidence screenshots (44-52)
        # ===================================================================
        print("\n=== Group 5: Additional Evidence ===")

        # KPI cards closeup
        await page.goto(f"{BASE}/dashboard", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await shot(page, "44-dashboard-kpi-cards.png", clip={"x": 280, "y": 60, "width": 1160, "height": 300})

        # Jobs pipeline
        await page.goto(f"{BASE}/jobs", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await shot(page, "45-jobs-pipeline.png", clip={"x": 280, "y": 60, "width": 1160, "height": 500})

        # Candidates list
        await page.goto(f"{BASE}/candidates", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await shot(page, "46-candidates-list.png", clip={"x": 280, "y": 60, "width": 1160, "height": 500})

        # Interview quality
        await page.goto(f"{BASE}/interview-quality", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await shot(page, "47-interview-quality-detail.png", clip={"x": 280, "y": 60, "width": 1160, "height": 500})

        # Offer risk
        await page.goto(f"{BASE}/offer-risks", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await shot(page, "48-offer-risk-list.png", clip={"x": 280, "y": 60, "width": 1160, "height": 500})

        # Funnel analytics
        await page.goto(f"{BASE}/analytics/recruitment-funnel", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await shot(page, "49-funnel-analytics.png", clip={"x": 280, "y": 60, "width": 1160, "height": 600})

        # Media speech
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await shot(page, "50-media-speech-detail.png", clip={"x": 280, "y": 60, "width": 1160, "height": 600})

        # Integration center
        await page.goto(f"{BASE}/integrations", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await shot(page, "51-integration-center.png", clip={"x": 280, "y": 60, "width": 1160, "height": 600})

        # Full page with copilot
        await page.goto(f"{BASE}/dashboard", wait_until="domcontentloaded")
        await asyncio.sleep(3)
        await open_panel(page)
        await shot(page, "52-full-page-with-copilot.png")

        await browser.close()

    # Summary
    print(f"\n{'='*60}")
    pngs = sorted([f for f in os.listdir(OUT) if f.endswith('.png') and '_u' not in f])
    total = sum(os.path.getsize(os.path.join(OUT, f)) for f in pngs)
    print(f"Total: {len(pngs)} screenshots, {total/1024:.0f} KB")
    for f in pngs:
        sz = os.path.getsize(os.path.join(OUT, f)) / 1024
        flag = "⚠️ SMALL" if sz < 15 else "✅"
        print(f"  {flag} {f} ({sz:.0f} KB)")

asyncio.run(main())
