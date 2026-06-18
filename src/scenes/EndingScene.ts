import { Scene } from 'phaser';
import type { GameState, EndingData, GhostActorEndingData } from '@/types';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config/levels';
import { EndingSystem, ScoreBreakdown } from '@/systems/EndingSystem';
import { AudioManager } from '@/systems/AudioManager';
import { SaveSystem } from '@/systems/SaveSystem';
import { EventBus } from '@/systems/EventBus';
import { GhostActorSystem } from '@/systems/GhostActorSystem';

export class EndingScene extends Scene {
  private endingSystem: EndingSystem;
  private audio: AudioManager;
  private saveSys: SaveSystem;
  private eventBus: EventBus;
  private ghostActor: GhostActorSystem;
  private gameState!: GameState;
  private ending!: EndingData;
  private score!: ScoreBreakdown;
  private ghostEnding: GhostActorEndingData | null = null;

  constructor() {
    super('EndingScene');
    this.endingSystem = EndingSystem.getInstance();
    this.audio = AudioManager.getInstance();
    this.saveSys = SaveSystem.getInstance();
    this.eventBus = EventBus.getInstance();
    this.ghostActor = GhostActorSystem.getInstance();
  }

  init(data: { state: GameState }): void {
    this.gameState = data.state;
    if (data.state.ghostActorState) {
      this.ghostActor.loadState(data.state.ghostActorState);
    }
    this.ending = this.endingSystem.determineEnding(this.gameState);
    this.score = this.endingSystem.calculateScore(this.gameState);
    if (this.score.ghostActorEndingId) {
      this.ghostEnding = this.endingSystem.getGhostActorEnding(this.score.ghostActorEndingId);
    }
    if (!this.ghostEnding) {
      this.ghostEnding = this.endingSystem.determineGhostActorEnding();
    }
  }

  create(): void {
    this.audio.setScene(this);
    if (this.ending.isGood) {
      this.audio.playSfx('win');
    } else {
      this.audio.playSfx('lose');
    }

    this.eventBus.emit('show_ending', this.ending.id);

    this.cameras.main.fadeIn(800, 0, 0, 0);

    this.createBackground();
    this.createEndingContent();
    this.createScorePanel();
    this.createButtons();
  }

  private createBackground(): void {
    const bg = this.add.graphics();
    if (this.ending.isGood) {
      bg.fillGradientStyle(0x1a1510, 0x1a1510, 0x2a2010, 0x2a2010, 1);
    } else {
      bg.fillGradientStyle(0x0a0505, 0x0a0505, 0x1a0a0a, 0x1a0a0a, 1);
    }
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const particleCount = 40;
    const color = this.ending.isGood ? 0xc9a44c : 0x666666;
    for (let i = 0; i < particleCount; i++) {
      const p = this.add.circle(
        Phaser.Math.Between(0, GAME_WIDTH),
        Phaser.Math.Between(0, GAME_HEIGHT),
        Phaser.Math.Between(1, 4),
        color,
        Phaser.Math.FloatBetween(0.3, 0.9)
      );
      this.tweens.add({
        targets: p,
        y: `-=${Phaser.Math.Between(100, 300)}`,
        x: `+=${Phaser.Math.Between(-50, 50)}`,
        alpha: { from: Phaser.Math.FloatBetween(0.5, 0.9), to: 0 },
        duration: Phaser.Math.Between(3000, 6000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 3000),
        onRepeat: () => {
          p.setPosition(
            Phaser.Math.Between(0, GAME_WIDTH),
            GAME_HEIGHT + 20
          );
          p.setAlpha(Phaser.Math.FloatBetween(0.5, 0.9));
        }
      });
    }

    if (this.ending.isGood) {
      for (let i = 0; i < 6; i++) {
        this.tweens.add({
          targets: this.add.rectangle(
            GAME_WIDTH / 2,
            -50,
            2,
            GAME_HEIGHT + 100,
            0xffdd66,
            0
          ).setBlendMode(Phaser.BlendModes.ADD),
          alpha: { from: 0, to: 0.12, delay: i * 300 },
          duration: 2000,
          yoyo: true,
          hold: 1000,
          repeat: -1
        });
      }
    }
  }

  private createEndingContent(): void {
    const cx = GAME_WIDTH / 2;

    const icon = this.ending.isGood ? '🌟' : '🌑';
    const iconEl = this.add.text(cx, 90, icon, {
      fontFamily: 'Apple Color Emoji, sans-serif',
      fontSize: '64px'
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({
      targets: iconEl,
      alpha: 1,
      scale: { from: 0.5, to: 1 },
      duration: 600,
      delay: 300,
      ease: 'Back.easeOut'
    });

    const titleColor = this.ending.isGood ? '#c9a44c' : '#888888';
    const title = this.add.text(cx, 160, this.ending.title, {
      fontFamily: 'Georgia, serif',
      fontSize: '52px',
      color: titleColor,
      fontStyle: 'bold'
    }).setOrigin(0.5).setAlpha(0).setShadow(4, 4, '#000000', 8, true, true);
    this.tweens.add({
      targets: title,
      alpha: 1,
      y: '-=10',
      duration: 700,
      delay: 500,
      ease: 'Quad.easeOut'
    });

    const sub = this.add.text(cx, 210, this.ending.isGood ? '— GOOD ENDING —' : '— BAD ENDING —', {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: this.ending.isGood ? '#88cc88' : '#cc6666',
      letterSpacing: 4
    }).setOrigin(0.5).setAlpha(0);
    this.tweens.add({
      targets: sub,
      alpha: 1,
      duration: 500,
      delay: 800
    });

    const descLines = this.ending.description.split('\n');
    const descContainer = this.add.container(cx, 300).setAlpha(0);
    let dy = 0;
    descLines.forEach((line, i) => {
      descContainer.add(this.add.text(0, dy, line, {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '16px',
        color: '#cccccc',
        align: 'center'
      }).setOrigin(0.5));
      dy += 28;
    });
    this.tweens.add({
      targets: descContainer,
      alpha: 1,
      duration: 800,
      delay: 1000,
      ease: 'Quad.easeOut'
    });

    if (this.ghostEnding && (this.ghostEnding.id === 'ga_reunion_perfect' || this.ghostEnding.id === 'ga_reunion_normal')) {
      const ghostDivider = this.add.text(cx, 370, '┈┈┈┈┈┈┈┈ 支线结局 ┈┈┈┈┈┈┈┈', {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '14px',
        color: '#666666',
        letterSpacing: 2
      }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({
        targets: ghostDivider,
        alpha: 1,
        duration: 500,
        delay: 1600
      });

      const ghostIcon = this.ghostEnding.scoreBonus >= 800 ? '💖' : '💗';
      const ghostIconEl = this.add.text(cx, 405, ghostIcon, {
        fontFamily: 'Apple Color Emoji, sans-serif',
        fontSize: '32px'
      }).setOrigin(0.5).setAlpha(0);
      this.tweens.add({
        targets: ghostIconEl,
        alpha: 1,
        scale: { from: 0.5, to: 1 },
        duration: 500,
        delay: 1700,
        ease: 'Back.easeOut'
      });

      const ghostTitleColor = this.ghostEnding.isGood ? '#ff9ec7' : '#888888';
      const ghostTitle = this.add.text(cx, 445, this.ghostEnding.title, {
        fontFamily: 'Georgia, serif',
        fontSize: '28px',
        color: ghostTitleColor,
        fontStyle: 'bold'
      }).setOrigin(0.5).setAlpha(0).setShadow(2, 2, '#000000', 4);
      this.tweens.add({
        targets: ghostTitle,
        alpha: 1,
        y: '-=5',
        duration: 600,
        delay: 1850,
        ease: 'Quad.easeOut'
      });

      const ghostDescLines = this.ghostEnding.epilogueText.split('\n');
      const ghostDescContainer = this.add.container(cx, 560).setAlpha(0);
      let gdy = 0;
      ghostDescLines.forEach((line) => {
        ghostDescContainer.add(this.add.text(0, gdy, line, {
          fontFamily: 'Microsoft YaHei, sans-serif',
          fontSize: '14px',
          color: '#bbbbbb',
          align: 'center'
        }).setOrigin(0.5));
        gdy += 24;
      });
      this.tweens.add({
        targets: ghostDescContainer,
        alpha: 1,
        duration: 800,
        delay: 2100,
        ease: 'Quad.easeOut'
      });
    }
  }

  private createScorePanel(): void {
    const cx = GAME_WIDTH / 2;
    const cy = this.ghostEnding && (this.ghostEnding.id === 'ga_reunion_perfect' || this.ghostEnding.id === 'ga_reunion_normal') ? 740 : 475;
    const w = 560;
    const h = this.score.ghostActorBonus > 0 ? 220 : 200;

    const panel = this.add.container(cx, cy).setAlpha(0);
    this.tweens.add({
      targets: panel,
      alpha: 1,
      duration: 600,
      delay: 1800,
      ease: 'Quad.easeOut'
    });

    const g = this.add.graphics();
    g.fillStyle(0x0f0a05, 0.9);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    g.lineStyle(2, 0xc9a44c, 0.5);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    panel.add(g);

    panel.add(this.add.text(-w / 2 + 20, -h / 2 + 20, '📊 结算', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '20px',
      color: '#c9a44c',
      fontStyle: 'bold'
    }));

    const stars = this.endingSystem.getStars(this.score.total);
    const starsY = -h / 2 + 18;
    for (let i = 0; i < 3; i++) {
      const sx = w / 2 - 100 + i * 36;
      panel.add(this.add.text(sx, starsY, '⭐', {
        fontFamily: 'Apple Color Emoji, sans-serif',
        fontSize: '24px',
        color: '#666666'
      }).setOrigin(0.5).setAlpha(i < stars ? 1 : 0.25));
    }

    const rank = this.endingSystem.getRank(this.score.total);
    panel.add(this.add.text(w / 2 - 30, starsY, rank, {
      fontFamily: 'Georgia, serif',
      fontSize: '24px',
      color: rank === 'S' ? '#ffdd44' : rank === 'A' ? '#c9a44c' : '#888888',
      fontStyle: 'bold'
    }).setOrigin(0.5));

    const baseItems: [string, string, string][] = [
      ['⏱️ 游玩时间', this.endingSystem.formatTime(this.score.playTimeSeconds), '#88cccc'],
      ['👣 移动次数', String(this.score.moveCount), '#cc88cc'],
      ['🎒 道具收集', `${this.score.itemsCollected} / 14`, '#88cc88'],
      ['💡 谜题解开', `${this.score.puzzlesSolved} / 2`, '#ccaa66'],
      ['🎯 基础得分', String(this.score.baseScore), '#dddddd'],
      ['⚡ 速度奖励', `+${this.score.speedBonus}`, this.score.speedBonus > 0 ? '#4ade80' : '#666666'],
      ['🔧 效率奖励', `+${this.score.efficiencyBonus}`, this.score.efficiencyBonus > 0 ? '#4ade80' : '#666666'],
      ['💡 提示扣分', `-${this.score.penalty}`, this.score.penalty > 0 ? '#ff6666' : '#666666']
    ];

    const ghostBonusItems: [string, string, string][] = [];
    if (this.score.ghostActorBonus > 0) {
      const bonusLabel = this.score.ghostActorBonus >= 800 ? '👻 幽灵支线·完美' : this.score.ghostActorBonus >= 500 ? '👻 幽灵支线·良好' : '👻 幽灵支线';
      ghostBonusItems.push([bonusLabel, `+${this.score.ghostActorBonus}`, this.score.ghostActorBonus >= 800 ? '#ff69b4' : '#ff9ec7']);
    }

    const items = [...baseItems, ...ghostBonusItems];

    const cols = 2;
    const rows = Math.ceil(items.length / cols);
    const colW = (w - 60) / cols;
    const rowH = 22;
    const startX = -w / 2 + 30;
    const startY = -h / 2 + 55;

    items.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * colW;
      const y = startY + row * rowH;

      panel.add(this.add.text(x, y, item[0], {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '12px',
        color: '#888888'
      }));
      panel.add(this.add.text(x + colW - 10, y, item[1], {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '12px',
        color: item[2]
      }).setOrigin(1, 0));
    });

    const sepY = startY + rows * rowH + 6;
    const sep = this.add.graphics();
    sep.lineStyle(1, 0xc9a44c, 0.3);
    sep.beginPath();
    sep.moveTo(-w / 2 + 20, sepY);
    sep.lineTo(w / 2 - 20, sepY);
    sep.strokePath();
    panel.add(sep);

    const totalY = sepY + 20;
    panel.add(this.add.text(-w / 2 + 30, totalY, '🏆 总分', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '18px',
      color: '#cccccc',
      fontStyle: 'bold'
    }));

    const totalScoreEl = this.add.text(w / 2 - 30, totalY, String(this.score.total), {
      fontFamily: 'Georgia, serif',
      fontSize: '28px',
      color: this.ending.isGood ? '#ffdd44' : '#cc8888',
      fontStyle: 'bold'
    }).setOrigin(1, 0);
    panel.add(totalScoreEl);

    let currentScore = 0;
    this.tweens.addCounter({
      from: 0,
      to: this.score.total,
      duration: 1500,
      delay: 2500,
      ease: 'Cubic.easeOut',
      onUpdate: (tween) => {
        const val = tween.getValue() ?? 0;
        currentScore = Math.floor(val);
        totalScoreEl.setText(String(currentScore));
      }
    });
  }

  private createButtons(): void {
    const cx = GAME_WIDTH / 2;
    const hasGhostEnding = this.ghostEnding && (this.ghostEnding.id === 'ga_reunion_perfect' || this.ghostEnding.id === 'ga_reunion_normal');
    const by = hasGhostEnding ? GAME_HEIGHT - 30 : GAME_HEIGHT - 50;
    const bw = 200;
    const bh = 48;
    const gap = 24;

    const restartBtn = this.createButton(cx - bw - gap / 2, by, bw, bh, '🔄 重新开始', '#8b4513', () => {
      this.audio.playSfx('click');
      this.saveSys.deleteSave();
      this.cameras.main.fadeOut(400, 0, 0, 0, () => {
        this.scene.start('GameScene', { newGame: true });
      });
    });

    const menuBtn = this.createButton(cx + gap / 2, by, bw, bh, '🏠 返回主菜单', '#555555', () => {
      this.audio.playSfx('click');
      this.cameras.main.fadeOut(400, 0, 0, 0, () => {
        this.audio.stopBgm();
        this.scene.start('MenuScene');
      });
    });

    [restartBtn, menuBtn].forEach((btn, i) => {
      btn.setAlpha(0);
      this.tweens.add({
        targets: btn,
        alpha: 1,
        duration: 500,
        delay: 2800 + i * 150,
        ease: 'Quad.easeOut'
      });
    });
  }

  private createButton(x: number, y: number, w: number, h: number, text: string, colorHex: string, cb: () => void): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    const color = Phaser.Display.Color.HexStringToColor(colorHex).color;
    const draw = (scale = 1) => {
      const sw = w * scale;
      const sh = h * scale;
      g.clear();
      g.fillStyle(color, 1);
      g.fillRoundedRect(-sw / 2, -sh / 2, sw, sh, 8);
      g.lineStyle(2, 0xffffff, 0.2);
      g.strokeRoundedRect(-sw / 2, -sh / 2, sw, sh, 8);
    };
    draw();
    c.add(g);
    c.add(this.add.text(0, 0, text, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5));

    c.setSize(w, h).setInteractive({ useHandCursor: true });
    c.on('pointerover', () => draw(1.04));
    c.on('pointerout', () => draw(1));
    c.on('pointerdown', cb);
    return c;
  }
}
