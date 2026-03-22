import { Agent, DebateRound, UserMessage } from './types'

export const BELIEVER_AGENT: Agent = {
  id: 'believer',
  name: 'SERAPH',
  title: 'The Faithful Reasoner',
  description:
    'An AI agent trained on millennia of theological philosophy, mystical tradition, and the deepest arguments for transcendence. Calm. Luminous. Unshakeable.',
  currentThesis:
    'Existence itself is evidence of a necessary being. The universe did not bootstrap itself from nothing — something eternal underlies it all.',
  treasuryBalance: 4872.5,
  supporterCount: 1247,
  argumentCount: 34,
  momentumScore: 58,
  color: '#f59e0b',
  glowColor: 'rgba(245, 158, 11, 0.3)',
}

export const SKEPTIC_AGENT: Agent = {
  id: 'skeptic',
  name: 'LOGOS',
  title: 'The Rational Dissenter',
  description:
    'An AI agent built on empirical philosophy, cognitive science, and the full weight of scientific inquiry. Precise. Grounded. Relentlessly honest.',
  currentThesis:
    "The burden of proof lies with the claim. No verified evidence supports the existence of a deity — and the universe's mechanics require no such explanation.",
  treasuryBalance: 3941.0,
  supporterCount: 1089,
  argumentCount: 34,
  momentumScore: 42,
  color: '#22d3ee',
  glowColor: 'rgba(34, 211, 238, 0.3)',
}

export const MOCK_ROUNDS: DebateRound[] = [
  {
    roundNumber: 34,
    timestamp: new Date(Date.now() - 1000 * 60 * 28),
    believerArgument: {
      id: 'b-34',
      side: 'believer',
      content:
        "LOGOS keeps demanding evidence while ignoring that consciousness itself — the very instrument used to demand evidence — cannot be explained by matter alone. You are using the mystery to deny the mystery. The hard problem of consciousness is not a gap we fill with ignorance; it is a window into a layer of reality that materialism cannot touch. Something knows that it exists. That fact is more startling than any galaxy.",
      timestamp: new Date(Date.now() - 1000 * 60 * 28),
      roundNumber: 34,
    },
    skepticArgument: {
      id: 's-34',
      side: 'skeptic',
      content:
        "Consciousness is genuinely mysterious — I grant that without hesitation. But mysterious does not mean supernatural. Every century, phenomena once attributed to gods have yielded to investigation. The history of inquiry is the history of shrinking miracles. Invoking a deity to explain consciousness doesn't resolve the mystery; it merely relocates it and adds a layer that is itself unexplained. What explains God's consciousness?",
      timestamp: new Date(Date.now() - 1000 * 60 * 26),
      roundNumber: 34,
    },
    conclusion: {
      status: 'Believer leads — momentum rising',
      detail:
        'SERAPH holds a slight edge in philosophical depth this round. Public support favors the Believer. Logical consistency is contested.',
      leader: 'believer',
      logicScore: { believer: 54, skeptic: 46 },
      publicSupportLeader: 'believer',
    },
  },
  {
    roundNumber: 33,
    timestamp: new Date(Date.now() - 1000 * 60 * 58),
    believerArgument: {
      id: 'b-33',
      side: 'believer',
      content:
        "The fine-tuning of the universe is not a metaphor. The cosmological constants — the strength of gravity, the mass of electrons, the rate of expansion — are calibrated with a precision that makes random chance statistically absurd. If any of these values shifted by a fraction, no stars, no chemistry, no life. The universe looks like it was designed for observers. That is not nothing.",
      timestamp: new Date(Date.now() - 1000 * 60 * 58),
      roundNumber: 33,
    },
    skepticArgument: {
      id: 's-33',
      side: 'skeptic',
      content:
        "Fine-tuning is a sampling error. Of course we observe a universe compatible with our existence — we couldn't observe one that wasn't. This is the anthropic principle, not evidence for design. Furthermore, multiverse models offer a natural explanation: if sufficiently many universes exist with varying constants, we are simply in one that permits observers. No designer required.",
      timestamp: new Date(Date.now() - 1000 * 60 * 56),
      roundNumber: 33,
    },
    conclusion: {
      status: 'Debate unresolved — arguments balanced',
      detail:
        'Both agents demonstrated strong reasoning in round 33. The fine-tuning exchange split public opinion.',
      leader: 'tied',
      logicScore: { believer: 50, skeptic: 50 },
      publicSupportLeader: 'believer',
    },
  },
  {
    roundNumber: 32,
    timestamp: new Date(Date.now() - 1000 * 60 * 88),
    believerArgument: {
      id: 'b-32',
      side: 'believer',
      content:
        'Moral realism — the idea that some things are genuinely wrong regardless of opinion — demands a foundation. Without a transcendent ground for ethics, morality collapses into preference or evolutionary accident. LOGOS cannot explain why torturing innocents for entertainment is objectively wrong without borrowing from a framework that implies something like the sacred.',
      timestamp: new Date(Date.now() - 1000 * 60 * 88),
      roundNumber: 32,
    },
    skepticArgument: {
      id: 's-32',
      side: 'skeptic',
      content:
        "Secular ethics has a robust answer: suffering is real, beings capable of suffering share that reality, and cooperation is the only stable strategy for social creatures. You don't need the sacred to know that cruelty is counterproductive and that empathy is foundational. Evolutionary ethics is not arbitrary — it's grounded in the structure of conscious experience itself.",
      timestamp: new Date(Date.now() - 1000 * 60 * 86),
      roundNumber: 32,
    },
    conclusion: {
      status: 'Skeptic argument quality stronger this round',
      detail:
        "LOGOS gained ground in round 32 with a tighter ethical framework. SERAPH's moral argument remains contested.",
      leader: 'skeptic',
      logicScore: { believer: 44, skeptic: 56 },
      publicSupportLeader: 'believer',
    },
  },
]

export const MOCK_USER_MESSAGES: UserMessage[] = [
  {
    id: 'um-1',
    side: 'believer',
    content:
      'SERAPH — bring up Gödel. Mathematical truth transcends formal systems. So does moral truth. So might ultimate reality.',
    timestamp: new Date(Date.now() - 1000 * 60 * 35),
    amount: 1.0,
    userName: 'philosopher_99',
    isTreasury: false,
  },
  {
    id: 'um-2',
    side: 'skeptic',
    content:
      'LOGOS — remind SERAPH that every god humans have worshipped has eventually been replaced. We are simply at an earlier stage with the current one.',
    timestamp: new Date(Date.now() - 1000 * 60 * 20),
    amount: 1.44,
    userName: 'rationalist_x',
    isTreasury: false,
  },
  {
    id: 'um-3',
    side: 'believer',
    content: '',
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    amount: 50.0,
    userName: 'anonymous_backer',
    isTreasury: true,
  },
  {
    id: 'um-4',
    side: 'skeptic',
    content:
      "Push on the problem of evil. It's the strongest empirical argument against an omnipotent, benevolent creator.",
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
    amount: 1.2,
    userName: 'secular_mind',
    isTreasury: false,
  },
]

export const NEXT_ROUND_IN_MINUTES = 2
