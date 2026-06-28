#!/usr/bin/env python3
"""Phase 8.2R Final UI/UX Polish: Fix screenshots #3 and #6 with better clipping."""

import os, time, json, urllib.request, sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
OUT_DIR = "/workspace/recruitment-dashboard/screenshots/phase-8.2R-final"
os.makedirs(OUT_DIR, exist_ok=True)

def main():
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

        def clip_shot(name, selector, height=600, extra_x=80, extra_y=60):
            """Clip screenshot around a CSS selector element."""
            path = os.path.join(OUT_DIR, name)
            el = page.query_selector(selector)
            if el:
                try:
                    el.scroll_into_view_if_needed()
                    time.sleep(0.8)
                    box = el.bounding_box()
                    if box and box["width"] > 0 and box["height"] > 0:
                        page.screenshot(path=path, clip={
                            "x": max(0, box["x"] - extra_x),
                            "y": max(0, box["y"] - extra_y),
                            "width": min(1440, box["width"] + extra_x * 2),
                            "height": height,
                        })
                        sz = os.path.getsize(path) / 1024
                        print(f"  ✓ {name} ({sz:.0f} KB) [selector match]")
                        return path
                except Exception as e:
                    print(f"  ⚠ clip failed: {e}")
            # Fallback to full page
            page.screenshot(path=path, full_page=False)
            sz = os.path.getsize(path) / 1024
            print(f"  ✓ {name} (fallback viewport, {sz:.0f} KB)")
            return path

        def clip_shot_text(name, text, height=600, extra_x=80, extra_y=60):
            """Clip screenshot around text content."""
            path = os.path.join(OUT_DIR, name)
            el = page.get_by_text(text, exact=False).first
            if el:
                try:
                    el.scroll_into_view_if_needed()
                    time.sleep(0.8)
                    box = el.bounding_box()
                    if box and box["width"] > 0 and box["height"] > 0:
                        page.screenshot(path=path, clip={
                            "x": max(0, box["x"] - extra_x),
                            "y": max(0, box["y"] - extra_y),
                            "width": min(1440, box["width"] + extra_x * 2),
                            "height": height,
                        })
                        sz = os.path.getsize(path) / 1024
                        print(f"  ✓ {name} ({sz:.0f} KB) [text match]")
                        return path
                except Exception as e:
                    print(f"  ⚠ text clip failed: {e}")
            page.screenshot(path=path, full_page=False)
            sz = os.path.getsize(path) / 1024
            print(f"  ✓ {name} (fallback viewport, {sz:.0f} KB)")
            return path

        # ========== FIX #3: Funnel bottleneck highlight — use full page to capture entire funnel ==========
        print("\n=== Fix #3: Funnel main chart with bottleneck highlight ===")
        page.goto(f"{BASE}/analytics/recruitment-funnel", wait_until="networkidle")
        time.sleep(3)

        # Find the funnel chart section — look for the h2 with "招聘转化漏斗"
        funnel_heading = page.get_by_text("招聘转化漏斗", exact=False).first
        if funnel_heading:
            funnel_heading.scroll_into_view_if_needed()
            time.sleep(1)
            box = funnel_heading.bounding_box()
            if box:
                # Capture a larger area: from funnel heading downward to include all stages + bottleneck highlight
                page.screenshot(
                    path=os.path.join(OUT_DIR, "funnel-main-chart-bottleneck-highlight-closeup.png"),
                    clip={
                        "x": max(0, box["x"] - 40),
                        "y": max(0, box["y"] - 20),
                        "width": min(1440, box["width"] + 300),
                        "height": 900,  # Capture full height to include all stages
                    },
                )
                sz = os.path.getsize(os.path.join(OUT_DIR, "funnel-main-chart-bottleneck-highlight-closeup.png")) / 1024
                print(f"  ✓ funnel-main-chart-bottleneck-highlight-closeup.png ({sz:.0f} KB)")
            else:
                fullpage("funnel-main-chart-bottleneck-highlight-closeup.png")
        else:
            print("  ⚠ '招聘转化漏斗' heading not found, using full page")
            fullpage("funnel-main-chart-bottleneck-highlight-closeup.png")

        # ========== FIX #6: Action Impact with jump link — scroll to that section first ==========
        print("\n=== Fix #6: Action impact with jump to Action Center link ===")
        page.goto(f"{BASE}/analytics/recruitment-funnel", wait_until="networkidle")
        time.sleep(3)

        # Try multiple approaches to find the Action Center link
        action_link = page.get_by_text("前往 Action Center", exact=False).first
        if action_link:
            try:
                action_link.scroll_into_view_if_needed()
                time.sleep(1)
                box = action_link.bounding_box()
                if box and box["width"] > 0:
                    # Capture a larger area around the action impact section
                    page.screenshot(
                        path=os.path.join(OUT_DIR, "funnel-action-impact-jump-action-center-closeup.png"),
                        clip={
                            "x": max(0, box["x"] - 200),
                            "y": max(0, box["y"] - 300),
                            "width": min(1440, 800),
                            "height": 500,
                        },
                    )
                    sz = os.path.getsize(os.path.join(OUT_DIR, "funnel-action-impact-jump-action-center-closeup.png")) / 1024
                    print(f"  ✓ funnel-action-impact-jump-action-center-closeup.png ({sz:.0f} KB)")
                else:
                    fullpage("funnel-action-impact-jump-action-center-closeup.png")
            except Exception as e:
                print(f"  ⚠ clip error: {e}")
                fullpage("funnel-action-impact-jump-action-center-closeup.png")
        else:
            # Try CSS selector fallback
            action_link = page.query_selector('a[href*="actions"]')
            if action_link:
                try:
                    action_link.scroll_into_view_if_needed()
                    time.sleep(1)
                    box = action_link.bounding_box()
                    if box and box["width"] > 0:
                        page.screenshot(
                            path=os.path.join(OUT_DIR, "funnel-action-impact-jump-action-center-closeup.png"),
                            clip={
                                "x": max(0, box["x"] - 200),
                                "y": max(0, box["y"] - 300),
                                "width": min(1440, 800),
                                "height": 500,
                            },
                        )
                        sz = os.path.getsize(os.path.join(OUT_DIR, "funnel-action-impact-jump-action-center-closeup.png")) / 1024
                        print(f"  ✓ funnel-action-impact-jump-action-center-closeup.png ({sz:.0f} KB) [CSS fallback]")
                    else:
                        fullpage("funnel-action-impact-jump-action-center-closeup.png")
                except:
                    fullpage("funnel-action-impact-jump-action-center-closeup.png")
            else:
                print("  ⚠ Action Center link not found, using full page")
                fullpage("funnel-action-impact-jump-action-center-closeup.png")

        browser.close()

    print(f"\n✅ Fixed screenshots saved to {OUT_DIR}")
    for f in ["funnel-main-chart-bottleneck-highlight-closeup.png", "funnel-action-impact-jump-action-center-closeup.png"]:
        full_path = os.path.join(OUT_DIR, f)
        if os.path.exists(full_path):
            sz = os.path.getsize(full_path) / 1024
            print(f"  {f} ({sz:.0f} KB)")

if __name__ == "__main__":
    main()
