import type { Clue, DocumentFragment, ArchiveDocument, ArchiveState, ArchiveSearchResult, ArchiveLogEntry } from '@/types';
import { CLUES, DOCUMENT_FRAGMENTS, ARCHIVE_DOCUMENTS, INITIAL_ARCHIVE_STATE } from '@/config/levels';
import { EventBus } from '@/systems/EventBus';

export interface ArchiveChangeEvent {
  type: 'clue' | 'fragment' | 'document' | 'log' | 'search' | 'reset';
  id?: string;
}

export class ArchiveSystem {
  private static instance: ArchiveSystem;
  private state: ArchiveState;
  private eventBus: EventBus;
  private listeners: ((event: ArchiveChangeEvent) => void)[] = [];

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.state = JSON.parse(JSON.stringify(INITIAL_ARCHIVE_STATE));
    this.setupGlobalEventListeners();
  }

  public static getInstance(): ArchiveSystem {
    if (!ArchiveSystem.instance) {
      ArchiveSystem.instance = new ArchiveSystem();
    }
    return ArchiveSystem.instance;
  }

  private setupGlobalEventListeners(): void {
    this.eventBus.on('clue_found', (data) => {
      const clueId = data.data as string;
      if (clueId && clueId.startsWith('clue_')) {
        this.discoverClue(clueId);
      }
    });

    this.eventBus.on('item_pickup', (data) => {
      const itemId = data.data as string;
      this.handleItemPickupForArchive(itemId);
    });

    this.eventBus.on('puzzle_solve', (data) => {
      const puzzleId = data.data as string;
      this.handlePuzzleSolveForArchive(puzzleId);
    });
  }

  private handleItemPickupForArchive(itemId: string): void {
    const itemToClueMap: Record<string, string | undefined> = {
      rusty_key: 'clue_theater_founder',
      flashlight: undefined,
      broken_lens: 'clue_projection_room_hidden',
      projector_base: 'clue_projection_room_hidden',
      working_projector: 'clue_projection_room_hidden',
      music_box: 'clue_music_box_secret',
      diary_page: 'clue_lights_pattern',
      stage_key: 'clue_stage_key_origin',
      final_key: 'clue_final_door_truth'
    };

    const clueId = itemToClueMap[itemId];
    if (clueId) {
      this.discoverClue(clueId);
    }

    const itemToFragmentMap: Record<string, string> = {
      rusty_key: 'frag_actress_diary_1',
      music_box: 'frag_actress_diary_2',
      broken_lens: 'frag_actress_diary_3',
      stage_key: 'frag_actress_diary_4',
      diary_page: 'frag_founders_journal_1',
      flashlight: 'frag_founders_journal_2',
      working_projector: 'frag_founders_journal_3'
    };

    const fragmentId = itemToFragmentMap[itemId];
    if (fragmentId) {
      this.collectFragment(fragmentId);
    }
  }

  private handlePuzzleSolveForArchive(puzzleId: string): void {
    const puzzleToClueMap: Record<string, string> = {
      lobby_puzzle: 'clue_eternal_night',
      stage_puzzle: 'clue_fire_incident'
    };

    const puzzleToFragmentMap: Record<string, string> = {
      lobby_puzzle: 'frag_founders_journal_1',
      stage_puzzle: 'frag_founders_journal_3'
    };

    const clueId = puzzleToClueMap[puzzleId];
    if (clueId) {
      this.discoverClue(clueId);
    }

    const fragmentId = puzzleToFragmentMap[puzzleId];
    if (fragmentId) {
      this.collectFragment(fragmentId);
    }
  }

  public discoverClue(clueId: string): boolean {
    const clue = CLUES[clueId];
    if (!clue || this.state.discoveredClues.includes(clueId)) {
      return false;
    }

    this.state.discoveredClues.push(clueId);
    clue.discovered = true;
    clue.discoveredAt = Date.now();

    this.addLog('clue', `发现新线索：${clue.title}`, [clueId]);

    this.eventBus.emit('archive_clue_discovered', clueId);
    this.notify({ type: 'clue', id: clueId });

    return true;
  }

  public collectFragment(fragmentId: string): boolean {
    const fragment = DOCUMENT_FRAGMENTS[fragmentId];
    if (!fragment || this.state.collectedFragments.includes(fragmentId)) {
      return false;
    }

    this.state.collectedFragments.push(fragmentId);
    fragment.collected = true;

    this.addLog('fragment', `收集到文档碎片：${fragment.title}`, [fragmentId, fragment.documentId]);

    this.eventBus.emit('archive_fragment_collected', fragmentId);
    this.notify({ type: 'fragment', id: fragmentId });

    this.checkDocumentCompletion(fragment.documentId);

    return true;
  }

  private checkDocumentCompletion(documentId: string): void {
    const document = ARCHIVE_DOCUMENTS[documentId];
    if (!document || document.completed) return;

    const allCollected = document.fragments.every(fId =>
      this.state.collectedFragments.includes(fId)
    );

    if (allCollected) {
      this.completeDocument(documentId);
    }
  }

  public completeDocument(documentId: string): boolean {
    const document = ARCHIVE_DOCUMENTS[documentId];
    if (!document || document.completed) return false;

    document.completed = true;
    document.unlockedAt = Date.now();
    this.state.completedDocuments.push(documentId);

    document.reveals.forEach(clueId => {
      this.discoverClue(clueId);
    });

    this.addLog('document', `完成文档拼图：${document.title}`, [documentId, ...document.reveals]);

    this.eventBus.emit('archive_document_completed', documentId);
    this.notify({ type: 'document', id: documentId });

    const fragmentIds = document.fragments.filter(f => DOCUMENT_FRAGMENTS[f]);
    const secretKey = `secret_${documentId}`;
    if (!this.state.unlockedSecrets.includes(secretKey)) {
      this.state.unlockedSecrets.push(secretKey);
      this.eventBus.emit('archive_secret_unlocked', secretKey);
    }

    return true;
  }

  public markDocumentRead(documentId: string): boolean {
    const document = ARCHIVE_DOCUMENTS[documentId];
    if (!document || !document.completed || this.state.readDocuments.includes(documentId)) {
      return false;
    }

    document.isRead = true;
    this.state.readDocuments.push(documentId);

    this.addLog('read', `阅读文档：${document.title}`, [documentId]);

    this.eventBus.emit('archive_document_read', documentId);
    this.notify({ type: 'document', id: documentId });

    return true;
  }

  public search(keyword: string): ArchiveSearchResult[] {
    const results: ArchiveSearchResult[] = [];
    const lowerKeyword = keyword.toLowerCase().trim();

    if (!lowerKeyword) return results;

    this.addSearchHistory(keyword);

    this.state.discoveredClues.forEach(clueId => {
      const clue = CLUES[clueId];
      if (!clue) return;

      let score = 0;
      const matchedTags: string[] = [];

      if (clue.title.toLowerCase().includes(lowerKeyword)) score += 50;
      if (clue.content.toLowerCase().includes(lowerKeyword)) score += 30;
      if (clue.description.toLowerCase().includes(lowerKeyword)) score += 20;

      clue.tags.forEach(tag => {
        if (tag.toLowerCase().includes(lowerKeyword)) {
          score += 25;
          matchedTags.push(tag);
        }
      });

      if (score > 0) {
        results.push({
          type: 'clue',
          id: clueId,
          title: clue.title,
          excerpt: this.generateExcerpt(clue.content, lowerKeyword),
          matchScore: score,
          matchedTags
        });
      }
    });

    this.state.completedDocuments.forEach(docId => {
      const doc = ARCHIVE_DOCUMENTS[docId];
      if (!doc) return;

      let score = 0;
      const matchedTags: string[] = [];

      if (doc.title.toLowerCase().includes(lowerKeyword)) score += 50;
      if (doc.assembledContent.toLowerCase().includes(lowerKeyword)) score += 30;
      if (doc.summary.toLowerCase().includes(lowerKeyword)) score += 20;
      if (doc.author.toLowerCase().includes(lowerKeyword)) score += 15;

      if (score > 0) {
        results.push({
          type: 'document',
          id: docId,
          title: doc.title,
          excerpt: this.generateExcerpt(doc.assembledContent, lowerKeyword),
          matchScore: score,
          matchedTags
        });
      }
    });

    results.sort((a, b) => b.matchScore - a.matchScore);

    this.eventBus.emit('archive_search', { keyword, resultCount: results.length });
    this.notify({ type: 'search' });

    return results;
  }

  private generateExcerpt(content: string, keyword: string): string {
    const lowerContent = content.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    const index = lowerContent.indexOf(lowerKeyword);

    if (index === -1) {
      return content.substring(0, 80) + (content.length > 80 ? '...' : '');
    }

    const start = Math.max(0, index - 30);
    const end = Math.min(content.length, index + keyword.length + 30);
    let excerpt = content.substring(start, end);

    if (start > 0) excerpt = '...' + excerpt;
    if (end < content.length) excerpt = excerpt + '...';

    return excerpt;
  }

  public addSearchHistory(keyword: string): void {
    const trimmed = keyword.trim();
    if (!trimmed) return;

    this.state.searchHistory = this.state.searchHistory.filter(k => k !== trimmed);
    this.state.searchHistory.unshift(trimmed);
    if (this.state.searchHistory.length > 20) {
      this.state.searchHistory = this.state.searchHistory.slice(0, 20);
    }
  }

  public getSearchHistory(): string[] {
    return [...this.state.searchHistory];
  }

  public addLog(eventType: string, description: string, relatedIds: string[] = []): void {
    const entry: ArchiveLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      eventType,
      description,
      relatedIds
    };

    this.state.logs.push(entry);
    if (this.state.logs.length > 100) {
      this.state.logs = this.state.logs.slice(-100);
    }

    this.eventBus.emit('archive_log_added', entry);
    this.notify({ type: 'log', id: entry.id });
  }

  public getLogs(): ArchiveLogEntry[] {
    return [...this.state.logs].reverse();
  }

  public getLogsByType(eventType: string): ArchiveLogEntry[] {
    return this.state.logs
      .filter(log => log.eventType === eventType)
      .reverse();
  }

  public getDiscoveredClues(): Clue[] {
    return this.state.discoveredClues
      .map(id => CLUES[id])
      .filter(Boolean)
      .map(clue => ({ ...clue }));
  }

  public getCluesByCategory(category: Clue['category']): Clue[] {
    return this.getDiscoveredClues().filter(c => c.category === category);
  }

  public getClue(clueId: string): Clue | null {
    if (!this.state.discoveredClues.includes(clueId)) return null;
    const clue = CLUES[clueId];
    return clue ? { ...clue } : null;
  }

  public getRelatedDiscoveredClues(clueId: string): Clue[] {
    const clue = CLUES[clueId];
    if (!clue) return [];

    return clue.relatedClues
      .filter(id => this.state.discoveredClues.includes(id))
      .map(id => CLUES[id])
      .filter(Boolean);
  }

  public getCollectedFragments(): DocumentFragment[] {
    return this.state.collectedFragments
      .map(id => DOCUMENT_FRAGMENTS[id])
      .filter(Boolean)
      .map(f => ({ ...f }));
  }

  public getFragmentsByDocument(documentId: string): DocumentFragment[] {
    const document = ARCHIVE_DOCUMENTS[documentId];
    if (!document) return [];

    return document.fragments
      .map(id => DOCUMENT_FRAGMENTS[id])
      .filter(Boolean)
      .map(f => ({ ...f, collected: this.state.collectedFragments.includes(f.id) }));
  }

  public getFragment(fragmentId: string): DocumentFragment | null {
    const fragment = DOCUMENT_FRAGMENTS[fragmentId];
    if (!fragment) return null;
    return { ...fragment, collected: this.state.collectedFragments.includes(fragmentId) };
  }

  public getCompletedDocuments(): ArchiveDocument[] {
    return this.state.completedDocuments
      .map(id => ARCHIVE_DOCUMENTS[id])
      .filter(Boolean)
      .map(d => ({ ...d }));
  }

  public getAllDocumentsProgress(): Array<{
    id: string;
    title: string;
    type: ArchiveDocument['type'];
    collectedCount: number;
    totalCount: number;
    progress: number;
    completed: boolean;
  }> {
    return Object.values(ARCHIVE_DOCUMENTS).map(doc => {
      const collectedCount = doc.fragments.filter(id =>
        this.state.collectedFragments.includes(id)
      ).length;
      return {
        id: doc.id,
        title: doc.title,
        type: doc.type,
        collectedCount,
        totalCount: doc.fragments.length,
        progress: doc.fragments.length > 0 ? collectedCount / doc.fragments.length : 0,
        completed: doc.completed
      };
    });
  }

  public getDocument(documentId: string): ArchiveDocument | null {
    const doc = ARCHIVE_DOCUMENTS[documentId];
    if (!doc) return null;
    return { ...doc };
  }

  public getDocumentAssembledContent(documentId: string): string | null {
    const doc = ARCHIVE_DOCUMENTS[documentId];
    if (!doc || !doc.completed) return null;
    return doc.assembledContent;
  }

  public getState(): ArchiveState {
    return {
      discoveredClues: [...this.state.discoveredClues],
      collectedFragments: [...this.state.collectedFragments],
      completedDocuments: [...this.state.completedDocuments],
      readDocuments: [...this.state.readDocuments],
      searchHistory: [...this.state.searchHistory],
      unlockedSecrets: [...this.state.unlockedSecrets],
      logs: [...this.state.logs]
    };
  }

  public loadState(state: ArchiveState): void {
    this.state = JSON.parse(JSON.stringify(state));

    this.state.discoveredClues.forEach(id => {
      if (CLUES[id]) CLUES[id].discovered = true;
    });

    this.state.collectedFragments.forEach(id => {
      if (DOCUMENT_FRAGMENTS[id]) DOCUMENT_FRAGMENTS[id].collected = true;
    });

    this.state.completedDocuments.forEach(id => {
      if (ARCHIVE_DOCUMENTS[id]) ARCHIVE_DOCUMENTS[id].completed = true;
    });

    this.state.readDocuments.forEach(id => {
      if (ARCHIVE_DOCUMENTS[id]) ARCHIVE_DOCUMENTS[id].isRead = true;
    });

    this.notify({ type: 'reset' });
  }

  public reset(): void {
    this.state = JSON.parse(JSON.stringify(INITIAL_ARCHIVE_STATE));

    Object.values(CLUES).forEach(clue => {
      clue.discovered = false;
      clue.discoveredAt = undefined;
    });

    Object.values(DOCUMENT_FRAGMENTS).forEach(frag => {
      frag.collected = false;
    });

    Object.values(ARCHIVE_DOCUMENTS).forEach(doc => {
      doc.completed = false;
      doc.unlockedAt = undefined;
      doc.isRead = false;
    });

    this.notify({ type: 'reset' });
  }

  public getStats(): {
    totalClues: number;
    discoveredClues: number;
    totalFragments: number;
    collectedFragments: number;
    totalDocuments: number;
    completedDocuments: number;
    secretsUnlocked: number;
    logCount: number;
  } {
    return {
      totalClues: Object.keys(CLUES).length,
      discoveredClues: this.state.discoveredClues.length,
      totalFragments: Object.keys(DOCUMENT_FRAGMENTS).length,
      collectedFragments: this.state.collectedFragments.length,
      totalDocuments: Object.keys(ARCHIVE_DOCUMENTS).length,
      completedDocuments: this.state.completedDocuments.length,
      secretsUnlocked: this.state.unlockedSecrets.length,
      logCount: this.state.logs.length
    };
  }

  public onChange(callback: (event: ArchiveChangeEvent) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const idx = this.listeners.indexOf(callback);
      if (idx !== -1) this.listeners.splice(idx, 1);
    };
  }

  private notify(event: ArchiveChangeEvent): void {
    this.listeners.forEach(l => {
      try {
        l(event);
      } catch (e) {
        console.error('ArchiveSystem listener error:', e);
      }
    });
  }

  public formatLogTime(timestamp: number): string {
    const date = new Date(timestamp);
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    const s = String(date.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }
}
