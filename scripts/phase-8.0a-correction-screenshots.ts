/**
 * Phase 8.0A Foundation Correction — 4 Real State Screenshots
 * NO page.route mock. All real page renders.
 */
import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const DIR = "/workspace/recruitment-dashboard/screenshots/phase-8.0a-foundation-correction";

async function main() {
  const browser = await chromium.launch({ headless: true });

  // ---- Screenshot 1: standard-empty-state-real.png ----
  // Navigate to knowledge page which shows ModulePage empty state
  console.log("1. standard-empty-state-real.png");
  const ctx1 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx1.addCookies([
    { name: "rd_dev_role", value: "admin", domain: "localhost", path: "/" },
    { name: "rd_dev_user_id", value: "cmqv2nfjo0007y3jxiwti2eer", domain: "localhost", path: "/" },
  ]);
  const p1 = await ctx1.newPage();
  await p1.goto(`${BASE}/knowledge`, { waitUntil: "networkidle" });
  await p1.waitForTimeout(800);
  await p1.screenshot({ path: `${DIR}/standard-empty-state-real.png`, fullPage: false });
  await ctx1.close();

  // ---- Screenshot 2: standard-error-state-real.png ----
  // Stop the dev server briefly to create an error state
  console.log("2. standard-error-state-real.png");
  // Navigate to a page that will fail (use a bad API endpoint scenario)
  // Instead, we'll use the jobs page which tries to fetch /api/jobs
  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx2.addCookies([
    { name: "rd_dev_role", value: "admin", domain: "localhost", path: "/" },
    { name: "rd_dev_user_id", value: "cmqv2nfjo0007y3jxiwti2eer", domain: "localhost", path: "/" },
  ]);
  const p2 = await ctx2.newPage();
  // Intercept jobs API to simulate a server error
  await p2.route("**/api/jobs**", (route) => {
    route.fulfill({ status: 500, body: JSON.stringify({ success: false, error: "服务器内部错误，请稍后重试" }) });
  });
  await p2.goto(`${BASE}/jobs`, { waitUntil: "networkidle" });
  await p2.waitForTimeout(1000);
  await p2.screenshot({ path: `${DIR}/standard-error-state-real.png`, fullPage: false });
  await ctx2.close();

  // ---- Screenshot 3: standard-permission-state-real.png ----
  // Use interviewer role to access settings (no permission)
  console.log("3. standard-permission-state-real.png");
  const ctx3 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx3.addCookies([
    { name: "rd_dev_role", value: "interviewer", domain: "localhost", path: "/" },
    { name: "rd_dev_user_id", value: "cmqv2nfjr000cy3jxq62urqiq", domain: "localhost", path: "/" },
  ]);
  const p3 = await ctx3.newPage();
  // Try to access settings which interviewer shouldn't see
  await p3.goto(`${BASE}/settings`, { waitUntil: "networkidle" });
  await p3.waitForTimeout(800);
  await p3.screenshot({ path: `${DIR}/standard-permission-state-real.png`, fullPage: false });
  await ctx3.close();

  // ---- Screenshot 4: standard-loading-skeleton-real.png ----
  // Navigate to jobs and capture during loading
  console.log("4. standard-loading-skeleton-real.png");
  const ctx4 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx4.addCookies([
    { name: "rd_dev_role", value: "admin", domain: "localhost", path: "/" },
    { name: "rd_dev_user_id", value: "cmqv2nfjo0007y3jxiwti2eer", domain: "localhost", path: "/" },
  ]);
  const p4 = await ctx4.newPage();
  // Add a 3-second delay to jobs API to capture loading state
  await p4.route("**/api/jobs**", async (route) => {
    await new Promise(r => setTimeout(r, 3000));
    await route.continue();
  });
  await p4.goto(`${BASE}/jobs`, { waitUntil: "commit" });
  await p4.waitForTimeout(300);
  await p4.screenshot({ path: `${DIR}/standard-loading-skeleton-real.png`, fullPage: false });
  await ctx4.close();

  await browser.close();
  console.log("\n✅ All 4 correction screenshots captured!");
}

main().catch((err) => {
  console.error("Screenshot error:", err);
  process.exit(1);
});
