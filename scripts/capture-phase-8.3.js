const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const dir = 'screenshots/phase-8.3-candidate-center';
  const adminCookies = [
    { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
    { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
  ];

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies(adminCookies);
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/candidates', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Page success
  console.log('1. page success');
  await page.screenshot({ path: dir + '/candidate-center-page-success.png', fullPage: false });

  // 2. KPI
  console.log('2. KPI');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: dir + '/candidate-kpi-summary.png', fullPage: false });

  // 3. Click 赵明远 (high match)
  console.log('3. clicking 赵明远');
  const cards = page.locator('button.w-full');
  let clicked = false;
  for (let i = 0; i < await cards.count(); i++) {
    const text = await cards.nth(i).textContent();
    if (text?.includes('赵明远')) {
      await cards.nth(i).click({ force: true });
      await page.waitForTimeout(4000);
      clicked = true;
      break;
    }
  }
  if (!clicked) console.log('  赵明远 not found!');

  // 4-11. Drawer tabs
  const tabs = [
    { name: '概览', key: 'overview' }, { name: '匹配', key: 'match' },
    { name: '证据', key: 'evidence' }, { name: '面试', key: 'interviews' },
    { name: '风险', key: 'risks' }, { name: '行动', key: 'actions' },
    { name: '洞察', key: 'insights' }, { name: '动态', key: 'activity' },
  ];
  for (const tab of tabs) {
    console.log('  tab: ' + tab.name);
    const tabBtn = page.locator('button').filter({ hasText: tab.name });
    if (await tabBtn.count() > 0) {
      await tabBtn.first().click({ force: true });
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: dir + '/candidate-detail-drawer-' + tab.key + '.png', fullPage: false });
  }

  // 12. Permission denied
  console.log('12. permission');
  await ctx.close();
  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx2.addCookies([{ name: 'rd_dev_role', value: 'interviewer', domain: 'localhost', path: '/' },{ name: 'rd_dev_user_id', value: 'cmqv2nfjr000cy3jxq62urqiq', domain: 'localhost', path: '/' }]);
  const page2 = await ctx2.newPage();
  await page2.goto('http://localhost:3000/candidates', { waitUntil: 'networkidle' });
  await page2.waitForTimeout(1000);
  await page2.screenshot({ path: dir + '/candidate-permission-denied.png', fullPage: false });
  await ctx2.close();

  // 13. Action Center
  console.log('13. action center');
  const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx3.addCookies(adminCookies);
  const page3 = await ctx3.newPage();
  await page3.goto('http://localhost:3000/actions', { waitUntil: 'networkidle' });
  await page3.waitForTimeout(1000);
  await page3.screenshot({ path: dir + '/action-center-still-works-after-candidate-center.png', fullPage: false });
  await ctx3.close();

  await browser.close();
  console.log('Done');
})();
