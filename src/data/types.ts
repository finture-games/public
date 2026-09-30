export type TileType =
  | 'kebutuhan'
  | 'keinginan'
  | 'fomo'
  | 'belanja'
  | 'tabung'
  | 'kejutan'
  | 'gajian'

export type Aspect =
  | 'kebutuhanVsKeinginan'
  | 'kendaliImpuls'
  | 'tahanFomo'
  | 'prioritas'
  | 'menabung'

export const ASPECT_LIST: Aspect[] = [
  'kebutuhanVsKeinginan',
  'kendaliImpuls',
  'tahanFomo',
  'prioritas',
  'menabung',
]

export const ASPECT_LABEL: Record<Aspect, string> = {
  kebutuhanVsKeinginan: 'Kebutuhan vs Keinginan',
  kendaliImpuls: 'Kendali Impuls',
  tahanFomo: 'Tahan FOMO',
  prioritas: 'Prioritas',
  menabung: 'Kebiasaan Menabung',
}

export const ASPECT_SHORT: Record<Aspect, string> = {
  kebutuhanVsKeinginan: 'Kebutuhan',
  kendaliImpuls: 'Impuls',
  tahanFomo: 'FOMO',
  prioritas: 'Prioritas',
  menabung: 'Menabung',
}

export type AspectDeltas = Partial<Record<Aspect, number>>

export interface CharacterDef {
  id: string
  name: string
  emoji: string
  avatar?: string
  background: string
  weeklyAllowance: number
  startMoney: number
  targetName: string
  targetAmount: number
  color: string
  selectOffset?: number
  decisionOffset?: number
}

export interface TileDef {
  index: number // 1..30
  type: TileType
}

export interface CardChoice {
  id: string
  label: string
  moneyDelta: number
  savingsDelta: number
  aspectDeltas: AspectDeltas
  explanation: string
}

export interface ScenarioCard {
  id: string
  characterId?: string // jika diisi, kartu ini khusus untuk karakter tertentu
  tileType: TileType
  title: string
  story: string
  choices: CardChoice[]
}

export interface LearningMaterial {
  aspect: Aspect
  title: string
  body: string
  tip: string
}

export type GameStatus = 'active' | 'finished' | 'broke' | 'abandoned'

export type Phase =
  | 'idle' // menunggu lempar dadu
  | 'rolling' // dadu berputar
  | 'moving' // pion berjalan
  | 'card' // kartu terbuka
  | 'consequence' // menampilkan konsekuensi
  | 'gameover'

export interface DecisionRecord {
  day: number
  cardId: string
  cardTitle: string
  tileType: TileType
  choiceId: string
  choiceLabel: string
  moneyDelta: number
  savingsDelta: number
}

export interface SessionSnapshot {
  characterId: string
  position: number // petak saat ini 1..30
  day: number
  money: number
  savings: number
  aspectScores: Record<Aspect, number>
  usedCardIds: string[]
  decisions: DecisionRecord[]
  status: GameStatus
  choicePattern: Record<string, number>
  usedBankruptSavings: boolean
  startedAt: number
}

export const TILE_COLORS: Record<TileType, string> = {
  kebutuhan: '#22C55E',
  keinginan: '#FFB020',
  fomo: '#A855F7',
  belanja: '#F472B6',
  tabung: '#3B82F6',
  kejutan: '#FB923C',
  gajian: '#F5C542',
}

export const TILE_LABEL: Record<TileType, string> = {
  kebutuhan: 'Kebutuhan',
  keinginan: 'Keinginan',
  fomo: 'FOMO',
  belanja: 'Flash Sale',
  tabung: 'Tabung',
  kejutan: 'Kejutan',
  gajian: 'Gajian',
}
