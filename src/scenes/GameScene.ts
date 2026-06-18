import { Scene } from 'phaser';
import type { GameState, SceneObject } from '@/types';
import { GAME_WIDTH, GAME_HEIGHT, SCENES, LIGHT_PUZZLES } from '@/config/levels';
import { InventorySystem } from '@/systems/InventorySystem';
import { LightPuzzleSystem } from '@/systems/LightPuzzleSystem';
import { AudioManager } from '@/systems/AudioManager';
import { SaveSystem } from '@/systems/SaveSystem';
import { EventBus } from '@/systems/EventBus';

export class GameScene extends Scene {
  private gameState: GameState;
  private inventory: InventorySystem;
  private lightSystem: LightPuzzleSystem;
  private audio: AudioManager;
  private saveSys: SaveSystem;
  private eventBus: EventBus;

  private sceneObjects: Map<string, Phaser.GameObjects.Container> = new Map();
  private sceneObjectsConfig: Map<string, SceneObject> = new Map();
  private inventorySlots: Phaser.GameObjects.Container[] = [];
  private messageQueue: { text: string; duration: number }[] = [];
  private isShowingMessage = false;

  private topBar: Phaser.GameObjects.Container | null = null;
  private inventoryBar: Phaser.GameObjects.Container | null = null;
  private activePuzzlePanel: Phaser.GameObjects.Container | null = null;
  private ambientLayer: Phaser.GameObjects.Graphics | null = null;

  constructor() {
    super('GameScene');
    this.inventory = InventorySystem.getInstance();
    this.lightSystem = LightPuzzleSystem.getInstance();
    this.audio = AudioManager.getInstance();
    this.saveSys = SaveSystem.getInstance();
    this.eventBus = EventBus.getInstance();
    this.gameState = this.saveSys.getInitialState();
  }

  init(data: { newGame: boolean; loadedState?: GameState }): void {
    if (data.newGame) {
      this.gameState = this.saveSys.getInitialState();
      this.inventory.clear();
      this.lightSystem.reset();
    } else if (data.loadedState) {
      this.gameState = JSON.parse(JSON.stringify(data.loadedState));
      this.inventory.setItems(this.gameState.inventory);
      if (this.gameState.selectedItem) {
        this.inventory.selectItem(this.gameState.selectedItem);
      }
      this.gameState.solvedPuzzles.forEach(pid => {
        this.lightSystem.setSolved(pid, true);
      });
    }
  }

  create(): void {
    this.audio.setScene(this);
    this.audio.playBgm();

    this.setupEventListeners();
    this.buildScene(this.gameState.currentScene);
    this.createTopBar();
    this.createInventoryBar();
    this.updateInventoryUI();
    this.showMessage(SCENES[this.gameState.currentScene]?.description ?? '', 4000);
  }

  private setupEventListeners(): void {
    this.inventory.onChange((event) => {
      this.gameState.inventory = this.inventory.getItems();
      this.gameState.selectedItem = this.inventory.getSelectedItem();
      this.updateInventoryUI();

      if (event.type === 'add' && event.itemId) {
        const item = this.inventory.getItemData(event.itemId);
        this.showFloatingText(`+ ${item?.name ?? ''}`, 0xc9a44c);
      }
      if (event.type === 'combine' && event.resultId) {
        const item = this.inventory.getItemData(event.resultId);
        this.showFloatingText(`组合成功: ${item?.name ?? ''}`, 0x4ade80);
      }
    });
  }

  private buildScene(sceneId: string): void {
    this.cameras.main.fadeOut(300, 0, 0, 0, (_cam: Phaser.Cameras.Scene2D.Camera, prog: number) => {
      if (prog >= 1) {
        this.clearSceneObjects();

        const config = SCENES[sceneId];
        if (!config) return;

        if (this.textures.exists(config.backgroundKey)) {
          this.add.image(0, 0, config.backgroundKey).setOrigin(0, 0).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
        } else {
          this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, config.ambientColor).setOrigin(0, 0);
        }

        this.createAmbientOverlay(config.ambientColor);
        this.createSceneTitle(config.name);
        config.objects.forEach(obj => this.createSceneObject(obj));
        this.bringUIToFront();

        this.cameras.main.fadeIn(400, 0, 0, 0);
      }
    });
  }

  private createAmbientOverlay(color: number): void {
    if (this.ambientLayer) {
      this.ambientLayer.destroy();
    }
    this.ambientLayer = this.add.graphics();
    this.ambientLayer.fillStyle(color, 0.15);
    this.ambientLayer.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    this.ambientLayer.setDepth(10);

    for (let i = 0; i < 5; i++) {
      const lx = Phaser.Math.Between(100, GAME_WIDTH - 100);
      const ly = Phaser.Math.Between(80, 300);
      const radius = Phaser.Math.Between(80, 160);
      this.tweens.add({
        targets: this.add.circle(lx, ly, radius, 0xffdd88, 0.03)
          .setDepth(5)
          .setBlendMode(Phaser.BlendModes.ADD),
        alpha: { from: 0.02, to: 0.06 },
        duration: Phaser.Math.Between(2000, 4000),
        yoyo: true,
        repeat: -1
      });
    }
  }

  private createSceneTitle(name: string): void {
    const titleBg = this.add.graphics().setDepth(11);
    titleBg.fillStyle(0x000000, 0.6);
    titleBg.fillRoundedRect(16, 64, 200, 36, 8);
    titleBg.lineStyle(1, 0xc9a44c, 0.5);
    titleBg.strokeRoundedRect(16, 64, 200, 36, 8);

    this.add.text(116, 82, `📍 ${name}`, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '18px',
      color: '#c9a44c'
    }).setOrigin(0.5).setDepth(12);
  }

  private createSceneObject(obj: SceneObject): void {
    if (obj.type === 'item' && obj.containsItem) {
      if (this.gameState.collectedItems.includes(obj.containsItem)) {
        return;
      }
    }
    if (obj.type === 'door' && this.gameState.openedDoors.includes(obj.id)) {
      obj.collected = true;
    }
    if (obj.type === 'puzzle' && obj.puzzleId && this.gameState.solvedPuzzles.includes(obj.puzzleId)) {
      obj.solved = true;
    }

    this.sceneObjectsConfig.set(obj.id, obj);

    const container = this.add.container(obj.position.x, obj.position.y);

    if (this.textures.exists(obj.spriteKey)) {
      const sprite = this.add.image(0, 0, obj.spriteKey)
        .setDisplaySize(obj.size.x, obj.size.y);
      container.add(sprite);

      if (!obj.interactive) {
        sprite.setAlpha(0.6);
      }
    } else {
      const g = this.add.graphics();
      g.fillStyle(0x444444, 0.7);
      g.fillRoundedRect(-obj.size.x / 2, -obj.size.y / 2, obj.size.x, obj.size.y, 6);
      g.lineStyle(2, 0xc9a44c, 0.4);
      g.strokeRoundedRect(-obj.size.x / 2, -obj.size.y / 2, obj.size.x, obj.size.y, 6);
      container.add(g);
      container.add(this.add.text(0, 0, obj.name, {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '12px',
        color: '#fff'
      }).setOrigin(0.5));
    }

    if (obj.interactive) {
      container.setSize(obj.size.x, obj.size.y);
      container.setInteractive({ useHandCursor: true });

      const hoverFrame = this.add.graphics().setVisible(false);
      hoverFrame.lineStyle(3, 0xffdd44, 1);
      hoverFrame.strokeRoundedRect(-obj.size.x / 2 - 4, -obj.size.y / 2 - 4, obj.size.x + 8, obj.size.y + 8, 10);
      container.add(hoverFrame);

      if (obj.type === 'puzzle' && obj.puzzleId && this.gameState.solvedPuzzles.includes(obj.puzzleId)) {
        hoverFrame.lineStyle(3, 0x4ade80, 1);
        hoverFrame.strokeRoundedRect(-obj.size.x / 2 - 4, -obj.size.y / 2 - 4, obj.size.x + 8, obj.size.y + 8, 10);
        hoverFrame.setVisible(true);
      }

      container.on('pointerover', () => {
        if (obj.type === 'puzzle' && obj.puzzleId && this.gameState.solvedPuzzles.includes(obj.puzzleId)) {
          hoverFrame.lineStyle(3, 0x4ade80, 1);
        } else {
          hoverFrame.lineStyle(3, 0xffdd44, 1);
        }
        hoverFrame.strokeRoundedRect(-obj.size.x / 2 - 4, -obj.size.y / 2 - 4, obj.size.x + 8, obj.size.y + 8, 10);
        hoverFrame.setVisible(true);
        this.scaleTween(container, 1.04, 120);
      });

      container.on('pointerout', () => {
        if (!(obj.type === 'puzzle' && obj.puzzleId && this.gameState.solvedPuzzles.includes(obj.puzzleId))) {
          hoverFrame.setVisible(false);
        }
        this.scaleTween(container, 1, 120);
      });

      container.on('pointerdown', () => {
        this.handleObjectInteraction(obj, container);
      });
    }

    container.setDepth(20);
    this.sceneObjects.set(obj.id, container);
  }

  private scaleTween(target: Phaser.GameObjects.Container, scale: number, duration: number): void {
    this.tweens.add({
      targets: target,
      scaleX: scale,
      scaleY: scale,
      duration,
      ease: 'Quad.easeOut'
    });
  }

  private handleObjectInteraction(obj: SceneObject, container: Phaser.GameObjects.Container): void {
    this.audio.playSfx('click');
    this.gameState.moveCount++;

    const selected = this.inventory.getSelectedItem();

    switch (obj.type) {
      case 'clue':
        this.showClueModal(obj.clueText ?? '没有发现什么线索...');
        this.eventBus.emit('clue_found', obj.id);
        break;

      case 'item':
        if (obj.containsItem && !this.gameState.collectedItems.includes(obj.containsItem)) {
          this.audio.playSfx('pickup');
          this.inventory.addItem(obj.containsItem);
          this.gameState.collectedItems.push(obj.containsItem);
          this.eventBus.emit('item_pickup', obj.containsItem);
          if (obj.clueText) {
            this.showClueModal(obj.clueText);
          } else {
            const item = this.inventory.getItemData(obj.containsItem);
            this.showClueModal(`获得了「${item?.name ?? '物品'}」\n${item?.description ?? ''}`);
          }
          container.destroy();
          this.sceneObjects.delete(obj.id);
          this.autoSave();
        } else {
          this.showMessage('这里已经没有什么了...', 2000);
        }
        break;

      case 'puzzle':
        if (obj.puzzleId) {
          if (this.gameState.solvedPuzzles.includes(obj.puzzleId)) {
            this.showMessage('这个谜题已经解开了。', 2000);
          } else {
            this.showLightPuzzle(obj.puzzleId);
            this.eventBus.emit('show_puzzle', obj.puzzleId);
          }
        }
        break;

      case 'door':
      case 'exit':
        if (obj.type === 'door' && obj.requiredItem && !this.gameState.openedDoors.includes(obj.id)) {
          if (selected && selected === obj.requiredItem) {
            this.audio.playSfx('door');
            this.gameState.openedDoors.push(obj.id);
            this.inventory.removeItem(obj.requiredItem);
            this.eventBus.emit('door_open', obj.id);
            this.showFloatingText('门打开了！', 0x4ade80);
            if (obj.targetScene) {
              this.changeScene(obj.targetScene);
            }
            this.autoSave();
          } else if (selected) {
            this.audio.playSfx('error');
            this.showMessage('这把钥匙不对...', 2000);
          } else {
            this.audio.playSfx('error');
            if (obj.clueText) this.showClueModal(obj.clueText);
          }
        } else if (obj.type === 'exit' || this.gameState.openedDoors.includes(obj.id)) {
          this.audio.playSfx('door');
          this.eventBus.emit('door_open', obj.id);
          if (obj.targetScene === 'ending') {
            this.triggerEnding();
          } else if (obj.targetScene) {
            this.changeScene(obj.targetScene);
          }
        }
        break;
    }
  }

  private changeScene(sceneId: string): void {
    if (!SCENES[sceneId]) return;
    this.gameState.currentScene = sceneId;
    this.eventBus.emit('scene_change', sceneId);
    this.buildScene(sceneId);
    this.time.delayedCall(500, () => {
      this.showMessage(SCENES[sceneId].description, 3500);
    });
    this.autoSave();
  }

  private clearSceneObjects(): void {
    this.sceneObjects.forEach(container => container.destroy());
    this.sceneObjects.clear();
    this.sceneObjectsConfig.clear();
  }

  private createTopBar(): void {
    this.topBar = this.add.container(0, 0).setDepth(100);
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.85);
    bg.fillRect(0, 0, GAME_WIDTH, 54);
    bg.lineStyle(1, 0xc9a44c, 0.3);
    bg.beginPath();
    bg.moveTo(0, 54);
    bg.lineTo(GAME_WIDTH, 54);
    bg.strokePath();
    this.topBar.add(bg);

    const logo = this.add.text(16, 27, '🎭 废弃剧场', {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      color: '#c9a44c',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    this.topBar.add(logo);

    this.createTopBarButton(this.topBar, GAME_WIDTH - 32, 27, '💾', '保存游戏', () => {
      this.audio.playSfx('click');
      this.manualSave();
    });
    this.createTopBarButton(this.topBar, GAME_WIDTH - 88, 27, '🏠', '返回主菜单', () => {
      this.audio.playSfx('click');
      this.showConfirm('返回主菜单？未保存的进度会丢失。', () => {
        this.audio.stopBgm();
        this.scene.start('MenuScene');
      });
    });
    this.createTopBarButton(this.topBar, GAME_WIDTH - 144, 27, '🔊', '音效开关', () => {
      const newVal = !this.audio.isSfxEnabled();
      this.audio.setSfxEnabled(newVal);
      if (newVal) this.audio.playSfx('click');
      this.showMessage(newVal ? '音效已开启' : '音效已关闭', 1500);
    });
    this.createTopBarButton(this.topBar, GAME_WIDTH - 200, 27, '🎵', '音乐开关', () => {
      this.audio.setBgmEnabled(!this.audio.isBgmEnabled());
      this.audio.playSfx('click');
      this.showMessage(this.audio.isBgmEnabled() ? '背景音乐已开启' : '背景音乐已关闭', 1500);
    });
    this.createTopBarButton(this.topBar, GAME_WIDTH - 256, 27, '💡', '提示', () => {
      this.audio.playSfx('click');
      this.gameState.hintUsed++;
      this.showHint();
    });
  }

  private createTopBarButton(parent: Phaser.GameObjects.Container, x: number, y: number, icon: string, tooltip: string, cb: () => void): void {
    const btn = this.add.rectangle(x, y, 46, 40, 0x2a2015, 1)
      .setStrokeStyle(1, 0xc9a44c, 0.4)
      .setInteractive({ useHandCursor: true });
    parent.add(btn);
    parent.add(this.add.text(x, y, icon, {
      fontFamily: 'Apple Color Emoji, sans-serif',
      fontSize: '20px'
    }).setOrigin(0.5));

    btn.on('pointerover', () => btn.setFillStyle(0x3a3025, 1));
    btn.on('pointerout', () => btn.setFillStyle(0x2a2015, 1));
    btn.on('pointerdown', cb);
  }

  private createInventoryBar(): void {
    this.inventoryBar = this.add.container(0, GAME_HEIGHT - 96).setDepth(100);
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.85);
    bg.fillRect(0, 0, GAME_WIDTH, 96);
    bg.lineStyle(1, 0xc9a44c, 0.3);
    bg.beginPath();
    bg.moveTo(0, 0);
    bg.lineTo(GAME_WIDTH, 0);
    bg.strokePath();
    this.inventoryBar.add(bg);

    this.inventoryBar.add(this.add.text(16, 16, '🎒 背包', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '16px',
      color: '#c9a44c'
    }));

    const slotCount = 8;
    const slotSize = 64;
    const gap = 10;
    const totalW = slotCount * slotSize + (slotCount - 1) * gap;
    const startX = (GAME_WIDTH - totalW) / 2 + slotSize / 2;

    this.inventorySlots = [];
    for (let i = 0; i < slotCount; i++) {
      const x = startX + i * (slotSize + gap);
      const y = 48;
      const slot = this.createInventorySlot(x, y, slotSize, i);
      this.inventoryBar.add(slot);
      this.inventorySlots.push(slot);
    }
  }

  private createInventorySlot(x: number, y: number, size: number, index: number): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x1a1510, 1);
    bg.fillRoundedRect(-size / 2, -size / 2, size, size, 8);
    bg.lineStyle(2, 0x3a3025, 1);
    bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);
    container.add(bg);

    const iconText = this.add.text(0, -4, '', {
      fontFamily: 'Apple Color Emoji, sans-serif',
      fontSize: '28px'
    }).setOrigin(0.5);
    container.add(iconText);

    const nameText = this.add.text(0, size / 2 - 10, '', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '10px',
      color: '#cccccc'
    }).setOrigin(0.5);
    container.add(nameText);

    const selectFrame = this.add.graphics().setVisible(false);
    container.add(selectFrame);

    container.setSize(size, size);
    container.setDataEnabled();
    container.setData('index', index);
    container.setData('itemId', null);
    container.setData('bg', bg);
    container.setData('selectFrame', selectFrame);
    container.setData('iconText', iconText);
    container.setData('nameText', nameText);

    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', () => {
      const itemId = container.getData('itemId') as string | null;
      if (!itemId) return;
      this.audio.playSfx('click');
      const currentSelected = this.inventory.getSelectedItem();
      if (currentSelected && currentSelected !== itemId) {
        const result = this.inventory.tryCombine(currentSelected, itemId);
        if (result) {
          this.audio.playSfx('success');
          this.eventBus.emit('item_combine', result);
        } else {
          this.inventory.selectItem(itemId);
        }
      } else if (currentSelected === itemId) {
        this.inventory.selectItem(null);
      } else {
        this.inventory.selectItem(itemId);
      }
    });

    container.on('pointerover', () => {
      const itemId = container.getData('itemId') as string | null;
      if (itemId) {
        const data = this.inventory.getItemData(itemId);
        if (data) this.showTooltip(x, GAME_HEIGHT - 160, data);
      }
      bg.lineStyle(2, 0xc9a44c, 1);
      bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);
    });

    container.on('pointerout', () => {
      this.hideTooltip();
      if (container.getData('itemId')) {
        bg.lineStyle(2, 0x3a3025, 1);
      }
      bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);
    });

    return container;
  }

  private tooltipContainer: Phaser.GameObjects.Container | null = null;
  private showTooltip(x: number, y: number, data: { name: string; description: string }): void {
    this.hideTooltip();
    this.tooltipContainer = this.add.container(x, y).setDepth(200);
    const pad = 12;
    const w = 260;
    const descLines = this.getWrappedLines(data.description, 16);
    const h = pad * 3 + 24 + descLines.length * 18;

    const g = this.add.graphics();
    g.fillStyle(0x1a1510, 0.98);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    g.lineStyle(2, 0xc9a44c, 0.6);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
    this.tooltipContainer.add(g);

    this.tooltipContainer.add(this.add.text(-w / 2 + pad, -h / 2 + pad, data.name, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '16px',
      color: '#c9a44c',
      fontStyle: 'bold'
    }));

    this.tooltipContainer.add(this.add.text(-w / 2 + pad, -h / 2 + pad + 28, data.description, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '13px',
      color: '#cccccc',
      wordWrap: { width: w - pad * 2 }
    }));
  }

  private getWrappedLines(text: string, maxChars: number): string[] {
    const lines: string[] = [];
    for (let i = 0; i < text.length; i += maxChars) {
      lines.push(text.substring(i, i + maxChars));
    }
    return lines.length ? lines : [''];
  }

  private hideTooltip(): void {
    if (this.tooltipContainer) {
      this.tooltipContainer.destroy();
      this.tooltipContainer = null;
    }
  }

  private updateInventoryUI(): void {
    const items = this.inventory.getItems();
    const selected = this.inventory.getSelectedItem();

    this.inventorySlots.forEach((slot, i) => {
      const itemId = items[i] ?? null;
      const iconText = slot.getData('iconText') as Phaser.GameObjects.Text;
      const nameText = slot.getData('nameText') as Phaser.GameObjects.Text;
      const selectFrame = slot.getData('selectFrame') as Phaser.GameObjects.Graphics;
      const bg = slot.getData('bg') as Phaser.GameObjects.Graphics;
      const size = 64;

      slot.setData('itemId', itemId);

      if (itemId) {
        const data = this.inventory.getItemData(itemId);
        iconText.setText(data?.icon ?? '❓');
        nameText.setText(data?.name ?? '');
        bg.lineStyle(2, 0x555555, 1);
      } else {
        iconText.setText('');
        nameText.setText('');
        bg.lineStyle(2, 0x3a3025, 1);
      }
      bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 8);

      selectFrame.clear();
      if (itemId && itemId === selected) {
        selectFrame.lineStyle(3, 0x4ade80, 1);
        selectFrame.strokeRoundedRect(-size / 2 - 3, -size / 2 - 3, size + 6, size + 6, 10);
      }
      selectFrame.setVisible(itemId === selected);
    });
  }

  private showLightPuzzle(puzzleId: string): void {
    if (this.activePuzzlePanel) return;
    const puzzle = this.lightSystem.getPuzzle(puzzleId);
    if (!puzzle) return;

    this.hideTooltip();
    const overlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75)
      .setOrigin(0, 0).setDepth(300).setInteractive();
    this.activePuzzlePanel = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setDepth(301);

    const pw = 560;
    const ph = 520;

    const bg = this.add.graphics();
    bg.fillStyle(0x0f0a05, 1);
    bg.fillRoundedRect(-pw / 2, -ph / 2, pw, ph, 12);
    bg.lineStyle(2, 0xc9a44c, 0.6);
    bg.strokeRoundedRect(-pw / 2, -ph / 2, pw, ph, 12);
    this.activePuzzlePanel.add(bg);

    this.activePuzzlePanel.add(this.add.text(0, -ph / 2 + 36, `💡 ${puzzle.name}`, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '24px',
      color: '#c9a44c',
      fontStyle: 'bold'
    }).setOrigin(0.5));

    this.activePuzzlePanel.add(this.add.text(0, -ph / 2 + 72, '点亮正确的灯光组合，点击会影响相邻的灯', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '13px',
      color: '#888888'
    }).setOrigin(0.5));

    const hintText = this.add.text(0, -ph / 2 + 104, '', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '14px',
      color: '#666666'
    }).setOrigin(0.5);
    this.activePuzzlePanel.add(hintText);

    const puzzleArea = this.add.container(0, -20);
    this.activePuzzlePanel.add(puzzleArea);

    const lights: Phaser.GameObjects.Container[] = [];
    const renderLights = () => {
      puzzleArea.removeAll(true);
      lights.length = 0;
      puzzle.lights.forEach(light => {
        const lc = this.add.container(light.x - 425, light.y - 240);
        const r = 36;

        const g = this.add.graphics();
        if (light.on) {
          g.fillGradientStyle(0xffe678, 0xffe678, 0xff7a1e, 0xff7a1e, 1);
          g.fillCircle(0, 0, r * 1.5);
        }
        g.lineStyle(3, light.on ? 0xffdd44 : 0x444444, 1);
        g.fillStyle(light.on ? 0xffcc33 : 0x222222, 1);
        g.fillCircle(0, 0, r);
        g.strokeCircle(0, 0, r);
        lc.add(g);

        lc.add(this.add.text(0, 0, String(light.id + 1), {
          fontFamily: 'Georgia, serif',
          fontSize: '18px',
          color: light.on ? '#3a2a00' : '#888888',
          fontStyle: 'bold'
        }).setOrigin(0.5));

        lc.setSize(r * 2, r * 2);
        lc.setInteractive({ useHandCursor: true });
        lc.on('pointerover', () => lc.setScale(1.08));
        lc.on('pointerout', () => lc.setScale(1));
        lc.on('pointerdown', () => {
          this.audio.playSfx('light');
          this.lightSystem.toggleLight(puzzleId, light.id);
          renderLights();

          if (this.lightSystem.isSolved(puzzleId)) {
            this.time.delayedCall(400, () => this.onPuzzleSolved(puzzleId, reward));
          }
        });

        puzzleArea.add(lc);
        lights.push(lc);
      });
    };

    const reward = puzzle.reward;
    if (puzzleId === 'stage_puzzle') {
      hintText.setText('💡 提示：让上面三盏灯同时亮起');
    }
    renderLights();

    const resetBtn = this.createPanelBtn(-120, ph / 2 - 60, 180, 44, '🔄 重置谜题', '#666666', () => {
      this.audio.playSfx('click');
      this.lightSystem.resetPuzzle(puzzleId);
      renderLights();
    });
    this.activePuzzlePanel.add(resetBtn);

    const closeBtn = this.createPanelBtn(120, ph / 2 - 60, 180, 44, '❌ 关闭', '#8b4513', () => {
      this.audio.playSfx('click');
      this.closePuzzle();
      overlay.destroy();
    });
    this.activePuzzlePanel.add(closeBtn);
  }

  private createPanelBtn(x: number, y: number, w: number, h: number, text: string, color: string, cb: () => void): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const g = this.add.graphics();
    const col = Phaser.Display.Color.HexStringToColor(color).color;
    g.fillStyle(col, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    c.add(g);
    c.add(this.add.text(0, 0, text, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5));

    c.setSize(w, h).setInteractive({ useHandCursor: true });
    c.on('pointerover', () => { g.clear(); g.fillStyle(col, 1); g.fillRoundedRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4, 8); });
    c.on('pointerout', () => { g.clear(); g.fillStyle(col, 1); g.fillRoundedRect(-w / 2, -h / 2, w, h, 8); });
    c.on('pointerdown', cb);
    return c;
  }

  private onPuzzleSolved(puzzleId: string, reward?: string): void {
    if (this.gameState.solvedPuzzles.includes(puzzleId)) return;

    this.audio.playSfx('success');
    this.gameState.solvedPuzzles.push(puzzleId);
    this.eventBus.emit('puzzle_solve', puzzleId);

    this.showFloatingText('✨ 谜题解开了！', 0x4ade80);

    if (reward) {
      this.time.delayedCall(600, () => {
        this.audio.playSfx('pickup');
        this.inventory.addItem(reward);
        this.gameState.collectedItems.push(reward);
        const data = this.inventory.getItemData(reward);
        this.showClueModal(`谜题奖励！\n\n获得了「${data?.name ?? ''}」\n${data?.description ?? ''}`);
        this.eventBus.emit('item_pickup', reward);
      });
    }

    this.time.delayedCall(1800, () => {
      this.closePuzzle();
    });
    this.autoSave();

    const puzzleObj = Array.from(this.sceneObjectsConfig.values()).find(o => o.puzzleId === puzzleId);
    if (puzzleObj) {
      const cont = this.sceneObjects.get(puzzleObj.id);
      if (cont) {
        cont.iterate((child: unknown) => {
          if ((child as Phaser.GameObjects.Graphics).strokeRoundedRect) {
            const g = child as Phaser.GameObjects.Graphics;
            g.lineStyle(3, 0x4ade80, 1);
          }
        });
      }
    }
  }

  private closePuzzle(): void {
    if (this.activePuzzlePanel) {
      this.activePuzzlePanel.destroy();
      this.activePuzzlePanel = null;
    }
    this.children.each(child => {
      if ((child as Phaser.GameObjects.Rectangle).fillColor === 0x000000 &&
          (child as Phaser.GameObjects.Rectangle).depth === 300) {
        child.destroy();
      }
    });
  }

  private messageContainer: Phaser.GameObjects.Container | null = null;
  showMessage(text: string, duration = 3000): void {
    this.messageQueue.push({ text, duration });
    if (!this.isShowingMessage) {
      this.processMessageQueue();
    }
  }

  private processMessageQueue(): void {
    if (this.messageQueue.length === 0) {
      this.isShowingMessage = false;
      return;
    }
    this.isShowingMessage = true;
    const msg = this.messageQueue.shift()!;

    if (this.messageContainer) this.messageContainer.destroy();
    this.messageContainer = this.add.container(GAME_WIDTH / 2, 110).setDepth(150);
    const lines = this.getWrappedLines(msg.text, 38);
    const h = 28 + lines.length * 22;
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.85);
    g.fillRoundedRect(-340, -h / 2, 680, h, 8);
    g.lineStyle(1, 0xc9a44c, 0.4);
    g.strokeRoundedRect(-340, -h / 2, 680, h, 8);
    this.messageContainer.add(g);
    this.messageContainer.add(this.add.text(0, 0, msg.text, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '15px',
      color: '#cccccc',
      align: 'center',
      wordWrap: { width: 660 }
    }).setOrigin(0.5));

    this.messageContainer.setAlpha(0);
    this.tweens.add({
      targets: this.messageContainer,
      alpha: 1,
      duration: 250,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.time.delayedCall(msg.duration, () => {
          if (this.messageContainer) {
            this.tweens.add({
              targets: this.messageContainer,
              alpha: 0,
              duration: 250,
              ease: 'Quad.easeIn',
              onComplete: () => {
                if (this.messageContainer) {
                  this.messageContainer.destroy();
                  this.messageContainer = null;
                }
                this.processMessageQueue();
              }
            });
          }
        });
      }
    });
  }

  private clueModal: Phaser.GameObjects.Container | null = null;
  showClueModal(text: string): void {
    if (this.clueModal) this.clueModal.destroy();

    const overlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6)
      .setOrigin(0, 0).setDepth(250).setInteractive();
    this.clueModal = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setDepth(251);

    const w = 520;
    const lines = this.getWrappedLines(text, 32);
    const h = Math.max(200, 120 + lines.length * 24);

    const g = this.add.graphics();
    g.fillStyle(0x1a1208, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 12);
    g.lineStyle(2, 0xc9a44c, 0.5);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 12);
    this.clueModal.add(g);

    this.clueModal.add(this.add.text(0, -h / 2 + 32, '📜 线索', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '20px',
      color: '#c9a44c',
      fontStyle: 'bold'
    }).setOrigin(0.5));

    this.clueModal.add(this.add.text(0, 0, text, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '15px',
      color: '#dddddd',
      align: 'center',
      wordWrap: { width: w - 60 }
    }).setOrigin(0.5));

    const close = this.add.text(0, h / 2 - 36, '— 点击继续 —', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '14px',
      color: '#888888'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.clueModal.add(close);

    const doClose = () => {
      if (this.clueModal) {
        this.clueModal.destroy();
        this.clueModal = null;
      }
      overlay.destroy();
    };
    close.on('pointerdown', doClose);
    overlay.on('pointerdown', doClose);
  }

  private showFloatingText(text: string, color: number): void {
    const t = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, text, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '22px',
      color: Phaser.Display.Color.IntegerToColor(color).rgba,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(400).setShadow(2, 2, '#000', 4);

    this.tweens.add({
      targets: t,
      y: '-=80',
      alpha: { from: 1, to: 0 },
      duration: 1400,
      ease: 'Quad.easeOut',
      onComplete: () => t.destroy()
    });
  }

  private showConfirm(msg: string, onOk: () => void): void {
    const overlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.8)
      .setOrigin(0, 0).setDepth(500).setInteractive();
    const panel = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setDepth(501);

    const w = 420;
    const g = this.add.graphics();
    g.fillStyle(0x2a1f15, 1);
    g.fillRoundedRect(-w / 2, -110, w, 220, 10);
    g.lineStyle(2, 0xc9a44c, 0.5);
    g.strokeRoundedRect(-w / 2, -110, w, 220, 10);
    panel.add(g);

    panel.add(this.add.text(0, -40, msg, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '16px',
      color: '#cccccc',
      wordWrap: { width: w - 60 },
      align: 'center'
    }).setOrigin(0.5));

    const okBtn = this.createPanelBtn(-100, 50, 150, 40, '确定', '#8b4513', () => {
      overlay.destroy(); panel.destroy(); onOk();
    });
    panel.add(okBtn);
    const cancelBtn = this.createPanelBtn(100, 50, 150, 40, '取消', '#555555', () => {
      overlay.destroy(); panel.destroy();
    });
    panel.add(cancelBtn);
  }

  private showHint(): void {
    const hints: string[] = [];
    const cur = this.gameState.currentScene;
    const config = SCENES[cur];
    if (!config) return;

    config.objects.forEach(obj => {
      if (obj.type === 'item' && obj.containsItem && !this.gameState.collectedItems.includes(obj.containsItem)) {
        const item = this.inventory.getItemData(obj.containsItem);
        hints.push(`👉 检查「${obj.name}」，可能有「${item?.name ?? '物品'}」`);
      }
      if (obj.type === 'puzzle' && obj.puzzleId && !this.gameState.solvedPuzzles.includes(obj.puzzleId)) {
        hints.push(`💡 试试「${obj.name}」的灯光谜题`);
      }
      if (obj.type === 'door' && obj.requiredItem && !this.gameState.openedDoors.includes(obj.id)) {
        if (this.inventory.hasItem(obj.requiredItem)) {
          hints.push(`🔑 用「${this.inventory.getItemData(obj.requiredItem)?.name}」打开「${obj.name}」`);
        } else {
          hints.push(`🚪「${obj.name}」需要特定钥匙，找找其他场景吧`);
        }
      }
    });

    const allScenes = Object.keys(SCENES);
    allScenes.forEach(sid => {
      const s = SCENES[sid];
      s.objects.forEach(obj => {
        if (obj.containsItem && !this.gameState.collectedItems.includes(obj.containsItem)) {
          const item = this.inventory.getItemData(obj.containsItem);
          if (item?.canCombine) {
            const combineWith = item.combineWith?.filter(id =>
              this.gameState.collectedItems.includes(id) || this.inventory.hasItem(id)
            );
            if (combineWith && combineWith.length > 0) {
              const other = this.inventory.getItemData(combineWith[0]);
              hints.push(`🔧 「${item.name}」和「${other?.name}」可以组合！`);
            }
          }
        }
      });
    });

    if (hints.length === 0) {
      hints.push('🤔 探索其他场景，寻找更多线索...');
    }

    const hint = hints[0];
    this.showClueModal(`💡 提示系统\n\n${hint}\n\n（使用提示会扣除最终分数）`);
  }

  private autoSave(): void {
    this.gameState.inventory = this.inventory.getItems();
    this.gameState.selectedItem = this.inventory.getSelectedItem();
    this.saveSys.saveGame(this.gameState);
    this.eventBus.emit('save_game');
  }

  private manualSave(): void {
    this.autoSave();
    const ts = this.saveSys.formatTime(Date.now());
    this.showFloatingText(`✅ 游戏已保存 (${ts})`, 0x4ade80);
  }

  private bringUIToFront(): void {
    if (this.topBar) this.topBar.setDepth(100);
    if (this.inventoryBar) this.inventoryBar.setDepth(100);
  }

  private triggerEnding(): void {
    this.audio.stopBgm();
    this.audio.playSfx('win');
    this.gameState.inventory = this.inventory.getItems();
    this.eventBus.emit('game_complete');
    this.autoSave();
    this.scene.start('EndingScene', { state: this.gameState });
  }

  update(): void {
    if (this.gameState.collectedItems.length >= 9 &&
        this.gameState.solvedPuzzles.length >= 2 &&
        this.gameState.currentScene === 'backstage') {
    }
  }
}
