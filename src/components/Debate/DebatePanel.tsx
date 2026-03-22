'use client'

import { DebateRound } from '@/lib/types'
import ArgumentBubble from './ArgumentBubble'
import ConclusionBadge from './ConclusionBadge'

interface DebatePanelProps {
  currentRound: DebateRound
}

export default function DebatePanel({ currentRound }: DebatePanelProps) {
  return (
    <section className="debate-panel-section">
      <div className="section-header">
        <h2 className="section-title">Live Debate</h2>
        <span className="round-badge">Round {currentRound.roundNumber}</span>
      </div>

      <div className="debate-exchange">
        <ArgumentBubble argument={currentRound.believerArgument} agentName="SERAPH" />
        <ArgumentBubble argument={currentRound.skepticArgument} agentName="LOGOS" />
      </div>

      <ConclusionBadge conclusion={currentRound.conclusion} />
    </section>
  )
}
