import type { ReactNode } from 'react'
import { useGameStore } from '../store/game'

export default function PhoneFrame({ children }: { children: ReactNode }) {
  const screen = useGameStore((s) => s.screen)
  const isImmersive = screen === 'game' || screen === 'splash' || screen === 'login' || screen === 'character'
  return (
    <div className={'w-full bg-[#C7DBFF] flex justify-center ' + (isImmersive ? 'h-[100dvh] overflow-hidden' : 'min-h-screen')}>
      <div
        className={
          'w-full max-w-[430px] bg-gradient-to-b from-sky to-[#C7DBFF] relative overflow-hidden ' +
          (isImmersive
            ? 'h-[100dvh] md:rounded-none md:shadow-none'
            : 'min-h-[100dvh] md:my-4 md:min-h-[860px] md:rounded-[32px] md:shadow-2xl')
        }
      >
        {children}
      </div>
    </div>
  )
}
