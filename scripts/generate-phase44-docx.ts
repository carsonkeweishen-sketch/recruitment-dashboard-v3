// Phase 4.4 Word Report Generator
import * as fs from "fs";
import * as path from "path";
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, HeadingLevel, ImageRun,
  TableLayoutType, ShadingType,
} from "docx";

const SCREENSHOT_DIR = path.resolve(__dirname, "../screenshots/phase-4.4");
const OUTPUT = path.resolve(__dirname, "../docs/Phase4.4_自检报告.docx");

const colors = {
  pass: "1B7F3B",    // green
  fail: "C41E3A",    // red
  warn: "D4A017",    // amber
  text: "1A1A1A",
  muted: "6B7280",
  border: "E5E7EB",
  headerBg: "F3F4F6",
};

function headerCell(text: string, width?: number): TableCell {
  return new TableCell({
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    shading: { type: ShadingType.SOLID, color: colors.headerBg },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 18, color: colors.text })] })],
  });
}

function cell(text: string, opts?: { bold?: boolean; color?: string; width?: number }): TableCell {
  return new TableCell({
    width: opts?.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    children: [new Paragraph({ children: [new TextRun({ text, bold: opts?.bold, size: 18, color: opts?.color ?? colors.text })] })],
  });
}

function resultCell(pass: boolean): TableCell {
  return cell(pass ? "✅ PASS" : "❌ FAIL", { bold: true, color: pass ? colors.pass : colors.fail, width: 1200 });
}

function section(title: string): Paragraph {
  return new Paragraph({
    spacing: { before: 360, after: 120 },
    children: [new TextRun({ text: title, bold: true, size: 26, color: colors.text })],
  });
}

function body(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 20, color: colors.text })],
  });
}

function makeTable(headers: string[], rows: TableCell[][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({ children: headers.map((h, i) => headerCell(h, i === 0 ? 3000 : undefined)) }),
      ...rows.map((r) => new TableRow({ children: r })),
    ],
  });
}

async function main() {
  const screenshots = fs.readdirSync(SCREENSHOT_DIR).filter((f) => f.endsWith(".png"));

  const children: any[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: "Recruitment Dashboard v3 — Phase 4.4 自检报告", bold: true, size: 32, color: colors.text })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: "候选人证据包最终收口 (Candidate Evidence Pack Final Gate)", size: 22, color: colors.muted })],
    }),
    body("Agent: WorkBuddy | Branch: agent/workbuddy/phase-4.4 | 日期: 2026-06-25"),

    section("一、Evidence Files Delivered"),
    body("以下文件已全部落盘并提交 Git："),
    ...([
      "docs/self-checks/phase-4.4-report.md",
      "docs/self-checks/phase-4.4-commands.log",
      "docs/self-checks/phase-4.4-api-responses.md",
    ].map((f) => body(`  📄 ${f}`))),
    ...(screenshots.map((s) => body(`  📸 screenshots/phase-4.4/${s}`))),

    section("二、Hardcode 检查"),
    makeTable(
      ["检查项", "grep 命令", "结果"],
      [
        [cell("候选人姓名硬编码"), cell("grep -Rn 林可|周亦然|..."), resultCell(true)],
        [cell("Mock/Fallback 数组"), cell("grep -Rn demoCandidates|..."), resultCell(true)],
        [cell("硬编码 KPI 数字"), cell("grep -Rn totalCandidates = [0-9]"), resultCell(true)],
        [cell("Adapter 隔离"), cell("grep -Rn integrations/openai|..."), resultCell(true)],
        [cell("console.log 残留"), cell("grep -Rn console.log"), resultCell(true)],
      ]
    ),
    body("原始 grep 输出见 phase-4.4-commands.log。所有检查均 0 匹配。"),

    section("三、六角色权限验证（真实数字）"),
    makeTable(
      ["角色", "Scope", "候选人数量", "投递数量", "邮箱", "手机", "结论"],
      [
        [cell("admin"), cell("ALL"), cell("8"), cell("8"), cell("visible"), cell("visible"), resultCell(true)],
        [cell("leader"), cell("ALL"), cell("8"), cell("8"), cell("visible"), cell("visible"), resultCell(true)],
        [cell("hrbp"), cell("DEPARTMENT"), cell("0*"), cell("0*"), cell("visible*"), cell("visible*"), cell("⚠️ 注意")],
        [cell("recruiter"), cell("OWNED"), cell("8"), cell("8"), cell("visible"), cell("visible"), resultCell(true)],
        [cell("business_owner"), cell("RELATED"), cell("3"), cell("3"), cell("null"), cell("null"), resultCell(true)],
        [cell("interviewer"), cell("RELATED"), cell("5"), cell("5"), cell("null"), cell("null"), resultCell(true)],
      ]
    ),
    body("* hrbp: 张HRBP 属于「人力资源部」，seed 数据中无 Job 挂在该部门下，DEPARTMENT scope 正确返回 0。"),
    body("权限过滤在服务端（candidate-repository.ts Prisma where），非前端全量后过滤。"),

    section("四、联系方式隐私"),
    body("代码位置: app/api/candidates/[id]/route.ts 第 18 行"),
    body("  const showContact = scope === 'ALL' || scope === 'DEPARTMENT' || scope === 'OWNED';"),
    body("前端展示: F 组件 permissionRequired 模式下 null → '无权限查看'"),
    makeTable(
      ["角色", "邮箱可见", "手机可见", "UI 显示"],
      [
        [cell("admin"), cell("✅"), cell("✅"), cell("正常显示")],
        [cell("leader"), cell("✅"), cell("✅"), cell("正常显示")],
        [cell("recruiter"), cell("✅"), cell("✅"), cell("正常显示")],
        [cell("business_owner"), cell("❌"), cell("❌"), cell("无权限查看")],
        [cell("interviewer"), cell("❌"), cell("❌"), cell("无权限查看")],
      ]
    ),

    section("五、KPI Chain"),
    body("候选人总数 = candidates.length（API 返回数组长度）"),
    body("推进中 = filter(!['hired','rejected','withdrawn','closed'].includes(stage)).length"),
    body("多岗位 = filter(applicationCount > 1).length"),
    body("近7天新增 = filter(createdAt >= weekAgo).length"),
    body("✅ 前端基于服务端已权限过滤后的 API 数据做轻量统计"),
    body("✅ 无 mock candidate list，无硬编码 KPI"),

    section("六、Adapter 隔离"),
    body("✅ 不真实调用 OpenAI / DeepSeek / Moka / 飞书"),
    body("✅ 未提交任何 API Key"),
    body("✅ candidates/applications 模块不直接依赖外部 adapter"),

    section("七、交互复杂度"),
    makeTable(
      ["检查项", "结论"],
      [
        [cell("一个按钮只做一个动作"), resultCell(true)],
        [cell("无超大弹窗"), resultCell(true)],
        [cell("Drawer 只展示一个候选人"), resultCell(true)],
        [cell("不提前塞入 Phase 5/6/9/10 内容"), resultCell(true)],
        [cell("无 raw JSON 暴露"), resultCell(true)],
        [cell("无 undefined/NaN/Invalid Date"), resultCell(true)],
      ]
    ),

    section("八、构建验证"),
    makeTable(
      ["检查", "命令", "结果"],
      [
        [cell("TypeScript"), cell("pnpm typecheck"), resultCell(true)],
        [cell("ESLint"), cell("pnpm lint"), resultCell(true)],
        [cell("Build"), cell("pnpm build"), resultCell(true)],
      ]
    ),

    section("九、代码修复"),
    body("修复 1: 联系方式权限 UI 显示"),
    body("  文件: components/domain/candidates/CandidateDetailDrawer.tsx"),
    body("  变更: F 组件新增 permissionRequired 属性。当权限导致的 null 值时显示「无权限查看」"),
    body("  影响: 仅 UI 层，向后兼容。"),

    section("十、截图证据"),
  ];

  // Embed screenshots
  for (const s of screenshots) {
    const imgPath = path.join(SCREENSHOT_DIR, s);
    const imgBuf = fs.readFileSync(imgPath);
    children.push(
      body(`📸 ${s}`),
      new Paragraph({
        children: [new ImageRun({ data: imgBuf, transformation: { width: 550, height: 350 } })],
        spacing: { after: 200 },
      })
    );
  }

  children.push(
    section("十一、最终结论"),
    makeTable(
      ["项目", "状态"],
      [
        [cell("Phase 4.4 是否完成"), cell("是", { bold: true, color: colors.pass })],
        [cell("是否建议进入 Phase 5"), cell("等待外部审查")],
        [cell("是否自行进入 Phase 5"), cell("否")],
        [cell("当前风险"), cell("hrbp DEPARTMENT scope 返回 0（seed 数据约束）；详情页缺少资源级 scope 检查")],
        [cell("需要外部确认"), cell("1) Evidence Pack 完整性 2) hrbp=0 可接受 3) 联系方式显示「无权限查看」满足需求")],
      ]
    )
  );

  const doc = new Document({ sections: [{ children }] });
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT, buffer);
  console.log(`Word report generated: ${OUTPUT} (${buffer.length} bytes)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
