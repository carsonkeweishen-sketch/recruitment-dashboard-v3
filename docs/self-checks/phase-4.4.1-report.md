# Phase 4.4.1 — Role Scope Clarification & HRBP Seed Evidence

## Evidence Files Delivered

```
- docs/self-checks/phase-4.4.1-report.md          ← this file
- docs/self-checks/phase-4.4.1-commands.log        ← raw command outputs
- screenshots/phase-4.4.1/hrbp-candidates-visible.png
- screenshots/phase-4.4.1/interviewer-related-candidates.png
- screenshots/phase-4.4.1/interviewer-contact-hidden.png
- screenshots/phase-4.4.1/biz-owner-contact-hidden.png
```

---

## 1. Interviewer RELATED Scope Fix

### Problem (Phase 4.4)
Interviewer RELATED scope used the same `where` condition as business_owner:
```
OR: [{ ownerId: scope.userId }, { job: { businessOwnerId: scope.userId } }]
```
This caused interviewer 孙面试官 to see **5 candidates** — all those where she was `job.businessOwner`, not those she was actually assigned to interview.

### Fix (Phase 4.4.1)
Differentiated RELATED semantics by role:

**candidate-repository.ts (line 48-49):**
```typescript
if (scope.role === "interviewer") {
  where.applications = { some: { interviews: { some: { interviewerId: scope.userId } } } };
} else {
  where.applications = { some: { OR: [{ ownerId: scope.userId }, { job: { businessOwnerId: scope.userId } }] } };
}
```

**application-repository.ts (line 37):**
```typescript
if (scope.role === "interviewer") {
  where.interviews = { some: { interviewerId: scope.userId } };
} else {
  where.OR = [{ ownerId: scope.userId }, { job: { businessOwnerId: scope.userId } }];
}
```

### Before vs After

| Metric | Before (bug) | After (fix) |
|--------|-------------|-------------|
| Interviewer candidates | 5 | **2** |
| Interviewer applications | 5 | **2** |
| Filter basis | businessOwnerId | **Interview.interviewerId** |

### Traceability

| interviewerUserId | candidateId | candidateName | applicationId | jobTitle | interviewId | interviewerId | whyVisible |
|-------------------|-------------|---------------|---------------|----------|-------------|---------------|------------|
| cmqt44zdt0009zyqhnpi53sy1 | cmqt44zfb000kzyqhhevphgrl | 陈书妍 | cmqt44zga000szyqhddb8u1is | 媒介投放 | cmqt44zhe000yzyqhjz32bguj | cmqt44zdt0009zyqhnpi53sy1 | Interview.interviewerId matches |
| cmqt44zdt0009zyqhnpi53sy1 | cmqt44zfc000mzyqh7i0rv81z | 赵明远 | cmqt44zgb000uzyqhpf4cfugs | 内容编辑 | cmqt44zhs0010zyqh78h4eceh | cmqt44zdt0009zyqhnpi53sy1 | Interview.interviewerId matches |

✅ Each visible candidate is traceable to an `Interview` record where `interviewerId === current user`.

---

## 2. HRBP DEPARTMENT Scope Fix

### Problem (Phase 4.4)
HRBP 张HRBP belongs to 人力资源部 which had **0 Jobs** in seed data. DEPARTMENT scope correctly returned 0 — but this couldn't serve as valid verification of the scope mechanism.

### Fix (Phase 4.4.1)
Added 1 Job + 2 Candidates + 2 Applications under 人力资源部:

| Field | Value |
|-------|-------|
| Department | 人力资源部 (cmqt4167c0001jsqh47jzx52k) |
| Job | 招聘专员 (HR-001) |
| Candidate 1 | 苏敏 (su.min@example.com), 蓝月亮 → 招聘主管 |
| Candidate 2 | 吴启明 (wu.qiming@example.com), 完美日记 → HR专员 |
| Application 1 | 苏敏 → 招聘专员, hr_screen |
| Application 2 | 吴启明 → 招聘专员, sourced |

### Verification

| Check | Result |
|-------|--------|
| HRBP sees 2 candidates | ✅ 苏敏, 吴启明 |
| HRBP sees 2 applications | ✅ Both to 招聘专员 |
| HRBP does NOT see full list (10) | ✅ Only 2 visible |
| Server-side filtering via job.departmentId | ✅ candidate-repository.ts line 45 |
| Not frontend filtering | ✅ Prisma `where` clause |

---

## 3. Six-Role Permission Table (Post-Fix)

| Role | Scope | Candidates | Applications | Email | Phone | Verdict |
|------|-------|-----------|-------------|-------|-------|---------|
| admin | ALL | 10 | 10 | visible | visible | ✅ PASS |
| leader | ALL | 10 | 10 | visible | visible | ✅ PASS |
| hrbp | DEPARTMENT | 2 | 2 | visible* | visible* | ✅ PASS (was 0) |
| recruiter | OWNED | 8 | 8 | visible | visible | ✅ PASS |
| business_owner | RELATED | 3 | 3 | null | null | ✅ PASS |
| interviewer | RELATED | 2 | 2 | null | null | ✅ PASS (was 5) |

---

## 4. Contact Privacy Verification

| Role | candidateId | Email Result | Phone Result | UI Display |
|------|------------|-------------|-------------|------------|
| admin | 林可 | lin.ke@example.com | 13800000001 | Normal display |
| biz_owner | 林可 | null | null | 无权限查看 |
| interviewer | 陈书妍 | null | null | 无权限查看 |

✅ API returns null for RELATED scope
✅ UI displays "无权限查看" not raw null
✅ Code: `app/api/candidates/[id]/route.ts` line 18

---

## 5. Code Changes Summary

| File | Change | Impact |
|------|--------|--------|
| `server/permissions/types.ts` | ScopeWhere added `role?: Role` | Allows repo to differentiate interviewer vs biz_owner |
| `server/permissions/check-permission.ts` | buildScopeWhere includes role | Passes role into scope context |
| `server/repositories/candidate-repository.ts` | RELATED splits by role | Interviewer uses `interviews.some.interviewerId` |
| `server/repositories/application-repository.ts` | RELATED splits by role | Interviewer uses `interviews.some.interviewerId` |
| `prisma/seed.ts` | Added HRBP Job + 2 Candidates + 2 Applications | HRBP department now has verifiable data |
| `.env` | DATABASE_URL port 51214→51217 | Prisma dev restart changed port |
| `components/domain/candidates/CandidateDetailDrawer.tsx` | (Phase 4.4) F component permissionRequired | "无权限查看" display |

No Schema changes. No migrations. No new pages.

---

## 6. Build Verification

| Check | Command | Result |
|-------|---------|--------|
| TypeScript | `pnpm typecheck` | 0 errors |
| ESLint | `pnpm lint` | 0 errors, 0 warnings |
| Build | `pnpm build` | PASS |

---

## 7. Screenshot Evidence

| Screenshot | Content | Status |
|-----------|---------|--------|
| hrbp-candidates-visible.png | HRBP sees 2 candidates (苏敏, 吴启明) in 人力资源部 | ✅ |
| interviewer-related-candidates.png | Interviewer sees 2 candidates (陈书妍, 赵明远) based on interview assignments | ✅ |
| interviewer-contact-hidden.png | Interviewer detail drawer shows "无权限查看" for contacts | ✅ |
| biz-owner-contact-hidden.png | Business owner detail drawer shows "无权限查看" for contacts | ✅ |

---

## Final Conclusion

| Item | Status |
|------|--------|
| Phase 4.4.1 是否完成 | 是 |
| interviewer scope 是否已证明 | 是 — 基于 Interview.interviewerId 过滤，每条可追溯 |
| HRBP DEPARTMENT scope 是否已证明 | 是 — 返回 2 candidates/2 applications，非全量非 0 |
| 是否建议进入 Phase 5 | 等待外部审查 |
| 是否自行进入 Phase 5 | 否 |
| 当前风险 | Prisma dev 端口变更需在下次启动时注意；seed.ts 的 create/upsert 混用需在 Phase 5 统一 |
| 需要外部确认 | 1) Interviewer RELATED 改为基于 Interview 过滤是否正确 2) HRBP 部门数据是否满足验收 3) 联系方式隐私显示"无权限查看"是否满足要求 |
