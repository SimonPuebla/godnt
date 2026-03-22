'use client'

import { useState } from 'react'
import { DebateRound, UserMessage } from '@/lib/types'
import { formatPrice } from '@/lib/pricing'

interface DebateHistoryProps {
  rounds: DebateRound[]
  userMessages: UserMessage[]
}

export default function DebateHistory({ rounds, userMessages }: DebateHistoryProps) {
  const [expanded, setExpanded] = useState<number | null>(rounds[0]?.roundNumber ?? null)

  return (
    <section className="history-section">
      <div className="section-header">
        <h2 className="section-title">Debate History</h2>
        <span className="history-count">{rounds.length} rounds</span>
      </div>

      <div className="history-list">
        {rounds.map((round) => (
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
                  <div className="round-arg-header">
                    <span className="round-arg-agent believer">SERAPH</span>
                  </div>
                  <p className="round-arg-text">{round.believerArgument.content}</p>
                </div>
                <div className="round-separator">↕</div>
                <div className="round-argument skeptic">
                  <div className="round-arg-header">
                    <span className="round-arg-agent skeptic">LOGOS</span>
                  </div>
                  <p className="round-arg-text">{round.skepticArgument.content}</p>
                </div>

                {/* User messages from this round */}
                {userMessages
                  .filter((m) => {
                    const mTime = m.timestamp.getTime()
                    const rTime = round.timestamp.getTime()
                    return mTime >= rTime - 30 * 60 * 1000 && mTime < rTime + 30 * 60 * 1000
                  })
                  .map((msg) => (
                    <div key={msg.id} className={`round-user-msg ${msg.side}`}>
                      <span className="rum-label">
                        {msg.isTreasury ? '💰 Treasury' : '💬 Supporter'} → {msg.side === 'believer' ? 'SERAPH' : 'LOGOS'}
                      </span>
                      <span className="rum-user">{msg.userName}</span>
                      <span className="rum-amount">{formatPrice(msg.amount)}</span>
                      {!msg.isTreasury && msg.content && (
                        <p className="rum-content">&ldquo;{msg.content}&rdquo;</p>
                      )}
                    </div>
                  ))}

                <div className="round-conclusion-note">{round.conclusion.detail}</div>
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
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ago`
}
