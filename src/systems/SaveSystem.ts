import type { SaveData, GameState } from '@/types';
import { GAME_VERSION, INITIAL_GAME_STATE } from '@/config/levels';

const SAVE_KEY = 'abandoned_theater_save';

export class SaveSystem {
  private static instance: SaveSystem;
  private currentSave: SaveData | null = null;

  private constructor() {}

  public static getInstance(): SaveSystem {
    if (!SaveSystem.instance) {
      SaveSystem.instance = new SaveSystem();
    }
    return SaveSystem.instance;
  }

  public saveGame(state: GameState): boolean {
    try {
      const saveData: SaveData = {
        gameState: JSON.parse(JSON.stringify(state)),
        timestamp: Date.now(),
        version: GAME_VERSION
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
      this.currentSave = saveData;
      return true;
    } catch (e) {
      console.error('保存游戏失败:', e);
      return false;
    }
  }

  public loadGame(): GameState | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;

      const saveData: SaveData = JSON.parse(raw);
      if (saveData.version !== GAME_VERSION) {
        console.warn('存档版本不匹配，可能无法正常加载');
      }
      this.currentSave = saveData;
      return saveData.gameState;
    } catch (e) {
      console.error('加载游戏失败:', e);
      return null;
    }
  }

  public hasSave(): boolean {
    return localStorage.getItem(SAVE_KEY) !== null;
  }

  public getSaveTimestamp(): number | null {
    if (!this.currentSave) {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      this.currentSave = JSON.parse(raw);
    }
    return this.currentSave?.timestamp ?? null;
  }

  public formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${d} ${h}:${min}`;
  }

  public deleteSave(): boolean {
    try {
      localStorage.removeItem(SAVE_KEY);
      this.currentSave = null;
      return true;
    } catch (e) {
      console.error('删除存档失败:', e);
      return false;
    }
  }

  public getInitialState(): GameState {
    return {
      ...JSON.parse(JSON.stringify(INITIAL_GAME_STATE)),
      startTime: Date.now()
    };
  }
}
