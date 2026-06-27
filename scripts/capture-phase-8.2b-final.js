const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const dir = 'screenshots/phase-8.2-job-center';
  const adminCookies = [
    { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
    { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
  ];

  // Helper: find a specific job card by title text, click it, then capture each tab
  async function captureDrawerTabs(jobTitlePattern) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    
    // Find and click the specific job card
    const cards = page.locator('button.w-full');
    const count = await cards.count();
    let clicked = false;
    for (let i = 0; i < count; i++) {
      const text = await cards.nth(i).textContent();
      if (text?.includes(jobTitlePattern)) {
        await cards.nth(i).click({ force: true });
        await page.waitForTimeout(2000);
        clicked = true;
        break;
      }
    }
    
    if (!clicked) { console.log('   Job not found: ' + jobTitlePattern); await ctx.close(); return; }

    const tabs = [
      { name: '概览', file: 'job-detail-drawer-overview-real.png' },
      { name: '漏斗', file: 'job-detail-drawer-funnel-real.png' },
      { name: '候选人', file: 'job-detail-drawer-candidates-real.png' },
      { name: '面试反馈', file: 'job-detail-drawer-interview-quality-real.png' },
      { name: '行动', file: 'job-detail-drawer-actions-real.png' },
      { name: '洞察', file: 'job-detail-drawer-insights-real.png' },
      { name: '动态', file: 'job-detail-drawer-activity-real.png' },
    ];

    for (const tab of tabs) {
      console.log('   Tab: ' + tab.name);
      const tabBtn = page.locator('button').filter({ hasText: tab.name });
      if (await tabBtn.count() > 0) {
        await tabBtn.first().click({ force: true });
        await page.waitForTimeout(1000);
      }
      // Capture drawer panel
      const drawer = page.locator('[class*="fixed"][class*="right-0"]').first();
      if (await drawer.count() > 0) {
        await drawer.screenshot({ path: dir + '/' + tab.file });
      } else {
        await page.screenshot({ path: dir + '/' + tab.file, fullPage: false });
      }
    }
    await ctx.close();
  }

  // Use KA大客户销售 (most risk signals: risk+overdue+supply)
  console.log('Target: KA大客户销售');
  await captureDrawerTabs('KA大客户销售');

  // Also capture Overview from 媒介投放 (different data)
  console.log('Target: 媒介投放 (for variety)');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const cards = page.locator('button.w-full');
    for (let i = 0; i < await cards.count(); i++) {
      const text = await cards.nth(i).textContent();
      if (text?.includes('媒介投放')) {
        await cards.nth(i).click({ force: true });
        await page.waitForTimeout(2000);
        const tabBtn = page.locator('button').filter({ hasText: '洞察' });
        if (await tabBtn.count() > 0) {
          await tabBtn.first().click({ force: true });
          await page.waitForTimeout(1000);
        }
        const drawer = page.locator('[class*="fixed"][class*="right-0"]').first();
        if (await drawer.count() > 0) {
          await drawer.screenshot({ path: dir + '/job-insight-provenance-readable.png' });
        }
        break;
      }
    }
    await ctx.close();
  }

  // Health card closeups — capture KA大客户销售 card
  console.log('Health card closeup');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    const cards = page.locator('button.w-full');
    for (let i = 0; i < await cards.count(); i++) {
      const text = await cards.nth(i).textContent();
      if (text?.includes('KA大客户销售')) {
        await cards.nth(i).screenshot({ path: dir + '/job-health-card-risk-closeup.png' });
        break;
      }
    }
    for (let i = 0; i < await cards.count(); i++) {
      const text = await cards.nth(i).textContent();
      if (text?.includes('招聘专员')) {
        await cards.nth(i).screenshot({ path: dir + '/job-health-card-healthy-closeup.png' });
        break;
      }
    }
    for (let i = 0; i < await cards.count(); i++) {
      const text = await cards.nth(i).textContent();
      if (text?.includes('采购资源开发')) {
        await cards.nth(i).screenshot({ path: dir + '/job-health-card-watch-closeup.png' });
        break;
      }
    }
    await ctx.close();
  }

  // Error state
  console.log('Error state');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.route('**/api/jobs/analysis**', async (route) => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: '{"success":false,"error":"Server error"}' });
    });
    await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: dir + '/job-error-state-real.png', fullPage: false });
    await ctx.close();
  }

  // Permission / scoped
  console.log('Permission states');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies([{ name: 'rd_dev_role', value: 'interviewer', domain: 'localhost', path: '/' },{ name: 'rd_dev_user_id', value: 'cmqv2nfjr000cy3jxq62urqiq', domain: 'localhost', path: '/' }]);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: dir + '/job-permission-denied-real.png', fullPage: false });
    await ctx.close();
  }
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies([{ name: 'rd_dev_role', value: 'recruiter', domain: 'localhost', path: '/' },{ name: 'rd_dev_user_id', value: 'cmqv2nfjr000cy3jxq62urqiq', domain: 'localhost', path: '/' }]);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: dir + '/job-recruiter-scoped-view-real.png', fullPage: false });
    await ctx.close();
  }
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies([{ name: 'rd_dev_role', value: 'business_owner', domain: 'localhost', path: '/' },{ name: 'rd_dev_user_id', value: 'cmqv2nfjr000cy3jxq62urqiq', domain: 'localhost', path: '/' }]);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: dir + '/job-business-owner-scoped-view-real.png', fullPage: false });
    await ctx.close();
  }

  await browser.close();
  console.log('Done');
})();
