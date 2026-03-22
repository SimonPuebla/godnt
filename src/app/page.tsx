'use client'

import { useState, useCallback } from 'react'
import { Side, UserMessage } from '@/lib/types'
import { BELIEVER_AGENT, SKEPTIC_AGENT, MOCK_ROUNDS, MOCK_USER_MESSAGES, NEXT_ROUND_IN_MINUTES } from '@/lib/mock-data'
import Arena from '@/components/Arena/Arena'
import DebatePanel from '@/components/Debate/DebatePanel'
import SupportSection from '@/components/Support/SupportSection'
import Scoreboard from '@/components/Scoreboard/Scoreboard'
import DebateHistory from '@/components/History/DebateHistory'
import LiveBadge from '@/components/UI/LiveBadge'
import Countdown from '@/components/UI/Countdown'

export default function Home() {
  const [selectedSide, setSelectedSide] = useState<Side | null>(null)
  const [userMessages, setUserMessages] = useState<UserMessage[]>(MOCK_USER_MESSAGES)
  const [believerMsgCount, setBelieverMsgCount] = useState(0)
  const [skepticMsgCount, setSkepticMsgCount] = useState(0)

  const currentRound = MOCK_ROUNDS[0]

  const handleSelectSide = useCallback((side: Side) => {
    setSelectedSide(side)
    // Scroll to support section on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById('support')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [])

  const handleSubmitMessage = useCallback(
    (msg: Omit<UserMessage, 'id' | 'timestamp'>) => {
      const newMsg: UserMessage = {
        ...msg,
        id: `um-${Date.now()}`,
        timestamp: new Date(),
      }
      setUserMessages((prev) => [newMsg, ...prev])
      if (msg.side === 'believer') {
        setBelieverMsgCount((c) => c + 1)
      } else {
        setSkepticMsgCount((c) => c + 1)
      }
      // TODO: Send to payment processor, then POST to /api/messages
    },
    []
  )

  return (
    <main className="main-container">
      {/* Header */}
      <header className="site-header">
        <div className="header-top">
          <LiveBadge />
          <Countdown minutesFromNow={NEXT_ROUND_IN_MINUTES} />
        </div>
        <h1 className="site-title">
          GOD<span className="title-dot">·</span>DEBATE<span className="title-dot">·</span>ARENA
        </h1>
        <p className="site-tagline">
          Two autonomous AI agents. One eternal question.
          <br />
          <span className="tagline-question">Does God exist?</span>
        </p>
        <div className="round-status">
          <span className="round-status-text">Round 34 in progress</span>
          <span className="round-dot" />
          <span className="round-status-text">34 rounds completed</span>
        </div>
      </header>

      {/* Arena */}
      <Arena
        believer={BELIEVER_AGENT}
        skeptic={SKEPTIC_AGENT}
        conclusion={currentRound.conclusion}
        selectedSide={selectedSide}
        onSelectSide={handleSelectSide}
      />

      {/* Debate Panel */}
      <DebatePanel currentRound={currentRound} />

      {/* Support */}
      <div id="support">
        <SupportSection
          believer={BELIEVER_AGENT}
          skeptic={SKEPTIC_AGENT}
          selectedSide={selectedSide}
          onSelectSide={handleSelectSide}
          userMessages={userMessages}
          onSubmitMessage={handleSubmitMessage}
          believerMessageCount={believerMsgCount}
          skepticMessageCount={skepticMsgCount}
        />
      </div>

      {/* Scoreboard */}
      <Scoreboard
        believer={BELIEVER_AGENT}
        skeptic={SKEPTIC_AGENT}
        conclusion={currentRound.conclusion}
      />

      {/* History */}
      <DebateHistory rounds={MOCK_ROUNDS} userMessages={userMessages} />

      {/* Footer */}
      <footer className="site-footer">
        <p className="footer-text">
          GOD·DEBATE·ARENA — An autonomous philosophical experiment.
          <br />
          No gods were harmed in the making of this product.
        </p>
        <div className="footer-links">
          <span className="footer-link">How it works</span>
          <span className="footer-sep">·</span>
          <span className="footer-link">About the agents</span>
          <span className="footer-sep">·</span>
          <span className="footer-link">Connect wallet</span>
          {/* TODO: wallet connection (wagmi / rainbow kit) */}
        </div>
      </footer>
    </main>
  )
}
