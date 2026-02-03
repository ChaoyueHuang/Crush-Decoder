"use client"

import { useEffect, useState } from "react"
import { Lock, Sparkles, Target, Fish, Search, Shield, Users, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface LockedOverlayProps {
  onUnlock: () => void
}

// Blurred preview content to entice users
const previewSections = [
  {
    icon: Target,
    title: "软肋分析",
    color: "text-neon-pink",
    preview: ["情感需求: TA 特别在意被认可和理解...", "社交偏好: 喜欢小圈子深度交流...", "决策模式: 倾向于感性决策..."],
  },
  {
    icon: Fish,
    title: "真实性评估 & 钓鱼检测",
    color: "text-neon-cyan",
    preview: ["真实性评分: 87/100", "钓鱼风险: 低", "朋友圈内容风格一致，无明显人设痕迹..."],
  },
  {
    icon: Search,
    title: "矛盾点验证",
    color: "text-yellow-400",
    preview: ["独立 vs 依赖: 虽然展现独立形象...", "理性 vs 感性: 声称讨厌drama...", "社交 vs 独处: 频繁晒聚会但也常发..."],
  },
  {
    icon: Shield,
    title: "防御机制分析",
    color: "text-neon-purple",
    preview: ["幽默化解: 用轻松幽默的方式回避...", "忙碌屏障: 以忙碌为由保持距离...", "模糊回应: 对敏感问题给出..."],
  },
  {
    icon: Users,
    title: "对比分析：猎手与猎物",
    color: "text-neon-cyan",
    preview: ["你（猎手）: 主动追求者、目标明确...", "TA（猎物）: 被动等待者、享受被追求...", "关系动态: 目前你处于主动位置..."],
  },
  {
    icon: FileText,
    title: "总结与建议",
    color: "text-neon-purple",
    preview: ["综合分析: 你的 Crush 是一个...", "行动建议: 保持真诚，避免过度表演...", "最后寄语: 爱情需要时间培育..."],
  },
]

export function LockedOverlay({ onUnlock }: LockedOverlayProps) {
  const [unlockCount, setUnlockCount] = useState(216)

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

  return (
    <div className="relative">
      {/* Blurred Preview Cards - Compact Grid */}
      <div className="grid grid-cols-2 gap-2 select-none">
        {previewSections.map((section, index) => {
          const IconComponent = section.icon
          return (
            <Card key={index} className="border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
              <CardHeader className="py-2 px-3">
                <CardTitle className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <IconComponent className={`w-3 h-3 ${section.color}`} />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative px-3 pb-2 pt-0">
                <div className="space-y-1 blur-[3px] opacity-70">
                  {section.preview.slice(0, 2).map((text, i) => (
                    <p key={i} className="text-[10px] text-foreground/80 truncate">
                      {text}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Glassmorphism Overlay - Lighter blur */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/50 to-background/80 backdrop-blur-[1px] flex items-center justify-center">
        <div className="text-center px-6 py-8">
          {/* Lock Icon with Glow */}
          <div className="relative inline-flex mb-4">
            <div className="absolute inset-0 bg-neon-purple/30 rounded-full blur-xl animate-pulse" />
            <div className="relative p-4 rounded-full bg-card/80 border border-neon-purple/50 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
              <Lock className="w-8 h-8 text-neon-purple" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-foreground mb-2">
            解锁高级分析报告
          </h3>
          
          {/* Description */}
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto leading-relaxed">
            获取完整的软肋分析、真实性评估、防御机制等 6 大深度洞察模块
          </p>

          {/* Feature Tags */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {["软肋分析", "钓鱼检测", "矛盾验证", "防御机制", "猎人猎物分析", "专属建议"].map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-[10px] font-medium rounded-full bg-neon-purple/10 border border-neon-purple/30 text-neon-purple"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            onClick={onUnlock}
            size="lg"
            className="bg-neon-purple hover:bg-neon-purple/90 text-primary-foreground font-semibold shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:shadow-[0_0_40px_rgba(168,85,247,0.7)] transition-all duration-300 px-8"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            升级解锁 · ¥9.9
          </Button>

          {/* Trust Badge */}
          <p className="mt-4 text-[10px] text-muted-foreground">
            已有 {new Intl.NumberFormat("zh-CN").format(unlockCount)} 人解锁完整报告
          </p>
        </div>
      </div>
    </div>
  )
}
