"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, MicOff, Send, PhoneOff } from "lucide-react"
import { ParticipantTiles } from "@/components/participant-tiles"
import { DiscussionTranscript } from "@/components/discussion-transcript"
import { Timer } from "@/components/timer"
import { cn } from "@/lib/utils"

interface GDRoomProps {
  sessionId: string
  onEndGD: (evaluation: any) => void
}

interface Message {
  participant: string
  message: string
  timestamp: string
}

interface Participant {
  id: string
  name: string
  is_human: boolean
}

export function GDRoom({ sessionId, onEndGD }: GDRoomProps) {
  const [started, setStarted] = useState(false)
  const [topic, setTopic] = useState<string>("")
  const [participants, setParticipants] = useState<Participant[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [injectedAt5Min, setInjectedAt5Min] = useState(false)

  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (started) {
      const timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [started])

  // Auto-inject candidates at 5 minutes
  useEffect(() => {
    if (elapsedSeconds >= 300 && !injectedAt5Min && started) {
      injectCandidates()
      setInjectedAt5Min(true)
    }
  }, [elapsedSeconds, injectedAt5Min, started])

  useEffect(() => {
    startGD()
  }, [])

  const startGD = async () => {
    try {
      const response = await fetch(`/api/session/start?session_id=${sessionId}`, {
        method: "POST",
      })
      const data = await response.json()

      setTopic(data.topic)
      setStarted(true)
      setStartTime(new Date())

      setMessages([
        {
          participant: "Admin",
          message: data.admin_message,
          timestamp: new Date().toISOString(),
        },
      ])

      fetchSessionStatus()
    } catch (error) {
      console.error("[v0] Failed to start GD:", error)
    }
  }

  const fetchSessionStatus = async () => {
    try {
      const response = await fetch(`/api/session/status?session_id=${sessionId}`)
      const data = await response.json()
      setParticipants(data.participants)
    } catch (error) {
      console.error("[v0] Failed to fetch status:", error)
    }
  }

  const injectCandidates = async () => {
    try {
      const response = await fetch(`/api/session/inject-candidates?session_id=${sessionId}`)
      const data = await response.json()
      setParticipants(data.participants)

      setMessages((prev) => [
        ...prev,
        {
          participant: "System",
          message: "New candidates have joined the discussion.",
          timestamp: new Date().toISOString(),
        },
      ])
    } catch (error) {
      console.error("[v0] Failed to inject candidates:", error)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const timestamp = new Date().toISOString()
    const newMessage = {
      participant: "YOU",
      message: inputMessage,
      timestamp,
    }

    setMessages((prev) => [...prev, newMessage])
    setInputMessage("")

    try {
      const response = await fetch("/api/message/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          participant: "YOU",
          message: inputMessage,
          timestamp,
        }),
      })

      const data = await response.json()

      if (data.ai_responses) {
        data.ai_responses.forEach((resp: any) => {
          setMessages((prev) => [...prev, resp])
        })
      }
    } catch (error) {
      console.error("[v0] Failed to send message:", error)
    }
  }

  const toggleVoice = () => {
    if (!isVoiceMode) {
      startVoiceRecognition()
    } else {
      stopVoiceRecognition()
    }
    setIsVoiceMode(!isVoiceMode)
  }

  const startVoiceRecognition = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join("")

        setInputMessage(transcript)
      }

      recognitionRef.current.start()
      setIsRecording(true)
    } else {
      alert("Speech recognition not supported in this browser")
    }
  }

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }
  }

  const endGD = async () => {
    try {
      const response = await fetch(`/api/session/end?session_id=${sessionId}`, {
        method: "POST",
      })
      const data = await response.json()
      onEndGD(data)
    } catch (error) {
      console.error("[v0] Failed to end GD:", error)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-main)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[var(--green-primary)] text-white">
        <div>
          <h1 className="text-xl font-semibold">AI Group Discussion</h1>
          <p className="text-sm text-[var(--green-light)]">{topic || "Loading topic..."}</p>
        </div>
        <div className="flex items-center gap-4">
          <Timer elapsedSeconds={elapsedSeconds} />
          <Button onClick={endGD} variant="destructive" size="sm" className="gap-2">
            <PhoneOff className="w-4 h-4" />
            End GD
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Participant Tiles */}
        <div className="w-80 border-r border-[var(--green-light)] p-4 overflow-y-auto bg-[var(--bg-card)]">
          <ParticipantTiles participants={participants} />
        </div>

        {/* Center: Discussion Transcript */}
        <div className="flex-1 flex flex-col">
          <DiscussionTranscript messages={messages} />

          {/* Input Area */}
          <div className="p-4 border-t border-[var(--green-light)] bg-white">
            <div className="flex gap-2">
              <Button
                onClick={toggleVoice}
                variant={isRecording ? "destructive" : "outline"}
                size="icon"
                className={cn("shrink-0", isRecording && "bg-red-500 hover:bg-red-600")}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type your response... (or use voice)"
                className="flex-1 border-[var(--green-soft)]"
              />
              <Button onClick={sendMessage} className="gap-2 bg-[var(--green-primary)] hover:bg-[var(--green-dark)]">
                <Send className="w-4 h-4" />
                Send
              </Button>
            </div>
            {isRecording && <p className="text-xs text-[var(--green-muted)] mt-2">Recording... Speak now</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
