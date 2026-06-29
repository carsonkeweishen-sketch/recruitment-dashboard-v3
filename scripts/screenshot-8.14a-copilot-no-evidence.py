#!/usr/bin/env python3
"""
Phase 8.14A: Capture 06-copilot-no-evidence.png
Navigate to Knowledge page, open Copilot, ask a question that yields no evidence.
"""

import asyncio
from playwright.async_api import async_playwright

BASE_URL = "http://localhost:3000"
OUTPUT_DIR = "/workspace/recruitment-dashboard/screenshots/phase-8.14a"

async def capture_copilot_no_evidence():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 900})

        # 1. Navigate to Knowledge page
        print("Navigating to /knowledge...")
        await page.goto(f"{BASE_URL}/knowledge", wait_until="networkidle")
        await asyncio.sleep(2)

        # Verify page content
        body_text = await page.inner_text("body")
        if "知识" not in body_text and "Knowledge" not in body_text:
            print(f"WARNING: Page may not be Knowledge. Body preview: {body_text[:200]}")

        # 2. Open Copilot panel by clicking AI button
        print("Opening Copilot panel...")
        ai_button = await page.query_selector("button:has-text('AI 助手'), button:has-text('AI'), [data-testid='copilot-trigger']")
        if ai_button:
            await ai_button.click()
            await asyncio.sleep(1.5)
        else:
            # Try alternative selectors
            ai_button = await page.query_selector("button >> text=/AI/i")
            if ai_button:
                await ai_button.click()
                await asyncio.sleep(1.5)
            else:
                print("Could not find AI button, trying keyboard shortcut or direct URL...")

        # 3. Ask a question that will yield no evidence
        print("Asking question with no evidence...")
        input_selector = "input[placeholder*='问题'], textarea[placeholder*='问题'], input[placeholder*='提问'], [data-testid='copilot-input']"
        input_field = await page.query_selector(input_selector)

        if not input_field:
            # Try more generic selectors
            input_field = await page.query_selector("input[type='text']")

        if input_field:
            # Ask a question that won't match any knowledge chunks
            await input_field.fill("今天天气怎么样？")
            await asyncio.sleep(0.5)

            # Submit (look for send button or press Enter)
            send_button = await page.query_selector("button:has-text('发送'), button[type='submit'], svg[class*='send']")
            if send_button:
                await send_button.click()
            else:
                await input_field.press("Enter")

            # Wait for response
            await asyncio.sleep(3)

            # Check if no-evidence state is shown
            body_text = await page.inner_text("body")
            no_evidence_indicators = ["未找到", "无相关", "no evidence", "未检索到", "暂无相关"]
            has_no_evidence = any(ind in body_text for ind in no_evidence_indicators)
            print(f"No-evidence state detected: {has_no_evidence}")

        # 4. Capture screenshot
        print(f"Capturing screenshot to {OUTPUT_DIR}/06-copilot-no-evidence.png...")
        await page.screenshot(path=f"{OUTPUT_DIR}/06-copilot-no-evidence.png", full_page=False)

        # 5. Capture thumbnail
        await page.set_viewport_size({"width": 1440, "height": 900})
        await asyncio.sleep(0.5)
        await page.screenshot(path=f"{OUTPUT_DIR}/06-copilot-no-evidence_u.png", full_page=False)

        print("Done!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(capture_copilot_no_evidence())
