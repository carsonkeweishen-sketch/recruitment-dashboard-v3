const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('about:blank');
  
  // Set cookies via page context
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addCookies([
    { name: 'rd_dev_role', value: 'admin', domain: 'localhost', path: '/' },
    { name: 'rd_dev_user_id', value: 'cmqv2nfjo0007y3jxiwti2eer', domain: 'localhost', path: '/' },
  ]);
  const p = await ctx.newPage();
  
  await p.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  await p.waitForTimeout(3000);
  
  // Dump all h3 text to understand page structure
  const h3s = await p.$$eval('h3', els => els.map(e => e.textContent?.trim()));
  console.log('Page h3 headings:', h3s);
  
  // Find job health cards - get their text content
  const jobCards = await p.$$eval('section:has(h3)', els => 
    els.map(e => ({ 
      heading: e.querySelector('h3')?.textContent?.trim(),
      text: e.textContent?.trim().substring(0, 200)
    }))
  );
  console.log('Sections:', JSON.stringify(jobCards, null, 2));
  
  // Check specific closeup targets
  const healthSection = await p.$('text=岗位健康度');
  if (healthSection) {
    const parent = await healthSection.evaluateHandle(el => el.closest('section'));
    const text = await parent?.evaluate(el => el?.textContent?.trim().substring(0, 300));
    console.log('Job Health section text:', text);
  }
  
  const candSection = await p.$('text=候选人风险概览');
  if (candSection) {
    const parent = await candSection.evaluateHandle(el => el.closest('section'));
    const text = await parent?.evaluate(el => el?.textContent?.trim().substring(0, 300));
    console.log('Candidate Risk section text:', text);
  }

  await ctx.close();
  await browser.close();
})();
