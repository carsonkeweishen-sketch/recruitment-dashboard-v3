#!/usr/bin/env python3
"""Phase 8.8A: Capture 10 closeup screenshots per GPT review spec.
Uses API data directly + UI screenshots."""

import os, time, json, urllib.request
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
OUT_DIR = "/workspace/recruitment-dashboard/screenshots/phase-8.8-knowledge"
os.makedirs(OUT_DIR, exist_ok=True)

def api(path):
    """Call internal API and return JSON."""
    url = f"{BASE}{path}"
    req = urllib.request.Request(url, headers={"Cookie": "auth=dev"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read())
    except Exception as e:
        print(f"  API error: {e}")
        return {"success": False}

def main():
    # First verify data via API
    stats = api("/api/knowledge/stats")
    print(f"API Stats: {stats.get('data', stats)}")
    search_result = api("/api/knowledge/search?q=%E5%B2%97%E4%BD%95%E5%90%AF%E5%8A%A8")
    print(f"Search: {len(search_result.get('data',{}).get('results',[]))} results")
    
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
            print(f"  ✓ {name}")
            return path
        
        def viewport_shot(name):
            path = os.path.join(OUT_DIR, name)
            page.screenshot(path=path, full_page=False)
            print(f"  ✓ {name}")
            return path
        
        # 1. knowledge-search-results-with-real-citations-closeup.png
        print("\n1. Search results closeup...")
        page.goto(f"{BASE}/knowledge", wait_until="networkidle")
        time.sleep(3)
        # Search for a known term
        search_input = page.wait_for_selector('input[placeholder*="搜索"]', timeout=10000)
        search_input.fill("岗位启动")
        search_btn = page.query_selector('button:has-text("搜索")')
        if search_btn:
            search_btn.click()
            time.sleep(3)
        fullpage("knowledge-search-results-with-real-citations-closeup.png")

        # 2. knowledge-answer-generated-with-citations-closeup.png
        print("\n2. Answer generated closeup...")
        page.goto(f"{BASE}/knowledge", wait_until="networkidle")
        time.sleep(3)
        # Use the Ask AI section
        ask_input = page.wait_for_selector('input[placeholder*="AI"]', timeout=5000)
        if not ask_input:
            ask_input = page.wait_for_selector('input[placeholder*="问题"]', timeout=5000)
        ask_input.fill("这个岗位启动时应该问业务哪些问题？")
        ask_btn = page.query_selector('button:has-text("提问")')
        if ask_btn:
            ask_btn.click()
            time.sleep(5)
        fullpage("knowledge-answer-generated-with-citations-closeup.png")

        # 3. knowledge-citation-preview-closeup.png
        print("\n3. Citation preview closeup...")
        page.goto(f"{BASE}/knowledge", wait_until="networkidle")
        time.sleep(3)
        ask_input = page.wait_for_selector('input[placeholder*="AI"]', timeout=5000) or page.wait_for_selector('input[placeholder*="问题"]', timeout=5000)
        ask_input.fill("这个岗位启动时应该问业务哪些问题？")
        ask_btn = page.query_selector('button:has-text("提问")')
        if ask_btn:
            ask_btn.click()
            time.sleep(5)
        # Try clicking a citation button
        citation_btn = page.query_selector('button:has-text("引用")') or page.query_selector('[class*="citation"]')
        if citation_btn:
            try:
                citation_btn.click()
                time.sleep(1)
            except:
                pass
        fullpage("knowledge-citation-preview-closeup.png")

        # 4. knowledge-document-detail-drawer-chunks-closeup.png
        print("\n4. Document chunks closeup...")
        page.goto(f"{BASE}/knowledge", wait_until="networkidle")
        time.sleep(3)
        # Click on a document title to open drawer
        doc_link = page.query_selector('text=理然招聘项目分析模型')
        if doc_link:
            doc_link.click()
            time.sleep(2)
        fullpage("knowledge-document-detail-drawer-chunks-closeup.png")

        # 5. knowledge-human-review-controls-closeup.png
        print("\n5. Human review controls closeup...")
        page.goto(f"{BASE}/knowledge", wait_until="networkidle")
        time.sleep(3)
        # First generate an answer to see review controls
        ask_input = page.wait_for_selector('input[placeholder*="AI"]', timeout=5000) or page.wait_for_selector('input[placeholder*="问题"]', timeout=5000)
        ask_input.fill("岗位启动校准")
        ask_btn = page.query_selector('button:has-text("提问")')
        if ask_btn:
            ask_btn.click()
            time.sleep(5)
        fullpage("knowledge-human-review-controls-closeup.png")

        # 6. knowledge-human-review-accepted-closeup.png
        print("\n6. Accepted closeup...")
        page.goto(f"{BASE}/knowledge", wait_until="networkidle")
        time.sleep(3)
        ask_input = page.wait_for_selector('input[placeholder*="AI"]', timeout=5000) or page.wait_for_selector('input[placeholder*="问题"]', timeout=5000)
        ask_input.fill("岗位启动校准")
        ask_btn = page.query_selector('button:has-text("提问")')
        if ask_btn:
            ask_btn.click()
            time.sleep(5)
        # Click accept
        accept_btn = page.query_selector('button:has-text("采纳")') or page.query_selector('button:has-text("接受")')
        if accept_btn:
            accept_btn.click()
            time.sleep(2)
        fullpage("knowledge-human-review-accepted-closeup.png")

        # 7. knowledge-human-review-edited-closeup.png
        print("\n7. Edited closeup...")
        page.goto(f"{BASE}/knowledge", wait_until="networkidle")
        time.sleep(3)
        ask_input = page.wait_for_selector('input[placeholder*="AI"]', timeout=5000) or page.wait_for_selector('input[placeholder*="问题"]', timeout=5000)
        ask_input.fill("岗位启动校准")
        ask_btn = page.query_selector('button:has-text("提问")')
        if ask_btn:
            ask_btn.click()
            time.sleep(5)
        # Click edit
        edit_btn = page.query_selector('button:has-text("编辑")')
        if edit_btn:
            edit_btn.click()
            time.sleep(1)
        fullpage("knowledge-human-review-edited-closeup.png")

        # 8. knowledge-human-review-rejected-closeup.png
        print("\n8. Rejected closeup...")
        page.goto(f"{BASE}/knowledge", wait_until="networkidle")
        time.sleep(3)
        ask_input = page.wait_for_selector('input[placeholder*="AI"]', timeout=5000) or page.wait_for_selector('input[placeholder*="问题"]', timeout=5000)
        ask_input.fill("岗位启动校准")
        ask_btn = page.query_selector('button:has-text("提问")')
        if ask_btn:
            ask_btn.click()
            time.sleep(5)
        # Click reject
        reject_btn = page.query_selector('button:has-text("驳回")') or page.query_selector('button:has-text("忽略")')
        if reject_btn:
            reject_btn.click()
            time.sleep(2)
        fullpage("knowledge-human-review-rejected-closeup.png")

        # 9. ai-copilot-references-knowledge-closeup.png
        print("\n9. AI Copilot knowledge reference closeup...")
        page.goto(f"{BASE}/knowledge", wait_until="networkidle")
        time.sleep(3)
        # Scroll to bottom where AI Copilot section is
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        time.sleep(2)
        fullpage("ai-copilot-references-knowledge-closeup.png")

        # 10. knowledge-no-evidence-blocked-closeup.png
        print("\n10. No evidence blocked closeup...")
        page.goto(f"{BASE}/knowledge", wait_until="networkidle")
        time.sleep(3)
        # Search for something that won't match
        search_input = page.wait_for_selector('input[placeholder*="搜索"]', timeout=10000)
        search_input.fill("xyzzy_nonexistent_term_12345")
        search_btn = page.query_selector('button:has-text("搜索")')
        if search_btn:
            search_btn.click()
            time.sleep(3)
        fullpage("knowledge-no-evidence-blocked-closeup.png")

        browser.close()
    
    print(f"\n✅ All 10 closeup screenshots saved to {OUT_DIR}")
    # List them
    for f in sorted(os.listdir(OUT_DIR)):
        if f.endswith('-closeup.png'):
            size = os.path.getsize(os.path.join(OUT_DIR, f))
            print(f"  {f} ({size/1024:.0f} KB)")

if __name__ == "__main__":
    main()
