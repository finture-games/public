import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CHARACTERS } from '../data/characters'
import type { Aspect, DecisionRecord, GameStatus, Phase, ScenarioCard, SessionSnapshot, TileType } from '../data/types'
import { ASPECT_LIST } from '../data/types'
import type { AuthUser, Profile, SessionSummary, Settings } from '../lib/types-extra'
import {
  applyChoice,
  BROKE_ASPECT_PENALTY,
  BAILOUT_AMOUNT,
  clampAspect,
  isBrokeNow,
  isRiskyChoice,
  needsBankruptChoice,
  profileLabel,
  targetPct,
  totalScore,
} from '../lib/engine'
import { insertDecision, syncSession } from '../lib/supabaseSync'
import { saveSessionToFirebase, saveDecisionToFirebase, loadLatestSessionFromFirebase, loadUserHistoryFromFirebase } from '../lib/firebaseSync'

export type Screen =
  | 'splash'
  | 'login'
  | 'consent'
  | 'home'
  | 'rules'
  | 'character'
  | 'game'
  | 'result'
  | 'reflection'
  | 'evaluation'
  | 'history'
  | 'profile'

interface Toast {
  id: number
  text: string
  tone: 'positive' | 'negative' | 'info'
}

export interface CharOffset {
  top: number
  left: number
  scale: number
}

interface GameState {
  screen: Screen
  authUser: AuthUser | null
  authProvider: 'google' | 'magic' | 'guest' | null
  profile: Profile
  settings: Settings
  sessionId: string | null
  session: SessionSnapshot | null
  history: SessionSummary[]
  phase: Phase
  diceValue: number
  currentCard: ScenarioCard | null
  lastDecision: DecisionRecord | null
  pendingRisk: TileType | null
  toasts: Toast[]
  reflectionAnswers: Record<string, string>
  paydayTrigger: number
  lastPaydayAmount: number
  customOffsets: Record<string, CharOffset>

  navigate: (s: Screen) => void
  triggerPayday: (amount: number) => void
  setAuth: (u: AuthUser | null, provider: 'google' | 'magic' | 'guest' | null) => void
  loadUserCloudData: (userId: string) => Promise<boolean>
  updateProfile: (p: Partial<Profile>) => void
  updateSettings: (s: Partial<Settings>) => void
  setCustomOffset: (charId: string, offset: Partial<CharOffset>) => void
  resetCustomOffsets: () => void
  startNewSession: (characterId: string) => void
  continueSession: () => void
  abandonSession: () => void
  setPhase: (p: Phase) => void
  setDice: (v: number) => void
  moveTo: (position: number) => void
  addMoney: (amount: number) => void
  pushToast: (text: string, tone?: Toast['tone']) => void
  drawCard: (card: ScenarioCard) => void
  choose: (choiceId: string) => void
  useBankruptSavings: () => void
  endSession: (status: GameStatus) => void
  setReflection: (k: string, v: string) => void
  finishReflection: () => void
  dismissRisk: () => void
}

const DEFAULT_PROFILE: Profile = { nickname: '', school: '', avatar: '🦊' }
const DEFAULT_SETTINGS: Settings = {
  consentGiven: false,
  reduceMotion: false,
  sound: true,
  haptics: true,
}

let toastId = 1

function freshSnapshot(characterId: string): SessionSnapshot {
  const ch = CHARACTERS.find((c) => c.id === characterId) ?? CHARACTERS[0]
  const aspectScores = {} as Record<Aspect, number>
  for (const a of ASPECT_LIST) aspectScores[a] = 50
  return {
    characterId,
    position: 1,
    day: 1,
    money: ch.startMoney,
    savings: 0,
    aspectScores,
    usedCardIds: [],
    decisions: [],
    status: 'active',
    choicePattern: {},
    usedBankruptSavings: false,
    startedAt: Date.now(),
  }
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      screen: 'splash',
      authUser: null,
      authProvider: null,
      profile: DEFAULT_PROFILE,
      settings: DEFAULT_SETTINGS,
      sessionId: null,
      session: null,
      history: [],
      phase: 'idle',
      diceValue: 1,
      currentCard: null,
      lastDecision: null,
      pendingRisk: null,
      toasts: [],
      reflectionAnswers: {},
      paydayTrigger: 0,
      lastPaydayAmount: 0,
      customOffsets: {},

      navigate: (s) => set({ screen: s }),

      triggerPayday: (amount) =>
        set((st) => {
          const updatedSession = st.session
            ? { ...st.session, money: st.session.money + amount }
            : null
          if (st.authUser?.id && st.sessionId && updatedSession) {
            void saveSessionToFirebase(st.authUser.id, st.sessionId, updatedSession)
          }
          return {
            paydayTrigger: Date.now(),
            lastPaydayAmount: amount,
            session: updatedSession,
          }
        }),

      setAuth: (u, provider) =>
        set(() => ({
          authUser: u,
          authProvider: provider,
          ...(u === null ? { sessionId: null, session: null, history: [] } : {}),
        })),

      loadUserCloudData: async (userId: string) => {
        try {
          const cloudSession = await loadLatestSessionFromFirebase(userId)
          const cloudHistory = await loadUserHistoryFromFirebase(userId)
          if (cloudSession) {
            set({
              sessionId: cloudSession.sessionId,
              session: cloudSession.snapshot,
              ...(cloudHistory.length > 0 ? { history: cloudHistory } : {}),
            })
            return true
          } else if (cloudHistory.length > 0) {
            set({ history: cloudHistory })
          }
          return false
        } catch (err) {
          console.warn('Gagal loadUserCloudData:', err)
          return false
        }
      },

      updateProfile: (p) => set((st) => ({ profile: { ...st.profile, ...p } })),

      updateSettings: (s) => set((st) => ({ settings: { ...st.settings, ...s } })),

      setCustomOffset: (charId, offset) =>
        set((st) => {
          const current = st.customOffsets[charId] || { top: -72, left: 10, scale: 1 }
          return {
            customOffsets: {
              ...st.customOffsets,
              [charId]: { ...current, ...offset },
            },
          }
        }),

      resetCustomOffsets: () => set({ customOffsets: {} }),

      startNewSession: (characterId) => {
        const sessionId = 'ses-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
        set({
          sessionId,
          session: freshSnapshot(characterId),
          phase: 'idle',
          diceValue: 1,
          currentCard: null,
          lastDecision: null,
          pendingRisk: null,
          toasts: [],
          reflectionAnswers: {},
          screen: 'game',
        })
        void syncSession(get().authUser, sessionId, get().session!)
        if (get().authUser?.id) {
          void saveSessionToFirebase(get().authUser!.id, sessionId, get().session!)
        }
      },

      continueSession: () => {
        set({ phase: 'idle', currentCard: null, pendingRisk: null, screen: 'game' })
      },

      abandonSession: () => {
        set({ sessionId: null, session: null, phase: 'idle', currentCard: null, screen: 'home' })
      },

      setPhase: (p) => set({ phase: p }),
      setDice: (v) => set({ diceValue: v }),

      moveTo: (position) =>
        set((st) =>
          st.session
            ? { session: { ...st.session, position, day: position } }
            : {},
        ),

      addMoney: (amount) =>
        set((st) =>
          st.session
            ? { session: { ...st.session, money: st.session.money + amount } }
            : {},
        ),

      pushToast: (text, tone = 'info') => {
        const id = toastId++
        set((st) => ({ toasts: [...st.toasts, { id, text, tone }] }))
        setTimeout(() => {
          set((st) => ({ toasts: st.toasts.filter((t) => t.id !== id) }))
        }, 2600)
      },

      drawCard: (card) =>
        set((st) => ({
          currentCard: card,
          phase: 'card',
          session: st.session
            ? { ...st.session, usedCardIds: [...st.session.usedCardIds, card.id] }
            : null,
        })),

      choose: (choiceId) => {
        const st = get()
        if (!st.session || !st.currentCard) return
        const choice = st.currentCard.choices.find((c) => c.id === choiceId)
        if (!choice) return
        const updated = applyChoice(st.session, st.currentCard, choice)
        const pattern = updated.choicePattern[st.currentCard.tileType] ?? 0
        const isRisky = isRiskyChoice(st.currentCard, choice)
        const risk =
          pattern >= 3 && isRisky
            ? st.currentCard.tileType
            : st.pendingRisk
        set({
          session: updated,
          lastDecision: updated.decisions[updated.decisions.length - 1],
          phase: 'consequence',
          pendingRisk: risk,
        })
        void insertDecision(st.authUser, st.sessionId ?? '', {
          day: updated.day,
          cardId: st.currentCard.id,
          choiceId: choice.id,
        })
        void syncSession(st.authUser, st.sessionId ?? '', updated)
        if (st.authUser?.id) {
          const lastDec = updated.decisions[updated.decisions.length - 1]
          void saveSessionToFirebase(st.authUser.id, st.sessionId ?? '', updated)
          if (lastDec) {
            void saveDecisionToFirebase(st.authUser.id, st.sessionId ?? '', lastDec)
          }
        }
      },

      useBankruptSavings: () => {
        const st = get()
        if (!st.session) return
        const amount = Math.min(BAILOUT_AMOUNT, st.session.savings)
        const aspectScores = { ...st.session.aspectScores }
        aspectScores.prioritas = clampAspect(aspectScores.prioritas - BROKE_ASPECT_PENALTY)
        set({
          session: {
            ...st.session,
            money: st.session.money + amount,
            savings: st.session.savings - amount,
            aspectScores,
            usedBankruptSavings: true,
          },
        })
        get().pushToast(
          'Dana darurat dipakai! Prioritas -' + BROKE_ASPECT_PENALTY,
          'negative',
        )
      },

      endSession: (status) => {
        const st = get()
        if (!st.session) return
        const ch = CHARACTERS.find((c) => c.id === st.session!.characterId) ?? CHARACTERS[0]
        const score = totalScore({
          aspectScores: st.session.aspectScores,
          money: st.session.money,
          targetAmount: ch.targetAmount,
        })
        const summary: SessionSummary = {
          id: st.sessionId ?? 'ses',
          characterId: st.session.characterId,
          date: Date.now(),
          score,
          profileLabel: profileLabel(score),
          aspectScores: { ...st.session.aspectScores },
          money: st.session.money,
          savings: st.session.money,
          targetReached: st.session.money >= ch.targetAmount,
          targetName: ch.targetName,
          targetAmount: ch.targetAmount,
          decisionsCount: st.session.decisions.length,
          status,
        }
        set({
          session: { ...st.session, status },
          history: [summary, ...st.history].slice(0, 30),
          phase: 'gameover',
          screen: 'result',
          currentCard: null,
          pendingRisk: null,
        })
        void syncSession(st.authUser, st.sessionId ?? '', get().session!)
      },

      setReflection: (k, v) =>
        set((st) => ({ reflectionAnswers: { ...st.reflectionAnswers, [k]: v } })),

      finishReflection: () => {
        const st = get()
        const tp = st.session ? targetPct(st.session.savings, CHARACTERS.find((c) => c.id === st.session!.characterId)?.targetAmount ?? 1) : 0
        set({ screen: 'evaluation' })
        void tp
      },

      dismissRisk: () =>
        set((st) => ({
          pendingRisk: null,
          session:
            st.session && st.pendingRisk
              ? {
                  ...st.session,
                  choicePattern: { ...st.session.choicePattern, [st.pendingRisk]: 0 },
                }
              : st.session,
        })),
    }),
    {
      name: 'finture-game-v1',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.screen = 'splash'
        }
      },
      partialize: (st) =>
        ({
          authUser: st.authUser,
          authProvider: st.authProvider,
          profile: st.profile,
          settings: st.settings,
          sessionId: st.sessionId,
          session: st.session,
          history: st.history,
          reflectionAnswers: st.reflectionAnswers,
        }) as unknown as GameState,
    },
  ),
)

export function activeSessionExists(): boolean {
  const s = useGameStore.getState().session
  return Boolean(s && s.status === 'active')
}

export { isBrokeNow, needsBankruptChoice }
