#!/usr/bin/env python3
"""为 ready 状态的 MediaAsset 创建 Transcript + Segments + Metrics + Analysis 数据"""
import json, urllib.request, sys

BASE = "http://localhost:3000"

def api(method, path, body=None):
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return json.loads(e.read())

# Get ready assets
resp = api("GET", "/api/speech/media-assets")
ready_ids = [i["id"] for i in resp["data"]["items"] if i["transcriptionStatus"] == "ready"]
print(f"Found {len(ready_ids)} ready assets")

# Transcript data for KA产品经理_一面录音 (asset 1)
transcript_1 = {
    "mediaAssetId": ready_ids[0],
    "text": "面试官：请做一下自我介绍。\n\n候选人：您好，我叫张明，有5年KA渠道管理经验。之前在宝洁负责沃尔玛渠道，年GMV约2亿。我擅长渠道策略规划和经销商管理。\n\n面试官：能具体说说你在宝洁最大的成绩吗？\n\n候选人：2024年我主导了沃尔玛渠道的品类升级项目。通过优化货架陈列和促销节奏，将口腔护理品类的市场份额从18%提升到24%，带动渠道整体增长12%。\n\n面试官：你是如何推动这个项目的？\n\n候选人：首先做了数据诊断，发现我们的货架位置偏下，陈列面积不足。然后我联合品类管理和供应链团队，用尼尔森数据和内部销售数据做了商业论证，说服了采购方调整我们的货架位置。执行阶段我设了周度追踪机制，包括POS数据、库存周转和竞品动态。\n\n面试官：过程中遇到了什么阻力？\n\n候选人：最大的阻力来自竞品。我们调整货架后，竞品向采购施压要求恢复原状。我的应对策略是：用数据说话。我每周给采购发送品类表现报告，证明我们的品类升级不仅利己，也带动了整体品类增长，符合采购的KPI。\n\n面试官：团队管理方面你有什么经验？\n\n候选人：我带领一个4人团队。我的管理方式比较扁平，周会时让每个人分享本周的亮点和卡点，然后我们一起讨论解决方案。我注重结果导向，但也关注过程指标。比如我会追踪每人每周的客户拜访次数和新增意向数。\n\n面试官：为什么考虑离开宝洁来我们这里？\n\n候选人：宝洁是很好的平台，但理然的增长阶段更吸引我。我看到理然过去两年在新零售渠道的布局非常有前瞻性。我希望在一个更灵活的环境中，把大公司的系统方法论和创业公司的速度结合起来。",
    "segments": [
        {"speakerLabel": "面试官", "startMs": 0, "endMs": 5000, "text": "请做一下自我介绍。"},
        {"speakerLabel": "候选人", "startMs": 5000, "endMs": 18000, "text": "您好，我叫张明，有5年KA渠道管理经验。之前在宝洁负责沃尔玛渠道，年GMV约2亿。我擅长渠道策略规划和经销商管理。"},
        {"speakerLabel": "面试官", "startMs": 18000, "endMs": 24000, "text": "能具体说说你在宝洁最大的成绩吗？"},
        {"speakerLabel": "候选人", "startMs": 24000, "endMs": 50000, "text": "2024年我主导了沃尔玛渠道的品类升级项目。通过优化货架陈列和促销节奏，将口腔护理品类的市场份额从18%提升到24%，带动渠道整体增长12%。"},
        {"speakerLabel": "面试官", "startMs": 50000, "endMs": 56000, "text": "你是如何推动这个项目的？"},
        {"speakerLabel": "候选人", "startMs": 56000, "endMs": 98000, "text": "首先做了数据诊断，发现我们的货架位置偏下，陈列面积不足。然后我联合品类管理和供应链团队，用尼尔森数据和内部销售数据做了商业论证，说服了采购方调整我们的货架位置。执行阶段我设了周度追踪机制，包括POS数据、库存周转和竞品动态。"},
        {"speakerLabel": "面试官", "startMs": 98000, "endMs": 105000, "text": "过程中遇到了什么阻力？"},
        {"speakerLabel": "候选人", "startMs": 105000, "endMs": 145000, "text": "最大的阻力来自竞品。我们调整货架后，竞品向采购施压要求恢复原状。我的应对策略是：用数据说话。我每周给采购发送品类表现报告，证明我们的品类升级不仅利己，也带动了整体品类增长，符合采购的KPI。"},
        {"speakerLabel": "面试官", "startMs": 145000, "endMs": 152000, "text": "团队管理方面你有什么经验？"},
        {"speakerLabel": "候选人", "startMs": 152000, "endMs": 192000, "text": "我带领一个4人团队。我的管理方式比较扁平，周会时让每个人分享本周的亮点和卡点，然后我们一起讨论解决方案。我注重结果导向，但也关注过程指标。比如我会追踪每人每周的客户拜访次数和新增意向数。"},
        {"speakerLabel": "面试官", "startMs": 192000, "endMs": 200000, "text": "为什么考虑离开宝洁来我们这里？"},
        {"speakerLabel": "候选人", "startMs": 200000, "endMs": 245000, "text": "宝洁是很好的平台，但理然的增长阶段更吸引我。我看到理然过去两年在新零售渠道的布局非常有前瞻性。我希望在一个更灵活的环境中，把大公司的系统方法论和创业公司的速度结合起来。"}
    ]
}

# Transcript data for KA产品经理_二面视频 (asset 2) — deeper, more technical
transcript_2 = {
    "mediaAssetId": ready_ids[1],
    "text": "面试官：上轮面试我们聊了你的渠道经验，这轮想深入聊聊你的数据分析能力。请举例说明你如何用数据驱动决策。\n\n候选人：好的。我在宝洁期间搭建了一个渠道健康度仪表盘，整合了POS销售数据、库存数据、竞品价格数据和消费者评论数据。\n\n面试官：具体怎么做的？用了什么工具？\n\n候选人：技术上用Power BI做前端可视化，后端用SQL从SAP和外部数据源抽取数据。关键指标包括：品类份额、铺货率、价格指数、库存天数、促销ROI。这个仪表盘后来被推广到整个华东区使用。\n\n面试官：有没有用这个仪表盘发现过什么关键洞察？\n\n候选人：最有价值的一个发现是：我们发现在二线城市，促销频率和销售增长并不是线性关系。当促销频率超过每月2次时，边际效应急剧下降。基于这个发现，我们调整了二线城市的促销日历，将促销频率从每月3次降到2次，反而提升了8%的净利润率。\n\n面试官：这个发现你是怎么验证的？\n\n候选人：我用了A/B测试。选了6个可比城市，3个维持原频率，3个降到2次。观察了3个月，实验组不仅利润率提升，销售额也没有显著下降。然后用统计学t检验验证了差异显著性。\n\n面试官：你在团队中如何推广数据驱动文化？\n\n候选人：首先，我会在周会上用数据讲故事，而不是罗列数字。比如我不会说「销售额增长5%」，而是说「因为我们调整了货架位置，口腔护理品类每周多卖2000件，相当于多服务了1500个消费者」。其次，我要求团队成员在提方案时必须带数据支撑。\n\n面试官：你觉得做数据分析最大的挑战是什么？\n\n候选人：最大的挑战不是技术，而是数据质量和业务理解。很多时候数据本身没有错，但如果不理解业务上下文，很容易得出错误结论。比如有一段时间我看到某品类销量下滑，第一反应是竞品抢占了市场。但深入分析后发现是我们的供应链出了问题，断货导致的。所以我现在坚持一个原则：数据+现场，两条腿走路。",
    "segments": [
        {"speakerLabel": "面试官", "startMs": 0, "endMs": 9000, "text": "上轮面试我们聊了你的渠道经验，这轮想深入聊聊你的数据分析能力。请举例说明你如何用数据驱动决策。"},
        {"speakerLabel": "候选人", "startMs": 9000, "endMs": 26000, "text": "好的。我在宝洁期间搭建了一个渠道健康度仪表盘，整合了POS销售数据、库存数据、竞品价格数据和消费者评论数据。"},
        {"speakerLabel": "面试官", "startMs": 26000, "endMs": 33000, "text": "具体怎么做的？用了什么工具？"},
        {"speakerLabel": "候选人", "startMs": 33000, "endMs": 60000, "text": "技术上用Power BI做前端可视化，后端用SQL从SAP和外部数据源抽取数据。关键指标包括：品类份额、铺货率、价格指数、库存天数、促销ROI。这个仪表盘后来被推广到整个华东区使用。"},
        {"speakerLabel": "面试官", "startMs": 60000, "endMs": 68000, "text": "有没有用这个仪表盘发现过什么关键洞察？"},
        {"speakerLabel": "候选人", "startMs": 68000, "endMs": 110000, "text": "最有价值的一个发现是：我们发现在二线城市，促销频率和销售增长并不是线性关系。当促销频率超过每月2次时，边际效应急剧下降。基于这个发现，我们调整了二线城市的促销日历，将促销频率从每月3次降到2次，反而提升了8%的净利润率。"},
        {"speakerLabel": "面试官", "startMs": 110000, "endMs": 117000, "text": "这个发现你是怎么验证的？"},
        {"speakerLabel": "候选人", "startMs": 117000, "endMs": 155000, "text": "我用了A/B测试。选了6个可比城市，3个维持原频率，3个降到2次。观察了3个月，实验组不仅利润率提升，销售额也没有显著下降。然后用统计学t检验验证了差异显著性。"},
        {"speakerLabel": "面试官", "startMs": 155000, "endMs": 162000, "text": "你在团队中如何推广数据驱动文化？"},
        {"speakerLabel": "候选人", "startMs": 162000, "endMs": 210000, "text": "首先，我会在周会上用数据讲故事，而不是罗列数字。比如我不会说「销售额增长5%」，而是说「因为我们调整了货架位置，口腔护理品类每周多卖2000件，相当于多服务了1500个消费者」。其次，我要求团队成员在提方案时必须带数据支撑。"},
        {"speakerLabel": "面试官", "startMs": 210000, "endMs": 218000, "text": "你觉得做数据分析最大的挑战是什么？"},
        {"speakerLabel": "候选人", "startMs": 218000, "endMs": 270000, "text": "最大的挑战不是技术，而是数据质量和业务理解。很多时候数据本身没有错，但如果不理解业务上下文，很容易得出错误结论。比如有一段时间我看到某品类销量下滑，第一反应是竞品抢占了市场。但深入分析后发现是我们的供应链出了问题，断货导致的。所以我现在坚持一个原则：数据+现场，两条腿走路。"}
    ]
}

# Import both transcripts
for i, t in enumerate([transcript_1, transcript_2]):
    print(f"\nImporting transcript {i+1} for {t['mediaAssetId'][:20]}...")
    result = api("POST", "/api/speech/transcripts/import", t)
    if result.get("success"):
        tid = result["data"]["id"]
        print(f"  Created transcript: {tid}, segments: {result['data']['segmentCount']}")
        
        # Trigger metrics calculation
        print(f"  Fetching metrics...")
        metrics = api("GET", f"/api/speech/transcripts/{tid}/metrics")
        if metrics.get("success"):
            print(f"  Metrics: {json.dumps(metrics['data'], ensure_ascii=False)[:200]}")
        else:
            print(f"  Metrics error: {metrics.get('error')}")
        
        # Trigger analysis
        print(f"  Running analysis...")
        analysis = api("POST", f"/api/speech/transcripts/{tid}/analyze")
        if analysis.get("success"):
            print(f"  Analysis created successfully")
        else:
            print(f"  Analysis error: {analysis.get('error')}")
    else:
        print(f"  Error: {result.get('error')}")

# Also delete the test transcript created earlier
print("\nCleaning up test data...")
# The test one was for cmqxexon40000oqs42jatsc3i - but we just imported a proper one for it, so it's fine

print("\n✅ Done! Ready for screenshots.")
