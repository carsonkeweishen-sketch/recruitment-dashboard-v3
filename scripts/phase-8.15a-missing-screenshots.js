/**
 * Phase 8.15A: Capture missing Bug Bash screenshots (05/06/08/12/14/15/16)
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '..', 'screenshots', 'phase-8.15a');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    // 05-funnel.png
    console.log('05: Funnel');
    await page.goto(`${BASE_URL}/analytics/recruitment-funnel`, { waitUntil: 'networkidle' });
    await sleep(3000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '05-funnel.png'), fullPage: false });

    // 06-action-center.png
    console.log('06: Action Center');
    await page.goto(`${BASE_URL}/actions`, { waitUntil: 'networkidle' });
    await sleep(3000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '06-action-center.png'), fullPage: false });

    // 08-job-center.png
    console.log('08: Job Center');
    await page.goto(`${BASE_URL}/jobs`, { waitUntil: 'networkidle' });
    await sleep(4000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '08-job-center.png'), fullPage: false });

    // 12-knowledge-jd.png
    console.log('12: Knowledge JD search');
    await page.goto(`${BASE_URL}/knowledge`, { waitUntil: 'networkidle' });
    await sleep(3000);
    const input = page.locator('input[placeholder*="搜索"], input[placeholder*="search"]').first();
    await input.fill('场控');
    await sleep(300);
    await input.press('Enter');
    await sleep(3000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '12-knowledge-jd.png'), fullPage: false });

    // 14-data-sources.png
    console.log('14: Data Sources');
    await page.goto(`${BASE_URL}/data-sources`, { waitUntil: 'networkidle' });
    await sleep(3000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '14-data-sources.png'), fullPage: false });

    // 15-integrations.png
    console.log('15: Integrations');
    await page.goto(`${BASE_URL}/integrations`, { waitUntil: 'networkidle' });
    await sleep(3000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '15-integrations.png'), fullPage: false });

    // 16-empty-state.png
    console.log('16: Empty State (Candidates)');
    await page.goto(`${BASE_URL}/candidates`, { waitUntil: 'networkidle' });
    await sleep(3000);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '16-empty-state.png'), fullPage: false });

    console.log('Done — all 7 missing screenshots captured');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

main();
