'use client'

import { useState } from 'react'
import { Side, Agent, UserMessage } from '@/lib/types'
import { getMessagePrice, formatPrice, getPriceLadder } from '@/lib/pricing'

interface SupportSectionProps {
  believer: Agent
  skeptic: Agent
  selectedSide: Side | null
  onSelectSide: (side: Side) => void
  userMessages: UserMessage[]
  onSubmitMessage: (msg: Omit<UserMessage, 'id' | 'timestamp'>) => void
  believerMessageCount: number
  skepticMessageCount: number
}

export default function SupportSection({
  believer,
  skeptic,
  selectedSide,
  onSelectSide,
  userMessages,
  onSubmitMessage,
  believerMessageCount,
  skepticMessageCount,
}: SupportSectionProps) {
  const [text, setText] = useState('')
  const [userName, setUserName] = useState('')
  const [mode, setMode] = useState<'argument' | 'treasury'>('argument')
  const [treasuryAmount, setTreasuryAmount] = useState('10')
  const [submitted, setSubmitted] = useState(false)

  const side = selectedSide ?? 'believer'
  const msgCount = side === 'believer' ? believerMessageCount : skepticMessageCount
  const nextPrice = getMessagePrice(msgCount)
  const priceLadder = getPriceLadder(msgCount, 4)
  const agent = side === 'believer' ? believer : skeptic

  const handleSubmit = () => {
    if (mode === 'argument' && text.trim().length < 10) return
    if (!selectedSide) return

    onSubmitMessage({
      side,
      content: mode === 'argument' ? text.trim() : '',
      amount: mode === 'argument' ? nextPrice : parseFloat(treasuryAmount) || 10,
      userName: userName.trim() || 'anonymous',
      isTreasury: mode === 'treasury',
    })

    setText('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <section className="support-section">
      <div className="section-header">
        <h2 className="section-title">Back a Side</h2>
        <p className="section-sub">
          Send an argument or contribute to the treasury. Your conviction has a price.
        </p>
      </div>

      {/* Side selector */}
      <div className="side-selector">
        <button
          className={`side-btn believer ${selectedSide === 'believer' ? 'active' : ''}`}
          onClick={() => onSelectSide('believer')}
        >
          <span className="side-btn-name">SERAPH</span>
          <span className="side-btn-sub">Believer</span>
        </button>
        <span className="side-selector-vs">choose your side</span>
        <button
          className={`side-btn skeptic ${selectedSide === 'skeptic' ? 'active' : ''}`}
          onClick={() => onSelectSide('skeptic')}
        >
          <span className="side-btn-name">LOGOS</span>
          <span className="side-btn-sub">Skeptic</span>
        </button>
      </div>

      {selectedSide && (
        <div className={`support-form-area ${selectedSide}`}>
          {/* Mode toggle */}
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === 'argument' ? 'active' : ''}`}
              onClick={() => setMode('argument')}
            >
              Send an argument
            </button>
            <button
              className={`mode-btn ${mode === 'treasury' ? 'active' : ''}`}
              onClick={() => setMode('treasury')}
            >
              Support the treasury
            </button>
          </div>

          {mode === 'argument' ? (
            <>
              {/* Argument input */}
              <div className="input-group">
                <label className="input-label">Your argument for {agent.name}</label>
                <textarea
                  className="argument-textarea"
                  maxLength={500}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`Make a case for ${agent.name}. Max 500 characters. This argument may be incorporated into the next round.`}
                  rows={4}
                />
                <div className="char-count">{text.length}/500</div>
              </div>

              {/* Username */}
              <div className="input-group">
                <label className="input-label">Your name (optional)</label>
                <input
                  className="name-input"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="anonymous"
                  maxLength={32}
                />
              </div>

              {/* Price ladder */}
              <div className="price-ladder">
                <div className="price-ladder-header">Escalating price</div>
                <div className="price-rungs">
                  {priceLadder.map((rung, i) => (
                    <div key={rung.n} className={`price-rung ${i === 0 ? 'current' : ''}`}>
                      <span className="rung-n">#{rung.n}</span>
                      <span className="rung-price">{rung.price}</span>
                    </div>
                  ))}
                </div>
                <p className="price-note">
                  Each message to the same side costs 20% more than your last.
                </p>
              </div>

              <button
                className={`submit-btn ${selectedSide} ${submitted ? 'submitted' : ''}`}
                onClick={handleSubmit}
                disabled={text.trim().length < 10 || submitted}
              >
                {submitted ? '✓ Argument sent to agent' : `Submit argument — ${formatPrice(nextPrice)}`}
              </button>
            </>
          ) : (
            <>
              {/* Treasury contribution */}
              <div className="treasury-form">
                <label className="input-label">Contribute to {agent.name}&apos;s treasury</label>
                <div className="treasury-amounts">
                  {['5', '10', '25', '50', '100'].map((amt) => (
                    <button
                      key={amt}
                      className={`amount-chip ${treasuryAmount === amt ? 'active ' + selectedSide : ''}`}
                      onClick={() => setTreasuryAmount(amt)}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                <input
                  className="name-input"
                  type="number"
                  value={treasuryAmount}
                  onChange={(e) => setTreasuryAmount(e.target.value)}
                  placeholder="Custom amount"
                  min="1"
                />
                <p className="treasury-note">
                  Current treasury: <strong>${agent.treasuryBalance.toLocaleString()}</strong>. The side
                  with the larger treasury gains a debate advantage multiplier.
                </p>
              </div>

              <button
                className={`submit-btn ${selectedSide} ${submitted ? 'submitted' : ''}`}
                onClick={handleSubmit}
                disabled={submitted}
              >
                {submitted
                  ? `✓ $${treasuryAmount} sent to ${agent.name}`
                  : `Contribute $${treasuryAmount} to treasury`}
              </button>
            </>
          )}
        </div>
      )}

      {/* Recent user messages */}
      {userMessages.length > 0 && (
        <div className="user-messages-panel">
          <h3 className="user-messages-title">Recent supporter messages</h3>
          <div className="user-messages-list">
            {userMessages.slice(0, 6).map((msg) => (
              <div key={msg.id} className={`user-message ${msg.side}`}>
                <div className="user-msg-header">
                  <span className={`user-msg-side ${msg.side}`}>→ {msg.side === 'believer' ? 'SERAPH' : 'LOGOS'}</span>
                  <span className="user-msg-user">{msg.userName}</span>
                  <span className="user-msg-amount">{msg.isTreasury ? `+$${msg.amount} treasury` : formatPrice(msg.amount)}</span>
                </div>
                {!msg.isTreasury && msg.content && (
                  <p className="user-msg-content">&ldquo;{msg.content}&rdquo;</p>
                )}
                {msg.isTreasury && (
                  <p className="user-msg-treasury">Treasury contribution</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
