"use client"

import { useEffect, useState } from "react"
import { Crosshair, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DifficultyScoreCardProps {
  score: number
  label: string
  ranking?: string
  desc?: string
}

export function DifficultyScoreCard({ score, label, ranking, desc }: DifficultyScoreCardProps) {
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    const duration = 1500
    const steps = 60
    const increment = score / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setDisplayScore(score)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score])

  const getDifficultyLevel = (s: number) => {
    if (s >= 80) return { text: "困难", color: "text-neon-pink", desc: "需要耐心和策略" }
    if (s >= 60) return { text: "中等", color: "text-neon-purple", desc: "有一定挑战性" }
    if (s >= 40) return { text: "简单", color: "text-neon-cyan", desc: "相对容易接近" }
    return { text: "极易", color: "text-green-400", desc: "非常容易建立联系" }
  }

  const getScoreGlow = (s: number) => {
    if (s >= 80) return "shadow-[0_0_30px_rgba(255,0,128,0.3)]"
    if (s >= 60) return "shadow-[0_0_30px_rgba(168,85,247,0.3)]"
    if (s >= 40) return "shadow-[0_0_30px_rgba(0,255,255,0.3)]"
    return "shadow-[0_0_30px_rgba(74,222,128,0.3)]"
  }

  const difficulty = getDifficultyLevel(score)
  const displayRanking = ranking ?? difficulty.text
  const displayDesc = desc ?? difficulty.desc

  return (
    <Card className={`relative overflow-hidden border-border bg-card/50 backdrop-blur-sm ${getScoreGlow(score)}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Crosshair className="w-4 h-4 text-neon-cyan" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2">
          <span className={`font-mono text-5xl md:text-6xl font-bold ${difficulty.color}`}>
            {displayScore}
          </span>
          <div className="mb-2">
            <span className={`text-lg font-mono font-bold ${difficulty.color}`}>{displayRanking}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <TrendingUp className="w-3 h-3 text-neon-cyan" />
          <span>{displayDesc}</span>
        </div>
      </CardContent>

      {/* Decorative corner */}
      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
        <div className="absolute top-2 right-2 w-20 h-20 bg-neon-purple/10 rotate-45 transform origin-top-right" />
      </div>
    </Card>
  )
}
