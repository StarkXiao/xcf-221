import { Scene } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config/levels';

export class BootScene extends Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.setBaseURL('');
  }

  create(): void {
    this.scale.resize(GAME_WIDTH, GAME_HEIGHT);
    this.scene.start('PreloadScene');
  }
}
