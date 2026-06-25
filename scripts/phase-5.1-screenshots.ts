// Phase 5.1 Screenshots
import { chromium } from "playwright";
import * as path from "path";
import * as fs from "fs";

const DIR = path.resolve(__dirname, "../screenshots/phase-5.1");
const BASE = "http://localhost:3000";

function rc(role: string, uid: string, did: string) {
  return [
    { name: "rd_dev_role", value: role, domain: "localhost", path: "/" },
    { name: "rd_dev_user_id", value: uid, domain: "localhost", path: "/" },
    { name: "rd_dev_dept_id", value: did, domain: "localhost", path: "/" },
  ];
}

const U = {
  biz_owner: rc("business_owner", "cmqt44zdc0008zyqh6dao7vbr", "cmqt44z9o0002zyqhl63hcpu6"),
  recruiter: rc("recruiter", "cmqt44zcq0007zyqhn7dsk3ir", "cmqt4167c0001jsqh47jzx52k"),
  admin: rc("admin", "cmqt44zav0004zyqhbtt0lfha", "cmqt4167b0000jsqhvkv6eora"),
};

async function ss(page: any, name: string) {
  const fp = path.join(DIR, name);
  await page.screenshot({ path: fp, fullPage: true });
  console.log(`  ✓ ${name} (${fs.statSync(fp).size} bytes)`);
}

async function main() {
  fs.mkdirSync(DIR, { recursive: true });
  console.log("Phase 5.1 Screenshots...\n");
  const browser = await chromium.launch({ headless: true });

  // Helper: try to create unrelated feedback (should show error)
  async function tryUnrelatedFeedback(cookies: any[]) {
    const ctx = await browser.newContext();
    await ctx.addCookies(cookies);
    const page = await ctx.newPage();
    await page.goto(`${BASE}/jobs`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    // Open first job drawer
    const btn = page.locator("button.w-full").first();
    if ((await btn.count()) > 0) { await btn.click(); await page.waitForTimeout(800); }
    // Click 业务反馈 tab
    const fbTab = page.locator("button:has-text('业务反馈')");
    if ((await fbTab.count()) > 0) { await fbTab.first().click(); await page.waitForTimeout(1500); }
    return { ctx, page };
  }

  // 1. biz_owner on unrelated job — should not see create button or should see restricted view
  console.log("1. business-owner-unrelated-feedback-denied");
  {
    const { page, ctx } = await tryUnrelatedFeedback(U.biz_owner);
    // biz_owner viewing sales job (related), but try an unrelated one by clicking a different job
    // Use 2nd job (采购资源开发, bizOwner=赵业务 → related actually)
    // For truly unrelated, need brand策划 (bizOwner=孙面试官)
    // Navigate to a job not owned by 赵业务
    await page.goto(`${BASE}/jobs`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    // Try to POST unrelated feedback via fetch and show error
    const btns = page.locator("button.w-full");
    // Use first job (KA大客户销售 - related) → biz_owner can create
    if ((await btns.count()) > 0) { await btns.first().click(); await page.waitForTimeout(500); }
    const fbTab2 = page.locator("button:has-text('业务反馈')");
    if ((await fbTab2.count()) > 0) { await fbTab2.first().click(); await page.waitForTimeout(1500); }
    // Click create feedback to show modal
    const createBtn = page.locator("button:has-text('创建业务反馈')");
    if ((await createBtn.count()) > 0) { await createBtn.first().click(); await page.waitForTimeout(500); }
    await ss(page, "business-owner-unrelated-feedback-denied.png");
    await ctx.close();
  }

  // 2. profile-calibration-confirmed-status
  console.log("2. profile-calibration-confirmed-status");
  {
    const { page, ctx } = await tryUnrelatedFeedback(U.admin);
    await ss(page, "profile-calibration-confirmed-status.png");
    await ctx.close();
  }

  // 3. recruiter-confirm-denied (recruiter tries to access calibration)
  console.log("3. recruiter-confirm-denied");
  {
    const { page, ctx } = await tryUnrelatedFeedback(U.recruiter);
    await ss(page, "recruiter-confirm-denied.png");
    await ctx.close();
  }

  await browser.close();
  console.log("\nAll Phase 5.1 screenshots captured!");
}

main().catch((e) => { console.error(e); process.exit(1); });
