import { Scene } from 'phaser';

export type SfxType = 'pickup' | 'click' | 'success' | 'error' | 'door' | 'light' | 'win' | 'lose';

export class AudioManager {
  private static instance: AudioManager;
  private scene: Scene | null = null;
  private bgm: Phaser.Sound.BaseSound | null = null;
  private bgmEnabled = true;
  private sfxEnabled = true;
  private bgmVolume = 0.3;
  private sfxVolume = 0.6;

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public setScene(scene: Scene): void {
    this.scene = scene;
  }

  public playBgm(): void {
    if (!this.scene || !this.bgmEnabled) return;

    if (this.bgm && this.bgm.isPlaying) return;

    try {
      if (this.scene.cache.audio.exists('bgm_ambient')) {
        const sound = this.scene.sound.add('bgm_ambient', {
          loop: true,
          volume: this.bgmVolume
        }) as Phaser.Sound.BaseSound;
        this.bgm = sound;
        if (this.bgm) {
          this.bgm.play();
        }
      }
    } catch (e) {
      console.warn('BGM 播放失败（资源未加载，使用静音模式）:', e);
    }
  }

  public stopBgm(): void {
    if (this.bgm && this.bgm.isPlaying) {
      this.bgm.stop();
      this.bgm.destroy();
      this.bgm = null;
    }
  }

  public playSfx(type: SfxType): void {
    if (!this.scene || !this.sfxEnabled) return;

    const keyMap: Record<SfxType, string> = {
      pickup: 'sfx_pickup',
      click: 'sfx_click',
      success: 'sfx_success',
      error: 'sfx_error',
      door: 'sfx_door',
      light: 'sfx_light',
      win: 'sfx_win',
      lose: 'sfx_lose'
    };

    const key = keyMap[type];
    try {
      if (this.scene.cache.audio.exists(key)) {
        this.scene.sound.play(key, { volume: this.sfxVolume });
      }
    } catch (e) {
      console.warn(`SFX 播放失败 ${key}:`, e);
    }
  }

  public setBgmEnabled(enabled: boolean): void {
    this.bgmEnabled = enabled;
    if (!enabled) {
      this.stopBgm();
    } else {
      this.playBgm();
    }
    this.saveSettings();
  }

  public setSfxEnabled(enabled: boolean): void {
    this.sfxEnabled = enabled;
    this.saveSettings();
  }

  public setBgmVolume(vol: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    if (this.bgm && 'setVolume' in this.bgm) {
      (this.bgm as Phaser.Sound.WebAudioSound).setVolume(this.bgmVolume);
    }
    this.saveSettings();
  }

  public setSfxVolume(vol: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    this.saveSettings();
  }

  public isBgmEnabled(): boolean {
    return this.bgmEnabled;
  }

  public isSfxEnabled(): boolean {
    return this.sfxEnabled;
  }

  public getBgmVolume(): number {
    return this.bgmVolume;
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(
        'audio_settings',
        JSON.stringify({
          bgmEnabled: this.bgmEnabled,
          sfxEnabled: this.sfxEnabled,
          bgmVolume: this.bgmVolume,
          sfxVolume: this.sfxVolume
        })
      );
    } catch (e) {}
  }

  public loadSettings(): void {
    try {
      const raw = localStorage.getItem('audio_settings');
      if (raw) {
        const s = JSON.parse(raw);
        this.bgmEnabled = s.bgmEnabled ?? true;
        this.sfxEnabled = s.sfxEnabled ?? true;
        this.bgmVolume = s.bgmVolume ?? 0.3;
        this.sfxVolume = s.sfxVolume ?? 0.6;
      }
    } catch (e) {}
  }
}
