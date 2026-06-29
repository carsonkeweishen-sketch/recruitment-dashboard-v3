/**
 * Phase 8.15C: Runtime Alignment — capture 8 screenshots with Runtime Proof visible
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const OUT = path.join(__dirname, '..', 'screenshots', 'phase-8.15c');

fs.mkdirSync(OUT, { recursive: true });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const results = [];

  async function step(name, fn) {
    try { await fn(); results.push(name); console.log('✅ ' + name); }
    catch(e) { console.log('❌ ' + name + ': ' + e.message); }
  }

  try {
    // 01-runtime-proof-dashboard.png
    await step('01-dashboard', async () => {
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
      await sleep(3000);
      const body = await page.textContent('body');
      const hasProof = body.includes('Demo Runtime Proof') || body.includes('Runtime Proof');
      console.log('  Runtime Proof visible:', hasProof);
      console.log('  Body has "agent/workbuddy/phase-7":', body.includes('agent/workbuddy/phase-7'));
      console.log('  Body has "4d6d57f":', body.includes('4d6d57f'));
      await page.screenshot({ path: path.join(OUT, '01-runtime-proof-dashboard.png'), fullPage: false });
    });

    // 02-runtime-proof-copilot.png
    await step('02-copilot', async () => {
      await page.locator('button').filter({ hasText: /AI|助手/ }).first().click();
      await sleep(2000);
      const inp = page.locator('input[placeholder="输入问题..."]').first();
      await inp.click({ force: true });
      await inp.fill('今天最需要关注的风险是什么？', { force: true });
      await page.locator('button:has-text("发送")').first().click({ force: true });
      await sleep(10000);
      await page.screenshot({ path: path.join(OUT, '02-runtime-proof-copilot.png'), fullPage: false });
    });

    // 03-runtime-proof-funnel.png
    await step('03-funnel', async () => {
      await page.goto(`${BASE_URL}/analytics/recruitment-funnel`, { waitUntil: 'networkidle' });
      await sleep(3000);
      await page.screenshot({ path: path.join(OUT, '03-runtime-proof-funnel.png'), fullPage: false });
    });

    // 04-runtime-proof-action-center.png
    await step('04-action-center', async () => {
      await page.goto(`${BASE_URL}/actions`, { waitUntil: 'networkidle' });
      await sleep(4000);
      await page.screenshot({ path: path.join(OUT, '04-runtime-proof-action-center.png'), fullPage: false });
    });

    // 05-runtime-proof-action-detail.png
    await step('05-action-detail', async () => {
      const row = page.locator('text=猎头渠道沟通calibration').first();
      if (await row.count() > 0) {
        await row.click();
        await sleep(3000);
      }
      await page.screenshot({ path: path.join(OUT, '05-runtime-proof-action-detail.png'), fullPage: false });
    });

    // 06-runtime-proof-job-detail.png
    await step('06-job-detail', async () => {
      await page.goto(`${BASE_URL}/jobs`, { waitUntil: 'networkidle' });
      await sleep(4000);
      const card = page.locator('button h3').first();
      await card.click();
      await sleep(4000);
      await page.screenshot({ path: path.join(OUT, '06-runtime-proof-job-detail.png'), fullPage: false });
    });

    // 07-runtime-proof-knowledge.png
    await step('07-knowledge', async () => {
      await page.goto(`${BASE_URL}/knowledge`, { waitUntil: 'networkidle' });
      await sleep(3000);
      const inp = page.locator('input[placeholder*="搜索"], input[placeholder*="search"]').first();
      await inp.fill('场控');
      await inp.press('Enter');
      await sleep(3000);
      await page.screenshot({ path: path.join(OUT, '07-runtime-proof-knowledge.png'), fullPage: false });
    });

    // 08-runtime-proof-data-sources.png
    await step('08-data-sources', async () => {
      await page.goto(`${BASE_URL}/data-sources`, { waitUntil: 'networkidle' });
      await sleep(3000);
      await page.screenshot({ path: path.join(OUT, '08-runtime-proof-data-sources.png'), fullPage: false });
    });

    console.log('\n=== RESULTS ===');
    console.log('Captured: ' + results.length + '/8');
    
    // Verify files
    const expected = [
      '01-runtime-proof-dashboard.png',
      '02-runtime-proof-copilot.png',
      '03-runtime-proof-funnel.png',
      '04-runtime-proof-action-center.png',
      '05-runtime-proof-action-detail.png',
      '06-runtime-proof-job-detail.png',
      '07-runtime-proof-knowledge.png',
      '08-runtime-proof-data-sources.png',
    ];
    console.log('\nFile verification:');
    for (const f of expected) {
      const fp = path.join(OUT, f);
      if (fs.existsSync(fp)) console.log('  ✅ ' + f + ' (' + (fs.statSync(fp).size/1024).toFixed(1) + ' KB)');
      else console.log('  ❌ MISSING: ' + f);
    }

  } catch(err) {
    console.error('FATAL:', err.message);
  } finally {
    await browser.close();
  }
}

main();
