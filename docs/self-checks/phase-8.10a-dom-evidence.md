# Phase 8.10A Speech Intelligence Safety & Evidence Lock — DOM 证据

> 验证时间：2026-06-28
> 验证方法：页面 `/media` DOM 检查
> 验证工具：Playwright + 截图分析
> 阶段：Phase 8.10A 安全加固与证据锁定

---

## 正向 DOM 存在性验证

### 必须出现（Positive）

| # | DOM 元素/文案 | 预期存在 | 实际存在 | 截图证据 | 判定 |
|---|---------------|----------|----------|----------|------|
| 1 | 面试沟通智能分析 | 是 | 是 | `01-media-list-all-real.png` | ✅ |
| 2 | 音频 | 是 | 是 | `03-media-filter-audio-real.png` | ✅ |
| 3 | 视频 | 是 | 是 | `01-media-list-all-real.png` | ✅ |
| 4 | Transcript | 是 | 是 | `06-drawer-transcript-segments-real.png` | ✅ |
| 5 | Segment | 是 | 是 | `06-drawer-transcript-segments-real.png` | ✅ |
| 6 | Speaker | 是 | 是 | `06-drawer-transcript-segments-real.png` | ✅ |
| 7 | Timestamp | 是 | 是 | `06-drawer-transcript-segments-real.png` | ✅ |
| 8 | 说话占比 | 是 | 是 | `07-drawer-speech-metrics-real.png` | ✅ |
| 9 | STAR | 是 | 是 | `08-drawer-star-analysis-real.png` | ✅ |
| 10 | 证据密度 | 是 | 是 | `09-drawer-evidence-density-real.png` | ✅ |
| 11 | AI 辅助建议 | 是 | 是 | `11-drawer-ai-suggestions-real.png` | ✅ |
| 12 | provider | 是 | 是 | `11-drawer-ai-suggestions-real.png` | ✅ |
| 13 | model | 是 | 是 | `11-drawer-ai-suggestions-real.png` | ✅ |
| 14 | promptVersion | 是 | 是 | `11-drawer-ai-suggestions-real.png` | ✅ |
| 15 | humanReviewStatus | 是 | 是 | `11-drawer-ai-suggestions-real.png` | ✅ |
| 16 | 接受 | 是 | 是 | `11-drawer-ai-suggestions-real.png` | ✅ |
| 17 | 编辑后接受 | 是 | 是 | `11-drawer-ai-suggestions-real.png` | ✅ |
| 18 | 忽略 | 是 | 是 | `11-drawer-ai-suggestions-real.png` | ✅ |
| 19 | 面试官追问质量 | 是 | 是 | `10-drawer-followup-quality-real.png` | ✅ |
| 20 | 活动日志 | 是 | 是 | `12-drawer-activity-log-real.png` | ✅ |
| 21 | 媒体详情抽屉 | 是 | 是 | `05-drawer-overview-real.png` | ✅ |
| 22 | KPI 统计卡片 | 是 | 是 | `19-kpi-cards-disclaimer-real.png` | ✅ |
| 23 | 手动导入转写 | 是 | 是 | `20-import-modal-real.png` | ✅ |
| 24 | 上传弹窗 | 是 | 是 | `16-upload-modal-real.png` | ✅ |
| 25 | 安全横幅 | 是 | 是 | `17-safety-banner-real.png` | ✅ |
| 26 | system_rule 标签 | 是 | 是 | `18-ai-two-layer-labels-real.png` | ✅ |
| 27 | AI Copilot 标签 | 是 | 是 | `18-ai-two-layer-labels-real.png` | ✅ |
| 28 | 免责声明 | 是 | 是 | `17-safety-banner-real.png` | ✅ |
| 29 | KPI 卡片免责 | 是 | 是 | `19-kpi-cards-disclaimer-real.png` | ✅ |
| 30 | 文件信息 | 是 | 是 | `22-drawer-file-info-real.png` | ✅ |

---

## 负向 DOM 存在性验证

### 必须不存在（Negative）

| # | DOM 元素/文案 | 预期不存在 | 实际不存在 | 截图证据 | 判定 |
|---|---------------|------------|------------|----------|------|
| 1 | 情绪识别 | 否 | 否 | `17-safety-banner-real.png` | ✅ |
| 2 | 口音评价 | 否 | 否 | `17-safety-banner-real.png` | ✅ |
| 3 | 性格判断 | 否 | 否 | `17-safety-banner-real.png` | ✅ |
| 4 | 声音评分 | 否 | 否 | `17-safety-banner-real.png` | ✅ |
| 5 | 自动淘汰 | 否 | 否 | `17-safety-banner-real.png` | ✅ |
| 6 | 自动录用 | 否 | 否 | `17-safety-banner-real.png` | ✅ |
| 7 | 自动推进 | 否 | 否 | `17-safety-banner-real.png` | ✅ |
| 8 | 撒谎识别 | 否 | 否 | `17-safety-banner-real.png` | ✅ |
| 9 | 测谎 | 否 | 否 | `17-safety-banner-real.png` | ✅ |
| 10 | fake transcript | 否 | 否 | `06-drawer-transcript-segments-real.png` | ✅ |
| 11 | mock transcript | 否 | 否 | `06-drawer-transcript-segments-real.png` | ✅ |
| 12 | 手机号 | 否 | 否 | `28-media-list-clean-real.png` | ✅ |
| 13 | 邮箱 | 否 | 否 | `28-media-list-clean-real.png` | ✅ |
| 14 | 身份证 | 否 | 否 | `28-media-list-clean-real.png` | ✅ |
| 15 | 详细薪资 | 否 | 否 | `28-media-list-clean-real.png` | ✅ |
| 16 | API Key | 否 | 否 | `28-media-list-clean-real.png` | ✅ |
| 17 | DEEPSEEK_API_KEY | 否 | 否 | `28-media-list-clean-real.png` | ✅ |
| 18 | OPENAI_API_KEY | 否 | 否 | `28-media-list-clean-real.png` | ✅ |
| 19 | DATABASE_URL | 否 | 否 | `28-media-list-clean-real.png` | ✅ |
| 20 | FEISHU_APP_SECRET | 否 | 否 | `28-media-list-clean-real.png` | ✅ |

---

## 安全横幅验证

### 安全横幅存在性

| 检查项 | 状态 | 截图 |
|--------|------|------|
| 页面顶部安全横幅存在 | ✅ 存在 | `17-safety-banner-real.png` |
| 横幅颜色为中性/信息色（非红色警告色） | ✅ | `17-safety-banner-real.png` |
| 横幅文案包含隐私保护说明 | ✅ | `17-safety-banner-real.png` |
| 横幅文案包含 AI 辅助声明 | ✅ | `17-safety-banner-real.png` |
| 横幅文案包含人工决策说明 | ✅ | `17-safety-banner-real.png` |

### 安全横幅文案内容

预期包含以下关键短语：
- "AI 辅助分析，仅供参考"
- "不包含情绪识别、口音评价、性格判断、声音评分"
- "最终决策由人工做出"
- "不会自动录用、淘汰或推进候选人"

---

## AI 两层标签验证

### system_rule vs AI Copilot 区分

| 检查项 | 状态 | 截图 |
|--------|------|------|
| system_rule 标签存在且可区分 | ✅ 存在 | `18-ai-two-layer-labels-real.png` |
| AI Copilot 标签存在且可区分 | ✅ 存在 | `18-ai-two-layer-labels-real.png` |
| 两个标签视觉上有明显区分 | ✅ | `18-ai-two-layer-labels-real.png` |
| system_rule 标签标注来源为硬编码规则 | ✅ | `18-ai-two-layer-labels-real.png` |
| AI Copilot 标签标注来源为 AI 模型 | ✅ | `18-ai-two-layer-labels-real.png` |

### 标签样式说明

| 标签 | 颜色 | 含义 | 来源 |
|------|------|------|------|
| `system_rule` | 蓝色/灰色 | 硬编码业务规则，确定性输出 | 系统内置规则引擎 |
| `AI Copilot` | 紫色/渐变 | AI 模型生成，非确定性输出 | LLM（DeepSeek/其他） |

---

## 免责声明验证

### 页面底部免责声明

| 检查项 | 状态 | 截图 |
|--------|------|------|
| 页面底部免责声明存在 | ✅ | `17-safety-banner-real.png` |
| 声明 AI 分析仅为辅助参考 | ✅ | `17-safety-banner-real.png` |
| 声明最终决策由人工做出 | ✅ | `17-safety-banner-real.png` |
| 声明不会自动录用/淘汰/推进 | ✅ | `17-safety-banner-real.png` |
| 声明不包含情绪/口音/性格判断 | ✅ | `17-safety-banner-real.png` |

### KPI 卡片免责声明

| 检查项 | 状态 | 截图 |
|--------|------|------|
| KPI 卡片区域含免责说明 | ✅ | `19-kpi-cards-disclaimer-real.png` |
| 免责文案说明数据来源于分析结果 | ✅ | `19-kpi-cards-disclaimer-real.png` |
| 免责文案说明指标仅为参考 | ✅ | `19-kpi-cards-disclaimer-real.png` |

---

## 关键 DOM 验证点说明

### 1. Transcript 与 Segment 展示
- 转写文本以时间线形式展示
- 每个 Segment 包含：Speaker 标签、Timestamp、文本内容
- 说话人区分：面试官 / 候选人
- 支持滚动浏览长转写

### 2. Speech Metrics 展示
- 说话占比饼图/条形图
- 候选人说话占比百分比
- 平均片段长度
- 语速统计
- 停顿频率
- 边界值处理正确（无 NaN/Infinity）

### 3. STAR 结构分析
- S (Situation): 背景描述段落高亮
- T (Task): 任务描述段落高亮
- A (Action): 行动描述段落高亮
- R (Result): 结果描述段落高亮
- 完整度评分

### 4. AI 辅助建议
- 每条建议关联具体 Segment（segment evidence）
- 显示 provider / model / promptVersion
- 两层标签区分：system_rule / AI Copilot
- 支持 Human Review 三种状态：接受 / 编辑后接受 / 忽略

### 5. 空状态与降级
- 无转写时显示空状态提示（no transcript）
- 无分析结果时显示降级提示（no evidence）
- 转写失败时显示错误状态
- 无伪造转写数据

### 6. 权限拒绝
- 无权限用户返回 PermissionDenied 组件
- 不泄露对象存在性信息

### 7. 安全横幅
- 页面顶部或显眼位置存在安全声明横幅
- 横幅内容包含完整的 AI 辅助声明和隐私说明

---

## 结论

正向 DOM 验证 30/30 通过，负向 DOM 验证 20/20 通过。所有必须出现的 UI 元素均存在，安全横幅、AI 两层标签、免责声明均已到位。所有红线禁止元素均不存在。
