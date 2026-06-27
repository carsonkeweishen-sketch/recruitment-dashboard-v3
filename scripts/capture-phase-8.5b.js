const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const dir = 'screenshots/phase-8.5-offer-risk';
  const adminCookies = [
    { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
    { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
  ];

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies(adminCookies);
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/offer-risks', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // ============ P0-2: True Empty State (200, empty data) ============
  console.log('=== Empty State (200) ===');
  await page.route('**/api/offer-risks/analysis**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const emptyBody = await page.textContent('body');
  console.log('  Has 暂无:', emptyBody?.includes('暂无'));
  console.log('  Has Offer 风险数据:', emptyBody?.includes('Offer 风险数据'));
  await page.screenshot({ path: dir + '/offer-risk-empty-state-real.png', fullPage: false });

  // Restore normal API
  await page.unroute('**/api/offer-risks/analysis**');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // ============ P0-1: Drawer DOM + P0-3/4: Closeups ============
  console.log('\n=== Drawer DOM + Closeups ===');
  const cards = page.locator('button.w-full');
  if (await cards.count() > 0) {
    await cards.first().click({ force: true });
    await page.waitForTimeout(5000);
  }

  const drawerBody = await page.textContent('body');
  console.log('  Drawer open:', drawerBody?.includes('Offer 风险详情'));

  // Go through each tab and verify DOM + take screenshot
  const tabs = [
    { label: '风险因素', file: 'offer-risk-detail-drawer-risk-factors-closeup.png', checks: ['title', 'summary', 'riskLevel', 'triggerCondition', 'system_rule'] },
    { label: '意向', file: 'offer-risk-detail-drawer-candidate-intent-closeup.png', checks: ['意向', '证据', '疑虑'] },
    { label: 'Closing', file: 'offer-risk-detail-drawer-closing-plan-closeup.png', checks: ['Closing', '建议', '补充'] },
    { label: '洞察', file: 'offer-risk-detail-drawer-insights-closeup.png', checks: ['title', 'summary', 'evidence', 'suggestedAction', 'system_rule', 'triggerCondition'] },
  ];

  for (const tab of tabs) {
    const btn = page.locator('button').filter({ hasText: tab.label });
    if (await btn.count() > 0) { await btn.first().click({ force: true }); await page.waitForTimeout(1500); }
    await page.screenshot({ path: dir + '/' + tab.file, fullPage: false });
    // DOM check on tab content
    const tabBody = await page.textContent('body');
    console.log(`  ${tab.label}:`);
    for (const kw of tab.checks) {
      console.log(`    Has ${kw}: ${tabBody?.includes(kw)}`);
    }
  }

  // Provenance — on insights tab
  const insBtn = page.locator('button').filter({ hasText: '洞察' });
  if (await insBtn.count() > 0) { await insBtn.first().click({ force: true }); await page.waitForTimeout(1500); }
  await page.screenshot({ path: dir + '/offer-risk-insight-provenance-readable.png', fullPage: false });

  // ============ P0-1: Full Drawer DOM Verification ============
  console.log('\n=== Full Drawer DOM Verification ===');
  const domChecks = [
    ['Closing 建议', true], ['系统规则提醒', true], ['suggestedAction', true],
    ['triggerCondition', true], ['evidence', true], ['生成方式：系统规则提醒', true],
    ['证据数量', true], ['更新时间', true],
    ['发 Offer', false], ['审批 Offer', false], ['一键发 Offer', false],
    ['一键通过', false], ['一键淘汰', false], ['AI 自动淘汰', false],
    ['AI 自动录用', false], ['手机号', false], ['邮箱', false],
    ['身份证', false], ['详细薪资', false], ['薪资数字', false],
  ];
  // Go through each tab to maximize coverage
  for (const tab of tabs) {
    const btn = page.locator('button').filter({ hasText: tab.label });
    if (await btn.count() > 0) { await btn.first().click({ force: true }); await page.waitForTimeout(1000); }
  }
  // Final check on insights tab
  const finBtn = page.locator('button').filter({ hasText: '洞察' });
  if (await finBtn.count() > 0) { await finBtn.first().click({ force: true }); await page.waitForTimeout(1000); }
  
  const finalBody = await page.textContent('body');
  let pass = 0, fail = 0;
  for (const [kw, exp] of domChecks) {
    const found = finalBody?.includes(kw);
    const ok = found === exp;
    if (ok) pass++; else fail++;
    console.log(`  Has ${kw}: ${found} (expected: ${exp}) ${ok ? '✅' : '❌'}`);
  }
  console.log(`  RESULT: ${pass}/${pass+fail} PASS`);
  
  await ctx.close();
  await browser.close();
  console.log('\nDone');
})();
