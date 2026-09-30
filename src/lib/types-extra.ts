import type { Aspect, GameStatus } from '../data/types'

export interface SessionSummary {
  id: string
  characterId: string
  date: number
  score: number
  profileLabel: string
  aspectScores: Record<Aspect, number>
  money: number
  savings: number
  targetReached: boolean
  targetName: string
  targetAmount: number
  decisionsCount: number
  status: GameStatus
}

export interface Profile {
  nickname: string
  school: string
  avatar: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
}

export interface Settings {
  consentGiven: boolean
  reduceMotion: boolean
  sound: boolean
  haptics: boolean
}
