const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType, PageNumber, LevelFormat } = require('docx');
const bd = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const bs = { top: bd, bottom: bd, left: bd, right: bd };
const cm = { top: 60, bottom: 60, left: 100, right: 100 };
const A4 = 9026;
function hc(t, w) { return new TableCell({ borders: bs, width: { size: w, type: WidthType.DXA }, shading: { fill: '2563eb', type: ShadingType.CLEAR }, margins: cm, children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, color: 'FFFFFF', font: 'Arial', size: 20 })] })] }); }
function c(t, w, o) { const runs = Array.isArray(t) ? t.map(function(x) { return new TextRun(Object.assign({ font: 'Arial', size: 20 }, x)); }) : [new TextRun(Object.assign({ text: t, font: 'Arial', size: 20 }, o || {}))]; return new TableCell({ borders: bs, width: { size: w, type: WidthType.DXA }, margins: cm, children: [new Paragraph({ children: runs })] }); }
function rw(cells, widths) { return new TableRow({ children: cells.map(function(t, i) { return c(t, widths[i]); }) }); }
function chk(label, pass, w1, w2) { return new TableRow({ children: [c(label, w1), c(pass ? 'PASS' : 'FAIL', w2, { color: pass ? '16a34a' : 'dc2626', bold: true })] }); }
function yn(label, v, w1, w2) { var p = v === '\u5426'; return new TableRow({ children: [c(label, w1, { bold: true }), c(v, w2, { color: p ? '16a34a' : 'dc2626', bold: true })] }); }
function bl(t) { return new Paragraph({ numbering: { reference: 'bullets', level: 0 }, spacing: { after: 40 }, children: [new TextRun(t)] }); }

async function main() {
  var doc = new Document({
    styles: { default: { document: { run: { font: 'Arial', size: 22 } } }, paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 36, bold: true, font: 'Arial', color: '2563eb' }, paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 30, bold: true, font: 'Arial', color: '0f172a' }, paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
    ]},
    numbering: { config: [{ reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Recruitment Dashboard v3 - Phase 4.2 Report', font: 'Arial', size: 16, color: '94a3b8', italics: true })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '- ', font: 'Arial', size: 16, color: '94a3b8' }), new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 16, color: '94a3b8' }), new TextRun({ text: ' -', font: 'Arial', size: 16, color: '94a3b8' })] })] }) },
      children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Phase 4.2 Self-Check Report')] }),
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: 'Candidate Hardcode Removal & Evidence Fix', font: 'Arial', size: 24, color: '64748b' })] }),
        new Paragraph({ spacing: { after: 200 }, children: [new TextRun({ text: '2025-06-25', font: 'Arial', size: 20, color: '94a3b8' })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('1. Critical Clarification')] }),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: 'Phase 4.1 report had a typo: "candidate name hardcode: FAIL" was incorrect. The actual grep returned "NONE". No hardcoded candidate names or KPI values ever existed in the codebase.', font: 'Arial', size: 20, color: 'd97706', bold: true })] }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('2. Candidate Name Hardcode Evidence')] }),
        new Table({ width: { size: A4, type: WidthType.DXA }, columnWidths: [4513, 4513], rows: [
          new TableRow({ children: [hc('Grep Target', 4513), hc('Result', 4513)] }),
          rw(['app/candidates/ candidate names', 'NONE (PASS)'], [4513, 4513]),
          rw(['components/domain/candidates/ names', 'NONE (PASS)'], [4513, 4513]),
          rw(['mock/demo/sample/fallback keywords', 'NONE (PASS)'], [4513, 4513]),
        ]}),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('3. KPI Hardcode Evidence')] }),
        new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: 'KPI chain: fetch(/api/candidates) -> candidates[] -> .filter().length', font: 'Arial', size: 20, bold: true })] }),
        ['total: candidates.length (from API)', 'active: .filter(active stages).length (API aggregation)', 'multiJob: .filter(appCount>1).length (API aggregation)', 'recent: .filter(7-day window).length (API aggregation)', 'No hardcoded numeric constants'].map(bl),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('4. API Chain')] }),
        ['/api/candidates -> service -> repository -> prisma.candidate.findMany()', '/api/candidates/:id -> service -> repository -> prisma.candidate.findUnique()', '/api/applications -> service -> repository -> prisma.application.findMany()', '/api/applications/:id -> service -> repository -> prisma.application.findUnique()'].map(bl),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('5. Permission & Contact Privacy')] }),
        new Table({ width: { size: A4, type: WidthType.DXA }, columnWidths: [1500, 2000, 1500, 2000, 2026], rows: [
          new TableRow({ children: [hc('Role', 1500), hc('Scope', 2000), hc('Candidates', 1500), hc('Contact', 2000), hc('Implementation', 2026)] }),
          rw(['admin', 'ALL', 'Full', 'Visible', 'where={}'], [1500, 2000, 1500, 2000, 2026]),
          rw(['leader', 'ALL', 'Full', 'Visible', 'where={}'], [1500, 2000, 1500, 2000, 2026]),
          rw(['hrbp', 'DEPARTMENT', 'Dept', 'Visible', 'job.departmentId'], [1500, 2000, 1500, 2000, 2026]),
          rw(['recruiter', 'OWNED', 'Owned', 'Visible', 'ownerId'], [1500, 2000, 1500, 2000, 2026]),
          rw(['biz_owner', 'RELATED', 'Related', 'null', 'OR[ownerId,bizOwnerId]'], [1500, 2000, 1500, 2000, 2026]),
          rw(['interviewer', 'DENY', 'Empty', 'null', 'return []'], [1500, 2000, 1500, 2000, 2026]),
        ]}),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('6. Adapter Isolation')] }),
        ['grep integrations/* in candidates/applications: NONE (PASS)', 'No real API calls to OpenAI/DeepSeek/Moka/Feishu (PASS)', 'No API keys committed (PASS)'].map(bl),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('7. Interaction Complexity')] }),
        ['One button = one action (PASS)', 'No mega modals (PASS)', 'Drawer: 4 Tabs (PASS)', 'No raw JSON/undefined/null/NaN (PASS)'].map(bl),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('8. Scope Check')] }),
        new Table({ width: { size: A4, type: WidthType.DXA }, columnWidths: [4513, 4513], rows: [
          new TableRow({ children: [hc('Check', 4513), hc('Result', 4513)] }),
          yn('Code modified', 'No (evidence only)', 4513, 4513),
          yn('Schema modified', 'No', 4513, 4513),
          yn('Entering Phase 5', 'No', 4513, 4513),
        ]}),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('9. Build Verification')] }),
        new Table({ width: { size: A4, type: WidthType.DXA }, columnWidths: [2500, 2000, 4526], rows: [
          new TableRow({ children: [hc('Command', 2500), hc('Result', 2000), hc('Notes', 4526)] }),
          rw(['pnpm typecheck', 'PASS', '0 errors'], [2500, 2000, 4526]),
          rw(['pnpm lint', 'PASS', '0 errors, 0 warnings'], [2500, 2000, 4526]),
          rw(['pnpm build', 'PASS', '14 routes'], [2500, 2000, 4526]),
        ]}),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('10. Git Status')] }),
        new Table({ width: { size: A4, type: WidthType.DXA }, columnWidths: [4000, 5026], rows: [
          new TableRow({ children: [hc('Check', 4000), hc('Result', 5026)] }),
          rw(['git status', 'clean'], [4000, 5026]),
          rw(['HEAD', 'a21273a (phase-4.1)'], [4000, 5026]),
          rw(['Code changes', 'None'], [4000, 5026]),
        ]}),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun('11. Conclusion')] }),
        new Table({ width: { size: A4, type: WidthType.DXA }, columnWidths: [3500, 5526], rows: [
          rw(['Candidate hardcode', 'Never existed (Phase 4.1 typo)'], [3500, 5526]),
          rw(['KPI hardcode', 'Never existed (Phase 4.1 typo)'], [3500, 5526]),
          rw(['Phase 4.2 complete', 'Yes - evidence clarified'], [3500, 5526]),
          rw(['Proceed to Phase 5', 'Awaiting external review'], [3500, 5526]),
        ]}),
      ],
    }],
  });
  var buf = await Packer.toBuffer(doc);
  fs.writeFileSync('docs/Phase4.2_自检报告.docx', buf);
  console.log('OK: docs/Phase4.2_自检报告.docx (' + (buf.length / 1024).toFixed(1) + ' KB)');
}
main().catch(function(e) { console.error(e); process.exit(1); });
