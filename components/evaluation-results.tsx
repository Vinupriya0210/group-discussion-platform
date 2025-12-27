"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Trophy, TrendingUp, Award } from "lucide-react"

interface EvaluationResultsProps {
  data: any
}

export function EvaluationResults({ data }: EvaluationResultsProps) {
  const evaluation = data.evaluation

  const downloadReport = () => {
    const reportText = JSON.stringify(evaluation, null, 2)
    const blob = new Blob([reportText], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "gd-evaluation-report.json"
    a.click()
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600"
    if (score >= 6) return "text-yellow-600"
    return "text-red-600"
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-100 border-yellow-400 text-yellow-900"
    if (rank === 2) return "bg-gray-100 border-gray-400 text-gray-900"
    if (rank === 3) return "bg-orange-100 border-orange-400 text-orange-900"
    return "bg-white border-[var(--green-light)] text-[var(--green-primary)]"
  }

  return (
    <div className="min-h-screen bg-[var(--bg-main)] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--green-primary)] flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              Group Discussion Evaluation Results
            </h1>
            <p className="text-[var(--green-muted)] mt-2">Comprehensive performance analysis and rankings</p>
          </div>
          <Button onClick={downloadReport} className="gap-2 bg-[var(--green-primary)] hover:bg-[var(--green-dark)]">
            <Download className="w-4 h-4" />
            Download Report
          </Button>
        </div>

        {/* Rankings Table */}
        <Card className="border-[var(--green-light)]">
          <CardHeader className="bg-[var(--bg-card)]">
            <CardTitle className="text-[var(--green-primary)] flex items-center gap-2">
              <Award className="w-5 h-5" />
              Performance Rankings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {evaluation.rankings.map((candidate: any) => (
                <div key={candidate.name} className={`p-4 rounded-lg border-2 ${getRankColor(candidate.rank)}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold">#{candidate.rank}</div>
                      <div>
                        <h3 className="font-semibold text-lg">{candidate.name}</h3>
                        <p className="text-sm opacity-75">{candidate.placement_readiness}</p>
                      </div>
                    </div>
                    <div className={`text-3xl font-bold ${getScoreColor(candidate.overall_score)}`}>
                      {candidate.overall_score}/10
                    </div>
                  </div>

                  {/* Skill Scores */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <SkillBar label="Communication" score={candidate.communication} />
                    <SkillBar label="Content" score={candidate.content_relevance} />
                    <SkillBar label="Leadership" score={candidate.leadership} />
                    <SkillBar label="Confidence" score={candidate.confidence} />
                    <SkillBar label="Team Behavior" score={candidate.team_behavior} />
                    <SkillBar label="Corporate Ready" score={candidate.corporate_readiness} />
                  </div>

                  {/* Detailed Feedback */}
                  <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-1 text-green-700">
                        <TrendingUp className="w-4 h-4" />
                        Strengths
                      </h4>
                      <ul className="text-sm space-y-1">
                        {candidate.strengths.map((strength: string, idx: number) => (
                          <li key={idx} className="flex gap-2">
                            <span className="text-green-600">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-1 text-orange-700">
                        Areas for Improvement
                      </h4>
                      <ul className="text-sm space-y-1">
                        {candidate.weaknesses.map((weakness: string, idx: number) => (
                          <li key={idx} className="flex gap-2">
                            <span className="text-orange-600">→</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* HR Remarks */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-sm text-blue-900 mb-1">HR Remarks</h4>
                    <p className="text-sm text-blue-800">{candidate.hr_remarks}</p>
                  </div>

                  {/* Suggestions */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-sm mb-2">Actionable Suggestions</h4>
                    <ul className="text-sm space-y-1">
                      {candidate.suggestions.map((suggestion: string, idx: number) => (
                        <li key={idx} className="flex gap-2">
                          <span>💡</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="border-[var(--green-light)] bg-[var(--bg-card)]">
          <CardContent className="p-6">
            <p className="text-[var(--green-primary)]">{evaluation.summary}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SkillBar({ label, score }: { label: string; score: number }) {
  const percentage = (score / 10) * 100

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium">{label}</span>
        <span className="font-semibold">{score}/10</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-[var(--green-primary)] transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}
