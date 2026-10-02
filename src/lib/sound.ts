import { assetUrl } from './format'

export type SoundEffect =
  | 'dice_roll'
  | 'step'
  | 'gajian_claim'
  | 'click'
  | 'positive'
  | 'negative'
  | 'win'

export type BGMTrack = 'menu' | 'game' | string

class SoundManager {
  private muted: boolean = false
  private bgmAudio: HTMLAudioElement | null = null
  private currentBgmTrack: string | null = null
  private sfxCache: Map<string, HTMLAudioElement> = new Map()

  constructor() {
    const storedMute = localStorage.getItem('finture_sound_muted')
    this.muted = storedMute === 'true'

    if (typeof window !== 'undefined') {
      const unlock = () => {
        if (this.bgmAudio && this.bgmAudio.paused && !this.muted) {
          this.bgmAudio.play().catch(() => {})
        } else if (!this.bgmAudio && !this.muted) {
          this.playBGM(this.currentBgmTrack || 'menu')
        }
        window.removeEventListener('click', unlock)
        window.removeEventListener('touchstart', unlock)
        window.removeEventListener('pointerdown', unlock)
      }

      window.addEventListener('click', unlock, { passive: true })
      window.addEventListener('touchstart', unlock, { passive: true })
      window.addEventListener('pointerdown', unlock, { passive: true })
    }
  }

  public isMuted(): boolean {
    return this.muted
  }

  public toggleMute(): boolean {
    this.muted = !this.muted
    localStorage.setItem('finture_sound_muted', String(this.muted))

    if (this.muted) {
      this.pauseBGM()
    } else {
      this.resumeBGM()
    }
    return this.muted
  }

  public setMuted(muted: boolean): void {
    this.muted = muted
    localStorage.setItem('finture_sound_muted', String(this.muted))
    if (this.muted) {
      this.pauseBGM()
    } else {
      this.resumeBGM()
    }
  }

  private getAudio(name: string): HTMLAudioElement {
    if (!this.sfxCache.has(name)) {
      const url = assetUrl(`/sounds/${name}.mp3`)
      const audio = new Audio(url)
      this.sfxCache.set(name, audio)
    }
    const cached = this.sfxCache.get(name)!
    const clone = cached.cloneNode() as HTMLAudioElement
    clone.volume = 0.75
    return clone
  }

  public playSFX(name: SoundEffect): void {
    if (this.muted) return
    try {
      const audio = this.getAudio(name)
      audio.currentTime = 0
      audio.play().catch(() => {})
    } catch {
      // Ignore audio playback errors
    }
  }

  public stopBGM(): void {
    if (this.bgmAudio) {
      try {
        this.bgmAudio.pause()
        this.bgmAudio.currentTime = 0
        this.bgmAudio.src = ''
      } catch {
        // Ignore audio cleanup errors
      }
      this.bgmAudio = null
    }
  }

  public playBGM(track: BGMTrack = 'menu'): void {
    const targetFile = track === 'game' ? 'bgm_game' : 'bgm_menu'
    this.currentBgmTrack = targetFile

    if (this.bgmAudio && this.bgmAudio.src.includes(targetFile) && !this.bgmAudio.paused) {
      return
    }

    this.stopBGM()
    if (this.muted) return

    const trackMp3 = assetUrl(`/sounds/${targetFile}.mp3`)
    const audio = new Audio(trackMp3)
    audio.loop = true
    audio.volume = 0.45

    this.bgmAudio = audio

    // Try playing audio (will succeed immediately if unlocked or on first user click)
    audio.play().catch(() => {
      // Browser autoplay policy blocked autoplay; will resume on first click/touch
    })
  }

  public playBGMForCharacter(_characterId: string): void {
    this.playBGM('game')
  }

  public startBGM(): void {
    this.playBGM('menu')
  }

  public pauseBGM(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause()
    }
  }

  public resumeBGM(): void {
    if (this.muted) return
    if (this.bgmAudio && this.bgmAudio.paused) {
      this.bgmAudio.play().catch(() => {})
    } else if (!this.bgmAudio) {
      const track = this.currentBgmTrack || 'bgm_menu'
      this.playBGM(track)
    }
  }
}

export const soundManager = new SoundManager()
