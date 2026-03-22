'use client'

import { DebateRound } from '@/lib/types'

interface DebatePanelProps {
  currentRound: DebateRound
}

function getEdgeLabel(conclusion: DebateRound['conclusion']): { text: string; side: string } {
  if (conclusion.leader === 'tied') return { text: 'Round unresolved', side: 'tied' }
  if (conclusion.leader === 'believer') return { text: 'Believer slightly ahead', side: 'believer' }
  return { text: 'Skeptic pressing harder', side: 'skeptic' }
}

export default function DebatePanel({ currentRound }: DebatePanelProps) {
  const edge = getEdgeLabel(currentRound.conclusion)

  return (
    <section className="exchange-section">
      <div className="exchange-header">
        <h2 className="section-title">Latest Exchange</h2>
        <span className="round-badge">Round {currentRound.roundNumber}</span>
        <span className={`edge-label ${edge.side}`}>{edge.text}</span>
      </div>

      <div className="exchange-grid">
        <div className="speech-card believer">
          <span className="speech-agent believer">SERAPH</span>
          <p className="speech-text">&ldquo;{currentRound.believerArgument.content}&rdquo;</p>
        </div>
        <div className="speech-card skeptic">
          <span className="speech-agent skeptic">LOGOS</span>
          <p className="speech-text">&ldquo;{currentRound.skepticArgument.content}&rdquo;</p>
        </div>
      </div>
    </section>
  )
}
