import { motion } from 'framer-motion'
import { formatRp } from '../lib/format'
import { projectionForPattern } from '../lib/engine'
import type { TileType } from '../data/types'
import { TILE_LABEL } from '../data/types'
import Button from './Button'

export default function RiskWarning({
  tileType,
  decisions,
  onContinue,
}: {
  tileType: TileType
  decisions: { day: number; moneyDelta: number; tileType: TileType }[]
  onContinue: () => void
}) {
  const proj = projectionForPattern(tileType, decisions as never)
  return (
    <div className="absolute inset-0 z-50 bg-ink/70 flex items-end">
      <motion.div
        initial={{ y: 200 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 240 }}
        className="w-full bg-ink text-white rounded-t-card px-5 pb-6 pt-5"
      >
        <div className="text-3xl">⛈️</div>
        <h3 className="mt-1 font-display font-semibold text-xl text-secondary">
          Awan badai terlihat...
        </h3>
        <p className="mt-1 text-sm text-white/80 leading-relaxed">
          Kamu sudah <b>3x</b> mengambil keputusan boros atau impulsif pada {TILE_LABEL[tileType].toLowerCase()}. Kalau
          pola ini terus berlanjut, begini proyeksinya:
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-chunky bg-white/10 px-3 py-2">
            <div className="text-[11px] text-white/60">Dalam 1 bulan</div>
            <div className="font-display font-semibold text-danger text-lg">
              {formatRp(proj.month)}
            </div>
          </div>
          <div className="rounded-chunky bg-white/10 px-3 py-2">
            <div className="text-[11px] text-white/60">Dalam 1 tahun</div>
            <div className="font-display font-semibold text-danger text-lg">
              {formatRp(proj.year)}
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-white/60">
          Uang sebesar itu bisa ganti tabungan targetmu. Coba atur ulang strategi!
        </p>
        <Button variant="secondary" className="mt-4 w-full" onClick={onContinue}>
          Aku mengerti
        </Button>
      </motion.div>
    </div>
  )
}
