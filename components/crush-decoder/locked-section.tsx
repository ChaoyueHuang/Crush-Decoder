"use client"

import { useEffect, useState } from "react"
import {
  Target,
  Fish,
  Search,
  Shield,
  Users,
  FileText,
  Sparkles,
  ArrowUpCircle,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { DopamineIcon } from "./dopamine-header"

interface LockedOverlayProps {
  onUnlock: () => void
  dopamine: number
  onConsumeDopamine: (amount: number) => void
  onInsufficient: (required: number) => void
  premiumData: {
    weaknesses: Array<{ weakness: string; analysis: string }>
    authenticity: { score: number; risk: string; positives: string[]; negatives: string[] }
    contradictions: Array<{ name: string; details: string; summary: string }>
    defenses: Array<{ name: string; analysis: string; suggestion: string }>
    hunterPrey: { hunter: string; prey: string; dynamic: string }
    summary: { essence: string; suggestions: string[]; finalNote: string }
  }
}

const TRIAL_COST = 50

export function LockedOverlay({ onUnlock, dopamine, onConsumeDopamine, onInsufficient, premiumData }: LockedOverlayProps) {
  const [unlockedIndex, setUnlockedIndex] = useState<number | null>(null)
  const hasUsedTrial = unlockedIndex !== null
  const [unlockCount, setUnlockCount] = useState(216)

  const modules = [
    {
      icon: Target,
      title: "软肋分析",
      color: "text-neon-pink",
      borderColor: "border-neon-pink/50",
      glowColor: "shadow-[0_0_20px_rgba(236,72,153,0.3)]",
      bgColor: "from-neon-pink/10 to-transparent",
      preview: premiumData.weaknesses.map((item) => `${item.weakness}: ${item.analysis}`).slice(0, 3),
      full: premiumData.weaknesses.map((item) => `${item.weakness}: ${item.analysis}`),
    },
    {
      icon: Fish,
      title: "钓鱼检测",
      color: "text-neon-cyan",
      borderColor: "border-neon-cyan/50",
      glowColor: "shadow-[0_0_20px_rgba(0,255,255,0.3)]",
      bgColor: "from-neon-cyan/10 to-transparent",
      preview: [
        `真实性评分: ${premiumData.authenticity.score}/100 | 钓鱼风险: ${premiumData.authenticity.risk}`,
        ...(premiumData.authenticity.positives.slice(0, 2).length
          ? premiumData.authenticity.positives.slice(0, 2)
          : premiumData.authenticity.negatives.slice(0, 2)),
      ].slice(0, 3),
      full: [
        `真实性评分: ${premiumData.authenticity.score}/100 | 钓鱼风险: ${premiumData.authenticity.risk}`,
        ...premiumData.authenticity.positives,
        ...premiumData.authenticity.negatives,
      ].filter(Boolean),
    },
    {
      icon: Search,
      title: "矛盾点验证",
      color: "text-yellow-400",
      borderColor: "border-yellow-400/50",
      glowColor: "shadow-[0_0_20px_rgba(250,204,21,0.3)]",
      bgColor: "from-yellow-400/10 to-transparent",
      preview: premiumData.contradictions.map((item) => `${item.name}: ${item.details}`).slice(0, 3),
      full: premiumData.contradictions.map((item) => `${item.name}: ${item.summary}`),
    },
    {
      icon: Shield,
      title: "防御机制",
      color: "text-neon-purple",
      borderColor: "border-neon-purple/50",
      glowColor: "shadow-[0_0_20px_rgba(168,85,247,0.3)]",
      bgColor: "from-neon-purple/10 to-transparent",
      preview: premiumData.defenses.map((item) => `${item.name}: ${item.analysis}`).slice(0, 3),
      full: premiumData.defenses.map((item) => `${item.name}: ${item.suggestion}`),
    },
    {
      icon: Users,
      title: "猎手与猎物",
      color: "text-emerald-400",
      borderColor: "border-emerald-400/50",
      glowColor: "shadow-[0_0_20px_rgba(52,211,153,0.3)]",
      bgColor: "from-emerald-400/10 to-transparent",
      preview: [
        `TA 作为猎手: ${premiumData.hunterPrey.hunter}`,
        `TA 作为猎物: ${premiumData.hunterPrey.prey}`,
        `关系动态: ${premiumData.hunterPrey.dynamic}`,
      ],
      full: [
        `TA 作为猎手: ${premiumData.hunterPrey.hunter}`,
        `TA 作为猎物: ${premiumData.hunterPrey.prey}`,
        `关系动态: ${premiumData.hunterPrey.dynamic}`,
      ],
    },
    {
      icon: FileText,
      title: "总结与建议",
      color: "text-amber-400",
      borderColor: "border-amber-400/50",
      glowColor: "shadow-[0_0_20px_rgba(251,191,36,0.3)]",
      bgColor: "from-amber-400/10 to-transparent",
      preview: [
        `综合分析: ${premiumData.summary.essence}`,
        premiumData.summary.suggestions[0] ? `行动建议: ${premiumData.summary.suggestions[0]}` : "",
        `最后寄语: ${premiumData.summary.finalNote}`,
      ].filter(Boolean),
      full: [
        `综合分析: ${premiumData.summary.essence}`,
        ...premiumData.summary.suggestions.map((text) => `行动建议: ${text}`),
        `最后寄语: ${premiumData.summary.finalNote}`,
      ],
    },
  ]

  useEffect(() => {
    let active = true
    const fetchCount = async () => {
      try {
        const response = await fetch("/api/unlock-count")
        if (!response.ok) return
        const data = await response.json()
        if (active && typeof data?.count === "number") {
          setUnlockCount(data.count)
        }
      } catch {
        // keep default
      }
    }

    fetchCount()
    return () => {
      active = false
    }
  }, [])

  const handleTrial = (index: number) => {
    if (dopamine < TRIAL_COST) {
      onInsufficient(TRIAL_COST)
      return
    }
    onConsumeDopamine(TRIAL_COST)
    setUnlockedIndex(index)
    toast.success("试读已解锁", {
      description: `消耗 ${TRIAL_COST}mg 多巴胺`,
    })
  }

  return (
    <div className="space-y-4">
      {/* Tasting Mode Grid */}
      <div className="grid grid-cols-2 gap-3">
        {modules.map((mod, index) => {
          const IconComponent = mod.icon
          const isUnlocked = unlockedIndex === index

          return (
            <div
              key={index}
              className={`relative rounded-xl overflow-hidden transition-all duration-500 ${
                isUnlocked
                  ? `${mod.borderColor} border ${mod.glowColor}`
                  : "border border-border/40"
              }`}
            >
              {/* Card background */}
              <div className={`bg-zinc-900/50 backdrop-blur-sm p-3 h-full flex flex-col ${
                isUnlocked ? `bg-gradient-to-b ${mod.bgColor}` : ""
              }`}>
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${isUnlocked ? "bg-background/30" : "bg-secondary/30"}`}>
                    <IconComponent className={`w-3.5 h-3.5 ${mod.color}`} />
                  </div>
                  <span className="text-xs font-medium text-foreground truncate">{mod.title}</span>
                  {isUnlocked && (
                    <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto shrink-0" />
                  )}
                </div>

                {/* Body */}
                <div className="flex-1 relative min-h-[52px]">
                  {isUnlocked ? (
                    <div className="space-y-1.5">
                      {mod.full.map((text, i) => (
                        <p key={i} className="text-[10px] text-foreground/80 leading-relaxed">
                          {text}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p
                      className="text-[10px] text-white/70 leading-relaxed line-clamp-3"
                      style={{
                        maskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 95%)",
                        WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 30%, transparent 95%)",
                      }}
                    >
                      {mod.preview.slice(0, 3).join(" ")}
                    </p>
                  )}
                </div>

                {!isUnlocked && (
                  <div className="relative mt-1">
                    <div
                      className="absolute -inset-x-3 -top-4 -bottom-3 backdrop-blur-[6px]"
                      style={{
                        maskImage: "linear-gradient(to bottom, transparent 0%, black 50%)",
                        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 50%)",
                      }}
                    />
                    <div
                      className="absolute -inset-x-3 -top-2 -bottom-3 opacity-[0.03]"
                      style={{
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
                        backgroundSize: "128px 128px",
                      }}
                    />

                    <div className="relative z-10 pt-2">
                      {!hasUsedTrial ? (
                        <button
                          type="button"
                          onClick={() => handleTrial(index)}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-zinc-950/80 border border-teal-500/60 text-teal-400 text-[10px] font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] hover:border-teal-400 hover:bg-zinc-900/90 transition-all active:scale-[0.98]"
                        >
                          <DopamineIcon className="w-3.5 h-3.5" />
                          <span>50mg 解锁此模块</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={onUnlock}
                          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-zinc-950/80 border border-neon-purple/40 text-neon-purple/80 text-[10px] font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] hover:border-neon-purple/60 hover:bg-zinc-900/90 transition-all active:scale-[0.98]"
                        >
                          <ArrowUpCircle className="w-3 h-3" />
                          <span>升级解锁</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Global CTA */}
      <div className="relative">
        <Button
          onClick={onUnlock}
          className="relative w-full h-12 bg-neon-purple hover:bg-neon-purple/90 text-primary-foreground font-semibold shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] transition-all duration-300 overflow-hidden"
        >
          <span className="absolute inset-0 -translate-x-full shimmer-animate bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <Sparkles className="w-4 h-4 mr-2 relative z-10" />
          <span className="relative z-10">升级解锁完整报告 &middot; ¥9.9</span>
        </Button>
        <p className="mt-3 text-[10px] text-muted-foreground text-center">
          已有 {new Intl.NumberFormat("zh-CN").format(unlockCount)} 人解锁完整报告
        </p>
      </div>
    </div>
  )
}
