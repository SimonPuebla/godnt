'use client'

import { useState } from 'react'
import { DebateRound } from '@/lib/types'

interface DebateHistoryProps {
  rounds: DebateRound[]
}

export default function DebateHistory({ rounds }: DebateHistoryProps) {
  const [expanded, setExpanded] = useState<number | null>(null)

  // Skip the current round — it's shown in LiveExchange
  const previousRounds = rounds.slice(1)

  if (previousRounds.length === 0) return null

  return (
    <section className="history-section">
      <div className="section-header">
        <h2 className="section-title">Previous rounds</h2>
        <span className="history-count">{previousRounds.length} rounds</span>
      </div>

      <div className="history-list">
        {previousRounds.map((round) => (
          <div key={round.roundNumber} className="round-card">
            <button
              className="round-header"
              onClick={() => setExpanded(expanded === round.roundNumber ? null : round.roundNumber)}
            >
              <div className="round-header-left">
                <span className="round-number">Round {round.roundNumber}</span>
                <span className="round-date">{formatDate(round.timestamp)}</span>
              </div>
              <div className="round-header-right">
                <span className={`round-verdict ${round.conclusion.leader}`}>
                  {round.conclusion.leader === 'tied'
                    ? 'Tied'
                    : round.conclusion.leader === 'believer'
                    ? 'SERAPH edge'
                    : 'LOGOS edge'}
                </span>
                <span className="round-toggle">{expanded === round.roundNumber ? '−' : '+'}</span>
              </div>
            </button>

            {expanded === round.roundNumber && (
              <div className="round-body">
                <div className="round-argument believer">
                  <span className="round-arg-agent believer">SERAPH</span>
                  <p className="round-arg-text">{round.believerArgument.content}</p>
                </div>
                <div className="round-separator">↕</div>
                <div className="round-argument skeptic">
                  <span className="round-arg-agent skeptic">LOGOS</span>
                  <p className="round-arg-text">{round.skepticArgument.content}</p>
                </div>
                <p className="round-conclusion-note">{round.conclusion.status}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function formatDate(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  return `${Math.floor(mins / 60)}h ago`
}
