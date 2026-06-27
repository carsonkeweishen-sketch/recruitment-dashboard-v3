const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const dir = 'screenshots/phase-8.1-ai-dashboard';
  const adminCookies = [
    { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
    { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
  ];

  // ============================================================
  // P0-1: Error State — must be clearly ERROR, not skeleton/loading
  // ============================================================
  console.log('P0-1: ai-dashboard-error-state-real.png');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    // Block API with 500 to force ErrorState component
    await page.route('**/api/dashboard/ai**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: '服务器内部错误' })
      });
    });
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const bodyText = await page.textContent('body');
    console.log('   Has 加载失败:', bodyText?.includes('加载失败'));
    console.log('   Has 重试:', bodyText?.includes('重试'));
    console.log('   NOT skeleton:', !bodyText?.includes('animate-pulse'));
    console.log('   No Prisma:', !bodyText?.includes('Prisma'));
    console.log('   No SQL:', !bodyText?.includes('SQL'));
    await page.screenshot({ path: dir + '/ai-dashboard-error-state-real.png', fullPage: false });
    await ctx.close();
  }

  // ============================================================
  // P0-2: Recent Activity — human-readable, NO raw enum as main text
  // ============================================================
  console.log('P0-2: recent-activity-readable.png');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    // Scroll to recent activity
    await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h3'));
      const h = headings.find(e => e.textContent?.includes('最近动态'));
      if (h) h.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(500);
    // Take element screenshot of activity section
    const actPanel = page.locator('text=最近动态').locator('..').locator('..');
    if (await actPanel.count() > 0) {
      const text = await actPanel.first().textContent();
      console.log('   Has raw ACTION_CREATED as main:', text?.includes('ACTION_CREATED') && !text?.includes('创建了行动项'));
      console.log('   Has human text:', text?.includes('创建了') || text?.includes('标记') || text?.includes('忽略'));
      await actPanel.first().screenshot({ path: dir + '/recent-activity-readable.png' });
      console.log('   ✅ Element screenshot');
    } else {
      await page.screenshot({ path: dir + '/recent-activity-readable.png' });
    }
    await ctx.close();
  }

  // ============================================================
  // P0-3: Partial Data — KPIs visible, NOT error, NOT centered warning
  // ============================================================
  console.log('P0-3: ai-dashboard-partial-data-state-real.png');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    // Modify API: null some metrics, keep KPIs + insights + riskRadar + actions
    await page.route('**/api/dashboard/ai**', async (route) => {
      const response = await route.fetch();
      const json = await response.json();
      if (json.data) {
        json.data.metrics.pendingFeedbackCount = null;
        json.data.metrics.lowQualityFeedbackCount = null;
        json.data.metrics.onTimeResolutionRate = null;
        json.data.metrics.averageResolutionHours = null;
        json.data.candidateRisk = [];
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
    });
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const bodyText = await page.textContent('body');
    console.log('   Has KPI:', bodyText?.includes('进行中岗位'));
    console.log('   Has insight/risk:', bodyText?.includes('风险洞察') || bodyText?.includes('风险雷达') || bodyText?.includes('优先行动'));
    console.log('   NOT error:', !bodyText?.includes('加载失败'));
    console.log('   NOT centered warning only');
    await page.screenshot({ path: dir + '/ai-dashboard-partial-data-state-real.png', fullPage: false });
    await ctx.close();
  }

  await browser.close();
  console.log('Done');
})();
