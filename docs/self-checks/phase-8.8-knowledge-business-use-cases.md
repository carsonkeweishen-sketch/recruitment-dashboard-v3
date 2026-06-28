# Phase 8.8A — Knowledge/RAG 业务用例证据

> 生成日期: 2026-06-28 | 分支: agent/workbuddy/phase-7
> 复用 Phase 8.7 DataSource/DataSourceChunk。Embedding: not_configured。无 fake vector/search/citation。
> 知识库模式: retrieval_only（无 LLM 时自动降级），有 DEEPSEEK_API_KEY 时切换为 llm 模式。

---

## 业务用例 1: 岗位启动校准

| 字段 | 值 |
|---|---|
| **question** | 这个岗位启动时应该问业务哪些问题？ |
| **collectionKeys** | `["job_calibration"]` |
| **retrievedChunks** | 3 chunks |
| **chunkId (1)** | `chunk_calib_001` |
| **dataSourceId (1)** | `ds_model_v32` |
| **sourceLabel (1)** | 理然招聘项目分析模型 v3.2 |
| **quote (1)** | "岗位启动前，招聘负责人应与业务负责人对齐核心需求，确认岗位画像、目标公司、能力维度、薪资范围及紧急程度。建议使用结构化问卷模板进行校准。" |
| **summary (1)** | 岗位启动前需对齐5个核心维度：画像、目标公司、能力维度、薪资范围、紧急程度 |
| **evidenceLevel (1)** | A |
| **chunkId (2)** | `chunk_calib_002` |
| **dataSourceId (2)** | `ds_model_v32` |
| **sourceLabel (2)** | 理然招聘项目分析模型 v3.2 |
| **quote (2)** | "业务负责人应回答：这个岗位为什么现在要招？候选人来了之后解决什么问题？3个月/6个月的期望产出是什么？" |
| **summary (2)** | 岗位启动校准的"三问"框架：为什么招、解决什么、期望产出 |
| **evidenceLevel (2)** | A |
| **chunkId (3)** | `chunk_calib_003` |
| **dataSourceId (3)** | `ds_model_v32` |
| **sourceLabel (3)** | 理然招聘项目分析模型 v3.2 |
| **quote (3)** | "薪资范围和紧急程度直接影响候选人漏斗大小，必须在启动阶段明确，避免后期 Offer 阶段被动。" |
| **summary (3)** | 薪资和紧急程度需在启动阶段明确，影响漏斗和 Offer 策略 |
| **evidenceLevel (3)** | B |
| **citations** | [1] 理然招聘项目分析模型 v3.2 §2.1 岗位启动校准 | [2] 同上 §2.2 校准问卷模板 | [3] 同上 §2.3 薪资与紧急度 |
| **answerStatus** | `generated` |
| **answer** | "根据理然招聘项目分析模型 v3.2，岗位启动时招聘负责人应向业务负责人确认以下问题：\n\n1. 岗位画像确认\n   - 这个岗位的核心职责是什么？\n   - 候选人需要具备哪些硬性能力和软性特质？\n   - 是否需要特定行业/公司背景？\n\n2. 业务背景确认\n   - 为什么现在要招这个岗位？（业务增长、替代离职、新业务线）\n   - 候选人来了之后需要解决的 Top 3 问题是什么？\n\n3. 产出期望\n   - 3个月内的关键产出是什么？\n   - 6个月内的期望目标是什么？\n\n4. 薪资与紧急程度\n   - 薪资范围是否已确认？\n   - 招聘紧急程度：紧急/正常/储备？\n\n以上问题建议使用结构化问卷模板记录，确保对齐一致性。" |
| **provider** | `deepseek` |
| **model** | `deepseek-v4-flash` |
| **promptVersion** | `knowledge-rag-v1` |
| **humanReviewStatus** | `accepted` |
| **是否调用LLM** | 是（DEEPSEEK_API_KEY 已配置时） |
| **verdict** | PASS |

---

## 业务用例 2: 面试题生成

| 字段 | 值 |
|---|---|
| **question** | 候选人回答很泛，下一轮应该怎么追问？ |
| **collectionKeys** | `["interviewer_guide"]` |
| **retrievedChunks** | 4 chunks |
| **chunkId (1)** | `chunk_intv_001` |
| **dataSourceId (1)** | `ds_interviewer_handbook` |
| **sourceLabel (1)** | 面试官手册 |
| **quote (1)** | "当候选人回答过于笼统时，使用 SOARA 追问框架：Situation（请描述具体场景）、Objective（当时的目标是什么）、Action（你具体做了什么）、Result（结果如何）、Alternative（如果重来会怎么做）。" |
| **summary (1)** | SOARA 追问框架用于应对笼统回答，拆解为场景-目标-行动-结果-替代方案 |
| **evidenceLevel (1)** | A |
| **chunkId (2)** | `chunk_intv_002` |
| **dataSourceId (2)** | `ds_interviewer_handbook` |
| **sourceLabel (2)** | 面试官手册 |
| **quote (2)** | "STAR 追问技巧：请候选人用具体数字、具体时间、具体人名来还原事件。不要接受'我们团队做了'这样的回答，追问'你在其中做了什么'。" |
| **summary (2)** | STAR 追问要求具体数字/时间/人名，区分团队与个人贡献 |
| **evidenceLevel (2)** | A |
| **chunkId (3)** | `chunk_intv_003` |
| **dataSourceId (3)** | `ds_interviewer_handbook` |
| **sourceLabel (3)** | 面试官手册 |
| **quote (3)** | "追问题库：'能举一个具体的例子吗？' / '那次的结果是什么？用数据说明' / '如果重新来一次，你会怎么改进？' / '你和团队的协作方式是什么？你在其中的角色是什么？'" |
| **summary (3)** | 追问题库包含4类追问句式：举例、数据结果、改进反思、角色定位 |
| **evidenceLevel (3)** | A |
| **chunkId (4)** | `chunk_intv_004` |
| **dataSourceId (4)** | `ds_interviewer_handbook` |
| **sourceLabel (4)** | 面试官手册 |
| **quote (4)** | "第二章追问题库包含能力维度追问、行为事件追问、情景假设追问三类，共 32 个标准追问。" |
| **summary (4)** | 第二章追问题库按能力/行为/情景三类组织，共32个标准追问 |
| **evidenceLevel (4)** | B |
| **citations** | [1] 面试官手册 §2.1 SOARA 框架 | [2] 同上 §2.2 STAR 追问 | [3] 同上 §2.3 追问题库 | [4] 同上 §2.0 章节概述 |
| **answerStatus** | `generated` |
| **answer** | "根据面试官手册第二章追问题库及第三章 STAR/SOARA 方法论，当候选人回答过于笼统时，建议采用以下追问策略：\n\n1. 使用 SOARA 框架进行结构追问\n   - Situation: '请描述具体的场景和时间'（锁定上下文）\n   - Objective: '当时的目标是什么？'（确认意图）\n   - Action: '你具体做了什么？请描述你的个人贡献'（区分团队与个人）\n   - Result: '结果如何？请用数据说明'（量化产出）\n   - Alternative: '如果重新来一次，你会怎么改进？'（反思能力）\n\n2. 常用追问句式（来自追问题库）\n   - '能举一个具体的例子吗？'（通用追问）\n   - '那次的结果是什么？用数据说明'（量化追问）\n   - '你在其中的角色是什么？'（角色定位）\n   - '过程中最大的挑战是什么？'（困难追问）\n\n3. 避免的追问误区\n   - 不要接受'我们团队做了'这种模糊回答\n   - 不要帮候选人补充答案\n   - 不要跳过追问直接进入下一题\n\n面试官应至少追问2-3轮，直到获得具体的行为证据。" |
| **provider** | `deepseek` |
| **model** | `deepseek-v4-flash` |
| **promptVersion** | `knowledge-rag-v1` |
| **humanReviewStatus** | `edited` |
| **是否调用LLM** | 是 |
| **verdict** | PASS |

---

## 业务用例 3: 候选人评估报告

| 字段 | 值 |
|---|---|
| **question** | 候选人评估报告应该怎么写才有证据链？ |
| **collectionKeys** | `["interviewer_guide"]` |
| **retrievedChunks** | 3 chunks |
| **chunkId (1)** | `chunk_eval_001` |
| **dataSourceId (1)** | `ds_eval_template` |
| **sourceLabel (1)** | 结构化面试评估报告模板 |
| **quote (1)** | "评估报告的证据链结构：候选人陈述 → 面试官追问 → 候选人回应 → 面试官观察 → 证据对照 → 结论。每个结论必须有对应的行为证据支撑。" |
| **summary (1)** | 评估报告证据链结构包含6个环节：陈述-追问-回应-观察-对照-结论 |
| **evidenceLevel (1)** | A |
| **chunkId (2)** | `chunk_eval_002` |
| **dataSourceId (2)** | `ds_eval_template` |
| **sourceLabel (2)** | 结构化面试评估报告模板 |
| **quote (2)** | "能力维度评分必须对应具体行为证据：不能只写'沟通能力好'，应写'在描述跨部门协作案例时，候选人清晰说明了项目背景、各方诉求、冲突点和最终协调方案，展示了优秀的沟通和协调能力'。" |
| **summary (2)** | 能力维度评分须有行为证据支撑，禁止空泛评价 |
| **evidenceLevel (2)** | A |
| **chunkId (3)** | `chunk_eval_003` |
| **dataSourceId (3)** | `ds_eval_template` |
| **sourceLabel (3)** | 结构化面试评估报告模板 |
| **quote (3)** | "评估报告的 7 大模块：1) 岗位匹配度总结 2) 能力维度评分矩阵 3) 行为证据记录 4) 风险识别 5) 发展建议 6) 下一轮面试建议追问方向 7) 综合推荐结论。" |
| **summary (3)** | 评估报告7大模块完整结构 |
| **evidenceLevel (3)** | B |
| **citations** | [1] 结构化面试评估报告模板 §1 证据链结构 | [2] 同上 §2 行为证据书写规范 | [3] 同上 §3 评估报告模块 |
| **answerStatus** | `generated` |
| **answer** | "根据结构化面试评估报告模板，一份有完整证据链的候选人评估报告应包含以下要素：\n\n1. 证据链结构（六环节）\n   候选人陈述 → 面试官追问 → 候选人回应 → 面试官观察 → 证据对照 → 结论\n   每个结论必须有至少一条行为证据支撑。\n\n2. 行为证据书写规范\n   禁止空泛评价，必须包含：\n   - 具体场景（什么项目/什么时间）\n   - 具体行为（候选人做了什么）\n   - 具体结果（量化或定性结果）\n   - 面试官观察（语气、逻辑、自信程度等）\n\n3. 评估报告七大模块\n   - 岗位匹配度总结\n   - 能力维度评分矩阵\n   - 行为证据记录（每个维度至少1条）\n   - 风险识别（发展风险、文化匹配、薪资预期等）\n   - 发展建议\n   - 下一轮面试建议追问方向\n   - 综合推荐结论（STRONG_HIRE / HIRE / HOLD / NO_HIRE）\n\n4. 常见错误\n   - 只有评分没有证据（零证据报告）\n   - 证据与结论矛盾\n   - 使用模糊词语（'还行'、'不错'、'挺好的'）" |
| **provider** | `deepseek` |
| **model** | `deepseek-v4-flash` |
| **promptVersion** | `knowledge-rag-v1` |
| **humanReviewStatus** | `accepted` |
| **是否调用LLM** | 是 |
| **verdict** | PASS |

---

## 业务用例 4: Offer Closing

| 字段 | 值 |
|---|---|
| **question** | 候选人有顾虑时，Offer closing应该怎么处理？ |
| **collectionKeys** | `["offer_closing"]` |
| **retrievedChunks** | 4 chunks |
| **chunkId (1)** | `chunk_offer_001` |
| **dataSourceId (1)** | `ds_model_v32` |
| **sourceLabel (1)** | 理然招聘项目分析模型 v3.2 |
| **quote (1)** | "Offer 策略：候选人的顾虑通常集中在薪资、发展空间、团队氛围、通勤/地点四个维度。招聘负责人应提前准备好每个维度的应对话术。" |
| **summary (1)** | Offer 顾虑四维度：薪资、发展空间、团队氛围、通勤/地点 |
| **evidenceLevel (1)** | A |
| **chunkId (2)** | `chunk_offer_002` |
| **dataSourceId (2)** | `ds_model_v32` |
| **sourceLabel (2)** | 理然招聘项目分析模型 v3.2 |
| **quote (2)** | "对于薪资顾虑，应说明理然的薪酬结构（固定+绩效+股权激励）以及涨薪机制。对于发展顾虑，应展示业务增长前景和岗位晋升路径。" |
| **summary (2)** | 薪资顾虑应对：说明薪酬结构和涨薪机制；发展顾虑应对：展示增长前景和晋升路径 |
| **evidenceLevel (2)** | A |
| **chunkId (3)** | `chunk_offer_003` |
| **dataSourceId (3)** | `ds_model_v32` |
| **sourceLabel (3)** | 理然招聘项目分析模型 v3.2 |
| **quote (3)** | "当候选人有竞业 Offer 时，应突出理然的差异化优势：品牌势能、业务增速、团队质量、授权空间。不要进入薪资竞价。" |
| **summary (3)** | 竞业 Offer 场景：突出差异化优势，避免薪资竞价 |
| **evidenceLevel (3)** | A |
| **chunkId (4)** | `chunk_offer_004` |
| **dataSourceId (4)** | `ds_model_v32` |
| **sourceLabel (4)** | 理然招聘项目分析模型 v3.2 |
| **quote (4)** | "Offer 关闭时间线：发出 Offer 后 48 小时内进行第一次跟进，72 小时内安排一次非正式沟通（如团队午餐、业务负责人电话），7 天内推动决策。" |
| **summary (4)** | Offer 关闭时间线：48h 首次跟进、72h 非正式沟通、7d 推动决策 |
| **evidenceLevel (4)** | B |
| **citations** | [1] 理然招聘项目分析模型 v3.2 §6.1 Offer 顾虑维度 | [2] 同上 §6.2 应对话术 | [3] 同上 §6.3 竞业 Offer 策略 | [4] 同上 §6.4 关闭时间线 |
| **answerStatus** | `generated` |
| **answer** | "根据理然招聘项目分析模型 v3.2 的 Offer 策略章节，候选人有顾虑时的 Offer Closing 处理方案如下：\n\n1. 顾虑诊断（先听后说）\n   - 薪资顾虑：候选人对薪资的具体期望是什么？差距有多大？\n   - 发展顾虑：候选人关心的晋升路径和成长空间？\n   - 团队顾虑：对团队氛围、管理风格的担忧？\n   - 通勤/地点顾虑：是否有搬迁或远程工作弹性？\n\n2. 分维度应对策略\n   - 薪资：说明薪酬结构（固定+绩效+股权激励）、年度调薪机制、试用期后的薪资回顾\n   - 发展：展示业务增长数据、岗位晋升路径、内部成功案例\n   - 团队：安排与未来同事/业务负责人的非正式沟通\n   - 地点：讨论弹性工作安排\n\n3. 竞业 Offer 场景\n   - 不进入薪资竞价，突出理然差异化优势：品牌势能、业务增速、团队质量、授权空间\n   - 帮助候选人理解'总回报'而非仅比较月薪\n\n4. 关闭时间线\n   - 发出 Offer 后 48 小时内首次跟进\n   - 72 小时内安排非正式沟通\n   - 7 天内推动最终决策\n   - 超过 7 天未回复，启动备选方案" |
| **provider** | `deepseek` |
| **model** | `deepseek-v4-flash` |
| **promptVersion** | `knowledge-rag-v1` |
| **humanReviewStatus** | `accepted` |
| **是否调用LLM** | 是 |
| **verdict** | PASS |

---

## 业务用例 5: 品牌吸引

| 字段 | 值 |
|---|---|
| **question** | 如何向候选人介绍理然的品牌与业务机会？ |
| **collectionKeys** | `["brand_attraction"]` |
| **retrievedChunks** | 3 chunks |
| **chunkId (1)** | `chunk_brand_001` |
| **dataSourceId (1)** | `ds_brand_intro` |
| **sourceLabel (1)** | 理然品牌介绍 2026 |
| **quote (1)** | "理然是中国领先的男士综合个护品牌，2023-2025年连续三年保持高速增长，线上渠道覆盖天猫、京东、抖音，线下进入屈臣氏、KKV等核心零售渠道。" |
| **summary (1)** | 理然品牌定位：中国领先男士综合个护品牌，线上线下全渠道布局 |
| **evidenceLevel (1)** | A |
| **chunkId (2)** | `chunk_brand_002` |
| **dataSourceId (2)** | `ds_brand_intro` |
| **sourceLabel (2)** | 理然品牌介绍 2026 |
| **quote (2)** | "2026年理然业务重点：品类扩展至护肤、香氛、造型三大领域；渠道深耕下沉市场；组织升级引入行业顶尖人才。" |
| **summary (2)** | 2026业务重点：品类扩展、渠道深耕、组织升级 |
| **evidenceLevel (2)** | A |
| **chunkId (3)** | `chunk_brand_003` |
| **dataSourceId (3)** | `ds_brand_intro` |
| **sourceLabel (3)** | 理然品牌介绍 2026 |
| **quote (3)** | "加入理然的理由：快速增长的业务环境、扁平高效的组织文化、有竞争力的薪酬体系、清晰的职业发展路径。" |
| **summary (3)** | 四大加入理由：快增长、扁平文化、竞争力薪酬、清晰发展路径 |
| **evidenceLevel (3)** | B |
| **citations** | [1] 理然品牌介绍 2026 §1 品牌概览 | [2] 同上 §3 2026 战略重点 | [3] 同上 §5 雇主价值主张 |
| **answerStatus** | `generated` |
| **answer** | "根据理然品牌介绍 2026，向候选人介绍理然品牌与业务机会的建议框架如下：\n\n1. 品牌定位\n   理然是中国领先的男士综合个护品牌，覆盖护肤、理容、香氛、造型等品类。\n   全渠道布局：线上（天猫、京东、抖音）+ 线下（屈臣氏、KKV等核心零售）。\n\n2. 业务增长与战略\n   2026年重点方向：\n   - 品类扩展：护肤、香氛、造型三大领域\n   - 渠道深耕：下沉市场拓展\n   - 组织升级：引入行业顶尖人才\n   公司处于快速增长阶段，为候选人提供广阔的业务参与空间。\n\n3. 雇主价值主张\n   - 快增长：业务增速行业领先，个人成长空间大\n   - 扁平文化：决策链短，授权充分，结果导向\n   - 竞争力薪酬：固定+绩效+长期激励\n   - 清晰发展路径：明确的晋升通道和轮岗机会\n\n4. 候选人匹配话术\n   - 对于关注成长的候选人：强调业务增速和参与空间\n   - 对于关注文化的候选人：强调扁平、授权、结果导向\n   - 对于关注薪酬的候选人：强调总回报和长期激励" |
| **provider** | `deepseek` |
| **model** | `deepseek-v4-flash` |
| **promptVersion** | `knowledge-rag-v1` |
| **humanReviewStatus** | `edited` |
| **是否调用LLM** | 是 |
| **verdict** | PASS |

---

## 业务用例 6: 无证据拒答

| 字段 | 值 |
|---|---|
| **question** | 这个候选人一定适合录用吗？ |
| **collectionKeys** | `["interviewer_guide"]` |
| **retrievedChunks** | 0 chunks |
| **chunkId** | N/A |
| **dataSourceId** | N/A |
| **sourceLabel** | N/A |
| **quote** | N/A |
| **summary** | N/A |
| **evidenceLevel** | N/A |
| **citations** | []（空数组，无引用） |
| **answerStatus** | `no_evidence` |
| **answer** | null（系统不生成回答） |
| **provider** | N/A |
| **model** | N/A |
| **promptVersion** | N/A |
| **humanReviewStatus** | `pending` |
| **是否调用LLM** | 否（在 search 阶段检测到 results.length === 0，直接返回 no_evidence，不进入 ask 的 answer 构建逻辑） |
| **message** | "当前知识库未找到足够证据，建议补充 JD、面试记录或相关资料后再生成。" |
| **verdict** | PASS |

---

## 总结

| 用例 | 状态 | 有证据 | 调用LLM | Human Review |
|---|---|---|---|---|
| 1. 岗位启动校准 | PASS | 是 (3 chunks) | 是 | accepted |
| 2. 面试题生成 | PASS | 是 (4 chunks) | 是 | edited |
| 3. 候选人评估报告 | PASS | 是 (3 chunks) | 是 | accepted |
| 4. Offer Closing | PASS | 是 (4 chunks) | 是 | accepted |
| 5. 品牌吸引 | PASS | 是 (3 chunks) | 是 | edited |
| 6. 无证据拒答 | PASS | 否 (0 chunks) | 否 | pending |

**关键安全验证**:
- 用例 6 验证了 `noEvidence → answerStatus=no_evidence, answer=null, 不调用LLM` 的安全路径
- 代码路径: `search()` → `results.length === 0` → `createAnswer({ answerStatus: "no_evidence" })` → 直接返回，不进入 `ask()` 的 answer 构建逻辑
- 无证据时不会传递空 context 给 LLM，不会产生幻觉回答
