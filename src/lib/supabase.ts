import { createClient } from '@supabase/supabase-js'

// ─── Types matching our schema ────────────────────────────────────

export interface DBDebateRound {
  id: string
  round_number: number
  created_at: string
  believer_argument: string
  skeptic_argument: string
  conclusion_status: string
  conclusion_detail: string
  conclusion_leader: 'believer' | 'skeptic' | 'tied'
  believer_logic_score: number
  skeptic_logic_score: number
}

export interface DBUserMessage {
  id: string
  created_at: string
  side: 'believer' | 'skeptic'
  content: string | null
  user_address: string
  user_name: string | null
  amount_usdc: number
  is_treasury: boolean
  tx_hash: string
  tx_verified: boolean
  round_number: number | null
}

export interface DBAgentState {
  side: 'believer' | 'skeptic'
  name: string
  title: string
  current_thesis: string
  momentum_score: number
  updated_at: string
}

export interface DBTreasury {
  side: 'believer' | 'skeptic'
  balance_usdc: number
  updated_at: string
}

// ─── Public client (read-only via anon key) ───────────────────────

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

export const supabase = supabaseUrl
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// ─── Server client (full access via service role key) ─────────────
// Only used in API routes (server-side). Never expose service key to client.

export function getServiceSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceKey) return null
  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  })
}
