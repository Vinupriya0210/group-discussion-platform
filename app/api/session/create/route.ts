import { type NextRequest, NextResponse } from "next/server"
import { GDEngine, sessions } from "@/lib/gd-engine"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sessionId = body.session_id || crypto.randomUUID()

    if (sessions.has(sessionId)) {
      return NextResponse.json({ error: "Session already exists" }, { status: 400 })
    }

    const engine = new GDEngine(sessionId)
    sessions.set(sessionId, engine)

    // Add human participant "YOU"
    engine.addParticipant("YOU", true)

    // Add initial AI candidates (4 more to make 5 total)
    for (let i = 0; i < 4; i++) {
      engine.addAICandidate()
    }

    return NextResponse.json({
      session_id: sessionId,
      status: "initialized",
      topic: null,
      start_time: null,
      participants: engine.getParticipants(),
    })
  } catch (error) {
    console.error("[v0] Create session error:", error)
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 })
  }
}
