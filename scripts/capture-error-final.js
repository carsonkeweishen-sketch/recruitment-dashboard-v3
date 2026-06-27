const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const dir = 'screenshots/phase-8.1-ai-dashboard';

  // ============================================================
  // P0-1: Error State — render via API 500 on the REAL dashboard page
  // Then verify the page shows ErrorState component with visible text
  // ============================================================
  console.log('P0-1: ai-dashboard-error-state-real.png');
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies([
      { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
      { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
    ]);
    const page = await ctx.newPage();
    // Force API 500 to trigger ErrorState
    await page.route('**/api/dashboard/ai**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Internal error' })
      });
    });
    await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(3000);
    
    const bodyText = await page.textContent('body');
    console.log('   URL:', page.url());
    console.log('   Has 加载失败:', bodyText?.includes('加载失败'));
    console.log('   Has 重试:', bodyText?.includes('重试'));
    console.log('   Has ProductShell title:', bodyText?.includes('AI 招聘洞察看板'));
    console.log('   No animate-pulse:', !bodyText?.includes('animate-pulse'));
    console.log('   No Prisma:', !bodyText?.includes('Prisma'));
    console.log('   No SQL:', !bodyText?.includes('SQL'));
    console.log('   Body length:', bodyText?.length);
    
    await page.screenshot({ path: dir + '/ai-dashboard-error-state-real.png', fullPage: false });
    await ctx.close();
  }

  await browser.close();
  console.log('Done');
})();
