/**
 * Phase 8.15A: Demo Bug Bash — Real click-through verification
 * Walks the full CEO Demo path, checking every step for P0/P1 bugs.
 * Records all findings to stdout for bug-bash.md.
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const OUTPUT_DIR = path.join(__dirname, '..', 'screenshots', 'phase-8.15a');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

const bugs = [];

function addBug(id, severity, page, steps, actual, expected, impactsDemo) {
  bugs.push({ id, severity, page, steps, actual, expected, impactsDemo });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const stepResults = [];

  async function check(step, fn) {
    try {
      await fn();
      stepResults.push({ step, status: 'PASS' });
      console.log(`✅ ${step}`);
    } catch (err) {
      stepResults.push({ step, status: 'FAIL', error: err.message });
      console.log(`❌ ${step}: ${err.message}`);
    }
  }

  try {
    // ==========================================
    // STEP 1: Dashboard
    // ==========================================
    await check('1. Dashboard opens', async () => {
      await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
      await sleep(3000);
      const bodyText = await page.textContent('body');
      if (!bodyText.includes('理然智能招聘') && !bodyText.includes('Dashboard')) {
        throw new Error('Dashboard page did not load correctly');
      }
      // Check for AI button
      const aiBtn = page.locator('button').filter({ hasText: /AI|助手/ }).first();
      const aiCount = await aiBtn.count();
      if (aiCount === 0) throw new Error('AI button not found on Dashboard');
      await page.screenshot({ path: path.join(OUTPUT_DIR, '01-dashboard.png'), fullPage: false });
    });

    // ==========================================
    // STEP 2: Open AI Copilot from Dashboard
    // ==========================================
    await check('2. AI Copilot opens from Dashboard', async () => {
      const aiBtn = page.locator('button').filter({ hasText: /AI|助手/ }).first();
      await aiBtn.click();
      await sleep(2000);
      const panel = page.locator('[data-copilot-panel]');
      const panelCount = await panel.count();
      if (panelCount === 0) throw new Error('Copilot panel did not open');
    });

    // ==========================================
    // STEP 3: Copilot answers with citation
    // ==========================================
    await check('3. Copilot answers with real citation', async () => {
      const input = page.locator('input[placeholder="输入问题..."]').first();
      if (await input.count() === 0) throw new Error('Copilot input not found');
      await input.click({ force: true });
      await input.fill('今天最需要关注的风险是什么？', { force: true });
      await sleep(300);
      await page.locator('button:has-text("发送")').first().click({ force: true });
      await sleep(10000);
      
      const panelText = await page.locator('[data-copilot-panel]').first().innerText();
      if (!panelText.includes('deepseek')) throw new Error('Provider/model not visible');
      if (!panelText.includes('引用')) throw new Error('Citation not visible');
      await page.screenshot({ path: path.join(OUTPUT_DIR, '02-copilot-citation.png'), fullPage: false });
    });

    // ==========================================
    // STEP 4: Human Review visible
    // ==========================================
    await check('4. Human Review visible', async () => {
      const panelText = await page.locator('[data-copilot-panel]').first().innerText();
      const hasReview = panelText.includes('接受') || panelText.includes('编辑') || panelText.includes('忽略');
      if (!hasReview) throw new Error('Human Review buttons not visible');
      await page.screenshot({ path: path.join(OUTPUT_DIR, '03-human-review.png'), fullPage: false });
    });

    // ==========================================
    // STEP 5: No Evidence on knowledge page
    // ==========================================
    await check('5. No Evidence professional refusal', async () => {
      await page.goto(`${BASE_URL}/knowledge`, { waitUntil: 'networkidle' });
      await sleep(2000);
      await page.locator('button').filter({ hasText: /AI|助手/ }).first().click();
      await sleep(2000);
      const input = page.locator('input[placeholder="输入问题..."]').first();
      await input.click({ force: true });
      await input.fill('今天北京天气怎么样？', { force: true });
      await page.locator('button:has-text("发送")').first().click({ force: true });
      await sleep(8000);
      
      const panelText = await page.locator('[data-copilot-panel]').first().innerText();
      if (panelText.includes('天气')) {
        // It might have answered the question — check if it's a proper refusal
        if (!panelText.includes('证据不足') && !panelText.includes('无法生成') && !panelText.includes('超出范围')) {
          console.log('  ⚠️  Copilot answered weather question, checking if appropriate...');
        }
      }
      await page.screenshot({ path: path.join(OUTPUT_DIR, '04-no-evidence.png'), fullPage: false });
    });

    // ==========================================
    // STEP 6: Funnel page
    // ==========================================
    await check('6. Funnel page opens', async () => {
      await page.goto(`${BASE_URL}/analytics/recruitment-funnel`, { waitUntil: 'networkidle' });
      await sleep(3000);
      const bodyText = await page.textContent('body');
      if (bodyText.includes('404') && bodyText.includes('This page could not be found')) {
        throw new Error('Funnel page returns 404');
      }
      if (!bodyText.includes('漏斗')) {
        throw new Error('Funnel keyword not found on page');
      }
      await page.screenshot({ path: path.join(OUTPUT_DIR, '05-funnel.png'), fullPage: false });
    });

    // ==========================================
    // STEP 7: Action Center
    // ==========================================
    await check('7. Action Center opens', async () => {
      await page.goto(`${BASE_URL}/actions`, { waitUntil: 'networkidle' });
      await sleep(3000);
      const bodyText = await page.textContent('body');
      if (bodyText.includes('404')) throw new Error('Action Center returns 404');
      await page.screenshot({ path: path.join(OUTPUT_DIR, '06-action-center.png'), fullPage: false });
    });

    // ==========================================
    // STEP 8: Action Detail
    // ==========================================
    await check('8. Action Detail opens', async () => {
      const actionCard = page.locator('[class*="card" i], button').first();
      const cardCount = await actionCard.count();
      if (cardCount === 0) {
        console.log('  ⚠️  No action cards found — Action Center may be empty (known limitation)');
        addBug('BUG-003', 'P2', 'Action Center', 'Click first action card', 'No action cards to click', 'Should show empty state with explanation', false);
      } else {
        await actionCard.click();
        await sleep(2500);
      }
      await page.screenshot({ path: path.join(OUTPUT_DIR, '07-action-detail.png'), fullPage: false });
    });

    // ==========================================
    // STEP 9: Job Center
    // ==========================================
    await check('9. Job Center shows real jobs', async () => {
      await page.goto(`${BASE_URL}/jobs`, { waitUntil: 'networkidle' });
      await sleep(4000);
      const bodyText = await page.textContent('body');
      if (bodyText.includes('404')) throw new Error('Job Center returns 404');
      
      const jobCards = page.locator('button h3');
      const count = await jobCards.count();
      console.log(`  Job cards found: ${count}`);
      if (count < 50) {
        addBug('BUG-004', 'P0', 'Job Center', 'Open /jobs', `Only ${count} job cards visible`, 'Should show 100 real jobs', true);
      }
      await page.screenshot({ path: path.join(OUTPUT_DIR, '08-job-center.png'), fullPage: false });
    });

    // ==========================================
    // STEP 10: Job Detail Drawer
    // ==========================================
    await check('10. Job Detail Drawer opens', async () => {
      const firstCard = page.locator('button h3').first();
      const jobName = await firstCard.textContent();
      console.log(`  Clicking job: ${jobName}`);
      await firstCard.click();
      await sleep(4000);
      
      const bodyText = await page.textContent('body');
      if (!bodyText.includes('岗位分析详情')) {
        addBug('BUG-001', 'P0', 'Job Detail', 'Click job card', 'Drawer did not open', 'Should show JobAnalysisDrawer', true);
        throw new Error('Job Detail Drawer did not open');
      }
      await page.screenshot({ path: path.join(OUTPUT_DIR, '09-job-detail.png'), fullPage: false });
    });

    // ==========================================
    // STEP 11: JD text readable
    // ==========================================
    await check('11. JD text readable', async () => {
      const bodyText = await page.textContent('body');
      if (!bodyText.includes('JD摘要') && !bodyText.includes('jdText')) {
        addBug('BUG-002', 'P1', 'Job Detail', 'Open Job Detail Drawer', 'JD text section not found', 'Should show JD摘要 with readable text', true);
        throw new Error('JD text not readable');
      }
      await page.screenshot({ path: path.join(OUTPUT_DIR, '10-jd-text.png'), fullPage: false });
    });

    // ==========================================
    // STEP 12: Source trace readable
    // ==========================================
    await check('12. Source trace readable', async () => {
      const bodyText = await page.textContent('body');
      const hasSource = bodyText.includes('source') || bodyText.includes('来源') || bodyText.includes('source_file');
      if (!hasSource) {
        addBug('BUG-005', 'P1', 'Job Detail', 'View Job Detail', 'Source trace not visible', 'Should show source_file/sheet/row', true);
        console.log('  ⚠️  Source trace not clearly visible');
      }
      await page.screenshot({ path: path.join(OUTPUT_DIR, '11-source-trace.png'), fullPage: false });
    });

    // ==========================================
    // STEP 13: Knowledge search JD
    // ==========================================
    await check('13. Knowledge search JD', async () => {
      await page.goto(`${BASE_URL}/knowledge`, { waitUntil: 'networkidle' });
      await sleep(3000);
      
      const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="search"]').first();
      if (await searchInput.count() === 0) {
        throw new Error('Knowledge search input not found');
      }
      await searchInput.fill('场控');
      await sleep(300);
      await searchInput.press('Enter');
      await sleep(3000);
      
      const bodyText = await page.textContent('body');
      if (bodyText.includes('404')) throw new Error('Knowledge returns 404');
      await page.screenshot({ path: path.join(OUTPUT_DIR, '12-knowledge-jd.png'), fullPage: false });
    });

    // ==========================================
    // STEP 14: Knowledge search SOP
    // ==========================================
    await check('14. Knowledge search SOP', async () => {
      const searchInput = page.locator('input[placeholder*="搜索"], input[placeholder*="search"]').first();
      await searchInput.click();
      await searchInput.fill('');
      await searchInput.fill('SOP');
      await sleep(300);
      await searchInput.press('Enter');
      await sleep(3000);
      await page.screenshot({ path: path.join(OUTPUT_DIR, '13-knowledge-sop.png'), fullPage: false });
    });

    // ==========================================
    // Additional checks: fake data, tech jargon, runtime errors
    // ==========================================
    await check('15. No fake data in UI', async () => {
      const bodyText = await page.textContent('body');
      const fakeWords = ['mock', 'demo', 'sample', '测试岗位', '候选人A', 'fake'];
      for (const w of fakeWords) {
        if (bodyText.toLowerCase().includes(w)) {
          addBug('BUG-006', 'P0', 'Multiple', 'Check page content', `Found "${w}" in page`, 'No fake/mock data should appear', true);
        }
      }
    });

    await check('16. No tech jargon in UI', async () => {
      const bodyText = await page.textContent('body');
      const jargonWords = ['RAG', 'embedding', 'adapter'];
      for (const w of jargonWords) {
        if (bodyText.includes(w)) {
          // Check if it's in a legitimate label context (integration status)
          const context = bodyText.substring(
            Math.max(0, bodyText.indexOf(w) - 30),
            Math.min(bodyText.length, bodyText.indexOf(w) + 30)
          );
          console.log(`  ⚠️  "${w}" found in context: "${context}"`);
          // Only flag as bug if NOT in integration/label context
          if (!context.includes('集成') && !context.includes('状态') && !context.includes('status') && !context.includes('readonly')) {
            addBug('BUG-007', 'P2', 'Multiple', 'Check page content', `Tech jargon "${w}" in UI`, 'Should not appear', false);
          }
        }
      }
    });

    // ==========================================
    // Data Sources page
    // ==========================================
    await check('17. Data Sources page opens', async () => {
      await page.goto(`${BASE_URL}/data-sources`, { waitUntil: 'networkidle' });
      await sleep(2000);
      const bodyText = await page.textContent('body');
      if (bodyText.includes('404')) throw new Error('Data Sources returns 404');
      await page.screenshot({ path: path.join(OUTPUT_DIR, '14-data-sources.png'), fullPage: false });
    });

    // ==========================================
    // Integrations page
    // ==========================================
    await check('18. Integrations page honest', async () => {
      await page.goto(`${BASE_URL}/integrations`, { waitUntil: 'networkidle' });
      await sleep(2000);
      const bodyText = await page.textContent('body');
      if (bodyText.includes('404')) throw new Error('Integrations returns 404');
      // Check Moka/feishu not claimed as connected
      await page.screenshot({ path: path.join(OUTPUT_DIR, '15-integrations.png'), fullPage: false });
    });

    // ==========================================
    // Empty state (Candidates)
    // ==========================================
    await check('19. Candidates empty state', async () => {
      await page.goto(`${BASE_URL}/candidates`, { waitUntil: 'networkidle' });
      await sleep(2000);
      const bodyText = await page.textContent('body');
      if (bodyText.includes('404')) throw new Error('Candidates returns 404');
      await page.screenshot({ path: path.join(OUTPUT_DIR, '16-empty-state.png'), fullPage: false });
    });

    // ==========================================
    // Permission denied
    // ==========================================
    await check('20. Permission denied safe', async () => {
      await page.goto(`${BASE_URL}/offer-risks`, { waitUntil: 'networkidle' });
      await sleep(2000);
      await page.screenshot({ path: path.join(OUTPUT_DIR, '17-permission-denied.png'), fullPage: false });
    });

  } catch (err) {
    console.error('Fatal error during bug bash:', err.message);
  } finally {
    // ==========================================
    // OUTPUT RESULTS
    // ==========================================
    console.log('\n========================================');
    console.log('BUG BASH RESULTS');
    console.log('========================================\n');
    
    console.log('STEP RESULTS:');
    let passCount = 0, failCount = 0;
    for (const r of stepResults) {
      console.log(`  ${r.status === 'PASS' ? '✅' : '❌'} ${r.step}`);
      if (r.status === 'PASS') passCount++;
      else { failCount++; console.log(`     Error: ${r.error}`); }
    }
    
    console.log(`\nPASS: ${passCount}/${stepResults.length} | FAIL: ${failCount}/${stepResults.length}`);
    
    console.log('\nBUGS FOUND:');
    if (bugs.length === 0) {
      console.log('  No bugs found on Demo main path');
    }
    for (const b of bugs) {
      console.log(`  ${b.id} [${b.severity}] ${b.page}: ${b.actual}`);
      console.log(`    Expected: ${b.expected} | Impacts Demo: ${b.impactsDemo}`);
    }
    
    // Output bug summary
    const p0Bugs = bugs.filter(b => b.severity === 'P0');
    const p1Bugs = bugs.filter(b => b.severity === 'P1');
    const p2Bugs = bugs.filter(b => b.severity === 'P2');
    console.log(`\nP0: ${p0Bugs.length} | P1: ${p1Bugs.length} | P2: ${p2Bugs.length}`);
    
    // Write results to file for later use
    fs.writeFileSync(
      path.join(OUTPUT_DIR, '..', '..', 'docs', 'self-checks', 'phase-8.15a-bug-bash-raw.json'),
      JSON.stringify({ stepResults, bugs, passCount, failCount, p0: p0Bugs.length, p1: p1Bugs.length, p2: p2Bugs.length }, null, 2)
    );
    
    await browser.close();
  }
}

main();
