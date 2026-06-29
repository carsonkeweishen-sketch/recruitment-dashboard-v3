/**
 * Phase 8.15B: Capture all required screenshots + simulate real demo recording
 * 
 * Required:
 * - 02-copilot-citation-closeup.png (provider/model/promptVersion/citation readable)
 * - 03-copilot-human-review-closeup.png (Human Review buttons readable)
 * - 04-copilot-no-evidence-closeup.png (No Evidence refusal readable)
 * - 07-action-detail-fixed.png (Action Detail Drawer with title/source/owner/status/priority)
 * - Full demo path screenshots for recording evidence
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const OUT = path.join(__dirname, '..', 'screenshots', 'phase-8.15b');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const results = [];

  async function step(name, fn) {
    try { await fn(); results.push({ step: name, ok: true }); console.log('✅ ' + name); }
    catch(e) { results.push({ step: name, ok: false, error: e.message }); console.log('❌ ' + name + ': ' + e.message); }
  }

  try {
    // ==========================================
    // 01: Dashboard → Open
    // ==========================================
    await step('01-dashboard', async () => {
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
      await sleep(3000);
      await page.screenshot({ path: path.join(OUT, '01-dashboard.png'), fullPage: false });
    });

    // ==========================================
    // 02: Copilot → Open from Dashboard
    // ==========================================
    await step('02-copilot-open', async () => {
      await page.locator('button').filter({ hasText: /AI|助手/ }).first().click();
      await sleep(2000);
    });

    // ==========================================
    // 03: Copilot → Ask question, get citation
    // ==========================================
    await step('03-copilot-answer', async () => {
      const inp = page.locator('input[placeholder="输入问题..."]').first();
      await inp.click({ force: true });
      await inp.fill('今天最需要关注的风险是什么？', { force: true });
      await page.locator('button:has-text("发送")').first().click({ force: true });
      await sleep(10000);
    });

    // ==========================================
    // 02-copilot-citation-closeup.png
    // Must show: provider, model, promptVersion, citation
    // ==========================================
    await step('capture-citation-closeup', async () => {
      const panel = page.locator('[data-copilot-panel]');
      const box = await panel.first().boundingBox();
      if (!box) throw new Error('Copilot panel not found');
      // Clip to right side panel area showing answer + citation
      await page.screenshot({
        path: path.join(OUT, '02-copilot-citation-closeup.png'),
        clip: { x: Math.max(0, box.x - 20), y: 0, width: Math.min(1440 - box.x + 20, 700), height: 900 }
      });
    });

    // ==========================================
    // 03-copilot-human-review-closeup.png
    // Must show: Human Review buttons (接受/编辑后接受/忽略)
    // ==========================================
    await step('capture-human-review-closeup', async () => {
      const panel = page.locator('[data-copilot-panel]');
      const box = await panel.first().boundingBox();
      // Clip to bottom portion showing Human Review buttons
      await page.screenshot({
        path: path.join(OUT, '03-copilot-human-review-closeup.png'),
        clip: { x: Math.max(0, box.x - 20), y: 400, width: Math.min(1440 - box.x + 20, 700), height: 500 }
      });
    });

    // ==========================================
    // 04-copilot-no-evidence-closeup.png
    // Navigate to Knowledge, ask irrelevant question
    // ==========================================
    await step('04-no-evidence', async () => {
      await page.goto(`${BASE_URL}/knowledge`, { waitUntil: 'networkidle' });
      await sleep(2000);
      await page.locator('button').filter({ hasText: /AI|助手/ }).first().click();
      await sleep(2000);
      const inp = page.locator('input[placeholder="输入问题..."]').first();
      await inp.click({ force: true });
      await inp.fill('今天北京天气怎么样？这个和招聘无关', { force: true });
      await page.locator('button:has-text("发送")').first().click({ force: true });
      await sleep(8000);
      const panel = page.locator('[data-copilot-panel]');
      const box = await panel.first().boundingBox();
      if (box) {
        await page.screenshot({
          path: path.join(OUT, '04-copilot-no-evidence-closeup.png'),
          clip: { x: Math.max(0, box.x - 20), y: 0, width: Math.min(1440 - box.x + 20, 700), height: 900 }
        });
      } else {
        await page.screenshot({ path: path.join(OUT, '04-copilot-no-evidence-closeup.png'), fullPage: false });
      }
    });

    // ==========================================
    // 05: Funnel
    // ==========================================
    await step('05-funnel', async () => {
      await page.goto(`${BASE_URL}/analytics/recruitment-funnel`, { waitUntil: 'networkidle' });
      await sleep(3000);
      await page.screenshot({ path: path.join(OUT, '05-funnel.png'), fullPage: false });
    });

    // ==========================================
    // 06: Action Center
    // ==========================================
    await step('06-action-center', async () => {
      await page.goto(`${BASE_URL}/actions`, { waitUntil: 'networkidle' });
      await sleep(4000);
      await page.screenshot({ path: path.join(OUT, '06-action-center.png'), fullPage: false });
    });

    // ==========================================
    // 07-action-detail-fixed.png
    // CRITICAL: Must show Action Detail Drawer (NOT Copilot panel)
    // Must show: title, source, owner, status, priority, linked context, resolution/dismiss
    // ==========================================
    await step('07-action-detail-fixed', async () => {
      // Click the action item to open drawer
      const actionRow = page.locator('text=猎头渠道沟通calibration').first();
      if (await actionRow.count() === 0) throw new Error('Action item not found');
      await actionRow.click();
      await sleep(3000);

      // Verify drawer content
      const body = await page.textContent('body');
      const hasResolution = body.includes('resolution') || body.includes('解决') || body.includes('关闭');
      const hasDismiss = body.includes('dismiss') || body.includes('忽略');
      console.log('  Drawer content: resolution=' + hasResolution + ' dismiss=' + hasDismiss);

      // Full viewport screenshot showing the drawer
      await page.screenshot({ path: path.join(OUT, '07-action-detail-fixed.png'), fullPage: false });

      // Also capture a closeup of the drawer panel
      await page.screenshot({
        path: path.join(OUT, '07-action-detail-closeup.png'),
        clip: { x: 840, y: 0, width: 600, height: 900 }
      });
    });

    // ==========================================
    // 08: Job Center
    // ==========================================
    await step('08-job-center', async () => {
      await page.goto(`${BASE_URL}/jobs`, { waitUntil: 'networkidle' });
      await sleep(4000);
      await page.screenshot({ path: path.join(OUT, '08-job-center.png'), fullPage: false });
    });

    // ==========================================
    // 09: Job Detail Drawer
    // ==========================================
    await step('09-job-detail', async () => {
      const card = page.locator('button h3').first();
      await card.click();
      await sleep(4000);
      await page.screenshot({ path: path.join(OUT, '09-job-detail.png'), fullPage: false });
    });

    // ==========================================
    // 10: JD Text + Source Trace
    // ==========================================
    await step('10-jd-source-trace', async () => {
      await page.screenshot({
        path: path.join(OUT, '10-jd-text.png'),
        clip: { x: 480, y: 60, width: 960, height: 500 }
      });
      await page.screenshot({
        path: path.join(OUT, '10-source-trace.png'),
        clip: { x: 480, y: 400, width: 960, height: 500 }
      });
    });

    // ==========================================
    // 11: Knowledge search JD + SOP
    // ==========================================
    await step('11-knowledge-jd', async () => {
      await page.goto(`${BASE_URL}/knowledge`, { waitUntil: 'networkidle' });
      await sleep(3000);
      const inp = page.locator('input[placeholder*="搜索"], input[placeholder*="search"]').first();
      await inp.fill('场控');
      await inp.press('Enter');
      await sleep(3000);
      await page.screenshot({ path: path.join(OUT, '11-knowledge-jd.png'), fullPage: false });
    });

    await step('12-knowledge-sop', async () => {
      const inp = page.locator('input[placeholder*="搜索"], input[placeholder*="search"]').first();
      await inp.click(); await inp.fill(''); await inp.fill('SOP');
      await inp.press('Enter');
      await sleep(3000);
      await page.screenshot({ path: path.join(OUT, '12-knowledge-sop.png'), fullPage: false });
    });

    // ==========================================
    // 13: Data Sources + Integrations
    // ==========================================
    await step('13-data-sources', async () => {
      await page.goto(`${BASE_URL}/data-sources`, { waitUntil: 'networkidle' });
      await sleep(2000);
      await page.screenshot({ path: path.join(OUT, '13-data-sources.png'), fullPage: false });
    });

    await step('14-integrations', async () => {
      await page.goto(`${BASE_URL}/integrations`, { waitUntil: 'networkidle' });
      await sleep(2000);
      await page.screenshot({ path: path.join(OUT, '14-integrations.png'), fullPage: false });
    });

    // ==========================================
    // Summary
    // ==========================================
    const passed = results.filter(r => r.ok).length;
    const failed = results.filter(r => !r.ok).length;
    console.log('\n=== RESULTS ===');
    console.log('Passed: ' + passed + '/' + results.length + ' | Failed: ' + failed);
    if (failed > 0) {
      for (const r of results.filter(r => !r.ok)) {
        console.log('  ❌ ' + r.step + ': ' + r.error);
      }
    }

    // Verify required files exist
    const required = [
      '02-copilot-citation-closeup.png',
      '03-copilot-human-review-closeup.png',
      '04-copilot-no-evidence-closeup.png',
      '07-action-detail-fixed.png',
    ];
    console.log('\n=== REQUIRED FILES ===');
    for (const f of required) {
      const fp = path.join(OUT, f);
      if (fs.existsSync(fp)) {
        console.log('  ✅ ' + f + ' (' + (fs.statSync(fp).size/1024).toFixed(1) + ' KB)');
      } else {
        console.log('  ❌ MISSING: ' + f);
      }
    }

  } catch (err) {
    console.error('FATAL:', err.message);
  } finally {
    await browser.close();
  }
}

main();
