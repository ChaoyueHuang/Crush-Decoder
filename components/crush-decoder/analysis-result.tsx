"use client"

import { useRef } from "react"
import { toPng } from "html-to-image"
import { DifficultyScoreCard } from "./match-score-card"
import { MbtiCard } from "./mbti-card"
import { PersonalityRadar } from "./personality-radar"
import { PsychologyCard } from "./psychology-card"
import { LockedOverlay } from "./locked-section"
import { SbtiCard } from "./sbti-card"
import {
  WeaknessAnalysis,
  AuthenticityCheck,
  ContradictionCheck,
  DefenseMechanism,
  HunterPreyAnalysis,
  SummaryAdvice,
} from "./premium-sections"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "sonner"
import type { AnalysisData } from "@/lib/analysis-schema"

interface AnalysisResultProps {
  onUnlock: () => void
  isUnlocked: boolean
  dopamine: number
  onConsumeDopamine: (amount: number) => void
  onInsufficientDopamine: (required: number) => void
  analysisData?: AnalysisData
  sbtiData?: {
    type: string
    nickname: string
    quote: string
    description: string
  }
}

// Mock data (field-name placeholders for UI mapping checks)
const mockAnalysisPlaceholder = {
  is_wechat_or_xiaohongshu: 1,
  analysis: {
    conquest_difficulty: {
      score: 66,
      ranking: "analysis.conquest_difficulty.ranking: 中等",
      desc: "analysis.conquest_difficulty.desc: 有一定挑战性",
    },
    mbti_profile: {
      type: "analysis.mbti_profile.type: ENFP",
      name: "analysis.mbti_profile.name: 竞选者",
      probability: "analysis.mbti_profile.probability: 76%",
      secondary_type: "analysis.mbti_profile.secondary_type: INFP",
      secondary_probability: "analysis.mbti_profile.secondary_probability: 24%",
      secondary_name: "analysis.mbti_profile.secondary_name: 调停者",
      logic: "analysis.mbti_profile.logic: 这里是 MBTI 判定逻辑占位内容，用于确认字段映射。",
    },
    core_traits: {
      extroversion: 61,
      rationality: 32,
      sensitivity: 74,
      adventure: 58,
      romanticism: 83,
      independence: 49,
      summary: "analysis.core_traits.summary: 核心特质总结占位文本。",
    },
    psychological_state: {
      current_state: "analysis.psychological_state.current_state: 当前心理状态占位文本。",
      deepest_desire: "analysis.psychological_state.deepest_desire: 最深层渴望占位文本。",
    },
    potential_weaknesses: [
      {
        weakness: "analysis.potential_weaknesses[0].weakness: 情绪依赖",
        analysis: "analysis.potential_weaknesses[0].analysis: 弱点分析占位文本。",
      },
      {
        weakness: "analysis.potential_weaknesses[1].weakness: 社交回避",
        analysis: "analysis.potential_weaknesses[1].analysis: 弱点分析占位文本。",
      },
      {
        weakness: "analysis.potential_weaknesses[2].weakness: 决策摇摆",
        analysis: "analysis.potential_weaknesses[2].analysis: 弱点分析占位文本。",
      },
    ],
    authenticity_assessment: [
      {
        score: 88,
        fishing_risk: "低",
        persona_check_positive: "analysis.authenticity_assessment[0].persona_check_positive: 几乎无伪造痕迹",
      },
      {
        score: 88,
        fishing_risk: "低",
        persona_check_positive:
          "analysis.authenticity_assessment[1].persona_check_positive: 生活细节丰富，真实度较高",
      },
      {
        score: 88,
        fishing_risk: "低",
        persona_check_positive: "analysis.authenticity_assessment[2].persona_check_positive: 内容风格一致",
      },
      {
        score: 88,
        fishing_risk: "低",
        persona_check_negative: "analysis.authenticity_assessment[3].persona_check_negative: 轻微美化倾向",
      },
    ],
    contradiction_check: [
      {
        name: "analysis.contradiction_check[0].name: 独立 vs 依赖",
        details: "analysis.contradiction_check[0].details: 矛盾点细节占位文本。",
        summary: "analysis.contradiction_check[0].summary: 推论占位文本。",
      },
      {
        name: "analysis.contradiction_check[1].name: 理性 vs 感性",
        details: "analysis.contradiction_check[1].details: 矛盾点细节占位文本。",
        summary: "analysis.contradiction_check[1].summary: 推论占位文本。",
      },
    ],
    defense_mechanism: [
      {
        name: "analysis.defense_mechanism[0].name: 升华",
        analysis: "analysis.defense_mechanism[0].analysis: 防御机制分析占位文本。",
        suggestion: "analysis.defense_mechanism[0].suggestion: 应对建议占位文本。",
      },
      {
        name: "analysis.defense_mechanism[1].name: 忙碌屏障",
        analysis: "analysis.defense_mechanism[1].analysis: 防御机制分析占位文本。",
        suggestion: "analysis.defense_mechanism[1].suggestion: 应对建议占位文本。",
      },
    ],
    comparative_analysis: {
      attraction_target: "analysis.comparative_analysis.attraction_target: 猎手吸引对象占位文本。",
      vulnerability_target: "analysis.comparative_analysis.vulnerability_target: 猎物易受对象占位文本。",
    },
    summary_and_advice: {
      essence_summary: "analysis.summary_and_advice.essence_summary: 精华总结占位文本。",
      suggestions: [
        "analysis.summary_and_advice.suggestions[0]: 建议一占位文本。",
        "analysis.summary_and_advice.suggestions[1]: 建议二占位文本。",
        "analysis.summary_and_advice.suggestions[2]: 建议三占位文本。",
      ],
    },
    final_note: {
      note: "analysis.final_note.note: 末尾寄语占位文本。",
    },
  },
}

// Mock data (aligned with latest project_context.md JSON schema)
const mockAnalysis = {
  is_wechat_or_xiaohongshu: 1,
  analysis: {
    conquest_difficulty: {
      score: 85,
      ranking: "中等",
      desc: "有一定挑战性",
    },
    mbti_profile: {
      type: "ENFP",
      name: "竞选者",
      probability: "75%",
      secondary_type: "ESFP",
      secondary_probability: "30%",
      secondary_name: "竞选者",
      logic:
        "E (外向)：极高频的社交展示，婚礼、聚餐、群像徒步，能量来源于人群；N (直觉)：关注'乌托邦'、'Set free'等抽象概念，以及对环保宏大议题的共情，而非单纯记录流水账；F (情感)：情绪外露，开心就发疯，难过就听emo歌，价值观驱动（环保愤怒）；P (感知)：'Random trip'、说走就走的徒步，生活充满了即兴与探索，排版随性不刻板。",
    },
    core_traits: {
      extroversion: 90,
      rationality: 40,
      sensitivity: 85,
      adventure: 85,
      romanticism: 80,
      independence: 75,
      summary:
        "TA 是一个热情洋溢、富有创造力的人，善于社交且充满理想主义色彩，内心深处追求自由和真实的情感连接。",
    },
    psychological_state: {
      current_state:
        "间歇性焦虑与持续性自愈的拉锯战。她正处于'痛并快乐着'的真实状态——白天是不得不为了'股票变红'而奋斗的'牛马'，晚上/周末是必须去野外撒野找回灵魂的'自由人'。",
      deepest_desire:
        "渴望'有质感的逃离'。她潜意识里想逃离枯燥的世俗工作（工作工作工作），但又迷恋世俗带来的精致消费（新荣记、日本游）。她最想要的是一个能陪她一起'精神私奔'，但在现实中又足够强大能托底的伴侣。",
    },
    potential_weaknesses: [
      {
        weakness: "高浓度的情绪依赖",
        analysis:
          "她在深夜分享《Set free》和《Greedy》，以及吐槽工作的崩溃瞬间，暴露了她极需情绪出口。一个能精准解读她音乐品味、在她低落时提供'灵魂共鸣'的人，能轻易绕过物质防线攻入内心。",
      },
      {
        weakness: "文艺青年的'清高'死穴",
        analysis:
          "她对环保有激进的态度，对'俗人'（乱扔垃圾、无趣）有天然鄙视。如果一个人把自己包装成'怀才不遇、对抗世俗、热爱自然'的孤独艺术家，会激起她的圣母心和保护欲。",
      },
      {
        weakness: "年龄与身份的隐形焦虑",
        analysis:
          "特意强调'28岁的第一天'，加上对股票和工作的执念，说明她对未来的不确定性有焦虑。能给她提供'确定性'和'安稳感'的成熟男性对她有致命吸引力。",
      },
    ],
    authenticity_assessment: [
      {
        score: 95,
        fishing_risk: "低",
        persona_check_positive: "几乎无伪造痕迹",
      },
      {
        score: 95,
        fishing_risk: "低",
        persona_check_positive:
          "虽然有豪车（未直接展示但消费力匹配）、高端局，但同时毫无包袱地展示了零下26度被冻成狗的狼狈、模糊的Live图、以及杂乱的工作吐槽",
      },
      {
        score: 95,
        fishing_risk: "低",
        persona_check_positive: "骗子只会发精修图，不会发自己像个粽子一样在雪地里",
      },
      {
        score: 95,
        fishing_risk: "低",
        persona_check_negative: "部分内容有轻微美化倾向，但在正常范围内",
      },
    ],
    contradiction_check: [
      {
        name: "独立 vs 依赖",
        details:
          "存在'精致中产'与'卑微社畜'的割裂，但这恰恰是真实的铁证。朋友圈里既有'新荣记'的奢华，又有'工作工作'的崩溃。这不叫人设崩塌，这是北京/上海CBD打工人的真实写照——用昂贵的消费来补偿被异化的灵魂",
        summary: "表面独立，内心渴望被照顾",
      },
      {
        name: "理性 vs 感性",
        details: "声称讨厌drama，但对情感内容互动频繁",
        summary: "情感需求高于表面呈现",
      },
      {
        name: "社交 vs 独处",
        details: "频繁晒聚会但也常发独处内容",
        summary: "需要平衡社交和个人空间",
      },
    ],
    defense_mechanism: [
      {
        name: "升华",
        analysis:
          "当面对工作的压抑（Id的冲动）时，她没有选择堕落，而是将其转化为社会认可的高级活动——徒步、摄影、出国游。她在朋友圈展示这些，既是给别人看，也是在告诉自己：'虽然我在打工，但我依然拥有只有少数人能理解的精彩生活'，以此来防御平庸感。",
        suggestion: "先配合她的节奏，建立信任后再尝试深入",
      },
      {
        name: "忙碌屏障",
        analysis: "以忙碌为由保持距离",
        suggestion: "尊重她的时间，但保持稳定的存在感",
      },
      {
        name: "模糊回应",
        analysis: "对敏感问题给出模棱两可的回答",
        suggestion: "不要追问，给她安全的表达空间",
      },
    ],
    comparative_analysis: {
      attraction_target:
        "作为'猎手'，她对'有少年感的精英男'最有杀伤力。这类男性通常有经济基础但生活枯燥，会被她这种'生命力爆棚'且带点文艺范儿的女生深深吸引，觉得她是枯燥生活的解药。",
      vulnerability_target:
        "作为'猎物'，她最容易被'高知文艺渣男'收割。这种男人不需要很有钱，只需要懂一点哲学、摄影，带她去个没人知道的野山坡看日落，再表现出一点忧郁，就能让她以为遇到了灵魂伴侣，从而忽略对方现实中的不靠谱。",
    },
    summary_and_advice: {
      essence_summary:
        "她是一位典型的'在一线城市用力生活的体验派女青年'。28岁，有审美洁癖，经济独立，既要在世俗中搞钱（炒股、工作），又要去精神高地吸氧（徒步、手冲咖啡）。她看起来朋友很多，热闹非凡，但内心其实在寻找一个能透过她'现充'的外表，读懂她深夜emo和'乌托邦'梦想的深度伴侣。",
      suggestions: [
        "切入点要'小众且高级'：别聊大众景点，聊她去的'熊野古道'；别问喝不喝星巴克，回答她'手冲豆子推荐一支带有花香的埃塞俄比亚瑰夏'。用认知差来建立吸引力。",
        "做她的'情绪安全网'：她工作压力大，情绪波动明显。在她吐槽工作或发emo歌时，不要讲大道理，要站在她这边一起吐槽世界，或者给出一个温暖的拥抱（即使是语言上的）。",
        "保持'上进'但'不俗'的人设：她讨厌俗气（如在高原放烟花），但又需要世俗的安全感（股票红）。你需要展示你有稳定的事业，但同时你也是个有趣、有社会责任感的人，而不是满身铜臭味的暴发户。",
      ],
    },
    final_note: {
      note: "爱情需要时间培育，真诚是最好的策略。相信自己，也相信缘分。祝你好运！",
    },
  },
}

const parsePercentage = (value: string) => {
  const match = value.match(/(\d+)/)
  return match ? Number(match[1]) : 0
}

const buildViewData = (analysis: AnalysisData) => {
  const personalityData = [
    { trait: "外向", value: analysis.analysis.core_traits.extroversion, fullMark: 100 },
    { trait: "理性", value: analysis.analysis.core_traits.rationality, fullMark: 100 },
    { trait: "独立", value: analysis.analysis.core_traits.independence, fullMark: 100 },
    { trait: "浪漫", value: analysis.analysis.core_traits.romanticism, fullMark: 100 },
    { trait: "冒险", value: analysis.analysis.core_traits.adventure, fullMark: 100 },
    { trait: "细腻", value: analysis.analysis.core_traits.sensitivity, fullMark: 100 },
  ]

  const mbtiPrimaryProbability = parsePercentage(analysis.analysis.mbti_profile.probability)
  const mbtiSecondaryProbability = parsePercentage(analysis.analysis.mbti_profile.secondary_probability)
  const mbtiData = {
    primaryType: {
      type: analysis.analysis.mbti_profile.type,
      nickname: analysis.analysis.mbti_profile.name,
      probability: mbtiPrimaryProbability,
    },
    secondaryType: {
      type: analysis.analysis.mbti_profile.secondary_type,
      nickname: analysis.analysis.mbti_profile.secondary_name,
      probability: mbtiSecondaryProbability,
    },
    reasoning: analysis.analysis.mbti_profile.logic,
    coreTraitsSummary: analysis.analysis.core_traits.summary,
  }

  const psychologyData = {
    currentState: analysis.analysis.psychological_state.current_state,
    innerDesire: analysis.analysis.psychological_state.deepest_desire,
  }

  const premiumData = {
    weaknesses: analysis.analysis.potential_weaknesses.map((item) => ({
      title: item.weakness,
      description: item.analysis,
    })),
    authenticity: {
      score: analysis.analysis.authenticity_assessment[0]?.score ?? 0,
      riskLevel: (analysis.analysis.authenticity_assessment[0]?.fishing_risk ?? "低") as "低" | "中" | "高",
      signals: analysis.analysis.authenticity_assessment.map((item) => {
        if ("persona_check_negative" in item && item.persona_check_negative) {
          return { type: "negative" as const, text: item.persona_check_negative }
        }
        return { type: "positive" as const, text: item.persona_check_positive || "" }
      }),
    },
    contradictions: analysis.analysis.contradiction_check.map((item) => ({
      aspect: item.name,
      finding: item.details,
      implication: item.summary,
    })),
    defenses: analysis.analysis.defense_mechanism.map((item) => ({
      name: item.name,
      description: item.analysis,
      suggestion: item.suggestion,
    })),
    hunterPrey: {
      hunterTraits: [analysis.analysis.comparative_analysis.attraction_target],
      preyTraits: [analysis.analysis.comparative_analysis.vulnerability_target],
    },
    summary: {
      summary: analysis.analysis.summary_and_advice.essence_summary,
      advices: analysis.analysis.summary_and_advice.suggestions.map((text, index) => ({
        priority: (index === 0 ? "high" : index === 1 ? "medium" : "low") as const,
        text,
      })),
      finalNote: analysis.analysis.final_note.note,
    },
  }

  return { personalityData, mbtiData, psychologyData, premiumData }
}

export function AnalysisResult({
  onUnlock,
  isUnlocked,
  dopamine,
  onConsumeDopamine,
  onInsufficientDopamine,
  analysisData,
  sbtiData,
}: AnalysisResultProps) {
  const analysis = analysisData ?? mockAnalysis
  const { personalityData, mbtiData, psychologyData, premiumData } = buildViewData(analysis)
  const reportRef = useRef<HTMLDivElement>(null)

  const handleSaveReport = async () => {
    if (!reportRef.current) return

    try {
      toast.loading("正在生成报告图片...")
      
      const dataUrl = await toPng(reportRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#0d0a14",
      })

      const link = document.createElement("a")
      link.download = `crush-decoder-report-${Date.now()}.png`
      link.href = dataUrl
      link.click()

      toast.dismiss()
      toast.success("报告已保存！")
    } catch {
      toast.dismiss()
      toast.error("保存失败，请重试")
    }
  }

  return (
    <section className="px-4 py-8 max-w-lg mx-auto">
      <div ref={reportRef} className="space-y-4 pb-4">
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="text-xs font-mono text-muted-foreground tracking-wider">分析报告</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Module 1: 攻略难度 */}
        <DifficultyScoreCard
          score={analysis.analysis.conquest_difficulty.score}
          label="攻略难度"
          ranking={analysis.analysis.conquest_difficulty.ranking}
          desc={analysis.analysis.conquest_difficulty.desc}
        />

        {sbtiData && (
          <SbtiCard
            type={sbtiData.type}
            nickname={sbtiData.nickname}
            quote={sbtiData.quote}
            description={sbtiData.description}
          />
        )}

        {/* Module 2: MBTI */}
        <MbtiCard {...mbtiData} />

        {/* Module 3: 性格特征分析 */}
        <PersonalityRadar data={personalityData} />

        {/* Module 4: 心理状态与内心世界 */}
        <PsychologyCard {...psychologyData} />

        {/* Premium Section Header */}
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-purple/30 to-transparent" />
            <span className="text-xs font-mono text-neon-purple tracking-wider">高级分析</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-purple/30 to-transparent" />
          </div>
          {!isUnlocked && (
            <p className="text-[10px] text-muted-foreground text-center mb-4">
              试读机会：1/1（任选其一）
            </p>
          )}

          {isUnlocked ? (
            <div className="space-y-4">
              {/* Premium Module 1: 软肋分析 */}
              <WeaknessAnalysis weaknesses={premiumData.weaknesses} />

              {/* Premium Module 2: 真实性评估&钓鱼检测 */}
              <AuthenticityCheck {...premiumData.authenticity} />

              {/* Premium Module 3: 矛盾点验证 */}
              <ContradictionCheck contradictions={premiumData.contradictions} />

              {/* Premium Module 4: 防御机制分析 */}
              <DefenseMechanism mechanisms={premiumData.defenses} />

              {/* Premium Module 5: 对比分析：猎手与猎物 */}
              <HunterPreyAnalysis {...premiumData.hunterPrey} />

              {/* Premium Module 6: 总结与建议 */}
              <SummaryAdvice {...premiumData.summary} />
            </div>
          ) : (
            <LockedOverlay
              onUnlock={onUnlock}
              dopamine={dopamine}
              onConsumeDopamine={onConsumeDopamine}
              onInsufficient={onInsufficientDopamine}
              premiumData={{
                weaknesses: analysis.analysis.potential_weaknesses.map((item) => ({
                  weakness: item.weakness,
                  analysis: item.analysis,
                })),
                authenticity: {
                  score: analysis.analysis.authenticity_assessment[0]?.score ?? 0,
                  risk: analysis.analysis.authenticity_assessment[0]?.fishing_risk ?? "低",
                  positives: analysis.analysis.authenticity_assessment
                    .map((item) => item.persona_check_positive)
                    .filter(Boolean) as string[],
                  negatives: analysis.analysis.authenticity_assessment
                    .map((item) => ("persona_check_negative" in item ? item.persona_check_negative : undefined))
                    .filter(Boolean) as string[],
                },
                contradictions: analysis.analysis.contradiction_check.map((item) => ({
                  name: item.name,
                  details: item.details,
                  summary: item.summary,
                })),
                defenses: analysis.analysis.defense_mechanism.map((item) => ({
                  name: item.name,
                  analysis: item.analysis,
                  suggestion: item.suggestion,
                })),
                hunterPrey: {
                  hunter: analysis.analysis.comparative_analysis.attraction_target,
                  prey: analysis.analysis.comparative_analysis.vulnerability_target,
                  dynamic: analysis.analysis.summary_and_advice.essence_summary,
                },
                summary: {
                  essence: analysis.analysis.summary_and_advice.essence_summary,
                  suggestions: analysis.analysis.summary_and_advice.suggestions,
                  finalNote: analysis.analysis.final_note.note,
                },
              }}
            />
          )}
        </div>
      </div>

      {/* Save Report Button - Only show when unlocked */}
      {isUnlocked && (
        <div className="mt-6">
          <Button
            onClick={handleSaveReport}
            variant="outline"
            className="w-full h-12 border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan/50 bg-transparent"
          >
            <Download className="w-4 h-4 mr-2" />
            保存分析报告
          </Button>
        </div>
      )}
    </section>
  )
}
