import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'

/**
 * GET /api/treasury
 * Returns current treasury balances and supporter counts for both sides.
 */
export async function GET() {
  const db = getServiceSupabase()
  if (!db) {
    return NextResponse.json({
      believer: { balance: 4872.5, supporters: 1247 },
      skeptic: { balance: 3941.0, supporters: 1089 },
    })
  }

  const [treasuryRes, supportersRes] = await Promise.all([
    db.from('treasury_balances').select('*'),
    db.from('supporters').select('side'),
  ])

  const treasury = treasuryRes.data ?? []
  const supporters = supportersRes.data ?? []

  const believerTreasury = treasury.find((t) => t.side === 'believer')?.balance_usdc ?? 0
  const skepticTreasury = treasury.find((t) => t.side === 'skeptic')?.balance_usdc ?? 0
  const believerSupporters = supporters.filter((s) => s.side === 'believer').length
  const skepticSupporters = supporters.filter((s) => s.side === 'skeptic').length

  return NextResponse.json({
    believer: { balance: believerTreasury, supporters: believerSupporters },
    skeptic: { balance: skepticTreasury, supporters: skepticSupporters },
  })
}
