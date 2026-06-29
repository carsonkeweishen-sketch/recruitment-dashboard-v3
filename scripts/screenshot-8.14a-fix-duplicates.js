/**
 * Phase 8.14A: Fix duplicate screenshots (08-09, 13-15)
 * 04-05 already fixed in first run
 */

const { chromium } = require('playwright');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '..', 'screenshots', 'phase-8.14a');

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    // ==========================================
    // 08-funnel-bottleneck.png
    // ==========================================
    console.log('=== 08: Funnel bottleneck ===');
    await page.goto(`${BASE_URL}/funnel`, { waitUntil: 'networkidle' });
    await sleep(3000);
    
    // Scroll to show the bottleneck/blocker section
    await page.evaluate(() => window.scrollTo(0, 450));
    await sleep(1500);
    
    await page.screenshot({ path: path.join(OUTPUT_DIR, '08-funnel-bottleneck.png'), fullPage: true });
    console.log('08 done');
    
    // ==========================================
    // 09-funnel-action-entry.png
    // ==========================================
    console.log('=== 09: Funnel action entry ===');
    // Scroll further to find action-related content
    await page.evaluate(() => window.scrollTo(0, 900));
    await sleep(1500);
    
    // Try to find and click an action link
    const actionEls = page.locator('a');
    const count = await actionEls.count();
    let found = false;
    for (let i = 0; i < count; i++) {
      const text = await actionEls.nth(i).textContent();
      if (text && (text.includes('行动') || text.includes('action'))) {
        await actionEls.nth(i).hover();
        await sleep(800);
        found = true;
        break;
      }
    }
    
    await page.screenshot({ path: path.join(OUTPUT_DIR, '09-funnel-action-entry.png'), fullPage: true });
    console.log('09 done');
    
    // ==========================================
    // 13-job-detail-drawer-open.png
    // ==========================================
    console.log('=== 13: Job Detail drawer open ===');
    await page.goto(`${BASE_URL}/jobs`, { waitUntil: 'networkidle' });
    await sleep(3000);
    
    // Click on a job row to open detail drawer
    const jobText = page.locator('table td, [class*="card"]').filter({ hasText: /运营|场控/ }).first();
    if (await jobText.count() > 0) {
      await jobText.click();
      await sleep(2500);
    } else {
      // Try clicking any row
      const firstRow = page.locator('table tr').nth(1);
      if (await firstRow.count() > 0) {
        await firstRow.click();
        await sleep(2500);
      }
    }
    
    await page.screenshot({ path: path.join(OUTPUT_DIR, '13-job-detail-drawer-open.png'), fullPage: false });
    console.log('13 done');
    
    // ==========================================
    // 14-job-detail-jd-text-readable.png
    // ==========================================
    console.log('=== 14: JD text readable ===');
    // Scroll the drawer to show JD description
    const drawers = page.locator('[class*="drawer"] i, [class*="Drawer"] i, [class*="panel"] i, [class*="modal"] i, [class*="sheet"] i');
    const drawerCount = await drawers.count();
    console.log('Possible drawer/panel elements:', drawerCount);
    
    // Scroll within the panel
    if (drawerCount > 0) {
      await drawers.first().evaluate(el => el.scrollTop = 400);
    } else {
      // Try page scroll
      await page.evaluate(() => window.scrollTo(0, 400));
    }
    await sleep(1500);
    
    await page.screenshot({ path: path.join(OUTPUT_DIR, '14-job-detail-jd-text-readable.png'), fullPage: false });
    console.log('14 done');
    
    // ==========================================
    // 15-job-detail-source-trace-readable.png
    // ==========================================
    console.log('=== 15: Source trace readable ===');
    // Scroll further to source trace section
    if (drawerCount > 0) {
      await drawers.first().evaluate(el => el.scrollTop = 800);
    } else {
      await page.evaluate(() => window.scrollTo(0, 800));
    }
    await sleep(1500);
    
    await page.screenshot({ path: path.join(OUTPUT_DIR, '15-job-detail-source-trace-readable.png'), fullPage: false });
    console.log('15 done');
    
    // ==========================================
    // Verify no more duplicates
    // ==========================================
    console.log('\n=== Verifying uniqueness ===');
    const fs = require('fs');
    const crypto = require('crypto');
    function md5(file) {
      return crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex');
    }
    
    const checks = [
      ['04', '05'],
      ['07', '08'], ['07', '09'], ['08', '09'],
      ['13', '14'], ['13', '15'], ['14', '15'],
    ];
    
    let allGood = true;
    for (const [a, b] of checks) {
      const hashA = md5(path.join(OUTPUT_DIR, `${a}-copilot-answer-with-real-citation.png`));
      const hashB = md5(path.join(OUTPUT_DIR, `${b}-copilot-human-review.png`));
      
      // Adjust for non-copilot pairs
      let fileA, fileB;
      if (a.startsWith('0')) {
        const files = fs.readdirSync(OUTPUT_DIR);
        fileA = files.find(f => f.startsWith(a + '-'));
        fileB = files.find(f => f.startsWith(b + '-'));
      } else {
        fileA = files.find(f => f.startsWith(a + '-'));
        fileB = files.find(f => f.startsWith(b + '-'));
      }
      
      const ha = fileA ? md5(path.join(OUTPUT_DIR, fileA)) : 'MISSING';
      const hb = fileB ? md5(path.join(OUTPUT_DIR, fileB)) : 'MISSING';
      
      if (ha === hb) {
        console.log('⚠️  STILL DUPLICATE:', fileA, '===', fileB);
        allGood = false;
      } else {
        console.log('✅ UNIQUE:', a, '≠', b);
      }
    }
    
    console.log(allGood ? '\n✅ ALL UNIQUE' : '\n⚠️  SOME DUPLICATES REMAIN');
    
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

main();
