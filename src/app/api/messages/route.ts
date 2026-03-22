import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase'
import { verifyUSDCTransfer } from '@/lib/verify-tx'

// Read from env to avoid importing browser-only wagmi-config on the server
const SERVER_TREASURY: Record<string, string> = {
  believer: process.env.NEXT_PUBLIC_BELIEVER_TREASURY_ADDRESS ?? '',
  skeptic:  process.env.NEXT_PUBLIC_SKEPTIC_TREASURY_ADDRESS ?? '',
}

/**
 * POST /api/messages
 * Called after a USDC transaction is confirmed on-chain.
 * Verifies the transfer on-chain with viem before saving to DB.
 * The message is only recorded once money has actually been received.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      side,
      content,
      userAddress,
      userName,
      amountUsdc,
      isTreasury,
      txHash,
      chainId,
    } = body

    // Basic validation
    if (!side || !userAddress || !txHash || amountUsdc == null || !chainId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['believer', 'skeptic'].includes(side)) {
      return NextResponse.json({ error: 'Invalid side' }, { status: 400 })
    }

    if (typeof amountUsdc !== 'number' || amountUsdc <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    if (content && content.length > 500) {
      return NextResponse.json({ error: 'Content too long' }, { status: 400 })
    }

    // ─── On-chain verification ──────────────────────────────────────
    // Confirm money was actually sent before saving the message
    const treasuryAddress = SERVER_TREASURY[side]
    const verification = await verifyUSDCTransfer(
      txHash,
      chainId,
      userAddress,
      treasuryAddress,
      amountUsdc
    )

    if (!verification.ok) {
      console.warn('[/api/messages] tx verification failed:', verification.error, { txHash, side, amountUsdc })
      return NextResponse.json(
        { error: `Transaction verification failed: ${verification.error}` },
        { status: 400 }
      )
    }

    const db = getServiceSupabase()

    if (!db) {
      // No Supabase configured — return success in dev mode
      return NextResponse.json({ success: true, mock: true })
    }

    // Get current round number
    const { data: latestRound } = await db
      .from('debate_rounds')
      .select('round_number')
      .order('round_number', { ascending: false })
      .limit(1)
      .single()

    const { error } = await db.from('user_messages').insert({
      side,
      content: content || null,
      user_address: userAddress.toLowerCase(),
      user_name: userName || null,
      amount_usdc: amountUsdc,
      is_treasury: isTreasury ?? false,
      tx_hash: txHash.toLowerCase(),
      tx_verified: true,
      round_number: latestRound?.round_number ?? null,
    })

    if (error) {
      if (error.code === '23505') {
        // Duplicate tx_hash — idempotent, treat as success
        return NextResponse.json({ success: true, duplicate: true })
      }
      throw error
    }

    // Upsert supporter record (one per address per side)
    await db.from('supporters').upsert(
      { side, user_address: userAddress.toLowerCase() },
      { onConflict: 'side,user_address', ignoreDuplicates: true }
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[/api/messages]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/messages — fetch recent messages
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const side = searchParams.get('side')
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)

  const db = getServiceSupabase()
  if (!db) {
    return NextResponse.json({ messages: [] })
  }

  let query = db
    .from('user_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (side) query = query.eq('side', side)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ messages: data })
}
