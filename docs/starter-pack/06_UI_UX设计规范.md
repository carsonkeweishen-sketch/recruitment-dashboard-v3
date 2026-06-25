# 06｜UI / UX 设计规范

## 1. UI 定位

目标是轻量 SaaS 招聘工作台。不是传统后台、政企蓝白灰系统、大屏驾驶舱、军事化作战系统、花哨 Demo。

---

## 2. 参考方向

可以学习：Task Management UI Kit、Linear、Stripe、Attio、Greenhouse、Ashby、Airtable、Notion、Vercel。

不能复制：Superpage Logo、品牌名、头像素材、英文任务管理文案、完全相同视觉资产、逐像素复制。

---

## 3. 页面结构

```text
AppShell
  ├── Sidebar
  ├── Topbar
  └── Main Content
        ├── Page Header
        ├── KPI Cards
        ├── Filter / Search
        ├── Main Content
        └── Drawer / Modal
```

---

## 4. Design Token

必须使用：primary、primary-hover、primary-light、surface、surface-secondary、surface-tertiary、border、border-strong、text-primary、text-secondary、text-tertiary、success、success-light、warning、warning-light、danger、danger-light。

禁止在业务页面新增随意 hex。

---

## 5. 核心组件

必须建立并复用：MetricCard、SectionCard、StatusBadge、DataTable、DetailDrawer、FormModal、EmptyState、ErrorState、LoadingSkeleton、PermissionDenied、ActivityTimeline、StepIndicator、ActionButtonGroup。

---

## 6. 交互原则

每个按钮只做一个动作。允许：上传文件、保存映射、开始校验、确认导入、生成周报、确认周报、提交面试反馈、分析简历、标记已确认、刷新。

禁止：一键生成+确认+推送，一键分析+创建 Action+关闭风险，一键导入+自动推进候选人。

---

## 7. 文案禁用词

禁止：作战、战报、军情、火力、攻坚、指挥中心、AI 决策、自动淘汰、自动录用、智能定薪。

推荐：招聘复盘、风险提醒、建议动作、待处理、已确认、建议复核、辅助建议，仅供参考。

---

## 8. 页面状态

所有页面必须有 Loading、Empty、Error、PermissionDenied。不允许 undefined、null、NaN、Invalid Date、raw JSON dump。

---

## 9. 高密度页面原则

Jobs、Applications、Offer Risks 是高密度核心页面。要求：不随便套普通表格；详情用 Drawer；分区用 SectionCard；多信息用 Tabs；顶部只放最关键 KPI；AI 结果不要抢主视觉；Offer Risk 不替代 Moka。

---

## 10. UI 验收

每个 UI Phase 必须输出 Reference Landing 表：参考设计特征 -> 落地页面/组件 -> 截图文件。
