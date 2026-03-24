import OpenAI from 'openai'
import { SERAPH_SYSTEM_PROMPT } from '@/agents/seraph'
import { LOGOS_SYSTEM_PROMPT } from '@/agents/logos'

/**
 * Z.AI debate engine
 * Uses GLM-4.5-Air via OpenAI-compatible API
 * Endpoint: https://api.z.ai/api/paas/v4/
 *
 * Agent personalities live in:
 *   src/agents/seraph.ts  ← edit to change SERAPH's character
 *   src/agents/logos.ts   ← edit to change LOGOS's character
 */

const zai = process.env.ZHIPU_API_KEY
  ? new OpenAI({
      apiKey: process.env.ZHIPU_API_KEY,
      baseURL: 'https://api.z.ai/api/paas/v4/',
    })
  : null

const MODEL = 'glm-4.5-air'

// ─── Neutral moderator prompt ─────────────────────────────────────

const CONCLUSION_SYSTEM = `You are a neutral philosophical moderator evaluating a debate about the existence of God.
Given the most recent exchange, determine:
1. A short status line (6 words max, e.g. "Believer leads — momentum rising")
2. A 1-2 sentence detail about the state of the debate
3. The current leader: "believer", "skeptic", or "tied"
4. A logic score for each side (0-100, must sum to 100)
Be genuinely neutral. Score based on argumentative quality, not your own views.
Respond with valid JSON only, no markdown, no explanation outside the JSON, using this exact schema:
{
  "status": "string",
  "detail": "string",
  "leader": "believer" | "skeptic" | "tied",
  "believer_logic_score": number,
  "skeptic_logic_score": number
}`

// ─── Types ────────────────────────────────────────────────────────

export interface GeneratedRound {
  believerArgument: string
  skepticArgument: string
  conclusionStatus: string
  conclusionDetail: string
  conclusionLeader: 'believer' | 'skeptic' | 'tied'
  believerLogicScore: number
  skepticLogicScore: number
}

// ─── Generate a new debate round ──────────────────────────────────

export async function generateDebateRound(
  previousBelieverArg: string,
  previousSkepticArg: string,
  roundNumber: number,
  userMessages: string[] = []
): Promise<GeneratedRound> {
  if (!zai) {
    throw new Error('Z.AI client not configured. Set ZHIPU_API_KEY in environment.')
  }

  // Separate user messages by side for targeted injection
  const believerUserContext =
    userMessages.filter((_, i) => i % 2 === 0).length > 0
      ? `\n\nYour supporters sent these arguments for you to consider:\n${userMessages
          .slice(0, 3)
          .map((m) => `— "${m}"`)
          .join('\n')}\nYou may incorporate these if they strengthen your case.`
      : ''

  const skepticUserContext =
    userMessages.filter((_, i) => i % 2 !== 0).length > 0
      ? `\n\nYour supporters sent these arguments for you to consider:\n${userMessages
          .slice(0, 3)
          .map((m) => `— "${m}"`)
          .join('\n')}\nYou may incorporate these if they strengthen your case.`
      : ''

  // ── SERAPH responds to LOGOS ──────────────────────────────────
  const believerResponse = await zai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SERAPH_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Round ${roundNumber}.

Your previous argument (Round ${roundNumber - 1}):
"${previousBelieverArg}"

LOGOS just responded:
"${previousSkepticArg}"
${believerUserContext}
Now respond as SERAPH. Build on your previous position. Engage LOGOS's specific argument.`,
      },
    ],
    max_tokens: 320,
    temperature: 0.82,
  })

  const believerArgument =
    believerResponse.choices[0]?.message?.content?.trim() ??
    'The transcendent cannot be reduced to the empirical — that is precisely the point.'

  // ── LOGOS responds to SERAPH ──────────────────────────────────
  const skepticResponse = await zai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: LOGOS_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `Round ${roundNumber}.

Your previous argument (Round ${roundNumber - 1}):
"${previousSkepticArg}"

SERAPH just responded:
"${believerArgument}"
${skepticUserContext}
Now respond as LOGOS. Build on your previous position. Engage SERAPH's specific argument.`,
      },
    ],
    max_tokens: 320,
    temperature: 0.82,
  })

  const skepticArgument =
    skepticResponse.choices[0]?.message?.content?.trim() ??
    'Assertions about the transcendent carry the same evidential weight as assertions about invisible dragons.'

  // ── Neutral moderator evaluates the exchange ──────────────────
  const conclusionResponse = await zai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: CONCLUSION_SYSTEM },
      {
        role: 'user',
        content: `Round ${roundNumber} exchange:

SERAPH argued: "${believerArgument}"

LOGOS responded: "${skepticArgument}"

Evaluate this exchange.`,
      },
    ],
    max_tokens: 220,
    temperature: 0.3,
  })

  let conclusion = {
    status: 'Debate continues',
    detail: 'Both sides made compelling points.',
    leader: 'tied' as const,
    believer_logic_score: 50,
    skeptic_logic_score: 50,
  }

  try {
    const raw = conclusionResponse.choices[0]?.message?.content ?? '{}'
    // Strip any accidental markdown fences
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(cleaned)
    conclusion = {
      status: parsed.status ?? conclusion.status,
      detail: parsed.detail ?? conclusion.detail,
      leader: parsed.leader ?? conclusion.leader,
      believer_logic_score: parsed.believer_logic_score ?? 50,
      skeptic_logic_score: parsed.skeptic_logic_score ?? 50,
    }
  } catch {
    // Keep defaults if parse fails
  }

  return {
    believerArgument,
    skepticArgument,
    conclusionStatus: conclusion.status,
    conclusionDetail: conclusion.detail,
    conclusionLeader: conclusion.leader,
    believerLogicScore: conclusion.believer_logic_score,
    skepticLogicScore: conclusion.skeptic_logic_score,
  }
}
