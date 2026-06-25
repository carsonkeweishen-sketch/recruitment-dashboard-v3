# Moka 系统边界

> 本文档明确 Recruitment Dashboard v3 与 Moka ATS 的边界关系。

## 核心原则

Recruitment Dashboard v3 **不替代** Moka，**不强绑定** Moka API。

## 本系统不做

1. Offer 发放
2. Offer 审批
3. 薪酬审批
4. 劳动合同管理
5. 入职手续办理
6. ATS 主流程替代
7. 候选人正式状态写回 Moka
8. Moka API 强绑定

## 本系统只做

1. 招聘效率分析
2. 漏斗与卡点诊断
3. 面试质量分析
4. Offer 风险提醒（不审批）
5. 入职前承诺台账
6. Action 协同
7. AI 辅助判断（不自动决策）
8. 周报复盘
9. 人才池沉淀
10. 面试官赋能

## 数据关系

- 可从 Moka 导出数据后导入本系统（Phase 8）
- 不实时同步 Moka 数据
- 不在本系统修改 Moka 数据
- 不通过 Moka API 写入

## 开源安全

- 不提交 Moka API Key
- 不提交 Moka 客户信息
- 不提交真实企业数据
- 示例数据均为虚构
- 内部资料放在 `private-data/`（已 gitignore）
