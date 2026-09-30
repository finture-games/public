import { BOARD } from '../data/characters'
import type { Aspect, CardChoice, ScenarioCard, SessionSnapshot, TileType } from '../data/types'
import { ASPECT_LIST } from '../data/types'

export const AVG_ASPECT_WEIGHT = 0.7
export const TARGET_WEIGHT = 0.3
export const BAILOUT_AMOUNT = 50000
export const BROKE_ASPECT_PENALTY = 8

export function rollDice(): 1 | 2 | 3 {
  const r = Math.random()
  if (r < 0.25) return 1
  if (r < 0.75) return 2
  return 3
}

export function clampAspect(v: number): number {
  return Math.max(0, Math.min(100, v))
}

export function targetPct(money: number, targetAmount: number): number {
  if (targetAmount <= 0) return 0
  return Math.min(100, Math.max(0, (money / targetAmount) * 100))
}

export function totalScore(snapshot: {
  aspectScores: Record<Aspect, number>
  money: number
  targetAmount: number
}): number {
  const avg = ASPECT_LIST.reduce((s, a) => s + snapshot.aspectScores[a], 0) / ASPECT_LIST.length
  const tp = targetPct(snapshot.money, snapshot.targetAmount)
  return Math.max(0, Math.min(100, avg * AVG_ASPECT_WEIGHT + tp * TARGET_WEIGHT))
}

export function profileLabel(score: number): string {
  if (score < 40) return 'Si Boros'
  if (score < 60) return 'Si Galau'
  if (score < 80) return 'Si Cermat'
  return 'Si Bijak Finansial'
}

export function weakestAspect(aspectScores: Record<Aspect, number>): Aspect {
  let worst: Aspect = ASPECT_LIST[0]
  for (const a of ASPECT_LIST) {
    if (aspectScores[a] < aspectScores[worst]) worst = a
  }
  return worst
}

export const ASPECT_FOR_TYPE: Record<TileType, Aspect> = {
  kebutuhan: 'prioritas',
  keinginan: 'kebutuhanVsKeinginan',
  fomo: 'tahanFomo',
  belanja: 'kendaliImpuls',
  tabung: 'menabung',
  kejutan: 'prioritas',
  gajian: 'prioritas',
}

export function projectionForPattern(
  tileType: TileType,
  decisions: SessionSnapshot['decisions'],
): { spent: number; perDay: number; month: number; year: number } {
  const spent = decisions
    .filter((d) => d.tileType === tileType && d.moneyDelta < 0)
    .reduce((s, d) => s + Math.abs(d.moneyDelta), 0)
  const day = Math.max(1, decisions.length > 0 ? decisions[decisions.length - 1].day : 1)
  const perDay = spent / day
  return { spent, perDay, month: perDay * 30, year: perDay * 365 }
}

export function applyChoice(
  snapshot: SessionSnapshot,
  card: ScenarioCard,
  choice: CardChoice,
): SessionSnapshot {
  const aspectScores = { ...snapshot.aspectScores }
  for (const k of ASPECT_LIST) {
    const delta = choice.aspectDeltas[k]
    if (delta) aspectScores[k] = clampAspect(aspectScores[k] + delta)
  }
  const netDelta = choice.moneyDelta + choice.savingsDelta
  const money = snapshot.money + netDelta
  const decision = {
    day: snapshot.day,
    cardId: card.id,
    cardTitle: card.title,
    tileType: card.tileType,
    choiceId: choice.id,
    choiceLabel: choice.label,
    moneyDelta: netDelta,
    savingsDelta: 0,
  }
  const patternKey = card.tileType
  const isSpend = netDelta < 0
  return {
    ...snapshot,
    money,
    savings: 0,
    aspectScores,
    decisions: [...snapshot.decisions, decision],
    choicePattern: isSpend
      ? { ...snapshot.choicePattern, [patternKey]: (snapshot.choicePattern[patternKey] ?? 0) + 1 }
      : { ...snapshot.choicePattern },
  }
}

export function passGajian(from: number, to: number): number[] {
  const out: number[] = []
  for (let t = from + 1; t <= to; t++) {
    if (t <= 30 && BOARD[t - 1].type === 'gajian') out.push(t)
  }
  return out
}

export function isBrokeNow(snapshot: SessionSnapshot, tileType: TileType): boolean {
  return tileType === 'kebutuhan' && snapshot.money <= 0
}

export function needsBankruptChoice(_snapshot: SessionSnapshot, _tileType: TileType): boolean {
  return false
}

export const GAJIAN_TILES = BOARD.filter((t) => t.type === 'gajian').map((t) => t.index)
