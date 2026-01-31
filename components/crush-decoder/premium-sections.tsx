"use client"

import {
  Target,
  AlertTriangle,
  Fish,
  Search,
  Shield,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Lightbulb,
  Heart,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// 软肋分析 - Premium Section 1
interface WeaknessAnalysisProps {
  weaknesses: { title: string; description: string }[]
}

export function WeaknessAnalysis({ weaknesses }: WeaknessAnalysisProps) {
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Target className="w-4 h-4 text-neon-pink" />
          软肋分析
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {weaknesses.map((item, index) => (
          <div key={index} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-2 mb-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-neon-pink" />
              <span className="text-sm font-medium text-foreground">{item.title}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// 真实性评估&钓鱼检测 - Premium Section 2
interface AuthenticityCheckProps {
  score: number
  riskLevel: "低" | "中" | "高"
  signals: { type: "positive" | "negative"; text: string }[]
}

export function AuthenticityCheck({ score, riskLevel, signals }: AuthenticityCheckProps) {
  const getRiskColor = (level: string) => {
    if (level === "低") return "text-green-400 bg-green-400/10 border-green-400/30"
    if (level === "中") return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"
    return "text-red-400 bg-red-400/10 border-red-400/30"
  }

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Fish className="w-4 h-4 text-neon-cyan" />
          真实性评估 & 钓鱼检测
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground mb-1">真实性评分</p>
            <div className="flex items-end gap-1">
              <span className="font-mono text-3xl font-bold text-neon-cyan">{score}</span>
              <span className="text-sm text-muted-foreground mb-1">/100</span>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border ${getRiskColor(riskLevel)}`}>
            <span className="text-xs font-medium">钓鱼风险: {riskLevel}</span>
          </div>
        </div>
        <div className="space-y-2">
          {signals.map((signal, index) => (
            <div key={index} className="flex items-start gap-2">
              {signal.type === "positive" ? (
                <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <span className="text-xs text-foreground/80">{signal.text}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// 矛盾点验证 - Premium Section 3
interface ContradictionCheckProps {
  contradictions: { aspect: string; finding: string; implication: string }[]
}

export function ContradictionCheck({ contradictions }: ContradictionCheckProps) {
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Search className="w-4 h-4 text-yellow-400" />
          矛盾点验证
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {contradictions.map((item, index) => (
          <div key={index} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
            <p className="text-xs font-medium text-yellow-400 mb-1">{item.aspect}</p>
            <p className="text-sm text-foreground mb-1.5">{item.finding}</p>
            <p className="text-xs text-muted-foreground italic">→ {item.implication}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// 防御机制分析 - Premium Section 4
interface DefenseMechanismProps {
  mechanisms: { name: string; description: string; suggestion: string }[]
}

export function DefenseMechanism({ mechanisms }: DefenseMechanismProps) {
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Shield className="w-4 h-4 text-neon-purple" />
          防御机制分析
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mechanisms.map((item, index) => (
          <div key={index} className="p-3 rounded-lg bg-secondary/30 border border-border/50">
            <p className="text-sm font-medium text-foreground mb-1">{item.name}</p>
            <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
            <div className="flex items-start gap-2 p-2 rounded bg-neon-purple/10 border border-neon-purple/20">
              <Lightbulb className="w-3.5 h-3.5 text-neon-purple shrink-0 mt-0.5" />
              <p className="text-xs text-neon-purple">{item.suggestion}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// 对比分析：猎手与猎物 - Premium Section 5
interface HunterPreyAnalysisProps {
  hunterTraits: string[]
  preyTraits: string[]
}

export function HunterPreyAnalysis({ hunterTraits, preyTraits }: HunterPreyAnalysisProps) {
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Users className="w-4 h-4 text-neon-cyan" />
          对比分析：猎手与猎物
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30">
            <p className="text-xs font-medium text-neon-cyan mb-2">TA 作为猎手</p>
            <div className="space-y-1">
              {hunterTraits.map((trait, index) => (
                <p key={index} className="text-xs text-foreground/80">{trait}</p>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-neon-pink/10 border border-neon-pink/30">
            <p className="text-xs font-medium text-neon-pink mb-2">TA 作为猎物</p>
            <div className="space-y-1">
              {preyTraits.map((trait, index) => (
                <p key={index} className="text-xs text-foreground/80">{trait}</p>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 总结与建议 - Premium Section 6
interface SummaryAdviceProps {
  summary: string
  advices: { priority: "high" | "medium" | "low"; text: string }[]
  finalNote: string
}

export function SummaryAdvice({ summary, advices, finalNote }: SummaryAdviceProps) {
  const getPriorityStyle = (priority: string) => {
    if (priority === "high") return "bg-neon-pink/20 border-neon-pink/40 text-neon-pink"
    if (priority === "medium") return "bg-neon-purple/20 border-neon-purple/40 text-neon-purple"
    return "bg-neon-cyan/20 border-neon-cyan/40 text-neon-cyan"
  }

  return (
    <Card className="border-neon-purple/30 bg-card/50 backdrop-blur-sm shadow-[0_0_20px_rgba(168,85,247,0.2)]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <FileText className="w-4 h-4 text-neon-purple" />
          总结与建议
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-foreground/90 leading-relaxed">{summary}</p>
        
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">行动建议</p>
          {advices.map((advice, index) => (
            <div
              key={index}
              className={`flex items-start gap-2 p-2 rounded-lg border ${getPriorityStyle(advice.priority)}`}
            >
              <span className="text-xs font-mono shrink-0">
                {advice.priority === "high" ? "!!!" : advice.priority === "medium" ? "!!" : "!"}
              </span>
              <p className="text-xs">{advice.text}</p>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-lg bg-neon-purple/10 border border-neon-purple/30">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-3.5 h-3.5 text-neon-pink" />
            <span className="text-xs font-medium text-neon-pink">最后寄语</span>
          </div>
          <p className="text-sm text-foreground/90 italic">{finalNote}</p>
        </div>
      </CardContent>
    </Card>
  )
}
