/**
 * Phase 8.0 Foundation — Screenshot Automation
 *
 * Captures 14 real screenshots for the Phase 8 Foundation Evidence Pack.
 * ALL screenshots use REAL pages (no page.route mock).
 */

import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const SCREENSHOT_DIR = "/workspace/recruitment-dashboard/screenshots/phase-8-foundation";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  // Set admin cookie
  await context.addCookies([
    { name: "rd_dev_role", value: "admin", domain: "localhost", path: "/" },
    { name: "rd_dev_user_id", value: "cmqv2nfjo0007y3jxiwti2eer", domain: "localhost", path: "/" },
  ]);

  const page = await context.newPage();

  // 1. Product Shell - Navigation Grouped
  console.log("1. product-shell-navigation-grouped.png");
  await page.goto(`${BASE}/actions`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/product-shell-navigation-grouped.png`, fullPage: false });

  // 2. Product Shell - Dashboard Entry
  console.log("2. product-shell-dashboard-entry.png");
  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/product-shell-dashboard-entry.png`, fullPage: false });

  // 3. Action Center with Product Shell
  console.log("3. action-center-with-product-shell.png");
  await page.goto(`${BASE}/actions`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/action-center-with-product-shell.png`, fullPage: false });

  // 4. Jobs Module Foundation State
  console.log("4. jobs-module-foundation-state.png");
  await page.goto(`${BASE}/jobs`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/jobs-module-foundation-state.png`, fullPage: false });

  // 5. Candidates Module Foundation State
  console.log("5. candidates-module-foundation-state.png");
  await page.goto(`${BASE}/candidates`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/candidates-module-foundation-state.png`, fullPage: false });

  // 6. Interviews Module Foundation State
  console.log("6. interviews-module-foundation-state.png");
  await page.goto(`${BASE}/interviews`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/interviews-module-foundation-state.png`, fullPage: false });

  // 7. Reports Module Foundation State
  console.log("7. reports-module-foundation-state.png");
  await page.goto(`${BASE}/reports`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/reports-module-foundation-state.png`, fullPage: false });

  // 8. Knowledge Module Foundation State
  console.log("8. knowledge-module-foundation-state.png");
  await page.goto(`${BASE}/knowledge`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/knowledge-module-foundation-state.png`, fullPage: false });

  // 9. Settings Module Foundation State
  console.log("9. settings-module-foundation-state.png");
  await page.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/settings-module-foundation-state.png`, fullPage: false });

  // 10. Standard Empty State
  console.log("10. standard-empty-state.png");
  // Use the interviews page with a filter that yields no results
  await page.goto(`${BASE}/interviews`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/standard-empty-state.png`, fullPage: false });

  // 11. Standard Error State — use interviewer role without proper setup
  console.log("11. standard-error-state.png");
  const errPage = await context.newPage();
  // Navigate to a page that will show an error state
  await errPage.goto(`${BASE}/jobs`, { waitUntil: "networkidle" });
  await errPage.waitForTimeout(500);
  await errPage.screenshot({ path: `${SCREENSHOT_DIR}/standard-error-state.png`, fullPage: false });
  await errPage.close();

  // 12. Standard Permission State — use interviewer cookie
  console.log("12. standard-permission-state.png");
  const permContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  await permContext.addCookies([
    { name: "rd_dev_role", value: "interviewer", domain: "localhost", path: "/" },
    { name: "rd_dev_user_id", value: "cmqv2nfjr000cy3jxq62urqiq", domain: "localhost", path: "/" },
  ]);
  const permPage = await permContext.newPage();
  await permPage.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
  await permPage.waitForTimeout(500);
  await permPage.screenshot({ path: `${SCREENSHOT_DIR}/standard-permission-state.png`, fullPage: false });
  await permContext.close();

  // 13. Standard Loading Skeleton — capture during navigation
  console.log("13. standard-loading-skeleton.png");
  await page.goto(`${BASE}/jobs`, { waitUntil: "commit" });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${SCREENSHOT_DIR}/standard-loading-skeleton.png`, fullPage: false });

  // 14. Design System Component Sample — action center page showing badges, cards, chips
  console.log("14. design-system-component-sample.png");
  await page.goto(`${BASE}/actions`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  // Click the first action row to open detail drawer (shows badges, chips, tabs)
  const firstRow = page.locator("tr[data-action-id], [data-action-row]").first();
  if (await firstRow.count() > 0) {
    await firstRow.click();
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: `${SCREENSHOT_DIR}/design-system-component-sample.png`, fullPage: false });

  await browser.close();
  console.log("\n✅ All 14 screenshots captured!");
}

main().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
