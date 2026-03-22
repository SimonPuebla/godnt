'use client'

import { UserMessage } from '@/lib/types'
import { formatPrice } from '@/lib/pricing'

interface RecentActivityProps {
  userMessages: UserMessage[]
}

export default function RecentActivity({ userMessages }: RecentActivityProps) {
  const recent = userMessages.slice(0, 3)
  if (recent.length === 0) return null

  return (
    <section className="activity-section">
      <div className="section-header">
        <h2 className="section-title">Recent</h2>
      </div>
      <div className="activity-list">
        {recent.map((msg) => (
          <div key={msg.id} className={`activity-item ${msg.side}`}>
            <span className={`activity-side ${msg.side}`}>
              → {msg.side === 'believer' ? 'SERAPH' : 'LOGOS'}
            </span>
            <span className="activity-user">{msg.userName}</span>
            {msg.isTreasury ? (
              <span className="activity-treasury">+{formatPrice(msg.amount)} treasury</span>
            ) : (
              <span className="activity-text">
                &ldquo;{msg.content.slice(0, 90)}{msg.content.length > 90 ? '…' : ''}&rdquo;
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
