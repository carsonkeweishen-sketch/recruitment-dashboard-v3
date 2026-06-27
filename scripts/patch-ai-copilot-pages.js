const fs = require('fs');

const pages = [
  { path: 'app/dashboard/page.tsx', objectType: 'dashboard', objectIdGetter: '""' },
  { path: 'app/jobs/page.tsx', objectType: 'job', objectIdGetter: 'selectedJobId || ""' },
  { path: 'app/candidates/page.tsx', objectType: 'candidate', objectIdGetter: 'selectedCandidateId || ""' },
  { path: 'app/interview-quality/page.tsx', objectType: 'interview_quality', objectIdGetter: '""' },
  { path: 'app/offer-risks/page.tsx', objectType: 'offer_risk', objectIdGetter: 'selectedId || ""' },
  { path: 'app/actions/page.tsx', objectType: 'action', objectIdGetter: '""' },
];

for (const page of pages) {
  let content = fs.readFileSync(page.path, 'utf8');
  if (content.includes('AICopilotPanel')) { console.log('SKIP', page.path); continue; }

  // Add import
  content = content.replace(
    `"use client";`,
    `"use client";\nimport { useState as __ai_useState } from "react";\nimport { AICopilotPanel } from "@/components/domain/ai/AICopilotPanel";`
  );

  // The pages already import useState from react, so we need to handle the duplicate
  // Actually, let's just add the import before the last import or after existing imports
  // Remove the duplicate useState approach and just add the AI import
  
  // Reset and use simpler approach
  content = fs.readFileSync(page.path, 'utf8');
  
  // Add AI import after the last import statement
  const lines = content.split('\n');
  let lastImportIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('import ')) lastImportIdx = i;
  }
  if (lastImportIdx >= 0) {
    lines.splice(lastImportIdx + 1, 0, `import { AICopilotPanel } from "@/components/domain/ai/AICopilotPanel";`);
    content = lines.join('\n');
  }

  // Add state variable before the return or at the top of the function
  // Find the function component and add state after useState declarations
  content = content.replace(
    'export default function',
    '// eslint-disable-next-line @typescript-eslint/no-explicit-any\nconst [_aiOpen, _setAiOpen] = __ai_useState(false);\nexport default function'
  );
  
  // Fix the state to use proper useState - pages already import useState
  content = content.replace(
    '// eslint-disable-next-line @typescript-eslint/no-explicit-any\nconst [_aiOpen, _setAiOpen] = __ai_useState(false);',
    '  const [_aiOpen, _setAiOpen] = useState(false);'
  );

  // Add AI button + panel before the last </ProductShell> or last </div>
  const lastShellIdx = content.lastIndexOf('</ProductShell>');
  const lastDivIdx = content.lastIndexOf('</div>');
  const insertIdx = lastShellIdx > lastDivIdx ? lastShellIdx : lastDivIdx;
  
  if (insertIdx > 0) {
    const aiBlock = `
      <button onClick={() => _setAiOpen(true)} className="fixed bottom-4 right-4 z-40 rounded-full bg-[var(--color-primary)] text-white px-4 py-2 shadow-lg text-sm font-medium hover:opacity-90 transition-opacity">AI 助手</button>
      {_aiOpen && <AICopilotPanel objectType="${page.objectType}" objectId={${page.objectIdGetter}} onClose={() => _setAiOpen(false)} />}
`;
    content = content.slice(0, insertIdx) + aiBlock + content.slice(insertIdx);
  }

  fs.writeFileSync(page.path, content);
  console.log('PATCHED', page.path);
}

console.log('Done');
