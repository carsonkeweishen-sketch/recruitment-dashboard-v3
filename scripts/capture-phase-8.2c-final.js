const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const dir = 'screenshots/phase-8.2-job-center';
  const adminCookies = [
    { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
    { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
  ];

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies(adminCookies);
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Find and click KA大客户销售
  const cards = page.locator('button.w-full');
  let found = false;
  for (let i = 0; i < await cards.count(); i++) {
    const text = await cards.nth(i).textContent();
    if (text?.includes('KA大客户销售')) {
      await cards.nth(i).click({ force: true });
      await page.waitForTimeout(3000);
      found = true;
      break;
    }
  }
  if (!found) { console.log('KA大客户销售 not found!'); await ctx.close(); await browser.close(); return; }

  // Verify drawer opened
  const drawerContent = await page.textContent('body');
  console.log('Drawer has 概览 tab:', drawerContent?.includes('概览'));

  // Capture each tab with verification
  const tabs = [
    { name: '概览', file: 'job-detail-drawer-overview-real.png', verify: '岗位名称' },
    { name: '漏斗', file: 'job-detail-drawer-funnel-real.png', verify: '入库' },
    { name: '候选人', file: 'job-detail-drawer-candidates-real.png', verify: '候选人' },
    { name: '面试反馈', file: 'job-detail-drawer-interview-quality-real.png', verify: '面试' },
    { name: '行动', file: 'job-detail-drawer-actions-real.png', verify: '行动' },
    { name: '洞察', file: 'job-detail-drawer-insights-real.png', verify: '洞察' },
    { name: '动态', file: 'job-detail-drawer-activity-real.png', verify: '动态' },
  ];

  for (const tab of tabs) {
    console.log(`Tab: ${tab.name}`);
    const tabBtn = page.locator('button').filter({ hasText: tab.name });
    if (await tabBtn.count() > 0) {
      await tabBtn.first().click({ force: true });
      await page.waitForTimeout(1500);
    }
    // Verify content
    const drawer = page.locator('[class*="fixed"][class*="right-0"]').first();
    if (await drawer.count() > 0) {
      const text = await drawer.textContent();
      const hasContent = text?.includes(tab.verify) || text?.length > 100;
      console.log(`   Content check: ${hasContent ? 'PASS' : 'WARN'} (length: ${text?.length})`);
      await drawer.screenshot({ path: dir + '/' + tab.file });
    }
  }

  // Provenance
  console.log('Provenance');
  // Already on 洞察 tab from above, capture provenance
  const drawer = page.locator('[class*="fixed"][class*="right-0"]').first();
  if (await drawer.count() > 0) {
    const text = await drawer.textContent();
    console.log('   Has system_rule:', text?.includes('system_rule'));
    console.log('   Has 系统规则:', text?.includes('系统规则提醒') || text?.includes('生成方式'));
    await drawer.screenshot({ path: dir + '/job-insight-provenance-readable.png' });
  }
  await ctx.close();

  // Error state
  console.log('Error state');
  {
    const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx2.addCookies(adminCookies);
    const page2 = await ctx2.newPage();
    await page2.route('**/api/jobs/analysis**', async (route) => {
      await route.fulfill({ status: 500, contentType: 'application/json', body: '{"success":false,"error":"Server error"}' });
    });
    await page2.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
    await page2.waitForTimeout(2000);
    const text = await page2.textContent('body');
    console.log('   Has 加载失败:', text?.includes('加载失败'));
    console.log('   Has 重试:', text?.includes('重试'));
    console.log('   animate-pulse:', text?.includes('animate-pulse'));
    await page2.screenshot({ path: dir + '/job-error-state-real.png', fullPage: false });
    await ctx2.close();
  }

  // Action Center
  console.log('Action center');
  {
    const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx3.addCookies(adminCookies);
    const page3 = await ctx3.newPage();
    await page3.goto('http://localhost:3000/actions', { waitUntil: 'networkidle' });
    await page3.waitForTimeout(1000);
    await page3.screenshot({ path: dir + '/action-center-still-works.png', fullPage: false });
    await ctx3.close();
  }

  await browser.close();
  console.log('Done');
})();
