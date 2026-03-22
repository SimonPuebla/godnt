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
      <p className="arena-hint">Click a side to back them</p>
    </section>
  )
}
