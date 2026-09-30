import type {
  CharacterDef,
  TileDef,
  TileType,
  ScenarioCard,
} from './types'
import { assetUrl } from '../lib/format'

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'alep',
    name: 'Alep',
    emoji: '🔴',
    avatar: assetUrl('/characters/alep/alep_half.png'),
    background: 'Anak santai, hobi nongkrong & jajan hemat',
    weeklyAllowance: 90000,
    startMoney: 0,
    targetName: 'Headset Gaming',
    targetAmount: 250000,
    color: '#EF4444',
  },
  {
    id: 'angel',
    name: 'Angel',
    emoji: '✨',
    avatar: assetUrl('/characters/angel/angel_half.png'),
    background: 'Beauty enthusiast, rajin catat pengeluaran',
    weeklyAllowance: 110000,
    startMoney: 0,
    targetName: 'Kemeja Hangout',
    targetAmount: 300000,
    color: '#F59E0B',
  },
  {
    id: 'alea',
    name: 'Alea',
    emoji: '☕',
    avatar: assetUrl('/characters/alea/alea_half.png'),
    background: 'Penikmat kopi & tren outfit viral',
    weeklyAllowance: 100000,
    startMoney: 0,
    targetName: 'Kamera Digital Vintage',
    targetAmount: 280000,
    color: '#3B82F6',
  },
  {
    id: 'wawan',
    name: 'Wawan',
    emoji: '👓',
    avatar: assetUrl('/characters/wawan/wawan_half.png'),
    background: 'Anak SMK rajin, hemat & paham instrumen investasi',
    weeklyAllowance: 130000,
    startMoney: 0,
    targetName: 'Keyboard Mekanikal',
    targetAmount: 320000,
    color: '#22C55E',
  },
  {
    id: 'mamad',
    name: 'Mamad',
    emoji: '👍',
    avatar: assetUrl('/characters/mamad/mamad_half.png'),
    background: 'Aktif berolahraga & sering ikut kegiatan kelas',
    weeklyAllowance: 120000,
    startMoney: 0,
    targetName: 'Sepatu Bola',
    targetAmount: 310000,
    color: '#6366F1',
  },
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const TILE_PLAN: TileType[] = [
  // 30 petak, index 1..30
  'kebutuhan',
  'keinginan',
  'gajian',
  'fomo',
  'kebutuhan',
  'tabung',
  'belanja',
  'gajian',
  'kejutan',
  'keinginan',
  'kebutuhan',
  'fomo',
  'tabung',
  'gajian',
  'belanja',
  'kebutuhan',
  'keinginan',
  'fomo',
  'kejutan',
  'gajian',
  'kebutuhan',
  'belanja',
  'tabung',
  'fomo',
  'keinginan',
  'kebutuhan',
  'kejutan',
  'belanja',
  'fomo',
  'keinginan',
]

export const BOARD: TileDef[] = TILE_PLAN.map((type, i) => ({
  index: i + 1,
  type,
}))

export function countTiles(type: TileType): number {
  return TILE_PLAN.filter((t) => t === type).length
}

export function randomCardForType(
  cards: ScenarioCard[],
  type: TileType,
  usedIds: string[],
  characterId?: string,
): ScenarioCard | undefined {
  // Filter 1: Matching tile type & valid for character
  // Filter 2: STRICTLY EXCLUDE cards in usedIds (Pasti TIDAK PERNAH muncul 2x!)
  const unused = cards.filter(
    (c) =>
      c.tileType === type &&
      (!c.characterId || c.characterId === characterId) &&
      !usedIds.includes(c.id),
  )

  if (unused.length === 0) {
    return undefined
  }

  // Jika karakter memiliki kartu khusus yang belum pernah dipakai di sesi ini, utamakan kartu tersebut!
  if (characterId) {
    const charSpecific = unused.filter((c) => c.characterId === characterId)
    if (charSpecific.length > 0) {
      return shuffle(charSpecific)[0]
    }
  }

  // Jika kartu khusus karakter sudah terpakai semua, ambil dari kartu umum yang belum dipakai
  const generalPool = unused.filter((c) => !c.characterId)
  const candidates = generalPool.length > 0 ? generalPool : unused
  return shuffle(candidates)[0]
}
