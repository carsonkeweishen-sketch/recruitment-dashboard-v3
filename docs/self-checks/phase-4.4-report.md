# Phase 4.4 — Candidate Evidence Pack Final Gate

## Evidence Files Delivered

```
- docs/self-checks/phase-4.4-report.md          ← this file
- docs/self-checks/phase-4.4-commands.log        ← raw command outputs
- docs/self-checks/phase-4.4-api-responses.md    ← API response summaries
- screenshots/phase-4.4/candidates-page-success.png
- screenshots/phase-4.4/candidates-detail-drawer-overview.png
- screenshots/phase-4.4/candidates-detail-drawer-applications.png
- screenshots/phase-4.4/candidates-detail-drawer-profile.png
- screenshots/phase-4.4/candidates-loading.png
- screenshots/phase-4.4/candidates-empty.png
- screenshots/phase-4.4/candidates-error.png
- screenshots/phase-4.4/candidates-permission-denied.png
```

All files confirmed on disk via `find` commands (see commands.log Section 7).

---

## 1. Hardcode Check Results

All grep commands executed with raw output preserved in `phase-4.4-commands.log`.

| Check | Command | Result |
|-------|---------|--------|
| Candidate names hardcoded | `grep -Rn "林可\|周亦然\|..." app/candidates components/domain/candidates` | 0 matches |
| Mock/fallback arrays | `grep -Rn "demoCandidates\|sampleCandidates\|..." app/candidates components/domain/candidates` | 0 matches |
| Hardcoded KPI numbers | `grep -Rn "const kpis\|totalCandidates = [0-9]\|..." app/candidates components/domain/candidates` | 0 matches |

**Verdict: No hardcoded data, mock arrays, or fake KPI numbers in frontend code.**

---

## 2. API Response Evidence

Full details in `phase-4.4-api-responses.md`. Summary:

| Endpoint | Items | Key Finding |
|----------|-------|-------------|
| GET /api/candidates | 8 candidates | No email/phone in list; all data from DB |
| GET /api/candidates/:id | 1 candidate + apps | email/phone visible for ALL/DEPARTMENT/OWNED, null for RELATED |
| GET /api/applications | 8 applications | Includes candidate + job objects |
| GET /api/applications/:id | 1 application | Includes nested candidate + job + owner |

**No undefined, NaN, Invalid Date, or raw JSON found in any response.**

---

## 3. Six-Role Permission Table (Real Numbers)

| Role | Scope | Candidates | Applications | Email | Phone | Evidence |
|------|-------|-----------|-------------|-------|-------|----------|
| admin | ALL | 8 | 8 | visible | visible | curl+cookie |
| leader | ALL | 8 | 8 | visible | visible | curl+cookie |
| hrbp | DEPARTMENT | 0* | 0* | visible* | visible* | curl+cookie |
| recruiter | OWNED | 8 | 8 | visible | visible | curl+cookie |
| business_owner | RELATED | 3 | 3 | null | null | curl+cookie |
| interviewer | RELATED | 5 | 5 | null | null | curl+cookie |

**\*hrbp note:** 张HRBP belongs to 人力资源部 which has no Jobs in seed data. DEPARTMENT scope correctly returns 0. Contact visibility on individual detail endpoint works correctly (showContact=true for DEPARTMENT), but list is empty due to department structure. This is a seed data constraint, not a code bug.

**Proof of server-side filtering (not frontend):**
- business_owner (赵业务) sees exactly 3 candidates: those where 赵业务 is job.businessOwner
- interviewer (孙面试官) sees exactly 5 candidates: those where 孙面试官 is job.businessOwner
- hrbp (张HRBP) sees 0 candidates: no jobs in 人力资源部
- All filtering executed via Prisma `where` clauses in `candidate-repository.ts` lines 44-50
- Frontend never receives full candidate list and filters client-side

---

## 4. Contact Privacy Verification

**Code location:**
- Route: `app/api/candidates/[id]/route.ts` line 18: `const showContact = scope === "ALL" || scope === "DEPARTMENT" || scope === "OWNED";`
- Service: `server/services/candidates/candidate-service.ts` — passes through from repository
- Repository: `server/repositories/candidate-repository.ts` — returns raw data (privacy applied at route level)
- Frontend: `components/domain/candidates/CandidateDetailDrawer.tsx` F component — displays "无权限查看" when permissionRequired and value is null

**Privacy verification results:**
| Role | Email | Phone | Screenshot Evidence |
|------|-------|-------|---------------------|
| admin | lin.ke@example.com | 13800000001 | detail-drawer-overview (admin) |
| leader | lin.ke@example.com | 13800000001 | API evidence only |
| business_owner | null → "无权限查看" | null → "无权限查看" | permission-denied (interviewer drawer) |
| interviewer | null → "无权限查看" | null → "无权限查看" | permission-denied (interviewer drawer) |

**Frontend handling:** When email/phone is null due to permission, F component with `permissionRequired` prop displays "无权限查看" instead of "—". Fixed in this phase (see Section 11).

**Is this only frontend-hidden? No.** The null value comes from the server API route (line 30-31 of `app/api/candidates/[id]/route.ts`). The frontend only decides how to render the null value.

---

## 5. KPI Chain

### /candidates Page KPIs:
| KPI | Calculation Source | Location |
|-----|-------------------|----------|
| 候选人总数 | `candidates.length` from API response | `app/candidates/page.tsx` line 42 |
| 推进中候选人 | `candidates.filter(c => c.latestApplicationStage && !["hired","rejected","withdrawn","closed"].includes(c.latestApplicationStage)).length` | `app/candidates/page.tsx` line 32 |
| 多岗位投递候选人 | `candidates.filter(c => c.applicationCount > 1).length` | `app/candidates/page.tsx` line 33 |
| 近7天新增 | `candidates.filter(c => new Date(c.createdAt) >= weekAgo).length` | `app/candidates/page.tsx` line 34 |

### Verification:
- ✅ /api/candidates applies server-side permission filtering (scope-based Prisma where)
- ✅ Frontend KPI calculations are based only on already-permission-filtered API data
- ✅ No server-side /api/metrics endpoint (acceptable for Phase 4)
- ✅ No hardcoded KPI numbers (verified via grep)
- ✅ No mock candidate list (verified via grep)
- ✅ Frontend does NOT fetch full candidate list and filter by role client-side

---

## 6. Adapter Isolation

**Code check:** `grep -Rn "integrations/openai\|integrations/deepseek\|integrations/moka\|integrations/feishu" app/candidates components/domain/candidates server/services/candidates server/repositories/candidate-repository.ts server/services/applications server/repositories/application-repository.ts`

**Result: 0 matches** (see commands.log Section 4)

| Check | Status |
|-------|--------|
| 是否真实调用 OpenAI | 否 |
| 是否真实调用 DeepSeek | 否 |
| 是否真实调用 Moka | 否 |
| 是否真实调用飞书 | 否 |
| 是否提交 API Key | 否 |
| 是否 candidates/applications 直接依赖外部 adapter | 否 |

---

## 7. Interaction Complexity

### /candidates Page Buttons:
| Button | Action | One action? |
|--------|--------|-------------|
| Candidate row (button) | Opens Detail Drawer for that candidate | ✅ Yes |
| Drawer close (✕) | Closes drawer | ✅ Yes |
| Drawer tab buttons (概览/投递/档案/动态) | Switches tab within drawer | ✅ Yes |
| Error retry button | Re-fetches candidates | ✅ Yes |

### Candidate Detail Drawer Tabs:
- **概览 (Overview):** Name, source, company, title, phone, email, dates, tags
- **投递 (Applications):** List of applications with job title, stage badge, department, level, owner, fitScore
- **档案 (Profile):** Resume summary, tags
- **动态 (Activity):** Placeholder — "后续业务反馈、面试记录、Offer 风险和 AI 分析会沉淀在这里"

### Compliance:
- ✅ One button = one action
- ✅ No mega modals
- ✅ Drawer shows one candidate object only
- ✅ No Phase 5 content (business screening feedback) pre-loaded
- ✅ No Phase 6 content (interviews) pre-loaded
- ✅ No Phase 9 content (Offer) pre-loaded
- ✅ No Phase 10 content (AI) pre-loaded
- ✅ No raw JSON exposure in UI
- ✅ No undefined / NaN / Invalid Date in UI
- ✅ Permission-caused null values displayed as "无权限查看" (not "—")

---

## 8. Screenshot Evidence

All 8 screenshots captured in `screenshots/phase-4.4/`:

| Screenshot | What it shows | Status |
|-----------|---------------|--------|
| candidates-page-success.png | Admin view: 8 candidates with KPI cards, filters, list | ✅ Captured |
| candidates-detail-drawer-overview.png | Admin detail: Overview tab with visible email/phone | ✅ Captured |
| candidates-detail-drawer-applications.png | Admin detail: Applications tab with job info | ✅ Captured |
| candidates-detail-drawer-profile.png | Admin detail: Profile tab with resume summary | ✅ Captured |
| candidates-loading.png | Loading skeleton during API fetch | ✅ Captured |
| candidates-empty.png | HRBP view: 0 candidates (empty state with 👥 icon) | ✅ Captured |
| candidates-error.png | Simulated 500 error: ErrorState with retry button | ✅ Captured |
| candidates-permission-denied.png | Interviewer view: Detail drawer with "无权限查看" for contacts | ✅ Captured |

---

## 9. Build & Git Evidence

| Check | Command | Result |
|-------|---------|--------|
| TypeScript | `pnpm typecheck` | 0 errors |
| ESLint | `pnpm lint` | 0 errors, 0 warnings |
| Build | `pnpm build` | PASS (3 static, 7 dynamic routes) |

Raw output in commands.log Section 8.

---

## 10. Git Status

- **Branch:** agent/workbuddy/phase-4.4
- **Based on:** main (phase-4.3)
- **Files changed:** Evidence files + 1 minimal code fix

---

## 11. Code Fixes in This Phase

### Fix 1: Contact Privacy UI Display

**File:** `components/domain/candidates/CandidateDetailDrawer.tsx`

**Problem:** When email/phone is null due to permission restriction (RELATED/DENY scope), the F component displayed "—" which is indistinguishable from "no data".

**Fix:** Added `permissionRequired` prop to F component. When `permissionRequired=true` and `value===null`, displays "无权限查看" with muted text color. Applied to 手机 and 邮箱 fields.

**Lines changed:** F component definition + phone/email field calls (2 lines each)

**Impact:** UI-only. No API or data model changes. Backward compatible.

---

## 12. Known Issues (Not Blocking Phase 4.4)

1. **hrbp DEPARTMENT scope returns 0:** 张HRBP is in 人力资源部 which has no jobs in seed data. This is a seed data constraint — the code correctly filters by department. If a job were added to 人力资源部, hrbp would see those candidates.

2. **Candidate detail endpoint lacks scope-based access control:** `/api/candidates/[id]` does not check whether the requesting user's scope should allow viewing that specific candidate. Currently only checks `requirePermission(session, "candidates", "view")`. A DEPARTMENT-scoped hrbp can view any candidate by ID even if that candidate has no applications in their department. This should be addressed in a future security hardening phase.

---

## Final Conclusion

| Item | Status |
|------|--------|
| Phase 4.4 是否完成 | 是 |
| 是否建议进入 Phase 5 | 等待外部审查 |
| 是否自行进入 Phase 5 | 否 |
| 当前风险 | hrbp DEPARTMENT scope returns 0 due to seed data; candidate detail endpoint lacks per-resource scope check |
| 需要外部确认 | 1) Evidence Pack completeness; 2) Acceptable to proceed despite hrbp=0 in seed data; 3) Contact privacy display "无权限查看" meets requirements |

**No Phase 5, 6, 9, 10 content pre-loaded. No external API calls. No fake data. No hardcoded KPIs. All evidence is from real DB queries with traceable cookie parameters.**
