var fs = require("fs");
var d = require("docx");
var WT = d.WidthType;
var bd = { style: d.BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
var bs = { top: bd, bottom: bd, left: bd, right: bd };
var cm = { top: 60, bottom: 60, left: 100, right: 100 };
var A4 = 9026;
function hc(t, w) { return new d.TableCell({ borders: bs, width: { size: w, type: WT.DXA }, shading: { fill: "2563eb", type: d.ShadingType.CLEAR }, margins: cm, children: [new d.Paragraph({ children: [new d.TextRun({ text: t, bold: true, color: "FFFFFF", font: "Arial", size: 20 })] })] }); }
function c(t, w, o) { var opts = (typeof o === "object" && o !== null) ? o : {}; var runs = Array.isArray(t) ? t.map(function(x) { return new d.TextRun(Object.assign({ font: "Arial", size: 20 }, x)); }) : [new d.TextRun(Object.assign({ text: t, font: "Arial", size: 20 }, opts))]; return new d.TableCell({ borders: bs, width: { size: w, type: WT.DXA }, margins: cm, children: [new d.Paragraph({ children: runs })] }); }
function rw(cells, widths) { return new d.TableRow({ children: cells.map(function(t, i) { return c(t, widths[i]); }) }); }
function yn(label, v, w1, w2) { var p = v === "No"; return new d.TableRow({ children: [c(label, w1, { bold: true }), c(v, w2, { color: p ? "16a34a" : "dc2626", bold: true })] }); }
function bl(t) { return new d.Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 40 }, children: [new d.TextRun(t)] }); }

async function main() {
  var doc = new d.Document({
    styles: { default: { document: { run: { font: "Arial", size: 22 } } }, paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 36, bold: true, font: "Arial", color: "2563eb" }, paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 30, bold: true, font: "Arial", color: "0f172a" }, paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
    ]},
    numbering: { config: [{ reference: "bullets", levels: [{ level: 0, format: d.LevelFormat.BULLET, text: "\u2022", alignment: d.AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }] },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: new d.Header({ children: [new d.Paragraph({ alignment: d.AlignmentType.RIGHT, children: [new d.TextRun({ text: "RD v3 - Phase 4.2.1 Report", font: "Arial", size: 16, color: "94a3b8", italics: true })] })] }) },
      footers: { default: new d.Footer({ children: [new d.Paragraph({ alignment: d.AlignmentType.CENTER, children: [new d.TextRun({ text: "- ", font: "Arial", size: 16, color: "94a3b8" }), new d.TextRun({ children: [d.PageNumber.CURRENT], font: "Arial", size: 16, color: "94a3b8" }), new d.TextRun({ text: " -", font: "Arial", size: 16, color: "94a3b8" })] })] }) },
      children: [
        new d.Paragraph({ heading: d.HeadingLevel.HEADING_1, children: [new d.TextRun("Phase 4.2.1 Report")] }),
        new d.Paragraph({ spacing: { after: 200 }, children: [new d.TextRun({ text: "Candidate Evidence Completion - 2025-06-25", font: "Arial", size: 20, color: "94a3b8" })] }),

        new d.Paragraph({ heading: d.HeadingLevel.HEADING_2, children: [new d.TextRun("1. Phase Info")] }),
        new d.Table({ width: { size: A4, type: d.WidthType.DXA }, columnWidths: [3000, 6026], rows: [
          rw(["Phase", "4.2.1 - Evidence Completion"], [3000, 6026]),
          rw(["Directory", "/workspace/recruitment-dashboard"], [3000, 6026]),
          rw(["Branch", "main"], [3000, 6026]),
          rw(["Code modified", "No (evidence only)"], [3000, 6026]),
          rw(["Commit created", "No (no code changes)"], [3000, 6026]),
          rw(["HEAD", "54cc7d2 (phase-4.2)"], [3000, 6026]),
        ]}),

        new d.Paragraph({ heading: d.HeadingLevel.HEADING_2, children: [new d.TextRun("2. Grep Evidence")] }),
        ["GREP 1 (candidate names in frontend): (empty - PASS)", "GREP 2 (mock/sample/fallback arrays): (empty - PASS)", "GREP 3 (hardcoded KPI numbers): (empty - PASS)"].map(bl),
        new d.Paragraph({ spacing: { before: 60 }, children: [new d.TextRun({ text: "All three grep commands returned empty output, confirming zero hardcoded data in frontend components.", font: "Arial", size: 20, color: "16a34a" })] }),

        new d.Paragraph({ heading: d.HeadingLevel.HEADING_2, children: [new d.TextRun("3. Adapter Isolation")] }),
        ["grep integrations/* in candidates/applications code: (empty - PASS)", "No real OpenAI/DeepSeek/Moka/Feishu calls", "No API keys committed"].map(bl),

        new d.Paragraph({ heading: d.HeadingLevel.HEADING_2, children: [new d.TextRun("4. Permission Filtering (Server-Side Code)")] }),
        ["DENY -> return []", "DEPARTMENT -> where.applications.some.job.departmentId", "OWNED -> where.applications.some.ownerId", "RELATED -> where.applications.some.OR[ownerId, businessOwnerId]", "Contact: showContact = scope===ALL||DEPARTMENT||OWNED; email/phone = showContact ? value : null"].map(bl),

        new d.Paragraph({ heading: d.HeadingLevel.HEADING_2, children: [new d.TextRun("5. Role Permission Counts")] }),
        new d.Table({ width: { size: A4, type: d.WidthType.DXA }, columnWidths: [1500, 2000, 1200, 1200, 1500, 1626], rows: [
          new d.TableRow({ children: [hc("Role", 1500), hc("Scope", 2000), hc("Cand.", 1200), hc("Apps", 1200), hc("Contact", 1500), hc("Verdict", 1626)] }),
          rw(["admin", "ALL", "8", "8", "Visible", "PASS"], [1500, 2000, 1200, 1200, 1500, 1626]),
          rw(["leader", "ALL", "8", "8", "Visible", "PASS"], [1500, 2000, 1200, 1200, 1500, 1626]),
          rw(["hrbp", "DEPARTMENT", "Dept", "Dept", "Visible", "PASS"], [1500, 2000, 1200, 1200, 1500, 1626]),
          rw(["recruiter", "OWNED", "Owned", "Owned", "Visible", "PASS"], [1500, 2000, 1200, 1200, 1500, 1626]),
          rw(["biz_owner", "RELATED", "Related", "Related", "null", "PASS"], [1500, 2000, 1200, 1200, 1500, 1626]),
          rw(["interviewer", "DENY", "0", "0", "null", "PASS"], [1500, 2000, 1200, 1200, 1500, 1626]),
        ]}),

        new d.Paragraph({ heading: d.HeadingLevel.HEADING_2, children: [new d.TextRun("6. KPI Chain")] }),
        ["API filters by scope (server-side)", "Frontend receives only authorized subset", "KPIs computed from authorized data: .length, .filter()", "No hardcoded numbers", "Server-side metrics planned for Phase 5/11"].map(bl),

        new d.Paragraph({ heading: d.HeadingLevel.HEADING_2, children: [new d.TextRun("7. Interaction")] }),
        ["One button = one action", "Drawer: 4 Tabs", "No mega modals", "No Phase 5/6/9/10 pre-load", "No raw JSON/undefined/null/NaN"].map(bl),

        new d.Paragraph({ heading: d.HeadingLevel.HEADING_2, children: [new d.TextRun("8. Scope")] }),
        new d.Table({ width: { size: A4, type: d.WidthType.DXA }, columnWidths: [4513, 4513], rows: [
          new d.TableRow({ children: [hc("Check", 4513), hc("Result", 4513)] }),
          yn("Code modified", "No", 4513, 4513), yn("Schema modified", "No", 4513, 4513), yn("Entering Phase 5", "No", 4513, 4513),
          yn("AI/Moka/Feishu called", "No", 4513, 4513), yn("API Key committed", "No", 4513, 4513),
        ]}),

        new d.Paragraph({ heading: d.HeadingLevel.HEADING_2, children: [new d.TextRun("9. Build")] }),
        new d.Table({ width: { size: A4, type: d.WidthType.DXA }, columnWidths: [2500, 2000, 4526], rows: [
          new d.TableRow({ children: [hc("Command", 2500), hc("Result", 2000), hc("Notes", 4526)] }),
          rw(["typecheck", "PASS", "0 errors"], [2500, 2000, 4526]),
          rw(["lint", "PASS", "0 errors, 0 warnings"], [2500, 2000, 4526]),
          rw(["build", "PASS", "14 routes"], [2500, 2000, 4526]),
        ]}),

        new d.Paragraph({ heading: d.HeadingLevel.HEADING_2, children: [new d.TextRun("10. Git")] }),
        new d.Table({ width: { size: A4, type: d.WidthType.DXA }, columnWidths: [4000, 5026], rows: [
          new d.TableRow({ children: [hc("Check", 4000), hc("Result", 5026)] }),
          rw(["git status", "clean"], [4000, 5026]),
          rw(["HEAD", "54cc7d2"], [4000, 5026]),
        ]}),

        new d.Paragraph({ heading: d.HeadingLevel.HEADING_2, children: [new d.TextRun("11. Conclusion")] }),
        new d.Table({ width: { size: A4, type: d.WidthType.DXA }, columnWidths: [3500, 5526], rows: [
          rw(["Phase 4.2.1", "Complete - evidence provided"], [3500, 5526]),
          rw(["Phase 5", "Awaiting external review"], [3500, 5526]),
        ]}),
      ],
    }],
  });
  var buf = await d.Packer.toBuffer(doc);
  fs.writeFileSync("docs/Phase4.2.1_自检报告.docx", buf);
  console.log("OK: " + (buf.length / 1024).toFixed(1) + " KB");
}
main().catch(function(e) { console.error(e); process.exit(1); });
