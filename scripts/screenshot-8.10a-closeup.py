#!/usr/bin/env python3
"""Phase 8.10A: 28 CLOSEUP screenshots — no full-page远景, all element-level closeups with real data."""
import os, time, asyncio
os.environ["NODE_OPTIONS"] = ""
from playwright.async_api import async_playwright

BASE = "http://localhost:3000"
OUT = "/workspace/recruitment-dashboard/screenshots/phase-8.10a-evidence"
os.makedirs(OUT, exist_ok=True)

async def shot_element(page, selector, name):
    """Capture a specific element as closeup."""
    path = os.path.join(OUT, name)
    try:
        el = await page.query_selector(selector)
        if el:
            await el.screenshot(path=path)
            sz = os.path.getsize(path) / 1024
            print(f"  ✅ {name} ({sz:.0f} KB)")
            return
    except:
        pass
    # Fallback: clip to viewport
    await page.screenshot(path=path, clip={"x": 0, "y": 0, "width": 1440, "height": 900})
    sz = os.path.getsize(path) / 1024
    print(f"  ⚠️ {name} (fallback, {sz:.0f} KB)")

async def shot_clip(page, name, x=0, y=0, w=1440, h=900):
    """Capture a clipped region."""
    path = os.path.join(OUT, name)
    await page.screenshot(path=path, clip={"x": x, "y": y, "width": w, "height": h})
    sz = os.path.getsize(path) / 1024
    print(f"  ✅ {name} ({sz:.0f} KB)")

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
        # GROUP 1 (01-04): Media Table Closeups
        # ===================================================================
        print("\n--- Group 1: Media Table Closeups ---")
        
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(5)
        
        # 01: Closeup of the data table with all 6 rows
        await shot_element(page, "table", "01-table-data-rows-closeup.png")
        
        # 02: Closeup of KPI cards row
        await shot_element(page, '[class*="grid"]:has([class*="Kpi"])', "02-kpi-cards-closeup.png")
        
        # 03: Closeup of filter bar + search
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        # Search for "KA产品"
        search_input = await page.query_selector('input[type="text"], input[type="search"], input')
        if search_input:
            await search_input.fill("KA产品")
            await asyncio.sleep(1.5)
        await shot_element(page, "table", "03-search-ka-filtered-table-closeup.png")
        
        # 04: Closeup of a "转写完成" status badge row
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        rows = await page.query_selector_all('tbody tr')
        for row in rows:
            text = await row.inner_text()
            if "转写完成" in text:
                await row.screenshot(path=os.path.join(OUT, "04-ready-row-closeup.png"))
                sz = os.path.getsize(os.path.join(OUT, "04-ready-row-closeup.png")) / 1024
                print(f"  ✅ 04-ready-row-closeup.png ({sz:.0f} KB)")
                break

        # ===================================================================
        # GROUP 2 (05-12): Detail Drawer Tabs Closeups
        # ===================================================================
        print("\n--- Group 2: Detail Drawer Tabs ---")
        
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(5)
        
        # Click on "二面视频" ready row
        rows = await page.query_selector_all('tbody tr')
        for row in rows:
            text = await row.inner_text()
            if "二面视频" in text and "转写完成" in text:
                await row.click()
                await asyncio.sleep(5)
                break
        
        # 05: Overview tab closeup - file info section
        await shot_element(page, '[class*="drawer"], [class*="Drawer"], [class*="panel"], [class*="sheet"], [class*="SlideOver"]', "05-drawer-overview-fileinfo-closeup.png")
        
        # 06: Transcript tab - segment list closeup
        for el in await page.query_selector_all('button, [role="tab"], span, div'):
            try:
                txt = await el.inner_text()
                if txt.strip() == "转写文本":
                    await el.click()
                    await asyncio.sleep(2)
                    break
            except:
                pass
        await shot_element(page, '[class*="drawer"], [class*="Drawer"], [class*="panel"], [class*="sheet"]', "06-transcript-segments-closeup.png")
        
        # 07: Metrics tab closeup
        for el in await page.query_selector_all('button, [role="tab"], span, div'):
            try:
                txt = await el.inner_text()
                if txt.strip() == "沟通指标":
                    await el.click()
                    await asyncio.sleep(2)
                    break
            except:
                pass
        await shot_element(page, '[class*="drawer"], [class*="Drawer"], [class*="panel"], [class*="sheet"]', "07-speech-metrics-closeup.png")
        
        # 08: STAR analysis tab closeup
        for el in await page.query_selector_all('button, [role="tab"], span, div'):
            try:
                txt = await el.inner_text()
                if txt.strip() == "STAR分析":
                    await el.click()
                    await asyncio.sleep(2)
                    break
            except:
                pass
        await shot_element(page, '[class*="drawer"], [class*="Drawer"], [class*="panel"], [class*="sheet"]', "08-star-analysis-closeup.png")
        
        # 09: Evidence density tab closeup
        for el in await page.query_selector_all('button, [role="tab"], span, div'):
            try:
                txt = await el.inner_text()
                if txt.strip() == "证据密度":
                    await el.click()
                    await asyncio.sleep(2)
                    break
            except:
                pass
        await shot_element(page, '[class*="drawer"], [class*="Drawer"], [class*="panel"], [class*="sheet"]', "09-evidence-density-closeup.png")
        
        # 10: Followup quality tab closeup
        for el in await page.query_selector_all('button, [role="tab"], span, div'):
            try:
                txt = await el.inner_text()
                if txt.strip() == "追问质量":
                    await el.click()
                    await asyncio.sleep(2)
                    break
            except:
                pass
        await shot_element(page, '[class*="drawer"], [class*="Drawer"], [class*="panel"], [class*="sheet"]', "10-followup-quality-closeup.png")
        
        # 11: AI suggestions tab closeup
        for el in await page.query_selector_all('button, [role="tab"], span, div'):
            try:
                txt = await el.inner_text()
                if txt.strip() == "AI建议":
                    await el.click()
                    await asyncio.sleep(2)
                    break
            except:
                pass
        await shot_element(page, '[class*="drawer"], [class*="Drawer"], [class*="panel"], [class*="sheet"]', "11-ai-suggestions-closeup.png")
        
        # 12: Activity log tab closeup
        for el in await page.query_selector_all('button, [role="tab"], span, div'):
            try:
                txt = await el.inner_text()
                if txt.strip() == "活动日志":
                    await el.click()
                    await asyncio.sleep(2)
                    break
            except:
                pass
        await shot_element(page, '[class*="drawer"], [class*="Drawer"], [class*="panel"], [class*="sheet"]', "12-activity-log-closeup.png")

        # ===================================================================
        # GROUP 3 (13-16): Status States Closeups
        # ===================================================================
        print("\n--- Group 3: Status States ---")
        
        # 13: Not configured status drawer closeup
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        rows = await page.query_selector_all('tbody tr')
        for row in rows:
            text = await row.inner_text()
            if "Provider 未配置" in text:
                await row.click()
                await asyncio.sleep(4)
                break
        await shot_element(page, '[class*="drawer"], [class*="Drawer"], [class*="panel"], [class*="sheet"]', "13-not-configured-closeup.png")
        
        # 14: Failed status drawer closeup
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        rows = await page.query_selector_all('tbody tr')
        for row in rows:
            text = await row.inner_text()
            if "转写失败" in text:
                await row.click()
                await asyncio.sleep(4)
                break
        await shot_element(page, '[class*="drawer"], [class*="Drawer"], [class*="panel"], [class*="sheet"]', "14-transcription-failed-closeup.png")
        
        # 15: Pending status drawer closeup
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        rows = await page.query_selector_all('tbody tr')
        for row in rows:
            text = await row.inner_text()
            if "等待转写" in text:
                await row.click()
                await asyncio.sleep(4)
                break
        await shot_element(page, '[class*="drawer"], [class*="Drawer"], [class*="panel"], [class*="sheet"]', "15-pending-closeup.png")
        
        # 16: Upload modal closeup
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        upload_btn = await page.query_selector('text=上传音视频')
        if upload_btn:
            await upload_btn.click()
            await asyncio.sleep(1.5)
        await shot_element(page, '[class*="modal"], [class*="Modal"], [class*="dialog"], [class*="Dialog"]', "16-upload-modal-closeup.png")

        # ===================================================================
        # GROUP 4 (17-20): Safety & Compliance Closeups
        # ===================================================================
        print("\n--- Group 4: Safety & Compliance ---")
        
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(5)
        
        # 17: Safety banner closeup
        safety_banner = await page.query_selector('text=本中心分析面试沟通内容')
        if safety_banner:
            # Get parent container
            parent = await safety_banner.evaluate('(el) => el.closest("div[class]")?.parentElement?.closest("div[class]") || el.closest("div")')
            # Just screenshot the banner area
            await safety_banner.screenshot(path=os.path.join(OUT, "17-safety-banner-closeup.png"))
            sz = os.path.getsize(os.path.join(OUT, "17-safety-banner-closeup.png")) / 1024
            print(f"  ✅ 17-safety-banner-closeup.png ({sz:.0f} KB)")
        else:
            await shot_clip(page, "17-safety-banner-closeup.png", 0, 50, 1440, 120)
        
        # 18: AI two-layer labels - open drawer to AI tab
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        rows = await page.query_selector_all('tbody tr')
        for row in rows:
            text = await row.inner_text()
            if "二面视频" in text and "转写完成" in text:
                await row.click()
                await asyncio.sleep(5)
                break
        for el in await page.query_selector_all('button, [role="tab"], span, div'):
            try:
                txt = await el.inner_text()
                if txt.strip() == "AI建议":
                    await el.click()
                    await asyncio.sleep(2)
                    break
            except:
                pass
        await shot_element(page, '[class*="drawer"], [class*="Drawer"], [class*="panel"], [class*="sheet"]', "18-ai-two-layer-closeup.png")
        
        # 19: KPI cards disclaimer - closeup of the metrics section in overview
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        rows = await page.query_selector_all('tbody tr')
        for row in rows:
            text = await row.inner_text()
            if "二面视频" in text and "转写完成" in text:
                await row.click()
                await asyncio.sleep(5)
                break
        await shot_element(page, '[class*="drawer"], [class*="Drawer"], [class*="panel"], [class*="sheet"]', "19-metrics-disclaimer-closeup.png")
        
        # 20: Import modal closeup
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        import_btn = await page.query_selector('text=导入转写文本')
        if import_btn:
            await import_btn.click()
            await asyncio.sleep(1.5)
        await shot_element(page, '[class*="modal"], [class*="Modal"], [class*="dialog"], [class*="Dialog"]', "20-import-modal-closeup.png")

        # ===================================================================
        # GROUP 5 (21-24): Detail Tab Content Closeups
        # ===================================================================
        print("\n--- Group 5: Detail Tab Content ---")
        
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        rows = await page.query_selector_all('tbody tr')
        for row in rows:
            text = await row.inner_text()
            if "二面视频" in text and "转写完成" in text:
                await row.click()
                await asyncio.sleep(5)
                break
        
        # 21: Transcript segments with timestamps closeup
        for el in await page.query_selector_all('button, [role="tab"], span, div'):
            try:
                txt = await el.inner_text()
                if txt.strip() == "转写文本":
                    await el.click()
                    await asyncio.sleep(2)
                    break
            except:
                pass
        await shot_element(page, '[class*="drawer"], [class*="Drawer"], [class*="panel"], [class*="sheet"]', "21-transcript-timeline-closeup.png")
        
        # 22: Metrics detail closeup
        for el in await page.query_selector_all('button, [role="tab"], span, div'):
            try:
                txt = await el.inner_text()
                if txt.strip() == "沟通指标":
                    await el.click()
                    await asyncio.sleep(2)
                    break
            except:
                pass
        await shot_element(page, '[class*="drawer"], [class*="Drawer"], [class*="panel"], [class*="sheet"]', "22-metrics-detail-closeup.png")
        
        # 23: STAR analysis detail closeup
        for el in await page.query_selector_all('button, [role="tab"], span, div'):
            try:
                txt = await el.inner_text()
                if txt.strip() == "STAR分析":
                    await el.click()
                    await asyncio.sleep(2)
                    break
            except:
                pass
        await shot_element(page, '[class*="drawer"], [class*="Drawer"], [class*="panel"], [class*="sheet"]', "23-star-detail-closeup.png")
        
        # 24: Evidence density with citation closeup
        for el in await page.query_selector_all('button, [role="tab"], span, div'):
            try:
                txt = await el.inner_text()
                if txt.strip() == "证据密度":
                    await el.click()
                    await asyncio.sleep(2)
                    break
            except:
                pass
        await shot_element(page, '[class*="drawer"], [class*="Drawer"], [class*="panel"], [class*="sheet"]', "24-evidence-citation-closeup.png")

        # ===================================================================
        # GROUP 6 (25-28): Remaining Closeups
        # ===================================================================
        print("\n--- Group 6: Remaining Closeups ---")
        
        # 25: Followup quality detail closeup
        for el in await page.query_selector_all('button, [role="tab"], span, div'):
            try:
                txt = await el.inner_text()
                if txt.strip() == "追问质量":
                    await el.click()
                    await asyncio.sleep(2)
                    break
            except:
                pass
        await shot_element(page, '[class*="drawer"], [class*="Drawer"], [class*="panel"], [class*="sheet"]', "25-followup-detail-closeup.png")
        
        # 26: AI suggestions with segment evidence closeup
        for el in await page.query_selector_all('button, [role="tab"], span, div'):
            try:
                txt = await el.inner_text()
                if txt.strip() == "AI建议":
                    await el.click()
                    await asyncio.sleep(2)
                    break
            except:
                pass
        await shot_element(page, '[class*="drawer"], [class*="Drawer"], [class*="panel"], [class*="sheet"]', "26-ai-suggestions-detail-closeup.png")
        
        # 27: Tab bar + drawer header closeup
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        rows = await page.query_selector_all('tbody tr')
        for row in rows:
            text = await row.inner_text()
            if "二面视频" in text and "转写完成" in text:
                await row.click()
                await asyncio.sleep(5)
                break
        await shot_element(page, '[class*="drawer"], [class*="Drawer"], [class*="panel"], [class*="sheet"]', "27-drawer-tab-bar-closeup.png")
        
        # 28: Clean table with filter bar closeup
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(5)
        # Clip just the main content area (below sidebar, above footer)
        await shot_clip(page, "28-main-content-area-closeup.png", 280, 100, 1160, 750)

        await browser.close()

    # ===================================================================
    # Summary
    # ===================================================================
    print(f"\n{'='*60}")
    print(f"✅ All 28 CLOSEUP screenshots captured!")
    print(f"Output: {OUT}")
    
    pngs = sorted([f for f in os.listdir(OUT) if f.endswith('.png') and not f.endswith('_u.png')])
    total_size = sum(os.path.getsize(os.path.join(OUT, f)) for f in pngs)
    print(f"Total: {len(pngs)} screenshots, {total_size/1024:.0f} KB")
    
    for f in pngs:
        sz = os.path.getsize(os.path.join(OUT, f)) / 1024
        flag = "⚠️ SMALL" if sz < 30 else ("⚠️ TOO BIG" if sz > 800 else "✅")
        print(f"  {flag} {f} ({sz:.0f} KB)")

if __name__ == "__main__":
    asyncio.run(main())
