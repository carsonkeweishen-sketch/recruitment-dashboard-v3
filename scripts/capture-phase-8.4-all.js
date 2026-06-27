const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const dir = 'screenshots/phase-8.4-interview-quality';
  const adminCookies = [
    { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
    { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
  ];

  // ============ PAGE + KPI + FILTER ============
  console.log('1-3. Page + KPI + Filter');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies(adminCookies);
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/interview-quality', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: dir + '/interview-quality-page-success.png', fullPage: false });
  console.log('  interview-quality-page-success.png');

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({ path: dir + '/interview-quality-kpi-summary.png', fullPage: false });
  console.log('  interview-quality-kpi-summary.png');

  await page.evaluate(() => window.scrollTo(0, 150));
  await page.waitForTimeout(300);
  await page.screenshot({ path: dir + '/interview-quality-filter-bar.png', fullPage: false });
  console.log('  interview-quality-filter-bar.png');

  // ============ CLOSEUPS ============
  console.log('4-5. Closeups');
  const cards = page.locator('button.w-full, [class*="rounded"][class*="border"]');
  const cardCount = await cards.count();
  console.log('  Cards found:', cardCount);
  if (cardCount > 0) {
    await cards.first().screenshot({ path: dir + '/interview-quality-card-low-quality-closeup.png' });
    console.log('  interview-quality-card-low-quality-closeup.png');
  }
  if (cardCount > 1) {
    await cards.nth(1).screenshot({ path: dir + '/interview-quality-card-overdue-closeup.png' });
    console.log('  interview-quality-card-overdue-closeup.png');
  }

  // ============ DRAWER TABS ============
  console.log('6-12. Drawer Tabs');
  if (cardCount > 0) {
    await cards.first().click({ force: true });
    await page.waitForTimeout(5000);
  }

  const tabs = [
    { name: '概览', file: 'interview-quality-detail-drawer-overview.png' },
    { name: '反馈', file: 'interview-quality-detail-drawer-feedback.png' },
    { name: '证据', file: 'interview-quality-detail-drawer-evidence.png' },
    { name: '风险', file: 'interview-quality-detail-drawer-risks.png' },
    { name: '追问', file: 'interview-quality-detail-drawer-follow-up.png' },
    { name: '行动', file: 'interview-quality-detail-drawer-actions.png' },
    { name: '动态', file: 'interview-quality-detail-drawer-activity.png' },
  ];
  for (const tab of tabs) {
    const btn = page.locator('button').filter({ hasText: tab.name });
    if (await btn.count() > 0) { await btn.first().click({ force: true }); await page.waitForTimeout(1000); }
    await page.screenshot({ path: dir + '/' + tab.file, fullPage: false });
    console.log('  ' + tab.file);
  }

  // ============ PROVENANCE ============
  console.log('13. Provenance');
  const btn = page.locator('button').filter({ hasText: '反馈' });
  if (await btn.count() > 0) { await btn.first().click({ force: true }); await page.waitForTimeout(1000); }
  await page.screenshot({ path: dir + '/interview-quality-insight-provenance-readable.png', fullPage: false });
  console.log('  interview-quality-insight-provenance-readable.png');
  await ctx.close();

  // ============ PERMISSION + ACTION + CANDIDATE ============
  console.log('14-16. Permission + Action + Candidate');
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await c.addCookies([{ name: 'rd_dev_role', value: 'interviewer', domain: 'localhost', path: '/' },{ name: 'rd_dev_user_id', value: 'cmqv2nfjr000cy3jxq62urqiq', domain: 'localhost', path: '/' }]);
    const p = await c.newPage();
    await p.goto('http://localhost:3000/interview-quality', { waitUntil: 'networkidle' });
    await p.waitForTimeout(1000);
    await p.screenshot({ path: dir + '/interview-quality-permission-denied.png', fullPage: false });
    console.log('  interview-quality-permission-denied.png');
    await c.close();
  }
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await c.addCookies(adminCookies);
    const p = await c.newPage();
    await p.goto('http://localhost:3000/actions', { waitUntil: 'networkidle' });
    await p.waitForTimeout(1000);
    await p.screenshot({ path: dir + '/action-center-still-works-after-interview-quality.png', fullPage: false });
    console.log('  action-center-still-works-after-interview-quality.png');
    await c.close();
  }
  {
    const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await c.addCookies(adminCookies);
    const p = await c.newPage();
    await p.goto('http://localhost:3000/candidates', { waitUntil: 'networkidle' });
    await p.waitForTimeout(1000);
    await p.screenshot({ path: dir + '/candidate-center-still-works-after-interview-quality.png', fullPage: false });
    console.log('  candidate-center-still-works-after-interview-quality.png');
    await c.close();
  }

  await browser.close();
  console.log('Done — 16 screenshots');
})();
