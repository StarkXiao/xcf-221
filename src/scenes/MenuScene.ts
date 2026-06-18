import { Scene } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config/levels';
import { SaveSystem } from '@/systems/SaveSystem';
import { AudioManager } from '@/systems/AudioManager';
import { EventBus } from '@/systems/EventBus';

export class MenuScene extends Scene {
  private audioManager: AudioManager;
  private saveSystem: SaveSystem;
  private eventBus: EventBus;

  constructor() {
    super('MenuScene');
    this.audioManager = AudioManager.getInstance();
    this.saveSystem = SaveSystem.getInstance();
    this.eventBus = EventBus.getInstance();
  }

  create(): void {
    this.audioManager.setScene(this);
    this.audioManager.loadSettings();

    this.createBackground();
    this.createTitle();
    this.createButtons();
    this.createFooter();
  }

  private createBackground(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0a0505, 0x0a0505, 0x1a0a0a, 0x1a0a0a, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    for (let i = 0; i < 30; i++) {
      this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(1, 3),
        0xc9a44c,
        Phaser.Math.FloatBetween(0.2, 0.6)
      ).setAlpha(Phaser.Math.FloatBetween(0.3, 0.8));
    }

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 600, 400, 0x000000, 0.3)
      .setStrokeStyle(2, 0xc9a44c, 0.3);

    this.tweens.add({
      targets: this.add.rectangle(GAME_WIDTH / 2, 150, 400, 2, 0xc9a44c, 0.5),
      alpha: { from: 0.2, to: 0.8 },
      duration: 2000,
      yoyo: true,
      repeat: -1
    });

    this.tweens.add({
      targets: this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 150, 400, 2, 0xc9a44c, 0.5),
      alpha: { from: 0.8, to: 0.2 },
      duration: 2000,
      yoyo: true,
      repeat: -1
    });
  }

  private createTitle(): void {
    const cx = GAME_WIDTH / 2;

    this.add.text(cx, 180, '废弃剧场', {
      fontFamily: 'Georgia, serif',
      fontSize: '72px',
      color: '#c9a44c',
      fontStyle: 'bold'
    }).setOrigin(0.5).setShadow(4, 4, '#000000', 8, true, true);

    this.add.text(cx, 260, 'THE ABANDONED THEATER', {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: '#888888',
      letterSpacing: 4
    }).setOrigin(0.5);

    this.add.text(cx, 310, '—— 解谜逃脱 ——', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '18px',
      color: '#666666'
    }).setOrigin(0.5);
  }

  private createButtons(): void {
    const cx = GAME_WIDTH / 2;
    const startY = 380;
    const buttonWidth = 280;
    const buttonHeight = 52;
    const gap = 16;

    const hasSave = this.saveSystem.hasSave();

    this.createButton(cx, startY, buttonWidth, buttonHeight, '开始新游戏', '#c9a44c', () => {
      this.audioManager.playSfx('click');
      this.eventBus.emit('game_start');
      this.scene.start('GameScene', { newGame: true });
    });

    const continueBtn = this.createButton(
      cx,
      startY + buttonHeight + gap,
      buttonWidth,
      buttonHeight,
      hasSave ? '继续游戏' : '继续游戏 (无存档)',
      hasSave ? '#4a90d9' : '#555555',
      () => {
        if (!hasSave) return;
        this.audioManager.playSfx('click');
        const loaded = this.saveSystem.loadGame();
        if (loaded) {
          this.eventBus.emit('load_game', loaded);
          this.scene.start('GameScene', { newGame: false, loadedState: loaded });
        }
      }
    );
    if (!hasSave) {
      continueBtn.setAlpha(0.5);
    }

    this.createButton(cx, startY + (buttonHeight + gap) * 2, buttonWidth, buttonHeight, '设置', '#666666', () => {
      this.audioManager.playSfx('click');
      this.showSettings();
    });

    if (hasSave) {
      const ts = this.saveSystem.getSaveTimestamp();
      if (ts) {
        this.add.text(cx, startY + (buttonHeight + gap) * 1 + buttonHeight + 8,
          `上次存档: ${this.saveSystem.formatTime(ts)}`, {
          fontFamily: 'Microsoft YaHei, sans-serif',
          fontSize: '12px',
          color: '#888888'
        }).setOrigin(0.5, 0);
      }
    }
  }

  private createButton(
    x: number, y: number, w: number, h: number,
    text: string, color: string,
    callback: () => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    bg.lineStyle(2, 0xffffff, 0.2);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
    container.add(bg);

    const label = this.add.text(0, 0, text, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(label);

    container.setSize(w, h);
    container.setInteractive({ useHandCursor: true });

    container.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1);
      bg.fillRoundedRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4, 8);
      bg.lineStyle(3, 0xffffff, 0.6);
      bg.strokeRoundedRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4, 8);
      label.setScale(1.05);
    });

    container.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(Phaser.Display.Color.HexStringToColor(color).color, 1);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
      bg.lineStyle(2, 0xffffff, 0.2);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
      label.setScale(1);
    });

    container.on('pointerdown', callback);

    return container;
  }

  private createFooter(): void {
    this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 40,
      '点击场景中的物品进行交互 · 使用道具解开谜题 · 找到出口逃离废弃剧场', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '14px',
      color: '#555555'
    }).setOrigin(0.5);
  }

  private showSettings(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const panelW = 480;
    const panelH = 400;

    const overlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
      .setOrigin(0, 0)
      .setInteractive();

    const panel = this.add.container(cx, cy);

    const bg = this.add.graphics();
    bg.fillStyle(0x1a1510, 1);
    bg.fillRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 12);
    bg.lineStyle(2, 0xc9a44c, 0.6);
    bg.strokeRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 12);
    panel.add(bg);

    panel.add(this.add.text(0, -panelH / 2 + 36, '游戏设置', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '28px',
      color: '#c9a44c',
      fontStyle: 'bold'
    }).setOrigin(0.5));

    let curY = -panelH / 2 + 100;
    const settings = [
      { label: '背景音乐', getter: () => this.audioManager.isBgmEnabled(), setter: (v: boolean) => this.audioManager.setBgmEnabled(v) },
      { label: '音效', getter: () => this.audioManager.isSfxEnabled(), setter: (v: boolean) => this.audioManager.setSfxEnabled(v) }
    ];

    settings.forEach(({ label, getter, setter }) => {
      panel.add(this.add.text(-panelW / 2 + 40, curY, label, {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '20px',
        color: '#cccccc'
      }).setOrigin(0, 0.5));

      const toggle = this.createToggle(panelW / 2 - 60, curY, getter(), (val) => {
        setter(val);
        this.audioManager.playSfx('click');
      });
      panel.add(toggle);
      curY += 60;
    });

    curY += 20;
    if (this.saveSystem.hasSave()) {
      const delBtn = this.add.graphics();
      delBtn.fillStyle(0x8b0000, 1);
      delBtn.fillRoundedRect(-100, curY, 200, 44, 8);
      panel.add(delBtn);
      panel.add(this.add.text(0, curY + 22, '删除存档', {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '18px',
        color: '#ffffff'
      }).setOrigin(0.5));

      const delHit = this.add.rectangle(0, curY + 22, 200, 44)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      delHit.on('pointerdown', () => {
        this.showConfirm('确定要删除存档吗？此操作无法撤销。', () => {
          this.saveSystem.deleteSave();
          this.audioManager.playSfx('click');
          closeAll();
          this.scene.restart();
        });
      });
      panel.add(delHit);
      curY += 64;
    }

    curY += 20;
    const closeBtn = this.add.graphics();
    closeBtn.fillStyle(0x555555, 1);
    closeBtn.fillRoundedRect(-80, curY, 160, 44, 8);
    panel.add(closeBtn);
    panel.add(this.add.text(0, curY + 22, '关闭', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5));

    const closeHit = this.add.rectangle(0, curY + 22, 160, 44)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    closeHit.on('pointerdown', closeAll);
    panel.add(closeHit);

    function closeAll(): void {
      overlay.destroy();
      panel.destroy();
    }
  }

  private createToggle(x: number, y: number, initial: boolean, onChange: (v: boolean) => void): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    const w = 60;
    const h = 30;
    let state = initial;

    const bg = this.add.graphics();
    container.add(bg);

    const knob = this.add.circle(state ? w / 4 : -w / 4, 0, 10, 0xffffff)
      .setStrokeStyle(1, 0x333333);
    container.add(knob);

    const draw = () => {
      bg.clear();
      bg.fillStyle(state ? 0x4a90d9 : 0x444444, 1);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, h / 2);
    };
    draw();

    const hit = this.add.rectangle(0, 0, w + 10, h + 10)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    hit.on('pointerdown', () => {
      state = !state;
      draw();
      this.tweens.add({
        targets: knob,
        x: state ? w / 4 : -w / 4,
        duration: 150,
        ease: 'Quad.easeInOut'
      });
      onChange(state);
    });
    container.add(hit);

    return container;
  }

  private showConfirm(message: string, onConfirm: () => void): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    const overlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.8)
      .setOrigin(0, 0)
      .setInteractive();

    const panel = this.add.container(cx, cy);

    const bg = this.add.graphics();
    bg.fillStyle(0x2a2015, 1);
    bg.fillRoundedRect(-180, -100, 360, 200, 10);
    bg.lineStyle(2, 0xc9a44c, 0.5);
    bg.strokeRoundedRect(-180, -100, 360, 200, 10);
    panel.add(bg);

    panel.add(this.add.text(0, -40, message, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '16px',
      color: '#cccccc',
      wordWrap: { width: 320 }
    }).setOrigin(0.5));

    const okBg = this.add.graphics();
    okBg.fillStyle(0x8b0000, 1);
    okBg.fillRoundedRect(-130, 20, 110, 40, 6);
    panel.add(okBg);
    panel.add(this.add.text(-75, 40, '确定', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5));
    const okHit = this.add.rectangle(-75, 40, 110, 40)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    okHit.on('pointerdown', () => {
      onConfirm();
      overlay.destroy();
      panel.destroy();
    });
    panel.add(okHit);

    const cancelBg = this.add.graphics();
    cancelBg.fillStyle(0x555555, 1);
    cancelBg.fillRoundedRect(20, 20, 110, 40, 6);
    panel.add(cancelBg);
    panel.add(this.add.text(75, 40, '取消', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5));
    const cancelHit = this.add.rectangle(75, 40, 110, 40)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    cancelHit.on('pointerdown', () => {
      overlay.destroy();
      panel.destroy();
    });
    panel.add(cancelHit);
  }
}
