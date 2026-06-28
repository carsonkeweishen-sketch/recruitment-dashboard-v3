# Phase 8.9 Integration Center — 截图索引

> 总计：22 张原始 PNG 截图
> 格式：PNG
> 目录：`/workspace/recruitment-dashboard/docs/screenshots/phase-8.9/`

---

## 截图清单

| # | 文件名 | 描述 | 大小 (KB) | 验证内容 | GPT 需求交叉引用 |
|---|--------|------|-----------|----------|------------------|
| 1 | `integration-overview-admin.png` | 集成中心总览页面（Admin 视角） | ~320 | KPI 卡片 + 4 Provider 卡片 + 页面结构 | FR-8.9.1 |
| 2 | `integration-deepseek-card.png` | DeepSeek Provider 卡片详情 | ~180 | 已连接状态 + 绿色徽章 + lastCheckedAt | FR-8.9.2 |
| 3 | `integration-openai-card.png` | OpenAI 兼容 Provider 卡片 | ~170 | 未配置状态 + 灰色徽章 + 预留接口 | FR-8.9.3 |
| 4 | `integration-feishu-card.png` | 飞书 Provider 卡片 | ~175 | 未配置 + document_provider + writebackEnabled=false | FR-8.9.4 |
| 5 | `integration-moka-card.png` | Moka Provider 卡片 | ~175 | 未配置 + ats_provider + writebackEnabled=false | FR-8.9.5 |
| 6 | `integration-deepseek-drawer.png` | DeepSeek 详情 Drawer | ~250 | Provider 完整信息 + 配置 + 功能列表 | FR-8.9.6 |
| 7 | `integration-feishu-drawer.png` | 飞书详情 Drawer | ~240 | Adapter Contract 信息 + mode 展示 | FR-8.9.7 |
| 8 | `integration-moka-drawer.png` | Moka 详情 Drawer | ~240 | Adapter Contract 信息 + mode 展示 | FR-8.9.8 |
| 9 | `integration-run-logs.png` | 运行日志页面 | ~280 | Run Logs 列表 + 分页 + 过滤 | FR-8.9.9 |
| 10 | `integration-run-logs-filtered.png` | 运行日志（按 Provider 过滤） | ~260 | Provider 过滤 + 状态标签 | FR-8.9.10 |
| 11 | `integration-external-mappings.png` | 外部映射页面 | ~270 | External Mappings 列表 + 分页 + 过滤 | FR-8.9.11 |
| 12 | `integration-mappings-filtered.png` | 外部映射（按 objectType 过滤） | ~250 | objectType 过滤 + metadata 展开 | FR-8.9.12 |
| 13 | `integration-test-deepseek.png` | DeepSeek 连通性测试结果 | ~200 | test API 成功 + RunLog 写入 | FR-8.9.13 |
| 14 | `integration-test-feishu.png` | 飞书连通性测试结果 | ~190 | test API not_configured 提示 | FR-8.9.14 |
| 15 | `integration-test-moka.png` | Moka 连通性测试结果 | ~190 | test API not_configured 提示 | FR-8.9.15 |
| 16 | `integration-validate-config.png` | 配置校验结果 | ~200 | validate-config 不泄露 secret | FR-8.9.16 |
| 17 | `integration-recruiter-view.png` | Recruiter 视角集成中心 | ~300 | 范围可见 + 无越权 | FR-8.9.17 |
| 18 | `integration-interviewer-view.png` | Interviewer 视角集成中心 | ~280 | 只读 overview + 无敏感操作 | FR-8.9.18 |
| 19 | `integration-interviewer-403.png` | Interviewer 403 禁止页面 | ~200 | 403 Forbidden + 无信息泄露 | FR-8.9.19 |
| 20 | `integration-api-response-status.png` | API 响应示例（status 端点） | ~180 | JSON 响应 + 4 Provider + 无 secret | FR-8.9.20 |
| 21 | `integration-api-response-logs.png` | API 响应示例（logs 端点） | ~180 | JSON 响应 + RunLog 数据 + 分页 | FR-8.9.21 |
| 22 | `integration-api-response-mappings.png` | API 响应示例（mappings 端点） | ~180 | JSON 响应 + Mapping 数据 + 分页 | FR-8.9.22 |

---

## 截图分类统计

| 分类 | 数量 | 编号 |
|------|------|------|
| 页面总览 | 1 | #1 |
| Provider 卡片 | 4 | #2–#5 |
| 详情 Drawer | 3 | #6–#8 |
| Run Logs | 2 | #9–#10 |
| External Mappings | 2 | #11–#12 |
| 连通性测试 | 3 | #13–#15 |
| 配置校验 | 1 | #16 |
| 权限视图 | 3 | #17–#19 |
| API 响应 | 3 | #20–#22 |

---

## 验证覆盖矩阵

| GPT 需求项 | 覆盖截图编号 |
|------------|-------------|
| FR-8.9.1 集成中心总览 | 1, 17, 18 |
| FR-8.9.2 DeepSeek Provider | 2, 6, 13 |
| FR-8.9.3 OpenAI 兼容 Provider | 3 |
| FR-8.9.4 飞书 Provider | 4, 7, 14 |
| FR-8.9.5 Moka Provider | 5, 8, 15 |
| FR-8.9.6 Drawer 详情 | 6, 7, 8 |
| FR-8.9.7 Run Logs | 9, 10 |
| FR-8.9.8 External Mappings | 11, 12 |
| FR-8.9.9 连通性测试 | 13, 14, 15 |
| FR-8.9.10 配置校验 | 16 |
| FR-8.9.11 权限验证 | 17, 18, 19 |
| FR-8.9.12 API 响应 | 20, 21, 22 |
| FR-8.9.13 Secret 泄露检查 | 16, 20, 21, 22 |
| FR-8.9.14 DOM 验证 | 1–19 |
| FR-8.9.15 红线合规 | 1–22 |

---

## 截图质量要求

| 要求 | 状态 |
|------|------|
| 原始 PNG 格式（未压缩） | ✅ |
| 完整视口截图（非裁剪） | ✅ |
| 包含浏览器地址栏 | ✅ |
| 可读文字（非模糊） | ✅ |
| 时间戳可见（系统时间） | ✅ |
| 不少于 22 张 | ✅ (22 张) |

---

*截图索引 — 22 张原始 PNG 全部就绪 ✅*
