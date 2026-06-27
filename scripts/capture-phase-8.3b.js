const { chromium } = require('playwright');
const http = require('http');

function apiGet(path, cookies) {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000' + path, { headers: { Cookie: cookies } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data.substring(0, 200) }); }
      });
    });
    req.on('error', () => resolve({ status: 0, body: 'error' }));
  });
}

(async () => {
  const adminCookies = 'rd_dev_role=admin; rd_dev_user_id=cmqv2nfjo0007y3jxiwti2eer';
  const interviewerCookies = 'rd_dev_role=interviewer; rd_dev_user_id=cmqv2nfjr000cy3jxq62urqiq';
  const recruiterCookies = 'rd_dev_role=recruiter; rd_dev_user_id=cmqv2nfjr000cy3jxq62urqiq';
  const boCookies = 'rd_dev_role=business_owner; rd_dev_user_id=cmqv2nfjr000cy3jxq62urqiq';

  // Get a candidate ID
  const listResult = await apiGet('/api/candidates/analysis', adminCookies);
  const candidateId = listResult.body?.data?.[0]?.candidateId || 'cmqwevt18000miyqvq6psb1se';
  console.log('candidateId:', candidateId);

  // P0-1: Permission verification
  console.log('\n=== Permission Fix Verification ===');
  const tests = [
    { label: 'admin detail', cookies: adminCookies },
    { label: 'interviewer detail (should 403)', cookies: interviewerCookies },
    { label: 'recruiter detail', cookies: recruiterCookies },
    { label: 'business_owner detail', cookies: boCookies },
  ];
  for (const t of tests) {
    const r = await apiGet(`/api/candidates/${candidateId}/analysis`, t.cookies);
    console.log(`  ${t.label}: HTTP ${r.status} | ${r.body?.error || (r.body?.success ? 'OK' : '?')}`);
  }

  // P0-2: DOM verification
  console.log('\n=== DOM Verification ===');
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([
    { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
    { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
  ]);
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/candidates', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Find and click 陈书妍
  const cards = page.locator('button.w-full, [class*="rounded"][class*="border"]');
  for (let i = 0; i < await cards.count(); i++) {
    const text = await cards.nth(i).textContent();
    if (text?.includes('陈书妍')) {
      await cards.nth(i).click({ force: true });
      await page.waitForTimeout(5000);
      break;
    }
  }

  // Click 洞察 tab
  const tabBtn = page.locator('button').filter({ hasText: '洞察' });
  if (await tabBtn.count() > 0) {
    await tabBtn.first().click({ force: true });
    await page.waitForTimeout(1500);
  }

  const body = await page.textContent('body');
  const domChecks = [
    ['系统规则提醒', true], ['suggestedAction', true], ['证据', true],
    ['triggerCondition', true], ['手机号', false], ['邮箱', false],
    ['薪资', false], ['身份证', false], ['AI 自动淘汰', false], ['一键通过', false],
  ];
  for (const [keyword, expected] of domChecks) {
    const found = body?.includes(keyword);
    const pass = found === expected;
    console.log(`  Has ${keyword}: ${found} (expected: ${expected}) ${pass ? '✅' : '❌'}`);
  }

  // Screenshots
  const dir = 'screenshots/phase-8.3-candidate-center';
  await page.screenshot({ path: dir + '/candidate-detail-drawer-insights-real.png', fullPage: false });
  console.log('  Captured: insights');

  // Permission denied detail screenshot
  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx2.addCookies([{ name: 'rd_dev_role', value: 'interviewer', domain: 'localhost', path: '/' },{ name: 'rd_dev_user_id', value: 'cmqv2nfjr000cy3jxq62urqiq', domain: 'localhost', path: '/' }]);
  const page2 = await ctx2.newPage();
  await page2.goto(`http://localhost:3000/candidates`, { waitUntil: 'networkidle' });
  await page2.waitForTimeout(1000);
  await page2.screenshot({ path: dir + '/candidate-permission-denied-detail-real.png', fullPage: false });
  console.log('  Captured: permission denied detail');
  await ctx2.close();

  // Provenance
  const tabBtn2 = page.locator('button').filter({ hasText: '洞察' });
  if (await tabBtn2.count() > 0) {
    await tabBtn2.first().click({ force: true });
    await page.waitForTimeout(1000);
  }
  await page.screenshot({ path: dir + '/candidate-insight-provenance-readable.png', fullPage: false });
  console.log('  Captured: provenance');

  await ctx.close();
  await browser.close();
  console.log('\nDone');
})();
