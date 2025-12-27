import { type NextRequest, NextResponse } from "next/server"
import { sessions } from "@/lib/gd-engine"
import { generateTopic } from "@/lib/ai-service"

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId || !sessions.has(sessionId)) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const engine = sessions.get(sessionId)!

    // Generate topic using AI
    const topicData = await generateTopic()

    engine.start(topicData.topic, topicData.message)

    return NextResponse.json({
      status: "started",
      topic: topicData.topic,
      admin_message: topicData.message,
      start_time: engine.startTime?.toISOString(),
    })
  } catch (error) {
    console.error("[v0] Start session error:", error)
    return NextResponse.json({ error: "Failed to start session" }, { status: 500 })
  }
}
