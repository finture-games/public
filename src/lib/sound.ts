import { assetUrl } from './format'

export type SoundEffect =
  | 'dice_roll'
  | 'step'
  | 'gajian_claim'
  | 'click'
  | 'positive'
  | 'negative'
  | 'win'

export type BGMTrack = 'menu' | 'game' | 'alep' | 'angel' | 'alea' | 'wawan' | 'mamad' | string

class SoundManager {
  private muted: boolean = false
  private bgmAudio: HTMLAudioElement | null = null
  private sfxCache: Map<string, HTMLAudioElement> = new Map()

  constructor() {
    const storedMute = localStorage.getItem('finture_sound_muted')
    this.muted = storedMute === 'true'
  }

  public isMuted(): boolean {
    return this.muted
  }

  public toggleMute(): boolean {
    this.muted = !this.muted
    localStorage.setItem('finture_sound_muted', String(this.muted))

    if (this.muted) {
      this.pauseBGM()
    }
    return this.muted
  }

  public setMuted(muted: boolean): void {
    this.muted = muted
    localStorage.setItem('finture_sound_muted', String(this.muted))
    if (this.muted) {
      this.pauseBGM()
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

  // BGM temporarily disabled per user request until final music tracks are selected
  public playBGM(_track: BGMTrack = 'menu'): void {
    this.stopBGM()
  }

  public playBGMForCharacter(_characterId: string): void {
    this.stopBGM()
  }

  public startBGM(): void {
    this.stopBGM()
  }

  public pauseBGM(): void {
    this.stopBGM()
  }

  public resumeBGM(): void {
    this.stopBGM()
  }
}

export const soundManager = new SoundManager()
