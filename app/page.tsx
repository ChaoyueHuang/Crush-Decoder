"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { HeroSection } from "@/components/crush-decoder/hero-section"
import { DopamineHeader } from "@/components/crush-decoder/dopamine-header"
import { DopamineModal } from "@/components/crush-decoder/dopamine-modal"
import { AnalysisResult } from "@/components/crush-decoder/analysis-result"
import { PaymentModal } from "@/components/crush-decoder/payment-modal"
import { Toaster, toast } from "sonner"
import { analysisSchema, type AnalysisData } from "@/lib/analysis-schema"
import { createBrowserSupabaseClient } from "@/lib/supabase-client"

const DECODING_STAGES = [
  "AI 正在阅读...",
  "正在分析内容...",
  "正在推演心理...",
]
const DECODING_FINAL_STAGE = "正在生成报告..."
const DECODING_FINAL_WAIT_STAGE = "正在生成报告…请耐心等待"
const USE_HELLO_TEST = false
const MAX_IMAGES = 6
const MAX_API_IMAGES = 3
const MAX_API_TOTAL_BYTES = 6 * 1024 * 1024
const MAX_IMAGE_BYTES = 1100 * 1024

export default function CrushDecoderPage() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isDecoding, setIsDecoding] = useState(false)
  const [decodingStage, setDecodingStage] = useState("")
  const [showResult, setShowResult] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const resultRef = useRef<HTMLDivElement>(null)
  const waitTimeoutRef = useRef<number | null>(null)
  const [ghostId, setGhostId] = useState<string>("")
  const [customerId, setCustomerId] = useState("DA000000")
  const [visitorId, setVisitorId] = useState<string>("")
  const [deviceKey, setDeviceKey] = useState<string>("")
  const [dopamine, setDopamine] = useState(20)
  const [dopamineDisplay, setDopamineDisplay] = useState(20)
  const [showDopamineModal, setShowDopamineModal] = useState(false)
  const [hasClaimedFirstReward, setHasClaimedFirstReward] = useState(true)
  const [hasClaimedDailyReward, setHasClaimedDailyReward] = useState(false)
  const [isClaimingFirstReward, setIsClaimingFirstReward] = useState(false)
  const [isClaimingDailyReward, setIsClaimingDailyReward] = useState(false)
  const [inviteCount, setInviteCount] = useState(0)
  const [invitedBy, setInvitedBy] = useState<string | null>(null)
  const lastInviteLogIdRef = useRef<string | null>(null)
  const suppressInviteToastUntilRef = useRef<number>(0)

  useEffect(() => {
    const initGhost = async () => {
      try {
        const buildDeviceKey = async () => {
          const parts = [
            navigator.platform || "unknown",
            `${window.screen?.width ?? 0}x${window.screen?.height ?? 0}`,
            window.screen?.colorDepth?.toString?.() ?? "0",
            Intl.DateTimeFormat().resolvedOptions().timeZone ?? "unknown",
            navigator.language || "unknown",
            navigator.maxTouchPoints?.toString?.() ?? "0",
          ]
          const raw = parts.join("|")
          const encoder = new TextEncoder()
          const data = encoder.encode(raw)
          const hashBuffer = await crypto.subtle.digest("SHA-256", data)
          const hashArray = Array.from(new Uint8Array(hashBuffer))
          return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
        }

        const deviceKeyValue = await buildDeviceKey()
        setDeviceKey(deviceKeyValue)

        const fpjs = await import("@fingerprintjs/fingerprintjs")
        const agent = await fpjs.load()
        const result = await agent.get()
        const vid = result.visitorId
        setVisitorId(vid)

        const localDate = new Date().toLocaleDateString("en-CA")
        const response = await fetch("/api/ghost-init", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ visitorId: vid, deviceKey: deviceKeyValue, localDate }),
        })

        if (response.ok) {
          const data = await response.json()
          if (data?.ghostId) setGhostId(data.ghostId)
          if (data?.customerId) setCustomerId(data.customerId)
          if (data?.selfInvite) {
            toast.error("你不能邀请自己接入新节点")
          }
        } else {
          const rawText = await response.text()
          let message = "当前区域接入信号过载，正在重新分配线路，请等待30秒后重试"
          try {
            const errorData = rawText ? JSON.parse(rawText) : {}
            message = errorData?.error || message
          } catch {
            if (rawText) message = rawText
          }
          toast.error("初始化失败", { description: message })
        }
      } catch {
        // ignore
      }
    }

    initGhost()

    try {
      const raw = sessionStorage.getItem("crush_state_full")
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (parsed?.analysisData) setAnalysisData(parsed.analysisData)
      if (typeof parsed?.showResult === "boolean") setShowResult(parsed.showResult)
      if (typeof parsed?.isUnlocked === "boolean") setIsUnlocked(parsed.isUnlocked)
      if (parsed?.showPaymentModal) setShowPaymentModal(true)
      sessionStorage.removeItem("crush_state_full")
    } catch {
      // ignore
    }
  }, [])

  const syncDopamineFromServer = useCallback(async (gid: string) => {
    try {
      const localDate = new Date().toLocaleDateString("en-CA")
      const response = await fetch("/api/dopamine/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ghostId: gid, localDate }),
      })
      if (!response.ok) return
      const data = await response.json()
      const info = data?.data
      if (!info) return
      setDopamine(info.dopamine)
      setDopamineDisplay(info.dopamine)
      setHasClaimedFirstReward(info.first_reward_claimed)
      const today = new Date().toLocaleDateString("en-CA")
      setHasClaimedDailyReward(info.daily_claim_date === today)
      setInviteCount(info.invite_count_today ?? 0)
      setInvitedBy(info.invited_by ?? null)
      try {
        const todayKey = `invite_count_today_${today}`
        const prev = Number(localStorage.getItem(todayKey) || "0")
        if (info.invite_count_today > prev && Date.now() > suppressInviteToastUntilRef.current) {
          toast.success("新节点接入，多巴胺+30mg")
        }
        localStorage.setItem(todayKey, String(info.invite_count_today ?? 0))
      } catch {
        // ignore storage errors
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    if (ghostId) {
      syncDopamineFromServer(ghostId)
    }
  }, [ghostId, syncDopamineFromServer])

  useEffect(() => {
    if (!ghostId) return

    const client = createBrowserSupabaseClient()
    if (!client) return

    let isSubscribed = false
    const channel = client
      .channel(`referral_logs_${ghostId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "referral_logs",
          filter: `inviter_ghost_id=eq.${ghostId}`,
        },
        (payload) => {
          const logId = (payload.new as { id?: string }).id ?? null
          if (logId && lastInviteLogIdRef.current === logId) return
          lastInviteLogIdRef.current = logId
          suppressInviteToastUntilRef.current = Date.now() + 5000
          syncDopamineFromServer(ghostId)
          toast.success("新节点接入，多巴胺+30mg")
        }
      )
      .subscribe((status) => {
        isSubscribed = status === "SUBSCRIBED"
      })

    const pollTimer = window.setInterval(() => {
      if (!ghostId) return
      if (!isSubscribed) {
        syncDopamineFromServer(ghostId)
      }
    }, 6000)

    return () => {
      window.clearInterval(pollTimer)
      client.removeChannel(channel)
    }
  }, [ghostId, syncDopamineFromServer])

  const animateDopamineTo = useCallback((target: number) => {
    const startValue = dopamineDisplay
    const duration = 600
    const startTime = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      const value = Math.round(startValue + (target - startValue) * eased)
      setDopamineDisplay(value)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [dopamineDisplay])

  const handleImagesUpload = useCallback((files: File[]) => {
    setUploadedFiles((prevFiles) => {
      const remaining = MAX_IMAGES - prevFiles.length
      const nextFiles = files.slice(0, Math.max(0, remaining))
      return [...prevFiles, ...nextFiles]
    })

    const remainingSlots = MAX_IMAGES - uploadedImages.length
    const filesToRead = files.slice(0, Math.max(0, remainingSlots))
    filesToRead.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImages((prev) => {
          if (prev.length >= MAX_IMAGES) return prev
          return [...prev, e.target?.result as string]
        })
        setShowResult(false)
        setAnalysisData(null)
      }
      reader.readAsDataURL(file)
    })
  }, [uploadedImages.length])

  const handleRemoveImage = useCallback((index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index))
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
    setShowResult(false)
    setAnalysisData(null)
  }, [])

  const handleDecode = useCallback(async () => {
    if (isDecoding) return
    setIsUnlocked(false)
    setShowPaymentModal(false)

    const currentVisitorId = visitorId
    if (!currentVisitorId) {
      toast.error("解码失败", {
        description: "设备指纹初始化失败，请稍后重试",
      })
      return
    }
    if (!USE_HELLO_TEST && uploadedFiles.length === 0) {
      toast.error("请先上传图片", {
        description: "至少上传 1 张微信朋友圈或小红书截图",
      })
      return
    }

    setIsDecoding(true)
    let cancelled = false
    setDecodingStage(DECODING_STAGES[0])
    setShowResult(false)

    try {
      const stageLoop = (async () => {
        for (let i = 0; i < DECODING_STAGES.length; i += 1) {
          if (cancelled) return
          setDecodingStage(DECODING_STAGES[i])
          await sleep(1200)
        }
        if (!cancelled) {
          setDecodingStage(DECODING_FINAL_STAGE)
          if (waitTimeoutRef.current) window.clearTimeout(waitTimeoutRef.current)
          waitTimeoutRef.current = window.setTimeout(() => {
            if (!cancelled) {
              setDecodingStage(DECODING_FINAL_WAIT_STAGE)
            }
          }, 3000)
        }
      })()

      let response: Response

      if (USE_HELLO_TEST) {
        response = await fetch("/api/decode-hello", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      } else {
        const filesForApi = uploadedFiles.slice(0, MAX_API_IMAGES)
        const compressedImages: string[] = []
        let totalBytes = 0

        for (const file of filesForApi) {
          const dataUrl = await compressImage(file, MAX_IMAGE_BYTES)
          const sizeBytes = estimateDataUrlBytes(dataUrl)

          if (compressedImages.length > 0 && totalBytes + sizeBytes > MAX_API_TOTAL_BYTES) {
            toast.info("已自动减少图片数量以提升解析成功率", {
              description: "图片过大时仅发送前几张截图",
            })
            break
          }

          compressedImages.push(dataUrl)
          totalBytes += sizeBytes
        }

        if (compressedImages.length === 0) {
          throw new Error("图片体积过大，请更换清晰度更低的截图后重试")
        }

        response = await fetch("/api/decode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ images: compressedImages, visitorId: currentVisitorId }),
        })
      }

      const rawText = await response.text()

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("您今天的免费试用次数已达上限")
        }
        if (response.status === 503) {
          throw new Error("模型服务暂时不可用，请稍后再试")
        }
        if (response.status === 524) {
          throw new Error("模型响应超时，请稍后再试或减少图片数量")
        }
        let errorMessage = "请求失败，请稍后重试"
        try {
          const errorData = rawText ? JSON.parse(rawText) : {}
          errorMessage = errorData?.error || errorMessage
        } catch {
          if (rawText) errorMessage = rawText
        }
        throw new Error(errorMessage)
      }

      if (!rawText) {
        throw new Error("服务端返回空响应，请稍后重试")
      }

      let payload: unknown
      try {
        payload = JSON.parse(rawText)
      } catch {
        throw new Error("服务端返回格式异常，请稍后重试")
      }

      if (USE_HELLO_TEST) {
        await stageLoop
        setShowResult(false)
        toast.success("测试请求成功！", {
          description: "已成功返回模型响应（未发送图片）",
        })
        return
      }

      const parsed = analysisSchema.safeParse(payload?.data)
      if (!parsed.success) {
        throw new Error("返回数据结构不符合要求")
      }

      if (parsed.data.is_wechat_or_xiaohongshu === 0) {
        toast.error("请上传微信朋友圈或小红书截图", {
          description: "系统未识别到有效截图，请重新上传",
        })
        return
      }

      await stageLoop
      setAnalysisData(parsed.data)
      setShowResult(true)
      toast.success("解码完成！", {
        description: "已生成你的 Crush 分析报告",
      })

      if (ghostId) {
        const spendRes = await fetch("/api/dopamine/spend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ghostId, amount: 10 }),
        })
        if (spendRes.ok) {
          const data = await spendRes.json()
          const next = data?.data?.dopamine
          if (typeof next === "number") {
            setDopamine(next)
            animateDopamineTo(next)
          }
        }
      }

      // Scroll to analysis result after a short delay for render
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
    } catch (error) {
      const message = error instanceof Error ? error.message : "请求失败，请重试"
      toast.error("解码失败", {
        description: message,
      })
    } finally {
      cancelled = true
      if (waitTimeoutRef.current) {
        window.clearTimeout(waitTimeoutRef.current)
        waitTimeoutRef.current = null
      }
      setIsDecoding(false)
      setDecodingStage("")
    }
  }, [uploadedFiles, isDecoding, visitorId])

  const handleUnlock = useCallback(() => {
    setShowPaymentModal(true)
  }, [])

  const handlePaymentComplete = useCallback(() => {
    setShowPaymentModal(false)
    setIsUnlocked(true)
    toast.success("解锁成功！", {
      description: "已解锁完整分析报告",
    })
  }, [])

  return (
    <main className="min-h-screen bg-background">
      {/* Scan Line Effect */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)]" />
      </div>

      <DopamineHeader
        username={customerId}
        dopamine={dopamineDisplay}
        onOpenModal={() => setShowDopamineModal(true)}
      />

      {/* Hero Section */}
      <HeroSection
        onImagesUpload={handleImagesUpload}
        uploadedImages={uploadedImages}
        onRemoveImage={handleRemoveImage}
        onDecode={handleDecode}
        isDecoding={isDecoding}
        decodingStage={decodingStage}
      />

      {/* Analysis Result */}
      {showResult && (
        <div ref={resultRef}>
          <AnalysisResult onUnlock={handleUnlock} isUnlocked={isUnlocked} analysisData={analysisData ?? undefined} />
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentComplete={handlePaymentComplete}
        visitorId={visitorId}
        onOpenXianyu={() => {
          try {
            const snapshot = {
              analysisData,
              showResult,
              isUnlocked,
              showPaymentModal: true,
            }
            sessionStorage.setItem("crush_state_full", JSON.stringify(snapshot))
          } catch {
            // ignore storage errors
          }
        }}
      />

      <DopamineModal
        isOpen={showDopamineModal}
        onClose={() => setShowDopamineModal(false)}
        username={customerId}
        dopamine={dopamine}
        inviteCount={inviteCount}
        invitedBy={invitedBy}
        hasClaimedFirstReward={hasClaimedFirstReward}
        hasClaimedDailyReward={hasClaimedDailyReward}
        isClaimingFirst={isClaimingFirstReward}
        isClaimingDaily={isClaimingDailyReward}
        onClaimFirst={async () => {
          if (!ghostId || hasClaimedFirstReward) return
          setIsClaimingFirstReward(true)
          try {
            const res = await fetch("/api/dopamine/claim-first", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ghostId }),
            })
            if (res.ok) {
              const data = await res.json()
              const next = data?.data?.dopamine
              if (typeof next === "number") {
                setDopamine(next)
                setDopamineDisplay(next)
                setHasClaimedFirstReward(true)
                return next
              }
            }
            return null
          } finally {
            setIsClaimingFirstReward(false)
          }
        }}
        onClaimDaily={async () => {
          if (!ghostId || hasClaimedDailyReward) return
          setIsClaimingDailyReward(true)
          try {
            const localDate = new Date().toLocaleDateString("en-CA")
            const res = await fetch("/api/dopamine/claim-daily", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ ghostId, localDate }),
            })
            if (res.ok) {
              const data = await res.json()
              const next = data?.data?.dopamine
              if (typeof next === "number") {
                setDopamine(next)
                setDopamineDisplay(next)
                setHasClaimedDailyReward(true)
                return next
              }
            }
            return null
          } finally {
            setIsClaimingDailyReward(false)
          }
        }}
      />

      {/* Footer */}
      <footer className="py-8 text-center">
        <p className="text-xs text-muted-foreground">
          Crush Decoder · AI 驱动的社交洞察
        </p>
      </footer>

      <Toaster 
        theme="dark"
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(18, 12, 30, 0.95)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            color: "white",
          },
        }}
      />
    </main>
  )
}

const readBlobAsDataURL = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("图片读取失败"))
    reader.readAsDataURL(blob)
  })

const loadImageElement = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("图片加载失败"))
    }
    img.src = url
  })

const compressImage = async (file: File, targetBytes: number) => {
  let maxDimension = 1280
  let quality = 0.82
  const image = await loadImageElement(file)

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("无法创建画布")

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height))
    const targetWidth = Math.round(image.width * scale)
    const targetHeight = Math.round(image.height * scale)

    canvas.width = targetWidth
    canvas.height = targetHeight
    ctx.clearRect(0, 0, targetWidth, targetHeight)
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight)

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result)
          else reject(new Error("图片压缩失败"))
        },
        "image/jpeg",
        quality
      )
    })

    const dataUrl = await readBlobAsDataURL(blob)
    const sizeBytes = estimateDataUrlBytes(dataUrl)
    if (sizeBytes <= targetBytes) return dataUrl

    if (quality > 0.62) {
      quality -= 0.1
    } else {
      maxDimension = Math.max(640, Math.round(maxDimension * 0.85))
    }
  }

  const fallbackBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) resolve(result)
        else reject(new Error("图片压缩失败"))
      },
      "image/jpeg",
      0.6
    )
  })

  return readBlobAsDataURL(fallbackBlob)
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const estimateDataUrlBytes = (dataUrl: string) => {
  const base64 = dataUrl.split(",")[1] || ""
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0
  return Math.max(0, Math.ceil((base64.length * 3) / 4) - padding)
}
