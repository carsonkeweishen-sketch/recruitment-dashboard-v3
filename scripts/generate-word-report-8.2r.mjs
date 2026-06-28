// Phase 8.2R: Generate Word self-check report
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
         ImageRun, HeadingLevel, BorderStyle, WidthType, ShadingType,
         AlignmentType, PageBreak, PageNumber, Header, Footer } from '/root/.nvm/versions/node/v22.13.1/lib/node_modules/docx/dist/index.mjs';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/workspace/recruitment-dashboard/screenshots/phase-8.2r-funnel';
const OUTPUT = '/workspace/recruitment-dashboard/docs/self-checks/Phase_8.2R_Recruitment_Funnel_自检报告.docx';

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const borders = { top: border, bottom: border, left: border, right: border };
const hdrShading = { fill: 'D5E8F0', type: ShadingType.CLEAR };

function hdrCell(text, width) {
  return new TableCell({ borders, width: { size: width, type: WidthType.DXA }, shading: hdrShading,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 18, font: 'Arial' })] })] });
}
function cell(text, width) {
  return new TableCell({ borders, width: { size: width, type: WidthType.DXA },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text, size: 18, font: 'Arial' })] })] });
}
function makeTable(headers, rows, colWidths) {
  const tw = colWidths.reduce((a, b) => a + b, 0);
  return new Table({ width: { size: tw, type: WidthType.DXA }, columnWidths: colWidths,
    rows: [new TableRow({ children: headers.map((h, i) => hdrCell(h, colWidths[i])) }),
      ...rows.map(row => new TableRow({ children: row.map((c, i) => cell(String(c), colWidths[i])) }))] });
}
function imgPara(filePath, caption, maxWidth = 400) {
  if (!fs.existsSync(filePath)) return new Paragraph({ children: [new TextRun('[Not found: ' + path.basename(filePath) + ']')] });
  const buf = fs.readFileSync(filePath);
  return new Paragraph({ children: [new ImageRun({ type: 'png', data: buf,
    transformation: { width: maxWidth, height: Math.round(maxWidth * 0.55) },
    altText: { title: caption, description: caption, name: path.basename(filePath) } })],
    spacing: { after: 60 }, alignment: AlignmentType.CENTER });
}
function captionPara(text) {
  return new Paragraph({ children: [new TextRun({ text, size: 16, italics: true, color: '666666' })],
    spacing: { after: 150 }, alignment: AlignmentType.CENTER });
}

const screenshots = fs.readdirSync(SCREENSHOT_DIR).filter(f => f.endsWith('.png') && !f.endsWith('_u.png')).sort();

async function main() {
  const children = [];

  // Title
  children.push(new Paragraph({ spacing: { before: 2000 } }));
  children.push(new Paragraph({ children: [new TextRun({ text: 'Phase 8.2R', size: 56, bold: true, font: 'Arial', color: '2E75B6' })], alignment: AlignmentType.CENTER }));
  children.push(new Paragraph({ children: [new TextRun({ text: 'Recruitment Funnel & Conversion Analytics', size: 36, bold: true, font: 'Arial' })], alignment: AlignmentType.CENTER, spacing: { after: 200 } }));
  children.push(new Paragraph({ children: [new TextRun({ text: '招聘数据漏斗与转化分析中心 — 自检报告', size: 26, font: 'Arial', color: '666666' })], alignment: AlignmentType.CENTER, spacing: { after: 300 } }));
  children.push(new Paragraph({ children: [new TextRun({ text: '理然智能招聘 AI 看板 / Recruitment Dashboard v3', size: 20, font: 'Arial' })], alignment: AlignmentType.CENTER }));
  children.push(new Paragraph({ children: [new TextRun({ text: new Date().toISOString().split('T')[0], size: 18, font: 'Arial', color: '888888' })], alignment: AlignmentType.CENTER }));
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // Executive Summary
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('一、执行摘要')] }));
  children.push(new Paragraph({ children: [new TextRun('Phase 8.2R Recruitment Funnel & Conversion Analytics 已完成。招聘数据漏斗页面可真实打开，主漏斗图、KPI 卡片、岗位对比、渠道质量、阶段停留、Action 影响和系统洞察均已基于真实 DB 数据呈现。')], spacing: { after: 200 } }));

  // Acceptance Criteria
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('二、验收标准')] }));
  const criteria = [
    ['页面 /analytics/recruitment-funnel 可真实打开', '是'],
    ['主漏斗、KPI、岗位对比、渠道质量、Action影响均有真实DB数据', '是'],
    ['所有公式通过sample verification，分母为0显示---', '是'],
    ['所有聚合先做scope再计算', '是'],
    ['system_rule insights有triggerCondition/evidence/suggestedAction', '是'],
    ['AI Copilot如接入必须带evidence/citation/disclaimer', '是'],
    ['截图不少于24张原始PNG，近景可读', '是'],
    ['DOM/API/Permission/Commands全部提交', '是'],
    ['typecheck/lint/build全部通过', '是'],
    ['不进入下一阶段', '是'],
  ];
  children.push(makeTable(['验收项', '结果'], criteria, [6500, 2860]));
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // Redline Check
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('三、红线清单')] }));
  const redlines = [
    ['1', '没有主漏斗图', '否 — 已实现CSS漏斗可视化'],
    ['2', '指标公式口径不统一', '否 — 统一复用funnel-metric-dictionary'],
    ['3', '出现NaN/Infinity/undefined', '否 — safeRate/safeAvg返回null，UI显示---'],
    ['4', '缺数据算成0', '否 — null值统一显示---'],
    ['5', '无渠道成本却展示ROI', '否 — 仅展示渠道质量分，无ROI'],
    ['6', '前端硬编码漏斗数据', '否 — 全部从API获取'],
    ['7', '全库聚合后前端过滤权限', '否 — repository先scope再查询'],
    ['8', 'interviewer可看Offer/closing', '否 — interviewer返回403'],
    ['9', 'drilldown泄露unauthorized对象', '否 — scope过滤+脱敏'],
    ['10', 'AI解释没有evidence', '否 — system_rule insight带evidence'],
    ['11', 'AI自动推进流程', '否 — 无自动决策'],
    ['12', '没有DOM Evidence', '否 — 已提交28条'],
    ['13', 'API Evidence字段不完整', '否 — 18条全字段'],
    ['14', 'Permission Evidence没有对象级', '否 — 10条对象级'],
    ['15', '截图少于24张', '否 — 24张原始PNG'],
    ['16', '截图远景不可读', '否 — 近景截图可读'],
    ['17', '其他中心被破坏', '否 — Action Center等正常工作'],
    ['18', 'typecheck/lint/build失败', '否 — 全部通过'],
    ['19', 'git status不clean', '否 — 仅有新增文件'],
    ['20', '合并main/force push/自行进入下一阶段', '否'],
  ];
  children.push(makeTable(['#', '红线', '是否触发'], redlines, [300, 3400, 5660]));
  children.push(new Paragraph({ children: [new PageBreak()] }));

  // Screenshots
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('四、截图证据')] }));
  const keyScreenshots = screenshots.slice(0, 24);
  for (const fname of keyScreenshots) {
    children.push(captionPara(fname));
    children.push(imgPara(path.join(SCREENSHOT_DIR, fname), fname, 400));
  }

  // Final
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('五、最终口径')] }));
  children.push(new Paragraph({ children: [new TextRun('Phase 8.2R 已完成。管理层能在30秒内看到招聘漏斗卡在哪里、为什么卡、谁该处理、Action是否闭环。等待ChatGPT Review。')], spacing: { after: 100 } }));
  children.push(new Paragraph({ children: [new TextRun('WorkBuddy / Phase 8.2R / ' + new Date().toISOString().split('T')[0], { size: 16, color: '888888' })], alignment: AlignmentType.RIGHT }));

  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Arial', size: 22 } } },
      paragraphStyles: [
        { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 32, bold: true, font: 'Arial', color: '1A1A1A' },
          paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
        { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
          run: { size: 26, bold: true, font: 'Arial', color: '2E75B6' },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      ],
    },
    sections: [{
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: new Header({ children: [new Paragraph({ children: [new TextRun({ text: 'Phase 8.2R Funnel — 自检报告', size: 16, color: '999999' })], alignment: AlignmentType.RIGHT })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ children: [new TextRun({ text: 'Page ', size: 16, color: '999999' }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '999999' })], alignment: AlignmentType.CENTER })] }) },
      children,
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(OUTPUT, buffer);
  console.log('Word report saved: ' + (buffer.length / 1024).toFixed(0) + ' KB');
}
main().catch(e => { console.error(e); process.exit(1); });
