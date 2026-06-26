// Phase 2 Demo Seed — 理然真实业务结构 + 虚拟候选人
// 禁止提交真实候选人隐私数据

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Phase 2: Seeding 理然 demo data...");

  // === 1. Departments ===
  const depts = await Promise.all([
    prisma.department.upsert({ where: { code: "MGMT" }, update: {}, create: { name: "管理层", code: "MGMT" } }),
    prisma.department.upsert({ where: { code: "HR" }, update: {}, create: { name: "人力资源部", code: "HR" } }),
    prisma.department.upsert({ where: { code: "BRAND" }, update: {}, create: { name: "品牌营销部", code: "BRAND" } }),
    prisma.department.upsert({ where: { code: "ECOMM" }, update: {}, create: { name: "电商运营部", code: "ECOMM" } }),
    prisma.department.upsert({ where: { code: "SCM" }, update: {}, create: { name: "供应链/采购部", code: "SCM" } }),
    prisma.department.upsert({ where: { code: "SALES" }, update: {}, create: { name: "销售/KA渠道", code: "SALES" } }),
    prisma.department.upsert({ where: { code: "CONTENT" }, update: {}, create: { name: "内容/媒介部", code: "CONTENT" } }),
  ]);
  const [deptMgmt, deptHR, deptBrand, deptEcomm, deptScm, deptSales, deptContent] = depts;

  // === 2. Users (6 roles) ===
  const users = await Promise.all([
    prisma.user.upsert({ where: { email: "chen.zong@example.com" }, update: {}, create: { name: "陈总", email: "chen.zong@example.com", role: "admin", departmentId: deptMgmt.id } }),
    prisma.user.upsert({ where: { email: "li.director@example.com" }, update: {}, create: { name: "李总监", email: "li.director@example.com", role: "leader", departmentId: deptMgmt.id } }),
    prisma.user.upsert({ where: { email: "zhang.hrbp@example.com" }, update: {}, create: { name: "张HRBP", email: "zhang.hrbp@example.com", role: "hrbp", departmentId: deptHR.id } }),
    prisma.user.upsert({ where: { email: "wang.recruiter@example.com" }, update: {}, create: { name: "王招聘", email: "wang.recruiter@example.com", role: "recruiter", departmentId: deptHR.id } }),
    prisma.user.upsert({ where: { email: "zhao.biz@example.com" }, update: {}, create: { name: "赵业务", email: "zhao.biz@example.com", role: "business_owner", departmentId: deptSales.id } }),
    prisma.user.upsert({ where: { email: "sun.interviewer@example.com" }, update: {}, create: { name: "孙面试官", email: "sun.interviewer@example.com", role: "interviewer", departmentId: deptBrand.id } }),
  ]);
  const [, userLeader, userHrbp, userRecruiter, userBiz, userInterviewer] = users;

  // === 3. Jobs (8 真实岗位类型) ===
  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        title: "KA大客户销售", jobCode: "SALES-001", brandLine: "理然", departmentId: deptSales.id, level: "S4", status: "open", priority: "high",
        ownerId: userRecruiter.id, businessOwnerId: userBiz.id, location: "深圳", headcount: 2,
        jdText: "负责新零售渠道（名创/三福/KKV等）开拓与销售推进，管理KA客户关系，达成季度销售目标。",
        profileSummary: "3年以上KA销售经验，熟悉快消/日化渠道，具备独立开拓能力。",
        mustHave: { industry: "快消/日化", experience: "3年+", skill: "KA谈判" },
        niceToHave: { channel: "新零售", network: "名创/三福/KKV" },
        targetCompanies: ["新零售渠道", "KA渠道", "名创优品", "KKV", "三福"],
        interviewFocus: ["KA渠道开拓经验", "低成本动销方法", "客户谈判能力", "销售数据分析"],
        salaryMin: 15000, salaryMax: 25000,
      },
    }),
    prisma.job.create({
      data: {
        title: "采购资源开发", jobCode: "SCM-001", brandLine: "理然", departmentId: deptScm.id, level: "S3", status: "open", priority: "high",
        ownerId: userRecruiter.id, businessOwnerId: userBiz.id, location: "深圳", headcount: 1,
        jdText: "负责供应商资源开发、打样、成本谈判、交期管理与风险预警，维护供应商关系。",
        profileSummary: "2年以上采购经验，熟悉日化/美妆供应链，具备成本分析能力。",
        mustHave: { industry: "日化/美妆", experience: "2年+", skill: "供应商开发" },
        niceToHave: { category: "包材/原料", certification: "CPSM" },
        targetCompanies: ["消费品供应链", "OEM/ODM供应商", "个护品类供应资源"],
        interviewFocus: ["供应商开发能力", "成本意识", "打样与交付推进", "风险预警"],
        salaryMin: 12000, salaryMax: 20000,
      },
    }),
    prisma.job.create({
      data: {
        title: "媒介投放", jobCode: "CONTENT-001", brandLine: "理然", departmentId: deptContent.id, level: "S3", status: "open", priority: "normal",
        ownerId: userRecruiter.id, businessOwnerId: userInterviewer.id, location: "深圳", headcount: 2,
        jdText: "负责抖音达人投放、短视频流量运营、素材打法优化、达人选号与投放复盘。",
        profileSummary: "2年以上媒介投放经验，熟悉抖音/小红书生态，具备数据分析能力。",
        mustHave: { platform: "抖音/小红书", experience: "2年+", skill: "投放优化" },
        niceToHave: { tool: "千川/聚光", category: "美妆/个护" },
        targetCompanies: ["抖音达人生态", "短视频内容机构", "消费品媒介团队"],
        interviewFocus: ["达人选号", "内容素材判断", "投放复盘", "流量规则理解"],
        salaryMin: 13000, salaryMax: 22000,
      },
    }),
    prisma.job.create({
      data: {
        title: "直播场控", jobCode: "ECOMM-001", brandLine: "理然", departmentId: deptEcomm.id, level: "A2", status: "open", priority: "normal",
        ownerId: userRecruiter.id, businessOwnerId: userInterviewer.id, location: "深圳", headcount: 3,
        jdText: "负责直播间节奏把控、场控执行、活动配合、异常协同处理。",
        profileSummary: "1年以上直播场控经验，熟悉抖音直播流程，反应快、沟通强。",
        mustHave: { platform: "抖音直播", experience: "1年+", skill: "场控" },
        niceToHave: { category: "美妆/日化", tool: "巨量百应" },
        targetCompanies: ["抖音直播生态", "MCN机构", "美妆/日化品牌直播间"],
        interviewFocus: ["直播节奏把控", "突发问题处理", "数据监控", "团队协作"],
        salaryMin: 8000, salaryMax: 15000,
      },
    }),
    prisma.job.create({
      data: {
        title: "内容编辑", jobCode: "CONTENT-002", brandLine: "理然", departmentId: deptContent.id, level: "A3", status: "open", priority: "normal",
        ownerId: userRecruiter.id, businessOwnerId: userInterviewer.id, location: "深圳", headcount: 2,
        jdText: "负责内容选题策划、脚本撰写、短视频文案、素材协同与内容复盘。",
        profileSummary: "2年以上内容编辑经验，文案功底扎实，熟悉短视频内容逻辑。",
        mustHave: { skill: "文案/脚本", experience: "2年+", platform: "抖音/小红书" },
        niceToHave: { category: "美妆/日化", tool: "剪映/PR" },
        targetCompanies: ["内容平台", "MCN机构", "消费品品牌内容团队"],
        interviewFocus: ["选题策划能力", "脚本撰写", "爆款方法论", "素材协同"],
        salaryMin: 10000, salaryMax: 18000,
      },
    }),
    prisma.job.create({
      data: {
        title: "品牌策划", jobCode: "BRAND-001", brandLine: "理然", departmentId: deptBrand.id, level: "S4", status: "open", priority: "high",
        ownerId: userRecruiter.id, businessOwnerId: userInterviewer.id, location: "深圳", headcount: 1,
        jdText: "负责品牌传播策略、营销方案策划、项目执行与效果评估。",
        profileSummary: "3年以上品牌策划经验，有快消/美妆行业背景优先。",
        mustHave: { industry: "快消/美妆", experience: "3年+", skill: "品牌策划" },
        niceToHave: { campaign: "整合营销", budget: "100万+" },
        targetCompanies: ["快消品牌", "美妆品牌", "4A广告公司"],
        interviewFocus: ["品牌策略", "整合营销", "项目落地", "创意判断"],
        salaryMin: 15000, salaryMax: 25000,
      },
    }),
    prisma.job.create({
      data: {
        title: "OEM采购", jobCode: "SCM-002", brandLine: "理然", departmentId: deptScm.id, level: "S3", status: "open", priority: "normal",
        ownerId: userRecruiter.id, businessOwnerId: userBiz.id, location: "深圳", headcount: 1,
        jdText: "负责OEM供应资源开发、供应商管理、品类协同与成本控制。",
        profileSummary: "3年以上OEM采购经验，熟悉日化/美妆OEM工厂资源。",
        mustHave: { industry: "日化/美妆", experience: "3年+", skill: "OEM采购" },
        niceToHave: { region: "华南", category: "护肤品/彩妆" },
        targetCompanies: ["日化OEM工厂", "美妆供应链", "个护品类供应商"],
        interviewFocus: ["OEM工厂资源", "成本控制", "品类协同", "供应商管理"],
        salaryMin: 12000, salaryMax: 20000,
      },
    }),
    prisma.job.create({
      data: {
        title: "抖音主播", jobCode: "ECOMM-002", brandLine: "理然", departmentId: deptEcomm.id, level: "A2", status: "open", priority: "high",
        ownerId: userRecruiter.id, businessOwnerId: userInterviewer.id, location: "深圳", headcount: 4,
        jdText: "负责抖音直播讲品、转化、互动、直播表现优化，配合场控完成直播目标。",
        profileSummary: "1年以上直播经验，表达流畅、亲和力强、有美妆/日化经验优先。",
        mustHave: { skill: "直播讲品", platform: "抖音", experience: "1年+" },
        niceToHave: { category: "美妆", followers: "1万+" },
        targetCompanies: ["抖音直播生态", "MCN机构", "美妆/日化品牌"],
        interviewFocus: ["讲品能力", "转化话术", "镜头表现力", "粉丝互动"],
        salaryMin: 10000, salaryMax: 20000,
      },
    }),
    // Job 9: 招聘专员 — HRBP 部门验收数据
    prisma.job.upsert({ where: { jobCode: "HR-001" }, update: {}, create: {
      title: "招聘专员", jobCode: "HR-001", brandLine: "理然", departmentId: deptHR.id, level: "A3",
      status: "open", priority: "normal",
      ownerId: userHrbp.id, businessOwnerId: userHrbp.id,
      location: "深圳", headcount: 1,
      jdText: "负责全公司招聘流程支持，维护招聘渠道，协调面试安排。",
      profileSummary: "2年以上招聘执行经验，熟悉快消/日化行业招聘优先。",
      mustHave: { skill: "招聘全流程", tools: "BOSS直聘/猎聘", experience: "2年+" },
      niceToHave: { industry: "快消/日化", cert: "人力资源管理师" },
      targetCompanies: ["快消/日化行业", "互联网招聘平台"],
      interviewFocus: ["招聘全流程理解", "候选人沟通", "面试评估", "渠道运营"],
      salaryMin: 8000, salaryMax: 15000,
    } }),
  ]);

  // === 4. Candidates (8 虚拟候选人) ===
  const candidates = await Promise.all([
    prisma.candidate.create({ data: { name: "林可", email: "lin.ke@example.com", phone: "13800000001", source: "BOSS直聘", currentCompany: "宝洁中国", currentTitle: "KA经理", resumeSummary: "5年快消KA经验，负责华南区名创/三福渠道，年销售额3000万+。", tags: ["快消", "KA", "名创"] } }),
    prisma.candidate.create({ data: { name: "周亦然", email: "zhou.yiran@example.com", phone: "13800000002", source: "猎头推荐", currentCompany: "欧莱雅", currentTitle: "采购主管", resumeSummary: "3年日化采购经验，管理20+供应商，年度采购额5000万+。", tags: ["日化", "采购", "供应链"] } }),
    prisma.candidate.create({ data: { name: "陈书妍", email: "chen.shuyan@example.com", phone: "13800000003", source: "拉勾网", currentCompany: "字节跳动", currentTitle: "媒介经理", resumeSummary: "4年媒介投放经验，抖音/小红书双平台，月投放预算500万+。", tags: ["媒介", "抖音", "投放"] } }),
    prisma.candidate.create({ data: { name: "许安然", email: "xu.anran@example.com", phone: "13800000004", source: "BOSS直聘", currentCompany: "无忧传媒", currentTitle: "直播运营", resumeSummary: "2年直播场控经验，单场GMV最高50万+，熟悉美妆直播节奏。", tags: ["直播", "场控", "美妆"] } }),
    prisma.candidate.create({ data: { name: "赵明远", email: "zhao.mingyuan@example.com", phone: "13800000005", source: "内推", currentCompany: "小红书", currentTitle: "内容运营", resumeSummary: "3年内容编辑经验，擅长短视频脚本与选题策划，爆款率15%+。", tags: ["内容", "短视频", "脚本"] } }),
    prisma.candidate.create({ data: { name: "顾清和", email: "gu.qinghe@example.com", phone: "13800000006", source: "猎头推荐", currentCompany: "联合利华", currentTitle: "品牌经理", resumeSummary: "5年品牌策划经验，主导过3个新品上市项目，预算管理2000万+。", tags: ["品牌", "快消", "新品上市"] } }),
    prisma.candidate.create({ data: { name: "沈知意", email: "shen.zhiyi@example.com", phone: "13800000007", source: "BOSS直聘", currentCompany: "科丝美诗", currentTitle: "OEM采购", resumeSummary: "4年OEM采购经验，管理华南区30+工厂资源，熟悉护肤品/彩妆品类。", tags: ["OEM", "采购", "美妆"] } }),
    prisma.candidate.create({ data: { name: "陆嘉宁", email: "lu.jianing@example.com", phone: "13800000008", source: "BOSS直聘", currentCompany: "美ONE", currentTitle: "主播", resumeSummary: "2年抖音直播经验，美妆赛道，场均在线500+，转化率8%。", tags: ["主播", "抖音", "美妆"] } }),
    // Candidate 9: HRBP 部门验收数据
    prisma.candidate.create({ data: { name: "苏敏", email: "su.min@example.com", phone: "13800000009", source: "猎聘", currentCompany: "蓝月亮", currentTitle: "招聘主管", resumeSummary: "5年快消行业招聘经验，年招聘量50+，擅长销售/市场岗位。", tags: ["招聘", "快消", "HR"] } }),
    prisma.candidate.create({ data: { name: "吴启明", email: "wu.qiming@example.com", phone: "13800000010", source: "BOSS直聘", currentCompany: "完美日记", currentTitle: "HR专员", resumeSummary: "3年美妆行业HR经验，熟悉招聘全流程，有HR系统上线经验。", tags: ["HR", "美妆", "系统"] } }),
  ]);

  // === 5. Applications (8 投递) ===
  const apps = await Promise.all([
    prisma.application.create({ data: { jobId: jobs[0].id, candidateId: candidates[0].id, stage: "business_screen", status: "active", ownerId: userRecruiter.id, source: "BOSS直聘", fitScore: 85 } }),
    prisma.application.create({ data: { jobId: jobs[1].id, candidateId: candidates[1].id, stage: "hr_screen", status: "active", ownerId: userRecruiter.id, source: "猎头推荐", fitScore: 78 } }),
    prisma.application.create({ data: { jobId: jobs[2].id, candidateId: candidates[2].id, stage: "first_interview", status: "active", ownerId: userRecruiter.id, source: "拉勾网", fitScore: 90 } }),
    prisma.application.create({ data: { jobId: jobs[3].id, candidateId: candidates[3].id, stage: "sourced", status: "active", ownerId: userRecruiter.id, source: "BOSS直聘", fitScore: 72 } }),
    prisma.application.create({ data: { jobId: jobs[4].id, candidateId: candidates[4].id, stage: "second_interview", status: "active", ownerId: userRecruiter.id, source: "内推", fitScore: 88 } }),
    prisma.application.create({ data: { jobId: jobs[5].id, candidateId: candidates[5].id, stage: "offer_risk", status: "active", ownerId: userRecruiter.id, source: "猎头推荐", fitScore: 92 } }),
    prisma.application.create({ data: { jobId: jobs[6].id, candidateId: candidates[6].id, stage: "hr_screen", status: "active", ownerId: userRecruiter.id, source: "BOSS直聘", fitScore: 75 } }),
    prisma.application.create({ data: { jobId: jobs[7].id, candidateId: candidates[7].id, stage: "first_interview", status: "active", ownerId: userRecruiter.id, source: "BOSS直聘", fitScore: 82 } }),
    // Applications 9-10: HRBP 部门验收数据
    prisma.application.create({ data: { jobId: jobs[8].id, candidateId: candidates[8].id, stage: "hr_screen", status: "active", ownerId: userHrbp.id, source: "猎聘", fitScore: 80 } }),
    prisma.application.create({ data: { jobId: jobs[8].id, candidateId: candidates[9].id, stage: "sourced", status: "active", ownerId: userHrbp.id, source: "BOSS直聘", fitScore: 75 } }),
  ]);

  // === 6. Interviews + Feedback ===
  const interview1 = await prisma.interview.create({
    data: {
      applicationId: apps[2].id, round: "business_first", interviewerId: userInterviewer.id,
      status: "completed", scheduledAt: new Date("2025-06-20"), completedAt: new Date("2025-06-20"),
    },
  });
  await prisma.interviewFeedback.create({
    data: {
      interviewId: interview1.id, interviewerId: userInterviewer.id,
      overallRecommendation: "HIRE",
      scores: { role_competency: 4, business_understanding: 4, problem_solving: 3, communication: 4, ownership_collaboration: 4, motivation_stability: 4 },
      evidenceText: "抖音投放经验丰富，数据驱动思维强。跨部门协作经验偏少。",
      suggestedFollowUpQuestions: ["安排业务复试", "确认薪资期望"],
    },
  });

  const interview2 = await prisma.interview.create({
    data: {
      applicationId: apps[4].id, round: "business_first", interviewerId: userInterviewer.id,
      status: "completed", scheduledAt: new Date("2025-06-18"), completedAt: new Date("2025-06-18"),
    },
  });
  await prisma.interviewFeedback.create({
    data: {
      interviewId: interview2.id, interviewerId: userInterviewer.id,
      overallRecommendation: "STRONG_HIRE",
      scores: { role_competency: 5, business_understanding: 4, problem_solving: 4, communication: 5, ownership_collaboration: 5, motivation_stability: 4 },
      evidenceText: "文案功底扎实，爆款率高，内容sense好。管理经验偏少。",
      suggestedFollowUpQuestions: ["安排终面"],
    },
  });

  const interview3 = await prisma.interview.create({
    data: {
      applicationId: apps[5].id, round: "ceo_final", interviewerId: userLeader.id,
      status: "completed", scheduledAt: new Date("2025-06-15"), completedAt: new Date("2025-06-15"),
    },
  });
  await prisma.interviewFeedback.create({
    data: {
      interviewId: interview3.id, interviewerId: userLeader.id,
      overallRecommendation: "STRONG_HIRE",
      scores: { role_competency: 5, business_understanding: 5, problem_solving: 4, communication: 5, ownership_collaboration: 5, motivation_stability: 5 },
      evidenceText: "品牌经验丰富，主导过3个新品上市，联合利华背景。",
      suggestedFollowUpQuestions: ["发Offer", "关注竞品Offer风险"],
    },
  });

  // === 7. BusinessFeedback ===
  await prisma.businessFeedback.create({
    data: {
      jobId: jobs[0].id, applicationId: apps[0].id, reviewerId: userBiz.id,
      decision: "PASS", reasonCode: "OTHER", reasonText: "KA经验匹配，渠道资源对口。",
    },
  });
  await prisma.businessFeedback.create({
    data: {
      jobId: jobs[1].id, applicationId: apps[1].id, reviewerId: userBiz.id,
      decision: "HOLD", reasonCode: "EXPERIENCE_MISMATCH", reasonText: "采购品类偏食品，日化经验不足。",
    },
  });

  // === 8. ActionItems ===
  await prisma.actionItem.create({
    data: {
      title: "KA大客户销售岗位候选人不足，需拓展渠道",
      description: "当前有效候选人仅3人，目标8人。",
      category: "process_blocker", priority: "high", status: "open",
      sourceType: "job_pipeline", sourceRefId: jobs[0].id,
      createdById: userRecruiter.id,
      ownerId: userRecruiter.id,
      jobId: jobs[0].id,
      applicationId: apps[0].id,
    },
  });
  await prisma.actionItem.create({
    data: {
      title: "品牌策划Offer风险：竞品Offer",
      description: "顾清和已收到竞品Offer，需加速决策。",
      category: "offer_risk", priority: "high", status: "open",
      sourceType: "offer_risk", sourceRefId: apps[5].id,
      createdById: userHrbp.id,
      ownerId: userHrbp.id,
      jobId: jobs[5]?.id || jobs[0].id,
      applicationId: apps[5].id,
    },
  });

  // === 9. OfferRisks ===
  await prisma.offerRisk.create({
    data: {
      applicationId: apps[5].id, riskType: "COMPETING_OFFER", level: "critical",
      description: "候选人已收到联合利华Offer，薪资差距约15%。",
      ownerId: userHrbp.id, status: "open",
    },
  });
  await prisma.offerRisk.create({
    data: {
      applicationId: apps[2].id, riskType: "SALARY_GAP", level: "medium",
      description: "候选人期望薪资超出预算上限10%。",
      ownerId: userRecruiter.id, status: "open",
    },
  });

  // === 10. ActivityLogs ===
  await prisma.activityLog.createMany({
    data: [
      { actorId: userRecruiter.id, action: "JOB_CREATED", resourceType: "job", resourceId: jobs[0].id, detail: { title: jobs[0].title } },
      { actorId: userRecruiter.id, action: "CANDIDATE_CREATED", resourceType: "candidate", resourceId: candidates[0].id },
      { actorId: userRecruiter.id, action: "APPLICATION_CREATED", resourceType: "application", resourceId: apps[0].id },
      { actorId: userInterviewer.id, action: "INTERVIEW_FEEDBACK_SUBMITTED", resourceType: "interview_feedback", resourceId: interview1.id },
      { actorId: userHrbp.id, action: "OFFER_RISK_CREATED", resourceType: "offer_risk", resourceId: apps[5].id },
    ],
  });

  console.log("✅ Phase 2 seed completed.");
  console.log(`   ${depts.length} departments, ${users.length} users, ${jobs.length} jobs`);
  console.log(`   ${candidates.length} candidates, ${apps.length} applications`);
  console.log(`   3 interviews, 3 feedbacks, 2 business feedbacks`);
  console.log(`   2 action items, 2 offer risks, 5 activity logs`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
