/**
 * Phase 7.4B Evidence Lock — Screenshot Automation
 * Captures all 12 required PNG screenshots for Action Detail Drawer + Operation Modals.
 *
 * Uses API route interception to inject mock data since sandbox Prisma pool is unreliable.
 */

import { chromium } from "playwright";

const OUT_DIR = "/workspace/recruitment-dashboard/screenshots/phase-7.4b";
const BASE_URL = "http://localhost:3000";

// ─── Mock Data ───────────────────────────────────────────────

const MOCK_ACTIONS = [
  {
    id: "act-001",
    title: "KA大客户销售岗位候选人不足，需拓展渠道",
    description: "当前有效候选人仅3人，目标8人，需联系猎头拓展。",
    category: "process_blocker",
    priority: "high",
    status: "open",
    owner: { id: "user-recruiter", name: "王招聘" },
    createdBy: { id: "user-recruiter", name: "王招聘" },
    job: { id: "job-001", title: "KA大客户销售", jobCode: "SALES-001" },
    candidate: { id: "cand-001", name: "林可" },
    application: { id: "app-001", stage: "business_screen", candidate: { id: "cand-001", name: "林可" }, job: { id: "job-001", title: "KA大客户销售" } },
    interview: null,
    sourceType: "job_pipeline",
    sourceRefId: "job-001",
    sourceSummary: "渠道分析：BOSS直聘活跃度下降30%，猎头推荐暂停。",
    dueAt: "2025-07-01T00:00:00.000Z",
    resolvedAt: null,
    resolutionNote: null,
    dismissedReason: null,
    createdAt: "2025-06-20T08:00:00.000Z",
    updatedAt: "2025-06-25T10:30:00.000Z",
  },
  {
    id: "act-002",
    title: "品牌策划Offer风险：竞品Offer",
    description: "顾清和已收到联合利华Offer，薪资差距约15%。",
    category: "offer_risk",
    priority: "urgent",
    status: "open",
    owner: { id: "user-hrbp", name: "张HRBP" },
    createdBy: { id: "user-hrbp", name: "张HRBP" },
    job: { id: "job-006", title: "品牌策划", jobCode: "BRAND-001" },
    candidate: { id: "cand-006", name: "顾清和" },
    application: { id: "app-006", stage: "offer_risk", candidate: { id: "cand-006", name: "顾清和" }, job: { id: "job-006", title: "品牌策划" } },
    interview: { id: "int-003", round: "ceo_final", interviewer: { id: "user-leader", name: "李总监" } },
    sourceType: "offer_risk",
    sourceRefId: "app-006",
    sourceSummary: "竞品Offer：联合利华品牌经理，薪资高出15%，需48小时内决策。",
    dueAt: "2025-06-28T00:00:00.000Z",
    resolvedAt: null,
    resolutionNote: null,
    dismissedReason: null,
    createdAt: "2025-06-15T09:00:00.000Z",
    updatedAt: "2025-06-26T08:00:00.000Z",
  },
  {
    id: "act-003",
    title: "面试反馈延迟：媒介投放一面已过5天未提交面评",
    description: "面试官孙面试官尚未提交面评，已超SLA 48小时。",
    category: "feedback_followup",
    priority: "medium",
    status: "in_progress",
    owner: { id: "user-interviewer", name: "孙面试官" },
    createdBy: { id: "user-recruiter", name: "王招聘" },
    job: { id: "job-003", title: "媒介投放", jobCode: "CONTENT-001" },
    candidate: { id: "cand-003", name: "陈书妍" },
    application: { id: "app-003", stage: "first_interview", candidate: { id: "cand-003", name: "陈书妍" }, job: { id: "job-003", title: "媒介投放" } },
    interview: { id: "int-001", round: "business_first", interviewer: { id: "user-interviewer", name: "孙面试官" } },
    sourceType: "interview_feedback",
    sourceRefId: "int-001",
    sourceSummary: "一面完成时间：2025-06-20，当前时间：2025-06-26，已超时6天。",
    dueAt: "2025-06-24T00:00:00.000Z",
    resolvedAt: null,
    resolutionNote: null,
    dismissedReason: null,
    createdAt: "2025-06-20T14:00:00.000Z",
    updatedAt: "2025-06-22T09:00:00.000Z",
  },
  {
    id: "act-004",
    title: "采购资源开发岗位画像需校准",
    description: "业务方反馈采购岗位JD与市场实际不符，需HR与业务重新对齐。",
    category: "job_calibration",
    priority: "medium",
    status: "open",
    owner: { id: "user-hrbp", name: "张HRBP" },
    createdBy: { id: "user-biz", name: "赵业务" },
    job: { id: "job-002", title: "采购资源开发", jobCode: "SCM-001" },
    candidate: null,
    application: null,
    interview: null,
    sourceType: "business_feedback",
    sourceRefId: "bf-002",
    sourceSummary: "业务反馈：市场采购岗位薪资普遍高出预算20%，建议调整。",
    dueAt: "2025-07-05T00:00:00.000Z",
    resolvedAt: null,
    resolutionNote: null,
    dismissedReason: null,
    createdAt: "2025-06-22T11:00:00.000Z",
    updatedAt: "2025-06-22T11:00:00.000Z",
  },
  {
    id: "act-005",
    title: "内容编辑候选人已解决",
    description: "候选人赵明远已入职，行动项可关闭。",
    category: "manual",
    priority: "low",
    status: "resolved",
    owner: { id: "user-recruiter", name: "王招聘" },
    createdBy: { id: "user-recruiter", name: "王招聘" },
    job: { id: "job-005", title: "内容编辑", jobCode: "CONTENT-002" },
    candidate: { id: "cand-005", name: "赵明远" },
    application: null,
    interview: null,
    sourceType: "manual",
    sourceRefId: null,
    sourceSummary: null,
    dueAt: null,
    resolvedAt: "2025-06-25T16:00:00.000Z",
    resolutionNote: "候选人已通过终面并接受Offer，预计7月1日入职。",
    dismissedReason: null,
    createdAt: "2025-06-10T08:00:00.000Z",
    updatedAt: "2025-06-25T16:00:00.000Z",
  },
  {
    id: "act-006",
    title: "直播场控重复招聘需求已合并",
    description: "该行动与ECOMM-001岗位重复，已合并处理。",
    category: "data_quality",
    priority: "low",
    status: "dismissed",
    owner: { id: "user-recruiter", name: "王招聘" },
    createdBy: { id: "user-biz", name: "赵业务" },
    job: { id: "job-004", title: "直播场控", jobCode: "ECOMM-001" },
    candidate: null,
    application: null,
    interview: null,
    sourceType: "system_rule",
    sourceRefId: null,
    sourceSummary: null,
    dueAt: null,
    resolvedAt: null,
    resolutionNote: null,
    dismissedReason: "与ECOMM-001直播场控岗位的招聘需求重复，已统一由王招聘跟进。",
    createdAt: "2025-06-08T10:00:00.000Z",
    updatedAt: "2025-06-12T14:00:00.000Z",
  },
];

const MOCK_METRICS = {
  openCount: 4,
  overdueCount: 2,
  highPriorityCount: 2,
  dueTodayCount: 1,
  avgResolutionHours: 48,
  onTimeResolutionRate: 0.75,
};

const MOCK_ACTIVITY_LOG = [
  { type: "created", timestamp: "2025-06-20T08:00:00.000Z", actor: "王招聘", detail: "创建了行动项" },
  { type: "assigned", timestamp: "2025-06-20T08:05:00.000Z", actor: "王招聘", detail: "分配给王招聘" },
  { type: "commented", timestamp: "2025-06-22T09:00:00.000Z", actor: "张HRBP", detail: "建议联系3家猎头渠道拓展" },
  { type: "updated", timestamp: "2025-06-25T10:30:00.000Z", actor: "王招聘", detail: "更新了截止日期至7月1日" },
];

// ─── Main Script ─────────────────────────────────────────────

async function main() {
  console.log("🚀 Phase 7.4B Screenshot Automation starting...\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  // ── Setup API route interception ──────────────────────────
  const page = await context.newPage();

  // Unified API interceptor for ALL /api/actions/* requests
  await page.route("**/api/actions**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // ── GET /api/actions (list with optional query params) ──
    if (method === "GET" && !url.match(/\/api\/actions\/[^/?]+/)) {
      const params = new URL(url).searchParams;
      const statusFilter = params.get("status");
      const priorityFilter = params.get("priority");

      let filtered = [...MOCK_ACTIONS];
      if (statusFilter) filtered = filtered.filter((a) => a.status === statusFilter);
      if (priorityFilter) filtered = filtered.filter((a) => a.priority === priorityFilter);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          actions: filtered,
          metrics: { ...MOCK_METRICS, openCount: filtered.filter((a) => a.status === "open" || a.status === "in_progress").length },
        }),
      });
      return;
    }

    // ── POST /api/actions (create) ──
    if (method === "POST" && !url.match(/\/api\/actions\/[^/?]+\/(resolve|dismiss)/)) {
      const body = JSON.parse(route.request().postData() || "{}");
      const newAction = {
        id: `act-new-${Date.now()}`,
        title: body.title || "新行动项",
        description: body.description || null,
        category: body.category || "manual",
        priority: body.priority || "medium",
        status: "open",
        owner: { id: "user-recruiter", name: "王招聘" },
        createdBy: { id: "user-recruiter", name: "王招聘" },
        job: null,
        candidate: null,
        application: null,
        interview: null,
        sourceType: body.sourceType || "manual",
        sourceRefId: null,
        sourceSummary: null,
        dueAt: null,
        resolvedAt: null,
        resolutionNote: null,
        dismissedReason: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ success: true, data: newAction }),
      });
      return;
    }

    // ── POST /api/actions/:id/resolve ──
    if (method === "POST" && url.includes("/resolve")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { ...MOCK_ACTIONS[0], status: "resolved", resolvedAt: new Date().toISOString(), resolutionNote: "已处理完成。" },
        }),
      });
      return;
    }

    // ── POST /api/actions/:id/dismiss ──
    if (method === "POST" && url.includes("/dismiss")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          data: { ...MOCK_ACTIONS[0], status: "dismissed", dismissedReason: "不再适用。" },
        }),
      });
      return;
    }

    // ── GET /api/actions/:id (detail) ──
    if (method === "GET") {
      const idMatch = url.match(/\/api\/actions\/(act-\d+|act-new-\d+)/);
      const id = idMatch?.[1];
      const action = MOCK_ACTIONS.find((a) => a.id === id);
      if (action) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true, data: action }),
        });
      } else {
        await route.fulfill({
          status: 404,
          contentType: "application/json",
          body: JSON.stringify({ success: false, error: "Not found" }),
        });
      }
      return;
    }

    // Fallback
    await route.continue();
  });

  // Mock auth context
  await page.route("**/api/auth/context", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        user: { id: "user-recruiter", name: "王招聘", role: "recruiter", departmentId: "dept-hr" },
      }),
    });
  });

  // ── Helper: screenshot ────────────────────────────────────
  async function snap(name: string) {
    const path = `${OUT_DIR}/${name}.png`;
    await page.screenshot({ path, fullPage: false });
    console.log(`  ✅ ${name}.png`);
  }

  // ═══════════════════════════════════════════════════════════
  // SCREENSHOT 1: Action List Page (主页面)
  // ═══════════════════════════════════════════════════════════
  console.log("\n📸 Capturing screenshots...\n");
  console.log("  1. Action list page...");

  await page.goto(`${BASE_URL}/actions`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await snap("action-list-main");

  // ═══════════════════════════════════════════════════════════
  // SCREENSHOT 2-4: Action Detail Drawer tabs
  // ═══════════════════════════════════════════════════════════
  console.log("  2. Action Detail Drawer — Overview tab...");

  // Click first action row to open drawer
  const firstRow = page.locator("tbody tr").first();
  await firstRow.click();
  await page.waitForTimeout(1000);
  await snap("action-detail-drawer-overview");

  // Switch to "关联信息" tab
  console.log("  3. Action Detail Drawer — Linked Context tab...");
  await page.locator("button:has-text('关联信息')").click();
  await page.waitForTimeout(800);
  await snap("action-detail-drawer-linked-context");

  // Switch to "活动记录" tab
  console.log("  4. Action Detail Drawer — Activity tab...");
  await page.locator("button:has-text('活动记录')").click();
  await page.waitForTimeout(800);
  await snap("action-detail-drawer-activity");

  // Close drawer
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);

  // ═══════════════════════════════════════════════════════════
  // SCREENSHOT 5: Loading state (forced)
  // ═══════════════════════════════════════════════════════════
  console.log("  5. Action Detail Drawer — Loading...");
  // Navigate fresh, click a row while intercepting with delay
  await page.goto(`${BASE_URL}/actions`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // We'll take a separate approach: just reload with a delayed API
  // Intercept the detail API with a 2s delay
  let loadingCaptured = false;
  await page.route("**/api/actions/act-001", async (route) => {
    if (!loadingCaptured && route.request().method() === "GET") {
      // Trigger the click first, then delay
      loadingCaptured = true;
      await new Promise((r) => setTimeout(r, 2000));
    }
    const action = MOCK_ACTIONS[0];
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, data: action }),
    });
  });

  await firstRow.click();
  await page.waitForTimeout(300);
  await snap("action-detail-drawer-loading");
  await page.waitForTimeout(2000); // wait for delayed route to complete

  // Close drawer
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);

  // ═══════════════════════════════════════════════════════════
  // SCREENSHOT 6: Permission Denied (forced)
  // ═══════════════════════════════════════════════════════════
  console.log("  6. Action Detail Drawer — Permission Denied...");

  // Override route for a specific action ID to return 403
  await page.route("**/api/actions/act-003", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "Permission denied" }),
      });
    } else {
      await route.continue();
    }
  });

  // Click the 3rd row (act-003)
  await page.goto(`${BASE_URL}/actions`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const thirdRow = page.locator("tbody tr").nth(2);
  await thirdRow.click();
  await page.waitForTimeout(1000);
  await snap("action-detail-drawer-permission-denied");

  // Close drawer
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);

  // ═══════════════════════════════════════════════════════════
  // SCREENSHOT 7: Create Action Modal (empty form)
  // ═══════════════════════════════════════════════════════════
  console.log("  7. Create Action Modal...");

  await page.goto(`${BASE_URL}/actions`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Click "创建 Action" button
  await page.locator("button:has-text('创建 Action')").click();
  await page.waitForTimeout(800);
  await snap("create-action-modal");

  // ═══════════════════════════════════════════════════════════
  // SCREENSHOT 8: Create Action — Validation Error
  // ═══════════════════════════════════════════════════════════
  console.log("  8. Create Action — Validation Error...");

  // Click "创建" button without filling title (exact match on submit button in modal)
  const createBtn = page.locator("button:has-text('创建'):not(:has-text('Action')):not(:has-text('手动'))");
  await createBtn.click();
  await page.waitForTimeout(500);
  await snap("create-action-validation-error");

  // ═══════════════════════════════════════════════════════════
  // SCREENSHOT 9: Create Action — Success Toast
  // ═══════════════════════════════════════════════════════════
  console.log("  9. Create Action — Success Toast...");

  // Fill in title and submit
  const titleInput = page.locator("input[placeholder='请输入行动标题']");
  await titleInput.fill("紧急：抖音主播候选人薪资期望超出预算");
  await createBtn.click();
  await page.waitForTimeout(800);
  await snap("create-action-success");

  // ═══════════════════════════════════════════════════════════
  // SCREENSHOT 10: Resolve Action Modal
  // ═══════════════════════════════════════════════════════════
  console.log("  10. Resolve Action Modal...");

  // Go back to list, click a row, then click "标记为已解决"
  await page.goto(`${BASE_URL}/actions`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Click first row to open drawer
  await page.locator("tbody tr").first().click();
  await page.waitForTimeout(1000);

  // Click "标记为已解决" button in the drawer footer
  await page.locator("button:has-text('标记为已解决')").click();
  await page.waitForTimeout(800);
  await snap("resolve-action-modal");

  // ═══════════════════════════════════════════════════════════
  // SCREENSHOT 11: Resolve Action — Success
  // ═══════════════════════════════════════════════════════════
  console.log("  11. Resolve Action — Success...");

  // Fill resolution note and submit
  const resolveNoteInput = page.locator("textarea[placeholder*='请说明该行动如何被处理']");
  await resolveNoteInput.fill("已联系3家猎头渠道拓展KA销售候选人，预计一周内新增5+候选人。");
  await page.locator("button:has-text('确认解决')").click();
  await page.waitForTimeout(800);
  await snap("resolve-action-success");

  // ═══════════════════════════════════════════════════════════
  // SCREENSHOT 12: Dismiss Action Modal
  // ═══════════════════════════════════════════════════════════
  console.log("  12. Dismiss Action Modal...");

  // Go back to list, click a row, then click "忽略此行动"
  await page.goto(`${BASE_URL}/actions`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  await page.locator("tbody tr").first().click();
  await page.waitForTimeout(1000);

  // Click "忽略此行动" button in the drawer footer
  await page.locator("button:has-text('忽略此行动')").click();
  await page.waitForTimeout(800);
  await snap("dismiss-action-modal");

  // ═══════════════════════════════════════════════════════════
  // SCREENSHOT 13: Dismiss Action — Success
  // ═══════════════════════════════════════════════════════════
  console.log("  13. Dismiss Action — Success...");

  // Fill dismiss reason and submit
  const dismissReasonInput = page.locator("textarea[placeholder*='请说明忽略原因']");
  await dismissReasonInput.fill("该风险已由线下业务沟通确认，候选人最终选择留在原公司，不再构成竞争风险。");
  await page.locator("button:has-text('确认忽略')").click();
  await page.waitForTimeout(800);
  await snap("dismiss-action-success");

  // ── Cleanup ──────────────────────────────────────────────
  await browser.close();
  console.log("\n✅ All 13 screenshots captured successfully!");
  console.log(`   Output: ${OUT_DIR}/`);
}

main().catch((e) => {
  console.error("❌ Screenshot script failed:", e);
  process.exit(1);
});
