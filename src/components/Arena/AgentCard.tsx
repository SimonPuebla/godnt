'use client'

import { Agent, Side } from '@/lib/types'
import PixelCharacter from './PixelCharacter'

interface AgentCardProps {
  agent: Agent
  isSelected: boolean
  isLeader: boolean
  onSelect: (side: Side) => void
}

export default function AgentCard({ agent, isSelected, isLeader, onSelect }: AgentCardProps) {
  return (
    <div
      className={`agent-card ${agent.id} ${isSelected ? 'selected' : ''} ${isLeader ? 'leader' : ''}`}
      onClick={() => onSelect(agent.id)}
    >
      {isLeader && <span className="leader-badge">LEADING</span>}
      <span className={`agent-name ${agent.id}`}>{agent.name}</span>
      <p className="agent-title">{agent.title}</p>
      <div className="character-area">
        <PixelCharacter side={agent.id} isSelected={isSelected} />
      </div>
    </div>
  )
}
