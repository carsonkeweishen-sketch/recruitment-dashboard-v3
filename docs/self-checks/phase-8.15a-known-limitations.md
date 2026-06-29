# Phase 8.15A Known Limitations (Updated)

基于 Phase 8.15 Release Lock 版本，在 Bug Bash 后更新。

---

## 1. 候选人中心
- **当前状态**: 空态
- **是否有真实候选人样本**: 否，candidates 表为 0 条记录
- **原因**: Moka 未对接，无候选人数据导入
- **计划**: Phase 9 导入真实候选人样本

## 2. DeepSeek 状态
- **当前状态**: 真实调用
- **是否降级**: 否，DEEPSEEK_API_KEY 已配置
- **模型**: deepseek-chat (deepseek-v4-flash)
- **No Evidence 行为**: 短路径拒答，不调用 LLM

## 3. Moka 状态
- **是否真实接入**: 否
- **当前状态**: 未配置，writebackEnabled=false
- **影响**: 无候选人数据，无状态同步

## 4. 飞书状态
- **是否真实接入**: 否
- **当前状态**: 未配置
- **影响**: 无消息通知，无审批流

## 5. Media/Speech
- **是否有真实样本**: 否
- **影响**: 无音视频处理能力

## 6. 可演示内容
| 模块 | 可演示 | 说明 |
|------|--------|------|
| Dashboard | ✅ | 100 岗位概览 |
| AI Copilot | ✅ | 真实 AI 问答+citation+Human Review+No Evidence |
| Job Center | ✅ | 100 岗位列表+详情 Drawer |
| Job Detail | ✅ | JD 原文+source trace |
| Knowledge | ✅ | JD/SOP 搜索+引用来源 |
| Data Sources | ✅ | 6 个真实文件记录 |
| Integrations | ✅ | 诚实状态展示 |
| Funnel | ✅ | 框架展示（数据待填充） |
| Action Center | ✅ | 框架展示（数据待填充） |
| Candidates | ⚠️ | 仅空态展示 |
| Interview Quality | ⚠️ | 仅框架展示 |
| Offer Risks | ⚠️ | 仅框架展示 |
| Media/Speech | ❌ | 无真实样本 |

## 7. 不能承诺的内容
- AI 自动筛选/录用/淘汰候选人
- Moka 双向同步
- 飞书审批流
- 视频面试
- 候选人数据就绪
- 系统可生产使用

## 8. Phase 9 需要补的真实业务数据
- Moka 候选人数据导入
- 候选人搜索与筛选
- Funnel 真实转化数据
- Action Center 真实待办
- 飞书集成

## 9. Phase 10 需要接的真实系统
- Moka API 对接
- 飞书 API 对接
- 视频面试平台
- 语音转文字服务
