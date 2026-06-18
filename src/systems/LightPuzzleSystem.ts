import type { LightPuzzle, LightState } from '@/types';
import { LIGHT_PUZZLES } from '@/config/levels';

export class LightPuzzleSystem {
  private static instance: LightPuzzleSystem;
  private puzzles: Record<string, LightPuzzle> = {};
  private listeners: ((puzzleId: string) => void)[] = [];

  private constructor() {
    this.reset();
  }

  public static getInstance(): LightPuzzleSystem {
    if (!LightPuzzleSystem.instance) {
      LightPuzzleSystem.instance = new LightPuzzleSystem();
    }
    return LightPuzzleSystem.instance;
  }

  public reset(): void {
    this.puzzles = {};
    Object.keys(LIGHT_PUZZLES).forEach(key => {
      this.puzzles[key] = JSON.parse(JSON.stringify(LIGHT_PUZZLES[key]));
    });
  }

  public getPuzzle(puzzleId: string): LightPuzzle | null {
    return this.puzzles[puzzleId] ?? null;
  }

  public toggleLight(puzzleId: string, lightId: number): boolean {
    const puzzle = this.puzzles[puzzleId];
    if (!puzzle || puzzle.solved) return false;

    const light = puzzle.lights.find(l => l.id === lightId);
    if (!light) return false;

    light.on = !light.on;

    if (lightId - 1 >= 0) {
      const leftLight = puzzle.lights.find(l => l.id === lightId - 1);
      if (leftLight) leftLight.on = !leftLight.on;
    }
    if (lightId + 1 < puzzle.lights.length) {
      const rightLight = puzzle.lights.find(l => l.id === lightId + 1);
      if (rightLight) rightLight.on = !rightLight.on;
    }

    this.notify(puzzleId);

    if (this.checkSolved(puzzleId)) {
      puzzle.solved = true;
    }

    return true;
  }

  public checkSolved(puzzleId: string): boolean {
    const puzzle = this.puzzles[puzzleId];
    if (!puzzle) return false;

    for (let i = 0; i < puzzle.pattern.length; i++) {
      const light = puzzle.lights[i];
      if (!light || light.on !== puzzle.pattern[i]) {
        return false;
      }
    }
    return true;
  }

  public isSolved(puzzleId: string): boolean {
    return this.puzzles[puzzleId]?.solved ?? false;
  }

  public setSolved(puzzleId: string, solved: boolean): void {
    const puzzle = this.puzzles[puzzleId];
    if (puzzle) {
      puzzle.solved = solved;
    }
  }

  public getLights(puzzleId: string): LightState[] {
    const puzzle = this.puzzles[puzzleId];
    return puzzle ? [...puzzle.lights.map(l => ({ ...l }))] : [];
  }

  public getPattern(puzzleId: string): boolean[] {
    return this.puzzles[puzzleId]?.pattern ?? [];
  }

  public getReward(puzzleId: string): string | undefined {
    return this.puzzles[puzzleId]?.reward;
  }

  public resetPuzzle(puzzleId: string): void {
    const original = LIGHT_PUZZLES[puzzleId];
    if (original) {
      this.puzzles[puzzleId] = JSON.parse(JSON.stringify(original));
      this.notify(puzzleId);
    }
  }

  public onSolve(callback: (puzzleId: string) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const idx = this.listeners.indexOf(callback);
      if (idx !== -1) this.listeners.splice(idx, 1);
    };
  }

  private notify(puzzleId: string): void {
    this.listeners.forEach(l => l(puzzleId));
  }
}
