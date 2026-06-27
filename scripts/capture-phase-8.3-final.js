const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const dir = 'screenshots/phase-8.3-candidate-center';
  const adminCookies = [
    { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
    { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
  ];

  // ============ PAGE + KPI + FILTER ============
  console.log('1. candidate-center-page-success.png');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/candidates', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: dir + '/candidate-center-page-success.png', fullPage: false });
    await ctx.close();
  }

  // ============ DRAWER TABS (陈书妍 - match:medium, evidence:1, actions:1, interviews:1) ============
  async function captureDrawerTabs(candidateName) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/candidates', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Click candidate card
    const cards = page.locator('[class*="rounded"][class*="border"], button.w-full, [class*="card"]');
    let clicked = false;
    for (let i = 0; i < await cards.count(); i++) {
      const text = await cards.nth(i).textContent();
      if (text?.includes(candidateName)) {
        await cards.nth(i).click({ force: true });
        await page.waitForTimeout(4000);
        clicked = true;
        break;
      }
    }
    if (!clicked) { console.log('   Candidate not found: ' + candidateName); await ctx.close(); return; }

    // Verify drawer opened
    let body = await page.textContent('body');
    console.log('   Drawer open:', body?.includes('候选人评估详情') || body?.includes(candidateName));

    const tabs = [
      { name: '概览', file: 'candidate-detail-drawer-overview.png' },
      { name: '匹配', file: 'candidate-detail-drawer-match.png' },
      { name: '证据', file: 'candidate-detail-drawer-evidence.png' },
      { name: '面试', file: 'candidate-detail-drawer-interviews.png' },
      { name: '风险', file: 'candidate-detail-drawer-risks.png' },
      { name: '行动', file: 'candidate-detail-drawer-actions.png' },
      { name: '洞察', file: 'candidate-detail-drawer-insights.png' },
      { name: '动态', file: 'candidate-detail-drawer-activity.png' },
    ];

    for (const tab of tabs) {
      const tabBtn = page.locator('button').filter({ hasText: tab.name });
      if (await tabBtn.count() > 0) {
        await tabBtn.first().click({ force: true });
        await page.waitForTimeout(1500);
      }
      // Capture full page showing the drawer
      await page.screenshot({ path: dir + '/' + tab.file, fullPage: false });
      
      // Verify content
      body = await page.textContent('body');
      if (tab.name === '洞察') {
        console.log(`   Insights: system_rule=${body?.includes('system_rule')}, 暂无洞察=${body?.includes('暂无系统洞察')}`);
      }
      if (tab.name === '动态') {
        console.log(`   Activity: CREATED as main=${body?.includes('CANDIDATE_CREATED')}, 创建了=${body?.includes('创建了')}`);
      }
    }
    await ctx.close();
  }

  console.log('2-9. Drawer Tabs (陈书妍)');
  await captureDrawerTabs('陈书妍');

  // ============ CLOSEUPS ============
  console.log('10-11. Closeups');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/candidates', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Find 顾清和 card for high-match closeup
    const cards = page.locator('[class*="rounded"][class*="border"], button.w-full, [class*="card"]');
    for (let i = 0; i < await cards.count(); i++) {
      const text = await cards.nth(i).textContent();
      if (text?.includes('顾清和')) {
        await cards.nth(i).screenshot({ path: dir + '/candidate-card-high-match-closeup.png' });
        break;
      }
    }
    // Find 陈书妍 card for risk closeup
    for (let i = 0; i < await cards.count(); i++) {
      const text = await cards.nth(i).textContent();
      if (text?.includes('陈书妍')) {
        await cards.nth(i).screenshot({ path: dir + '/candidate-card-risk-closeup.png' });
        break;
      }
    }
    await ctx.close();
  }

  // ============ INSIGHT PROVENANCE ============
  console.log('12. candidate-insight-provenance-readable.png');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/candidates', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const cards = page.locator('[class*="rounded"][class*="border"], button.w-full, [class*="card"]');
    for (let i = 0; i < await cards.count(); i++) {
      const text = await cards.nth(i).textContent();
      if (text?.includes('陈书妍')) {
        await cards.nth(i).click({ force: true });
        await page.waitForTimeout(4000);
        break;
      }
    }
    const tabBtn = page.locator('button').filter({ hasText: '洞察' });
    if (await tabBtn.count() > 0) {
      await tabBtn.first().click({ force: true });
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: dir + '/candidate-insight-provenance-readable.png', fullPage: false });
    await ctx.close();
  }

  // ============ PERMISSION + ACTION CENTER ============
  console.log('13-16. Permission + Action Center');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies([{ name: 'rd_dev_role', value: 'interviewer', domain: 'localhost', path: '/' },{ name: 'rd_dev_user_id', value: 'cmqv2nfjr000cy3jxq62urqiq', domain: 'localhost', path: '/' }]);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/candidates', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: dir + '/candidate-permission-denied.png', fullPage: false });
    await ctx.close();
  }
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/actions', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: dir + '/action-center-still-works-after-candidate-center.png', fullPage: false });
    await ctx.close();
  }
  // KPI summary and filter bar
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/candidates', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: dir + '/candidate-kpi-summary.png', fullPage: false });
    await ctx.close();
  }
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/candidates', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollTo(0, 120));
    await page.screenshot({ path: dir + '/candidate-filter-bar.png', fullPage: false });
    await ctx.close();
  }

  await browser.close();
  console.log('Done');
})();
