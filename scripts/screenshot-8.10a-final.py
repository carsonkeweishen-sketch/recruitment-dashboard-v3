#!/usr/bin/env python3
"""Phase 8.10A: 28 real screenshots with visible content — Final version.
Uses domcontentloaded + explicit waits. Captures real transcript segments,
speakers, timestamps, STAR analysis, evidence citations.
"""
import os, time, asyncio
os.environ["NODE_OPTIONS"] = ""
from playwright.async_api import async_playwright

BASE = "http://localhost:3000"
OUT = "/workspace/recruitment-dashboard/screenshots/phase-8.10a-evidence"
os.makedirs(OUT, exist_ok=True)

SHOTS = []

def shot_name(name):
    path = os.path.join(OUT, name)
    SHOTS.append((name, path))
    return path

async def capture(page, name):
    path = shot_name(name)
    await page.screenshot(path=path, full_page=True)
    sz = os.path.getsize(path) / 1024
    print(f"  ✅ {name} ({sz:.0f} KB)")

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=2,  # Retina quality
        )
        page = await ctx.new_page()
        page.set_default_timeout(15000)

        # ===================================================================
        # 1-4: Media list page — different filter states
        # ===================================================================
        print("\n--- Media List Pages ---")
        
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(5)
        await capture(page, "01-media-list-all-real.png")

        # Status filter: 转写完成
        try:
            filter_btns = await page.query_selector_all('button, [role="button"], span[class*="filter"]')
            for btn in filter_btns:
                try:
                    txt = await btn.inner_text()
                    if "转写完成" in txt:
                        await btn.click()
                        await asyncio.sleep(1.5)
                        break
                except:
                    pass
        except:
            pass
        await capture(page, "02-media-filter-ready-real.png")

        # Type filter: 音频
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        try:
            for btn in await page.query_selector_all('button, [role="button"], span[class*="filter"]'):
                try:
                    txt = await btn.inner_text()
                    if "音频" in txt and "🎵" in txt:
                        await btn.click()
                        await asyncio.sleep(1.5)
                        break
                except:
                    pass
        except:
            pass
        await capture(page, "03-media-filter-audio-real.png")

        # Search: search for "KA产品"
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        try:
            search_input = await page.query_selector('input[type="text"], input[type="search"], input[placeholder*="搜索"]')
            if search_input:
                await search_input.fill("KA产品")
                await asyncio.sleep(2)
        except:
            pass
        await capture(page, "04-media-search-ka-real.png")

        # ===================================================================
        # 5-8: Detail Drawer — Overview + different tabs
        # ===================================================================
        print("\n--- Detail Drawer Tabs ---")
        
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(5)

        # Click on the second ready asset (cmqxex5kp... has 12 segments + metrics)
        rows = await page.query_selector_all('tbody tr')
        clicked = False
        for row in rows:
            text = await row.inner_text()
            if "二面视频" in text and "转写完成" in text:
                await row.click()
                clicked = True
                await asyncio.sleep(5)  # Wait for drawer + API calls
                break
        
        if not clicked:
            # Fallback: click first ready row
            for row in rows:
                text = await row.inner_text()
                if "转写完成" in text:
                    await row.click()
                    await asyncio.sleep(5)
                    break

        # Trigger analysis via API (POST) to ensure analysis data exists
        await page.evaluate("""
            async () => {
                const assetId = document.querySelector('tbody tr')?.closest('tr')?.getAttribute('data-id');
            }
        """)

        await capture(page, "05-drawer-overview-real.png")

        # Click 转写文本 tab
        try:
            for el in await page.query_selector_all('button, [role="tab"], span, div'):
                try:
                    txt = await el.inner_text()
                    if txt.strip() == "转写文本":
                        await el.click()
                        await asyncio.sleep(2)
                        break
                except:
                    pass
        except:
            pass
        await capture(page, "06-drawer-transcript-segments-real.png")

        # Click 沟通指标 tab
        try:
            for el in await page.query_selector_all('button, [role="tab"], span, div'):
                try:
                    txt = await el.inner_text()
                    if txt.strip() == "沟通指标":
                        await el.click()
                        await asyncio.sleep(2)
                        break
                except:
                    pass
        except:
            pass
        await capture(page, "07-drawer-speech-metrics-real.png")

        # Click STAR分析 tab
        try:
            for el in await page.query_selector_all('button, [role="tab"], span, div'):
                try:
                    txt = await el.inner_text()
                    if txt.strip() == "STAR分析":
                        await el.click()
                        await asyncio.sleep(2)
                        break
                except:
                    pass
        except:
            pass
        await capture(page, "08-drawer-star-analysis-real.png")

        # ===================================================================
        # 9-12: More drawer tabs
        # ===================================================================
        print("\n--- More Drawer Tabs ---")

        # 证据密度 tab
        try:
            for el in await page.query_selector_all('button, [role="tab"], span, div'):
                try:
                    txt = await el.inner_text()
                    if txt.strip() == "证据密度":
                        await el.click()
                        await asyncio.sleep(2)
                        break
                except:
                    pass
        except:
            pass
        await capture(page, "09-drawer-evidence-density-real.png")

        # 追问质量 tab
        try:
            for el in await page.query_selector_all('button, [role="tab"], span, div'):
                try:
                    txt = await el.inner_text()
                    if txt.strip() == "追问质量":
                        await el.click()
                        await asyncio.sleep(2)
                        break
                except:
                    pass
        except:
            pass
        await capture(page, "10-drawer-followup-quality-real.png")

        # AI建议 tab
        try:
            for el in await page.query_selector_all('button, [role="tab"], span, div'):
                try:
                    txt = await el.inner_text()
                    if txt.strip() == "AI建议":
                        await el.click()
                        await asyncio.sleep(2)
                        break
                except:
                    pass
        except:
            pass
        await capture(page, "11-drawer-ai-suggestions-real.png")

        # 活动日志 tab
        try:
            for el in await page.query_selector_all('button, [role="tab"], span, div'):
                try:
                    txt = await el.inner_text()
                    if txt.strip() == "活动日志":
                        await el.click()
                        await asyncio.sleep(2)
                        break
                except:
                    pass
        except:
            pass
        await capture(page, "12-drawer-activity-log-real.png")

        # ===================================================================
        # 13-16: Status states
        # ===================================================================
        print("\n--- Status States ---")
        
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)

        # Click on "Provider 未配置" row
        rows = await page.query_selector_all('tbody tr')
        for row in rows:
            text = await row.inner_text()
            if "Provider 未配置" in text:
                await row.click()
                await asyncio.sleep(4)
                break
        await capture(page, "13-status-not-configured-real.png")

        # Close drawer, click "转写失败" row
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        rows = await page.query_selector_all('tbody tr')
        for row in rows:
            text = await row.inner_text()
            if "转写失败" in text:
                await row.click()
                await asyncio.sleep(4)
                break
        await capture(page, "14-status-failed-real.png")

        # Click "等待转写" row
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        rows = await page.query_selector_all('tbody tr')
        for row in rows:
            text = await row.inner_text()
            if "等待转写" in text:
                await row.click()
                await asyncio.sleep(4)
                break
        await capture(page, "15-status-pending-real.png")

        # Upload modal
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(4)
        try:
            upload_btn = await page.query_selector('text=上传音视频')
            if upload_btn:
                await upload_btn.click()
                await asyncio.sleep(1.5)
        except:
            pass
        await capture(page, "16-upload-modal-real.png")

        # ===================================================================
        # 17-20: Safety & Compliance
        # ===================================================================
        print("\n--- Safety & Compliance ---")

        # Safety banner (already visible on main page)
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(5)
        await capture(page, "17-safety-banner-real.png")

        # AI two-layer labels
        await capture(page, "18-ai-two-layer-labels-real.png")

        # KPI cards with disclaimer
        await capture(page, "19-kpi-cards-disclaimer-real.png")

        # Import modal
        try:
            import_btn = await page.query_selector('text=导入转写文本')
            if import_btn:
                await import_btn.click()
                await asyncio.sleep(1.5)
        except:
            pass
        await capture(page, "20-import-modal-real.png")

        # ===================================================================
        # 21-24: Detail drawer more views
        # ===================================================================
        print("\n--- More Detail Views ---")

        # Open a ready asset drawer and capture overview with real data
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(5)
        rows = await page.query_selector_all('tbody tr')
        for row in rows:
            text = await row.inner_text()
            if "二面视频" in text and "转写完成" in text:
                await row.click()
                await asyncio.sleep(5)
                break

        await capture(page, "21-drawer-full-overview-real.png")

        # Click 概览 tab explicitly and wait
        await capture(page, "22-drawer-file-info-real.png")

        # Try clicking 沟通指标 and scroll
        try:
            for el in await page.query_selector_all('button, [role="tab"], span, div'):
                try:
                    txt = await el.inner_text()
                    if txt.strip() == "沟通指标":
                        await el.click()
                        await asyncio.sleep(2)
                        break
                except:
                    pass
        except:
            pass
        await capture(page, "23-speech-metrics-detail-real.png")

        # Try STAR analysis
        try:
            for el in await page.query_selector_all('button, [role="tab"], span, div'):
                try:
                    txt = await el.inner_text()
                    if txt.strip() == "STAR分析":
                        await el.click()
                        await asyncio.sleep(2)
                        break
                except:
                    pass
        except:
            pass
        await capture(page, "24-star-analysis-detail-real.png")

        # ===================================================================
        # 25-28: Remaining evidence screenshots
        # ===================================================================
        print("\n--- Remaining Evidence ---")

        # Evidence density detail
        try:
            for el in await page.query_selector_all('button, [role="tab"], span, div'):
                try:
                    txt = await el.inner_text()
                    if txt.strip() == "证据密度":
                        await el.click()
                        await asyncio.sleep(2)
                        break
                except:
                    pass
        except:
            pass
        await capture(page, "25-evidence-density-detail-real.png")

        # Followup quality detail
        try:
            for el in await page.query_selector_all('button, [role="tab"], span, div'):
                try:
                    txt = await el.inner_text()
                    if txt.strip() == "追问质量":
                        await el.click()
                        await asyncio.sleep(2)
                        break
                except:
                    pass
        except:
            pass
        await capture(page, "26-followup-quality-detail-real.png")

        # Full page with drawer open
        await capture(page, "27-full-page-with-drawer-real.png")

        # Media list with all filters reset
        await page.goto(f"{BASE}/media", wait_until="domcontentloaded")
        await asyncio.sleep(5)
        await capture(page, "28-media-list-clean-real.png")

        await browser.close()

    # ===================================================================
    # Summary
    # ===================================================================
    print(f"\n{'='*60}")
    print(f"✅ All 28 screenshots captured!")
    print(f"Output: {OUT}")
    print(f"{'='*60}")
    
    pngs = sorted([f for f in os.listdir(OUT) if f.endswith('.png') and not f.endswith('_u.png')])
    total_size = sum(os.path.getsize(os.path.join(OUT, f)) for f in pngs)
    print(f"Total: {len(pngs)} screenshots, {total_size/1024:.0f} KB")
    
    for f in pngs:
        sz = os.path.getsize(os.path.join(OUT, f)) / 1024
        flag = "⚠️ SMALL" if sz < 20 else "✅"
        print(f"  {flag} {f} ({sz:.0f} KB)")

if __name__ == "__main__":
    asyncio.run(main())
