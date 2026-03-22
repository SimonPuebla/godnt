import { NextRequest, NextResponse } from 'next/server'
import { generateDebateRound } from '@/lib/zai'
import { getServiceSupabase } from '@/lib/supabase'

/**
 * POST /api/debate/generate
 * Generates a new debate round using z.ai GLM-4.5-Air (free model).
 * Should be called by a cron job every 30 minutes.
 *
 * Cron options:
 *   A) Supabase Edge Function (pg_cron) — recommended for Supabase-hosted apps
 *   B) Vercel Cron Jobs (vercel.json cron config)
 *   C) External cron (cron-job.org, GitHub Actions)
 *
 * Security: protect with CRON_SECRET header in production.
 */

export const maxDuration = 60 // 60s timeout for AI generation

export async function POST(req: NextRequest) {
  // Optional: protect with a secret header
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const db = getServiceSupabase()

  try {
    // Fetch the latest round from DB
    let previousBelieverArg =
      'I assert that the cosmological argument remains compelling: everything that begins to exist has a cause; the universe began to exist; therefore the universe has a cause beyond itself.'
    let previousSkepticArg =
      'The cosmological argument proves at most a first cause — it does nothing to establish the properties (omnipotent, personal, benevolent) attributed to the God of any religion. The gap is enormous.'
    let nextRoundNumber = 35

    if (db) {
      const { data: latestRound } = await db
        .from('debate_rounds')
        .select('*')
        .order('round_number', { ascending: false })
        .limit(1)
        .single()

      if (latestRound) {
        previousBelieverArg = latestRound.believer_argument
        previousSkepticArg = latestRound.skeptic_argument
        nextRoundNumber = latestRound.round_number + 1
      }

      // Fetch user messages from this round to incorporate
      const { data: userMessages } = await db
        .from('user_messages')
        .select('side, content')
        .eq('is_treasury', false)
        .eq('round_number', nextRoundNumber - 1)
        .not('content', 'is', null)

      const believerUserArgs =
        userMessages?.filter((m) => m.side === 'believer').map((m) => m.content ?? '') ?? []
      const skepticUserArgs =
        userMessages?.filter((m) => m.side === 'skeptic').map((m) => m.content ?? '') ?? []

      // Generate new round with z.ai
      const generated = await generateDebateRound(
        previousBelieverArg,
        previousSkepticArg,
        nextRoundNumber,
        [...believerUserArgs, ...skepticUserArgs]
      )

      // Save to database
      const { data: newRound, error } = await db
        .from('debate_rounds')
        .insert({
          round_number: nextRoundNumber,
          believer_argument: generated.believerArgument,
          skeptic_argument: generated.skepticArgument,
          conclusion_status: generated.conclusionStatus,
          conclusion_detail: generated.conclusionDetail,
          conclusion_leader: generated.conclusionLeader,
          believer_logic_score: generated.believerLogicScore,
          skeptic_logic_score: generated.skepticLogicScore,
        })
        .select()
        .single()

      if (error) throw error

      // Update agent momentum scores
      const bScore = generated.conclusionLeader === 'believer' ? Math.min(100, 55 + Math.random() * 10) : Math.max(0, 45 - Math.random() * 10)
      const sScore = 100 - bScore

      await db.from('agent_state').update({ momentum_score: Math.round(bScore), updated_at: new Date().toISOString() }).eq('side', 'believer')
      await db.from('agent_state').update({ momentum_score: Math.round(sScore), updated_at: new Date().toISOString() }).eq('side', 'skeptic')

      return NextResponse.json({ success: true, round: newRound })
    } else {
      // No DB — just run generation and return result (dev/test mode)
      const generated = await generateDebateRound(
        previousBelieverArg,
        previousSkepticArg,
        nextRoundNumber
      )
      return NextResponse.json({ success: true, generated, mock: true })
    }
  } catch (err) {
    console.error('[/api/debate/generate]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

// GET — fetch latest rounds (public endpoint for UI)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 20)

  const db = getServiceSupabase()
  if (!db) return NextResponse.json({ rounds: [] })

  const { data, error } = await db
    .from('debate_rounds')
    .select('*')
    .order('round_number', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ rounds: data })
}
