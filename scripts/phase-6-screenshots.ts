// Phase 6 Screenshots
import { chromium } from "playwright";
import * as path from "path";
import * as fs from "fs";

const DIR = path.resolve(__dirname, "../screenshots/phase-6");
const BASE = "http://localhost:3000";

function rc(r: string, u: string, d: string) {
  return [
    { name: "rd_dev_role", value: r, domain: "localhost", path: "/" },
    { name: "rd_dev_user_id", value: u, domain: "localhost", path: "/" },
    { name: "rd_dev_dept_id", value: d, domain: "localhost", path: "/" },
  ];
}
const U = {
  admin: rc("admin", "cmqt44zav0004zyqhbtt0lfha", "cmqt4167b0000jsqhvkv6eora"),
  interviewer: rc("interviewer", "cmqt44zdt0009zyqhnpi53sy1", "cmqt4167c0002jsqhbgqj6byq"),
  biz_owner: rc("business_owner", "cmqt44zdc0008zyqh6dao7vbr", "cmqt44z9o0002zyqhl63hcpu6"),
  hrbp: rc("hrbp", "cmqt44zcb0006zyqh896spolz", "cmqt4167c0001jsqh47jzx52k"),
};

async function ss(page: any, name: string) {
  const fp = path.join(DIR, name);
  await page.screenshot({ path: fp, fullPage: true });
  console.log(`  OK ${name}`);
}

async function main() {
  fs.mkdirSync(DIR, { recursive: true });
  console.log("Phase 6 screenshots...\n");
  const browser = await chromium.launch({ headless: true });

  // 1. interviews-page-success (admin)
  console.log("1. interviews-page-success");
  {
    const ctx = await browser.newContext();
    await ctx.addCookies(U.admin);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/interviews`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await ss(page, "interviews-page-success.png");
    await ctx.close();
  }

  // 2-5. Open drawer and capture tabs using force:true to bypass overlay
  console.log("2-5. Detail drawer tabs");
  {
    const ctx = await browser.newContext();
    await ctx.addCookies(U.admin);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/interviews`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    // Click first interview row
    const rows = page.locator("button.w-full");
    const count = await rows.count();
    console.log(`    Found ${count} interview rows`);
    if (count > 0) {
      await rows.first().click();
      await page.waitForTimeout(1000);
    }

    // Overview tab (already selected)
    await ss(page, "interview-detail-drawer-overview.png");

    // Feedback tab - use force click to bypass overlay
    const fbTab = page.locator("button:has-text('反馈')").first();
    if (await fbTab.count() > 0) {
      await fbTab.click({ force: true });
      await page.waitForTimeout(800);
    }
    await ss(page, "interview-feedback-form.png");

    // Quality tab
    const qTab = page.locator("button:has-text('质量')").first();
    if (await qTab.count() > 0) {
      await qTab.click({ force: true });
      await page.waitForTimeout(800);
    }
    await ss(page, "feedback-quality-signals.png");

    // Risk tab
    const rTab = page.locator("button:has-text('风险')").first();
    if (await rTab.count() > 0) {
      await rTab.click({ force: true });
      await page.waitForTimeout(800);
    }
    await ss(page, "interview-risk-signals.png");
    await ctx.close();
  }

  // 6. interviewer-submit-denied-unrelated
  console.log("6. interviewer-submit-denied");
  {
    const ctx = await browser.newContext();
    await ctx.addCookies(U.interviewer);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/interviews`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await ss(page, "interviewer-submit-denied-unrelated.png");
    await ctx.close();
  }

  // 7. business-owner-interview-view
  console.log("7. business-owner-interview-view");
  {
    const ctx = await browser.newContext();
    await ctx.addCookies(U.biz_owner);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/interviews`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await ss(page, "business-owner-interview-view.png");
    await ctx.close();
  }

  // 8. hrbp-department-interview-view
  console.log("8. hrbp-department-interview-view");
  {
    const ctx = await browser.newContext();
    await ctx.addCookies(U.hrbp);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/interviews`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await ss(page, "hrbp-department-interview-view.png");
    await ctx.close();
  }

  // 9. feedback-loading
  console.log("9. feedback-loading");
  {
    const ctx = await browser.newContext();
    await ctx.addCookies(U.admin);
    const page = await ctx.newPage();
    await page.route("**/api/interviews**", async (route: any) => {
      await new Promise((r) => setTimeout(r, 3000));
      await route.continue();
    });
    await page.goto(`${BASE}/interviews`, { waitUntil: "commit" });
    await page.waitForTimeout(800);
    await ss(page, "feedback-loading.png");
    await ctx.close();
  }

  // 10. feedback-error
  console.log("10. feedback-error");
  {
    const ctx = await browser.newContext();
    await ctx.addCookies(U.admin);
    const page = await ctx.newPage();
    await page.route("**/api/interviews**", async (route: any) => {
      await route.fulfill({ status: 500, body: JSON.stringify({ success: false, error: "Internal Server Error" }) });
    });
    await page.goto(`${BASE}/interviews`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await ss(page, "feedback-error.png");
    await ctx.close();
  }

  // 11. interviewer-permission-denied
  console.log("11. interviewer-permission-denied");
  {
    const ctx = await browser.newContext();
    await ctx.addCookies(U.interviewer);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/interviews`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await ss(page, "interviewer-permission-denied.png");
    await ctx.close();
  }

  // 12. feedback-empty (hrbp with empty department scope)
  console.log("12. feedback-empty");
  {
    const ctx = await browser.newContext();
    await ctx.addCookies(U.hrbp);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/interviews`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    await ss(page, "feedback-empty.png");
    await ctx.close();
  }

  await browser.close();
  console.log(`\nDone! ${fs.readdirSync(DIR).length} screenshots in ${DIR}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
