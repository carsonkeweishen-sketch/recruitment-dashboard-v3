// Phase 4.4.1 Screenshot Script
import { chromium } from "playwright";
import * as path from "path";
import * as fs from "fs";

const SCREENSHOT_DIR = path.resolve(__dirname, "../screenshots/phase-4.4.1");
const BASE_URL = "http://localhost:3000";

function roleCookies(role: string, userId: string, deptId: string) {
  return [
    { name: "rd_dev_role", value: role, domain: "localhost", path: "/" },
    { name: "rd_dev_user_id", value: userId, domain: "localhost", path: "/" },
    { name: "rd_dev_dept_id", value: deptId, domain: "localhost", path: "/" },
  ];
}

const U = {
  hrbp: { role: "hrbp", uid: "cmqt44zcb0006zyqh896spolz", did: "cmqt4167c0001jsqh47jzx52k" },
  interviewer: { role: "interviewer", uid: "cmqt44zdt0009zyqhnpi53sy1", did: "cmqt4167c0002jsqhbgqj6byq" },
  biz_owner: { role: "business_owner", uid: "cmqt44zdc0008zyqh6dao7vbr", did: "cmqt44z9o0002zyqhl63hcpu6" },
};

async function screenshot(page: any, name: string) {
  const filePath = path.join(SCREENSHOT_DIR, name);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`  ✓ ${name} (${fs.statSync(filePath).size} bytes)`);
}

async function main() {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  console.log("Phase 4.4.1 Screenshot capture...\n");
  const browser = await chromium.launch({ headless: true });

  // 1. HRBP candidates visible
  console.log("1. hrbp-candidates-visible");
  {
    const ctx = await browser.newContext();
    await ctx.addCookies(roleCookies(U.hrbp.role, U.hrbp.uid, U.hrbp.did));
    const page = await ctx.newPage();
    await page.goto(`${BASE_URL}/candidates`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await screenshot(page, "hrbp-candidates-visible.png");
    await ctx.close();
  }

  // 2. Interviewer related candidates
  console.log("2. interviewer-related-candidates");
  {
    const ctx = await browser.newContext();
    await ctx.addCookies(roleCookies(U.interviewer.role, U.interviewer.uid, U.interviewer.did));
    const page = await ctx.newPage();
    await page.goto(`${BASE_URL}/candidates`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    await screenshot(page, "interviewer-related-candidates.png");
    await ctx.close();
  }

  // 3. Interviewer contact hidden (open detail drawer)
  console.log("3. interviewer-contact-hidden");
  {
    const ctx = await browser.newContext();
    await ctx.addCookies(roleCookies(U.interviewer.role, U.interviewer.uid, U.interviewer.did));
    const page = await ctx.newPage();
    await page.goto(`${BASE_URL}/candidates`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    const btn = page.locator("div.overflow-hidden button.w-full").first();
    if ((await btn.count()) > 0) { await btn.click(); await page.waitForTimeout(800); }
    await screenshot(page, "interviewer-contact-hidden.png");
    await ctx.close();
  }

  // 4. Biz owner contact hidden
  console.log("4. biz-owner-contact-hidden");
  {
    const ctx = await browser.newContext();
    await ctx.addCookies(roleCookies(U.biz_owner.role, U.biz_owner.uid, U.biz_owner.did));
    const page = await ctx.newPage();
    await page.goto(`${BASE_URL}/candidates`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);
    const btn = page.locator("div.overflow-hidden button.w-full").first();
    if ((await btn.count()) > 0) { await btn.click(); await page.waitForTimeout(800); }
    await screenshot(page, "biz-owner-contact-hidden.png");
    await ctx.close();
  }

  await browser.close();
  console.log("\nAll Phase 4.4.1 screenshots captured!");
}

main().catch((e) => { console.error(e); process.exit(1); });
