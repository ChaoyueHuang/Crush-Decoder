"use client"

import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SbtiCardProps {
  type: string
  nickname: string
  quote: string
  description: string
}

export function SbtiCard({ type, nickname, quote, description }: SbtiCardProps) {
  return (
    <Card className="relative overflow-hidden border-rose-500/30 bg-card/50 backdrop-blur-sm">
      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent pointer-events-none" />

      <CardHeader className="pb-2 relative">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <span className="text-base">🎭</span>
          <span>SBTI 人格类型</span>
          {/* HOT badge */}
          <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-bold bg-amber-400 text-zinc-900 rounded uppercase tracking-wider">
            HOT
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="relative">
        {/* Main diagnosis card */}
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-rose-500/20 backdrop-blur-sm">
          {/* Type name with neon glow */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="px-4 py-2 rounded-lg bg-rose-500/15 border border-rose-500/40">
                <span
                  className="font-mono text-2xl font-black text-rose-400 tracking-widest"
                  style={{
                    textShadow: "0 0 10px rgba(244,63,94,0.5), 0 0 20px rgba(244,63,94,0.3)",
                  }}
                >
                  {type}
                </span>
              </div>
              {/* Warning icon */}
              <div className="absolute -top-1.5 -right-1.5">
                <div className="p-0.5 rounded-full bg-amber-400">
                  <AlertTriangle className="w-2.5 h-2.5 text-zinc-900" />
                </div>
              </div>
            </div>
            <div>
              <p className="text-base font-bold text-foreground">{nickname}</p>
              <p className="text-[10px] text-rose-400/70 font-mono">诊断完成</p>
            </div>
          </div>

          {/* Quote - italic, bright */}
          <p className="text-sm italic text-amber-300/90 mb-3 leading-relaxed">{`"${quote}"`}</p>

          {/* Description - smaller, muted */}
          <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  )
}
