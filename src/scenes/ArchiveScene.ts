import { Scene } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config/levels';
import type { Clue, ArchiveDocument, ArchiveSearchResult, ArchiveLogEntry, DocumentFragment } from '@/types';
import { ArchiveSystem } from '@/systems/ArchiveSystem';
import { EventBus } from '@/systems/EventBus';
import { AudioManager } from '@/systems/AudioManager';

type TabType = 'clues' | 'puzzle' | 'logs' | 'search';
type ClueCategory = 'all' | 'person' | 'event' | 'item' | 'location' | 'secret';

export class ArchiveScene extends Scene {
  private archive: ArchiveSystem;
  private eventBus: EventBus;
  private audio: AudioManager;
  private returnSceneKey: string = 'GameScene';

  private activeTab: TabType = 'clues';
  private activeCategory: ClueCategory = 'all';
  private searchKeyword: string = '';
  private searchResults: ArchiveSearchResult[] = [];
  private selectedDocumentId: string | null = null;
  private selectedClueId: string | null = null;

  private tabContainers: Map<TabType, Phaser.GameObjects.Container> = new Map();
  private clueListContainer: Phaser.GameObjects.Container | null = null;
  private puzzleListContainer: Phaser.GameObjects.Container | null = null;
  private logListContainer: Phaser.GameObjects.Container | null = null;
  private searchResultContainer: Phaser.GameObjects.Container | null = null;
  private detailPanel: Phaser.GameObjects.Container | null = null;
  private searchInputBg: Phaser.GameObjects.Graphics | null = null;
  private searchInputText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super('ArchiveScene');
    this.archive = ArchiveSystem.getInstance();
    this.eventBus = EventBus.getInstance();
    this.audio = AudioManager.getInstance();
  }

  init(data: { returnScene?: string }): void {
    if (data?.returnScene) {
      this.returnSceneKey = data.returnScene;
    }
  }

  create(): void {
    this.audio.setScene(this);
    this.eventBus.emit('archive_scene_open');

    this.cameras.main.fadeIn(400, 0, 0, 0);

    this.createBackground();
    this.createHeader();
    this.createTabs();
    this.createMainContent();
    this.createFooter();
    this.switchTab(this.activeTab);
  }

  private createBackground(): void {
    const bg = this.add.graphics();
    bg.fillStyle(0x0f0a05, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const pattern = this.add.graphics();
    pattern.fillStyle(0x1a1208, 0.5);
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(80, GAME_HEIGHT - 120);
      pattern.fillCircle(x, y, Phaser.Math.Between(2, 6));
    }

    for (let i = 0; i < 15; i++) {
      const startX = Phaser.Math.Between(0, GAME_WIDTH);
      const startY = Phaser.Math.Between(0, GAME_HEIGHT);
      const endXOffset = Phaser.Math.Between(-30, 30);
      const dustCircle = this.add.circle(startX, startY, 2, 0xc9a44c, 0.3).setDepth(1);
      this.tweens.add({
        targets: dustCircle,
        y: startY - 100,
        x: startX + endXOffset,
        alpha: { from: 0.4, to: 0 },
        duration: Phaser.Math.Between(8000, 15000),
        repeat: -1,
        delay: Phaser.Math.Between(0, 5000)
      });
    }
  }

  private createHeader(): void {
    const headerBg = this.add.graphics();
    headerBg.fillStyle(0x000000, 0.9);
    headerBg.fillRect(0, 0, GAME_WIDTH, 70);
    headerBg.lineStyle(1, 0xc9a44c, 0.4);
    headerBg.beginPath();
    headerBg.moveTo(0, 70);
    headerBg.lineTo(GAME_WIDTH, 70);
    headerBg.strokePath();

    this.add.text(24, 35, '📜 剧院档案室', {
      fontFamily: 'Georgia, serif',
      fontSize: '28px',
      color: '#c9a44c',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5).setDepth(10);

    this.add.text(24, 58, 'Theater Archive — 记录着永夜的秘密', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '12px',
      color: '#666666'
    }).setOrigin(0, 0.5).setDepth(10);

    const stats = this.archive.getStats();
    const statsText = `线索 ${stats.discoveredClues}/${stats.totalClues} | 碎片 ${stats.collectedFragments}/${stats.totalFragments} | 文档 ${stats.completedDocuments}/${stats.totalDocuments}`;
    this.add.text(GAME_WIDTH - 24, 35, statsText, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '13px',
      color: '#888888'
    }).setOrigin(1, 0.5).setDepth(10);

    const closeBtn = this.createButton(GAME_WIDTH - 40, 35, '✕ 返回', '#8b4513', () => {
      this.audio.playSfx('click');
      this.closeArchive();
    });
    closeBtn.setDepth(10);
  }

  private createButton(x: number, y: number, text: string, color: string, cb: () => void): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const w = text.length * 16 + 32;
    const h = 36;
    const col = Phaser.Display.Color.HexStringToColor(color).color;

    const g = this.add.graphics();
    g.fillStyle(col, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    c.add(g);

    c.add(this.add.text(0, 0, text, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5));

    c.setSize(w, h).setInteractive({ useHandCursor: true });
    c.on('pointerover', () => {
      g.clear();
      g.fillStyle(col, 1);
      g.fillRoundedRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4, 6);
    });
    c.on('pointerout', () => {
      g.clear();
      g.fillStyle(col, 1);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    });
    c.on('pointerdown', cb);

    return c;
  }

  private createTabs(): void {
    const tabsY = 95;
    const tabs: { key: TabType; label: string; icon: string }[] = [
      { key: 'clues', label: '线索档案', icon: '🔍' },
      { key: 'puzzle', label: '文档拼图', icon: '🧩' },
      { key: 'search', label: '线索检索', icon: '🔎' },
      { key: 'logs', label: '探索日志', icon: '📋' }
    ];

    const tabWidth = 160;
    const gap = 8;
    const totalW = tabs.length * tabWidth + (tabs.length - 1) * gap;
    const startX = (GAME_WIDTH - totalW) / 2 + tabWidth / 2;

    tabs.forEach((tab, i) => {
      const x = startX + i * (tabWidth + gap);
      const container = this.createTabButton(x, tabsY, tabWidth, 44, tab.icon, tab.label, () => {
        this.audio.playSfx('click');
        this.switchTab(tab.key);
      });
      this.tabContainers.set(tab.key, container);
    });
  }

  private createTabButton(x: number, y: number, w: number, h: number, icon: string, label: string, cb: () => void): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);

    const g = this.add.graphics();
    g.fillStyle(0x1a1510, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    g.lineStyle(1, 0x3a3025, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
    c.add(g);

    c.add(this.add.text(-w / 2 + 16, 0, `${icon} ${label}`, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '15px',
      color: '#888888'
    }).setOrigin(0, 0.5));

    c.setSize(w, h).setInteractive({ useHandCursor: true });
    c.setData('bg', g);

    c.on('pointerover', () => {
      g.clear();
      g.fillStyle(0x2a2520, 1);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
      g.lineStyle(1, 0x5a5045, 1);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
    });
    c.on('pointerout', () => {
      if ((c as any).isActive) return;
      g.clear();
      g.fillStyle(0x1a1510, 1);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
      g.lineStyle(1, 0x3a3025, 1);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
    });
    c.on('pointerdown', cb);

    return c;
  }

  private setTabActive(tabKey: TabType, active: boolean): void {
    const container = this.tabContainers.get(tabKey);
    if (!container) return;

    const g = container.getData('bg') as Phaser.GameObjects.Graphics;
    (container as any).isActive = active;
    const w = 160, h = 44;

    g.clear();
    if (active) {
      g.fillStyle(0x3a2a15, 1);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
      g.lineStyle(2, 0xc9a44c, 1);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
    } else {
      g.fillStyle(0x1a1510, 1);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
      g.lineStyle(1, 0x3a3025, 1);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
    }

    container.each((child: any) => {
      if (child.type === 'Text') {
        child.setColor(active ? '#c9a44c' : '#888888');
      }
    });
  }

  private createMainContent(): void {
    const areaY = 160;
    const areaH = GAME_HEIGHT - 250;

    const contentBg = this.add.graphics();
    contentBg.fillStyle(0x15100a, 0.6);
    contentBg.fillRect(20, areaY, GAME_WIDTH - 40, areaH);
    contentBg.lineStyle(1, 0x2a2015, 0.8);
    contentBg.strokeRect(20, areaY, GAME_WIDTH - 40, areaH);
  }

  private switchTab(tab: TabType): void {
    this.activeTab = tab;

    (['clues', 'puzzle', 'search', 'logs'] as TabType[]).forEach(key => this.setTabActive(key, key === tab));

    this.clearContentArea();

    switch (tab) {
      case 'clues':
        this.renderCluesTab();
        break;
      case 'puzzle':
        this.renderPuzzleTab();
        break;
      case 'search':
        this.renderSearchTab();
        break;
      case 'logs':
        this.renderLogsTab();
        break;
    }
  }

  private clearContentArea(): void {
    if (this.clueListContainer) { this.clueListContainer.destroy(); this.clueListContainer = null; }
    if (this.puzzleListContainer) { this.puzzleListContainer.destroy(); this.puzzleListContainer = null; }
    if (this.logListContainer) { this.logListContainer.destroy(); this.logListContainer = null; }
    if (this.searchResultContainer) { this.searchResultContainer.destroy(); this.searchResultContainer = null; }
    if (this.detailPanel) { this.detailPanel.destroy(); this.detailPanel = null; }
    if (this.searchInputBg) { this.searchInputBg.destroy(); this.searchInputBg = null; }
    if (this.searchInputText) { this.searchInputText.destroy(); this.searchInputText = null; }
  }

  private createCategoryFilter(x: number, y: number): void {
    const categories: { key: ClueCategory; label: string }[] = [
      { key: 'all', label: '全部' },
      { key: 'person', label: '人物' },
      { key: 'event', label: '事件' },
      { key: 'item', label: '物品' },
      { key: 'location', label: '地点' },
      { key: 'secret', label: '秘密' }
    ];

    categories.forEach((cat, i) => {
      const bx = x + i * 80;
      const isActive = this.activeCategory === cat.key;
      const btn = this.createSmallFilterBtn(bx, y, cat.label, isActive, () => {
        this.audio.playSfx('click');
        this.activeCategory = cat.key;
        this.renderCluesList();
        this.createCategoryFilter(x, y);
      });
    });
  }

  private createSmallFilterBtn(x: number, y: number, label: string, active: boolean, cb: () => void): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const w = 72, h = 28;
    const g = this.add.graphics();

    if (active) {
      g.fillStyle(0xc9a44c, 0.3);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 4);
      g.lineStyle(1, 0xc9a44c, 1);
    } else {
      g.fillStyle(0x2a2015, 1);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 4);
      g.lineStyle(1, 0x4a4035, 1);
    }
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 4);
    c.add(g);

    c.add(this.add.text(0, 0, label, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '12px',
      color: active ? '#c9a44c' : '#888888'
    }).setOrigin(0.5));

    c.setSize(w, h).setInteractive({ useHandCursor: true });
    c.on('pointerdown', cb);

    return c;
  }

  private renderCluesTab(): void {
    this.clueListContainer = this.add.container(0, 0);

    this.createCategoryFilter(330, 185);

    const listX = 40;
    const listY = 230;
    const listW = 420;
    const listH = GAME_HEIGHT - 310;

    const listBg = this.add.graphics();
    listBg.fillStyle(0x1a1208, 0.8);
    listBg.fillRoundedRect(listX, listY, listW, listH, 8);
    listBg.lineStyle(1, 0x3a2a15, 1);
    listBg.strokeRoundedRect(listX, listY, listW, listH, 8);
    this.clueListContainer.add(listBg);

    this.clueListContainer.add(this.add.text(listX + 16, listY + 16, '📁 已发现线索', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '16px',
      color: '#c9a44c'
    }));

    this.renderCluesList();
  }

  private renderCluesList(): void {
    if (!this.clueListContainer) return;

    const children = this.clueListContainer.list.filter((_, i) => i >= 2);
    children.forEach(c => c.destroy());

    const listX = 40;
    const listY = 230;
    const listW = 420;
    const padding = 16;
    const itemH = 70;
    const startY = listY + 52;

    let clues: Clue[];
    if (this.activeCategory === 'all') {
      clues = this.archive.getDiscoveredClues();
    } else {
      clues = this.archive.getCluesByCategory(this.activeCategory);
    }

    clues.sort((a, b) => (a.discoveredAt ?? 0) - (b.discoveredAt ?? 0));

    if (clues.length === 0) {
      this.clueListContainer.add(this.add.text(listX + listW / 2, startY + 80, '暂无发现的线索...\n\n继续探索剧院，寻找更多线索吧！', {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '14px',
        color: '#666666',
        align: 'center'
      }).setOrigin(0.5));
      return;
    }

    clues.forEach((clue, i) => {
      const y = startY + i * (itemH + 8);
      if (y + itemH > listY + GAME_HEIGHT - 310 - 16) return;

      const isSelected = this.selectedClueId === clue.id;
      const item = this.createClueListItem(listX + padding, y, listW - padding * 2, itemH, clue, isSelected);
      this.clueListContainer!.add(item);
    });

    this.clueListContainer.add(this.add.text(listX + listW - 16, listY + 16, `${clues.length} 条`, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '13px',
      color: '#666666'
    }).setOrigin(1, 0));
  }

  private createClueListItem(x: number, y: number, w: number, h: number, clue: Clue, selected: boolean): Phaser.GameObjects.Container {
    const c = this.add.container(x + w / 2, y + h / 2);
    const g = this.add.graphics();

    if (selected) {
      g.fillStyle(0x3a2a15, 1);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      g.lineStyle(2, 0xc9a44c, 0.8);
    } else {
      g.fillStyle(0x2a2015, 0.8);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      g.lineStyle(1, 0x4a3a25, 1);
    }
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    c.add(g);

    c.add(this.add.text(-w / 2 + 16, -h / 2 + 14, clue.icon, {
      fontFamily: 'Apple Color Emoji, sans-serif',
      fontSize: '26px'
    }).setOrigin(0, 0.5));

    c.add(this.add.text(-w / 2 + 58, -h / 2 + 14, clue.title, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '16px',
      color: selected ? '#c9a44c' : '#dddddd',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5));

    const categoryLabels: Record<string, string> = {
      person: '人物', event: '事件', item: '物品', location: '地点', secret: '秘密'
    };
    c.add(this.add.text(-w / 2 + 58, -h / 2 + 38, `【${categoryLabels[clue.category] || clue.category}】 ${clue.description.substring(0, 28)}`, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '12px',
      color: '#888888'
    }).setOrigin(0, 0.5));

    c.setSize(w, h).setInteractive({ useHandCursor: true });
    c.on('pointerover', () => {
      if (selected) return;
      g.clear();
      g.fillStyle(0x3a2a15, 0.9);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      g.lineStyle(1, 0x6a5a45, 1);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    });
    c.on('pointerout', () => {
      if (selected) return;
      g.clear();
      g.fillStyle(0x2a2015, 0.8);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      g.lineStyle(1, 0x4a3a25, 1);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    });
    c.on('pointerdown', () => {
      this.audio.playSfx('click');
      this.selectedClueId = clue.id;
      this.renderCluesList();
      this.showClueDetail(clue);
    });

    return c;
  }

  private showClueDetail(clue: Clue): void {
    if (this.detailPanel) { this.detailPanel.destroy(); }

    this.detailPanel = this.add.container(0, 0);
    const px = 480;
    const py = 230;
    const pw = GAME_WIDTH - 520;
    const ph = GAME_HEIGHT - 310;

    const g = this.add.graphics();
    g.fillStyle(0x1a1208, 0.9);
    g.fillRoundedRect(px, py, pw, ph, 8);
    g.lineStyle(1, 0x3a2a15, 1);
    g.strokeRoundedRect(px, py, pw, ph, 8);
    this.detailPanel.add(g);

    this.detailPanel.add(this.add.text(px + 20, py + 24, `${clue.icon} ${clue.title}`, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '22px',
      color: '#c9a44c',
      fontStyle: 'bold'
    }));

    this.detailPanel.add(this.add.text(px + pw - 20, py + 24, clue.discoveredAt ? this.archive.formatLogTime(clue.discoveredAt) : '', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '12px',
      color: '#666666'
    }).setOrigin(1, 0));

    const hr = this.add.graphics();
    hr.lineStyle(1, 0x3a2a15, 1);
    hr.beginPath();
    hr.moveTo(px + 20, py + 56);
    hr.lineTo(px + pw - 20, py + 56);
    hr.strokePath();
    this.detailPanel.add(hr);

    const contentText = this.add.text(px + 24, py + 76, clue.content, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '14px',
      color: '#cccccc',
      wordWrap: { width: pw - 48 },
      lineSpacing: 6
    });
    this.detailPanel.add(contentText);

    const tagsY = py + 76 + contentText.height + 24;
    this.detailPanel.add(this.add.text(px + 24, tagsY, '标签:', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '13px',
      color: '#888888'
    }));

    let tagX = px + 60;
    clue.tags.forEach(tag => {
      const tagW = tag.length * 14 + 16;
      const tg = this.add.graphics();
      tg.fillStyle(0x2a2015, 1);
      tg.fillRoundedRect(tagX, tagsY - 14, tagW, 24, 4);
      tg.lineStyle(1, 0x5a4a35, 1);
      tg.strokeRoundedRect(tagX, tagsY - 14, tagW, 24, 4);
      this.detailPanel!.add(tg);
      this.detailPanel!.add(this.add.text(tagX + tagW / 2, tagsY - 2, `#${tag}`, {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '12px',
        color: '#c9a44c'
      }).setOrigin(0.5));
      tagX += tagW + 8;
    });

    const related = this.archive.getRelatedDiscoveredClues(clue.id);
    if (related.length > 0) {
      const relY = tagsY + 36;
      this.detailPanel.add(this.add.text(px + 24, relY, `关联线索 (${related.length}):`, {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '13px',
        color: '#888888'
      }));

      related.forEach((r, i) => {
        const ry = relY + 28 + i * 32;
        const btn = this.createSmallFilterBtn(px + 120, ry, `${r.icon} ${r.title}`, false, () => {
          this.audio.playSfx('click');
          this.selectedClueId = r.id;
          this.renderCluesList();
          this.showClueDetail(r);
        });
      });
    }
  }

  private renderPuzzleTab(): void {
    this.puzzleListContainer = this.add.container(0, 0);

    const listX = 40;
    const listY = 170;
    const listW = 420;
    const listH = GAME_HEIGHT - 250;

    const listBg = this.add.graphics();
    listBg.fillStyle(0x1a1208, 0.8);
    listBg.fillRoundedRect(listX, listY, listW, listH, 8);
    listBg.lineStyle(1, 0x3a2a15, 1);
    listBg.strokeRoundedRect(listX, listY, listW, listH, 8);
    this.puzzleListContainer.add(listBg);

    this.puzzleListContainer.add(this.add.text(listX + 16, listY + 16, '📚 文档拼图', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '16px',
      color: '#c9a44c'
    }));

    const docs = this.archive.getAllDocumentsProgress();
    const padding = 16;
    const itemH = 110;
    const startY = listY + 52;

    docs.forEach((doc, i) => {
      const y = startY + i * (itemH + 12);
      const item = this.createDocumentProgressItem(listX + padding, y, listW - padding * 2, itemH, doc);
      this.puzzleListContainer!.add(item);
    });
  }

  private createDocumentProgressItem(x: number, y: number, w: number, h: number, doc: { id: string; title: string; type: ArchiveDocument['type']; collectedCount: number; totalCount: number; progress: number; completed: boolean }): Phaser.GameObjects.Container {
    const c = this.add.container(x + w / 2, y + h / 2);
    const isSelected = this.selectedDocumentId === doc.id;
    const g = this.add.graphics();

    if (doc.completed) {
      g.fillStyle(isSelected ? 0x1a3a1a : 0x152a15, 1);
    } else {
      g.fillStyle(isSelected ? 0x3a2a15 : 0x2a2015, 0.9);
    }
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
    g.lineStyle(isSelected ? 2 : 1, doc.completed ? 0x4a6a4a : 0x5a4a35, isSelected ? 1 : 0.8);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
    c.add(g);

    const typeIcons: Record<string, string> = {
      diary: '📔', report: '📋', letter: '💌', newspaper: '📰', contract: '📄', script: '📜'
    };

    c.add(this.add.text(-w / 2 + 16, -h / 2 + 22, typeIcons[doc.type] || '📄', {
      fontFamily: 'Apple Color Emoji, sans-serif',
      fontSize: '28px'
    }).setOrigin(0, 0.5));

    c.add(this.add.text(-w / 2 + 60, -h / 2 + 22, doc.title, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '17px',
      color: doc.completed ? '#6aaa6a' : '#dddddd',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5));

    const progressBarW = w - 80;
    const progressBarH = 14;
    const progressX = -w / 2 + 60;
    const progressY = -h / 2 + 48;

    const pbBg = this.add.graphics();
    pbBg.fillStyle(0x1a1510, 1);
    pbBg.fillRoundedRect(progressX, progressY, progressBarW, progressBarH, 4);
    pbBg.lineStyle(1, 0x4a3a25, 1);
    pbBg.strokeRoundedRect(progressX, progressY, progressBarW, progressBarH, 4);
    c.add(pbBg);

    const fillW = Math.max(4, Math.floor(progressBarW * doc.progress));
    const pbFill = this.add.graphics();
    pbFill.fillStyle(doc.completed ? 0x4ade80 : 0xc9a44c, 1);
    pbFill.fillRoundedRect(progressX, progressY, fillW, progressBarH, 4);
    c.add(pbFill);

    const progressText = doc.completed ? '✅ 已完成' : '🧩 收集进度: ' + doc.collectedCount + '/' + doc.totalCount;
    c.add(this.add.text(-w / 2 + 60, -h / 2 + 78, progressText, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '13px',
      color: doc.completed ? '#4ade80' : '#aaaaaa'
    }).setOrigin(0, 0.5));

    c.setSize(w, h).setInteractive({ useHandCursor: true });
    c.on('pointerover', () => {
      if (isSelected) return;
      g.clear();
      g.fillStyle(doc.completed ? 0x2a4a2a : 0x3a2a15, 0.9);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
      g.lineStyle(1, doc.completed ? 0x6a8a6a : 0x6a5a45, 1);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
    });
    c.on('pointerout', () => {
      if (isSelected) return;
      g.clear();
      g.fillStyle(doc.completed ? 0x152a15 : 0x2a2015, 0.9);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 8);
      g.lineStyle(1, doc.completed ? 0x4a6a4a : 0x4a3a25, 0.8);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 8);
    });
    c.on('pointerdown', () => {
      this.audio.playSfx('click');
      this.selectedDocumentId = doc.id;
      this.renderPuzzleTab();
      this.showDocumentDetail(doc.id);
    });

    return c;
  }

  private showDocumentDetail(docId: string): void {
    if (this.detailPanel) { this.detailPanel.destroy(); }

    const doc = this.archive.getDocument(docId);
    if (!doc) return;
    const fragments = this.archive.getFragmentsByDocument(docId);

    this.detailPanel = this.add.container(0, 0);
    const px = 480;
    const py = 170;
    const pw = GAME_WIDTH - 520;
    const ph = GAME_HEIGHT - 250;

    const g = this.add.graphics();
    g.fillStyle(0x1a1208, 0.9);
    g.fillRoundedRect(px, py, pw, ph, 8);
    g.lineStyle(1, 0x3a2a15, 1);
    g.strokeRoundedRect(px, py, pw, ph, 8);
    this.detailPanel.add(g);

    if (doc.completed) {
      this.detailPanel.add(this.add.text(px + pw - 20, py + 24, '✅ 已完成', {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '14px',
        color: '#4ade80'
      }).setOrigin(1, 0));
    }

    this.detailPanel.add(this.add.text(px + 20, py + 28, `📜 ${doc.title}`, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '20px',
      color: '#c9a44c',
      fontStyle: 'bold'
    }));

    this.detailPanel.add(this.add.text(px + 20, py + 56, `作者: ${doc.author} | 日期: ${doc.date}`, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '13px',
      color: '#888888'
    }));

    const hr = this.add.graphics();
    hr.lineStyle(1, 0x3a2a15, 1);
    hr.beginPath();
    hr.moveTo(px + 20, py + 82);
    hr.lineTo(px + pw - 20, py + 82);
    hr.strokePath();
    this.detailPanel.add(hr);

    if (doc.completed) {
      const contentY = py + 100;
      const contentH = ph - 200;

      const scrollBg = this.add.graphics();
      scrollBg.fillStyle(0x0f0a05, 0.6);
      scrollBg.fillRoundedRect(px + 16, contentY, pw - 32, contentH, 6);
      scrollBg.lineStyle(1, 0x2a2015, 1);
      scrollBg.strokeRoundedRect(px + 16, contentY, pw - 32, contentH, 6);
      this.detailPanel.add(scrollBg);

      const content = this.add.text(px + 32, contentY + 16, doc.assembledContent, {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '13px',
        color: '#cccccc',
        wordWrap: { width: pw - 64 },
        lineSpacing: 4
      });
      this.detailPanel.add(content);

      const readBtn = this.createButton(px + pw / 2 - 70, py + ph - 40, '📖 标记已读', doc.isRead ? '#444444' : '#8b4513', () => {
        if (doc.isRead) return;
        this.audio.playSfx('success');
        this.archive.markDocumentRead(docId);
        this.showDocumentDetail(docId);
      });

      if (doc.isRead) {
        this.detailPanel.add(this.add.text(px + pw / 2, py + ph - 40, '— 已阅读 —', {
          fontFamily: 'Microsoft YaHei, sans-serif',
          fontSize: '13px',
          color: '#666666'
        }).setOrigin(0.5));
      }

      this.detailPanel.add(this.add.text(px + 20, py + ph - 72, '💡 摘要:', {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '13px',
        color: '#c9a44c'
      }));
      this.detailPanel.add(this.add.text(px + 70, py + ph - 72, doc.summary, {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '12px',
        color: '#aaaaaa',
        wordWrap: { width: pw - 100 }
      }));
    } else {
      this.detailPanel.add(this.add.text(px + 20, py + 100, '🧩 碎片收集进度:', {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '14px',
        color: '#c9a44c'
      }));

      fragments.forEach((frag, i) => {
        const fy = py + 140 + i * 80;
        this.renderFragmentCard(px + 20, fy, pw - 40, 70, frag);
      });

      this.detailPanel.add(this.add.text(px + pw / 2, py + ph - 40, '收集所有碎片以解锁完整文档...', {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '13px',
        color: '#666666'
      }).setOrigin(0.5));
    }
  }

  private renderFragmentCard(x: number, y: number, w: number, h: number, frag: DocumentFragment): void {
    const c = this.add.container(x + w / 2, y + h / 2);
    const g = this.add.graphics();

    if (frag.collected) {
      g.fillStyle(0x1a3a1a, 1);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      g.lineStyle(1, 0x4a6a4a, 1);
    } else {
      g.fillStyle(0x1a1510, 1);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      g.lineStyle(1, 0x3a3025, 0.5);
    }
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    this.detailPanel!.add(c);
    this.detailPanel!.add(g);

    const statusIcon = frag.collected ? '✅' : '❓';
    c.add(this.add.text(-w / 2 + 16, 0, statusIcon, {
      fontFamily: 'Apple Color Emoji, sans-serif',
      fontSize: '24px'
    }).setOrigin(0, 0.5));

    c.add(this.add.text(-w / 2 + 56, -h / 2 + 18, frag.title, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '14px',
      color: frag.collected ? '#6aaa6a' : '#888888',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5));

    const descText = frag.collected
      ? frag.content.substring(0, 40) + '...'
      : `💡 提示: ${frag.hint}`;
    c.add(this.add.text(-w / 2 + 56, -h / 2 + 42, descText, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '12px',
      color: frag.collected ? '#aaaaaa' : '#666666'
    }).setOrigin(0, 0.5));

    c.add(this.add.text(-w / 2 + w - 16, 0, `${frag.position + 1}/${frag.totalPieces}`, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '13px',
      color: frag.collected ? '#4ade80' : '#555555'
    }).setOrigin(1, 0.5));
  }

  private renderSearchTab(): void {
    this.searchResultContainer = this.add.container(0, 0);

    const inputX = 60;
    const inputY = 190;
    const inputW = GAME_WIDTH - 120;
    const inputH = 48;

    this.searchInputBg = this.add.graphics();
    this.searchInputBg.fillStyle(0x1a1208, 1);
    this.searchInputBg.fillRoundedRect(inputX, inputY, inputW, inputH, 8);
    this.searchInputBg.lineStyle(1, this.searchKeyword ? 0xc9a44c : 0x4a3a25, 1);
    this.searchInputBg.strokeRoundedRect(inputX, inputY, inputW, inputH, 8);

    this.searchResultContainer.add(this.add.text(inputX + 16, inputY + inputH / 2, '🔎', {
      fontFamily: 'Apple Color Emoji, sans-serif',
      fontSize: '22px'
    }).setOrigin(0, 0.5));

    this.searchInputText = this.add.text(inputX + 56, inputY + inputH / 2, this.searchKeyword || '输入关键词搜索线索和文档...', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '16px',
      color: this.searchKeyword ? '#dddddd' : '#666666'
    }).setOrigin(0, 0.5);
    this.searchResultContainer.add(this.searchInputText);

    const clearBtn = this.createButton(inputX + inputW - 60, inputY + inputH / 2, this.searchKeyword ? '清除' : '搜索', '#8b4513', () => {
      this.audio.playSfx('click');
      if (this.searchKeyword) {
        this.searchKeyword = '';
        this.searchResults = [];
        this.renderSearchTab();
        this.renderSearchResults();
      } else {
        this.promptSearchInput();
      }
    });

    const history = this.archive.getSearchHistory().slice(0, 8);
    if (history.length > 0 && !this.searchKeyword) {
      this.searchResultContainer.add(this.add.text(inputX, inputY + 70, '🕐 最近搜索:', {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '13px',
        color: '#666666'
      }));

      let hx = inputX + 110;
      history.forEach(kw => {
        const kwW = kw.length * 14 + 20;
        if (hx + kwW > inputX + inputW) return;
        const hg = this.add.graphics();
        hg.fillStyle(0x2a2015, 1);
        hg.fillRoundedRect(hx, inputY + 58, kwW, 26, 4);
        this.searchResultContainer!.add(hg);
        const kwText = this.add.text(hx + kwW / 2, inputY + 71, kw, {
          fontFamily: 'Microsoft YaHei, sans-serif',
          fontSize: '12px',
          color: '#c9a44c'
        }).setOrigin(0.5);
        this.searchResultContainer!.add(kwText);

        kwText.setInteractive({ useHandCursor: true });
        kwText.on('pointerdown', () => {
          this.audio.playSfx('click');
          this.searchKeyword = kw;
          this.executeSearch();
        });

        hx += kwW + 8;
      });
    }

    this.renderSearchResults();
  }

  private promptSearchInput(): void {
    const overlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7).setOrigin(0, 0).setDepth(500).setInteractive();

    const panelW = 500;
    const panelH = 180;
    const panel = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setDepth(501);

    const g = this.add.graphics();
    g.fillStyle(0x1a1208, 1);
    g.fillRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 12);
    g.lineStyle(2, 0xc9a44c, 0.6);
    g.strokeRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, 12);
    panel.add(g);

    panel.add(this.add.text(0, -panelH / 2 + 40, '输入搜索关键词', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '20px',
      color: '#c9a44c',
      fontStyle: 'bold'
    }).setOrigin(0.5));

    const inputBg = this.add.graphics();
    inputBg.fillStyle(0x0f0a05, 1);
    inputBg.fillRoundedRect(-panelW / 2 + 40, -20, panelW - 80, 48, 6);
    inputBg.lineStyle(1, 0x4a3a25, 1);
    inputBg.strokeRoundedRect(-panelW / 2 + 40, -20, panelW - 80, 48, 6);
    panel.add(inputBg);

    let tempKeyword = this.searchKeyword;
    const inputText = this.add.text(-panelW / 2 + 56, 4, tempKeyword || '点击输入...', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '16px',
      color: tempKeyword ? '#dddddd' : '#666666'
    }).setOrigin(0, 0.5);
    panel.add(inputText);

    const okBtn = this.createPanelBtnLocal(panel, -100, panelH / 2 - 50, 140, 40, '🔍 搜索', '#8b4513', () => {
      this.searchKeyword = tempKeyword.trim();
      overlay.destroy();
      panel.destroy();
      this.renderSearchTab();
      if (this.searchKeyword) {
        this.executeSearch();
      }
    });

    const cancelBtn = this.createPanelBtnLocal(panel, 100, panelH / 2 - 50, 140, 40, '取消', '#555555', () => {
      overlay.destroy();
      panel.destroy();
    });

    const charMap: Record<string, string> = {
      'backspace': '', 'enter': ''
    };

    this.input.on('pointerdown', () => {});
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      const key = event.key;
      if (key === 'Backspace') {
        tempKeyword = tempKeyword.slice(0, -1);
      } else if (key === 'Enter') {
        this.searchKeyword = tempKeyword.trim();
        overlay.destroy();
        panel.destroy();
        this.renderSearchTab();
        if (this.searchKeyword) this.executeSearch();
        return;
      } else if (key.length === 1 && tempKeyword.length < 30) {
        tempKeyword += key;
      }
      inputText.setText(tempKeyword || '点击输入...');
      inputText.setColor(tempKeyword ? '#dddddd' : '#666666');
    });

    overlay.on('pointerdown', () => {
      overlay.destroy();
      panel.destroy();
    });
  }

  private createPanelBtnLocal(parent: Phaser.GameObjects.Container, x: number, y: number, w: number, h: number, text: string, color: string, cb: () => void): Phaser.GameObjects.Container {
    const c = this.add.container(x, y);
    const col = Phaser.Display.Color.HexStringToColor(color).color;
    const g = this.add.graphics();
    g.fillStyle(col, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    c.add(g);
    c.add(this.add.text(0, 0, text, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '15px',
      color: '#ffffff'
    }).setOrigin(0.5));
    c.setSize(w, h).setInteractive({ useHandCursor: true });
    c.on('pointerover', () => { g.clear(); g.fillStyle(col, 1); g.fillRoundedRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4, 6); });
    c.on('pointerout', () => { g.clear(); g.fillStyle(col, 1); g.fillRoundedRect(-w / 2, -h / 2, w, h, 6); });
    c.on('pointerdown', cb);
    parent.add(c);
    return c;
  }

  private executeSearch(): void {
    if (!this.searchKeyword.trim()) return;
    this.searchResults = this.archive.search(this.searchKeyword);
    this.renderSearchResults();
  }

  private renderSearchResults(): void {
    if (!this.searchResultContainer) return;

    const resultX = 60;
    const resultY = 280;
    const resultW = GAME_WIDTH - 120;
    const resultH = GAME_HEIGHT - 370;

    const oldResults = this.searchResultContainer.list.filter((_, i) => i >= 5);
    oldResults.forEach(c => c.destroy());

    const resultBg = this.add.graphics();
    resultBg.fillStyle(0x1a1208, 0.8);
    resultBg.fillRoundedRect(resultX, resultY, resultW, resultH, 8);
    resultBg.lineStyle(1, 0x3a2a15, 1);
    resultBg.strokeRoundedRect(resultX, resultY, resultW, resultH, 8);
    this.searchResultContainer.add(resultBg);

    if (this.searchKeyword) {
      this.searchResultContainer.add(this.add.text(resultX + 16, resultY + 16, `📋 搜索结果: "${this.searchKeyword}"`, {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '15px',
        color: '#c9a44c'
      }));
      this.searchResultContainer.add(this.add.text(resultX + resultW - 16, resultY + 16, `${this.searchResults.length} 个结果`, {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '13px',
        color: '#666666'
      }).setOrigin(1, 0));
    } else {
      this.searchResultContainer.add(this.add.text(resultX + 16, resultY + 16, '📋 搜索结果', {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '15px',
        color: '#888888'
      }));
    }

    if (this.searchResults.length === 0) {
      const msg = this.searchKeyword
        ? `未找到与 "${this.searchKeyword}" 相关的结果\n\n尝试其他关键词，或继续探索剧院发现更多线索`
        : '在上方输入关键词开始搜索\n\n支持搜索：人名、事件、物品、地点等';
      this.searchResultContainer.add(this.add.text(resultX + resultW / 2, resultY + resultH / 2, msg, {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '14px',
        color: '#666666',
        align: 'center'
      }).setOrigin(0.5));
      return;
    }

    const padding = 16;
    const itemH = 84;
    const startY = resultY + 52;

    this.searchResults.forEach((result, i) => {
      const y = startY + i * (itemH + 8);
      if (y + itemH > resultY + resultH - 16) return;
      const item = this.createSearchResultItem(resultX + padding, y, resultW - padding * 2, itemH, result);
      this.searchResultContainer!.add(item);
    });
  }

  private createSearchResultItem(x: number, y: number, w: number, h: number, result: ArchiveSearchResult): Phaser.GameObjects.Container {
    const c = this.add.container(x + w / 2, y + h / 2);
    const g = this.add.graphics();
    g.fillStyle(0x2a2015, 0.9);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
    g.lineStyle(1, 0x4a3a25, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    c.add(g);

    const typeIcon = result.type === 'clue' ? '🔍' : '📜';
    const typeLabel = result.type === 'clue' ? '线索' : '文档';
    const typeColor = result.type === 'clue' ? '#c9a44c' : '#6a8ac9';

    c.add(this.add.text(-w / 2 + 16, -h / 2 + 20, typeIcon, {
      fontFamily: 'Apple Color Emoji, sans-serif',
      fontSize: '26px'
    }).setOrigin(0, 0.5));

    c.add(this.add.text(-w / 2 + 58, -h / 2 + 20, result.title, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '16px',
      color: '#dddddd',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5));

    const typeBadge = this.add.graphics();
    typeBadge.fillStyle(Phaser.Display.Color.HexStringToColor(typeColor).color, 0.2);
    typeBadge.fillRoundedRect(-w / 2 + w - 80, -h / 2 + 8, 64, 24, 4);
    c.add(typeBadge);
    c.add(this.add.text(-w / 2 + w - 48, -h / 2 + 20, typeLabel, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '12px',
      color: typeColor
    }).setOrigin(0.5));

    c.add(this.add.text(-w / 2 + 58, -h / 2 + 46, result.excerpt, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '12px',
      color: '#888888',
      wordWrap: { width: w - 160 }
    }).setOrigin(0, 0.5));

    if (result.matchedTags.length > 0) {
      let tx = -w / 2 + 58;
      result.matchedTags.slice(0, 3).forEach(tag => {
        const tw = tag.length * 12 + 12;
        const tg = this.add.graphics();
        tg.fillStyle(0x3a2a15, 1);
        tg.fillRoundedRect(tx, -h / 2 + 60, tw, 18, 3);
        c.add(tg);
        c.add(this.add.text(tx + tw / 2, -h / 2 + 69, `#${tag}`, {
          fontFamily: 'Microsoft YaHei, sans-serif',
          fontSize: '10px',
          color: '#c9a44c'
        }).setOrigin(0.5));
        tx += tw + 6;
      });
    }

    c.setSize(w, h).setInteractive({ useHandCursor: true });
    c.on('pointerover', () => {
      g.clear();
      g.fillStyle(0x3a2a15, 1);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      g.lineStyle(1, 0x6a5a45, 1);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    });
    c.on('pointerout', () => {
      g.clear();
      g.fillStyle(0x2a2015, 0.9);
      g.fillRoundedRect(-w / 2, -h / 2, w, h, 6);
      g.lineStyle(1, 0x4a3a25, 1);
      g.strokeRoundedRect(-w / 2, -h / 2, w, h, 6);
    });
    c.on('pointerdown', () => {
      this.audio.playSfx('click');
      if (result.type === 'clue') {
        const clue = this.archive.getClue(result.id);
        if (clue) {
          this.activeTab = 'clues';
          (['clues', 'puzzle', 'search', 'logs'] as TabType[]).forEach(key => this.setTabActive(key, key === 'clues'));
          this.clearContentArea();
          this.selectedClueId = result.id;
          this.renderCluesTab();
          this.showClueDetail(clue);
        }
      } else {
          this.activeTab = 'puzzle';
          (['clues', 'puzzle', 'search', 'logs'] as TabType[]).forEach(key => this.setTabActive(key, key === 'puzzle'));
          this.clearContentArea();
          this.selectedDocumentId = result.id;
          this.renderPuzzleTab();
          this.showDocumentDetail(result.id);
        }
    });

    return c;
  }

  private renderLogsTab(): void {
    this.logListContainer = this.add.container(0, 0);

    const listX = 60;
    const listY = 180;
    const listW = GAME_WIDTH - 120;
    const listH = GAME_HEIGHT - 260;

    const listBg = this.add.graphics();
    listBg.fillStyle(0x1a1208, 0.8);
    listBg.fillRoundedRect(listX, listY, listW, listH, 8);
    listBg.lineStyle(1, 0x3a2a15, 1);
    listBg.strokeRoundedRect(listX, listY, listW, listH, 8);
    this.logListContainer.add(listBg);

    this.logListContainer.add(this.add.text(listX + 16, listY + 16, '📋 探索日志', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '16px',
      color: '#c9a44c'
    }));

    const logs = this.archive.getLogs();

    this.logListContainer.add(this.add.text(listX + listW - 16, listY + 16, `${logs.length} 条记录`, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '13px',
      color: '#666666'
    }).setOrigin(1, 0));

    if (logs.length === 0) {
      this.logListContainer.add(this.add.text(listX + listW / 2, listY + listH / 2, '暂无日志记录...\n\n开始探索后，你的发现会记录在这里', {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '14px',
        color: '#666666',
        align: 'center'
      }).setOrigin(0.5));
      return;
    }

    const logAreaY = listY + 52;
    const logAreaH = listH - 68;
    const logItemH = 52;
    const maxLogs = Math.floor(logAreaH / (logItemH + 4));

    const logScrollBg = this.add.graphics();
    logScrollBg.fillStyle(0x0f0a05, 0.5);
    logScrollBg.fillRoundedRect(listX + 12, logAreaY, listW - 24, logAreaH, 6);
    this.logListContainer.add(logScrollBg);

    logs.slice(0, maxLogs).forEach((log, i) => {
      const y = logAreaY + 8 + i * (logItemH + 4);
      this.renderLogItem(listX + 24, y, listW - 48, logItemH, log);
    });

    if (logs.length > maxLogs) {
      this.logListContainer.add(this.add.text(listX + listW / 2, listY + listH - 28, `... 还有 ${logs.length - maxLogs} 条更多记录`, {
        fontFamily: 'Microsoft YaHei, sans-serif',
        fontSize: '12px',
        color: '#555555'
      }).setOrigin(0.5));
    }
  }

  private renderLogItem(x: number, y: number, w: number, h: number, log: ArchiveLogEntry): void {
    const typeIcons: Record<string, string> = {
      clue: '🔍', fragment: '🧩', document: '📜', read: '📖', search: '🔎', log: '📝'
    };

    const c = this.add.container(x + w / 2, y + h / 2);
    const g = this.add.graphics();
    g.fillStyle(0x1a1510, 1);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 4);
    g.lineStyle(1, 0x2a2520, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 4);
    this.logListContainer!.add(c);
    this.logListContainer!.add(g);

    c.add(this.add.text(-w / 2 + 12, 0, typeIcons[log.eventType] || '📝', {
      fontFamily: 'Apple Color Emoji, sans-serif',
      fontSize: '20px'
    }).setOrigin(0, 0.5));

    c.add(this.add.text(-w / 2 + 48, -h / 2 + 14, log.description, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '13px',
      color: '#cccccc'
    }).setOrigin(0, 0.5));

    c.add(this.add.text(-w / 2 + w - 12, 0, this.archive.formatLogTime(log.timestamp), {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '11px',
      color: '#666666'
    }).setOrigin(1, 0.5));
  }

  private createFooter(): void {
    const footerY = GAME_HEIGHT - 50;
    const footerBg = this.add.graphics();
    footerBg.fillStyle(0x000000, 0.9);
    footerBg.fillRect(0, footerY, GAME_WIDTH, 50);
    footerBg.lineStyle(1, 0xc9a44c, 0.3);
    footerBg.beginPath();
    footerBg.moveTo(0, footerY);
    footerBg.lineTo(GAME_WIDTH, footerY);
    footerBg.strokePath();

    const stats = this.archive.getStats();
    const totalProgress = Math.floor(
      ((stats.discoveredClues / Math.max(1, stats.totalClues)) * 0.5 +
       (stats.completedDocuments / Math.max(1, stats.totalDocuments)) * 0.5) * 100
    );

    this.add.text(24, footerY + 25, `📊 探索进度: ${totalProgress}%`, {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '14px',
      color: '#c9a44c'
    }).setOrigin(0, 0.5);

    const progBarW = 200;
    const progBarH = 14;
    const progX = 220;
    const progY = footerY + 25 - progBarH / 2;

    const pBg = this.add.graphics();
    pBg.fillStyle(0x2a2015, 1);
    pBg.fillRoundedRect(progX, progY, progBarW, progBarH, 4);
    pBg.lineStyle(1, 0x4a3a25, 1);
    pBg.strokeRoundedRect(progX, progY, progBarW, progBarH, 4);

    const fillW = Math.max(4, Math.floor(progBarW * (totalProgress / 100)));
    const pFill = this.add.graphics();
    pFill.fillStyle(0xc9a44c, 1);
    pFill.fillRoundedRect(progX, progY, fillW, progBarH, 4);

    this.add.text(GAME_WIDTH / 2, footerY + 25, '💡 提示：在游戏中拾取物品和解谜会自动解锁线索和文档碎片', {
      fontFamily: 'Microsoft YaHei, sans-serif',
      fontSize: '12px',
      color: '#666666'
    }).setOrigin(0.5);

    const returnBtn = this.createButton(GAME_WIDTH - 120, footerY + 25, '🎮 返回游戏', '#8b4513', () => {
      this.audio.playSfx('click');
      this.closeArchive();
    });
  }

  private closeArchive(): void {
    this.eventBus.emit('archive_scene_close');
    this.cameras.main.fadeOut(300, 0, 0, 0, (_cam: Phaser.Cameras.Scene2D.Camera, prog: number) => {
      if (prog >= 1) {
        this.scene.start(this.returnSceneKey);
      }
    });
  }
}