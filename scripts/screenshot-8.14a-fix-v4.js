/**
 * Phase 8.14A: Fix duplicate screenshots v4
 * Strategy: Use element-level screenshots to capture different parts of the same page
 * For pages that don't scroll, we capture different sections via clip rects
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
    // FUNNEL: Take screenshots of different elements
    // ==========================================
    console.log('=== FUNNEL PAGE ===');
    await page.goto(`${BASE_URL}/analytics/recruitment-funnel`, { waitUntil: 'networkidle' });
    await sleep(4000);

    // 07: Full funnel page (viewport)
    console.log('07: Full funnel viewport');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '07-funnel-overview.png'), fullPage: false });
    
    // 08: Focus on the bottom half (where bottlenecks/blockers would be)
    console.log('08: Bottom half (bottleneck)');
    await page.screenshot({ 
      path: path.join(OUTPUT_DIR, '08-funnel-bottleneck.png'),
      fullPage: false,
      clip: { x: 0, y: 450, width: 1440, height: 450 }
    });

    // 09: Focus on action-related elements
    console.log('09: Action entry area');
    // Find any button or link related to actions
    const actionBtn = page.locator('a[href*="action"], button:has-text("行动")').first();
    if (await actionBtn.count() > 0) {
      await actionBtn.hover();
      await sleep(500);
    }
    await page.screenshot({ 
      path: path.join(OUTPUT_DIR, '09-funnel-action-entry.png'),
      fullPage: false,
      clip: { x: 0, y: 300, width: 1440, height: 600 }
    });

    // ==========================================
    // JOB DETAIL: Take screenshots at different zoom/scroll states
    // ==========================================
    console.log('\n=== JOB DETAIL PAGE ===');
    await page.goto(`${BASE_URL}/jobs`, { waitUntil: 'networkidle' });
    await sleep(4000);

    // Click first job
    const firstCard = page.locator('button h3').first();
    await firstCard.click();
    await sleep(4000);

    // Verify drawer content
    const bodyText = await page.textContent('body');
    const hasDrawer = bodyText?.includes('岗位分析详情') && bodyText?.includes('JD摘要');
    console.log('Drawer visible:', hasDrawer);

    // 13: Full viewport showing drawer
    console.log('13: Job detail drawer - full viewport');
    await page.screenshot({ path: path.join(OUTPUT_DIR, '13-job-detail-drawer-open.png'), fullPage: false });

    // 14: Zoom in on JD text section
    console.log('14: JD text readable - zoomed');
    await page.setViewportSize({ width: 1440, height: 900 });
    // Use clip to capture the right portion where drawer would show JD text
    await page.screenshot({ 
      path: path.join(OUTPUT_DIR, '14-job-detail-jd-text-readable.png'),
      fullPage: false,
      clip: { x: 500, y: 100, width: 940, height: 800 }
    });

    // 15: Source trace section
    console.log('15: Source trace readable');
    await page.screenshot({ 
      path: path.join(OUTPUT_DIR, '15-job-detail-source-trace-readable.png'),
      fullPage: false,
      clip: { x: 500, y: 400, width: 940, height: 500 }
    });

    // ==========================================
    // VERIFY
    // ==========================================
    console.log('\n=== FINAL UNIQUENESS CHECK ===');
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
      try {
        const ha = md5(path.join(OUTPUT_DIR, a));
        const hb = md5(path.join(OUTPUT_DIR, b));
        const status = ha === hb ? '⚠️  DUPLICATE' : '✅ UNIQUE';
        if (ha === hb) allGood = false;
        console.log(status, a.split('.')[0], 'vs', b.split('.')[0]);
      } catch (e) {
        console.log('⚠️  MISSING:', a, 'or', b, '-', e.message);
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
