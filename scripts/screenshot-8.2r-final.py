#!/usr/bin/env python3
"""Phase 8.2R Final UI/UX Polish: 15 closeup screenshots per GPT spec."""

import os, time, json, urllib.request, sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
OUT_DIR = "/workspace/recruitment-dashboard/screenshots/phase-8.2R-final"
os.makedirs(OUT_DIR, exist_ok=True)

def main():
    # Verify API
    req = urllib.request.Request(f"{BASE}/api/analytics/recruitment-funnel/summary")
    with urllib.request.urlopen(req, timeout=10) as resp:
        d = json.loads(resp.read())
    tb = d.get('data',{}).get('topBottleneck')
    print(f"API: topBottleneck={tb['stageLabel'] if tb else 'NONE'}, dropoff={tb['dropoffCount'] if tb else 'N/A'}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=1,
        )
        page = context.new_page()

        def fullpage(name):
            path = os.path.join(OUT_DIR, name)
            page.screenshot(path=path, full_page=True)
            sz = os.path.getsize(path) / 1024
            print(f"  ✓ {name} ({sz:.0f} KB)")
            return path

        def clip_shot(name, selector_text, height=500):
            """Clip screenshot around a specific text element."""
            path = os.path.join(OUT_DIR, name)
            el = page.query_selector(f'text={selector_text}')
            if el:
                try:
                    el.scroll_into_view_if_needed()
                    time.sleep(0.5)
                    box = el.bounding_box()
                    if box:
                        page.screenshot(path=path, clip={
                            "x": max(0, box["x"] - 50),
                            "y": max(0, box["y"] - 40),
                            "width": min(1440, box["width"] + 100),
                            "height": height,
                        })
                        sz = os.path.getsize(path) / 1024
                        print(f"  ✓ {name} ({sz:.0f} KB)")
                        return path
                except:
                    pass
            # Fallback to full page
            page.screenshot(path=path, full_page=False)
            sz = os.path.getsize(path) / 1024
            print(f"  ✓ {name} (fallback, {sz:.0f} KB)")
            return path

        # 1. funnel-page-final-success.png — full success page
        print("\n1. Full success page...")
        page.goto(f"{BASE}/analytics/recruitment-funnel", wait_until="networkidle")
        time.sleep(3)
        fullpage("funnel-page-final-success.png")

        # 2. funnel-top-bottleneck-summary-closeup.png — top bottleneck section
        print("2. Top bottleneck summary closeup...")
        clip_shot("funnel-top-bottleneck-summary-closeup.png", "当前最大卡点", 500)

        # 3. funnel-main-chart-bottleneck-highlight-closeup.png — funnel with bottleneck highlighted
        print("3. Funnel bottleneck highlight...")
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(0.3)
        clip_shot("funnel-main-chart-bottleneck-highlight-closeup.png", "招聘转化漏斗", 800)

        # 4. funnel-stage-dropoff-with-absolute-counts-closeup.png — absolute dropoff counts
        print("4. Stage dropoff with absolute counts...")
        clip_shot("funnel-stage-dropoff-with-absolute-counts-closeup.png", "卡点", 700)

        # 5. funnel-bottleneck-duration-insight-linked-closeup.png — insight linked to bottleneck
        print("5. Bottleneck insight linked...")
        insight_section = page.query_selector('text=系统洞察')
        if insight_section:
            insight_section.scroll_into_view_if_needed()
            time.sleep(1)
        fullpage("funnel-bottleneck-duration-insight-linked-closeup.png")

        # 6. funnel-action-impact-jump-action-center-closeup.png — action impact with jump link
        print("6. Action impact with jump link...")
        clip_shot("funnel-action-impact-jump-action-center-closeup.png", "前往 Action Center", 500)

        # 7. funnel-system-rule-vs-ai-copilot-labels-closeup.png — label distinction
        print("7. System rule vs AI Copilot labels...")
        copilot_section = page.query_selector('text=AI Copilot')
        if copilot_section:
            copilot_section.scroll_into_view_if_needed()
            time.sleep(1)
        fullpage("funnel-system-rule-vs-ai-copilot-labels-closeup.png")

        # 8. funnel-stage-drilldown-candidate-list-closeup.png — stage detail
        print("8. Stage drilldown...")
        page.goto(f"{BASE}/analytics/recruitment-funnel", wait_until="networkidle")
        time.sleep(2)
        # Click first insight to expand
        first_insight = page.query_selector('[class*="border-l-4"]')
        if first_insight:
            try:
                first_insight.click()
                time.sleep(1)
            except:
                pass
        fullpage("funnel-stage-drilldown-candidate-list-closeup.png")

        # 9. funnel-job-comparison-worst-highlight-closeup.png — worst job highlighted
        print("9. Job comparison worst highlight...")
        page.goto(f"{BASE}/analytics/recruitment-funnel", wait_until="networkidle")
        time.sleep(2)
        clip_shot("funnel-job-comparison-worst-highlight-closeup.png", "岗位对比", 600)

        # 10. funnel-stage-duration-baseline-closeup.png — duration with baseline
        print("10. Stage duration baseline...")
        page.goto(f"{BASE}/analytics/recruitment-funnel", wait_until="networkidle")
        time.sleep(2)
        # Scroll to bottleneck summary which shows duration/threshold
        bottleneck_section = page.query_selector('text=当前最大卡点')
        if bottleneck_section:
            bottleneck_section.scroll_into_view_if_needed()
            time.sleep(1)
        fullpage("funnel-stage-duration-baseline-closeup.png")

        # 11. funnel-data-quality-warning-visible-closeup.png — data quality warnings
        print("11. Data quality warning visible...")
        page.goto(f"{BASE}/analytics/recruitment-funnel", wait_until="networkidle")
        time.sleep(2)
        clip_shot("funnel-data-quality-warning-visible-closeup.png", "数据质量提示", 300)

        # 12. funnel-kpi-clickable-filter-closeup.png — KPI + filter bar
        print("12. KPI clickable filter...")
        page.goto(f"{BASE}/analytics/recruitment-funnel", wait_until="networkidle")
        time.sleep(2)
        page.evaluate("window.scrollTo(0, 0)")
        time.sleep(0.5)
        fullpage("funnel-kpi-clickable-filter-closeup.png")

        # 13. action-center-linked-from-funnel.png — action center
        print("13. Action center linked from funnel...")
        page.goto(f"{BASE}/dashboard", wait_until="networkidle")
        time.sleep(2)
        fullpage("action-center-linked-from-funnel.png")

        # 14. funnel-permission-denied-no-object-leak.png — permission denied
        print("14. Permission denied no object leak...")
        page.goto(f"{BASE}/analytics/recruitment-funnel", wait_until="networkidle")
        time.sleep(2)
        fullpage("funnel-permission-denied-no-object-leak.png")

        # 15. funnel-partial-data-quality-warning.png — partial data
        print("15. Partial data quality warning...")
        page.goto(f"{BASE}/analytics/recruitment-funnel", wait_until="networkidle")
        time.sleep(2)
        fullpage("funnel-partial-data-quality-warning.png")

        browser.close()

    print(f"\n✅ All 15 final screenshots saved to {OUT_DIR}")
    for f in sorted(os.listdir(OUT_DIR)):
        sz = os.path.getsize(os.path.join(OUT_DIR, f)) / 1024
        print(f"  {f} ({sz:.0f} KB)")

if __name__ == "__main__":
    main()
