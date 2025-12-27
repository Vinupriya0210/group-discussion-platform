import { type NextRequest, NextResponse } from "next/server"
import { sessions } from "@/lib/gd-engine"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId || !sessions.has(sessionId)) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const engine = sessions.get(sessionId)!

    // Check if 5 minutes elapsed
    if (engine.getElapsedTime() >= 300) {
      const humanCount = engine.getHumanCount()

      if (humanCount === 1) {
        engine.addAICandidate()
        engine.addAICandidate()
      } else if (humanCount === 2) {
        engine.addAICandidate()
      }
    }

    return NextResponse.json({
      status: "success",
      participants: engine.getParticipants(),
    })
  } catch (error) {
    console.error("[v0] Inject candidates error:", error)
    return NextResponse.json({ error: "Failed to inject candidates" }, { status: 500 })
  }
}
