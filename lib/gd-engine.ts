interface Participant {
  id: string
  name: string
  is_human: boolean
  join_time: string
}

interface Message {
  participant: string
  message: string
  timestamp: string
}

interface ParticipationData {
  messages: string[]
  entry_time: number | null
  speaking_count: number
  word_count: number
}

export class GDEngine {
  sessionId: string
  status: string
  topic: string | null
  startTime: Date | null
  participants: Participant[]
  messages: Message[]
  participantCount: number
  participationData: Record<string, ParticipationData>
  candidateCount: number

  constructor(sessionId: string) {
    this.sessionId = sessionId
    this.status = "initialized"
    this.topic = null
    this.startTime = null
    this.participants = []
    this.messages = []
    this.participantCount = 0
    this.participationData = {}
    this.candidateCount = 0
  }

  addParticipant(name: string, isHuman = false) {
    const participant: Participant = {
      id: `p${this.participantCount}`,
      name: name,
      is_human: isHuman,
      join_time: new Date().toISOString(),
    }
    this.participants.push(participant)
    this.participationData[name] = {
      messages: [],
      entry_time: null,
      speaking_count: 0,
      word_count: 0,
    }
    this.participantCount++
  }

  addAICandidate() {
    this.candidateCount++
    const candidateName = `Candidate ${this.candidateCount}`
    this.addParticipant(candidateName, false)
    return candidateName
  }

  getParticipants() {
    return this.participants
  }

  getHumanCount() {
    return this.participants.filter((p) => p.is_human).length
  }

  addMessage(participant: string, message: string, timestamp: string) {
    this.messages.push({ participant, message, timestamp })
  }

  trackParticipation(participant: string, message: string) {
    if (this.participationData[participant]) {
      const data = this.participationData[participant]
      data.messages.push(message)
      data.speaking_count++
      data.word_count += message.split(" ").length

      if (data.entry_time === null) {
        data.entry_time = this.getElapsedTime()
      }
    }
  }

  getElapsedTime(): number {
    if (this.startTime) {
      return (new Date().getTime() - this.startTime.getTime()) / 1000
    }
    return 0
  }

  start(topic: string, adminMessage: string) {
    this.status = "in_progress"
    this.topic = topic
    this.startTime = new Date()
    this.addMessage("Admin", adminMessage, new Date().toISOString())
  }
}

// In-memory storage for sessions
export const sessions = new Map<string, GDEngine>()

export function getGDEngine(sessionId: string): GDEngine | undefined {
  return sessions.get(sessionId)
}
