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
