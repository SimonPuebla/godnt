'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Side, Agent, UserMessage } from '@/lib/types'
import { getMessagePrice, formatPrice, getPriceLadder } from '@/lib/pricing'
import WalletButton from '@/components/Wallet/WalletButton'
import CryptoPayment from '@/components/Wallet/CryptoPayment'

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
  const { isConnected, address } = useAccount()
  const [text, setText] = useState('')
  const [userName, setUserName] = useState('')
  const [mode, setMode] = useState<'argument' | 'treasury'>('argument')
  const [treasuryAmount, setTreasuryAmount] = useState('10')

  const side = selectedSide ?? 'believer'
  const msgCount = side === 'believer' ? believerMessageCount : skepticMessageCount
  const nextPrice = getMessagePrice(msgCount)
  const priceLadder = getPriceLadder(msgCount, 4)
  const agent = side === 'believer' ? believer : skeptic

  const handlePaymentSuccess = (txHash: string, amount: number) => {
    onSubmitMessage({
      side,
      content: mode === 'argument' ? text.trim() : '',
      amount,
      userName: userName.trim() || address?.slice(0, 8) || 'anonymous',
      isTreasury: mode === 'treasury',
    })
    setText('')
  }

  const argumentReady = mode === 'argument' ? text.trim().length >= 10 : true
  const payAmount = mode === 'argument' ? nextPrice : parseFloat(treasuryAmount) || 10

  return (
    <section className="support-section">
      <div className="section-header">
        <h2 className="section-title">Back a Side</h2>
        <p className="section-sub">
          Pay in USDC on Base. Send an argument or fund the treasury. Conviction has a price.
        </p>
      </div>

      {/* Wallet connect */}
      <div className="wallet-row">
        <WalletButton />
        {isConnected && (
          <span className="wallet-network-note">
            Using USDC on Base · <a className="wallet-link" href="https://bridge.base.org" target="_blank" rel="noopener noreferrer">Bridge ETH to Base ↗</a>
          </span>
        )}
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
                <div className="price-ladder-header">Escalating price (USDC)</div>
                <div className="price-rungs">
                  {priceLadder.map((rung, i) => (
                    <div key={rung.n} className={`price-rung ${i === 0 ? 'current' : ''}`}>
                      <span className="rung-n">#{rung.n}</span>
                      <span className="rung-price">{rung.price}</span>
                    </div>
                  ))}
                </div>
                <p className="price-note">
                  Each message to the same side costs 20% more than your last. Signals conviction.
                </p>
              </div>

              {!isConnected ? (
                <div className="connect-prompt">
                  <p className="connect-prompt-text">Connect your wallet to submit</p>
                  <WalletButton />
                </div>
              ) : (
                <CryptoPayment
                  side={selectedSide}
                  amountUsdc={nextPrice}
                  argumentContent={text.trim()}
                  userName={userName || address?.slice(0, 8) || 'anonymous'}
                  isTreasury={false}
                  onSuccess={handlePaymentSuccess}
                />
              )}

              {!argumentReady && isConnected && (
                <p className="input-hint">Write at least 10 characters to submit</p>
              )}
            </>
          ) : (
            <>
              {/* Treasury contribution */}
              <div className="treasury-form">
                <label className="input-label">Contribute USDC to {agent.name}&apos;s treasury</label>
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
                  Current treasury: <strong>${agent.treasuryBalance.toLocaleString()} USDC</strong>. The side
                  with the larger treasury gains a debate advantage multiplier in the next round.
                </p>
              </div>

              {!isConnected ? (
                <div className="connect-prompt">
                  <p className="connect-prompt-text">Connect your wallet to contribute</p>
                  <WalletButton />
                </div>
              ) : (
                <CryptoPayment
                  side={selectedSide}
                  amountUsdc={parseFloat(treasuryAmount) || 10}
                  argumentContent=""
                  userName={address?.slice(0, 8) || 'anonymous'}
                  isTreasury={true}
                  onSuccess={handlePaymentSuccess}
                />
              )}
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
                  <span className="user-msg-amount">
                    {msg.isTreasury ? `+${formatPrice(msg.amount)} treasury` : formatPrice(msg.amount) + ' USDC'}
                  </span>
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
