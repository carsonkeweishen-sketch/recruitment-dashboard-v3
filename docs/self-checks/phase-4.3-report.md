# Phase 4.3 — Full Evidence Pack

> **Phase**: 4.3 | **Date**: 2025-06-25 | **HEAD**: 1509a34 | **Branch**: main

## 1. Git Info

```
PWD: /workspace/recruitment-dashboard
BRANCH: main
REMOTE: github.com/carsonkeweishen-sketch/recruitment-dashboard-v3.git
STATUS: working tree clean (before evidence pack)
HEAD: 1509a34
```

**Evidence files in this pack:**
- `docs/self-checks/phase-4.3-report.md` (this file)
- `docs/self-checks/phase-4.3-commands.log` (37 lines, raw grep output)
- `docs/self-checks/phase-4.3-api-responses.md` (236 lines, 4 API responses)
- `screenshots/phase-4.3/candidates-page-success.png`
- `screenshots/phase-4.3/candidates-detail-drawer-overview.png`
- `screenshots/phase-4.3/candidates-detail-drawer-applications.png`
- `screenshots/phase-4.3/candidates-detail-drawer-profile.png`

## 2. Scope

| What | Status |
|------|--------|
| Business code modified | **No** |
| Schema modified | **No** |
| Migration added | **No** |
| AI (OpenAI/DeepSeek) called | **No** |
| Moka called | **No** |
| Feishu called | **No** |
| API Key committed | **No** |
| Real candidate privacy in code | **No** |
| Entering Phase 5 | **No — awaiting review** |

## 3. Hardcode Check

All 8 grep commands in `phase-4.3-commands.log` returned **no matches**.

| # | Grep Target | Result |
|---|------------|--------|
| 1 | Candidate names in `app/candidates/` & `components/domain/candidates/` | **no matches** |
| 2 | `demoCandidates/sampleCandidates/fallbackCandidates/mockCandidates` | **no matches** |
| 3 | `totalCandidates = N/activeCandidates = N` hardcoded KPI | **no matches** |
| 4 | `@gmail.com/@qq.com/@163.com/@liran` in candidates code paths | **no matches** |
| 5 | Real candidate names (张丽华 etc.) | **no matches** |
| 6 | Sensitive keywords (身份证/薪资沟通 etc.) | **no matches** |
| 7 | `integrations/openai|deepseek|moka|feishu` in candidates code | **no matches** |
| 8 | `JSON.stringify/JSON.parse` in candidate components | **no matches** (only API `.json()` calls) |

**Full raw output**: see `docs/self-checks/phase-4.3-commands.log`

## 4. API Response Evidence

All 4 API endpoints return real DB data. Full responses in `docs/self-checks/phase-4.3-api-responses.md`.

| Endpoint | Count | Fields | Email/Phone |
|----------|-------|--------|-------------|
| `GET /api/candidates` | 8 | id,name,source,currentCompany,currentTitle,tags,resumeSummary,applicationCount,activeApplicationCount,latestApplicationStage,latestJobTitle,latestActivityAt,createdAt,updatedAt | **Not in list** |
| `GET /api/candidates/:id` | 1 | All above + email,phone,applications[] | **email: present, phone: present** (admin role) |
| `GET /api/applications` | 8 | id,candidate{name,company,title},job{title,jobCode,dept},stage,status,source,fitScore,owner | **N/A** |
| `GET /api/applications/:id` | 1 | All above + candidate full detail + job full detail | **N/A** |

**No undefined, NaN, Invalid Date, or raw JSON in any API response.**

## 5. API Chain

```
GET /api/candidates
  -> server/services/candidates/candidate-service.ts (listCandidates)
    -> server/repositories/candidate-repository.ts (getCandidates)
      -> prisma.candidate.findMany({where, include: {applications: {include: {job}}}})

GET /api/candidates/:id
  -> server/services/candidates/candidate-service.ts (getCandidateDetail)
    -> server/repositories/candidate-repository.ts (getCandidateById)
      -> prisma.candidate.findUnique({where: {id}, include: {applications: {include: {job, owner}}}})

GET /api/applications
  -> server/services/applications/application-service.ts (listApplications)
    -> server/repositories/application-repository.ts (getApplications)
      -> prisma.application.findMany({where, include: {candidate, job, owner}})

GET /api/applications/:id
  -> server/services/applications/application-service.ts (getApplicationDetail)
    -> server/repositories/application-repository.ts (getApplicationById)
      -> prisma.application.findUnique({where: {id}, include: {candidate, job, owner}})
```

## 6. Permission Filtering

**Server-side scope filtering in `candidate-repository.ts` (lines 24-50):**

```typescript
if (scope.scope === "DENY") return [];
if (scope.scope === "DEPARTMENT" && scope.departmentId) {
  where.applications = {..., some: {..., job: { departmentId: scope.departmentId }}};
} else if (scope.scope === "OWNED" && scope.userId) {
  where.applications = {..., some: {..., ownerId: scope.userId }};
} else if (scope.scope === "RELATED" && scope.userId) {
  where.applications = {..., some: {..., OR: [{ownerId}, {job: {businessOwnerId}}]}};
}
// ALL: where = {} (no scope filter)
```

**Permission count table (based on code logic, seed data = 8 candidates/8 applications):**

| Role | Scope | Candidates | Applications | Email | Phone | Verdict |
|------|-------|-----------|-------------|-------|-------|---------|
| admin | ALL | 8 | 8 | visible | visible | PASS |
| leader | ALL | 8 | 8 | visible | visible | PASS |
| hrbp | DEPARTMENT | dept-filtered | dept-filtered | visible(dept) | visible(dept) | PASS |
| recruiter | OWNED | owned-filtered | owned-filtered | visible(owned) | visible(owned) | PASS |
| biz_owner | RELATED | related only | related only | null | null | PASS |
| interviewer | DENY | 0 | 0 | null | null | PASS |

**Contact privacy** (`app/api/candidates/[id]/route.ts` line 18):
```typescript
const showContact = scope === "ALL" || scope === "DEPARTMENT" || scope === "OWNED";
// email: showContact ? candidate.email : null
// phone: showContact ? candidate.phone : null
```

## 7. KPI Calculation Chain

```
Page load -> fetch(/api/candidates) -> server filters by scope returns authorized subset
Frontend state: candidates[] (only authorized data)
KPIs computed from this authorized subset:
  - total: candidates.length
  - active: .filter(stage NOT in [hired,rejected,withdrawn,closed]).length
  - multiJob: .filter(applicationCount > 1).length
  - recent: .filter(createdAt within last 7 days).length
```

**Not**: frontend filtering full dataset. **Not**: hardcoded numbers. **Not**: mock lists.
Server-side metrics aggregation planned for Phase 5/6/11.

## 8. Adapter Isolation

All 4 adapters are `not_configured` stubs. No real API calls. No API keys committed.
`grep` for adapter imports in candidates/applications code paths: **no matches**.

## 9. UI Screenshots

| File | Content |
|------|---------|
| `candidates-page-success.png` | Full /candidates page: KPI cards + filter bar + 8-candidate list |
| `candidates-detail-drawer-overview.png` | Candidate Drawer: Overview tab |
| `candidates-detail-drawer-applications.png` | Candidate Drawer: Applications tab |
| `candidates-detail-drawer-profile.png` | Candidate Drawer: Profile tab |

Empty/Error/PermissionDenied/Loading states use shared `EmptyState`, `ErrorState`, `PermissionDenied`, `LoadingSkeleton` components with appropriate messages.

## 10. UI Reference Landing

| Reference Feature | Implementation | Screenshot |
|------------------|---------------|-----------|
| KPI number cards | CandidateKpiCards (4 cards) | candidates-page-success.png |
| Task list layout | CandidateList (12-col grid) | candidates-page-success.png |
| Right detail panel | CandidateDetailDrawer (4 Tabs) | candidates-detail-drawer-overview.png |
| Stage badges | ApplicationStageBadge (12 stages) | candidates-detail-drawer-applications.png |
| Light SaaS style | /candidates page | candidates-page-success.png |

## 11. Interaction Complexity

| Check | Result |
|-------|--------|
| Buttons | Candidate row click (open Drawer), Drawer X (close), 3 filter dropdowns, clear filters |
| One button = one action | Yes |
| Mega modals | None |
| Drawer tabs | Overview / Applications / Profile / Activity (4) |
| Phase 5/6/9/10 pre-load | None |
| Raw JSON | None |
| undefined/null/NaN/Invalid Date | None (null contacts shown as "—") |

## 12. Build Verification

```
pnpm typecheck: 0 errors
pnpm lint: 0 errors, 0 warnings
pnpm build: PASS (14 routes including /candidates)
```

## 13. Conclusion

- **Phase 4.3 complete**: Yes — Full Evidence Pack delivered
- **Code modified**: No
- **Entering Phase 5**: No — awaiting external review
- **Force push**: No
- **Risk**: None
- **Needs confirmation**: Evidence sufficiency for Phase 5 entry
