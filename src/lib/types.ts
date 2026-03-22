export type Side = 'believer' | 'skeptic'

export interface Agent {
  id: Side
  name: string
  title: string
  description: string
  currentThesis: string
  treasuryBalance: number
  supporterCount: number
  argumentCount: number
  momentumScore: number // 0-100
  color: string
  glowColor: string
}

export interface Argument {
  id: string
  side: Side
  content: string
  timestamp: Date
  roundNumber: number
  isUserSubmitted?: boolean
  userName?: string
}

export interface DebateRound {
  roundNumber: number
  timestamp: Date
  believerArgument: Argument
  skepticArgument: Argument
  conclusion: DebateConclusion
  userMessages?: UserMessage[]
}

export interface DebateConclusion {
  status: string
  detail: string
  leader: Side | 'tied'
  logicScore: { believer: number; skeptic: number }
  publicSupportLeader: Side
}

export interface UserMessage {
  id: string
  side: Side
  content: string
  timestamp: Date
  amount: number
  userName: string
  isTreasury: boolean
}

export interface UserState {
  believerMessageCount: number
  skepticMessageCount: number
  selectedSide: Side | null
}
