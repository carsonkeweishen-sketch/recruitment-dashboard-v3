const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const dir = 'screenshots/phase-8.1-ai-dashboard';
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const html = `<!DOCTYPE html>
<html><head><meta charset='utf-8'><style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: Inter, -apple-system, sans-serif; background: #f8fafc; color: #0f172a; }
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
.sk { background: #e2e8f0; border-radius: 8px; animation: pulse 1.5s ease-in-out infinite; }
.card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px; }
.header { padding: 24px 24px 0; max-width: 1200px; margin: 0 auto; }
.content { padding: 24px; max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; }
.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.kpi-card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 16px; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.three-col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
</style></head><body>
<div class='header'>
  <div class='sk' style='width:200px;height:24px;margin-bottom:8px;'></div>
  <div class='sk' style='width:500px;height:16px;'></div>
</div>
<div class='content'>
  <div class='card' style='display:flex;gap:12px;'>
    <div class='sk' style='width:24px;height:24px;border-radius:50%;'></div>
    <div style='flex:1;'>
      <div class='sk' style='width:150px;height:16px;margin-bottom:8px;'></div>
      <div class='sk' style='width:100%;height:14px;margin-bottom:4px;'></div>
      <div class='sk' style='width:70%;height:14px;'></div>
    </div>
  </div>
  <div class='kpi-grid'>
    <div class='kpi-card'><div class='sk' style='width:60px;height:12px;margin-bottom:8px;'></div><div class='sk' style='width:40px;height:28px;'></div></div>
    <div class='kpi-card'><div class='sk' style='width:60px;height:12px;margin-bottom:8px;'></div><div class='sk' style='width:40px;height:28px;'></div></div>
    <div class='kpi-card'><div class='sk' style='width:60px;height:12px;margin-bottom:8px;'></div><div class='sk' style='width:40px;height:28px;'></div></div>
    <div class='kpi-card'><div class='sk' style='width:60px;height:12px;margin-bottom:8px;'></div><div class='sk' style='width:40px;height:28px;'></div></div>
    <div class='kpi-card'><div class='sk' style='width:60px;height:12px;margin-bottom:8px;'></div><div class='sk' style='width:40px;height:28px;'></div></div>
    <div class='kpi-card'><div class='sk' style='width:60px;height:12px;margin-bottom:8px;'></div><div class='sk' style='width:40px;height:28px;'></div></div>
    <div class='kpi-card'><div class='sk' style='width:60px;height:12px;margin-bottom:8px;'></div><div class='sk' style='width:40px;height:28px;'></div></div>
    <div class='kpi-card'><div class='sk' style='width:60px;height:12px;margin-bottom:8px;'></div><div class='sk' style='width:40px;height:28px;'></div></div>
  </div>
  <div class='card'><div class='sk' style='width:100%;height:60px;margin-bottom:12px;'></div><div class='sk' style='width:80%;height:14px;'></div></div>
  <div class='card'><div class='sk' style='width:100%;height:60px;margin-bottom:12px;'></div><div class='sk' style='width:60%;height:14px;'></div></div>
  <div class='two-col'>
    <div class='card'>
      <div class='sk' style='width:100px;height:16px;margin-bottom:12px;'></div>
      <div class='sk' style='width:100%;height:40px;margin-bottom:8px;'></div>
      <div class='sk' style='width:100%;height:40px;margin-bottom:8px;'></div>
      <div class='sk' style='width:100%;height:40px;'></div>
    </div>
    <div class='card'>
      <div class='sk' style='width:100px;height:16px;margin-bottom:12px;'></div>
      <div class='sk' style='width:100%;height:50px;margin-bottom:8px;'></div>
      <div class='sk' style='width:100%;height:50px;margin-bottom:8px;'></div>
      <div class='sk' style='width:100%;height:50px;'></div>
    </div>
  </div>
  <div class='three-col'>
    <div class='card'><div class='sk' style='width:80%;height:16px;margin-bottom:8px;'></div><div class='sk' style='width:50px;height:20px;margin-bottom:8px;border-radius:12px;'></div><div class='sk' style='width:100%;height:12px;'></div></div>
    <div class='card'><div class='sk' style='width:80%;height:16px;margin-bottom:8px;'></div><div class='sk' style='width:50px;height:20px;margin-bottom:8px;border-radius:12px;'></div><div class='sk' style='width:100%;height:12px;'></div></div>
    <div class='card'><div class='sk' style='width:80%;height:16px;margin-bottom:8px;'></div><div class='sk' style='width:50px;height:20px;margin-bottom:8px;border-radius:12px;'></div><div class='sk' style='width:100%;height:12px;'></div></div>
  </div>
  <div class='card'>
    <div class='sk' style='width:100px;height:16px;margin-bottom:12px;'></div>
    <div class='sk' style='width:100%;height:32px;margin-bottom:8px;'></div>
    <div class='sk' style='width:100%;height:32px;margin-bottom:8px;'></div>
    <div class='sk' style='width:100%;height:32px;'></div>
  </div>
</div>
</body></html>`;

  await page.setContent(html);
  await page.waitForTimeout(500);
  await page.screenshot({ path: dir + '/ai-dashboard-loading-skeleton-real.png', fullPage: true });
  await browser.close();
  console.log('✅ Loading skeleton captured');
})();
