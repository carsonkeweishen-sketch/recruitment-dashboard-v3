/**
 * Phase 7.D-UX — CEO Demo Screenshot Automation
 * ALL screenshots use REAL API (no mock). Local PostgreSQL.
 */

import { chromium } from "playwright";

const OUT_DIR = "/workspace/recruitment-dashboard/screenshots/phase-7d-ux";
const BASE_URL = "http://localhost:3000";

const ADMIN_ID = "cmqv2nfjo0007y3jxiwti2eer";
const INTERVIEWER_ID = "cmqv2nfjr000cy3jxq62urqiq";

async function main() {
  console.log("🚀 Phase 7.D-UX CEO Demo Screenshots\n");
  console.log("   API: REAL GET/POST (no mock)\n");

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();

  async function loginAs(userId: string, role: string) {
    await page.goto(`${BASE_URL}/actions`, { waitUntil: "domcontentloaded" });
    await page.evaluate(({ uid, r }) => {
      document.cookie = `rd_dev_role=${r}; path=/; max-age=86400`;
      document.cookie = `rd_dev_user_id=${uid}; path=/; max-age=86400`;
    }, { uid: userId, r: role });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
  }

  async function snap(name: string) {
    await page.screenshot({ path: `${OUT_DIR}/${name}.png`, fullPage: false });
    console.log(`  ✅ ${name}.png`);
  }

  // ═══════════════ 1. Home page ═══════════════
  console.log("1. CEO Demo — Actions Home");
  await loginAs(ADMIN_ID, "admin");
  await snap("ceo-demo-actions-home");

  // ═══════════════ 2. Overdue filter ═══════════════
  console.log("2. CEO Demo — Overdue Filter");
  const overdueCheckbox = page.locator("input[type='checkbox']").first();
  await overdueCheckbox.click();
  await page.waitForTimeout(800);
  await snap("ceo-demo-actions-overdue-filter");
  await overdueCheckbox.click(); // uncheck
  await page.waitForTimeout(500);

  // ═══════════════ 3. Detail Drawer Overview ═══════════════
  console.log("3. CEO Demo — Action Detail Overview");
  const rows = page.locator("tbody tr");
  // Find a row with "urgent" or "竞品" for best demo effect
  const rowCount = await rows.count();
  let targetIdx = 0;
  for (let i = 0; i < rowCount; i++) {
    const text = await rows.nth(i).textContent();
    if (text && text.includes("竞品")) { targetIdx = i; break; }
  }
  await rows.nth(targetIdx).click();
  await page.waitForTimeout(1500);
  await snap("ceo-demo-action-detail-overview");

  // ═══════════════ 4. Linked Context ═══════════════
  console.log("4. CEO Demo — Linked Context");
  await page.locator("button:has-text('关联信息')").click();
  await page.waitForTimeout(800);
  await snap("ceo-demo-action-detail-linked-context");

  // ═══════════════ 5. Activity ═══════════════
  console.log("5. CEO Demo — Activity Timeline");
  await page.locator("button:has-text('活动记录')").click();
  await page.waitForTimeout(800);
  await snap("ceo-demo-action-detail-activity");

  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);

  // ═══════════════ 6. Create Modal ═══════════════
  console.log("6. CEO Demo — Create Action Modal");
  await page.locator("button:has-text('新建行动项')").click();
  await page.waitForTimeout(800);
  await snap("ceo-demo-create-action-modal");

  // ═══════════════ 7. Create Success ═══════════════
  console.log("7. CEO Demo — Create Success");
  const titleInput = page.locator("input[placeholder='请输入行动标题']");
  await titleInput.fill("协调业务总监安排 KA 销售终面时间");
  const catSelect = page.locator("select").first();
  await catSelect.selectOption("manual");
  const createBtn = page.locator("button:has-text('创建'):not(:has-text('新建')):not(:has-text('手动'))");
  await createBtn.click();
  await page.waitForTimeout(1000);
  await snap("ceo-demo-create-action-success");

  // ═══════════════ 8. Resolve Modal ═══════════════
  console.log("8. CEO Demo — Resolve Action Modal");
  await page.goto(`${BASE_URL}/actions`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  // Find an open action
  const openRows = page.locator("tbody tr");
  const orCount = await openRows.count();
  let openIdx = 0;
  for (let i = 0; i < orCount; i++) {
    const text = await openRows.nth(i).textContent();
    if (text && text.includes("待处理")) { openIdx = i; break; }
  }
  await openRows.nth(openIdx).click();
  await page.waitForTimeout(1000);
  await page.locator("button:has-text('标记为已解决')").click();
  await page.waitForTimeout(800);
  await snap("ceo-demo-resolve-action-modal");

  // ═══════════════ 9. Resolve Success ═══════════════
  console.log("9. CEO Demo — Resolve Success");
  const resolveInput = page.locator("textarea[placeholder*='请说明该行动如何被处理']");
  await resolveInput.fill("已联系业务负责人确认，候选人可继续推进下一轮面试。");
  await page.locator("button:has-text('确认解决')").click();
  await page.waitForTimeout(1000);
  await snap("ceo-demo-resolve-action-success");

  // ═══════════════ 10. Dismiss Modal ═══════════════
  console.log("10. CEO Demo — Dismiss Action Modal");
  await page.goto(`${BASE_URL}/actions`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  // Find another open action
  const rows2 = page.locator("tbody tr");
  const rc2 = await rows2.count();
  let dismissIdx = 0;
  for (let i = 0; i < rc2; i++) {
    const text = await rows2.nth(i).textContent();
    if (text && text.includes("待处理") && i !== openIdx) { dismissIdx = i; break; }
  }
  await rows2.nth(dismissIdx).click();
  await page.waitForTimeout(1000);
  // Check if dismiss button visible (action must be open)
  const hasDismiss = await page.locator("button:has-text('忽略此行动')").count();
  if (hasDismiss > 0) {
    await page.locator("button:has-text('忽略此行动')").click();
  } else {
    // Try first row
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
    await rows2.first().click();
    await page.waitForTimeout(1000);
    await page.locator("button:has-text('忽略此行动')").click();
  }
  await page.waitForTimeout(800);
  await snap("ceo-demo-dismiss-action-modal");

  // ═══════════════ 11. Dismiss Success ═══════════════
  console.log("11. CEO Demo — Dismiss Success");
  const dismissInput = page.locator("textarea[placeholder*='请说明忽略原因']");
  await dismissInput.fill("该风险已由线下业务沟通确认处理，不再需要系统跟踪。");
  await page.locator("button:has-text('确认忽略')").click();
  await page.waitForTimeout(1000);
  await snap("ceo-demo-dismiss-action-success");

  // ═══════════════ 12. Permission State ═══════════════
  console.log("12. CEO Demo — Permission State (interviewer)");
  await loginAs(INTERVIEWER_ID, "interviewer");
  await page.waitForTimeout(1000);
  await snap("ceo-demo-permission-state");

  await browser.close();
  console.log("\n✅ All 12 CEO Demo screenshots captured!");
  console.log("   Mock: 0 | Real API: 12/12");
}

main().catch(e => { console.error("❌", e); process.exit(1); });
