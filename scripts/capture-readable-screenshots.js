const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const dir = 'screenshots/phase-8.1-ai-dashboard';
  const adminCookies = [
    { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
    { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
  ];

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies(adminCookies);
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // P0-5a: Risk Radar — scroll to radar section, clip the element
  console.log('1. risk-radar-panel-readable.png');
  const radarSection = page.locator('text=风险雷达').locator('..').locator('..');
  if (await radarSection.count() > 0) {
    await radarSection.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await radarSection.first().screenshot({ path: dir + '/risk-radar-panel-readable.png' });
    console.log('   ✅');
  } else { console.log('   ⚠️ not found, taking viewport'); await page.screenshot({ path: dir + '/risk-radar-panel-readable.png' }); }

  // P0-5b: Job Health
  console.log('2. job-health-snapshot-readable.png');
  const jobSection = page.locator('text=岗位健康度').locator('..').locator('..');
  if (await jobSection.count() > 0) {
    await jobSection.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await jobSection.first().screenshot({ path: dir + '/job-health-snapshot-readable.png' });
    console.log('   ✅');
  } else { console.log('   ⚠️'); await page.screenshot({ path: dir + '/job-health-snapshot-readable.png' }); }

  // P0-5c: Candidate Risk
  console.log('3. candidate-risk-snapshot-readable.png');
  const candSection = page.locator('text=候选人风险概览').locator('..').locator('..');
  if (await candSection.count() > 0) {
    await candSection.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await candSection.first().screenshot({ path: dir + '/candidate-risk-snapshot-readable.png' });
    console.log('   ✅');
  } else { console.log('   ⚠️'); await page.screenshot({ path: dir + '/candidate-risk-snapshot-readable.png' }); }

  // P0-5d: Recent Activity
  console.log('4. recent-activity-readable.png');
  const actSection = page.locator('text=最近动态').locator('..').locator('..');
  if (await actSection.count() > 0) {
    await actSection.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await actSection.first().screenshot({ path: dir + '/recent-activity-readable.png' });
    console.log('   ✅');
  } else { console.log('   ⚠️'); await page.screenshot({ path: dir + '/recent-activity-readable.png' }); }

  // P0-5e: Provenance — health summary section
  console.log('5. ai-provenance-system-rule-readable.png');
  const provSection = page.locator('text=系统规则提醒').first();
  if (await provSection.count() > 0) {
    await provSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    // Clip around the health summary card
    const healthCard = page.locator('text=系统招聘洞察').locator('..').locator('..');
    if (await healthCard.count() > 0) {
      await healthCard.first().screenshot({ path: dir + '/ai-provenance-system-rule-readable.png' });
      console.log('   ✅');
    } else { await page.screenshot({ path: dir + '/ai-provenance-system-rule-readable.png' }); }
  } else { console.log('   ⚠️'); await page.screenshot({ path: dir + '/ai-provenance-system-rule-readable.png' }); }

  // P0-5f: Priority Actions
  console.log('6. priority-actions-to-action-center-readable.png');
  const paSection = page.locator('text=优先行动项').locator('..').locator('..');
  if (await paSection.count() > 0) {
    await paSection.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await paSection.first().screenshot({ path: dir + '/priority-actions-to-action-center-readable.png' });
    console.log('   ✅');
  } else { console.log('   ⚠️'); await page.screenshot({ path: dir + '/priority-actions-to-action-center-readable.png' }); }

  await ctx.close();
  await browser.close();
  console.log('Done');
})();
