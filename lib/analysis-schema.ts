import { z } from "zod"

const percentageString = z.string().regex(/^\d{1,3}%$/, "Expected percentage string like 75%")

const boundedScore = z.number().min(0).max(100)

const authenticityItem = z
  .object({
    score: boundedScore,
    fishing_risk: z.enum(["低", "中", "高"]),
    persona_check_positive: z.string().optional(),
    persona_check_negative: z.string().optional(),
  })
  .refine((item) => item.persona_check_positive || item.persona_check_negative, {
    message: "authenticity_assessment item must include positive or negative text",
  })

export const analysisSchema = z.object({
  is_wechat_or_xiaohongshu: z.union([z.literal(0), z.literal(1)]),
  analysis: z.object({
    conquest_difficulty: z.object({
      score: boundedScore,
      ranking: z.string().min(1),
      desc: z.string().min(1),
    }),
    mbti_profile: z.object({
      type: z.string().min(1),
      name: z.string().min(1),
      probability: percentageString,
      secondary_type: z.string().min(1),
      secondary_probability: percentageString,
      secondary_name: z.string().min(1),
      logic: z.string().min(1),
    }),
    core_traits: z.object({
      extroversion: boundedScore,
      rationality: boundedScore,
      sensitivity: boundedScore,
      adventure: boundedScore,
      romanticism: boundedScore,
      independence: boundedScore,
      summary: z.string().min(1),
    }),
    psychological_state: z.object({
      current_state: z.string().min(1),
      deepest_desire: z.string().min(1),
    }),
    potential_weaknesses: z
      .array(
        z.object({
          weakness: z.string().min(1),
          analysis: z.string().min(1),
        })
      )
      .min(1),
    authenticity_assessment: z.array(authenticityItem).min(1),
    contradiction_check: z
      .array(
        z.object({
          name: z.string().min(1),
          details: z.string().min(1),
          summary: z.string().min(1),
        })
      )
      .min(1),
    defense_mechanism: z
      .array(
        z.object({
          name: z.string().min(1),
          analysis: z.string().min(1),
          suggestion: z.string().min(1),
        })
      )
      .min(1),
    comparative_analysis: z.object({
      attraction_target: z.string().min(1),
      vulnerability_target: z.string().min(1),
    }),
    summary_and_advice: z.object({
      essence_summary: z.string().min(1),
      suggestions: z.array(z.string().min(1)).min(1),
    }),
    final_note: z.object({
      note: z.string().min(1),
    }),
  }),
})

export type AnalysisData = z.infer<typeof analysisSchema>
