import { type NextRequest, NextResponse } from "next/server"
import { sessions } from "@/lib/gd-engine"
import { generateCandidateResponse } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, participant, message, timestamp } = body

    if (!session_id || !sessions.has(session_id)) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const engine = sessions.get(session_id)!

    // Track human message
    engine.addMessage(participant, message, timestamp)
    engine.trackParticipation(participant, message)

    // Generate AI responses
    const aiResponses = []
    const numResponses = Math.floor(Math.random() * 2) + 1 // 1-2 responses
    const candidates = engine.participants.filter((p) => !p.is_human && p.name !== "Admin")

    // Randomly select candidates to respond
    const respondingCandidates = candidates.sort(() => 0.5 - Math.random()).slice(0, numResponses)

    for (const candidate of respondingCandidates) {
      const response = await generateCandidateResponse(candidate.name, engine.topic || "", engine.messages, message)

      const ts = new Date().toISOString()
      engine.addMessage(candidate.name, response, ts)
      engine.trackParticipation(candidate.name, response)

      aiResponses.push({
        participant: candidate.name,
        message: response,
        timestamp: ts,
      })
    }

    return NextResponse.json({
      status: "success",
      ai_responses: aiResponses,
      elapsed_time: engine.getElapsedTime(),
    })
  } catch (error) {
    console.error("[v0] Send message error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
