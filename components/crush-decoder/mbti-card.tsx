"use client"

import { Brain, Sparkles, Lightbulb } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MbtiType {
  type: string
  nickname: string
  probability: number
}

interface MbtiCardProps {
  primaryType: MbtiType
  secondaryType: MbtiType
  reasoning: string
  coreTraitsSummary: string
}

export function MbtiCard({ primaryType, secondaryType, reasoning, coreTraitsSummary }: MbtiCardProps) {
  const reasoningLines = reasoning
    .split("；")
    .map((line) => line.trim())
    .filter(Boolean)

  return (
    <Card className="relative overflow-hidden border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Brain className="w-4 h-4 text-neon-purple" />
          MBTI 人格类型
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Primary & Secondary Type Display */}
        <div className="space-y-3">
          {/* Primary Type */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-neon-purple/10 border border-neon-purple/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="px-3 py-1.5 rounded-md bg-neon-purple/20 border border-neon-purple/40">
                  <span className="font-mono text-2xl font-bold text-neon-purple tracking-wider">
                    {primaryType.type}
                  </span>
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-3 h-3 text-neon-cyan animate-pulse" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{primaryType.nickname}</p>
                <p className="text-[10px] text-muted-foreground">主类型</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-xl font-bold text-neon-purple">{primaryType.probability}%</span>
              <p className="text-[10px] text-muted-foreground">匹配度</p>
            </div>
          </div>

          {/* Secondary Type */}
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-3">
              <div className="px-2.5 py-1 rounded-md bg-muted/50 border border-border">
                <span className="font-mono text-lg font-semibold text-muted-foreground tracking-wider">
                  {secondaryType.type}
                </span>
              </div>
              <div>
                <p className="text-sm text-foreground/80">{secondaryType.nickname}</p>
                <p className="text-[10px] text-muted-foreground">次类型</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-lg font-semibold text-muted-foreground">{secondaryType.probability}%</span>
              <p className="text-[10px] text-muted-foreground">匹配度</p>
            </div>
          </div>
        </div>

        {/* Reasoning */}
        <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs font-medium text-muted-foreground">判定逻辑</span>
          </div>
          <div className="space-y-1.5">
            {reasoningLines.map((line, index) => (
              <p key={index} className="text-sm text-foreground/90 leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Core Traits Summary */}
        <div className="p-3 rounded-lg bg-neon-cyan/5 border border-neon-cyan/20">
          <p className="text-xs font-medium text-muted-foreground mb-1.5">核心特质</p>
          <p className="text-sm text-foreground/90 leading-relaxed">{coreTraitsSummary}</p>
        </div>
      </CardContent>
    </Card>
  )
}
