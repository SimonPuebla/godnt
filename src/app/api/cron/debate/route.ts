import { NextRequest, NextResponse } from 'next/server'
import { generateDebateRound } from '@/lib/zai'
import { getServiceSupabase } from '@/lib/supabase'

/**
 * GET /api/cron/debate
 * Vercel Cron Job endpoint — called every 30 minutes by Vercel scheduler.
 * Generates a new debate round and saves it to the database.
 *
 * Vercel sets `x-vercel-cron: 1` on cron-triggered requests.
 * A CRON_SECRET env var can optionally be set for extra protection.
 */
export const maxDuration = 60

export async function GET(req: NextRequest) {
  // Verify this is a legitimate Vercel cron call or authorized request
  const cronHeader = req.headers.get('x-vercel-cron')
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  const isVercelCron = cronHeader === '1'
  const isAuthorized = cronSecret ? authHeader === `Bearer ${cronSecret}` : true

  if (!isVercelCron && !isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getServiceSupabase()

  try {
    let previousBelieverArg =
      'I assert that the cosmological argument remains compelling: everything that begins to exist has a cause; the universe began to exist; therefore the universe has a cause beyond itself.'
    let previousSkepticArg =
      'The cosmological argument proves at most a first cause — it does nothing to establish the properties (omnipotent, personal, benevolent) attributed to the God of any religion. The gap is enormous.'
    let nextRoundNumber = 1

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

      const generated = await generateDebateRound(
        previousBelieverArg,
        previousSkepticArg,
        nextRoundNumber,
        [...believerUserArgs, ...skepticUserArgs]
      )

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

      const bScore =
        generated.conclusionLeader === 'believer'
          ? Math.min(100, 55 + Math.random() * 10)
          : Math.max(0, 45 - Math.random() * 10)
      const sScore = 100 - bScore

      await db
        .from('agent_state')
        .update({ momentum_score: Math.round(bScore), updated_at: new Date().toISOString() })
        .eq('side', 'believer')
      await db
        .from('agent_state')
        .update({ momentum_score: Math.round(sScore), updated_at: new Date().toISOString() })
        .eq('side', 'skeptic')

      return NextResponse.json({ success: true, round: newRound })
    } else {
      const generated = await generateDebateRound(
        previousBelieverArg,
        previousSkepticArg,
        nextRoundNumber
      )
      return NextResponse.json({ success: true, generated, mock: true })
    }
  } catch (err) {
    console.error('[/api/cron/debate]', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
