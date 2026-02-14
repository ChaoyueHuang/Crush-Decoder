"use client"

import { AlertTriangle, X, Share2, Crown } from "lucide-react"
import { DopamineIcon } from "./dopamine-header"

interface DopamineInsufficientModalProps {
  isOpen: boolean
  onClose: () => void
  currentDopamine: number
  requiredDopamine: number
  onOpenSupply: () => void
  onOpenPayment: () => void
}

export function DopamineInsufficientModal({
  isOpen,
  onClose,
  currentDopamine,
  requiredDopamine,
  onOpenSupply,
  onOpenPayment,
}: DopamineInsufficientModalProps) {
  if (!isOpen) return null

  const deficit = requiredDopamine - currentDopamine

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
        <div className="relative p-6 pb-4 bg-gradient-to-b from-red-500/15 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">多巴胺不足</h2>
              <p className="text-xs text-muted-foreground">
                {"还需 "}
                <span className="font-mono text-red-400">{deficit}mg</span>
                {" 多巴胺才能解锁"}
              </p>
            </div>
          </div>

          {/* Dopamine gauge */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
            <DopamineIcon className="w-5 h-5 text-neon-pink shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-muted-foreground">当前浓度</span>
                <span className="text-[10px] text-muted-foreground">
                  {"需要 "}
                  <span className="font-mono text-foreground">{requiredDopamine}mg</span>
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-500"
                  style={{ width: `${Math.min((currentDopamine / requiredDopamine) * 100, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-mono font-bold text-red-400">{currentDopamine}mg</span>
                <span className="text-xs font-mono text-muted-foreground">{requiredDopamine}mg</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Grid */}
        <div className="px-6 py-4 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-3">选择补给通道</p>

          <div className="grid grid-cols-2 gap-3">
            {/* Left: Free supply channel */}
            <button
              type="button"
              onClick={onOpenSupply}
              className="group flex flex-col items-center gap-2.5 rounded-xl border border-border/50 bg-secondary/30 px-3 py-4 transition-all hover:border-neon-cyan/40 hover:bg-secondary/50 active:scale-[0.98]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neon-cyan/10 border border-neon-cyan/30 transition-colors group-hover:bg-neon-cyan/20">
                <Share2 className="h-4 w-4 text-neon-cyan" />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-foreground">获取免费补给</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">邀请好友 +30mg</p>
              </div>
            </button>

            {/* Right: Premium unlock - highlighted */}
            <button
              type="button"
              onClick={onOpenPayment}
              className="group relative flex flex-col items-center gap-2.5 overflow-hidden rounded-xl border border-neon-purple/40 bg-gradient-to-b from-neon-purple/15 to-transparent px-3 py-4 shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all hover:border-neon-purple/60 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)] active:scale-[0.98]"
            >
              <span className="absolute inset-0 -translate-x-full animate-[shimmer_4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/8 to-transparent" />

              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-neon-purple/20 border border-neon-purple/30">
                <Crown className="h-4 w-4 text-neon-purple" />
              </div>
              <div className="relative text-center">
                <p className="text-xs font-semibold text-foreground">解锁完整报告</p>
                <p className="text-[10px] font-mono text-neon-purple mt-0.5">¥9.9</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">
                  {"免多巴胺 · 全部模块"}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Cancel */}
        <div className="px-6 pb-5 pt-1 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] text-muted-foreground/50 transition-colors hover:text-muted-foreground"
          >
            暂时放弃
          </button>
        </div>
      </div>
    </div>
  )
}
