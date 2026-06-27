const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const dir = 'screenshots/phase-8.1-ai-dashboard';
  const adminCookies = [
    { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
    { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
  ];

  // ============================================================
  // P0-1: Error State — must clearly show error text + retry, NOT skeleton
  // ============================================================
  console.log('1. ai-dashboard-error-state-real.png');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.route('**/api/dashboard/ai**', async (route) => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ success: false, error: 'Server error' }) });
    });
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);
    const text = await page.textContent('body');
    console.log('   URL:', page.url());
    console.log('   加载失败:', text?.includes('加载失败'));
    console.log('   重试:', text?.includes('重试'));
    console.log('   animate-pulse:', text?.includes('animate-pulse'));
    console.log('   Prisma/SQL:', text?.includes('Prisma') || text?.includes('SQL'));
    await page.screenshot({ path: dir + '/ai-dashboard-error-state-real.png', fullPage: false });
    await ctx.close();
  }

  // ============================================================
  // P0-2: Partial Data — KPIs visible, some null, NOT error, NOT centered warning only
  // ============================================================
  console.log('2. ai-dashboard-partial-data-state-real.png');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
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
    const text = await page.textContent('body');
    console.log('   进行中岗位:', text?.includes('进行中岗位'));
    console.log('   风险洞察:', text?.includes('风险洞察') || text?.includes('风险雷达') || text?.includes('优先行动'));
    console.log('   加载失败:', text?.includes('加载失败'));
    await page.screenshot({ path: dir + '/ai-dashboard-partial-data-state-real.png', fullPage: false });
    await ctx.close();
  }

  // ============================================================
  // P1: Job Health closeup — element screenshot, very tight
  // ============================================================
  console.log('3. job-health-snapshot-closeup.png');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies(adminCookies);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    // Scroll to Job Health section
    await page.evaluate(() => {
      const h = Array.from(document.querySelectorAll('h3')).find(e => e.textContent?.includes('岗位健康度'));
      if (h) h.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await page.waitForTimeout(500);
    // Find the first job card specifically
    const firstCard = page.locator('text=岗位健康度').locator('..').locator('..').locator('.grid > div').first();
    if (await firstCard.count() > 0) {
      await firstCard.screenshot({ path: dir + '/job-health-snapshot-closeup.png' });
      console.log('   ✅ First job card');
    } else {
      const section = page.locator('text=岗位健康度').locator('..').locator('..');
      await section.first().screenshot({ path: dir + '/job-health-snapshot-closeup.png' });
    }
    await ctx.close();
  }

  // ============================================================
  // P1: Candidate Risk closeup — element screenshot, very tight
  // ============================================================
  console.log('4. candidate-risk-snapshot-closeup.png');
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
    const firstCard = page.locator('text=候选人风险概览').locator('..').locator('..').locator('.grid > div').first();
    if (await firstCard.count() > 0) {
      await firstCard.screenshot({ path: dir + '/candidate-risk-snapshot-closeup.png' });
      console.log('   ✅ First candidate card');
    } else {
      const section = page.locator('text=候选人风险概览').locator('..').locator('..');
      await section.first().screenshot({ path: dir + '/candidate-risk-snapshot-closeup.png' });
    }
    await ctx.close();
  }

  await browser.close();
  console.log('Done');
})();
