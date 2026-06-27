const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const dir = 'screenshots/phase-8.1-ai-dashboard';
  const adminCookies = [
    { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
    { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
  ];

  // ============================================================
  // FIX 1: Partial Data — show KPIs visible, some blocks show "data unavailable"
  // ============================================================
  console.log('FIX 1: ai-dashboard-partial-data-state-real.png');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    // Intercept API: set some metrics null, keep others
    await page.route('**/api/dashboard/ai**', async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      if (json.data) {
        json.data.metrics.pendingFeedbackCount = null;
        json.data.metrics.lowQualityFeedbackCount = null;
        json.data.metrics.onTimeResolutionRate = null;
        json.data.metrics.averageResolutionHours = null;
        // Clear candidate risk + job health to show "data unavailable" sections
        json.data.candidateRisk = [];
        // Keep other data: metrics, insights, riskRadar, priorityActions, jobHealth, recentActivity
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
    });
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const bodyText = await page.textContent('body');
    console.log('   Has KPI (进行中岗位):', bodyText?.includes('进行中岗位'));
    console.log('   NOT error state:', !bodyText?.includes('加载失败'));
    console.log('   Has health summary:', bodyText?.includes('系统招聘洞察'));
    await page.screenshot({ path: dir + '/ai-dashboard-partial-data-state-real.png', fullPage: false });
    await ctx.close();
  }

  // ============================================================
  // FIX 2: Recent Activity — human-readable main text
  // ============================================================
  console.log('FIX 2: recent-activity-readable.png');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    // Scroll to recent activity section
    await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h3'));
      const actHeading = headings.find(h => h.textContent?.includes('最近动态'));
      if (actHeading) actHeading.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(500);
    // Use locator screenshot directly
    const actPanel = page.locator('text=最近动态').locator('..').locator('..');
    if (await actPanel.count() > 0) {
      await actPanel.first().screenshot({ path: dir + '/recent-activity-readable.png' });
      console.log('   ✅ Element screenshot');
    } else {
      await page.screenshot({ path: dir + '/recent-activity-readable.png', fullPage: false });
    }
    await ctx.close();
  }

  // ============================================================
  // FIX 3a: Job Health — tight clip showing name, health, actions
  // ============================================================
  console.log('FIX 3a: job-health-snapshot-readable.png');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      const h = Array.from(document.querySelectorAll('h3')).find(e => e.textContent?.includes('岗位健康度'));
      if (h) h.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(500);
    const section = page.locator('text=岗位健康度').locator('..').locator('..');
    if (await section.count() > 0) {
      await section.first().screenshot({ path: dir + '/job-health-snapshot-readable.png' });
      console.log('   ✅ Element screenshot');
    }
    await ctx.close();
  }

  // ============================================================
  // FIX 3b: Candidate Risk — tight clip, no sensitive data
  // ============================================================
  console.log('FIX 3b: candidate-risk-snapshot-readable.png');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      const h = Array.from(document.querySelectorAll('h3')).find(e => e.textContent?.includes('候选人风险概览'));
      if (h) h.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(500);
    const section = page.locator('text=候选人风险概览').locator('..').locator('..');
    if (await section.count() > 0) {
      await section.first().screenshot({ path: dir + '/candidate-risk-snapshot-readable.png' });
      console.log('   ✅ Element screenshot');
    }
    await ctx.close();
  }

  await browser.close();
  console.log('Done');
})();
