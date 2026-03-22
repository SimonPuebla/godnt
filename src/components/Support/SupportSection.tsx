'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { Side, Agent, UserMessage } from '@/lib/types'
import { getMessagePrice, formatPrice } from '@/lib/pricing'
import WalletButton from '@/components/Wallet/WalletButton'
import CryptoPayment from '@/components/Wallet/CryptoPayment'

interface SupportSectionProps {
  believer: Agent
  skeptic: Agent
  selectedSide: Side | null
  onSelectSide: (side: Side) => void
  onSubmitMessage: (msg: Omit<UserMessage, 'id' | 'timestamp'>) => void
  believerMessageCount: number
  skepticMessageCount: number
}

const PLACEHOLDERS: Record<Side, string[]> = {
  believer: [
    'Give your best argument for transcendence...',
    'What does SERAPH need to say next?',
    'Challenge the logic of the skeptic...',
  ],
  skeptic: [
    'Send a sharper point in 500 chars or less...',
    'What should LOGOS press on?',
    'Challenge the claim. Be precise.',
  ],
}

export default function SupportSection({
  believer,
  skeptic,
  selectedSide,
  onSelectSide,
  onSubmitMessage,
  believerMessageCount,
  skepticMessageCount,
}: SupportSectionProps) {
  const { isConnected, address } = useAccount()
  const [text, setText] = useState('')
  const [mode, setMode] = useState<'argument' | 'treasury'>('argument')
  const [treasuryAmount, setTreasuryAmount] = useState('10')
  const [submitted, setSubmitted] = useState(false)

  const side = selectedSide ?? 'believer'
  const msgCount = side === 'believer' ? believerMessageCount : skepticMessageCount
  const nextPrice = getMessagePrice(msgCount)
  const agent = side === 'believer' ? believer : skeptic
  const placeholder = PLACEHOLDERS[side][0]

  const handlePaymentSuccess = (_txHash: string, amount: number) => {
    onSubmitMessage({
      side,
      content: mode === 'argument' ? text.trim() : '',
      amount,
      userName: address?.slice(0, 8) || 'anonymous',
      isTreasury: mode === 'treasury',
    })
    setText('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
  }

  const payAmount = mode === 'argument' ? nextPrice : parseFloat(treasuryAmount) || 10

  return (
    <section className="join-section">
      <div className="section-header">
        <h2 className="section-title">Join the debate</h2>
        <p className="section-sub">Your argument may be used in the next round.</p>
      </div>

      {/* Side picker */}
      <div className="side-picker">
        <button
          className={`side-pick-btn believer ${selectedSide === 'believer' ? 'active' : ''}`}
          onClick={() => { onSelectSide('believer'); setMode('argument'); setSubmitted(false) }}
        >
          <span className="spb-name">SERAPH</span>
          <span className="spb-role">Believer</span>
        </button>
        <button
          className={`side-pick-btn skeptic ${selectedSide === 'skeptic' ? 'active' : ''}`}
          onClick={() => { onSelectSide('skeptic'); setMode('argument'); setSubmitted(false) }}
        >
          <span className="spb-name">LOGOS</span>
          <span className="spb-role">Skeptic</span>
        </button>
      </div>

      {selectedSide && (
        <div className={`join-form ${selectedSide}`}>
          {mode === 'argument' ? (
            <>
              <textarea
                className={`debate-textarea ${selectedSide}`}
                maxLength={500}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                rows={4}
              />
              <div className="input-meta">
                <span className="meta-chars">{text.length} / 500</span>
                <span className={`meta-price ${selectedSide}`}>{formatPrice(nextPrice)} USDC</span>
              </div>

              {submitted ? (
                <div className="sent-confirmation">
                  <span className={`sent-text ${selectedSide}`}>→ Sent to {agent.name}</span>
                  <span className="sent-sub">Your message will influence the next round</span>
                </div>
              ) : !isConnected ? (
                <div className="wallet-prompt">
                  <span className="wallet-prompt-text">Connect wallet to send</span>
                  <WalletButton />
                </div>
              ) : (
                <CryptoPayment
                  side={selectedSide}
                  amountUsdc={nextPrice}
                  argumentContent={text.trim()}
                  userName={address?.slice(0, 8) || 'anonymous'}
                  isTreasury={false}
                  onSuccess={handlePaymentSuccess}
                />
              )}

              <button className="treasury-link" onClick={() => setMode('treasury')}>
                Fund treasury instead →
              </button>
            </>
          ) : (
            <>
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
              <p className="treasury-note">
                {agent.name} treasury: <strong>${agent.treasuryBalance.toLocaleString()} USDC</strong>.
                The side with the larger treasury gains a debate advantage in the next round.
              </p>

              {!isConnected ? (
                <div className="wallet-prompt">
                  <span className="wallet-prompt-text">Connect wallet to fund</span>
                  <WalletButton />
                </div>
              ) : (
                <CryptoPayment
                  side={selectedSide}
                  amountUsdc={payAmount}
                  argumentContent=""
                  userName={address?.slice(0, 8) || 'anonymous'}
                  isTreasury={true}
                  onSuccess={handlePaymentSuccess}
                />
              )}

              <button className="treasury-link" onClick={() => setMode('argument')}>
                ← Send an argument instead
              </button>
            </>
          )}
        </div>
      )}
    </section>
  )
}
