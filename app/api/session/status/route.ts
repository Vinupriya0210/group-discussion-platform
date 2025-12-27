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

    return NextResponse.json({
      session_id: sessionId,
      status: engine.status,
      topic: engine.topic,
      elapsed_time: engine.getElapsedTime(),
      participants: engine.getParticipants(),
      messages: engine.messages,
    })
  } catch (error) {
    console.error("[v0] Get status error:", error)
    return NextResponse.json({ error: "Failed to get status" }, { status: 500 })
  }
}
