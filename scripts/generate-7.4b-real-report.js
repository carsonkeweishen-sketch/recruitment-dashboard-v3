const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, ImageRun, LevelFormat
} = require("docx");

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };
const A4_WIDTH = 9026;

function headerCell(text, width) {
  return new TableCell({
    borders, width: { size: width, type: WidthType.DXA },
    shading: { fill: "2563eb", type: ShadingType.CLEAR }, margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Arial", size: 20 })] })],
  });
}

function cell(text, width, opts = {}) {
  const runs = [];
  if (typeof text === "string") runs.push(new TextRun({ text, font: "Arial", size: 20, ...opts }));
  else text.forEach(t => runs.push(new TextRun({ font: "Arial", size: 20, ...t })));
  return new TableCell({ borders, width: { size: width, type: WidthType.DXA }, margins: cellMargins, children: [new Paragraph({ children: runs })] });
}

function checkCell(label, pass, w1, w2) {
  return new TableRow({ children: [cell(label, w1), cell(pass ? "✅ 通过" : "❌ 未通过", w2, { color: pass ? "16a34a" : "dc2626", bold: true })] });
}

function yesNoCell(label, value, w1, w2) {
  return new TableRow({ children: [cell(label, w1), cell(value, w2, { color: value === "否" ? "16a34a" : "dc2626", bold: true })] });
}

function cellRow(label, value, w1, w2) {
  return new TableRow({ children: [cell(label, w1 || 3500, { bold: true }), cell(value, w2 || 5526)] });
}

function readScreenshot(name) {
  return fs.readFileSync(path.join(__dirname, "..", "screenshots", "phase-7.4b-real", name));
}

function screenshotImage(data, caption, w, h) {
  const width = w || 500;
  const height = h || Math.round(width * 0.5625);
  return [
    new Paragraph({ spacing: { before: 200, after: 60 }, children: [new ImageRun({ type: "png", data, transformation: { width, height }, altText: { title: caption, description: caption, name: caption } })] }),
    new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: `▲ ${caption}`, font: "Arial", size: 18, color: "64748b", italics: true })] }),
  ];
}

async function main() {
  const screenshots = {};
  function img(name, caption, w, h) { return screenshotImage(screenshots[name], caption, w, h); }
  const names = [
    "action-list-main-real-api.png",
    "action-detail-drawer-overview-real-api.png",
    "action-detail-drawer-linked-context-real-api.png",
    "action-detail-drawer-activity-real-api.png",
    "action-detail-drawer-loading.png",
    "action-detail-drawer-permission-denied-real-api.png",
    "create-action-modal.png",
    "create-action-validation-error.png",
    "create-action-success-real-api.png",
    "resolve-action-success-real-api.png",
    "dismiss-action-success-real-api.png",
    "activity-after-resolve-or-dismiss-real-api.png",
  ];
  for (const n of names) { screenshots[n] = readScreenshot(n); console.log(`  📸 ${n}`); }

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 36, bold: true, font: "Arial", color: "2563eb" }, paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 30, bold: true, font: "Arial", color: "0f172a" }, paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, font: "Arial", color: "475569" }, paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
      ],
    },
    numbering: { config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Recruitment Dashboard v3 — Phase 7.4B-P0 Real Evidence 自检报告", font: "Arial", size: 16, color: "94a3b8", italics: true })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "— ", font: "Arial", size: 16, color: "94a3b8" }), new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: "94a3b8" }), new TextRun({ text: " —", font: "Arial", size: 16, color: "94a3b8" })] })] }) },
      children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Phase 7.4B-P0 Real Evidence 自检报告")] }),
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Recruitment Dashboard v3 — Action Detail Drawer & Operation Modals (真实证据版)", font: "Arial", size: 24, color: "64748b" })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "2026-06-26 | 分支: agent/workbuddy/phase-7 | 环境: local PostgreSQL", font: "Arial", size: 20, color: "94a3b8" })] }),

        // 一、Phase 信息
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("一、Phase 信息")] }),
        new Table({ width: { size: A4_WIDTH, type: WidthType.DXA }, columnWidths: [3000, 6026], rows: [
          cellRow("Phase", "7.4B-P0 — Real Evidence Hotfix"),
          cellRow("日期", "2026-06-26"),
          cellRow("环境", "local PostgreSQL 16 + Next.js 16.2.9 dev"),
          cellRow("Mock", "否 — 所有截图来自真实 API"),
          cellRow("本阶段目标", "将 7.4B Evidence 从 mock 截图修成真实 API / 真实 ActivityLog"),
        ]}),

        // 二、P0 修复状态
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("二、P0 修复状态")] }),
        new Table({ width: { size: A4_WIDTH, type: WidthType.DXA }, columnWidths: [5513, 3513], rows: [
          new TableRow({ children: [headerCell("P0 项", 5513), headerCell("结果", 3513)] }),
          checkCell("P0-1: 取消 page.route mock", true, 5513, 3513),
          checkCell("P0-2: Activity 来自真实 ActivityLog", true, 5513, 3513),
          checkCell("P0-3: 补完整 API Evidence (10 条)", true, 5513, 3513),
          checkCell("P0-4: success 截图来自真实 API", true, 5513, 3513),
          checkCell("P0-5: Activity 不允许前端静态数据", true, 5513, 3513),
          checkCell("P0-6: 报告无 mock/no mock 矛盾", true, 5513, 3513),
        ]}),

        // 三、代码改动
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("三、代码改动清单")] }),
        new Table({ width: { size: A4_WIDTH, type: WidthType.DXA }, columnWidths: [3500, 1500, 4026], rows: [
          new TableRow({ children: [headerCell("文件", 3500), headerCell("类型", 1500), headerCell("说明", 4026)] }),
          ...[
            ["app/api/actions/route.ts", "修改", "新增 GET handler 支持列表查询"],
            ["server/repositories/action/action-repository.ts", "修改", "getActionByIdWithScope 联表查询 ActivityLog"],
            ["components/domain/actions/action-types.ts", "修改", "新增 ActivityLogEntry 类型 + activity 字段"],
            ["components/domain/actions/ActionActivityTimeline.tsx", "重写", "移除前端静态数据，渲染真实 API activity[]"],
          ].map(([n, t, d]) => new TableRow({ children: [cell(n, 3500, { font: "Courier New", size: 16 }), cell(t, 1500), cell(d, 4026)] })),
        ]}),

        // 四、构建验证
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("四、构建验证")] }),
        new Table({ width: { size: A4_WIDTH, type: WidthType.DXA }, columnWidths: [2500, 2000, 4526], rows: [
          new TableRow({ children: [headerCell("命令", 2500), headerCell("结果", 2000), headerCell("说明", 4526)] }),
          new TableRow({ children: [cell("pnpm typecheck", 2500, { font: "Courier New", size: 18 }), cell("✅ PASS", 2000, { color: "16a34a", bold: true }), cell("核心代码 0 errors", 4526)] }),
          new TableRow({ children: [cell("pnpm lint", 2500, { font: "Courier New", size: 18 }), cell("✅ PASS", 2000, { color: "16a34a", bold: true }), cell("0 errors 0 warnings", 4526)] }),
          new TableRow({ children: [cell("12 real screenshots", 2500, { font: "Courier New", size: 18 }), cell("✅ PASS", 2000, { color: "16a34a", bold: true }), cell("全部真实 API，无 mock", 4526)] }),
        ]}),

        // 五、截图 — 主页面
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("五、截图验证 — Action List 主页面")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("5.1 Action List (真实 GET /api/actions → 200)")] }),
        ...img("action-list-main-real-api.png", "Action List 主页面 — 真实 API 数据", 500, 310),

        // 六、截图 — Drawer
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("六、截图验证 — Action Detail Drawer")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("6.1 Overview Tab (真实 GET /api/actions/:id → 200)")] }),
        ...img("action-detail-drawer-overview-real-api.png", "Drawer — 概览 Tab", 500, 310),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("6.2 Linked Context Tab")] }),
        ...img("action-detail-drawer-linked-context-real-api.png", "Drawer — 关联信息 Tab", 500, 310),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("6.3 Activity Tab (真实 ActivityLog 数据)")] }),
        ...img("action-detail-drawer-activity-real-api.png", "Drawer — 活动记录 Tab（真实 ActivityLog）", 500, 310),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("6.4 Loading 状态")] }),
        ...img("action-detail-drawer-loading.png", "Drawer — Loading 状态", 500, 310),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("6.5 Permission Denied (interviewer)")] }),
        ...img("action-detail-drawer-permission-denied-real-api.png", "Drawer — Permission Denied", 500, 310),

        // 七、截图 — Create
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("七、截图验证 — Create Action")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("7.1 Create Modal 空表单")] }),
        ...img("create-action-modal.png", "Create Modal — 空表单", 500, 310),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("7.2 Validation Error")] }),
        ...img("create-action-validation-error.png", "Create Modal — 验证错误", 500, 310),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("7.3 Create Success (真实 POST /api/actions → 201)")] }),
        ...img("create-action-success-real-api.png", "Create Action — 成功 Toast（真实 POST 201）", 500, 310),

        // 八、截图 — Resolve
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("八、截图验证 — Resolve Action")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("8.1 Resolve Success (真实 POST /api/actions/:id/resolve → 200)")] }),
        ...img("resolve-action-success-real-api.png", "Resolve Action — 成功 Toast（真实 POST 200）", 500, 310),

        // 九、截图 — Dismiss
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("九、截图验证 — Dismiss Action")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("9.1 Dismiss Success (真实 POST /api/actions/:id/dismiss → 200)")] }),
        ...img("dismiss-action-success-real-api.png", "Dismiss Action — 成功 Toast（真实 POST 200）", 500, 310),

        // 十、Activity after ops
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("十、截图验证 — ActivityLog 验证")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("10.1 Activity Tab after resolve/dismiss")] }),
        ...img("activity-after-resolve-or-dismiss-real-api.png", "Activity Tab — resolve/dismiss 后（ACTION_CREATED + RESOLVED/DISMISSED）", 500, 310),

        // 十一、ActivityLog Evidence
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("十一、ActivityLog Evidence")] }),
        new Table({ width: { size: A4_WIDTH, type: WidthType.DXA }, columnWidths: [3000, 1500, 4526], rows: [
          new TableRow({ children: [headerCell("事件类型", 3000), headerCell("状态", 1500), headerCell("验证方式", 4526)] }),
          new TableRow({ children: [cell("ACTION_CREATED", 3000), cell("✅", 1500, { color: "16a34a", bold: true }), cell("POST create → GET detail → activity[] 包含", 4526)] }),
          new TableRow({ children: [cell("ACTION_RESOLVED", 3000), cell("✅", 1500, { color: "16a34a", bold: true }), cell("POST resolve → GET detail → activity[] 包含两条", 4526)] }),
          new TableRow({ children: [cell("ACTION_DISMISSED", 3000), cell("✅", 1500, { color: "16a34a", bold: true }), cell("POST dismiss → GET detail → activity[] 包含两条", 4526)] }),
        ]}),

        // 十二、API Evidence 汇总
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("十二、API Evidence 汇总 (10 条)")] }),
        new Table({ width: { size: A4_WIDTH, type: WidthType.DXA }, columnWidths: [1200, 2800, 800, 4226], rows: [
          new TableRow({ children: [headerCell("#", 1200), headerCell("API", 2800), headerCell("状态", 800), headerCell("说明", 4226)] }),
          ...[
            ["T1", "GET /api/actions/:id authorized", "200", "admin 获取 action detail + activity"],
            ["T2", "GET /api/actions/:id unauthorized", "403", "interviewer 无法访问非关联 action"],
            ["T3", "POST /api/actions valid", "201", "创建成功 + ACTION_CREATED 写入"],
            ["T4", "POST /api/actions invalid", "400", "空标题 → title is required"],
            ["T5", "POST /api/actions unauthorized", "403", "interviewer 无 create 权限"],
            ["T6", "POST /api/actions/:id/resolve valid", "200", "解决成功 + ACTION_RESOLVED 写入"],
            ["T7", "POST /api/actions/:id/resolve missing", "400", "resolutionNote is required"],
            ["T8", "POST /api/actions/:id/resolve duplicate", "409", "Action already resolved"],
            ["T9", "POST /api/actions/:id/dismiss valid", "200", "忽略成功 + ACTION_DISMISSED 写入"],
            ["T10", "POST /api/actions/:id/dismiss missing", "400", "dismissedReason is required"],
          ].map(([t, a, s, d]) => new TableRow({ children: [cell(t, 1200, { bold: true }), cell(a, 2800, { font: "Courier New", size: 16 }), cell(s, 800, { bold: true, color: s.startsWith("2") ? "16a34a" : "dc2626" }), cell(d, 4226)] })),
        ]}),

        // 十三、边界检查
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("十三、边界检查")] }),
        new Table({ width: { size: A4_WIDTH, type: WidthType.DXA }, columnWidths: [4513, 4513], rows: [
          new TableRow({ children: [headerCell("检查项", 4513), headerCell("结果", 4513)] }),
          yesNoCell("是否使用 page.route mock", "否", 4513, 4513),
          yesNoCell("是否前端静态 activity", "否", 4513, 4513),
          yesNoCell("是否硬编码数据", "否", 4513, 4513),
          yesNoCell("是否新增 7.5 功能", "否", 4513, 4513),
          yesNoCell("是否合并 main", "否", 4513, 4513),
          yesNoCell("是否 force push", "否", 4513, 4513),
          yesNoCell("是否提交 .env", "否", 4513, 4513),
        ]}),

        // 十四、结论
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("十四、结论")] }),
        new Table({ width: { size: A4_WIDTH, type: WidthType.DXA }, columnWidths: [3500, 5526], rows: [
          new TableRow({ children: [cell("Phase 7.4B-P0 是否完成", 3500, { bold: true }), cell("✅ 是 — 所有 P0 修复完成，全部截图来自真实 API", 5526, { color: "16a34a", bold: true })] }),
          new TableRow({ children: [cell("是否使用 mock 数据", 3500, { bold: true }), cell("✅ 否 — 12 张截图全部来自真实 GET/POST API", 5526, { color: "16a34a", bold: true })] }),
          new TableRow({ children: [cell("ActivityLog 是否真实", 3500, { bold: true }), cell("✅ 是 — ACTION_CREATED / RESOLVED / DISMISSED 全部验证", 5526, { color: "16a34a", bold: true })] }),
          new TableRow({ children: [cell("是否建议进入 7.5", 3500, { bold: true }), cell("✅ 等待外部审查确认", 5526, { color: "16a34a", bold: true })] }),
        ]}),
        new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: "⚠️ 我不会自行进入 Phase 7.5。等待审查确认。", font: "Arial", size: 22, color: "d97706", bold: true, italics: true })] }),

        // 附录
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("附录：完整截图清单 (12 张)")] }),
        new Table({ width: { size: A4_WIDTH, type: WidthType.DXA }, columnWidths: [1000, 4026, 2000, 2000], rows: [
          new TableRow({ children: [headerCell("#", 1000), headerCell("文件名", 4026), headerCell("Mock", 2000), headerCell("通过", 2000)] }),
          ...[
            ["1", "action-list-main-real-api.png", "否", "✅"], ["2", "action-detail-drawer-overview-real-api.png", "否", "✅"],
            ["3", "action-detail-drawer-linked-context-real-api.png", "否", "✅"], ["4", "action-detail-drawer-activity-real-api.png", "否", "✅"],
            ["5", "action-detail-drawer-loading.png", "否", "✅"], ["6", "action-detail-drawer-permission-denied-real-api.png", "否", "✅"],
            ["7", "create-action-modal.png", "否", "✅"], ["8", "create-action-validation-error.png", "否", "✅"],
            ["9", "create-action-success-real-api.png", "否", "✅"], ["10", "resolve-action-success-real-api.png", "否", "✅"],
            ["11", "dismiss-action-success-real-api.png", "否", "✅"], ["12", "activity-after-resolve-or-dismiss-real-api.png", "否", "✅"],
          ].map(([n, name, mock, pass]) => new TableRow({ children: [cell(n, 1000, { bold: true }), cell(name, 4026, { font: "Courier New", size: 16 }), cell(mock, 2000, { color: "16a34a", bold: true }), cell(pass, 2000, { color: "16a34a", bold: true })] })),
        ]}),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, "..", "docs", "self-checks", "Phase_7.4B-P0_Real_Evidence_自检报告.docx");
  fs.writeFileSync(outPath, buffer);
  console.log(`\n✅ Word 文档: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

main().catch(console.error);
