#!/usr/bin/env python3
"""Phase 8.10A v2: 28 CLOSEUP screenshots — reliable element-level captures."""
import os, time, asyncio
os.environ["NODE_OPTIONS"] = ""
from playwright.async_api import async_playwright

BASE = "http://localhost:3000"
OUT = "/workspace/recruitment-dashboard/screenshots/phase-8.10a-evidence"
os.makedirs(OUT, exist_ok=True)

async def capture_selector(page, selector, name):
    """Capture a specific element. Falls back to viewport clip."""
    path = os.path.join(OUT, name)
    try:
        loc = page.locator(selector).first
        await loc.wait_for(state="visible", timeout=5000)
        box = await loc.bounding_box()
        if box and box["width"] > 10 and box["height"] > 10:
            await page.screenshot(path=path, clip=box)
            sz = os.path.getsize(path) / 1024
            print(f"  ✅ {name} ({sz:.0f} KB) [element {box['width']:.0f}x{box['height']:.0f}]")
            return
    except Exception as e:
        pass
    
    # Fallback: clip main content area
    await page.screenshot(path=path, clip={"x": 280, "y": 100, "width": 1160, "height": 780})
    sz = os.path.getsize(path) / 1024
    print(f"  ⚠️ {name} ({sz:.0f} KB) [fallback clip]")

async def capture_drawer(page, name):
    """Capture the drawer panel specifically."""
    path = os.path.join(OUT, name)
    try:
        # The drawer is a fixed position panel on the right side
        # Look for the drawer content area
        drawer = page.locator('[class*="fixed right-0 top-0 z-50"]').first
        await drawer.wait_for(state="visible", timeout=3000)
        box = await drawer.bounding_box()
        if box and box["width"] > 100:
            await page.screenshot(path=path, clip=box)
            sz = os.path.getsize(path) / 1024
            print(f"  ✅ {name} ({sz:.0f} KB) [drawer {box['width']:.0f}x{box['height']:.0f}]")
            return
    except:
        pass
    # Fallback: clip right side where drawer should be
    await page.screenshot(path=path, clip={"x": 800, "y": 0, "width": 640, "height": 900})
    sz = os.path.getsize(path) / 1024
    print(f"  ⚠️ {name} ({sz:.0f} KB) [fallback right-panel]")

async def click_tab(page, tab_label):
    """Click a tab button by label text."""
    try:
        btn = page.get_by_text(tab_label, exact=True).first
        await btn.click(timeout=3000)
        await asyncio.sleep(1.5)
        return True
    except:
        return False

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=2,
        )
        page = await ctx.new_page()
        page.set_default_timeout(15000)

        # ===================================================================
        # 01-04: Main Page Closeups
        # ===================================================================
        print("\n--- 01-04: Main Page ---")
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(5)
        
        # 01: Table data area closeup
        await capture_selector(page, "table", "01-table-data-rows-closeup.png")
        
        # 02: KPI cards area (use clip to target the stats row)
        await page.screenshot(
            path=os.path.join(OUT, "02-kpi-cards-closeup.png"),
            clip={"x": 280, "y": 100, "width": 1160, "height": 180}
        )
        sz = os.path.getsize(os.path.join(OUT, "02-kpi-cards-closeup.png")) / 1024
        print(f"  ✅ 02-kpi-cards-closeup.png ({sz:.0f} KB) [clip]")
        
        # 03: Filtered table (search "KA产品")
        search = page.locator('input[type="text"], input[type="search"]').first
        try:
            await search.fill("KA产品")
            await asyncio.sleep(1.5)
        except:
            pass
        await capture_selector(page, "table", "03-search-filtered-closeup.png")
        
        # 04: Single "转写完成" row closeup
        rows = page.locator("tbody tr")
        count = await rows.count()
        for i in range(count):
            row = rows.nth(i)
            text = await row.inner_text()
            if "转写完成" in text:
                box = await row.bounding_box()
                if box:
                    await page.screenshot(
                        path=os.path.join(OUT, "04-ready-row-closeup.png"),
                        clip=box
                    )
                    sz = os.path.getsize(os.path.join(OUT, "04-ready-row-closeup.png")) / 1024
                    print(f"  ✅ 04-ready-row-closeup.png ({sz:.0f} KB)")
                break

        # ===================================================================
        # 05-12: Drawer Tabs (open once, then switch tabs)
        # ===================================================================
        print("\n--- 05-12: Drawer Tabs ---")
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(5)
        
        # Click the "二面视频" ready row
        rows = page.locator("tbody tr")
        count = await rows.count()
        for i in range(count):
            text = await rows.nth(i).inner_text()
            if "二面视频" in text and "转写完成" in text:
                await rows.nth(i).click()
                await asyncio.sleep(5)
                break
        
        # 05: Overview tab
        await capture_drawer(page, "05-overview-drawer-closeup.png")
        
        # 06: Transcript tab
        await click_tab(page, "转写文本")
        await capture_drawer(page, "06-transcript-tab-closeup.png")
        
        # 07: Metrics tab
        await click_tab(page, "沟通指标")
        await capture_drawer(page, "07-metrics-tab-closeup.png")
        
        # 08: STAR tab
        await click_tab(page, "STAR分析")
        await capture_drawer(page, "08-star-tab-closeup.png")
        
        # 09: Evidence tab
        await click_tab(page, "证据密度")
        await capture_drawer(page, "09-evidence-tab-closeup.png")
        
        # 10: Followup tab
        await click_tab(page, "追问质量")
        await capture_drawer(page, "10-followup-tab-closeup.png")
        
        # 11: AI tab
        await click_tab(page, "AI建议")
        await capture_drawer(page, "11-ai-tab-closeup.png")
        
        # 12: Activity tab
        await click_tab(page, "活动日志")
        await capture_drawer(page, "12-activity-tab-closeup.png")

        # ===================================================================
        # 13-16: Status States
        # ===================================================================
        print("\n--- 13-16: Status States ---")
        
        # 13: Not configured
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        rows = page.locator("tbody tr")
        for i in range(await rows.count()):
            if "Provider 未配置" in await rows.nth(i).inner_text():
                await rows.nth(i).click()
                await asyncio.sleep(4)
                break
        await capture_drawer(page, "13-not-configured-closeup.png")
        
        # 14: Failed
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        rows = page.locator("tbody tr")
        for i in range(await rows.count()):
            if "转写失败" in await rows.nth(i).inner_text():
                await rows.nth(i).click()
                await asyncio.sleep(4)
                break
        await capture_drawer(page, "14-failed-closeup.png")
        
        # 15: Pending
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        rows = page.locator("tbody tr")
        for i in range(await rows.count()):
            if "等待转写" in await rows.nth(i).inner_text():
                await rows.nth(i).click()
                await asyncio.sleep(4)
                break
        await capture_drawer(page, "15-pending-closeup.png")
        
        # 16: Upload modal
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        try:
            await page.get_by_text("上传音视频").first.click(timeout=3000)
            await asyncio.sleep(1.5)
        except:
            pass
        # Capture the modal/dialog area
        await page.screenshot(
            path=os.path.join(OUT, "16-upload-modal-closeup.png"),
            clip={"x": 300, "y": 150, "width": 840, "height": 500}
        )
        sz = os.path.getsize(os.path.join(OUT, "16-upload-modal-closeup.png")) / 1024
        print(f"  ✅ 16-upload-modal-closeup.png ({sz:.0f} KB) [clip]")

        # ===================================================================
        # 17-20: Safety & Compliance
        # ===================================================================
        print("\n--- 17-20: Safety & Compliance ---")
        
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(5)
        
        # 17: Safety banner - find the banner div and capture it
        try:
            banner = page.get_by_text("本中心分析面试沟通内容").first
            box = await banner.bounding_box()
            if box:
                # Capture a wider area around the banner text
                await page.screenshot(
                    path=os.path.join(OUT, "17-safety-banner-closeup.png"),
                    clip={
                        "x": 280,
                        "y": box["y"] - 20,
                        "width": 1160,
                        "height": box["height"] + 40
                    }
                )
                sz = os.path.getsize(os.path.join(OUT, "17-safety-banner-closeup.png")) / 1024
                print(f"  ✅ 17-safety-banner-closeup.png ({sz:.0f} KB) [banner area]")
        except:
            await page.screenshot(
                path=os.path.join(OUT, "17-safety-banner-closeup.png"),
                clip={"x": 280, "y": 200, "width": 1160, "height": 80}
            )
            sz = os.path.getsize(os.path.join(OUT, "17-safety-banner-closeup.png")) / 1024
            print(f"  ✅ 17-safety-banner-closeup.png ({sz:.0f} KB) [clip]")
        
        # 18: AI two-layer labels - open AI tab in drawer
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        rows = page.locator("tbody tr")
        for i in range(await rows.count()):
            if "二面视频" in await rows.nth(i).inner_text() and "转写完成" in await rows.nth(i).inner_text():
                await rows.nth(i).click()
                await asyncio.sleep(5)
                break
        await click_tab(page, "AI建议")
        await capture_drawer(page, "18-ai-two-layer-closeup.png")
        
        # 19: KPI cards with disclaimer - overview tab
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        rows = page.locator("tbody tr")
        for i in range(await rows.count()):
            if "二面视频" in await rows.nth(i).inner_text() and "转写完成" in await rows.nth(i).inner_text():
                await rows.nth(i).click()
                await asyncio.sleep(5)
                break
        await capture_drawer(page, "19-metrics-disclaimer-closeup.png")
        
        # 20: Import modal
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        try:
            await page.get_by_text("导入转写文本").first.click(timeout=3000)
            await asyncio.sleep(1.5)
        except:
            pass
        await page.screenshot(
            path=os.path.join(OUT, "20-import-modal-closeup.png"),
            clip={"x": 300, "y": 150, "width": 840, "height": 500}
        )
        sz = os.path.getsize(os.path.join(OUT, "20-import-modal-closeup.png")) / 1024
        print(f"  ✅ 20-import-modal-closeup.png ({sz:.0f} KB) [clip]")

        # ===================================================================
        # 21-24: Detail Content Closeups
        # ===================================================================
        print("\n--- 21-24: Detail Content ---")
        
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        rows = page.locator("tbody tr")
        for i in range(await rows.count()):
            if "二面视频" in await rows.nth(i).inner_text() and "转写完成" in await rows.nth(i).inner_text():
                await rows.nth(i).click()
                await asyncio.sleep(5)
                break
        
        # 21: Transcript timeline with speaker segments
        await click_tab(page, "转写文本")
        await capture_drawer(page, "21-transcript-segments-closeup.png")
        
        # 22: Speech metrics detail
        await click_tab(page, "沟通指标")
        await capture_drawer(page, "22-speech-metrics-detail-closeup.png")
        
        # 23: STAR analysis detail
        await click_tab(page, "STAR分析")
        await capture_drawer(page, "23-star-analysis-detail-closeup.png")
        
        # 24: Evidence density with citations
        await click_tab(page, "证据密度")
        await capture_drawer(page, "24-evidence-density-closeup.png")

        # ===================================================================
        # 25-28: Final Closeups
        # ===================================================================
        print("\n--- 25-28: Final Closeups ---")
        
        # 25: Followup quality detail
        await click_tab(page, "追问质量")
        await capture_drawer(page, "25-followup-quality-closeup.png")
        
        # 26: AI suggestions with segment evidence
        await click_tab(page, "AI建议")
        await capture_drawer(page, "26-ai-suggestions-closeup.png")
        
        # 27: Tab bar closeup
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        rows = page.locator("tbody tr")
        for i in range(await rows.count()):
            if "二面视频" in await rows.nth(i).inner_text() and "转写完成" in await rows.nth(i).inner_text():
                await rows.nth(i).click()
                await asyncio.sleep(5)
                break
        await capture_drawer(page, "27-drawer-tab-bar-closeup.png")
        
        # 28: Main content area (table + KPI cards, no sidebar)
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(5)
        await page.screenshot(
            path=os.path.join(OUT, "28-main-content-closeup.png"),
            clip={"x": 280, "y": 60, "width": 1160, "height": 800}
        )
        sz = os.path.getsize(os.path.join(OUT, "28-main-content-closeup.png")) / 1024
        print(f"  ✅ 28-main-content-closeup.png ({sz:.0f} KB) [clip]")

        await browser.close()

    # Summary
    print(f"\n{'='*60}")
    new_pngs = sorted([f for f in os.listdir(OUT) if 'closeup' in f and f.endswith('.png') and '_u' not in f])
    total_size = sum(os.path.getsize(os.path.join(OUT, f)) for f in new_pngs)
    print(f"New closeups: {len(new_pngs)}, {total_size/1024:.0f} KB")
    for f in new_pngs:
        sz = os.path.getsize(os.path.join(OUT, f)) / 1024
        flag = "⚠️ SMALL" if sz < 30 else ("⚠️ BIG" if sz > 800 else "✅")
        print(f"  {flag} {f} ({sz:.0f} KB)")

if __name__ == "__main__":
    asyncio.run(main())
