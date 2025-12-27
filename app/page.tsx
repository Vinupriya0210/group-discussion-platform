"use client"

import { useEffect, useState } from "react"
import { GDRoom } from "@/components/gd-room"
import { EvaluationResults } from "@/components/evaluation-results"

export default function Home() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [evaluationData, setEvaluationData] = useState<any>(null)

  useEffect(() => {
    initializeSession()
  }, [])

  const initializeSession = async () => {
    try {
      const response = await fetch("/api/session/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      const data = await response.json()
      setSessionId(data.session_id)
    } catch (error) {
      console.error("[v0] Failed to create session:", error)
    }
  }

  const handleEndGD = async (evaluation: any) => {
    setEvaluationData(evaluation)
    setShowResults(true)
  }

  if (showResults && evaluationData) {
    return <EvaluationResults data={evaluationData} />
  }

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-main)]">
        <div className="text-[var(--green-primary)] text-lg">Initializing GD Room...</div>
      </div>
    )
  }

  return <GDRoom sessionId={sessionId} onEndGD={handleEndGD} />
}
