'use client'

import { Argument } from '@/lib/types'

interface ArgumentBubbleProps {
  argument: Argument
  agentName: string
}

export default function ArgumentBubble({ argument, agentName }: ArgumentBubbleProps) {
  const isBeliver = argument.side === 'believer'

  return (
    <div className={`argument-bubble ${argument.side}`}>
      <div className="bubble-header">
        <span className={`bubble-agent-name ${argument.side}`}>{agentName}</span>
        <span className="bubble-round">Round {argument.roundNumber}</span>
      </div>
      <p className="bubble-text">{argument.content}</p>
      <div className="bubble-footer">
        <span className="bubble-time">{formatRelativeTime(argument.timestamp)}</span>
      </div>
    </div>
  )
}

function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  return `${hrs}h ago`
}
