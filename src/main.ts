import { Game, Types, Scale, AUTO } from 'phaser';
import { BootScene } from '@/scenes/BootScene';
import { PreloadScene } from '@/scenes/PreloadScene';
import { MenuScene } from '@/scenes/MenuScene';
import { GameScene } from '@/scenes/GameScene';
import { EndingScene } from '@/scenes/EndingScene';
import { GAME_WIDTH, GAME_HEIGHT } from '@/config/levels';

const config: Types.Core.GameConfig = {
  type: AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#0a0a0a',
  scale: {
    mode: Scale.FIT,
    autoCenter: Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  },
  scene: [
    BootScene,
    PreloadScene,
    MenuScene,
    GameScene,
    EndingScene
  ],
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: false
  },
  input: {
    activePointers: 3
  },
  dom: {
    createContainer: false
  }
};

const game = new Game(config);

interface HotModule {
  hot?: {
    dispose(cb: () => void): void;
  };
}

const meta = import.meta as unknown as HotModule;
if (meta.hot) {
  meta.hot.dispose(() => {
    game.destroy(true);
  });
}

export default game;
