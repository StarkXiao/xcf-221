import type { MechPuzzle, MechValveState } from '@/types';
import { MECH_PUZZLES } from '@/config/levels';

export class MechPuzzleSystem {
  private static instance: MechPuzzleSystem;
  private puzzles: Record<string, MechPuzzle> = {};
  private listeners: ((puzzleId: string) => void)[] = [];

  private constructor() {
    this.reset();
  }

  public static getInstance(): MechPuzzleSystem {
    if (!MechPuzzleSystem.instance) {
      MechPuzzleSystem.instance = new MechPuzzleSystem();
    }
    return MechPuzzleSystem.instance;
  }

  public reset(): void {
    this.puzzles = {};
    Object.keys(MECH_PUZZLES).forEach(key => {
      this.puzzles[key] = JSON.parse(JSON.stringify(MECH_PUZZLES[key]));
    });
  }

  public getPuzzle(puzzleId: string): MechPuzzle | null {
    return this.puzzles[puzzleId] ?? null;
  }

  public rotateValve(puzzleId: string, valveId: number): boolean {
    const puzzle = this.puzzles[puzzleId];
    if (!puzzle || puzzle.solved) return false;

    const valve = puzzle.valves.find(v => v.id === valveId);
    if (!valve) return false;

    valve.position = (valve.position + 1) % valve.maxPositions;

    for (const linkedId of valve.linkedValveIds) {
      const linked = puzzle.valves.find(v => v.id === linkedId);
      if (linked) {
        linked.position = (linked.position + 1) % linked.maxPositions;
      }
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

    for (let i = 0; i < puzzle.targetPattern.length; i++) {
      const valve = puzzle.valves[i];
      if (!valve || valve.position !== puzzle.targetPattern[i]) {
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

  public getValves(puzzleId: string): MechValveState[] {
    const puzzle = this.puzzles[puzzleId];
    return puzzle ? [...puzzle.valves.map(v => ({ ...v }))] : [];
  }

  public getTargetPattern(puzzleId: string): number[] {
    return this.puzzles[puzzleId]?.targetPattern ?? [];
  }

  public getReward(puzzleId: string): string | undefined {
    return this.puzzles[puzzleId]?.reward;
  }

  public resetPuzzle(puzzleId: string): void {
    const original = MECH_PUZZLES[puzzleId];
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
