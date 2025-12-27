"use client"

import { Clock } from "lucide-react"

interface TimerProps {
  elapsedSeconds: number
}

export function Timer({ elapsedSeconds }: TimerProps) {
  const minutes = Math.floor(elapsedSeconds / 60)
  const seconds = elapsedSeconds % 60

  const isNearEnd = minutes >= 8

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg">
      <Clock className="w-4 h-4" />
      <span className={`font-mono text-sm font-semibold ${isNearEnd ? "text-red-400" : ""}`}>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
    </div>
  )
}
