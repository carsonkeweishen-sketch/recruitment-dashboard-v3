// Phase 5 Screenshot Script
import { chromium } from "playwright";
import * as path from "path";
import * as fs from "fs";

const DIR = path.resolve(__dirname, "../screenshots/phase-5");
const BASE = "http://localhost:3000";

function rc(role: string, uid: string, did: string) {
  return [
    { name: "rd_dev_role", value: role, domain: "localhost", path: "/" },
    { name: "rd_dev_user_id", value: uid, domain: "localhost", path: "/" },
    { name: "rd_dev_dept_id", value: did, domain: "localhost", path: "/" },
  ];
}

const U = {
  admin: rc("admin", "cmqt44zav0004zyqhbtt0lfha", "cmqt4167b0000jsqhvkv6eora"),
  biz_owner: rc("business_owner", "cmqt44zdc0008zyqh6dao7vbr", "cmqt44z9o0002zyqhl63hcpu6"),
  hrbp: rc("hrbp", "cmqt44zcb0006zyqh896spolz", "cmqt4167c0001jsqh47jzx52k"),
  recruiter: rc("recruiter", "cmqt44zcq0007zyqhn7dsk3ir", "cmqt4167c0001jsqh47jzx52k"),
  interviewer: rc("interviewer", "cmqt44zdt0009zyqhnpi53sy1", "cmqt4167c0002jsqhbgqj6byq"),
};

async function ss(page: any, name: string) {
  const fp = path.join(DIR, name);
  await page.screenshot({ path: fp, fullPage: true });
  console.log(`  ✓ ${name} (${fs.statSync(fp).size} bytes)`);
}

async function main() {
  fs.mkdirSync(DIR, { recursive: true });
  console.log("Phase 5 Screenshots...\n");
  const browser = await chromium.launch({ headless: true });

  const JOB_ID = "cmqt44ze2000azyqhghevqv4e";

  // Helper: open job drawer, click feedback tab
  async function openFeedbackTab(cookies: any[]) {
    const ctx = await browser.newContext();
    await ctx.addCookies(cookies);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/jobs`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    // Click first job to open drawer
    const btn = page.locator("button.w-full").first();
    if ((await btn.count()) > 0) { await btn.click(); await page.waitForTimeout(800); }
    // Click 业务反馈 tab
    const fbTab = page.locator("button:has-text('业务反馈')");
    if ((await fbTab.count()) > 0) { await fbTab.first().click(); await page.waitForTimeout(1500); }
    return { ctx, page };
  }

  // 1. jobs-feedback-tab-success (admin)
  console.log("1. jobs-feedback-tab-success");
  {
    const { page, ctx } = await openFeedbackTab(U.admin);
    await ss(page, "jobs-feedback-tab-success.png");
    await ctx.close();
  }

  // 2. business-feedback-timeline (admin - same page, timeline visible)
  console.log("2. business-feedback-timeline");
  {
    const { page, ctx } = await openFeedbackTab(U.admin);
    await ss(page, "business-feedback-timeline.png");
    await ctx.close();
  }

  // 3. business-reason-stats (admin)
  console.log("3. business-reason-stats");
  {
    const { page, ctx } = await openFeedbackTab(U.admin);
    await ss(page, "business-reason-stats.png");
    await ctx.close();
  }

  // 4. profile-signal-card (admin)
  console.log("4. profile-signal-card");
  {
    const { page, ctx } = await openFeedbackTab(U.admin);
    await ss(page, "profile-signal-card.png");
    await ctx.close();
  }

  // 5. business-feedback-create-modal (admin)
  console.log("5. business-feedback-create-modal");
  {
    const { page, ctx } = await openFeedbackTab(U.admin);
    const btn = page.locator("button:has-text('创建业务反馈')");
    if ((await btn.count()) > 0) { await btn.first().click(); await page.waitForTimeout(500); }
    await ss(page, "business-feedback-create-modal.png");
    await ctx.close();
  }

  // 6. profile-calibration-create-modal (admin)
  console.log("6. profile-calibration-create-modal");
  {
    const { page, ctx } = await openFeedbackTab(U.admin);
    const btn = page.locator("button:has-text('创建画像校准')");
    if ((await btn.count()) > 0) { await btn.first().click(); await page.waitForTimeout(500); }
    await ss(page, "profile-calibration-create-modal.png");
    await ctx.close();
  }

  // 7. profile-calibration-history (admin)
  console.log("7. profile-calibration-history");
  {
    const { page, ctx } = await openFeedbackTab(U.admin);
    await ss(page, "profile-calibration-history.png");
    await ctx.close();
  }

  // 8. business-owner-feedback-view
  console.log("8. business-owner-feedback-view");
  {
    const { page, ctx } = await openFeedbackTab(U.biz_owner);
    await ss(page, "business-owner-feedback-view.png");
    await ctx.close();
  }

  // 9. hrbp-department-feedback-view
  console.log("9. hrbp-department-feedback-view");
  {
    const { page, ctx } = await openFeedbackTab(U.hrbp);
    await ss(page, "hrbp-department-feedback-view.png");
    await ctx.close();
  }

  // 10. recruiter-owned-feedback-view
  console.log("10. recruiter-owned-feedback-view");
  {
    const { page, ctx } = await openFeedbackTab(U.recruiter);
    await ss(page, "recruiter-owned-feedback-view.png");
    await ctx.close();
  }

  // 11. interviewer-permission-denied (interviewer can't access feedback)
  console.log("11. interviewer-permission-denied");
  {
    const ctx = await browser.newContext();
    await ctx.addCookies(U.interviewer);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/jobs`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    const btn = page.locator("button.w-full").first();
    if ((await btn.count()) > 0) { await btn.click(); await page.waitForTimeout(800); }
    const fbTab = page.locator("button:has-text('业务反馈')");
    if ((await fbTab.count()) > 0) { await fbTab.first().click(); await page.waitForTimeout(1500); }
    await ss(page, "interviewer-permission-denied.png");
    await ctx.close();
  }

  // 12. feedback-empty (a job without feedback)
  console.log("12. feedback-empty");
  {
    const ctx = await browser.newContext();
    await ctx.addCookies(U.admin);
    const page = await ctx.newPage();
    // Use a different job without feedback
    await page.goto(`${BASE}/jobs`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    // Click second job
    const btns = page.locator("button.w-full");
    if ((await btns.count()) > 1) { await btns.nth(1).click(); await page.waitForTimeout(800); }
    const fbTab = page.locator("button:has-text('业务反馈')");
    if ((await fbTab.count()) > 0) { await fbTab.first().click(); await page.waitForTimeout(1500); }
    await ss(page, "feedback-empty.png");
    await ctx.close();
  }

  // 13. feedback-loading (captured during load)
  console.log("13. feedback-loading");
  {
    const ctx = await browser.newContext();
    await ctx.addCookies(U.admin);
    const page = await ctx.newPage();
    await page.route("**/feedback-summary**", async (route: any) => {
      await new Promise(r => setTimeout(r, 3000));
      await route.continue();
    });
    await page.goto(`${BASE}/jobs`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    const btn = page.locator("button.w-full").first();
    if ((await btn.count()) > 0) { await btn.click(); await page.waitForTimeout(500); }
    const fbTab = page.locator("button:has-text('业务反馈')");
    if ((await fbTab.count()) > 0) { await fbTab.first().click(); await page.waitForTimeout(500); }
    await ss(page, "feedback-loading.png");
    await ctx.close();
  }

  // 14. feedback-error
  console.log("14. feedback-error");
  {
    const ctx = await browser.newContext();
    await ctx.addCookies(U.admin);
    const page = await ctx.newPage();
    await page.route("**/feedback-summary**", async (route: any) => {
      await route.fulfill({ status: 500, body: JSON.stringify({ success: false, error: "Internal Server Error" }) });
    });
    await page.goto(`${BASE}/jobs`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    const btn = page.locator("button.w-full").first();
    if ((await btn.count()) > 0) { await btn.click(); await page.waitForTimeout(500); }
    const fbTab = page.locator("button:has-text('业务反馈')");
    if ((await fbTab.count()) > 0) { await fbTab.first().click(); await page.waitForTimeout(1000); }
    await ss(page, "feedback-error.png");
    await ctx.close();
  }

  // 15. profile-calibration-confirmed
  console.log("15. profile-calibration-confirmed");
  {
    const { page, ctx } = await openFeedbackTab(U.admin);
    await ss(page, "profile-calibration-confirmed.png");
    await ctx.close();
  }

  await browser.close();
  console.log("\nAll Phase 5 screenshots captured!");
}

main().catch((e) => { console.error(e); process.exit(1); });
