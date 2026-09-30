import type { ScenarioCard } from './types'
import { ALEP_CARDS } from './cards/alep'
import { ANGEL_CARDS } from './cards/angel'
import { ALEA_CARDS } from './cards/alea'
import { WAWAN_CARDS } from './cards/wawan'
import { MAMAD_CARDS } from './cards/mamad'

export const SCENARIO_CARDS: ScenarioCard[] = [
  ...ALEP_CARDS,
  ...ANGEL_CARDS,
  ...ALEA_CARDS,
  ...WAWAN_CARDS,
  ...MAMAD_CARDS,
]
