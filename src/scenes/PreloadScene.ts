import { Scene } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, SCENES } from '@/config/levels';

export class PreloadScene extends Scene {
  private progressBar: Phaser.GameObjects.Graphics | null = null;
  private progressBox: Phaser.GameObjects.Graphics | null = null;
  private loadingText: Phaser.GameObjects.Text | null = null;
  private percentText: Phaser.GameObjects.Text | null = null;
  private assetText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    this.createLoadingUI();
    this.generateProceduralGraphics();
    this.generateAudio();
    this.setupLoadEvents();
  }

  private createLoadingUI(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x0a0a0a).setOrigin(0, 0);

    this.add.text(cx, cy - 120, '废弃剧场', {
      fontFamily: 'Georgia, serif',
      fontSize: '48px',
      color: '#c9a44c'
    }).setOrigin(0.5);

    this.add.text(cx, cy - 70, 'Abandoned Theater', {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: '#666666',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    this.progressBox = this.add.graphics();
    this.progressBox.fillStyle(0x222222, 1);
    this.progressBox.fillRoundedRect(cx - 160, cy, 320, 30, 6);
    this.progressBox.lineStyle(2, 0xc9a44c, 1);
    this.progressBox.strokeRoundedRect(cx - 160, cy, 320, 30, 6);

    this.progressBar = this.add.graphics();

    this.loadingText = this.add.text(cx, cy - 30, '加载中...', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '18px',
      color: '#cccccc'
    }).setOrigin(0.5);

    this.percentText = this.add.text(cx, cy + 15, '0%', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '14px',
      color: '#c9a44c'
    }).setOrigin(0.5);

    this.assetText = this.add.text(cx, cy + 60, '', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '12px',
      color: '#888888'
    }).setOrigin(0.5);
  }

  private generateProceduralGraphics(): void {
    this.generateBackgrounds();
    this.generateObjects();
  }

  private generateBackgrounds(): void {
    const backgrounds: { key: string; bg: number; accent: number }[] = [
      { key: 'bg_lobby', bg: 0x1a0a0a, accent: 0x8b0000 },
      { key: 'bg_auditorium', bg: 0x0a1a1a, accent: 0x006400 },
      { key: 'bg_projection', bg: 0x111122, accent: 0x4169e1 },
      { key: 'bg_backstage', bg: 0x221a0a, accent: 0xb8860b }
    ];

    backgrounds.forEach(({ key, bg, accent }) => {
      const g = this.add.graphics();
      g.destroy();

      const tex = this.textures.createCanvas(key, GAME_WIDTH, GAME_HEIGHT);
      const ctx = tex!.getContext();

      const bR = (bg >> 16) & 0xff;
      const bG = (bg >> 8) & 0xff;
      const bB = bg & 0xff;
      ctx.fillStyle = `rgb(${bR},${bG},${bB})`;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      for (let i = 0; i < 15; i++) {
        const r = Math.floor(Math.random() * 255);
        ctx.fillStyle = `rgba(${Math.min(255, bR + 30)},${Math.min(255, bG + 20)},${Math.min(255, bB + 10)},${Math.random() * 0.08 + 0.02})`;
        ctx.beginPath();
        ctx.arc(
          Math.random() * GAME_WIDTH,
          Math.random() * GAME_HEIGHT,
          Math.random() * 100 + 50,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      const aR = (accent >> 16) & 0xff;
      const aG = (accent >> 8) & 0xff;
      const aB = accent & 0xff;
      ctx.strokeStyle = `rgba(${aR},${aG},${aB},0.15)`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, GAME_HEIGHT * (i + 1) / 6);
        ctx.lineTo(GAME_WIDTH, GAME_HEIGHT * (i + 1) / 6);
        ctx.stroke();
      }

      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`;
        ctx.fillRect(
          Math.random() * GAME_WIDTH,
          Math.random() * GAME_HEIGHT,
          2,
          2
        );
      }

      tex!.refresh();
      g.destroy();
    });
  }

  private generateObjects(): void {
    const objects = [
      'obj_poster', 'obj_counter', 'obj_panel', 'obj_junk',
      'obj_door', 'obj_seat', 'obj_door_small', 'obj_door_silver',
      'obj_exit_sign', 'obj_projector', 'obj_shelf', 'obj_desk',
      'obj_vanity', 'obj_spotlight_panel', 'obj_final_door'
    ];

    objects.forEach(key => {
      this.generateObjectTexture(key);
    });
  }

  private generateObjectTexture(key: string): void {
    const sizeMap: Record<string, { w: number; h: number; color: number; type: string }> = {
      obj_poster: { w: 100, h: 150, color: 0x8b4513, type: 'poster' },
      obj_counter: { w: 180, h: 100, color: 0x654321, type: 'counter' },
      obj_panel: { w: 120, h: 160, color: 0x333333, type: 'panel' },
      obj_junk: { w: 80, h: 60, color: 0x555555, type: 'junk' },
      obj_door: { w: 80, h: 150, color: 0x4a2810, type: 'door' },
      obj_seat: { w: 60, h: 80, color: 0x8b0000, type: 'seat' },
      obj_door_small: { w: 70, h: 130, color: 0x4a2810, type: 'door' },
      obj_door_silver: { w: 70, h: 140, color: 0x696969, type: 'door' },
      obj_exit_sign: { w: 100, h: 60, color: 0x228b22, type: 'sign' },
      obj_projector: { w: 160, h: 140, color: 0x2f2f2f, type: 'projector' },
      obj_shelf: { w: 100, h: 200, color: 0x5c4033, type: 'shelf' },
      obj_desk: { w: 120, h: 80, color: 0x8b4513, type: 'desk' },
      obj_vanity: { w: 140, h: 100, color: 0xd4af37, type: 'vanity' },
      obj_spotlight_panel: { w: 140, h: 180, color: 0x1a1a2e, type: 'panel' },
      obj_final_door: { w: 100, h: 180, color: 0xd4af37, type: 'door' }
    };

    const cfg = sizeMap[key];
    if (!cfg) {
      this.textures.createCanvas(key, 100, 100);
      return;
    }

    const tex = this.textures.createCanvas(key, cfg.w, cfg.h);
    const ctx = tex!.getContext();
    const r = (cfg.color >> 16) & 0xff;
    const g = (cfg.color >> 8) & 0xff;
    const b = cfg.color & 0xff;

    this.roundRect(ctx, 0, 0, cfg.w, cfg.h, 8);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fill();

    ctx.strokeStyle = `rgba(255,255,255,0.3)`;
    ctx.lineWidth = 2;
    this.roundRect(ctx, 0, 0, cfg.w, cfg.h, 8);
    ctx.stroke();

    ctx.fillStyle = `rgba(255,255,255,0.08)`;
    this.roundRect(ctx, 4, 4, cfg.w - 8, cfg.h / 2 - 6, 6);
    ctx.fill();

    this.drawObjectDetails(ctx, cfg.type, cfg.w, cfg.h);

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.font = '10px Microsoft YaHei';
    ctx.textAlign = 'center';
    const labelMap: Record<string, string> = {
      poster: '海报', counter: '柜台', panel: '控制面板', junk: '杂物',
      door: '门', seat: '座位', sign: '返回', projector: '放映机',
      shelf: '胶片架', desk: '办公桌', vanity: '化妆台'
    };
    if (labelMap[cfg.type]) {
      ctx.fillText(labelMap[cfg.type], cfg.w / 2, cfg.h - 8);
    }

    tex!.refresh();
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  private drawObjectDetails(ctx: CanvasRenderingContext2D, type: string, w: number, h: number): void {
    switch (type) {
      case 'door':
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.fillRect(w * 0.75, h * 0.5, 6, 12);
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(w * 0.1, h * 0.1, w * 0.35, h * 0.35);
        ctx.strokeRect(w * 0.55, h * 0.1, w * 0.35, h * 0.35);
        ctx.strokeRect(w * 0.1, h * 0.55, w * 0.35, h * 0.35);
        ctx.strokeRect(w * 0.55, h * 0.55, w * 0.35, h * 0.35);
        break;
      case 'panel':
        for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
            ctx.fillStyle = `rgba(255,${Math.floor(Math.random() * 100 + 100)},${Math.floor(Math.random() * 50)},0.7)`;
            ctx.beginPath();
            ctx.arc(w * (0.2 + j * 0.3), h * (0.2 + i * 0.25), 6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      case 'poster':
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        this.roundRect(ctx, 8, 8, w - 16, h - 16, 4);
        ctx.fill();
        ctx.fillStyle = '#8b0000';
        ctx.font = `bold ${Math.floor(w * 0.1)}px serif`;
        ctx.textAlign = 'center';
        ctx.fillText('永恒之夜', w / 2, h * 0.3);
        ctx.fillStyle = '#333';
        ctx.font = `${Math.floor(w * 0.07)}px serif`;
        ctx.fillText('THE ETERNAL', w / 2, h * 0.5);
        ctx.fillText('NIGHT', w / 2, h * 0.6);
        break;
      case 'seat':
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(0, h * 0.7, w, h * 0.3);
        ctx.fillRect(w * 0.1, 0, w * 0.8, h * 0.75);
        break;
      case 'projector':
        ctx.fillStyle = 'rgba(100,100,100,0.6)';
        ctx.fillRect(w * 0.1, h * 0.4, w * 0.5, h * 0.4);
        ctx.fillStyle = 'rgba(50,50,50,0.8)';
        ctx.beginPath();
        ctx.arc(w * 0.7, h * 0.5, w * 0.2, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'shelf':
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        for (let i = 0; i < 4; i++) {
          ctx.fillRect(0, h * (i + 1) / 4, w, 3);
        }
        ctx.fillStyle = `rgba(139,69,19,0.8)`;
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 3; j++) {
            ctx.fillRect(w * (0.1 + j * 0.3), h * (0.05 + i * 0.25), w * 0.2, h * 0.18);
          }
        }
        break;
      case 'sign':
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = `bold ${Math.floor(h * 0.35)}px Microsoft YaHei`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('← 返回', w / 2, h / 2);
        break;
      case 'vanity':
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fillRect(w * 0.15, h * 0.1, w * 0.7, h * 0.5);
        for (let i = 0; i < 5; i++) {
          ctx.fillStyle = `rgba(255,220,100,${Math.random() * 0.5 + 0.5})`;
          ctx.beginPath();
          ctx.arc(w * (0.2 + i * 0.15), h * 0.05, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
    }
  }

  private generateAudio(): void {
    const audioKeys = [
      { key: 'bgm_ambient', freq: 60, duration: 4, type: 'sine', isBgm: true },
      { key: 'sfx_pickup', freq: 880, duration: 0.15, type: 'sine', isBgm: false },
      { key: 'sfx_click', freq: 440, duration: 0.08, type: 'square', isBgm: false },
      { key: 'sfx_success', freq: 660, duration: 0.4, type: 'triangle', isBgm: false },
      { key: 'sfx_error', freq: 180, duration: 0.3, type: 'sawtooth', isBgm: false },
      { key: 'sfx_door', freq: 120, duration: 0.5, type: 'sine', isBgm: false },
      { key: 'sfx_light', freq: 520, duration: 0.1, type: 'square', isBgm: false },
      { key: 'sfx_win', freq: 523, duration: 0.8, type: 'sine', isBgm: false },
      { key: 'sfx_lose', freq: 200, duration: 0.8, type: 'sawtooth', isBgm: false }
    ];

    audioKeys.forEach(({ key, freq, duration, type, isBgm }) => {
      const sampleRate = 44100;
      const samples = sampleRate * duration;
      const buffer = new AudioBuffer({
        length: Math.floor(samples),
        numberOfChannels: isBgm ? 2 : 1,
        sampleRate
      });

      for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
        const data = buffer.getChannelData(ch);
        for (let i = 0; i < data.length; i++) {
          const t = i / sampleRate;
          let sample = 0;
          const env = Math.max(0, 1 - t / duration);

          if (isBgm) {
            const f1 = Math.sin(2 * Math.PI * freq * t);
            const f2 = Math.sin(2 * Math.PI * (freq * 1.5) * t) * 0.3;
            const f3 = Math.sin(2 * Math.PI * (freq * 0.5) * t) * 0.2;
            sample = (f1 + f2 + f3) * 0.15 * (0.8 + env * 0.2);
          } else {
            const baseFreq = type === 'sfx_success' ?
              freq * (1 + t / duration * 0.5) :
              type === 'sfx_error' || type === 'sfx_lose' ?
              freq * (1 - t / duration * 0.3) : freq;

            switch (type) {
              case 'sine':
                sample = Math.sin(2 * Math.PI * baseFreq * t);
                break;
              case 'square':
                sample = Math.sign(Math.sin(2 * Math.PI * baseFreq * t));
                break;
              case 'triangle':
                sample = 2 * Math.abs(2 * (t * baseFreq - Math.floor(t * baseFreq + 0.5))) - 1;
                break;
              case 'sawtooth':
                sample = 2 * (t * baseFreq - Math.floor(t * baseFreq + 0.5));
                break;
            }
            sample *= env * 0.4;
          }
          data[i] = sample;
        }
      }

      this.cache.audio.add(key, buffer);
    });
  }

  private setupLoadEvents(): void {
    this.load.on('progress', (value: number) => {
      this.updateProgress(value);
    });

    this.load.on('fileprogress', (file: Phaser.Loader.File) => {
      if (this.assetText) {
        this.assetText.setText(`加载资源: ${file.key}`);
      }
    });

    this.load.on('complete', () => {
      this.updateProgress(1);
      this.time.delayedCall(500, () => {
        this.scene.start('MenuScene');
      });
    });
  }

  private updateProgress(value: number): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    if (this.progressBar) {
      this.progressBar.clear();
      this.progressBar.fillStyle(0xc9a44c, 1);
      this.progressBar.fillRoundedRect(cx - 156, cy + 4, 312 * value, 22, 4);
    }

    if (this.percentText) {
      this.percentText.setText(`${Math.round(value * 100)}%`);
    }
  }

  create(): void {
    const keys = Object.keys(SCENES);
    keys.forEach(key => {
      if (!this.textures.exists(SCENES[key].backgroundKey)) {
        console.warn(`背景纹理缺失: ${SCENES[key].backgroundKey}`);
      }
    });
  }
}
