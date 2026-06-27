const fs = require('fs');

const pages = [
  { path: 'app/dashboard/page.tsx', objectType: 'dashboard', objectIdVar: '""' },
  { path: 'app/jobs/page.tsx', objectType: 'job', objectIdVar: 'selectedJobId || ""' },
  { path: 'app/candidates/page.tsx', objectType: 'candidate', objectIdVar: 'selectedId || ""' },
  { path: 'app/interview-quality/page.tsx', objectType: 'interview_quality', objectIdVar: '""' },
  { path: 'app/offer-risks/page.tsx', objectType: 'offer_risk', objectIdVar: 'selectedId || ""' },
  { path: 'app/actions/page.tsx', objectType: 'action', objectIdVar: '""' },
];

for (const page of pages) {
  let content = fs.readFileSync(page.path, 'utf8');
  if (content.includes('AICopilotPanel')) { console.log('SKIP', page.path); continue; }

  // Add AI import after last import
  const lines = content.split('\n');
  let lastImportIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ') && !lines[i].includes('"use client"')) lastImportIdx = i;
  }
  if (lastImportIdx >= 0) {
    lines.splice(lastImportIdx + 1, 0, `import { AICopilotPanel } from "@/components/domain/ai/AICopilotPanel";`);
    content = lines.join('\n');
  }

  // Add state variable at start of function (before first useState)
  content = content.replace(
    /(function \w+Page[^{]*\{)/,
    '$1\n  const [_aiOpen, _setAiOpen] = useState(false);'
  );

  // Add AI button + panel before last ProductShell close
  const lastIdx = content.lastIndexOf('</ProductShell>');
  if (lastIdx > 0) {
    const aiBlock = `
      <button onClick={() => _setAiOpen(true)} className="fixed bottom-4 right-4 z-40 rounded-full bg-[var(--color-primary)] text-white px-4 py-2 shadow-lg text-sm font-medium hover:opacity-90 transition-opacity">AI 助手</button>
      {_aiOpen && <AICopilotPanel objectType="${page.objectType}" objectId={${page.objectIdVar}} onClose={() => _setAiOpen(false)} />}
`;
    content = content.slice(0, lastIdx) + aiBlock + content.slice(lastIdx);
  }

  fs.writeFileSync(page.path, content);
  console.log('PATCHED', page.path);
}
console.log('Done');
