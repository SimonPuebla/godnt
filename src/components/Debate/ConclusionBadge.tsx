'use client'

import { DebateConclusion } from '@/lib/types'

interface ConclusionBadgeProps {
  conclusion: DebateConclusion
}

export default function ConclusionBadge({ conclusion }: ConclusionBadgeProps) {
  return (
    <div className={`conclusion-wrapper leader-${conclusion.leader}`}>
      <div className="conclusion-label">Current conclusion</div>
      <div className="conclusion-status">{conclusion.status}</div>
      <p className="conclusion-detail">{conclusion.detail}</p>

      <div className="logic-scores">
        <div className="logic-score believer">
          <span className="logic-agent">SERAPH logic</span>
          <div className="logic-bar-track">
            <div
              className="logic-bar-fill believer"
              style={{ width: `${conclusion.logicScore.believer}%` }}
            />
          </div>
          <span className="logic-pct">{conclusion.logicScore.believer}%</span>
        </div>
        <div className="logic-score skeptic">
          <span className="logic-agent">LOGOS logic</span>
          <div className="logic-bar-track">
            <div
              className="logic-bar-fill skeptic"
              style={{ width: `${conclusion.logicScore.skeptic}%` }}
            />
          </div>
          <span className="logic-pct">{conclusion.logicScore.skeptic}%</span>
        </div>
      </div>
    </div>
  )
}
