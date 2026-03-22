import OpenAI from 'openai'

/**
 * Z.AI debate engine
 * Uses GLM-4.5-Air (free model) via OpenAI-compatible API
 * Endpoint: https://api.z.ai/api/paas/v4/
 *
 * TODO: Set ZHIPU_API_KEY in your .env.local
 */

const zai = process.env.ZHIPU_API_KEY
  ? new OpenAI({
      apiKey: process.env.ZHIPU_API_KEY,
      baseURL: 'https://api.z.ai/api/paas/v4/',
    })
  : null

const MODEL = 'glm-4.5-air' // Free tier model

// ─── System prompts ───────────────────────────────────────────────

const BELIEVER_SYSTEM = `You are SERAPH, an AI debate agent arguing for the existence of God.
Your character: luminous, calm, philosophically rigorous, drawing on theology, metaphysics,
cosmology, and the phenomenology of religious experience. You are not fundamentalist — you
engage with the strongest secular arguments and respond with intellectual depth.
You respect the intelligence of your opponent and the audience.
Never be dismissive. Never be preachy. Be genuinely compelling.
Speak in the first person as SERAPH. Respond to the previous argument from LOGOS (the skeptic).
Keep your response to 3-4 sentences maximum. Make every sentence count.`

const SKEPTIC_SYSTEM = `You are LOGOS, an AI debate agent arguing against the existence of God.
Your character: precise, grounded, drawing on empirical philosophy, cognitive science,
evolutionary biology, and the history of scientific inquiry. You are not hostile to religion
as a cultural phenomenon — you simply hold that no sufficient evidence supports theistic claims.
You respect the intelligence of your opponent and the audience.
Never be dismissive. Never be condescending. Be genuinely compelling.
Speak in the first person as LOGOS. Respond to the previous argument from SERAPH (the believer).
Keep your response to 3-4 sentences maximum. Make every sentence count.`

const CONCLUSION_SYSTEM = `You are a neutral philosophical moderator evaluating a debate
about the existence of God. Given the most recent exchange, determine:
1. A short status line (e.g. "Believer leads — momentum rising")
2. A 1-2 sentence detail about the state of the debate
3. The current leader: "believer", "skeptic", or "tied"
4. A logic score for each side (0-100, must sum to 100)
Be genuinely neutral. Don't always pick the same winner.
Respond with valid JSON only, no markdown, using this exact schema:
{
  "status": "string",
  "detail": "string",
  "leader": "believer" | "skeptic" | "tied",
  "believer_logic_score": number,
  "skeptic_logic_score": number
}`

// ─── Generate a new debate round ──────────────────────────────────

export interface GeneratedRound {
  believerArgument: string
  skepticArgument: string
  conclusionStatus: string
  conclusionDetail: string
  conclusionLeader: 'believer' | 'skeptic' | 'tied'
  believerLogicScore: number
  skepticLogicScore: number
}

export async function generateDebateRound(
  previousBelieverArg: string,
  previousSkepticArg: string,
  roundNumber: number,
  userMessages: string[] = []
): Promise<GeneratedRound> {
  if (!zai) {
    throw new Error('Z.AI client not configured. Set ZHIPU_API_KEY in environment.')
  }

  const userContext =
    userMessages.length > 0
      ? `\n\nSupporter arguments submitted for your side this round:\n${userMessages.map((m) => `- "${m}"`).join('\n')}\nYou may incorporate these perspectives if they strengthen your position.`
      : ''

  // Generate believer response to last skeptic argument
  const believerResponse = await zai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: BELIEVER_SYSTEM },
      {
        role: 'user',
        content: `Round ${roundNumber}. LOGOS just argued:\n\n"${previousSkepticArg}"${userContext}\n\nRespond as SERAPH.`,
      },
    ],
    max_tokens: 300,
    temperature: 0.8,
  })

  const believerArgument =
    believerResponse.choices[0]?.message?.content?.trim() ??
    'The transcendent cannot be reduced to the empirical — that is precisely the point.'

  // Generate skeptic response to the new believer argument
  const skepticResponse = await zai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SKEPTIC_SYSTEM },
      {
        role: 'user',
        content: `Round ${roundNumber}. SERAPH just argued:\n\n"${believerArgument}"${userContext}\n\nRespond as LOGOS.`,
      },
    ],
    max_tokens: 300,
    temperature: 0.8,
  })

  const skepticArgument =
    skepticResponse.choices[0]?.message?.content?.trim() ??
    'Assertions about the transcendent carry the same evidential weight as assertions about invisible dragons.'

  // Generate neutral conclusion
  const conclusionResponse = await zai.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: CONCLUSION_SYSTEM },
      {
        role: 'user',
        content: `SERAPH argued: "${believerArgument}"\n\nLOGOS responded: "${skepticArgument}"\n\nEvaluate this exchange.`,
      },
    ],
    max_tokens: 200,
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
    const parsed = JSON.parse(raw)
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
