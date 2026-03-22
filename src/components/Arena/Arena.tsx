'use client'

import { Agent, Side, DebateConclusion } from '@/lib/types'
import AgentCard from './AgentCard'
import CenterLine from './CenterLine'

interface ArenaProps {
  believer: Agent
  skeptic: Agent
  conclusion: DebateConclusion
  selectedSide: Side | null
  onSelectSide: (side: Side) => void
}

export default function Arena({ believer, skeptic, conclusion, selectedSide, onSelectSide }: ArenaProps) {
  const totalSupporters = believer.supporterCount + skeptic.supporterCount
  const bPct = Math.round((believer.supporterCount / totalSupporters) * 100)
  const sPct = 100 - bPct

  return (
    <section className="arena-section">
      <div className="arena-grid">
        <AgentCard
          agent={believer}
          isSelected={selectedSide === 'believer'}
          isLeader={conclusion.leader === 'believer'}
          onSelect={onSelectSide}
        />
        <CenterLine />
        <AgentCard
          agent={skeptic}
          isSelected={selectedSide === 'skeptic'}
          isLeader={conclusion.leader === 'skeptic'}
          onSelect={onSelectSide}
        />
      </div>

      {/* Minimal support strip */}
      <div className="support-strip">
        <span className="strip-label believer">SERAPH {bPct}%</span>
        <div className="strip-bar">
          <div className="strip-fill" style={{ width: `${bPct}%` }} />
        </div>
        <span className="strip-label skeptic">LOGOS {sPct}%</span>
      </div>

      <p className="arena-hint">Click a side to back them</p>
    </section>
  )
}
