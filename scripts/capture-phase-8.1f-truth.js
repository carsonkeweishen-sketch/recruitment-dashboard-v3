const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const dir = 'screenshots/phase-8.1-ai-dashboard';

  // ============================================================
  // P0-1: Error State — full page, API 500, verify text visible
  // ============================================================
  console.log('1. ai-dashboard-error-state-real.png');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies([
      { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
      { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
    ]);
    const page = await ctx.newPage();
    await page.route('**/api/dashboard/ai**', async (route) => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: '{"success":false,"error":"Server error"}' });
    });
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);
    const text = await page.textContent('body');
    console.log('   URL:', page.url());
    console.log('   AI 招聘洞察看板:', text?.includes('AI 招聘洞察看板'));
    console.log('   加载失败:', text?.includes('加载失败'));
    console.log('   重试:', text?.includes('重试'));
    console.log('   animate-pulse:', text?.includes('animate-pulse'));
    await page.screenshot({ path: dir + '/ai-dashboard-error-state-real.png', fullPage: false });
    await ctx.close();
  }

  // ============================================================
  // P0-2: Partial Data — some KPIs null, but others visible
  // ============================================================
  console.log('2. ai-dashboard-partial-data-state-real.png');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies([
      { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
      { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
    ]);
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
    console.log('   待处理行动项:', text?.includes('待处理行动项'));
    console.log('   系统招聘洞察:', text?.includes('系统招聘洞察'));
    console.log('   风险洞察:', text?.includes('风险洞察'));
    console.log('   加载失败:', text?.includes('加载失败'));
    await page.screenshot({ path: dir + '/ai-dashboard-partial-data-state-real.png', fullPage: false });
    await ctx.close();
  }

  // ============================================================
  // P0-3: Job Health closeup — find the section, then the first card inside it
  // ============================================================
  console.log('3. job-health-snapshot-closeup.png');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies([
      { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
      { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
    ]);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    // Find the job health section heading, go up to section, then find first card
    const card = await page.evaluateHandle(() => {
      const h3 = Array.from(document.querySelectorAll('h3')).find(e => e.textContent?.includes('岗位健康度'));
      if (!h3) return null;
      const section = h3.closest('section');
      if (!section) return null;
      // Find the first rounded card inside the grid
      const cards = section.querySelectorAll('.rounded-2xl, [class*="rounded-"]');
      return cards.length > 0 ? cards[0] : null;
    });
    if (card && card.asElement()) {
      const text = await card.asElement()?.textContent();
      console.log('   Job card text:', text?.substring(0, 150));
      await card.asElement()?.screenshot({ path: dir + '/job-health-snapshot-closeup.png' });
    } else {
      console.log('   Card not found, taking section');
      const section = page.locator('text=岗位健康度').locator('..').locator('..');
      await section.first().screenshot({ path: dir + '/job-health-snapshot-closeup.png' });
    }
    await ctx.close();
  }

  // ============================================================
  // P0-4: Candidate Risk closeup — same approach
  // ============================================================
  console.log('4. candidate-risk-snapshot-closeup.png');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies([
      { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
      { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
    ]);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const card = await page.evaluateHandle(() => {
      const h3 = Array.from(document.querySelectorAll('h3')).find(e => e.textContent?.includes('候选人风险概览'));
      if (!h3) return null;
      const section = h3.closest('section');
      if (!section) return null;
      const cards = section.querySelectorAll('.rounded-2xl, [class*="rounded-"]');
      return cards.length > 0 ? cards[0] : null;
    });
    if (card && card.asElement()) {
      const text = await card.asElement()?.textContent();
      console.log('   Candidate card text:', text?.substring(0, 150));
      await card.asElement()?.screenshot({ path: dir + '/candidate-risk-snapshot-closeup.png' });
    } else {
      console.log('   Card not found');
      const section = page.locator('text=候选人风险概览').locator('..').locator('..');
      await section.first().screenshot({ path: dir + '/candidate-risk-snapshot-closeup.png' });
    }
    await ctx.close();
  }

  // ============================================================
  // P0-5: Recent Activity — element screenshot, verify no raw enums
  // ============================================================
  console.log('5. recent-activity-readable.png');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies([
      { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
      { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
    ]);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      const h = Array.from(document.querySelectorAll('h3')).find(e => e.textContent?.includes('最近动态'));
      if (h) h.scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await page.waitForTimeout(500);
    const section = page.locator('text=最近动态').locator('..').locator('..');
    if (await section.count() > 0) {
      const text = await section.first().textContent();
      console.log('   Has CANDIDATE_CREATED as main:', text?.includes('CANDIDATE_CREATED'));
      console.log('   Has APPLICATION_CREATED as main:', text?.includes('APPLICATION_CREATED'));
      console.log('   Has INTERVIEW_FEEDBACK_SUBMITTED:', text?.includes('INTERVIEW_FEEDBACK_SUBMITTED'));
      console.log('   Has 创建了:', text?.includes('创建了'));
      console.log('   Has 标记:', text?.includes('标记'));
      await section.first().screenshot({ path: dir + '/recent-activity-readable.png' });
    }
    await ctx.close();
  }

  await browser.close();
  console.log('Done');
})();
