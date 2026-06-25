const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageNumber, PageBreak, ImageRun, LevelFormat
} = require("docx");

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: "2563eb", type: ShadingType.CLEAR },
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "FFFFFF", font: "Arial", size: 20 })] })],
  });
}

function cell(text, width, opts = {}) {
  const runs = [];
  if (typeof text === "string") {
    runs.push(new TextRun({ text, font: "Arial", size: 20, ...opts }));
  } else {
    text.forEach(t => runs.push(new TextRun({ font: "Arial", size: 20, ...t })));
  }
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    margins: cellMargins,
    children: [new Paragraph({ children: runs })],
  });
}

function checkCell(label, pass, width1, width2) {
  return new TableRow({
    children: [
      cell(label, width1),
      cell(pass ? "✅ 通过" : "❌ 未通过", width2, { color: pass ? "16a34a" : "dc2626", bold: true }),
    ],
  });
}

function yesNoCell(label, value, width1, width2) {
  const pass = value === "否";
  return new TableRow({
    children: [
      cell(label, width1),
      cell(value, width2, { color: pass ? "16a34a" : "dc2626", bold: true }),
    ],
  });
}

const A4_WIDTH = 9026;

async function main() {
  const screenshot = fs.readFileSync("docs/screenshots/phase-0-homepage.png");

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 36, bold: true, font: "Arial", color: "2563eb" },
          paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 30, bold: true, font: "Arial", color: "0f172a" },
          paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 26, bold: true, font: "Arial", color: "475569" },
          paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
      ],
    },
    numbering: {
      config: [
        { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "Recruitment Dashboard v2 — Phase 0 自检报告", font: "Arial", size: 16, color: "94a3b8", italics: true })],
            })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "— ", font: "Arial", size: 16, color: "94a3b8" }),
                new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: "94a3b8" }),
                new TextRun({ text: " —", font: "Arial", size: 16, color: "94a3b8" }),
              ],
            })],
          }),
        },
        children: [
          // ========== TITLE ==========
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Phase 0 自检报告")] }),
          new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Recruitment Dashboard v2 — 工程底座与持久化机制", font: "Arial", size: 24, color: "64748b" })] }),
          new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: "2025-06-25", font: "Arial", size: 20, color: "94a3b8" })] }),

          // ========== 一、Phase 信息 ==========
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("一、Phase 信息")] }),
          new Table({
            width: { size: A4_WIDTH, type: WidthType.DXA },
            columnWidths: [3000, 6026],
            rows: [
              cellRow("Phase", "0 — 工程底座与持久化机制"),
              cellRow("日期", "2025-06-25"),
              cellRow("当前目录", "/workspace/recruitment-dashboard"),
              cellRow("项目名称", "recruitment-dashboard-v2"),
              cellRow("本阶段目标", "建立可长期演进、不丢失、可持续开发的工程底座"),
            ],
          }),

          // ========== 二、执行范围确认 ==========
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("二、执行范围确认")] }),
          new Table({
            width: { size: A4_WIDTH, type: WidthType.DXA },
            columnWidths: [4513, 2256, 2257],
            rows: [
              new TableRow({ children: [headerCell("检查项", 4513), headerCell("结果", 2256), headerCell("说明", 2257)] }),
              new TableRow({ children: [cell("是否只执行 Phase 0", 4513), cell("✅ 是", 2256, { color: "16a34a", bold: true }), cell("严格限定工程底座", 2257)] }),
              new TableRow({ children: [cell("是否进入 Phase 1", 4513), cell("✅ 否", 2256, { color: "16a34a", bold: true }), cell("未实现权限/角色", 2257)] }),
              new TableRow({ children: [cell("是否创建业务模块", 4513), cell("✅ 否", 2256, { color: "16a34a", bold: true }), cell("无 Jobs/Candidates 等", 2257)] }),
              new TableRow({ children: [cell("是否创建 AI 模块", 4513), cell("✅ 否", 2256, { color: "16a34a", bold: true }), cell("无 AI/自动决策", 2257)] }),
              new TableRow({ children: [cell("是否创建完整业务 Schema", 4513), cell("✅ 否", 2256, { color: "16a34a", bold: true }), cell("仅最小 User 表", 2257)] }),
              new TableRow({ children: [cell("是否接入 Moka", 4513), cell("✅ 否", 2256, { color: "16a34a", bold: true }), cell("零 API 调用", 2257)] }),
            ],
          }),

          // ========== 三、目录结构 ==========
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("三、目录结构")] }),
          new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "项目根目录: recruitment-dashboard/", font: "Courier New", size: 18 })] }),
          new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "app/", font: "Courier New", size: 18, bold: true })] }),
          new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: "  ├── api/health/route.ts", font: "Courier New", size: 18 })] }),
          new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: "  ├── globals.css          (Design Tokens)", font: "Courier New", size: 18 })] }),
          new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: "  ├── layout.tsx           (AppShell)", font: "Courier New", size: 18 })] }),
          new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "  └── page.tsx             (首页)", font: "Courier New", size: 18 })] }),
          new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "components/", font: "Courier New", size: 18, bold: true })] }),
          new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: "  ├── layout/              AppShell / Sidebar / Topbar", font: "Courier New", size: 18 })] }),
          new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "  └── ui/                  10 个 UI 组件", font: "Courier New", size: 18 })] }),
          new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "docs/                      7 个文档 + starter-pack (12 文件)", font: "Courier New", size: 18 })] }),
          new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "prisma/                    schema.prisma + seed.ts", font: "Courier New", size: 18 })] }),
          new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: "lib/ server/ styles/ public/", font: "Courier New", size: 18 })] }),

          // ========== 四、修改文件清单 ==========
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("四、修改文件清单")] }),
          new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Phase 0 为首个 Phase，无修改文件。", font: "Arial", size: 22, color: "64748b" })] }),

          // ========== 五、新增文件清单 ==========
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("五、新增文件清单")] }),
          new Table({
            width: { size: A4_WIDTH, type: WidthType.DXA },
            columnWidths: [3500, 1500, 4026],
            rows: [
              new TableRow({ children: [headerCell("文件", 3500), headerCell("类型", 1500), headerCell("说明", 4026)] }),
              ...[
                ["package.json", "配置", "recruitment-dashboard-v2, 含 dev/build/lint/typecheck"],
                ["tsconfig.json", "配置", "TypeScript strict mode"],
                ["next.config.ts", "配置", "Next.js 16 配置"],
                ["eslint.config.mjs", "配置", "ESLint 9 + next plugin"],
                ["postcss.config.mjs", "配置", "Tailwind CSS 4"],
                ["prisma.config.ts", "配置", "Prisma 7 数据源配置"],
                ["prisma/schema.prisma", "Schema", "最小 User 表（Phase 2 扩展）"],
                ["prisma/seed.ts", "Seed", "管理员用户 upsert"],
                [".env.example", "配置", "9 个环境变量模板"],
                [".gitignore", "配置", "含 .env / node_modules / .next"],
                ["app/layout.tsx", "布局", "RootLayout 包裹 AppShell"],
                ["app/page.tsx", "页面", "Phase 0 首页"],
                ["app/globals.css", "样式", "18 个 Design Token"],
                ["app/api/health/route.ts", "API", "GET /api/health"],
                ["components/layout/AppShell.tsx", "组件", "Sidebar + Topbar + Content"],
                ["components/layout/Sidebar.tsx", "组件", "240px 左侧导航"],
                ["components/layout/Topbar.tsx", "组件", "56px 顶部栏"],
                ["components/ui/MetricCard.tsx", "组件", "指标卡片"],
                ["components/ui/SectionCard.tsx", "组件", "分区卡片"],
                ["components/ui/StatusBadge.tsx", "组件", "状态徽章（4 色）"],
                ["components/ui/EmptyState.tsx", "组件", "空状态展示"],
                ["components/ui/ErrorState.tsx", "组件", "错误状态 + 重试"],
                ["components/ui/LoadingSkeleton.tsx", "组件", "加载骨架屏"],
                ["components/ui/PermissionDenied.tsx", "组件", "权限拒绝"],
                ["components/ui/DataTable.tsx", "骨架", "Phase 3+ 激活"],
                ["components/ui/DetailDrawer.tsx", "骨架", "Phase 3+ 激活"],
                ["components/ui/FormModal.tsx", "骨架", "Phase 3+ 激活"],
                ["lib/utils.ts", "工具", "cn / formatDate / formatNumber"],
                ["docs/ARCHITECTURE.md", "文档", "架构设计"],
                ["docs/SETUP.md", "文档", "环境搭建"],
                ["docs/ROLE_PERMISSIONS.md", "文档", "6 角色权限矩阵"],
                ["docs/MOKA_BOUNDARY.md", "文档", "Moka 边界"],
                ["docs/UI_GUIDELINES.md", "文档", "UI 规范"],
                ["docs/PHASE_ROADMAP.md", "文档", "Phase 0-13 路线"],
                ["docs/starter-pack/ (12 文件)", "文档", "完整启动资料包"],
                ["README.md", "文档", "项目说明"],
                ["MEMORY.md", "文档", "跨对话长期记忆"],
              ].map(([name, type, desc]) =>
                new TableRow({ children: [cell(name, 3500), cell(type, 1500), cell(desc, 4026)] })
              ),
            ],
          }),

          // ========== 六、技术栈确认 ==========
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("六、技术栈确认")] }),
          new Table({
            width: { size: A4_WIDTH, type: WidthType.DXA },
            columnWidths: [3000, 1500, 4526],
            rows: [
              new TableRow({ children: [headerCell("技术", 3000), headerCell("状态", 1500), headerCell("说明", 4526)] }),
              new TableRow({ children: [cell("Next.js App Router", 3000), cell("✅", 1500, { color: "16a34a", bold: true }), cell("v16.2.9, Turbopack", 4526)] }),
              new TableRow({ children: [cell("TypeScript", 3000), cell("✅", 1500, { color: "16a34a", bold: true }), cell("v5.9, strict mode", 4526)] }),
              new TableRow({ children: [cell("Tailwind CSS", 3000), cell("✅", 1500, { color: "16a34a", bold: true }), cell("v4, @theme inline", 4526)] }),
              new TableRow({ children: [cell("Prisma", 3000), cell("✅", 1500, { color: "16a34a", bold: true }), cell("v7.8, generate 成功", 4526)] }),
              new TableRow({ children: [cell("PostgreSQL 配置", 3000), cell("✅", 1500, { color: "16a34a", bold: true }), cell("prisma.config.ts 已配置", 4526)] }),
              new TableRow({ children: [cell("pnpm", 3000), cell("✅", 1500, { color: "16a34a", bold: true }), cell("v10.28, lockfile 就绪", 4526)] }),
              new TableRow({ children: [cell("Git", 3000), cell("✅", 1500, { color: "16a34a", bold: true }), cell("已 init/commit/tag", 4526)] }),
            ],
          }),

          // ========== 七、UI 验证 ==========
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("七、UI 验证")] }),
          new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("截图")] }),
          new Paragraph({
            spacing: { after: 200 },
            children: [new ImageRun({ type: "png", data: screenshot, transformation: { width: 500, height: 312 }, altText: { title: "首页截图", description: "Phase 0 首页完整截图", name: "homepage" } })],
          }),
          new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "首页完整截图（含 Sidebar + Topbar + 内容区）", font: "Arial", size: 18, color: "64748b", italics: true })] }),
          new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("UI 特征确认")] }),
          new Table({
            width: { size: A4_WIDTH, type: WidthType.DXA },
            columnWidths: [5513, 3513],
            rows: [
              new TableRow({ children: [headerCell("检查项", 5513), headerCell("结果", 3513)] }),
              new TableRow({ children: [cell("是否左侧 Sidebar", 5513), cell("✅ 240px 固定左侧", 3513, { color: "16a34a" })] }),
              new TableRow({ children: [cell("是否顶部 Topbar", 5513), cell("✅ 56px 固定顶部", 3513, { color: "16a34a" })] }),
              new TableRow({ children: [cell("是否浅灰背景", 5513), cell("✅ #f8fafc", 3513, { color: "16a34a" })] }),
              new TableRow({ children: [cell("是否白色卡片", 5513), cell("✅ #ffffff 圆角卡片", 3513, { color: "16a34a" })] }),
              new TableRow({ children: [cell("是否轻量 SaaS 风格", 5513), cell("✅ Linear/Notion 风格", 3513, { color: "16a34a" })] }),
              new TableRow({ children: [cell("是否没有大屏驾驶舱风", 5513), cell("✅ 无全屏图表/炫光", 3513, { color: "16a34a" })] }),
              new TableRow({ children: [cell("是否没有军事化文案", 5513), cell("✅ 无作战/指挥部等词汇", 3513, { color: "16a34a" })] }),
            ],
          }),

          // ========== 八、Design Token 清单 ==========
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("八、Design Token 清单")] }),
          new Table({
            width: { size: A4_WIDTH, type: WidthType.DXA },
            columnWidths: [3000, 2000, 4026],
            rows: [
              new TableRow({ children: [headerCell("Token", 3000), headerCell("值", 2000), headerCell("用途", 4026)] }),
              ...[
                ["--color-primary", "#2563eb", "主色"],
                ["--color-primary-hover", "#1d4ed8", "主色悬停"],
                ["--color-primary-light", "#dbeafe", "主色浅底"],
                ["--color-surface", "#ffffff", "卡片/容器背景"],
                ["--color-surface-secondary", "#f8fafc", "页面背景"],
                ["--color-surface-tertiary", "#f1f5f9", "次级背景"],
                ["--color-border", "#e2e8f0", "默认边框"],
                ["--color-border-strong", "#cbd5e1", "强调边框"],
                ["--color-text-primary", "#0f172a", "主文字"],
                ["--color-text-secondary", "#475569", "次要文字"],
                ["--color-text-tertiary", "#94a3b8", "辅助文字"],
                ["--color-success", "#16a34a", "成功绿"],
                ["--color-success-light", "#dcfce7", "成功浅底"],
                ["--color-warning", "#d97706", "警告橙"],
                ["--color-warning-light", "#fef3c7", "警告浅底"],
                ["--color-danger", "#dc2626", "危险红"],
                ["--color-danger-light", "#fee2e2", "危险浅底"],
                ["--sidebar-width", "240px", "侧边栏宽度"],
                ["--topbar-height", "56px", "顶部栏高度"],
              ].map(([tok, val, use]) =>
                new TableRow({ children: [cell(tok, 3000, { font: "Courier New" }), cell(val, 2000, { font: "Courier New" }), cell(use, 4026)] })
              ),
            ],
          }),
          new Paragraph({ spacing: { before: 80 }, children: [new TextRun({ text: "共 19 个 Token，后续业务页面禁止新增 hex。", font: "Arial", size: 20, color: "d97706", bold: true })] }),

          // ========== 九、UI 组件清单 ==========
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("九、UI 组件清单")] }),
          new Table({
            width: { size: A4_WIDTH, type: WidthType.DXA },
            columnWidths: [2500, 4000, 2526],
            rows: [
              new TableRow({ children: [headerCell("组件", 2500), headerCell("文件", 4000), headerCell("状态", 2526)] }),
              ...[
                ["AppShell", "components/layout/AppShell.tsx", "✅ 完成"],
                ["Sidebar", "components/layout/Sidebar.tsx", "✅ 完成"],
                ["Topbar", "components/layout/Topbar.tsx", "✅ 完成"],
                ["MetricCard", "components/ui/MetricCard.tsx", "✅ 完成"],
                ["SectionCard", "components/ui/SectionCard.tsx", "✅ 完成"],
                ["StatusBadge", "components/ui/StatusBadge.tsx", "✅ 完成"],
                ["EmptyState", "components/ui/EmptyState.tsx", "✅ 完成"],
                ["ErrorState", "components/ui/ErrorState.tsx", "✅ 完成"],
                ["LoadingSkeleton", "components/ui/LoadingSkeleton.tsx", "✅ 完成"],
                ["PermissionDenied", "components/ui/PermissionDenied.tsx", "✅ 完成"],
                ["DataTable", "components/ui/DataTable.tsx", "🔲 骨架 (Phase 3+)"],
                ["DetailDrawer", "components/ui/DetailDrawer.tsx", "🔲 骨架 (Phase 3+)"],
                ["FormModal", "components/ui/FormModal.tsx", "🔲 骨架 (Phase 3+)"],
              ].map(([name, file, status]) =>
                new TableRow({ children: [cell(name, 2500), cell(file, 4000, { font: "Courier New", size: 16 }), cell(status, 2526)] })
              ),
            ],
          }),

          // ========== 十、环境变量与安全 ==========
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("十、环境变量与安全")] }),
          new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(".env.example 内容")] }),
          new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "DATABASE_URL=", font: "Courier New", size: 18, color: "94a3b8" })] }),
          new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "OPENAI_API_KEY= / OPENAI_BASE_URL= / OPENAI_MODEL=", font: "Courier New", size: 18, color: "94a3b8" })] }),
          new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "DEEPSEEK_API_KEY= / DEEPSEEK_BASE_URL= / DEEPSEEK_MODEL=", font: "Courier New", size: 18, color: "94a3b8" })] }),
          new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "AI_PROVIDER= / AI_ENABLED=", font: "Courier New", size: 18, color: "94a3b8" })] }),
          new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "NEXT_PUBLIC_APP_NAME=Recruitment Dashboard v2", font: "Courier New", size: 18, color: "94a3b8" })] }),
          new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "AUTH_SECRET= / AUTH_URL=", font: "Courier New", size: 18, color: "94a3b8" })] }),
          new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("安全检查")] }),
          new Table({
            width: { size: A4_WIDTH, type: WidthType.DXA },
            columnWidths: [5513, 3513],
            rows: [
              new TableRow({ children: [headerCell("检查项", 5513), headerCell("结果", 3513)] }),
              checkCell("是否提交 .env", true, 5513, 3513),
              checkCell("是否提交 API Key", true, 5513, 3513),
              checkCell("是否提交真实数据库地址", true, 5513, 3513),
              checkCell("是否提交真实候选人数据", true, 5513, 3513),
              checkCell(".gitignore 是否包含 .env", true, 5513, 3513),
            ],
          }),

          // ========== 十一、构建验证 ==========
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("十一、构建验证")] }),
          new Table({
            width: { size: A4_WIDTH, type: WidthType.DXA },
            columnWidths: [2500, 2000, 4526],
            rows: [
              new TableRow({ children: [headerCell("命令", 2500), headerCell("结果", 2000), headerCell("说明", 4526)] }),
              new TableRow({ children: [cell("pnpm install", 2500, { font: "Courier New", size: 18 }), cell("✅ PASS", 2000, { color: "16a34a", bold: true }), cell("541 packages, 651ms", 4526)] }),
              new TableRow({ children: [cell("pnpm typecheck", 2500, { font: "Courier New", size: 18 }), cell("✅ PASS", 2000, { color: "16a34a", bold: true }), cell("tsc --noEmit, 0 errors", 4526)] }),
              new TableRow({ children: [cell("pnpm lint", 2500, { font: "Courier New", size: 18 }), cell("✅ PASS", 2000, { color: "16a34a", bold: true }), cell("ESLint, 0 errors 0 warnings", 4526)] }),
              new TableRow({ children: [cell("pnpm build", 2500, { font: "Courier New", size: 18 }), cell("✅ PASS", 2000, { color: "16a34a", bold: true }), cell("compiled in 2.5s, 3 routes", 4526)] }),
            ],
          }),

          // ========== 十二、Git 验证 ==========
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("十二、Git 验证")] }),
          new Table({
            width: { size: A4_WIDTH, type: WidthType.DXA },
            columnWidths: [4000, 5026],
            rows: [
              new TableRow({ children: [headerCell("检查项", 4000), headerCell("结果", 5026)] }),
              new TableRow({ children: [cell("是否 git init", 4000), cell("✅ 已初始化", 5026, { color: "16a34a" })] }),
              new TableRow({ children: [cell("是否 commit", 4000), cell("✅ 已提交", 5026, { color: "16a34a" })] }),
              new TableRow({ children: [cell("commit hash", 4000), cell("842d2b0", 5026, { font: "Courier New" })] }),
              new TableRow({ children: [cell("commit message", 4000), cell("phase-0: init foundation", 5026, { font: "Courier New" })] }),
              new TableRow({ children: [cell("是否 tag phase-0", 4000), cell("✅ 已创建", 5026, { color: "16a34a" })] }),
              new TableRow({ children: [cell("git status 是否干净", 4000), cell("✅ working tree clean", 5026, { color: "16a34a" })] }),
            ],
          }),

          // ========== 十三、边界检查 ==========
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("十三、边界检查")] }),
          new Table({
            width: { size: A4_WIDTH, type: WidthType.DXA },
            columnWidths: [4513, 4513],
            rows: [
              new TableRow({ children: [headerCell("检查项", 4513), headerCell("结果", 4513)] }),
              yesNoCell("是否替代 Moka", "否", 4513, 4513),
              yesNoCell("是否发 Offer", "否", 4513, 4513),
              yesNoCell("是否做 Offer 审批", "否", 4513, 4513),
              yesNoCell("是否做 AI 自动决策", "否", 4513, 4513),
              yesNoCell("是否自动录用/淘汰", "否", 4513, 4513),
              yesNoCell("是否真实业务数据", "否", 4513, 4513),
            ],
          }),

          // ========== 十四、已知问题 ==========
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("十四、已知问题")] }),
          new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "GitHub 远程仓库未配置：", bold: true }), new TextRun("GitHub OAuth Token 无 repo 创建权限（403），需手动创建 recruitment-dashboard-v2 仓库后配置 remote 并 push。")] }),
          new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: "DATABASE_URL 未填入：", bold: true }), new TextRun(".env 中 DATABASE_URL 为空，Phase 2 创建完整数据模型前需配置 Supabase 连接字符串。")] }),

          // ========== 十五、结论 ==========
          new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("十五、结论")] }),
          new Table({
            width: { size: A4_WIDTH, type: WidthType.DXA },
            columnWidths: [3500, 5526],
            rows: [
              new TableRow({ children: [cell("Phase 0 是否完成", 3500, { bold: true }), cell("✅ 是 — 所有验收项通过", 5526, { color: "16a34a", bold: true })] }),
              new TableRow({ children: [cell("是否建议进入 Phase 1", 3500, { bold: true }), cell("✅ 是 — 权限、角色与系统边界", 5526, { color: "16a34a", bold: true })] }),
              new TableRow({ children: [cell("需要外部审查的问题", 3500, { bold: true }), cell("1. GitHub 仓库创建与 remote 配置\n2. Sidebar 未来菜单项是否可接受\n3. UI 风格确认", 5526)] }),
            ],
          }),
          new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: "⚠️ 我不会自行进入 Phase 1。等待审查确认。", font: "Arial", size: 22, color: "d97706", bold: true, italics: true })] }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("docs/Phase0_自检报告.docx", buffer);
  console.log("✅ Word 文档已生成: docs/Phase0_自检报告.docx");
  console.log(`   文件大小: ${(buffer.length / 1024).toFixed(1)} KB`);
}

function cellRow(label, value) {
  return new TableRow({
    children: [
      cell(label, 3000, { bold: true }),
      cell(value, 6026),
    ],
  });
}

main().catch(console.error);
