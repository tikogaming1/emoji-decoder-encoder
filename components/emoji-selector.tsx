"use client"

interface EmojiSelectorProps {
  onEmojiSelect: (emoji: string) => void
  disabled?: boolean
  selectedEmoji: string
  emojiList: string[]
}

export function EmojiSelector({
  onEmojiSelect,
  disabled = false,
  selectedEmoji,
  emojiList,
}: EmojiSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {emojiList.map((emoji) => {
        const isSelected = emoji === selectedEmoji
        return (
          <button
            type="button"
            key={emoji}
            onClick={() => onEmojiSelect(emoji)}
            disabled={disabled}
            className={`w-9 h-9 flex items-center justify-center text-lg transition-all font-mono border rounded-none ${
              isSelected
                ? "bg-[#00ff41] text-black border-[#00ff41] shadow-[0_0_10px_rgba(0,255,65,0.55),inset_0_0_6px_rgba(0,0,0,0.2)] scale-105"
                : "bg-[#001208] hover:bg-[#00260c] text-[#a7ffb0] border-[#00ff41]/20 hover:border-[#00ff41]/40 hover:shadow-[0_0_8px_rgba(0,255,65,0.18)] hover:text-[#00ff41]"
            } disabled:opacity-40 disabled:cursor-not-allowed`}
            aria-pressed={isSelected}
            aria-label={`Carrier ${emoji}`}
          >
            {emoji}
          </button>
        )
      })}
    </div>
  )
}
