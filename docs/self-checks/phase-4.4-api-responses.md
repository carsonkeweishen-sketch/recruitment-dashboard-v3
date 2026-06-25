# Phase 4.4 API Response Evidence

## API Endpoints Tested

| Endpoint | Method | Purpose |
|----------|--------|---------|
| /api/candidates | GET | List candidates (scope-filtered) |
| /api/candidates/:id | GET | Candidate detail (with contact privacy) |
| /api/applications | GET | List applications (scope-filtered) |
| /api/applications/:id | GET | Application detail |

---

## 1. GET /api/candidates (admin)

```bash
curl -s -b "rd_dev_role=admin; rd_dev_user_id=cmqt44zav0004zyqhbtt0lfha; rd_dev_dept_id=cmqt4167b0000jsqhvkv6eora" "http://localhost:3000/api/candidates"
```

**Return count: 8**

**Fields returned:** id, name, source, currentCompany, currentTitle, tags, resumeSummary, applicationCount, activeApplicationCount, latestApplicationStage, latestJobTitle, latestActivityAt, createdAt, updatedAt

**Fields NOT returned (privacy):** email, phone (excluded from list endpoint by design)

**Candidates returned:**
| Name | Current Company | Current Title | Apps | Stage |
|------|----------------|---------------|------|-------|
| 林可 | 宝洁中国 | KA经理 | 1 | business_screen |
| 周亦然 | 欧莱雅 | 采购主管 | 1 | hr_screen |
| 陈书妍 | 字节跳动 | 媒介经理 | 1 | first_interview |
| 许安然 | 无忧传媒 | 直播运营 | 1 | sourced |
| 赵明远 | 小红书 | 内容运营 | 1 | second_interview |
| 顾清和 | 联合利华 | 品牌经理 | 1 | offer_risk |
| 沈知意 | 科丝美诗 | OEM采购 | 1 | hr_screen |
| 陆嘉宁 | 美ONE | 主播 | 1 | first_interview |

**No undefined, NaN, Invalid Date, or raw JSON found.**

---

## 2. GET /api/candidates/cmqt44zf9000izyqh4k6k7yb6 (admin - 林可)

```bash
curl -s -b "rd_dev_role=admin; rd_dev_user_id=cmqt44zav0004zyqhbtt0lfha; rd_dev_dept_id=cmqt4167b0000jsqhvkv6eora" "http://localhost:3000/api/candidates/cmqt44zf9000izyqh4k6k7yb6"
```

**Raw response (first 2500 chars):**
```json
{"success":true,"data":{"id":"cmqt44zf9000izyqh4k6k7yb6","name":"林可","source":"BOSS直聘","currentCompany":"宝洁中国","currentTitle":"KA经理","tags":["快消","KA","名创"],"resumeSummary":"5年快消KA经验，负责华南区名创/三福渠道，年销售额3000万+。","email":"lin.ke@example.com","phone":"13800000001","applicationCount":1,"activeApplicationCount":1,"applications":[{"id":"cmqt44zg9000qzyqhb4gz4lbz","job":{"id":"cmqt44ze2000azyqhghevqv4e","title":"KA大客户销售","jobCode":"SALES-001","department":"销售/KA渠道","level":"S4"},"stage":"business_screen","status":"active","source":"BOSS直聘","fitScore":85,"owner":{"id":"cmqt44zcq0007zyqhn7dsk3ir","name":"王招聘"},"lastActivityAt":"2026-06-25T06:20:20.988Z","createdAt":"2026-06-25T06:20:20.988Z"}],"createdAt":"2026-06-25T06:20:20.954Z","updatedAt":"2026-06-25T06:20:20.954Z"}}
```

**Key findings:**
- email: "lin.ke@example.com" — VISIBLE (admin has ALL scope)
- phone: "13800000001" — VISIBLE (admin has ALL scope)
- applications: includes job details with department, level, jobCode
- No undefined, NaN, Invalid Date
- No raw JSON in unexpected places

---

## 3. GET /api/applications (admin)

```bash
curl -s -b "rd_dev_role=admin; rd_dev_user_id=cmqt44zav0004zyqhbtt0lfha; rd_dev_dept_id=cmqt4167b0000jsqhvkv6eora" "http://localhost:3000/api/applications"
```

**Return count: 8**

**Fields returned:** id, candidate.{id,name,currentCompany,currentTitle}, job.{id,title,jobCode,department}, stage, status, source, fitScore, owner.{id,name}, lastActivityAt, createdAt

**Applications returned:**
| Candidate | Job | Stage |
|-----------|-----|-------|
| 林可 | KA大客户销售 | business_screen |
| 周亦然 | 采购资源开发 | hr_screen |
| 陈书妍 | 媒介投放 | first_interview |
| 许安然 | 直播场控 | sourced |
| 赵明远 | 内容编辑 | second_interview |
| 顾清和 | 品牌策划 | offer_risk |
| 沈知意 | OEM采购 | hr_screen |
| 陆嘉宁 | 抖音主播 | first_interview |

---

## 4. GET /api/applications/cmqt44zg9000qzyqhb4gz4lbz (admin)

```bash
curl -s -b "rd_dev_role=admin; rd_dev_user_id=cmqt44zav0004zyqhbtt0lfha; rd_dev_dept_id=cmqt4167b0000jsqhvkv6eora" "http://localhost:3000/api/applications/cmqt44zg9000qzyqhb4gz4lbz"
```

**Raw response:**
```json
{"success":true,"data":{"id":"cmqt44zg9000qzyqhb4gz4lbz","candidate":{"id":"cmqt44zf9000izyqh4k6k7yb6","name":"林可","currentCompany":"宝洁中国","currentTitle":"KA经理","source":"BOSS直聘","tags":["快消","KA","名创"]},"job":{"id":"cmqt44ze2000azyqhghevqv4e","title":"KA大客户销售","jobCode":"SALES-001","department":"销售/KA渠道","level":"S4"},"stage":"business_screen","status":"active","source":"BOSS直聘","fitScore":85,"owner":{"id":"cmqt44zcq0007zyqhn7dsk3ir","name":"王招聘"},"createdAt":"2026-06-25T06:20:20.988Z","updatedAt":"2026-06-25T06:20:20.988Z"}}
```

**Key findings:**
- Includes candidate + job objects (nested)
- No email/phone in application detail (privacy by design)
- No undefined, NaN, Invalid Date

---

## 5. Contact Privacy - Multi-Role Verification

### Admin (ALL scope)
- GET /api/candidates/cmqt44zf9000izyqh4k6k7yb6 → email: "lin.ke@example.com", phone: "13800000001"
- **Verdict: VISIBLE** ✅

### Leader (ALL scope)
- GET /api/candidates/cmqt44zf9000izyqh4k6k7yb6 → email: "lin.ke@example.com", phone: "13800000001"
- **Verdict: VISIBLE** ✅

### HRBP (DEPARTMENT scope, dept=人力资源部)
- GET /api/candidates/cmqt44zf9000izyqh4k6k7yb6 → email: "lin.ke@example.com", phone: "13800000001"
- **Verdict: VISIBLE** (showContact=true for DEPARTMENT scope)
- Note: hrbp sees 0 candidates in list (no jobs in 人力资源部), but detail endpoint does not scope-filter individual candidate access — this is a known gap that should be addressed in a future phase.

### Recruiter (OWNED scope)
- GET /api/candidates/cmqt44zf9000izyqh4k6k7yb6 → email: "lin.ke@example.com", phone: "13800000001"
- **Verdict: VISIBLE** (showContact=true for OWNED scope) ✅

### Business Owner (RELATED scope)
- GET /api/candidates/cmqt44zf9000izyqh4k6k7yb6 → email: null, phone: null
- **Verdict: MASKED** (showContact=false for RELATED scope) ✅

### Interviewer (RELATED scope)
- GET /api/candidates/cmqt44zfc000nzyqh812ojmtc (顾清和) → email: null, phone: null
- **Verdict: MASKED** (showContact=false for RELATED scope) ✅

---

## 6. Per-Role Candidates & Applications Count

| Role | Scope | Candidates Count | Applications Count | Email | Phone | Evidence |
|------|-------|-----------------|-------------------|-------|-------|----------|
| admin | ALL | 8 | 8 | visible | visible | curl+cookie |
| leader | ALL | 8 | 8 | visible | visible | curl+cookie |
| hrbp | DEPARTMENT | 0 (see note) | 0 (see note) | visible* | visible* | curl+cookie |
| recruiter | OWNED | 8 | 8 | visible | visible | curl+cookie |
| business_owner | RELATED | 3 | 3 | null | null | curl+cookie |
| interviewer | RELATED | 5 | 5 | null | null | curl+cookie |

**hrbp note:** hrbp (张HRBP) is assigned to 人力资源部 (dept_id=cmqt4167c0001jsqh47jzx52k). No Job in seed data belongs to 人力资源部. Therefore DEPARTMENT scope returns 0 candidates and 0 applications. This is correct scope filtering behavior — hrbp would see candidates for jobs in their department if any existed. The contact visibility on individual candidate detail works correctly (showContact=true for DEPARTMENT), but the list is empty due to department having no jobs.

**Proof that filtering is server-side (not frontend):**
- business_owner sees 3 candidates (those with jobs where 赵业务 is businessOwner)
- interviewer sees 5 candidates (those with jobs where 孙面试官 is businessOwner)
- hrbp sees 0 candidates (no jobs in 人力资源部)
- All filtering happens in candidate-repository.ts via Prisma `where` clauses — NOT in frontend

**business_owner sees exactly:**
- 林可 → KA大客户销售 (bizOwner=赵业务)
- 周亦然 → 采购资源开发 (bizOwner=赵业务)
- 沈知意 → OEM采购 (bizOwner=赵业务)

**interviewer sees exactly:**
- 陈书妍 → 媒介投放 (bizOwner=孙面试官)
- 许安然 → 直播场控 (bizOwner=孙面试官)
- 赵明远 → 内容编辑 (bizOwner=孙面试官)
- 顾清和 → 品牌策划 (bizOwner=孙面试官)
- 陆嘉宁 → 抖音主播 (bizOwner=孙面试官)

---

## 7. API Health Checks

| Check | Result |
|-------|--------|
| /api/candidates returns success:true | ✅ |
| /api/candidates/:id returns success:true | ✅ |
| /api/applications returns success:true | ✅ |
| /api/applications/:id returns success:true | ✅ |
| Any undefined in response | ❌ None found |
| Any NaN in response | ❌ None found |
| Any Invalid Date in response | ❌ None found |
| Any raw JSON leakage | ❌ None found |
| Email in candidates list | ❌ Not included (privacy) |
| Phone in candidates list | ❌ Not included (privacy) |
