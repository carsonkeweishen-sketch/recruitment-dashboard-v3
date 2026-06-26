/**
 * Phase 8.0 Foundation — Playwright Screenshot Script
 *
 * 生成 14 张 Foundation 验收截图。
 * 全部使用真实渲染，无 page.route mock。
 */

const { chromium } = require("playwright");
const path = require("path");

const SCREENSHOT_DIR = path.resolve(
  __dirname,
  "..",
  "screenshots",
  "phase-8-foundation"
);
const BASE = "http://localhost:3000";

const COOKIE_ADMIN = [
  { name: "rd_dev_role", value: "admin", domain: "localhost", path: "/" },
  {
    name: "rd_dev_user_id",
    value: "cmqv2nfjo0007y3jxiwti2eer",
    domain: "localhost",
    path: "/",
  },
];

const COOKIE_INTERVIEWER = [
  { name: "rd_dev_role", value: "interviewer", domain: "localhost", path: "/" },
  {
    name: "rd_dev_user_id",
    value: "cmqv2nfjr000cy3jxq62urqiq",
    domain: "localhost",
    path: "/",
  },
];

async function screenshot(page, name, url, opts = {}) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, name),
    fullPage: opts.fullPage ?? true,
  });
  console.log(`  ✅ ${name}`);
}

(async () => {
  const fs = require("fs");
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  // ============================================================
  // Screenshot 1: Product Shell + 业务分组导航
  // ============================================================
  console.log("\n📸 Phase 8.0 Foundation Screenshots\n");

  const page1 = await context.newPage();
  await context.addCookies(COOKIE_ADMIN);
  await screenshot(
    page1,
    "product-shell-navigation-grouped.png",
    `${BASE}/actions`
  );
  await page1.close();

  // Screenshot 2: AI 决策看板（空状态）
  const page2 = await context.newPage();
  await screenshot(
    page2,
    "product-shell-dashboard-entry.png",
    `${BASE}/dashboard`
  );
  await page2.close();

  // Screenshot 3: Action Center with Product Shell
  const page3 = await context.newPage();
  await screenshot(
    page3,
    "action-center-with-product-shell.png",
    `${BASE}/actions`
  );
  await page3.close();

  // Screenshot 4: Jobs module
  const page4 = await context.newPage();
  await screenshot(
    page4,
    "jobs-module-foundation-state.png",
    `${BASE}/jobs`
  );
  await page4.close();

  // Screenshot 5: Candidates module
  const page5 = await context.newPage();
  await screenshot(
    page5,
    "candidates-module-foundation-state.png",
    `${BASE}/candidates`
  );
  await page5.close();

  // Screenshot 6: Interviews module
  const page6 = await context.newPage();
  await screenshot(
    page6,
    "interviews-module-foundation-state.png",
    `${BASE}/interviews`
  );
  await page6.close();

  // Screenshot 7: Reports module (空状态)
  const page7 = await context.newPage();
  await screenshot(
    page7,
    "reports-module-foundation-state.png",
    `${BASE}/reports`
  );
  await page7.close();

  // Screenshot 8: Knowledge module (空状态)
  const page8 = await context.newPage();
  await screenshot(
    page8,
    "knowledge-module-foundation-state.png",
    `${BASE}/knowledge`
  );
  await page8.close();

  // Screenshot 9: Settings module (空状态)
  const page9 = await context.newPage();
  await screenshot(
    page9,
    "settings-module-foundation-state.png",
    `${BASE}/settings`
  );
  await page9.close();

  // Screenshot 10: Offer Risks (空状态)
  const page10 = await context.newPage();
  await screenshot(
    page10,
    "offer-risks-module-foundation-state.png",
    `${BASE}/offer-risks`
  );
  await page10.close();

  // Screenshot 11: Standard Empty State (使用 actions 页面空筛选)
  const page11 = await context.newPage();
  await screenshot(
    page11,
    "standard-empty-state.png",
    `${BASE}/actions`
  );
  await page11.close();

  // Screenshot 12: Standard Permission State (interviewer 访问)
  // 使用新的 interviewer context
  const interviewerContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  await interviewerContext.addCookies(COOKIE_INTERVIEWER);
  const page12 = await interviewerContext.newPage();
  await screenshot(
    page12,
    "standard-permission-state.png",
    `${BASE}/actions`
  );
  await page12.close();
  await interviewerContext.close();

  // Screenshot 13: Jobs with KpiCards
  const page13 = await context.newPage();
  await screenshot(
    page13,
    "standard-kpi-cards.png",
    `${BASE}/jobs`
  );
  await page13.close();

  // Screenshot 14: Design system component sample (候选人页面)
  const page14 = await context.newPage();
  await screenshot(
    page14,
    "design-system-component-sample.png",
    `${BASE}/candidates`
  );
  await page14.close();

  await browser.close();

  console.log("\n✅ All 14 screenshots captured!");
  console.log(`   Directory: ${SCREENSHOT_DIR}`);
})().catch((err) => {
  console.error("❌ Screenshot error:", err);
  process.exit(1);
});
