export type GameEventType =
  | 'scene_change'
  | 'item_pickup'
  | 'item_use'
  | 'item_combine'
  | 'puzzle_solve'
  | 'door_open'
  | 'clue_found'
  | 'game_start'
  | 'game_complete'
  | 'save_game'
  | 'load_game'
  | 'show_message'
  | 'show_puzzle'
  | 'show_ending'
  | 'toggle_settings';

export interface GameEvent {
  type: GameEventType;
  data?: unknown;
  timestamp: number;
}

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<GameEventType, ((event: GameEvent) => void)[]> = new Map();
  private globalListeners: ((event: GameEvent) => void)[] = [];

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public on(type: GameEventType, callback: (event: GameEvent) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(callback);
    return () => this.off(type, callback);
  }

  public onAll(callback: (event: GameEvent) => void): () => void {
    this.globalListeners.push(callback);
    return () => {
      const idx = this.globalListeners.indexOf(callback);
      if (idx !== -1) this.globalListeners.splice(idx, 1);
    };
  }

  public off(type: GameEventType, callback: (event: GameEvent) => void): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      const idx = listeners.indexOf(callback);
      if (idx !== -1) listeners.splice(idx, 1);
    }
  }

  public emit(type: GameEventType, data?: unknown): void {
    const event: GameEvent = {
      type,
      data,
      timestamp: Date.now()
    };

    this.globalListeners.forEach(l => {
      try {
        l(event);
      } catch (e) {
        console.error('Global listener error:', e);
      }
    });

    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(l => {
        try {
          l(event);
        } catch (e) {
          console.error(`Listener error for ${type}:`, e);
        }
      });
    }
  }

  public clear(): void {
    this.listeners.clear();
    this.globalListeners = [];
  }
}
