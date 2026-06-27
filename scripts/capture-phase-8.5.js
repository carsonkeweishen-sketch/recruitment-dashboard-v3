const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const dir = 'screenshots/phase-8.5-offer-risk';
  const adminCookies = [{ name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },{ name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' }];

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies(adminCookies);
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/offer-risks', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1-3: Page + KPI + Filter
  await page.screenshot({ path: dir + '/offer-risk-page-success.png', fullPage: false });
  console.log('1. page');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: dir + '/offer-risk-kpi-summary.png', fullPage: false });
  console.log('2. kpi');
  await page.evaluate(() => window.scrollTo(0, 120));
  await page.screenshot({ path: dir + '/offer-risk-filter-bar.png', fullPage: false });
  console.log('3. filter');

  // 4-5: Closeups
  const cards = page.locator('button.w-full');
  const cnt = await cards.count();
  console.log('Cards:', cnt);
  if (cnt > 0) { await cards.first().screenshot({ path: dir + '/offer-risk-card-high-risk-closeup.png' }); console.log('4. card1'); }
  if (cnt > 1) { await cards.nth(1).screenshot({ path: dir + '/offer-risk-card-urgent-closeup.png' }); console.log('5. card2'); }

  // 6-13: Drawer tabs
  if (cnt > 0) {
    await cards.first().click({ force: true });
    await page.waitForTimeout(5000);
    const body = await page.textContent('body');
    console.log('Drawer open:', body?.includes('Offer 风险详情'));

    const tabs = [
      { label: '概览', file: 'offer-risk-detail-drawer-overview.png', attr: 'overview' },
      { label: '风险因素', file: 'offer-risk-detail-drawer-risk-factors.png', attr: 'risk-factors' },
      { label: '意向', file: 'offer-risk-detail-drawer-candidate-intent.png', attr: 'intent' },
      { label: 'Closing', file: 'offer-risk-detail-drawer-closing-plan.png', attr: 'closing' },
      { label: '行动', file: 'offer-risk-detail-drawer-actions.png', attr: 'actions' },
      { label: '洞察', file: 'offer-risk-detail-drawer-insights.png', attr: 'insights' },
      { label: '动态', file: 'offer-risk-detail-drawer-activity.png', attr: 'activity' },
    ];
    for (const t of tabs) {
      const btn = page.locator('button').filter({ hasText: t.label });
      if (await btn.count() > 0) { await btn.first().click({ force: true }); await page.waitForTimeout(1000); }
      await page.screenshot({ path: dir + '/' + t.file, fullPage: false });
      console.log('  ' + t.file);
    }

    // 13: Provenance
    const insBtn = page.locator('button').filter({ hasText: '洞察' });
    if (await insBtn.count() > 0) { await insBtn.first().click({ force: true }); await page.waitForTimeout(1000); }
    await page.screenshot({ path: dir + '/offer-risk-insight-provenance-readable.png', fullPage: false });
    console.log('13. provenance');
  }

  // 14: Permission
  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx2.addCookies([{ name: 'rd_dev_role', value: 'interviewer', domain: 'localhost', path: '/' },{ name: 'rd_dev_user_id', value: 'cmqv2nfjr000cy3jxq62urqiq', domain: 'localhost', path: '/' }]);
  const p2 = await ctx2.newPage();
  await p2.goto('http://localhost:3000/offer-risks', { waitUntil: 'networkidle' });
  await p2.waitForTimeout(1000);
  await p2.screenshot({ path: dir + '/offer-risk-permission-denied.png', fullPage: false });
  console.log('14. permission');
  await ctx2.close();

  // 15-16: Action + Candidate
  const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx3.addCookies(adminCookies);
  const p3 = await ctx3.newPage();
  await p3.goto('http://localhost:3000/actions', { waitUntil: 'networkidle' });
  await p3.waitForTimeout(1000);
  await p3.screenshot({ path: dir + '/action-center-still-works-after-offer-risk.png', fullPage: false });
  console.log('15. action');
  await ctx3.close();

  const ctx4 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx4.addCookies(adminCookies);
  const p4 = await ctx4.newPage();
  await p4.goto('http://localhost:3000/candidates', { waitUntil: 'networkidle' });
  await p4.waitForTimeout(1000);
  await p4.screenshot({ path: dir + '/candidate-center-still-works-after-offer-risk.png', fullPage: false });
  console.log('16. candidate');
  await ctx4.close();

  await ctx.close();
  await browser.close();
  console.log('Done — 16 screenshots');
})();
