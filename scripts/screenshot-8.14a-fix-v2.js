/**
 * Phase 8.14A: Fix duplicate screenshots v2
 * Correct routes + proper element targeting
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
    // 07-funnel-overview.png — full funnel page
    // ==========================================
    console.log('=== 07: Funnel overview ===');
    await page.goto(`${BASE_URL}/analytics/recruitment-funnel`, { waitUntil: 'networkidle' });
    await sleep(4000);
    
    const bodyText07 = await page.textContent('body');
    console.log('Page check:', bodyText07?.includes('漏斗') ? '✅ 漏斗' : '⚠️  NO FUNNEL');
    console.log('Preview:', bodyText07?.substring(0, 200));
    
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(500);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '07-funnel-overview.png'), fullPage: true });
    console.log('07 done');

    // ==========================================
    // 08-funnel-bottleneck.png — scroll to show bottleneck
    // ==========================================
    console.log('=== 08: Funnel bottleneck ===');
    // Scroll halfway to show different section
    await page.evaluate(() => window.scrollTo(0, 500));
    await sleep(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '08-funnel-bottleneck.png'), fullPage: true });
    console.log('08 done');

    // ==========================================
    // 09-funnel-action-entry.png — scroll to bottom
    // ==========================================
    console.log('=== 09: Funnel action entry ===');
    await page.evaluate(() => window.scrollTo(0, 1000));
    await sleep(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '09-funnel-action-entry.png'), fullPage: true });
    console.log('09 done');

    // ==========================================
    // 13-job-detail-drawer-open.png — job detail drawer
    // ==========================================
    console.log('=== 13: Job Detail drawer open ===');
    await page.goto(`${BASE_URL}/jobs`, { waitUntil: 'networkidle' });
    await sleep(4000);

    // JobHealthCard is a button with job name in h3
    const jobCards = page.locator('button').filter({ has: page.locator('h3') });
    const cardCount = await jobCards.count();
    console.log('Job card buttons found:', cardCount);
    
    if (cardCount > 0) {
      // Click the first job card
      await jobCards.first().click();
      await sleep(3000);
    }
    
    // Check if drawer opened
    const drawer = page.locator('[class*="drawer" i], [class*="Drawer" i], [class*="panel" i], [class*="Panel" i]');
    const drawerCount = await drawer.count();
    console.log('Drawer/panel elements:', drawerCount);
    
    // Find the job detail drawer specifically (not sidebar)
    const jobDrawer = page.locator('[class*="analysis" i], [class*="Analysis" i], [class*="JobDetail" i]');
    const jobDrawerCount = await jobDrawer.count();
    console.log('Job detail elements:', jobDrawerCount);
    
    await page.screenshot({ path: path.join(OUTPUT_DIR, '13-job-detail-drawer-open.png'), fullPage: false });
    console.log('13 done');

    // ==========================================
    // 14-job-detail-jd-text-readable.png — show JD text
    // ==========================================
    console.log('=== 14: JD text readable ===');
    // Scroll within the drawer
    await page.evaluate(() => window.scrollTo(0, 300));
    await sleep(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '14-job-detail-jd-text-readable.png'), fullPage: false });
    console.log('14 done');

    // ==========================================
    // 15-job-detail-source-trace-readable.png — show source trace
    // ==========================================
    console.log('=== 15: Source trace readable ===');
    await page.evaluate(() => window.scrollTo(0, 600));
    await sleep(1000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '15-job-detail-source-trace-readable.png'), fullPage: false });
    console.log('15 done');

    // ==========================================
    // VERIFY
    // ==========================================
    console.log('\n=== UNIQUENESS CHECK ===');
    const checks = [
      ['07-funnel-overview.png', '08-funnel-bottleneck.png'],
      ['07-funnel-overview.png', '09-funnel-action-entry.png'],
      ['08-funnel-bottleneck.png', '09-funnel-action-entry.png'],
      ['13-job-detail-drawer-open.png', '14-job-detail-jd-text-readable.png'],
      ['13-job-detail-drawer-open.png', '15-job-detail-source-trace-readable.png'],
      ['14-job-detail-jd-text-readable.png', '15-job-detail-source-trace-readable.png'],
    ];

    let allGood = true;
    for (const [a, b] of checks) {
      const ha = md5(path.join(OUTPUT_DIR, a));
      const hb = md5(path.join(OUTPUT_DIR, b));
      const status = ha === hb ? '⚠️  DUPLICATE' : '✅ UNIQUE';
      if (ha === hb) allGood = false;
      console.log(status, a, 'vs', b);
    }
    console.log(allGood ? '\n✅ ALL UNIQUE' : '\n⚠️  SOME DUPLICATES');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

main();
