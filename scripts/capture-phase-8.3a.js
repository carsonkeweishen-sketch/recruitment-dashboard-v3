const { chromium } = require('playwright');
const http = require('http');

async function apiGet(path, cookies) {
  return new Promise((resolve, reject) => {
    const url = new URL('http://localhost:3000' + path);
    const req = http.get(url.href, { headers: { Cookie: cookies } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data.substring(0, 200) }); }
      });
    });
    req.on('error', reject);
  });
}

(async () => {
  const adminCookies = 'rd_dev_role=admin; rd_dev_user_id=cmqv2nfjo0007y3jxiwti2eer';
  const recruiterCookies = 'rd_dev_role=recruiter; rd_dev_user_id=cmqv2nfjr000cy3jxq62urqiq';
  const interviewerCookies = 'rd_dev_role=interviewer; rd_dev_user_id=cmqv2nfjr000cy3jxq62urqiq';
  const boCookies = 'rd_dev_role=business_owner; rd_dev_user_id=cmqv2nfjr000cy3jxq62urqiq';

  console.log('=== API Evidence ===');
  const tests = [
    { label: 'admin list', cookies: adminCookies, path: '/api/candidates/analysis' },
    { label: 'recruiter list', cookies: recruiterCookies, path: '/api/candidates/analysis' },
    { label: 'business_owner list', cookies: boCookies, path: '/api/candidates/analysis' },
    { label: 'interviewer list', cookies: interviewerCookies, path: '/api/candidates/analysis' },
  ];
  for (const t of tests) {
    const r = await apiGet(t.path, t.cookies);
    const summary = r.body?.success ? `data count: ${r.body.data?.length || 0}` : r.body?.error || r.body;
    console.log(`  ${t.label}: HTTP ${r.status} | ${summary}`);
  }

  // Get a real candidate ID for detail tests
  const listResult = await apiGet('/api/candidates/analysis', adminCookies);
  const candidateId = listResult.body?.data?.[0]?.candidateId || 'unknown';
  console.log(`  Using candidateId: ${candidateId}`);
  
  const detailTests = [
    { label: 'admin detail', cookies: adminCookies, path: `/api/candidates/${candidateId}/analysis` },
    { label: 'interviewer detail', cookies: interviewerCookies, path: `/api/candidates/${candidateId}/analysis` },
  ];
  for (const t of detailTests) {
    const r = await apiGet(t.path, t.cookies);
    const summary = r.body?.success ? `has matchLevel:${r.body.data?.matchLevel}, evidenceChain:${r.body.data?.evidenceChain?.length}, insights:${r.body.data?.insights?.length}` : r.body?.error || r.body;
    console.log(`  ${t.label}: HTTP ${r.status} | ${summary}`);
  }

  // ============ SCREENSHOTS ============
  const browser = await chromium.launch({ headless: true });
  const dir = 'screenshots/phase-8.3-candidate-center';

  // Helper: open drawer for 陈书妍, capture each tab
  async function captureDrawerTabs() {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies([
      { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
      { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
    ]);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/candidates', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Find and click 陈书妍
    const cards = page.locator('button.w-full, [class*="card"], [class*="rounded"][class*="border"]');
    let clicked = false;
    for (let i = 0; i < await cards.count(); i++) {
      const text = await cards.nth(i).textContent();
      if (text?.includes('陈书妍')) {
        await cards.nth(i).click({ force: true });
        await page.waitForTimeout(5000); // Wait for API
        clicked = true;
        break;
      }
    }
    if (!clicked) { console.log('陈书妍 not found'); await ctx.close(); return; }

    // DOM verification
    let body = await page.textContent('body');
    console.log('\n=== DOM Verification ===');
    const checks = [
      ['候选人风险标签', '风险'],
      ['证据充分度', '证据'],
      ['系统规则提醒', '系统规则提醒'],
      ['suggestedAction', '建议'],
      ['手机号', '手机号'],
      ['邮箱', '邮箱'],
      ['薪资', '薪资'],
      ['身份证', '身份证'],
      ['AI 自动淘汰', 'AI 自动淘汰'],
      ['一键通过', '一键通过'],
      ['暂无系统洞察', '暂无系统洞察'],
    ];
    for (const [label, keyword] of checks) {
      const found = body?.includes(keyword);
      const expected = label.includes('手机号') || label.includes('邮箱') || label.includes('薪资') || label.includes('身份证') || label.includes('AI 自动淘汰') || label.includes('一键通过') || label.includes('暂无系统洞察');
      console.log(`  Has ${label}: ${found} (expected: ${expected ? 'FALSE' : 'TRUE'})`);
    }

    // Capture each tab
    const tabs = [
      { name: '概览', file: 'candidate-detail-drawer-overview-real.png' },
      { name: '匹配', file: 'candidate-detail-drawer-match-real.png' },
      { name: '证据', file: 'candidate-detail-drawer-evidence-real.png' },
      { name: '面试', file: 'candidate-detail-drawer-interviews-real.png' },
      { name: '风险', file: 'candidate-detail-drawer-risks-real.png' },
      { name: '行动', file: 'candidate-detail-drawer-actions-real.png' },
      { name: '洞察', file: 'candidate-detail-drawer-insights-real.png' },
      { name: '动态', file: 'candidate-detail-drawer-activity-real.png' },
    ];

    for (const tab of tabs) {
      const tabBtn = page.locator('button').filter({ hasText: tab.name });
      if (await tabBtn.count() > 0) {
        await tabBtn.first().click({ force: true });
        await page.waitForTimeout(1500);
      }
      await page.screenshot({ path: dir + '/' + tab.file, fullPage: false });
      console.log(`  Captured: ${tab.file}`);
    }
    await ctx.close();
  }

  await captureDrawerTabs();

  // Action Center clean
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addCookies([
      { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
      { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
    ]);
    const page = await ctx.newPage();
    await page.goto('http://localhost:3000/actions', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: dir + '/action-center-still-works-after-candidate-center.png', fullPage: false });
    await ctx.close();
  }

  await browser.close();
  console.log('\nDone');
})();
