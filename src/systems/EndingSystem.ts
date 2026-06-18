import type { GameState, EndingData, GhostActorEndingData } from '@/types';
import { ENDINGS } from '@/config/levels';
import { GhostActorSystem } from '@/systems/GhostActorSystem';

export interface ScoreBreakdown {
  baseScore: number;
  speedBonus: number;
  efficiencyBonus: number;
  penalty: number;
  ghostActorBonus: number;
  total: number;
  playTimeSeconds: number;
  moveCount: number;
  itemsCollected: number;
  puzzlesSolved: number;
  ghostActorEndingId: string | null;
}

export class EndingSystem {
  private static instance: EndingSystem;

  private constructor() {}

  public static getInstance(): EndingSystem {
    if (!EndingSystem.instance) {
      EndingSystem.instance = new EndingSystem();
    }
    return EndingSystem.instance;
  }

  public calculateScore(state: GameState): ScoreBreakdown {
    const baseScore = ENDINGS.good_ending.score;

    const playTimeMs = Date.now() - state.startTime;
    const playTimeSeconds = Math.floor(playTimeMs / 1000);

    let speedBonus = 0;
    if (playTimeSeconds < 300) {
      speedBonus = 500;
    } else if (playTimeSeconds < 600) {
      speedBonus = 300;
    } else if (playTimeSeconds < 900) {
      speedBonus = 150;
    }

    const idealMoves = 25;
    let efficiencyBonus = 0;
    if (state.moveCount <= idealMoves) {
      efficiencyBonus = 300;
    } else if (state.moveCount <= idealMoves * 1.5) {
      efficiencyBonus = 150;
    } else if (state.moveCount <= idealMoves * 2) {
      efficiencyBonus = 50;
    }

    const penalty = state.hintUsed * 50;

    const ghostSys = GhostActorSystem.getInstance();
    const ghostEnding = ghostSys.determineEnding();
    const ghostActorBonus = ghostEnding.scoreBonus;

    const total = Math.max(0, baseScore + speedBonus + efficiencyBonus - penalty + ghostActorBonus);

    return {
      baseScore,
      speedBonus,
      efficiencyBonus,
      penalty,
      ghostActorBonus,
      total,
      playTimeSeconds,
      moveCount: state.moveCount,
      itemsCollected: state.collectedItems.length,
      puzzlesSolved: state.solvedPuzzles.length,
      ghostActorEndingId: ghostEnding.id
    };
  }

  public formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  public getEnding(endingId: string): EndingData | null {
    return ENDINGS[endingId] ?? null;
  }

  public determineEnding(state: GameState): EndingData {
    const itemsCollected = state.collectedItems.length;
    const puzzlesSolved = state.solvedPuzzles.length;

    if (itemsCollected >= 6 && puzzlesSolved >= 2) {
      return ENDINGS.good_ending;
    }
    return ENDINGS.bad_ending;
  }

  public getStars(score: number): number {
    if (score >= 1500) return 3;
    if (score >= 1200) return 2;
    if (score >= 800) return 1;
    return 0;
  }

  public getRank(score: number): string {
    if (score >= 2200) return 'S';
    if (score >= 1800) return 'A';
    if (score >= 1400) return 'B';
    if (score >= 1000) return 'C';
    return 'D';
  }

  public getGhostActorEnding(endingId: string): GhostActorEndingData | null {
    const ghostSys = GhostActorSystem.getInstance();
    return ghostSys.getEndingById(endingId);
  }

  public determineGhostActorEnding(): GhostActorEndingData {
    const ghostSys = GhostActorSystem.getInstance();
    return ghostSys.determineEnding();
  }

  public hasGhostActorQuestCompleted(): boolean {
    const ghostSys = GhostActorSystem.getInstance();
    return ghostSys.isQuestCompleted();
  }
}
