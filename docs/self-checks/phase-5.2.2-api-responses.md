# Phase 5.2.2 API Response Evidence — Object Scope Hardening Final

## 1. Multi-Application Candidate Detail (林可, 2 apps: KA大客户 + 品牌策划)

### admin (ALL scope)
| Field | Value |
|-------|-------|
| Role | admin |
| HTTP Status | 200 |
| Applications returned | 2 |
| Jobs visible | KA大客户销售, 品牌策划 |
| DB Write | N/A |
| Verdict | ✅ Full visibility |

### recruiter (OWNED scope, ownerId=王招聘)
| Field | Value |
|-------|-------|
| Role | recruiter |
| HTTP Status | 200 |
| Applications returned | 2 |
| Jobs visible | KA大客户销售, 品牌策划 |
| Why | Both apps have ownerId=王招聘 |
| Verdict | ✅ OWNED scope via ownerId — recruiter sees both owned apps |

### business_owner (RELATED scope, businessOwnerId=赵业务)
| Field | Value |
|-------|-------|
| Role | business_owner |
| HTTP Status | 200 |
| Applications returned | **1** |
| Jobs visible | KA大客户销售 |
| Jobs NOT visible | 品牌策划 (businessOwnerId=孙面试官) |
| Why | Only app where job.businessOwnerId=赵业务 |
| Verdict | ✅ RELATED scope via businessOwnerId only — cross-job app correctly filtered |

### interviewer (RELATED scope, no interview assignment for 林可)
| Field | Value |
|-------|-------|
| Role | interviewer |
| HTTP Status | 404 |
| Response | `{"success":false,"error":"Not found"}` |
| Verdict | ✅ Candidate-level scope denied — interviewer has no interview for 林可 |

## 2. business_owner Object-Level Detail Access

### GET /api/jobs/:id — businessOwnerId match
| Field | Value |
|-------|-------|
| Role | business_owner (赵业务) |
| Target | KA大客户销售 (businessOwnerId=赵业务) |
| HTTP Status | 200 |
| Verdict | ✅ |

### GET /api/jobs/:id — only ownerId match (not businessOwnerId)
| Field | Value |
|-------|-------|
| Role | business_owner (赵业务) |
| Target | 品牌策划 (ownerId=王招聘, businessOwnerId=孙面试官) |
| HTTP Status | 404 |
| Verdict | ✅ 404 — ownerId alone does NOT grant access |

### GET /api/applications/:id — businessOwnerId match
| Field | Value |
|-------|-------|
| Role | business_owner (赵业务) |
| Target | 林可→KA大客户 (businessOwnerId=赵业务) |
| HTTP Status | 200 |
| Verdict | ✅ |

### GET /api/applications/:id — only ownerId match
| Field | Value |
|-------|-------|
| Role | business_owner (赵业务) |
| Target | 陈书妍→媒介投放 (ownerId=王招聘, businessOwnerId=孙面试官) |
| HTTP Status | 404 |
| Verdict | ✅ 404 |

## 3. Permission Failure Status Codes

| Test | HTTP Status |
|------|------------|
| feedback-summary unauthorized | 404 |
| mismatched applicationId | 400 |
| invalid sourceFeedbackId | 404 |
| interviewer creates feedback | 403 |
| biz_owner creates unrelated feedback | 403 |
| recruiter confirms calibration | 403 |

No 500 responses for expected permission/validation failures.

## 4. Unscoped Calls in API/Service

**grep result: ZERO matches** — all detail paths use WithScope variants exclusively.

## 5. businessOwnerId + ownerId OR Patterns in Repository Scope

**grep result: ZERO matches** — business_owner scope conditions use only businessOwnerId; recruiter OWNED scope uses only ownerId.

## 6. ActivityLog & DB Write Integrity

All permission-failed requests verified: no BusinessFeedback, ProfileCalibration, or ActivityLog writes.
