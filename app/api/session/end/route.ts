import { type NextRequest, NextResponse } from "next/server"
import { sessions } from "@/lib/gd-engine"
import { evaluateAllParticipants } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId || !sessions.has(sessionId)) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const engine = sessions.get(sessionId)!
    engine.status = "completed"

    const closingMessage =
      "Thank you everyone for your participation. The discussion is now concluded. Please wait while we prepare your evaluation reports."
    engine.addMessage("Admin", closingMessage, new Date().toISOString())

    // Generate evaluation
    const evaluation = await evaluateAllParticipants(engine)

    return NextResponse.json({
      status: "completed",
      admin_closing: closingMessage,
      evaluation,
    })
  } catch (error) {
    console.error("[v0] End session error:", error)
    return NextResponse.json({ error: "Failed to end session" }, { status: 500 })
  }
}
