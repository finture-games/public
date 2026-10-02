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
  private currentBgmTrack: string | null = null
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
        this.bgmAudio.src = '' // Unload audio resource from browser memory immediately
      } catch {
        // Ignore audio cleanup errors
      }
      this.bgmAudio = null
    }
    this.currentBgmTrack = null
  }

  public playBGM(track: BGMTrack = 'menu'): void {
    if (this.currentBgmTrack === track && this.bgmAudio && !this.bgmAudio.paused) {
      return
    }

    // Synchronously stop and unload any existing BGM track before switching
    this.stopBGM()

    this.currentBgmTrack = track
    if (this.muted) return

    const trackWav = assetUrl(`/sounds/bgm_${track}.wav`)
    const trackMp3 = assetUrl(`/sounds/bgm_${track}.mp3`)
    const audio = new Audio(trackWav)
    audio.loop = true
    audio.volume = 0.35

    // Set synchronous reference immediately to avoid async race condition overlaps
    this.bgmAudio = audio

    const targetTrack = track

    audio.play().catch(() => {
      // Fallback to mp3 if wav failed
      if (this.currentBgmTrack === targetTrack && this.bgmAudio === audio) {
        const fallbackMp3 = new Audio(trackMp3)
        fallbackMp3.loop = true
        fallbackMp3.volume = 0.35
        this.bgmAudio = fallbackMp3
        fallbackMp3.play().catch(() => {})
      }
    })
  }

  public playBGMForCharacter(characterId: string): void {
    this.playBGM(characterId)
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
      const track = this.currentBgmTrack || 'menu'
      this.playBGM(track)
    }
  }
}

export const soundManager = new SoundManager()
