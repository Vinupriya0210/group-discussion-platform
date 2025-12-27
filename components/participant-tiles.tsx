"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface Participant {
  id: string
  name: string
  is_human: boolean
}

interface ParticipantTilesProps {
  participants: Participant[]
}

export function ParticipantTiles({ participants }: ParticipantTilesProps) {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-[var(--green-primary)] mb-4">Participants ({participants.length})</h2>
      {participants.map((participant) => (
        <div
          key={participant.id}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg transition-colors",
            participant.is_human
              ? "bg-[var(--green-primary)] text-white"
              : "bg-white border border-[var(--green-light)] hover:border-[var(--green-soft)]",
          )}
        >
          <Avatar className="w-10 h-10">
            <AvatarFallback
              className={cn(
                participant.is_human
                  ? "bg-[var(--green-dark)] text-white"
                  : "bg-[var(--green-light)] text-[var(--green-primary)]",
              )}
            >
              {participant.name === "YOU" ? "Y" : participant.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p
              className={cn("font-medium text-sm", participant.is_human ? "text-white" : "text-[var(--green-primary)]")}
            >
              {participant.name}
            </p>
            <p
              className={cn(
                "text-xs",
                participant.is_human ? "text-[var(--green-light)]" : "text-[var(--green-muted)]",
              )}
            >
              {participant.is_human ? "You" : "Participant"}
            </p>
          </div>
          <div
            className={cn("w-2 h-2 rounded-full", participant.is_human ? "bg-green-400" : "bg-[var(--green-soft)]")}
          />
        </div>
      ))}
    </div>
  )
}
