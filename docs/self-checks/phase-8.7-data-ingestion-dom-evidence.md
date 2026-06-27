# Phase 8.7A Data Ingestion — DOM Evidence

> Mock: 否。全部来自真实 UI 渲染。

## DOM 正向 TRUE

| # | 验证项 | 预期 | 实际 | 通过 |
|---|--------|------|------|------|
| 1 | Has 资料接入 | TRUE | TRUE | PASS |
| 2 | Has 上传资料 | TRUE | TRUE | PASS |
| 3 | Has 飞书链接 | TRUE | TRUE | PASS |
| 4 | Has Moka 链接 | TRUE | TRUE | PASS |
| 5 | Has 解析状态 | TRUE | TRUE | PASS |
| 6 | Has 关联对象 | TRUE | TRUE | PASS |
| 7 | Has 可用于 AI | TRUE | TRUE | PASS |
| 8 | Has permission_required | TRUE | TRUE | PASS |
| 9 | Has transcription_pending | TRUE | TRUE | PASS |
| 10 | Has OCR_pending | TRUE | TRUE | PASS |
| 11 | Has not_configured | TRUE | TRUE | PASS |

## DOM 负向 FALSE

| # | 验证项 | 预期 | 实际 | 通过 |
|---|--------|------|------|------|
| 1 | Has 假同步 | FALSE | FALSE | PASS |
| 2 | Has 同步成功但未配置 | FALSE | FALSE | PASS |
| 3 | Has fake transcript | FALSE | FALSE | PASS |
| 4 | Has fake OCR | FALSE | FALSE | PASS |
| 5 | Has 手机号 | FALSE | FALSE | PASS |
| 6 | Has 邮箱 | FALSE | FALSE | PASS |
| 7 | Has 身份证 | FALSE | FALSE | PASS |
| 8 | Has 详细薪资 | FALSE | FALSE | PASS |
| 9 | Has API Key | FALSE | FALSE | PASS |
| 10 | Has 飞书 app secret | FALSE | FALSE | PASS |
| 11 | Has Moka token | FALSE | FALSE | PASS |
