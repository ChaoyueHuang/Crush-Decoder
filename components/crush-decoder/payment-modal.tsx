"use client"

import { useState } from "react"
import { X, Sparkles, Check, ExternalLink, Unlock, Fish } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentComplete: () => void
  onOpenXianyu?: () => void
}

const XIANYU_URL = "https://m.tb.cn/h.7sFlEwT?tk=QnmyUjjzRss"

const features = [
  "软肋分析 - 找到 TA 的情感弱点",
  "真实性评估 & 钓鱼检测",
  "矛盾点验证 - 发现言行不一",
  "防御机制分析 - 了解 TA 的心理屏障",
  "猎手与猎物对比分析",
  "专属总结与行动建议",
]

export function PaymentModal({ isOpen, onClose, onPaymentComplete, onOpenXianyu }: PaymentModalProps) {
  const [redemptionCode, setRedemptionCode] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handleUnlock = async () => {
    if (!redemptionCode.trim()) {
      toast.error("兑换码不能为空")
      return
    }

    const normalized = redemptionCode.replace(/\s+/g, "").toUpperCase()
    setIsProcessing(true)

    try {
      const currentDeviceId = (() => {
        try {
          const stored = localStorage.getItem("crush_device_id")
          if (stored) return stored
          const id = crypto.randomUUID()
          localStorage.setItem("crush_device_id", id)
          return id
        } catch {
          return ""
        }
      })()

      if (!currentDeviceId) {
        throw new Error("设备初始化失败，请刷新页面后重试")
      }

      const response = await fetch("/api/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: normalized, deviceId: currentDeviceId }),
      })

      if (!response.ok) {
        const rawText = await response.text()
        let errorMessage = "请输入正确的兑换码"
        try {
          const errorData = rawText ? JSON.parse(rawText) : {}
          errorMessage = errorData?.error || errorMessage
        } catch {
          if (rawText) errorMessage = rawText
        }
        throw new Error(errorMessage)
      }

      setRedemptionCode("")
      onPaymentComplete()
    } catch (error) {
      const message = error instanceof Error ? error.message : "请输入正确的兑换码"
      toast.error(message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleOpenXianyu = () => {
    onOpenXianyu?.()
    window.location.href = XIANYU_URL
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.3)]">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-b from-neon-purple/20 to-transparent">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-neon-purple/20 border border-neon-purple/30">
              <Sparkles className="w-5 h-5 text-neon-purple" />
            </div>
            <h2 className="text-xl font-bold text-foreground">解锁高级分析</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            获取完整的心理分析报告，掌握攻略 Crush 的关键信息
          </p>
        </div>

        {/* Features */}
        <div className="px-6 py-4 border-t border-border/50">
          <p className="text-xs font-medium text-muted-foreground mb-3">包含内容</p>
          <ul className="space-y-2.5">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2.5">
                <div className="p-0.5 rounded-full bg-neon-cyan/20 mt-0.5">
                  <Check className="w-3 h-3 text-neon-cyan" />
                </div>
                <span className="text-sm text-foreground/90">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Redemption Code & Action */}
        <div className="p-6 pt-4 border-t border-border/50 bg-secondary/20 space-y-4">
          {/* Redemption Code Input */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">输入兑换码</p>
            <Input
              value={redemptionCode}
              onChange={(e) => setRedemptionCode(e.target.value)}
              placeholder="在此粘贴兑换码"
              className="h-11 bg-background/50 border-border focus:border-neon-purple focus:ring-neon-purple/20"
            />
          </div>

          {/* Unlock Button */}
          <Button
            onClick={handleUnlock}
            disabled={isProcessing}
            className="w-full h-12 bg-neon-purple hover:bg-neon-purple/90 text-primary-foreground font-semibold shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                验证中...
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                立即解锁
              </>
            )}
          </Button>

          {/* Xianyu Purchase Guide */}
          <div className="pt-3 border-t border-border/30">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-muted-foreground line-through">原价 ¥29.9</p>
                <div className="flex items-end gap-1">
                  <span className="text-2xl font-bold text-neon-purple">¥9.9</span>
                  <span className="text-xs text-muted-foreground mb-1">限时优惠</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-yellow-500">
                <Fish className="w-3 h-3" />
                <span>闲鱼担保交易</span>
              </div>
            </div>
            <Button
              onClick={handleOpenXianyu}
              variant="outline"
              className="w-full h-10 bg-transparent border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 hover:border-yellow-500 hover:text-yellow-500 transition-all"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              打开闲鱼购买兑换码
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
