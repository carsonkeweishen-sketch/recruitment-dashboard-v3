/**
 * Phase 8.14A: Fix duplicate screenshots v3
 * Strategy: Use viewport screenshots (not fullPage) so scrolling produces different content
 * For Job Detail: explicitly wait for DrawerShell to appear
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '..', 'screenshots', 'phase-8.14a');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function md5(file) { return crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex'); }

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    // ==========================================
    // 07-funnel-overview.png — top of funnel page (viewport)
    // ==========================================
    console.log('=== 07: Funnel overview (viewport top) ===');
    await page.goto(`${BASE_URL}/analytics/recruitment-funnel`, { waitUntil: 'networkidle' });
    await sleep(4000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(500);
    // Viewport screenshot — just what's visible
    await page.screenshot({ path: path.join(OUTPUT_DIR, '07-funnel-overview.png'), fullPage: false });
    console.log('07 done');

    // ==========================================
    // 08-funnel-bottleneck.png — scrolled down viewport
    // ==========================================
    console.log('=== 08: Funnel bottleneck (viewport mid) ===');
    // Scroll to show middle section
    const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log('Funnel page scrollHeight:', scrollHeight);
    const midPoint = Math.min(scrollHeight * 0.4, scrollHeight - 900);
    await page.evaluate((y) => window.scrollTo(0, y), Math.max(midPoint, 300));
    await sleep(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '08-funnel-bottleneck.png'), fullPage: false });
    console.log('08 done');

    // ==========================================
    // 09-funnel-action-entry.png — bottom of viewport
    // ==========================================
    console.log('=== 09: Funnel action entry (viewport bottom) ===');
    const bottomPoint = Math.max(scrollHeight - 900, 600);
    await page.evaluate((y) => window.scrollTo(0, y), bottomPoint);
    await sleep(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '09-funnel-action-entry.png'), fullPage: false });
    console.log('09 done');

    // ==========================================
    // 13-job-detail-drawer-open.png
    // ==========================================
    console.log('=== 13: Job Detail drawer open ===');
    await page.goto(`${BASE_URL}/jobs`, { waitUntil: 'networkidle' });
    await sleep(4000);

    // Click the first job card button
    const firstCard = page.locator('button h3').first();
    if (await firstCard.count() > 0) {
      const jobName = await firstCard.textContent();
      console.log('Clicking job:', jobName);
      await firstCard.click();
      await sleep(4000);
    }

    // Wait for DrawerShell
    const drawerEl = page.locator('[class*="drawer" i]');
    try {
      await drawerEl.first().waitFor({ state: 'visible', timeout: 5000 });
      console.log('Drawer visible!');
    } catch {
      console.log('Drawer NOT visible, checking for any new panels...');
      const bodyText = await page.textContent('body');
      console.log('Body has "岗位分析详情":', bodyText?.includes('岗位分析详情'));
      console.log('Body has "JD摘要":', bodyText?.includes('JD摘要'));
    }

    await page.screenshot({ path: path.join(OUTPUT_DIR, '13-job-detail-drawer-open.png'), fullPage: false });
    console.log('13 done');

    // ==========================================
    // 14-job-detail-jd-text-readable.png
    // ==========================================
    console.log('=== 14: JD text readable ===');
    // Try scrolling the main page (drawer might overlay)
    await page.evaluate(() => window.scrollTo(0, 350));
    await sleep(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '14-job-detail-jd-text-readable.png'), fullPage: false });
    console.log('14 done');

    // ==========================================
    // 15-job-detail-source-trace-readable.png
    // ==========================================
    console.log('=== 15: Source trace readable ===');
    await page.evaluate(() => window.scrollTo(0, 700));
    await sleep(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '15-job-detail-source-trace-readable.png'), fullPage: false });
    console.log('15 done');

    // ==========================================
    // VERIFY ALL SCREENSHOTS UNIQUE
    // ==========================================
    console.log('\n=== FINAL UNIQUENESS CHECK ===');
    const checks = [
      ['07-funnel-overview.png', '08-funnel-bottleneck.png'],
      ['07-funnel-overview.png', '09-funnel-action-entry.png'],
      ['08-funnel-bottleneck.png', '09-funnel-action-entry.png'],
      ['13-job-detail-drawer-open.png', '14-job-detail-jd-text-readable.png'],
      ['13-job-detail-drawer-open.png', '15-job-detail-source-trace-readable.png'],
      ['14-job-detail-jd-text-readable.png', '15-job-detail-source-trace-readable.png'],
      ['04-copilot-answer-with-real-citation.png', '05-copilot-human-review.png'],
    ];

    let allGood = true;
    for (const [a, b] of checks) {
      try {
        const ha = md5(path.join(OUTPUT_DIR, a));
        const hb = md5(path.join(OUTPUT_DIR, b));
        const status = ha === hb ? '⚠️  DUPLICATE' : '✅ UNIQUE';
        if (ha === hb) allGood = false;
        console.log(status, a.split('.')[0], 'vs', b.split('.')[0]);
      } catch (e) {
        console.log('⚠️  MISSING:', a, 'or', b);
        allGood = false;
      }
    }
    console.log(allGood ? '\n✅ ALL SCREENSHOTS UNIQUE' : '\n⚠️  SOME ISSUES REMAIN');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

main();
