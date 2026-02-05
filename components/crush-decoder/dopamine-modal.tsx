"use client"

import { useState, useEffect } from "react"
import { X, Zap, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DopamineIcon } from "./dopamine-header"

interface DopamineModalProps {
  isOpen: boolean
  onClose: () => void
  username: string
  dopamine: number
  hasClaimedFirstReward: boolean
  hasClaimedDailyReward: boolean
  onClaimFirst: () => Promise<number | null>
  onClaimDaily: () => Promise<number | null>
  isClaimingFirst: boolean
  isClaimingDaily: boolean
}

export function DopamineModal({
  isOpen,
  onClose,
  username,
  dopamine,
  hasClaimedFirstReward,
  hasClaimedDailyReward,
  onClaimFirst,
  onClaimDaily,
  isClaimingFirst,
  isClaimingDaily,
}: DopamineModalProps) {
  const [displayDopamine, setDisplayDopamine] = useState(dopamine)
  const [isAnimating, setIsAnimating] = useState(false)
  const [animationScale, setAnimationScale] = useState(1)
  const [glowIntensity, setGlowIntensity] = useState(0)

  // Sync display dopamine when prop changes (without animation)
  useEffect(() => {
    if (!isAnimating) {
      setDisplayDopamine(dopamine)
    }
  }, [dopamine, isAnimating])

  if (!isOpen) return null

  const handleClaim = (targetValue: number) => {
    if (isAnimating) return

    setIsAnimating(true)

    // Animate the number with smooth counting and scale pulse
    const duration = 1200
    const startTime = Date.now()
    const startValue = displayDopamine

    // Scale and glow pulse animation
    const pulseAnimation = () => {
      setAnimationScale(1.4)
      setGlowIntensity(1)
      setTimeout(() => {
        setAnimationScale(1.2)
        setGlowIntensity(0.6)
      }, 150)
      setTimeout(() => {
        setAnimationScale(1.3)
        setGlowIntensity(0.8)
      }, 300)
      setTimeout(() => {
        setAnimationScale(1)
        setGlowIntensity(0)
      }, 800)
    }
    pulseAnimation()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Smooth easing function
      const easeOutExpo = (x: number): number => {
        return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
      }

      const currentValue = Math.round(startValue + (targetValue - startValue) * easeOutExpo(progress))
      setDisplayDopamine(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setIsAnimating(false)
      }
    }

    requestAnimationFrame(animate)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.3)]">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-b from-neon-pink/20 to-transparent">
          <div className="flex items-center gap-3 mb-4">
            <DopamineIcon className="w-8 h-8 text-neon-pink" />
            <div>
              <h2 className="text-lg font-bold text-foreground">多巴胺补给站</h2>
              <p className="text-xs text-muted-foreground font-mono">#{username}</p>
            </div>
          </div>

          {/* Current Dopamine Level */}
          <div className="flex items-end gap-2">
            <span className="text-xs text-muted-foreground">当前浓度</span>
            <span
              className="font-mono text-3xl font-bold text-neon-pink transition-all duration-200 ease-out"
              style={{
                transform: `scale(${animationScale})`,
                textShadow: glowIntensity > 0 ? `0 0 ${20 * glowIntensity}px rgba(236,72,153,${glowIntensity}), 0 0 ${40 * glowIntensity}px rgba(236,72,153,${glowIntensity * 0.5})` : "none",
              }}
            >
              {displayDopamine}mg
            </span>
          </div>
        </div>

        {/* Tasks */}
        <div className="px-6 py-4 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-4">合成任务</p>

          <div className="space-y-3">
            {/* Task 1: First Time Reward */}
            <div className="p-3 rounded-xl bg-secondary/30 border border-border/50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-neon-purple/20 border border-neon-purple/30">
                    <Zap className="w-4 h-4 text-neon-purple" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">神经元激活</p>
                    <p className="text-xs text-muted-foreground mt-0.5">首次接入系统奖励 +20mg</p>
                  </div>
                </div>
                <Button
                  disabled={hasClaimedFirstReward || isClaimingFirst}
                  onClick={async () => {
                    const next = await onClaimFirst()
                    if (typeof next === "number") {
                      handleClaim(next)
                    }
                  }}
                  size="sm"
                  className={`h-8 px-3 text-xs transition-all ${
                    hasClaimedFirstReward
                      ? "bg-secondary/50 text-muted-foreground cursor-not-allowed"
                      : "bg-neon-purple hover:bg-neon-purple/90 text-primary-foreground font-semibold shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                  }`}
                >
                  {hasClaimedFirstReward ? "已摄入" : "摄入"}
                </Button>
              </div>
            </div>

            {/* Task 2: Daily Reward - No daily limit */}
            <div className="p-3 rounded-xl bg-secondary/30 border border-border/50">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-neon-cyan/20 border border-neon-cyan/30">
                    <Calendar className="w-4 h-4 text-neon-cyan" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">情绪稳定剂</p>
                    <p className="text-xs text-muted-foreground mt-0.5">每日可注射一次 +10mg</p>
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    const next = await onClaimDaily()
                    if (typeof next === "number") {
                      handleClaim(next)
                    }
                  }}
                  disabled={isAnimating || isClaimingDaily || hasClaimedDailyReward}
                  size="sm"
                  className={`h-8 px-3 text-xs font-semibold transition-all ${
                    hasClaimedDailyReward
                      ? "bg-secondary/50 text-muted-foreground cursor-not-allowed"
                      : "bg-neon-cyan hover:bg-neon-cyan/90 text-background shadow-[0_0_15px_rgba(0,255,255,0.3)]"
                  }`}
                >
                  {hasClaimedDailyReward ? "已注射" : isAnimating || isClaimingDaily ? "注射中..." : "注射"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div className="px-6 pb-6 pt-2">
          <p className="text-[10px] text-muted-foreground text-center">
            多巴胺可用于基础分析
          </p>
        </div>
      </div>
    </div>
  )
}
