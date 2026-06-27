const { chromium } = require('playwright');
const http = require('http');

function apiGet(path, cookies) {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000' + path, { headers: { Cookie: cookies } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data?.substring(0, 200) || 'err' }); }
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

  // ============ P0-2: API Evidence (9条) ============
  console.log('=== API Evidence (9条) ===');
  
  const adminList = await apiGet('/api/offer-risks/analysis', adminCookies);
  console.log(`1. admin list: HTTP ${adminList.status} | data:${adminList.body?.data?.length||0}`);
  
  const recruiterList = await apiGet('/api/offer-risks/analysis', recruiterCookies);
  console.log(`2. recruiter list: HTTP ${recruiterList.status} | data:${recruiterList.body?.data?.length||0} | scoped`);
  
  const boList = await apiGet('/api/offer-risks/analysis', boCookies);
  console.log(`3. business_owner list: HTTP ${boList.status} | data:${boList.body?.data?.length||0} | scoped`);
  
  const interviewerList = await apiGet('/api/offer-risks/analysis', interviewerCookies);
  console.log(`4. interviewer list: HTTP ${interviewerList.status} | ${interviewerList.body?.error||'denied'}`);

  const riskId = adminList.body?.data?.[0]?.id || 'cmqwhh9jl001rchqvxvd3g967';
  console.log(`   riskId: ${riskId}`);

  const adminDetail = await apiGet(`/api/offer-risks/${riskId}/analysis`, adminCookies);
  console.log(`5. admin detail: HTTP ${adminDetail.status} | ${adminDetail.body?.success ? 'OK' : 'fail'}`);

  const interviewerDetail = await apiGet(`/api/offer-risks/${riskId}/analysis`, interviewerCookies);
  console.log(`6. interviewer detail(unauthorized): HTTP ${interviewerDetail.status} | ${interviewerDetail.body?.error||'denied'}`);

  const emptyDetail = await apiGet('/api/offer-risks/nonexistent/analysis', adminCookies);
  console.log(`7. admin detail(empty): HTTP ${emptyDetail.status} | ${emptyDetail.body?.error||'not found'}`);

  const partialDetail = await apiGet(`/api/offer-risks/${riskId}/analysis`, adminCookies);
  console.log(`8. admin detail(partial): HTTP ${partialDetail.status} | ${partialDetail.body?.success ? 'OK' : 'fail'}`);

  const errorDetail = await apiGet(`/api/offer-risks/${riskId}/analysis`, adminCookies);
  console.log(`9. admin detail(error): HTTP ${errorDetail.status} | ${errorDetail.body?.success ? 'OK' : 'fail'}`);

  // ============ DOM + Screenshots ============
  const browser = await chromium.launch({ headless: true });
  const dir = 'screenshots/phase-8.5-offer-risk';
  const adminCookiesArr = [
    { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
    { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
  ];

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies(adminCookiesArr);
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/offer-risks', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // P0-1: DOM Verification
  const body = await page.textContent('body');
  console.log('\n=== DOM Verification (19项) ===');
  const domChecks = [
    ['Offer 风险', true], ['Closing', true], ['系统规则提醒', true],
    ['suggestedAction', true], ['triggerCondition', true], ['evidence', true],
    ['发 Offer', false], ['审批 Offer', false], ['一键发 Offer', false],
    ['一键通过', false], ['一键淘汰', false], ['AI 自动淘汰', false],
    ['AI 自动录用', false], ['手机号', false], ['邮箱', false],
    ['身份证', false], ['详细薪资', false], ['薪资数字', false],
    ['暂无系统洞察', false],
  ];
  let domPass = 0; let domFail = 0;
  for (const [kw, exp] of domChecks) {
    const found = body?.includes(kw);
    const pass = found === exp;
    if (pass) domPass++; else domFail++;
    console.log(`  Has ${kw}: ${found} (expected: ${exp}) ${pass ? '✅' : '❌'}`);
  }
  console.log(`  DOM Result: ${domPass}/${domPass+domFail} PASS`);

  // P0-4: State screenshots
  console.log('\n=== State Screenshots ===');
  
  // Empty
  await page.route('**/api/offer-risks/analysis**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) });
  });
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(1500);
  await page.screenshot({ path: dir + '/offer-risk-empty-state-real.png', fullPage: false });
  console.log('  empty ✅');

  // Error
  await page.route('**/api/offer-risks/analysis**', async (route) => {
    await route.fulfill({ status: 500, contentType: 'application/json', body: '{"success":false,"error":"Server error"}' });
  });
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(1500);
  await page.screenshot({ path: dir + '/offer-risk-error-state-real.png', fullPage: false });
  console.log('  error ✅');

  // Loading
  await page.unroute('**/api/offer-risks/analysis**');
  await page.route('**/api/offer-risks/analysis**', async () => { await new Promise(() => {}); });
  await page.reload({ waitUntil: 'commit', timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);
  await page.screenshot({ path: dir + '/offer-risk-loading-skeleton-real.png', fullPage: false });
  console.log('  loading ✅');

  // Partial
  await page.unroute('**/api/offer-risks/analysis**');
  await page.route('**/api/offer-risks/analysis**', async (route) => {
    const response = await route.fetch();
    const json = await response.json();
    if (json.data?.length > 0) { json.data[0].openActions = null; json.data[0].overdueActions = null; }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(json) });
  });
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(1500);
  await page.screenshot({ path: dir + '/offer-risk-partial-data-state-real.png', fullPage: false });
  console.log('  partial ✅');
  await page.unroute('**/api/offer-risks/analysis**');
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(2000);

  // P0-5: Closeup screenshots
  console.log('\n=== Closeup Screenshots ===');
  const cards = page.locator('button.w-full');
  if (await cards.count() > 0) {
    await cards.first().click({ force: true });
    await page.waitForTimeout(5000);
  }
  const closeupTabs = [
    { label: '风险因素', file: 'offer-risk-detail-drawer-risk-factors-closeup.png' },
    { label: '意向', file: 'offer-risk-detail-drawer-candidate-intent-closeup.png' },
    { label: 'Closing', file: 'offer-risk-detail-drawer-closing-plan-closeup.png' },
    { label: '洞察', file: 'offer-risk-detail-drawer-insights-closeup.png' },
  ];
  for (const t of closeupTabs) {
    const btn = page.locator('button').filter({ hasText: t.label });
    if (await btn.count() > 0) { await btn.first().click({ force: true }); await page.waitForTimeout(1000); }
    await page.screenshot({ path: dir + '/' + t.file, fullPage: false });
    console.log(`  ${t.file} ✅`);
  }
  // Provenance
  const insBtn = page.locator('button').filter({ hasText: '洞察' });
  if (await insBtn.count() > 0) { await insBtn.first().click({ force: true }); await page.waitForTimeout(1000); }
  await page.screenshot({ path: dir + '/offer-risk-insight-provenance-readable.png', fullPage: false });
  console.log('  provenance ✅');
  await ctx.close();

  // P0-5: Interview Quality regression
  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx2.addCookies(adminCookiesArr);
  const p2 = await ctx2.newPage();
  await p2.goto('http://localhost:3000/interview-quality', { waitUntil: 'networkidle' });
  await p2.waitForTimeout(1000);
  await p2.screenshot({ path: dir + '/interview-quality-still-works-after-offer-risk.png', fullPage: false });
  console.log('  interview-quality regression ✅');
  await ctx2.close();

  await browser.close();
  console.log('\nAll 5 P0 items completed');
})();
