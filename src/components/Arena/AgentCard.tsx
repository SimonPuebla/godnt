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
  const isBeliver = agent.id === 'believer'

  return (
    <div
      className={`agent-card ${agent.id} ${isSelected ? 'selected' : ''} ${isLeader ? 'leader' : ''}`}
      onClick={() => onSelect(agent.id)}
    >
      {/* Agent header */}
      <div className={`agent-header ${isBeliver ? 'text-right md:text-left' : 'text-left md:text-right'}`}>
        {isLeader && <span className="leader-badge">LEADING</span>}
        <h2 className="agent-name">{agent.name}</h2>
        <p className="agent-title">{agent.title}</p>
      </div>

      {/* Character with hover tooltip */}
      <div className="character-area group relative">
        <PixelCharacter side={agent.id} isSelected={isSelected} />
        <div className={`character-tooltip ${isBeliver ? 'tooltip-right' : 'tooltip-left'}`}>
          <p>{agent.description}</p>
        </div>
      </div>

      {/* Current thesis */}
      <div className="thesis-box">
        <span className="thesis-label">Current thesis</span>
        <p className="thesis-text">&ldquo;{agent.currentThesis}&rdquo;</p>
      </div>

      {/* Momentum bar */}
      <div className="momentum-area">
        <div className="momentum-label-row">
          <span className="momentum-label">Momentum</span>
          <span className="momentum-value">{agent.momentumScore}%</span>
        </div>
        <div className="momentum-track">
          <div
            className={`momentum-fill ${agent.id}`}
            style={{ width: `${agent.momentumScore}%` }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="agent-stats">
        <div className="stat-item">
          <span className="stat-number">{agent.supporterCount.toLocaleString()}</span>
          <span className="stat-label">backers</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-number">${agent.treasuryBalance.toLocaleString()}</span>
          <span className="stat-label">treasury</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-number">{agent.argumentCount}</span>
          <span className="stat-label">arguments</span>
        </div>
      </div>
    </div>
  )
}
