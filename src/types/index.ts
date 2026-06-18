export interface Vector2 {
  x: number;
  y: number;
}

export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
  canCombine: boolean;
  combineWith?: string[];
  combineResult?: string;
}

export interface LightPuzzle {
  id: string;
  name: string;
  lights: LightState[];
  pattern: boolean[];
  solved: boolean;
  reward?: string;
}

export interface LightState {
  id: number;
  x: number;
  y: number;
  on: boolean;
}

export interface SceneObject {
  id: string;
  name: string;
  position: Vector2;
  size: Vector2;
  spriteKey: string;
  interactive: boolean;
  type: 'item' | 'door' | 'puzzle' | 'clue' | 'exit';
  requiredItem?: string;
  containsItem?: string;
  targetScene?: string;
  clueText?: string;
  puzzleId?: string;
  collected?: boolean;
  solved?: boolean;
}

export interface SceneConfig {
  id: string;
  name: string;
  backgroundKey: string;
  ambientColor: number;
  objects: SceneObject[];
  description: string;
}

export interface GameState {
  currentScene: string;
  inventory: string[];
  selectedItem: string | null;
  solvedPuzzles: string[];
  collectedItems: string[];
  openedDoors: string[];
  startTime: number;
  moveCount: number;
  hintUsed: number;
  archiveState: ArchiveState;
}

export interface SaveData {
  gameState: GameState;
  timestamp: number;
  version: string;
}

export interface EndingData {
  id: string;
  title: string;
  description: string;
  isGood: boolean;
  score: number;
}

export interface AudioConfig {
  bgm: {
    key: string;
    loop: boolean;
    volume: number;
  } | null;
  sfx: {
    pickup: string;
    click: string;
    success: string;
    error: string;
    door: string;
    light: string;
  };
}

export interface Clue {
  id: string;
  title: string;
  content: string;
  category: 'person' | 'event' | 'item' | 'location' | 'secret';
  tags: string[];
  relatedClues: string[];
  discovered: boolean;
  discoveredAt?: number;
  icon: string;
  description: string;
}

export interface DocumentFragment {
  id: string;
  documentId: string;
  title: string;
  content: string;
  position: number;
  totalPieces: number;
  collected: boolean;
  hint: string;
}

export interface ArchiveDocument {
  id: string;
  title: string;
  author: string;
  date: string;
  type: 'diary' | 'report' | 'letter' | 'newspaper' | 'contract' | 'script';
  fragments: string[];
  assembledContent: string;
  completed: boolean;
  unlockedAt?: number;
  isRead: boolean;
  summary: string;
  reveals: string[];
}

export interface ArchiveSearchResult {
  type: 'clue' | 'document';
  id: string;
  title: string;
  excerpt: string;
  matchScore: number;
  matchedTags: string[];
}

export interface ArchiveLogEntry {
  id: string;
  timestamp: number;
  eventType: string;
  description: string;
  relatedIds: string[];
}

export interface ArchiveState {
  discoveredClues: string[];
  collectedFragments: string[];
  completedDocuments: string[];
  readDocuments: string[];
  searchHistory: string[];
  unlockedSecrets: string[];
  logs: ArchiveLogEntry[];
}
