const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const dir = 'screenshots/phase-8.2-job-center';
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([
    { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
    { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
  ]);
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Click KA大客户销售
  const cards = page.locator('button.w-full');
  for (let i = 0; i < await cards.count(); i++) {
    const text = await cards.nth(i).textContent();
    if (text?.includes('KA大客户销售')) {
      await cards.nth(i).click({ force: true });
      break;
    }
  }
  
  // Wait for drawer to load
  await page.waitForTimeout(4000);
  
  // Click 洞察 tab
  const tabBtn = page.locator('button').filter({ hasText: '洞察' });
  const tabCount = await tabBtn.count();
  console.log('洞察 tab buttons:', tabCount);
  if (tabCount > 0) {
    await tabBtn.first().click({ force: true });
    await page.waitForTimeout(2000);
  }
  
  // Check page content
  const body = await page.textContent('body');
  console.log('Has 候选人供给偏弱:', body?.includes('候选人供给偏弱'));
  console.log('Has 存在逾期行动项:', body?.includes('存在逾期行动项'));
  console.log('Has 系统规则提醒:', body?.includes('系统规则提醒'));
  console.log('Has 暂无系统洞察:', body?.includes('暂无系统洞察'));
  
  // Full page screenshot
  await page.screenshot({ path: dir + '/job-detail-drawer-insights-real.png', fullPage: false });
  
  // Activity tab
  const actTab = page.locator('button').filter({ hasText: '动态' });
  if (await actTab.count() > 0) {
    await actTab.first().click({ force: true });
    await page.waitForTimeout(1500);
  }
  await page.screenshot({ path: dir + '/job-detail-drawer-activity-real.png', fullPage: false });
  
  // Candidates tab
  const candTab = page.locator('button').filter({ hasText: '候选人' });
  if (await candTab.count() > 0) {
    await candTab.first().click({ force: true });
    await page.waitForTimeout(1500);
  }
  await page.screenshot({ path: dir + '/job-detail-drawer-candidates-real.png', fullPage: false });
  
  // Interview Quality
  const ivTab = page.locator('button').filter({ hasText: '面试反馈' });
  if (await ivTab.count() > 0) {
    await ivTab.first().click({ force: true });
    await page.waitForTimeout(1500);
  }
  await page.screenshot({ path: dir + '/job-detail-drawer-interview-quality-real.png', fullPage: false });
  
  // Actions
  const actTab2 = page.locator('button').filter({ hasText: '行动' });
  if (await actTab2.count() > 0) {
    await actTab2.first().click({ force: true });
    await page.waitForTimeout(1500);
  }
  await page.screenshot({ path: dir + '/job-detail-drawer-actions-real.png', fullPage: false });
  
  // Back to 洞察 for provenance
  const insTab = page.locator('button').filter({ hasText: '洞察' });
  if (await insTab.count() > 0) {
    await insTab.first().click({ force: true });
    await page.waitForTimeout(1500);
  }
  await page.screenshot({ path: dir + '/job-insight-provenance-readable.png', fullPage: false });

  await ctx.close();
  await browser.close();
  console.log('Done');
})();
