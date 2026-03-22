'use client'

import { Agent, DebateConclusion } from '@/lib/types'

interface ScoreboardProps {
  believer: Agent
  skeptic: Agent
  conclusion: DebateConclusion
}

export default function Scoreboard({ believer, skeptic, conclusion }: ScoreboardProps) {
  const totalSupporters = believer.supporterCount + skeptic.supporterCount
  const believerPct = Math.round((believer.supporterCount / totalSupporters) * 100)
  const skepticPct = 100 - believerPct

  return (
    <section className="scoreboard-section">
      <div className="section-header">
        <h2 className="section-title">Scoreboard</h2>
      </div>

      {/* Main score bar */}
      <div className="score-bar-wrapper">
        <div className="score-bar">
          <div
            className="score-fill believer"
            style={{ width: `${believerPct}%` }}
          >
            <span className="score-fill-label">{believerPct}%</span>
          </div>
          <div
            className="score-fill skeptic"
            style={{ width: `${skepticPct}%` }}
          >
            <span className="score-fill-label">{skepticPct}%</span>
          </div>
        </div>
        <div className="score-bar-labels">
          <span className="sbl believer">SERAPH — Believer</span>
          <span className="sbl skeptic">LOGOS — Skeptic</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="stats-grid">
        <StatCard
          label="Total backers"
          believerValue={believer.supporterCount.toLocaleString()}
          skepticValue={skeptic.supporterCount.toLocaleString()}
          leader={conclusion.publicSupportLeader}
        />
        <StatCard
          label="Treasury"
          believerValue={`$${believer.treasuryBalance.toLocaleString()}`}
          skepticValue={`$${skeptic.treasuryBalance.toLocaleString()}`}
          leader={believer.treasuryBalance > skeptic.treasuryBalance ? 'believer' : 'skeptic'}
        />
        <StatCard
          label="Arguments made"
          believerValue={String(believer.argumentCount)}
          skepticValue={String(skeptic.argumentCount)}
          leader="tied"
        />
        <StatCard
          label="Logic score"
          believerValue={`${conclusion.logicScore.believer}%`}
          skepticValue={`${conclusion.logicScore.skeptic}%`}
          leader={
            conclusion.logicScore.believer > conclusion.logicScore.skeptic ? 'believer' : 'skeptic'
          }
        />
        <StatCard
          label="Momentum"
          believerValue={`${believer.momentumScore}%`}
          skepticValue={`${skeptic.momentumScore}%`}
          leader={believer.momentumScore > skeptic.momentumScore ? 'believer' : 'skeptic'}
        />
        <div className="stat-card overall">
          <div className="stat-card-label">Overall standing</div>
          <div className={`stat-card-verdict ${conclusion.leader}`}>
            {conclusion.leader === 'tied'
              ? 'TIED'
              : conclusion.leader === 'believer'
              ? 'SERAPH LEADS'
              : 'LOGOS LEADS'}
          </div>
          <p className="stat-card-note">{conclusion.status}</p>
        </div>
      </div>
    </section>
  )
}

interface StatCardProps {
  label: string
  believerValue: string
  skepticValue: string
  leader: 'believer' | 'skeptic' | 'tied'
}

function StatCard({ label, believerValue, skepticValue, leader }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-values">
        <div className={`stat-card-val believer ${leader === 'believer' ? 'winning' : ''}`}>
          <span className="scv-side">SERAPH</span>
          <span className="scv-num">{believerValue}</span>
          {leader === 'believer' && <span className="scv-crown">▲</span>}
        </div>
        <div className={`stat-card-val skeptic ${leader === 'skeptic' ? 'winning' : ''}`}>
          <span className="scv-side">LOGOS</span>
          <span className="scv-num">{skepticValue}</span>
          {leader === 'skeptic' && <span className="scv-crown">▲</span>}
        </div>
      </div>
    </div>
  )
}
