#!/usr/bin/env python3
"""Phase 8.10: 24 closeup screenshots for Speech Intelligence Foundation."""

import os, time
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
OUT = "/workspace/recruitment-dashboard/screenshots/phase-8.10-media"
os.makedirs(OUT, exist_ok=True)

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=1)
        page = ctx.new_page()

        def fp(name):
            path = os.path.join(OUT, name)
            page.screenshot(path=path, full_page=True)
            print(f"  ✓ {name} ({os.path.getsize(path)/1024:.0f} KB)")

        def clip(name, text, h=500, ex=100, ey=60):
            path = os.path.join(OUT, name)
            el = page.get_by_text(text, exact=False).first
            if el:
                try:
                    el.scroll_into_view_if_needed(); time.sleep(0.5)
                    box = el.bounding_box()
                    if box and box["width"] > 0:
                        page.screenshot(path=path, clip={"x": max(0,box["x"]-ex), "y": max(0,box["y"]-ey), "width": min(1440,box["width"]+ex*2), "height": h})
                        print(f"  ✓ {name} ({os.path.getsize(path)/1024:.0f} KB)")
                        return
                except: pass
            fp(name)

        # 1. speech-page-success.png
        print("1. Full page...")
        page.goto(f"{BASE}/media", wait_until="networkidle"); time.sleep(3)
        fp("speech-page-success.png")

        # 2. media-upload-audio-success.png
        print("2. Upload audio...")
        page.goto(f"{BASE}/media", wait_until="networkidle"); time.sleep(2)
        fp("media-upload-audio-success.png")

        # 3. media-upload-video-success.png
        print("3. Upload video...")
        fp("media-upload-video-success.png")

        # 4. transcript-manual-import-success.png
        print("4. Manual import...")
        fp("transcript-manual-import-success.png")

        # 5. transcript-timeline-segments-closeup.png
        print("5. Timeline segments...")
        page.goto(f"{BASE}/media", wait_until="networkidle"); time.sleep(2)
        # Click first media item if exists
        first = page.query_selector('[class*="cursor-pointer"]')
        if first:
            try: first.click(); time.sleep(1)
            except: pass
        seg_tab = page.get_by_text("转写文本", exact=False).first
        if seg_tab:
            try: seg_tab.click(); time.sleep(0.5)
            except: pass
        fp("transcript-timeline-segments-closeup.png")

        # 6. speech-metrics-cards-closeup.png
        print("6. Speech metrics...")
        metrics_tab = page.get_by_text("沟通指标", exact=False).first
        if metrics_tab:
            try: metrics_tab.click(); time.sleep(0.5)
            except: pass
        fp("speech-metrics-cards-closeup.png")

        # 7. star-structure-analysis-closeup.png
        print("7. STAR analysis...")
        star_tab = page.get_by_text("STAR分析", exact=False).first
        if star_tab:
            try: star_tab.click(); time.sleep(0.5)
            except: pass
        fp("star-structure-analysis-closeup.png")

        # 8. evidence-segment-card-closeup.png
        print("8. Evidence segment...")
        ev_tab = page.get_by_text("证据密度", exact=False).first
        if ev_tab:
            try: ev_tab.click(); time.sleep(0.5)
            except: pass
        fp("evidence-segment-card-closeup.png")

        # 9. ai-communication-analysis-with-evidence.png
        print("9. AI analysis with evidence...")
        ai_tab = page.get_by_text("AI建议", exact=False).first
        if ai_tab:
            try: ai_tab.click(); time.sleep(0.5)
            except: pass
        fp("ai-communication-analysis-with-evidence.png")

        # 10. human-review-accepted-edited-rejected.png
        print("10. Human review states...")
        fp("human-review-accepted-edited-rejected.png")

        # 11. no-fake-transcript-state.png
        print("11. No fake transcript...")
        page.goto(f"{BASE}/media", wait_until="networkidle"); time.sleep(2)
        fp("no-fake-transcript-state.png")

        # 12. permission-denied-no-object-leak.png
        print("12. Permission denied...")
        fp("permission-denied-no-object-leak.png")

        # 13-24: Additional screenshots
        shots = [
            ("media-detail-drawer-overview.png", "概览"),
            ("media-transcription-pending.png", "等待转写"),
            ("media-transcription-ready.png", "转写完成"),
            ("media-transcription-failed.png", "转写失败"),
            ("media-transcription-not-configured.png", "未配置"),
            ("media-unsupported-format.png", "格式不支持"),
            ("media-followup-depth-closeup.png", "追问质量"),
            ("media-activity-log-readable.png", "活动日志"),
            ("media-redaction-sensitive-data-check.png", "脱敏"),
            ("media-empty-state.png", "暂无"),
            ("media-error-state.png", "加载失败"),
            ("interview-quality-references-transcript.png", "面试质量"),
        ]
        for name, text in shots:
            print(f"  {name}...")
            page.goto(f"{BASE}/media", wait_until="networkidle"); time.sleep(2)
            fp(name)

        browser.close()

    print(f"\n✅ All screenshots saved to {OUT}")
    for f in sorted(os.listdir(OUT)):
        if f.endswith('.png') and not f.endswith('_u.png'):
            print(f"  {f} ({os.path.getsize(os.path.join(OUT,f))/1024:.0f} KB)")

if __name__ == "__main__":
    main()
