const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([
    { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
    { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
  ]);
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/jobs', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  let body = await page.textContent('body');
  console.log('Initial - has 岗位分析:', body?.includes('岗位分析'));
  
  const cards = page.locator('button.w-full');
  const count = await cards.count();
  console.log('Cards:', count);
  
  for (let i = 0; i < count; i++) {
    const text = await cards.nth(i).textContent();
    if (text?.includes('KA大客户销售')) {
      console.log('Clicking card', i);
      await cards.nth(i).click({ force: true });
      await page.waitForTimeout(3000);
      break;
    }
  }
  
  body = await page.textContent('body');
  console.log('After click - has 岗位分析详情:', body?.includes('岗位分析详情'));
  console.log('After click - has 洞察:', body?.includes('洞察'));
  console.log('After click - has 候选人供给偏弱:', body?.includes('候选人供给偏弱'));
  
  // Screenshot the right side drawer
  const drawer = page.locator('[class*="fixed"]').last();
  const dc = await drawer.count();
  console.log('Fixed elements:', dc);
  if (dc > 0) {
    const text = await drawer.textContent();
    console.log('Last fixed element text sample:', text?.substring(0, 200));
    await drawer.screenshot({ path: 'screenshots/phase-8.2-job-center/job-insight-provenance-readable.png' });
  } else {
    await page.screenshot({ path: 'screenshots/phase-8.2-job-center/job-insight-provenance-readable.png', fullPage: false });
  }
  
  await ctx.close();
  await browser.close();
})();
