"use client"

import { Heart, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PsychologyCardProps {
  currentState: string
  innerDesire: string
}

export function PsychologyCard({ currentState, innerDesire }: PsychologyCardProps) {
  return (
    <Card className="relative overflow-hidden border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Heart className="w-4 h-4 text-neon-pink" />
          心理状态与内心世界
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current State */}
        <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            <span className="text-xs font-medium text-neon-cyan">目前的心理状态</span>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">{currentState}</p>
        </div>

        {/* Inner Desire */}
        <div className="p-3 rounded-lg bg-neon-pink/5 border border-neon-pink/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-neon-pink" />
            <span className="text-xs font-medium text-neon-pink">内心深处的渴望</span>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">{innerDesire}</p>
        </div>
      </CardContent>
    </Card>
  )
}
