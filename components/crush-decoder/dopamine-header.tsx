"use client"

import { Plus } from "lucide-react"
import { toast } from "sonner"

interface DopamineHeaderProps {
  username: string
  dopamine: number
  onOpenModal: () => void
}

// Custom Dopamine Molecule Icon
export function DopamineIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Benzene ring */}
      <path d="M8 6L12 4L16 6L16 10L12 12L8 10Z" />
      {/* Catechol OH groups */}
      <circle cx="6" cy="5" r="1.5" fill="currentColor" />
      <circle cx="6" cy="11" r="1.5" fill="currentColor" />
      {/* Ethylamine chain */}
      <path d="M12 12L14 16L18 18" />
      {/* Amine group */}
      <circle cx="19" cy="19" r="2" fill="currentColor" />
    </svg>
  )
}

export function DopamineHeader({ username, dopamine, onOpenModal }: DopamineHeaderProps) {
  const handleCopyUsername = () => {
    navigator.clipboard.writeText(username)
    toast.success("用户名已复制到剪贴板")
  }

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center rounded-xl bg-card/90 backdrop-blur-md border border-neon-purple/40 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
      {/* Username - Clickable to copy */}
      <button
        type="button"
        onClick={handleCopyUsername}
        className="flex items-center px-3 py-2 hover:bg-secondary/30 rounded-l-xl transition-colors"
      >
        <span className="text-[10px] font-mono text-muted-foreground">
          #{username}
        </span>
      </button>

      {/* Divider */}
      <div className="w-px h-4 bg-border/30" />

      {/* Dopamine Display - Clickable to open modal */}
      <button
        type="button"
        onClick={onOpenModal}
        className="flex items-center gap-2 px-3 py-2 hover:bg-secondary/30 rounded-r-xl transition-colors"
      >
        <DopamineIcon className="w-5 h-5 text-neon-pink" />
        <div className="flex flex-col items-start">
          <span className="text-[9px] text-neon-pink leading-none">多巴胺</span>
          <span className="font-mono text-sm font-semibold text-neon-cyan leading-tight">
            {dopamine}mg
          </span>
        </div>

        {/* Add Icon */}
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-neon-purple/20 border border-neon-purple/50 hover:bg-neon-purple/30 hover:border-neon-purple transition-all cursor-pointer">
          <Plus className="w-3 h-3 text-neon-purple" />
        </div>
      </button>
    </div>
  )
}
