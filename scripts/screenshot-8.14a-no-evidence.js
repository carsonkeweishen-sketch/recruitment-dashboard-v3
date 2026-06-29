/**
 * Phase 8.14A: Capture 06-copilot-no-evidence.png
 * Shows Copilot responding with "no evidence" when asked a question unrelated to recruitment data.
 */

const { chromium } = require('playwright');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '..', 'screenshots', 'phase-8.14a');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    // 1. Navigate to Knowledge page
    console.log('1. Navigating to /knowledge...');
    await page.goto(`${BASE_URL}/knowledge`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // 2. Click AI button in topbar
    console.log('2. Opening Copilot...');
    const aiBtn = page.locator('button').filter({ hasText: /AI|助手/ }).first();
    await aiBtn.click();
    await page.waitForTimeout(2000);

    // 3. Type a question unrelated to recruitment data
    // Input is: <input type="text" placeholder="输入问题...">
    console.log('3. Typing question...');
    const input = page.locator('input[placeholder="输入问题..."]').first();
    await input.waitFor({ state: 'visible', timeout: 10000 });
    await input.click({ force: true });
    await input.fill('今天北京天气怎么样？这个和招聘数据无关', { force: true });
    await page.waitForTimeout(500);

    // 4. Click send button
    console.log('4. Submitting...');
    const sendBtn = page.locator('button:has-text("发送")').first();
    await sendBtn.click({ force: true });
    
    // Wait for response - Copilot might take time to process
    console.log('5. Waiting for AI response...');
    await page.waitForTimeout(8000);

    // 6. Check what Copilot responded with
    const panel = page.locator('[data-copilot-panel]');
    const panelText = await panel.first().innerText();
    console.log('Panel text (first 500 chars):', panelText?.substring(0, 500));

    // 7. Check for no-evidence indicators
    const indicators = ['未找到', '无相关', 'no evidence', '未检索到', '暂无相关', '没有找到', '暂时无法', '超出范围', '无法回答', '不相关'];
    const found = indicators.filter(k => panelText?.includes(k));
    console.log('No-evidence indicators found:', found);

    // 8. Take screenshots
    console.log('6. Taking screenshots...');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '06-copilot-no-evidence.png'), fullPage: false });
    console.log('Main screenshot saved');

    await page.setViewportSize({ width: 640, height: 400 });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '06-copilot-no-evidence_u.png'), fullPage: false });
    console.log('Thumbnail saved');

    console.log('DONE - 06-copilot-no-evidence captured');
  } catch (err) {
    console.error('Error:', err.message);
    // Fallback: capture whatever is visible
    try {
      await page.screenshot({ path: path.join(OUTPUT_DIR, '06-copilot-no-evidence.png'), fullPage: false });
      console.log('Fallback screenshot saved');
    } catch (_) {}
  } finally {
    await browser.close();
  }
}

main();
