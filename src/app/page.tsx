'use client'

import { useState, useCallback, useEffect } from 'react'
import { Side, UserMessage } from '@/lib/types'
import {
  BELIEVER_AGENT,
  SKEPTIC_AGENT,
  MOCK_ROUNDS,
  MOCK_USER_MESSAGES,
  NEXT_ROUND_IN_MINUTES,
} from '@/lib/mock-data'
import { supabase } from '@/lib/supabase'
import Arena from '@/components/Arena/Arena'
import DebatePanel from '@/components/Debate/DebatePanel'
import SupportSection from '@/components/Support/SupportSection'
import Scoreboard from '@/components/Scoreboard/Scoreboard'
import DebateHistory from '@/components/History/DebateHistory'
import LiveBadge from '@/components/UI/LiveBadge'
import Countdown from '@/components/UI/Countdown'
import type { DebateRound, DebateConclusion } from '@/lib/types'
import type { DBDebateRound, DBUserMessage } from '@/lib/supabase'

// ─── Helpers to map DB rows → app types ──────────────────────────

function dbRoundToAppRound(r: DBDebateRound): DebateRound {
  return {
    roundNumber: r.round_number,
    timestamp: new Date(r.created_at),
    believerArgument: {
      id: `b-${r.round_number}`,
      side: 'believer',
      content: r.believer_argument,
      timestamp: new Date(r.created_at),
      roundNumber: r.round_number,
    },
    skepticArgument: {
      id: `s-${r.round_number}`,
      side: 'skeptic',
      content: r.skeptic_argument,
      timestamp: new Date(r.created_at),
      roundNumber: r.round_number,
    },
    conclusion: {
      status: r.conclusion_status,
      detail: r.conclusion_detail,
      leader: r.conclusion_leader,
      logicScore: {
        believer: r.believer_logic_score,
        skeptic: r.skeptic_logic_score,
      },
      publicSupportLeader: r.conclusion_leader === 'tied' ? 'believer' : r.conclusion_leader,
    },
  }
}

function dbMsgToAppMsg(m: DBUserMessage): UserMessage {
  return {
    id: m.id,
    side: m.side,
    content: m.content ?? '',
    timestamp: new Date(m.created_at),
    amount: m.amount_usdc,
    userName: m.user_name ?? m.user_address.slice(0, 8),
    isTreasury: m.is_treasury,
  }
}

// ─── Page ─────────────────────────────────────────────────────────

export default function Home() {
  const [selectedSide, setSelectedSide] = useState<Side | null>(null)
  const [userMessages, setUserMessages] = useState<UserMessage[]>(MOCK_USER_MESSAGES)
  const [rounds, setRounds] = useState<DebateRound[]>(MOCK_ROUNDS)
  const [believerMsgCount, setBelieverMsgCount] = useState(0)
  const [skepticMsgCount, setSkepticMsgCount] = useState(0)
  const [isLive, setIsLive] = useState(false)

  const currentRound = rounds[0]

  // ─── Fetch real data from Supabase on mount ───────────────────
  useEffect(() => {
    if (!supabase) return
    const db = supabase

    const fetchData = async () => {
      const [roundsRes, messagesRes] = await Promise.all([
        db
          .from('debate_rounds')
          .select('*')
          .order('round_number', { ascending: false })
          .limit(10),
        db
          .from('user_messages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20),
      ])

      if (roundsRes.data && roundsRes.data.length > 0) {
        setRounds(roundsRes.data.map(dbRoundToAppRound))
        setIsLive(true)
      }

      if (messagesRes.data && messagesRes.data.length > 0) {
        setUserMessages(messagesRes.data.map(dbMsgToAppMsg))
      }
    }

    fetchData()

    // ─── Realtime subscriptions ───────────────────────────────
    const roundsChannel = db
      .channel('debate_rounds')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'debate_rounds' }, (payload) => {
        const newRound = dbRoundToAppRound(payload.new as DBDebateRound)
        setRounds((prev) => [newRound, ...prev])
      })
      .subscribe()

    const messagesChannel = db
      .channel('user_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_messages' }, (payload) => {
        const newMsg = dbMsgToAppMsg(payload.new as DBUserMessage)
        setUserMessages((prev) => [newMsg, ...prev])
      })
      .subscribe()

    return () => {
      db.removeChannel(roundsChannel)
      db.removeChannel(messagesChannel)
    }
  }, [])

  const handleSelectSide = useCallback((side: Side) => {
    setSelectedSide(side)
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setTimeout(() => {
        document.getElementById('support')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [])

  const handleSubmitMessage = useCallback((msg: Omit<UserMessage, 'id' | 'timestamp'>) => {
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
  }, [])

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
          <span className="round-status-text">Round {currentRound.roundNumber} in progress</span>
          <span className="round-dot" />
          <span className="round-status-text">{rounds.length} rounds completed</span>
          {isLive && (
            <>
              <span className="round-dot" />
              <span className="round-status-text live-indicator">Live data</span>
            </>
          )}
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
      <DebateHistory rounds={rounds} userMessages={userMessages} />

      {/* Footer */}
      <footer className="site-footer">
        <p className="footer-text">
          GOD·DEBATE·ARENA — An autonomous philosophical experiment powered by z.ai + Base.
          <br />
          No gods were harmed in the making of this product.
        </p>
        <div className="footer-links">
          <span className="footer-link">How it works</span>
          <span className="footer-sep">·</span>
          <span className="footer-link">About the agents</span>
          <span className="footer-sep">·</span>
          <a
            className="footer-link"
            href="https://bridge.base.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Bridge to Base ↗
          </a>
        </div>
      </footer>
    </main>
  )
}
