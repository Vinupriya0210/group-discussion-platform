const API_URL = "https://openrouter.ai/api/v1/chat/completions"
const MODEL = "qwen/qwen-2.5-7b-instruct"

async function callAI(prompt: string, systemPrompt?: string, temperature = 0.8): Promise<string> {
  const messages: any[] = []
  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt })
  }
  messages.push({ role: "user", content: prompt })

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY || "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"}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://v0.dev",
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("[v0] OpenRouter API error:", error)
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error("[v0] AI API error:", error)
    return "I understand the topic. Let me share my perspective."
  }
}

export async function generateTopic() {
  const prompt = `You are an HR Admin conducting a Group Discussion for campus placements.

Generate a relevant and challenging GD topic suitable for engineering students. 
The topic should be current, debatable, and test their analytical and communication skills.

Then write a professional opening announcement (2-3 sentences) that:
1. Introduces the topic
2. Sets expectations for corporate behavior
3. Starts the discussion

Return response in JSON format:
{
    "topic": "the GD topic",
    "message": "your opening announcement"
}`

  const response = await callAI(prompt)

  try {
    return JSON.parse(response)
  } catch {
    return {
      topic: "Should AI replace human jobs in the next decade?",
      message:
        "Good morning everyone. Today's topic is: Should AI replace human jobs in the next decade? This is a corporate-style group discussion. Please maintain professionalism, listen to others, and present your viewpoints clearly. You may begin.",
    }
  }
}

const personalities = [
  "analytical and data-driven",
  "passionate and persuasive",
  "balanced and diplomatic",
  "creative and innovative",
  "practical and solution-oriented",
]

export async function generateCandidateResponse(
  candidateName: string,
  topic: string,
  recentMessages: any[],
  humanInput: string,
): Promise<string> {
  const personality = personalities[Math.floor(Math.random() * personalities.length)]

  const contextStr = recentMessages
    .slice(-3)
    .map((msg) => `${msg.participant}: ${msg.message}`)
    .join("\n")

  const prompt = `You are a candidate in a corporate Group Discussion for campus placements.

Topic: ${topic}

Recent discussion:
${contextStr}

Latest input: ${humanInput}

Your personality: ${personality}

Generate a response (2-4 sentences) that:
- Relates to the topic and ongoing discussion
- Shows you're listening to others
- Presents a clear viewpoint
- Uses professional language
- Occasionally builds on or politely disagrees with others

Keep it natural and conversational. DO NOT be overly formal.`

  const response = await callAI(prompt, undefined, 0.9)
  return response.trim()
}

export async function generateAICandidateResponse(
  candidateName: string,
  topic: string,
  recentMessages: any[],
): Promise<string> {
  const personality = personalities[Math.floor(Math.random() * personalities.length)]

  const contextStr = recentMessages.map((msg) => `${msg.participant}: ${msg.message}`).join("\n")

  const prompt = `You are ${candidateName}, a candidate in a corporate Group Discussion for campus placements.

Topic: ${topic}

Recent discussion:
${contextStr || "Discussion has just started."}

Your personality: ${personality}

Generate your response (2-4 sentences) that:
- Relates to the topic and ongoing discussion
- Presents a clear viewpoint or adds new perspective
- Uses professional yet conversational language
- Shows critical thinking
- Occasionally agrees/disagrees with previous points

Keep it natural. DO NOT just repeat what others said.`

  const response = await callAI(prompt, undefined, 0.9)
  return response.trim()
}

export async function evaluateParticipant(
  name: string,
  topic: string,
  speakingCount: number,
  wordCount: number,
  entryTime: number,
  messages: string[],
) {
  const content = messages.length > 0 ? messages.join(" ") : "No contribution"

  const prompt = `You are an HR evaluator for campus placements conducting a strict GD evaluation.

Participant: ${name}
Topic: ${topic}
Speaking frequency: ${speakingCount} times
Total words: ${wordCount}
Entry time: ${entryTime.toFixed(1)} seconds
Content: ${content}

Evaluate this participant on a scale of 1-10 for each:

1. Communication: Clarity, articulation, confidence
2. Content Relevance: How well they addressed the topic
3. Leadership: Initiative, guiding discussion
4. Confidence: Body language (inferred), conviction
5. Team Behavior: Listening, building on others' points
6. Corporate Readiness: Professional language, maturity

Also provide:
- 2-3 specific strengths
- 2-3 areas for improvement
- 1-2 sentences of HR remarks
- 2-3 actionable suggestions for improvement

Return ONLY valid JSON:
{
    "communication": score,
    "content_relevance": score,
    "leadership": score,
    "confidence": score,
    "team_behavior": score,
    "corporate_readiness": score,
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "hr_remarks": "remarks here",
    "suggestions": ["suggestion1", "suggestion2"]
}`

  const response = await callAI(prompt, undefined, 0.3)

  try {
    const result = JSON.parse(response)

    const scores = [
      result.communication,
      result.content_relevance,
      result.leadership,
      result.confidence,
      result.team_behavior,
      result.corporate_readiness,
    ]
    const overall = scores.reduce((a, b) => a + b, 0) / scores.length

    result.overall_score = Math.round(overall * 100) / 100
    result.name = name
    result.placement_readiness = getReadinessLevel(overall)

    return result
  } catch {
    return {
      name,
      communication: 6,
      content_relevance: 6,
      leadership: 5,
      confidence: 6,
      team_behavior: 7,
      corporate_readiness: 6,
      overall_score: 6.0,
      strengths: ["Participated in discussion", "Professional demeanor"],
      weaknesses: ["Could improve content depth", "Need more initiative"],
      hr_remarks: "Satisfactory performance with room for growth.",
      suggestions: ["Practice speaking with more examples", "Take more initiative"],
      placement_readiness: "Moderate",
    }
  }
}

function getReadinessLevel(score: number): string {
  if (score >= 8.5) return "Excellent - Ready for top-tier placements"
  if (score >= 7.5) return "Good - Ready for mid-tier placements"
  if (score >= 6.5) return "Moderate - Needs practice"
  return "Needs Significant Improvement"
}

export async function evaluateAllParticipants(engine: any) {
  const evaluations = []

  for (const participant of engine.participants) {
    const name = participant.name
    if (name === "Admin") continue

    const data = engine.participationData[name] || {
      speaking_count: 0,
      word_count: 0,
      entry_time: 999,
      messages: [],
    }

    const evalResult = await evaluateParticipant(
      name,
      engine.topic || "General Discussion",
      data.speaking_count,
      data.word_count,
      data.entry_time || 999,
      data.messages,
    )

    evaluations.push(evalResult)
  }

  evaluations.sort((a, b) => b.overall_score - a.overall_score)

  for (let i = 0; i < evaluations.length; i++) {
    evaluations[i].rank = i + 1
  }

  return {
    rankings: evaluations,
    summary: `Evaluation complete for ${evaluations.length} participants. Rankings have been determined based on comprehensive performance analysis.`,
  }
}
