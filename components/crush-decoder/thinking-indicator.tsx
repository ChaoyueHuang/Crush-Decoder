"use client"

import { useState, useEffect } from "react"
import { Brain } from "lucide-react"

interface ThinkingIndicatorProps {
  stage: string
}

export function ThinkingIndicator({ stage }: ThinkingIndicatorProps) {
  const [shimmerPosition, setShimmerPosition] = useState(0)

  // Shimmer/scanning effect across text
  useEffect(() => {
    const timer = setInterval(() => {
      setShimmerPosition((prev) => (prev + 1) % (stage.length + 3))
    }, 80)

    return () => clearInterval(timer)
  }, [stage.length])

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Brain className="w-5 h-5 text-primary-foreground" />
        <div className="absolute inset-0 animate-ping">
          <Brain className="w-5 h-5 text-primary-foreground opacity-30" />
        </div>
      </div>
      <span className="font-mono text-base text-primary-foreground relative">
        {stage.split("").map((char, index) => (
          <span
            key={index}
            className="transition-all duration-100"
            style={{
              opacity: index <= shimmerPosition ? 1 : 0.5,
              textShadow: index === shimmerPosition ? "0 0 8px rgba(255,255,255,0.8)" : "none",
            }}
          >
            {char}
          </span>
        ))}
      </span>
    </div>
  )
}
