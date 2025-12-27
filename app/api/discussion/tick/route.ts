import { NextResponse } from "next/server"
import { getGDEngine } from "@/lib/gd-engine"
import { generateAICandidateResponse } from "@/lib/ai-service"

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json()
    const engine = getGDEngine(sessionId)

    if (!engine) {
      console.log("[v0] Tick: Engine not found for session:", sessionId)
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (engine.status !== "active") {
      console.log("[v0] Tick: Session not active, status:", engine.status)
      return NextResponse.json({ error: "Session not active" }, { status: 400 })
    }

    const aiCandidates = engine.participants.filter((p) => p.name !== "Admin" && p.name !== "YOU" && p.isAI)

    console.log("[v0] Tick: Total participants:", engine.participants.length)
    console.log(
      "[v0] Tick: AI candidates:",
      aiCandidates.map((p) => p.name),
    )

    if (aiCandidates.length === 0) {
      console.log("[v0] Tick: No AI candidates available")
      return NextResponse.json({ error: "No AI candidates" }, { status: 400 })
    }

    // Select random AI candidate
    const randomCandidate = aiCandidates[Math.floor(Math.random() * aiCandidates.length)]
    console.log("[v0] Tick: Selected candidate:", randomCandidate.name)

    // Get recent context
    const recentMessages = engine.messages.slice(-5)

    // Generate AI response
    const response = await generateAICandidateResponse(
      randomCandidate.name,
      engine.topic || "General Discussion",
      recentMessages,
    )

    console.log("[v0] Tick: Generated response:", response.substring(0, 50) + "...")

    // Add message to engine
    const timestamp = Date.now()
    engine.messages.push({
      participant: randomCandidate.name,
      message: response,
      timestamp,
      isAI: true,
    })

    // Update participation data
    if (!engine.participationData[randomCandidate.name]) {
      engine.participationData[randomCandidate.name] = {
        speaking_count: 0,
        word_count: 0,
        entry_time: (timestamp - engine.startTime!) / 1000,
        messages: [],
      }
    }

    const data = engine.participationData[randomCandidate.name]
    data.speaking_count++
    data.word_count += response.split(" ").length
    data.messages.push(response)

    return NextResponse.json({
      success: true,
      message: {
        participant: randomCandidate.name,
        message: response,
        timestamp,
        isAI: true,
      },
    })
  } catch (error) {
    console.error("[v0] Tick error:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
