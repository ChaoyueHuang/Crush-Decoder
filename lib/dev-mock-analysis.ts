import type { AnalysisData } from "@/lib/analysis-schema"

export const DEV_MOCK_ANALYSIS: AnalysisData = {
  is_wechat_or_xiaohongshu: 1,
  sbti_dimensions: ["H", "M", "H", "M", "H", "M", "H", "M", "H", "M", "H", "M", "H", "M", "H"],
  is_alcoholic: false,
  analysis: {
    conquest_difficulty: {
      score: 78,
      ranking: "中等",
      desc: "有展示欲，也有边界感，能接近但不能硬冲。",
    },
    mbti_profile: {
      type: "ENFP",
      name: "竞选者",
      probability: "76%",
      secondary_type: "ESFP",
      secondary_probability: "24%",
      secondary_name: "表演者",
      logic: "内容里社交、情绪表达和即时体验都比较强，整体更像外向直觉型，但也保留明显的现实享乐倾向。",
    },
    core_traits: {
      extroversion: 82,
      rationality: 45,
      sensitivity: 78,
      adventure: 73,
      romanticism: 84,
      independence: 66,
      summary: "TA 是一个情绪浓度高、社交弹性强的人，既要被看见，也要保留自己的节奏。",
    },
    psychological_state: {
      current_state: "表面松弛，内心仍在观察谁值得认真投入。",
      deepest_desire: "希望被理解，但不想被廉价追逐打扰。",
    },
    potential_weaknesses: [
      {
        weakness: "容易被高质量情绪回应打动",
        analysis: "TA 对细节和氛围很敏感，空泛热情无效，精准共情更容易破防。",
      },
      {
        weakness: "容易在新鲜感里降低警惕",
        analysis: "如果对方同时提供刺激感和理解感，TA 可能会暂时忽略长期稳定性。",
      },
    ],
    authenticity_assessment: [
      {
        score: 86,
        fishing_risk: "低",
        persona_check_positive: "内容风格相对自然，有生活碎片，也有情绪波动，不像完全包装过的人设。",
      },
      {
        score: 86,
        fishing_risk: "低",
        persona_check_negative: "部分展示内容有轻微筛选和美化，但仍在正常社交媒体范围内。",
      },
    ],
    contradiction_check: [
      {
        name: "热闹 vs 防备",
        details: "愿意展示生活状态，但真正的私人情绪没有完全摊开。",
        summary: "表面好接近，内心仍会筛人。",
      },
    ],
    defense_mechanism: [
      {
        name: "幽默化防御",
        analysis: "TA 倾向用轻松表达包装真实情绪，避免显得太认真或太脆弱。",
        suggestion: "先接住玩笑，再慢慢进入深一点的话题，不要一上来审问式关心。",
      },
    ],
    comparative_analysis: {
      attraction_target: "TA 更容易吸引有趣、会聊天、能提供情绪价值的人。",
      vulnerability_target: "TA 容易被伪装成灵魂伴侣的高段位玩家拿捏。",
    },
    summary_and_advice: {
      essence_summary: "TA 不是难追，而是不吃低质量热情。你需要提供稳定、有趣、不压迫的存在感。",
      suggestions: [
        "不要频繁追问行踪，用轻松话题保持稳定出现。",
        "聊天要具体，少说套话，多回应 TA 发出来的真实细节。",
        "推进关系时给 TA 空间，越催越容易触发防备。",
      ],
    },
    final_note: {
      note: "别急着证明你喜欢 TA，先证明你真的看懂了 TA。",
    },
  },
}
