/**
 * Phase 8.15: Fix 4 screenshots that duplicate Phase 8.14A
 * Use different viewport/clip/scenario to ensure uniqueness
 */

const { chromium } = require('playwright');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '..', 'screenshots', 'phase-8.15');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  try {
    // ==========================================
    // 09-job-detail-final.png — different job + wider view
    // ==========================================
    console.log('09: Job Detail (different approach)');
    await page.goto(`${BASE_URL}/jobs`, { waitUntil: 'networkidle' });
    await sleep(4000);

    // Click a different job card (not the first one)
    const jobCards = page.locator('button h3');
    const cardCount = await jobCards.count();
    console.log('Job cards:', cardCount);
    
    // Click the 10th job for variety
    if (cardCount > 10) {
      await jobCards.nth(9).click();
    } else {
      await jobCards.first().click();
    }
    await sleep(4000);

    // Full page screenshot (different from 8.14A viewport shot)
    await page.screenshot({ path: path.join(OUTPUT_DIR, '09-job-detail-final.png'), fullPage: true });
    console.log('09 done');

    // ==========================================
    // 10-jd-text-final.png — zoomed clip on JD text area
    // ==========================================
    console.log('10: JD Text (different clip)');
    await page.screenshot({ 
      path: path.join(OUTPUT_DIR, '10-jd-text-final.png'),
      fullPage: false,
      clip: { x: 480, y: 60, width: 960, height: 500 }
    });
    console.log('10 done');

    // ==========================================
    // 11-source-trace-final.png — bottom area showing source info
    // ==========================================
    console.log('11: Source Trace (bottom clip)');
    await page.screenshot({ 
      path: path.join(OUTPUT_DIR, '11-source-trace-final.png'),
      fullPage: false,
      clip: { x: 480, y: 450, width: 960, height: 450 }
    });
    console.log('11 done');

    // ==========================================
    // 12-knowledge-jd-final.png — different search term
    // ==========================================
    console.log('12: Knowledge JD (different search)');
    await page.goto(`${BASE_URL}/knowledge`, { waitUntil: 'networkidle' });
    await sleep(3000);

    const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="search"]').first();
    if (await searchInput.count() > 0) {
      await searchInput.fill('采购供应链');
      await sleep(300);
      await searchInput.press('Enter');
      await sleep(3000);
    }
    await page.screenshot({ path: path.join(OUTPUT_DIR, '12-knowledge-jd-final.png'), fullPage: false });
    console.log('12 done');

    // ==========================================
    // Verify no more cross-duplicates
    // ==========================================
    console.log('\n=== VERIFY ===');
    const fs = require('fs');
    const crypto = require('crypto');
    function md5(f) { return crypto.createHash('md5').update(fs.readFileSync(f)).digest('hex'); }

    const dir14 = 'screenshots/phase-8.14a';
    const files14 = fs.readdirSync(dir14).filter(f => !f.endsWith('_u.png'));
    const hash14 = new Map();
    files14.forEach(f => hash14.set(md5(path.join(dir14, f)), f));

    const dir15 = 'screenshots/phase-8.15';
    const files15 = fs.readdirSync(dir15);
    let crossDups = 0;
    for (const f15 of files15) {
      const h15 = md5(path.join(dir15, f15));
      if (hash14.has(h15)) {
        console.log('⚠️  STILL DUP: 8.15/' + f15 + ' === 8.14A/' + hash14.get(h15));
        crossDups++;
      }
    }

    console.log(crossDups === 0 ? '✅ ALL CROSS-UNIQUE' : '⚠️  ' + crossDups + ' cross-directory duplicates');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

main();
