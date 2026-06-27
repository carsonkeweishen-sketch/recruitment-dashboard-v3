# 产品边界调整报告

> 日期：2026-06-27 | 分支：agent/workbuddy/phase-7

## 调整内容

| 调整项 | 状态 |
|--------|------|
| 周报模块是否已从主线移除 | 是 |
| 面试流程推进是否已从主线移除 | 是 |
| Moka 是否被定义为流程推进主系统 | 是 |
| 本系统是否只保留分析/判断/风险/洞察能力 | 是 |
| 导航是否已更新 | 是 |
| Module Roadmap 是否已更新 | 是 |
| Module Registry 是否已更新 | 是 |
| 是否存在自动推进流程文案 | 否 |
| 是否存在自动录用/淘汰文案 | 否 |
| 是否合并 main | 否 |
| 是否 force push | 否 |

## 产品定位

理然智能招聘 AI 看板专注于招聘判断、风险识别、面试质量、候选人评估、岗位卡点和行动闭环；
周报由外部产品承接，面试流程推进由 Moka 承接。

## 导航变更

| 旧分组 | 新分组 | 说明 |
|--------|--------|------|
| 招聘运营（岗位/候选人/投递） | 招聘分析（岗位分析/候选人评估/数据漏斗） | 去掉"投递"独立入口 |
| 面试（面试管理/面试反馈/面试官质量） | 面试质量（面试质量/面试官质量） | 去掉流程推进语义 |
| 分析（AI分析中心/周报复盘） | — | 删除独立分析分组 |
| — | 风险分析（Offer风险） | 新增风险分析分组 |
| 设置（知识库/设置） | 知识资产（知识库/模板库）+ 设置（集成/设置） | 拆分 |

## 模块路线调整

| 旧模块 | 新模块 | 调整 |
|--------|--------|------|
| Interview Center / 面试中心 | Interview Quality Center / 面试质量中心 | 不做流程推进 |
| Reports / 周报与复盘中心 | — | 删除独立模块 |
| Applications / 投递推进 | — | 不作为独立模块 |

## 修改文件清单

- `components/layout/Sidebar.tsx` — 导航分组调整
- `server/config/module-registry.ts` — 模块注册表更新
- `docs/product/PRODUCT_INFORMATION_ARCHITECTURE.md` — 模块架构更新
- `docs/product/MODULE_ROADMAP.md` — 路线图更新
- `docs/product/PRODUCT_NAMING_GLOSSARY.md` — 命名规范更新
- `docs/product/AI_CAPABILITY_FRAMEWORK.md` — AI边界更新
