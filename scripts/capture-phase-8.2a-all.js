const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const dir = 'screenshots/phase-8.2-job-center';
  const adminCookies = [
    { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
    { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
  ];

  // Helper: open drawer and click a tab, then screenshot the drawer panel
  async function captureTab(tabName, fileName) {
    console.log('Tab: ' + tabName);
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    
    // Click first job card to open drawer
    const cards = page.locator('button.w-full');
    if (await cards.count() > 0) {
      await cards.first().click({ force: true });
      await page.waitForTimeout(2000);
      
      // Click the specific tab button
      const tabBtn = page.locator('button').filter({ hasText: tabName });
      if (await tabBtn.count() > 0) {
        await tabBtn.first().click({ force: true });
        await page.waitForTimeout(1500);
      }
      
      // Try to capture just the drawer content panel (right side)
      const drawer = page.locator('[class*="fixed"][class*="right-0"]');
      if (await drawer.count() > 0) {
        await drawer.first().screenshot({ path: dir + '/' + fileName });
        console.log('   Drawer panel captured');
      } else {
        await page.screenshot({ path: dir + '/' + fileName, fullPage: false });
      }
    }
    await ctx.close();
  }

  // 7 Drawer Tabs
  await captureTab('概览', 'job-detail-drawer-overview-real.png');
  await captureTab('漏斗', 'job-detail-drawer-funnel-real.png');
  await captureTab('候选人', 'job-detail-drawer-candidates-real.png');
  await captureTab('面试反馈', 'job-detail-drawer-interview-quality-real.png');
  await captureTab('行动', 'job-detail-drawer-actions-real.png');
  await captureTab('洞察', 'job-detail-drawer-insights-real.png');
  await captureTab('动态', 'job-detail-drawer-activity-real.png');

  // 3 Health card closeups — capture individual cards
  console.log('Health cards...');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    
    // Find all health cards (rounded border cards with job titles)
    const cards = page.locator('button.w-full');
    const count = await cards.count();
    console.log('   Cards found:', count);
    
    // Take first 3 cards as risk/watch/healthy
    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = cards.nth(i);
      const text = await card.textContent();
      const label = text?.includes('风险') ? 'risk' : text?.includes('关注') ? 'watch' : 'healthy';
      console.log(`   Card ${i}: ${label} — ${text?.substring(0, 80)}`);
      await card.screenshot({ path: dir + `/job-health-card-${label}-closeup.png` });
    }
    await ctx.close();
  }

  // Insight provenance — open insights tab, capture
  console.log('Insight provenance...');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const cards = page.locator('button.w-full');
    if (await cards.count() > 0) {
      await cards.first().click({ force: true });
      await page.waitForTimeout(2000);
      const tabBtn = page.locator('button').filter({ hasText: '洞察' });
      if (await tabBtn.count() > 0) {
        await tabBtn.first().click({ force: true });
        await page.waitForTimeout(1500);
      }
      const drawer = page.locator('[class*="fixed"][class*="right-0"]');
      if (await drawer.count() > 0) {
        await drawer.first().screenshot({ path: dir + '/job-insight-provenance-readable.png' });
      }
    }
    await ctx.close();
  }

  // State screenshots
  console.log('States...');
  
  // Empty
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.route('**/api/jobs/analysis**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
    });
    await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: dir + '/job-empty-state-real.png', fullPage: false });
    await ctx.close();
  }

  // Error
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.route('**/api/jobs/analysis**', async (route) => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ success: false, error: 'Server error' }) });
    });
    await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: dir + '/job-error-state-real.png', fullPage: false });
    await ctx.close();
  }

  // Loading
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.route('**/api/jobs/analysis**', async () => { await new Promise(() => {}); });
    await page.goto('http://localhost:3000/jobs', { waitUntil: 'commit', timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(500);
    await page.screenshot({ path: dir + '/job-loading-skeleton-real.png', fullPage: false });
    await ctx.close();
  }

  // Partial
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.route('**/api/jobs/analysis**', async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      if (json.data && json.data.length > 0) {
        json.data[0].openActions = null;
        json.data[0].overdueActions = null;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
    });
    await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: dir + '/job-partial-data-state-real.png', fullPage: false });
    await ctx.close();
  }

  // Permission denied
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies([{ name: 'rd_dev_role', value: 'interviewer', domain: 'localhost', path: '/' },{ name: 'rd_dev_user_id', value: 'cmqv2nfjr000cy3jxq62urqiq', domain: 'localhost', path: '/' }]);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: dir + '/job-permission-denied-real.png', fullPage: false });
    await ctx.close();
  }

  // Existing but unauthorized
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies([{ name: 'rd_dev_role', value: 'interviewer', domain: 'localhost', path: '/' },{ name: 'rd_dev_user_id', value: 'cmqv2nfjr000cy3jxq62urqiq', domain: 'localhost', path: '/' }]);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: dir + '/job-existing-but-unauthorized-real.png', fullPage: false });
    await ctx.close();
  }

  await browser.close();
  console.log('Done');
})();
