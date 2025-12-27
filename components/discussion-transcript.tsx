"use client"

import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

interface Message {
  participant: string
  message: string
  timestamp: string
}

interface DiscussionTranscriptProps {
  messages: Message[]
}

export function DiscussionTranscript({ messages }: DiscussionTranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  const getMessageStyle = (participant: string) => {
    if (participant === "YOU") {
      return {
        bg: "bg-[var(--green-primary)]",
        text: "text-white",
        name: "text-[var(--green-light)]",
      }
    } else if (participant === "Admin") {
      return {
        bg: "bg-blue-50",
        text: "text-blue-900",
        name: "text-blue-600",
      }
    } else if (participant === "System") {
      return {
        bg: "bg-yellow-50",
        text: "text-yellow-900",
        name: "text-yellow-600",
      }
    } else {
      return {
        bg: "bg-white border border-[var(--green-light)]",
        text: "text-[var(--green-primary)]",
        name: "text-[var(--green-muted)]",
      }
    }
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-[var(--bg-main)]">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-[var(--green-muted)]">
          <p>Waiting for discussion to begin...</p>
        </div>
      ) : (
        messages.map((msg, idx) => {
          const style = getMessageStyle(msg.participant)
          return (
            <div key={idx} className={cn("p-4 rounded-lg shadow-sm", style.bg)}>
              <div className="flex items-center justify-between mb-2">
                <span className={cn("font-semibold text-sm", style.name)}>{msg.participant}</span>
                <span className="text-xs opacity-70">{formatTime(msg.timestamp)}</span>
              </div>
              <p className={cn("text-sm leading-relaxed", style.text)}>{msg.message}</p>
            </div>
          )
        })
      )}
    </div>
  )
}
