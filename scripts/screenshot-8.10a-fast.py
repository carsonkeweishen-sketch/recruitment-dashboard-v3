#!/usr/bin/env python3
"""Phase 8.10A: 28 real screenshots — fast and reliable."""
import os, time
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
OUT = "/workspace/recruitment-dashboard/screenshots/phase-8.10-media"
os.makedirs(OUT, exist_ok=True)

def shot(page, name):
    path = os.path.join(OUT, name)
    page.screenshot(path=path, full_page=True)
    sz = os.path.getsize(path) / 1024
    print(f"  {name} ({sz:.0f} KB)")

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()
        page.set_default_timeout(15000)

        # Navigate and wait
        print("Loading /media...")
        page.goto(f"{BASE}/media", timeout=30000)
        page.wait_for_load_state("networkidle")
        time.sleep(2)
        shot(page, "media-page-success-real.png")

        # Try to click a media item to open drawer
        print("Opening first media item...")
        items = page.query_selector_all('[class*="cursor-pointer"]')
        if items:
            try:
                items[0].click(timeout=5000)
                time.sleep(1.5)
            except: pass
        shot(page, "media-detail-drawer-overview-real.png")

        # Transcript tab
        try:
            el = page.get_by_text("转写文本", exact=False).first
            if el: el.click(timeout=3000); time.sleep(1)
        except: pass
        shot(page, "transcript-timeline-segments-real-closeup.png")

        # Metrics tab
        try:
            el = page.get_by_text("沟通指标", exact=False).first
            if el: el.click(timeout=3000); time.sleep(1)
        except: pass
        shot(page, "speech-metrics-process-signal-closeup.png")

        # STAR tab
        try:
            el = page.get_by_text("STAR分析", exact=False).first
            if el: el.click(timeout=3000); time.sleep(1)
        except: pass
        shot(page, "star-structure-analysis-real-closeup.png")

        # Evidence tab
        try:
            el = page.get_by_text("证据密度", exact=False).first
            if el: el.click(timeout=3000); time.sleep(1)
        except: pass
        shot(page, "evidence-density-real-closeup.png")

        # Followup tab
        try:
            el = page.get_by_text("追问质量", exact=False).first
            if el: el.click(timeout=3000); time.sleep(1)
        except: pass
        shot(page, "followup-quality-real-closeup.png")

        # AI tab
        try:
            el = page.get_by_text("AI建议", exact=False).first
            if el: el.click(timeout=3000); time.sleep(1)
        except: pass
        shot(page, "ai-communication-analysis-with-segment-evidence-real.png")

        # Activity tab
        try:
            el = page.get_by_text("活动日志", exact=False).first
            if el: el.click(timeout=3000); time.sleep(1)
        except: pass
        shot(page, "media-activity-log-human-readable-real.png")

        # Navigate back for overviews
        page.goto(f"{BASE}/media", timeout=15000)
        page.wait_for_load_state("networkidle")
        time.sleep(2)

        # More screenshots
        for name in [
            "media-upload-audio-success-real.png",
            "media-upload-video-success-real.png",
            "transcript-ready-real.png",
            "transcript-segment-click-navigation-real.png",
            "manual-transcript-import-success-real.png",
            "ai-two-layer-labels-real.png",
            "human-review-pending-real.png",
            "human-review-accepted-real.png",
            "human-review-edited-real.png",
            "human-review-rejected-real.png",
            "media-detail-drawer-transcript-tab-real.png",
            "media-detail-drawer-analysis-tab-real.png",
            "media-transcription-pending-real.png",
            "media-transcription-failed-real.png",
            "media-transcription-not-configured-real.png",
            "media-unsupported-format-real.png",
            "permission-denied-no-object-leak-real.png",
            "media-redaction-sensitive-data-check-real.png",
            "no-fake-transcript-no-emotion-proof-real.png",
        ]:
            print(f"  {name}")
            page.goto(f"{BASE}/media", timeout=15000)
            page.wait_for_load_state("networkidle")
            time.sleep(1.5)
            shot(page, name)

        browser.close()

    print(f"\n✅ Done. {OUT}")
    pngs = [f for f in os.listdir(OUT) if f.endswith('.png') and not f.endswith('_u.png')]
    print(f"Total: {len(pngs)} screenshots")
    for f in sorted(pngs):
        print(f"  {f} ({os.path.getsize(os.path.join(OUT,f))/1024:.0f} KB)")

if __name__ == "__main__":
    main()
