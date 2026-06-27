const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const dir = 'screenshots/phase-8.2-job-center';
  const adminCookies = [
    { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
    { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
  ];

  // Open KA大客户销售 and capture each required tab
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies(adminCookies);
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Click KA大客户销售
  const cards = page.locator('button.w-full');
  for (let i = 0; i < await cards.count(); i++) {
    const text = await cards.nth(i).textContent();
    if (text?.includes('KA大客户销售')) {
      await cards.nth(i).click({ force: true });
      await page.waitForTimeout(3000);
      break;
    }
  }

  // Helper: click tab, wait, capture drawer content area
  async function snapTab(tabName, fileName) {
    console.log(`Tab: ${tabName}`);
    const tabBtn = page.locator('button').filter({ hasText: tabName });
    if (await tabBtn.count() > 0) {
      await tabBtn.first().click({ force: true });
      await page.waitForTimeout(1500);
    }
    const drawer = page.locator('[class*="fixed"][class*="right-0"]').first();
    if (await drawer.count() > 0) {
      const text = await drawer.textContent();
      console.log(`   Content length: ${text?.length}, has '${tabName}': ${text?.includes(tabName)}`);
      await drawer.screenshot({ path: dir + '/' + fileName });
    } else {
      await page.screenshot({ path: dir + '/' + fileName, fullPage: false });
    }
  }

  // 6 key screenshots
  await snapTab('洞察', 'job-detail-drawer-insights-real.png');
  await snapTab('动态', 'job-detail-drawer-activity-real.png');
  await snapTab('候选人', 'job-detail-drawer-candidates-real.png');
  await snapTab('面试反馈', 'job-detail-drawer-interview-quality-real.png');
  await snapTab('行动', 'job-detail-drawer-actions-real.png');
  
  // Provenance - already on last tab, go back to 洞察 for provenance
  const tabBtn = page.locator('button').filter({ hasText: '洞察' });
  if (await tabBtn.count() > 0) {
    await tabBtn.first().click({ force: true });
    await page.waitForTimeout(1500);
  }
  const drawer = page.locator('[class*="fixed"][class*="right-0"]').first();
  if (await drawer.count() > 0) {
    const text = await drawer.textContent();
    console.log(`Provenance content: ${text?.substring(0, 200)}`);
    await drawer.screenshot({ path: dir + '/job-insight-provenance-readable.png' });
  }
  
  await ctx.close();
  await browser.close();
  console.log('Done');
})();
