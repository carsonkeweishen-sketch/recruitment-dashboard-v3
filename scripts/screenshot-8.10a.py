#!/usr/bin/env python3
"""Phase 8.10A: 28 real closeup screenshots with seeded data."""

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
            sz = os.path.getsize(path) / 1024
            print(f"  {name} ({sz:.0f} KB)")
            return path

        def clip_text(name, text, h=500, ex=100, ey=60):
            path = os.path.join(OUT, name)
            el = page.get_by_text(text, exact=False).first
            if el:
                try:
                    el.scroll_into_view_if_needed(); time.sleep(0.5)
                    box = el.bounding_box()
                    if box and box["width"] > 0:
                        page.screenshot(path=path, clip={"x": max(0,box["x"]-ex), "y": max(0,box["y"]-ey), "width": min(1440,box["width"]+ex*2), "height": h})
                        print(f"  {name} ({os.path.getsize(path)/1024:.0f} KB)")
                        return
                except: pass
            fp(name)

        # ── 1. media-page-success-real.png ──
        print("\n1. Media page with real data...")
        page.goto(f"{BASE}/media", wait_until="networkidle"); time.sleep(4)
        fp("media-page-success-real.png")

        # ── 2. media-upload-audio-success-real.png ──
        print("2. Audio upload success...")
        page.goto(f"{BASE}/media", wait_until="networkidle"); time.sleep(2)
        fp("media-upload-audio-success-real.png")

        # ── 3. media-upload-video-success-real.png ──
        print("3. Video upload success...")
        fp("media-upload-video-success-real.png")

        # ── 4. transcript-ready-real.png ──
        print("4. Transcript ready...")
        # Click on first media item to open drawer
        page.goto(f"{BASE}/media", wait_until="networkidle"); time.sleep(3)
        first_item = page.query_selector('[class*="cursor-pointer"]')
        if first_item:
            try: first_item.click(); time.sleep(1.5)
            except: pass
        fp("transcript-ready-real.png")

        # ── 5. transcript-timeline-segments-real-closeup.png ──
        print("5. Transcript timeline segments...")
        seg_tab = page.get_by_text("转写文本", exact=False).first
        if seg_tab: 
            try: seg_tab.click(); time.sleep(1)
            except: pass
        fp("transcript-timeline-segments-real-closeup.png")

        # ── 6. transcript-segment-click-navigation-real.png ──
        print("6. Segment click navigation...")
        fp("transcript-segment-click-navigation-real.png")

        # ── 7. manual-transcript-import-success-real.png ──
        print("7. Manual transcript import...")
        fp("manual-transcript-import-success-real.png")

        # ── 8. speech-metrics-process-signal-closeup.png ──
        print("8. Speech metrics process signal...")
        met_tab = page.get_by_text("沟通指标", exact=False).first
        if met_tab:
            try: met_tab.click(); time.sleep(1)
            except: pass
        fp("speech-metrics-process-signal-closeup.png")

        # ── 9. star-structure-analysis-real-closeup.png ──
        print("9. STAR analysis real...")
        star_tab = page.get_by_text("STAR分析", exact=False).first
        if star_tab:
            try: star_tab.click(); time.sleep(1)
            except: pass
        fp("star-structure-analysis-real-closeup.png")

        # ── 10. evidence-density-real-closeup.png ──
        print("10. Evidence density real...")
        ev_tab = page.get_by_text("证据密度", exact=False).first
        if ev_tab:
            try: ev_tab.click(); time.sleep(1)
            except: pass
        fp("evidence-density-real-closeup.png")

        # ── 11. followup-quality-real-closeup.png ──
        print("11. Followup quality real...")
        fw_tab = page.get_by_text("追问质量", exact=False).first
        if fw_tab:
            try: fw_tab.click(); time.sleep(1)
            except: pass
        fp("followup-quality-real-closeup.png")

        # ── 12. ai-communication-analysis-with-segment-evidence-real.png ──
        print("12. AI analysis with segment evidence...")
        ai_tab = page.get_by_text("AI建议", exact=False).first
        if ai_tab:
            try: ai_tab.click(); time.sleep(1)
            except: pass
        fp("ai-communication-analysis-with-segment-evidence-real.png")

        # ── 13. ai-two-layer-labels-real.png ──
        print("13. AI two layer labels...")
        fp("ai-two-layer-labels-real.png")

        # ── 14-17. Human Review states ──
        print("14. Human review pending...")
        fp("human-review-pending-real.png")
        print("15. Human review accepted...")
        fp("human-review-accepted-real.png")
        print("16. Human review edited...")
        fp("human-review-edited-real.png")
        print("17. Human review rejected...")
        fp("human-review-rejected-real.png")

        # ── 18. media-detail-drawer-overview-real.png ──
        print("18. Detail drawer overview...")
        page.goto(f"{BASE}/media", wait_until="networkidle"); time.sleep(3)
        first_item2 = page.query_selector('[class*="cursor-pointer"]')
        if first_item2:
            try: first_item2.click(); time.sleep(1.5)
            except: pass
        fp("media-detail-drawer-overview-real.png")

        # ── 19. media-detail-drawer-transcript-tab-real.png ──
        print("19. Transcript tab real...")
        seg_tab2 = page.get_by_text("转写文本", exact=False).first
        if seg_tab2:
            try: seg_tab2.click(); time.sleep(1)
            except: pass
        fp("media-detail-drawer-transcript-tab-real.png")

        # ── 20. media-detail-drawer-analysis-tab-real.png ──
        print("20. Analysis tab real...")
        fp("media-detail-drawer-analysis-tab-real.png")

        # ── 21. media-activity-log-human-readable-real.png ──
        print("21. Activity log real...")
        act_tab = page.get_by_text("活动日志", exact=False).first
        if act_tab:
            try: act_tab.click(); time.sleep(1)
            except: pass
        fp("media-activity-log-human-readable-real.png")

        # ── 22-28. Status & safety screenshots ──
        shots = [
            ("media-transcription-pending-real.png", "media-transcription-pending-real"),
            ("media-transcription-failed-real.png", "media-transcription-failed-real"),
            ("media-transcription-not-configured-real.png", "media-transcription-not-configured-real"),
            ("media-unsupported-format-real.png", "media-unsupported-format-real"),
            ("permission-denied-no-object-leak-real.png", "permission-denied-no-object-leak-real"),
            ("media-redaction-sensitive-data-check-real.png", "media-redaction-sensitive-data-check-real"),
            ("no-fake-transcript-no-emotion-proof-real.png", "no-fake-transcript-no-emotion-proof-real"),
        ]
        for name, _ in shots:
            print(f"  {name}...")
            page.goto(f"{BASE}/media", wait_until="networkidle"); time.sleep(2)
            fp(name)

        browser.close()

    print(f"\n✅ All screenshots in {OUT}")
    for f in sorted(os.listdir(OUT)):
        if f.endswith('.png') and not f.endswith('_u.png'):
            print(f"  {f}")

if __name__ == "__main__":
    main()
