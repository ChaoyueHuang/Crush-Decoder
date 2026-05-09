"use client"

import React, { useState, useCallback } from "react"
import { Upload, Sparkles, X, Plus, ShieldCheck } from "lucide-react"
import { ThinkingIndicator } from "./thinking-indicator"

interface HeroSectionProps {
  onImagesUpload: (files: File[]) => void
  uploadedImages: string[]
  onRemoveImage: (index: number) => void
  onDecode: () => void
  isDecoding: boolean
  decodingStage: string
}

const MAX_IMAGES = 6

export function HeroSection({
  onImagesUpload,
  uploadedImages,
  onRemoveImage,
  onDecode,
  isDecoding,
  decodingStage,
}: HeroSectionProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      )
      const remainingSlots = MAX_IMAGES - uploadedImages.length
      if (files.length > 0 && remainingSlots > 0) {
        onImagesUpload(files.slice(0, remainingSlots))
      }
    },
    [onImagesUpload, uploadedImages.length]
  )

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      const remainingSlots = MAX_IMAGES - uploadedImages.length
      if (files.length > 0 && remainingSlots > 0) {
        onImagesUpload(files.slice(0, remainingSlots))
      }
      e.target.value = ""
    },
    [onImagesUpload, uploadedImages.length]
  )

  const hasImages = uploadedImages.length > 0
  const canAddMore = uploadedImages.length < MAX_IMAGES

  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center px-4 py-12">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-cyan/15 rounded-full blur-[100px]" />
      </div>

      {/* Title with Gradient Effect */}
      <div className="relative z-10 mb-8 text-center">
        <h1 className="gradient-text font-mono text-4xl md:text-6xl lg:text-7xl font-bold tracking-wider">
          Crush Decoder
        </h1>
        <p className="mt-4 text-muted-foreground text-sm md:text-base mx-auto px-2">
          上传 TA 的朋友圈或小红书截图，一分钟看穿 TA 是真诚、养鱼，还是海王、杀猪盘
        </p>
      </div>

      {/* Upload Area */}
      <div className="relative z-10 w-full max-w-lg">
        {!hasImages ? (
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative flex flex-col items-center justify-center
              w-full h-64 md:h-72
              border-2 border-dashed rounded-xl
              cursor-pointer transition-all duration-300
              ${
                isDragging
                  ? "border-neon-purple bg-neon-purple/10 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
                  : "border-neon-purple/50 bg-secondary/50 md:border-border md:bg-transparent md:hover:border-neon-purple/50 md:hover:bg-secondary/50"
              }
              group
            `}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              className={`
              p-4 rounded-full mb-4 transition-all duration-300
              ${
                isDragging
                  ? "bg-neon-purple/20"
                  : "bg-neon-purple/10 md:bg-secondary md:group-hover:bg-neon-purple/10"
              }
            `}
            >
              <Upload
                className={`w-8 h-8 transition-colors duration-300 ${
                  isDragging
                    ? "text-neon-purple"
                    : "text-neon-purple md:text-muted-foreground md:group-hover:text-neon-purple"
                }`}
              />
            </div>
            <p className="text-foreground font-medium mb-1">
              {isDragging ? "松开上传" : "上传朋友圈或小红书截图"}
            </p>
            <p className="text-muted-foreground text-sm">
              上传越多越懂 TA！最多 {MAX_IMAGES} 张
            </p>

            {/* Neon Border Glow */}
            <div
              className={`
              absolute inset-0 rounded-xl pointer-events-none transition-opacity duration-300
              ${isDragging ? "opacity-100" : "opacity-50 md:opacity-0 md:group-hover:opacity-50"}
            `}
              style={{
                boxShadow: "0 0 20px rgba(168, 85, 247, 0.4), inset 0 0 20px rgba(168, 85, 247, 0.1)",
              }}
            />
          </label>
        ) : (
          <div className="space-y-4">
            {/* Image Grid */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`grid grid-cols-3 gap-3 p-3 rounded-xl border transition-all duration-300 ${
                isDragging
                  ? "border-neon-purple bg-neon-purple/10"
                  : "border-border bg-card/50"
              }`}
            >
              {uploadedImages.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border border-border group"
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Screenshot ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveImage(index)}
                    className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-destructive hover:border-destructive transition-all active:scale-95"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-background/80 backdrop-blur-sm text-muted-foreground">
                    {index + 1}/{MAX_IMAGES}
                  </div>
                </div>
              ))}
              
              {/* Add More Button */}
              {canAddMore && (
                <label className="relative aspect-square rounded-lg border-2 border-dashed border-neon-purple/50 md:border-border md:hover:border-neon-purple/50 cursor-pointer flex items-center justify-center transition-colors group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Plus className="w-6 h-6 text-neon-purple md:text-muted-foreground md:group-hover:text-neon-purple transition-colors" />
                </label>
              )}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              已上传 {uploadedImages.length}/{MAX_IMAGES} 张图片
            </p>

            {/* Decode Button */}
            <div
              onClick={isDecoding ? undefined : onDecode}
              className={`w-full h-12 flex items-center rounded-md overflow-hidden shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all duration-300 ${
                isDecoding ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {/* Main button area */}
              <div className="flex-1 h-full flex items-center justify-center gap-2 bg-neon-purple hover:bg-neon-purple/90 text-primary-foreground font-mono text-base font-semibold transition-colors">
                {isDecoding && decodingStage ? (
                  <ThinkingIndicator stage={decodingStage} />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    解码 Crush
                  </>
                )}
              </div>
              {/* Cost indicator */}
              {!isDecoding && (
                <div className="h-full px-3 flex items-center bg-neon-purple/70 text-primary-foreground/90 text-xs font-mono whitespace-nowrap">
                  10mg 多巴胺
                </div>
              )}
            </div>

            {/* Privacy Notice */}
            <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/30 border border-border/50">
              <ShieldCheck className="w-4 h-4 text-neon-cyan shrink-0 mt-0.5" />
              <div className="text-[11px] text-muted-foreground leading-relaxed">
                <p>请确保您上传的内容不侵犯他人隐私，内容仅供AI分析</p>
                <p>分析完成后图片销毁，服务器不留存图片</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
