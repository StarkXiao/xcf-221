import type { Item, SceneConfig, LightPuzzle, EndingData } from '@/types';

export const GAME_VERSION = '1.0.0';

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 640;

export const ITEMS: Record<string, Item> = {
  rusty_key: {
    id: 'rusty_key',
    name: '生锈的钥匙',
    description: '一把老旧的铜钥匙，上面刻着奇怪的符号',
    icon: '🔑',
    canCombine: false
  },
  flashlight: {
    id: 'flashlight',
    name: '手电筒',
    description: '一个破旧但还能用的手电筒',
    icon: '🔦',
    canCombine: false
  },
  broken_lens: {
    id: 'broken_lens',
    name: '破碎的镜片',
    description: '放映机镜头的碎片，能反射光线',
    icon: '💎',
    canCombine: true,
    combineWith: ['projector_base'],
    combineResult: 'working_projector'
  },
  projector_base: {
    id: 'projector_base',
    name: '放映机底座',
    description: '老式胶片放映机，缺少镜头',
    icon: '📽️',
    canCombine: true,
    combineWith: ['broken_lens'],
    combineResult: 'working_projector'
  },
  working_projector: {
    id: 'working_projector',
    name: '修复的放映机',
    description: '修复好的放映机，可以投射影像',
    icon: '🎬',
    canCombine: false
  },
  music_box: {
    id: 'music_box',
    name: '音乐盒',
    description: '精致的音乐盒，播放着哀伤的旋律',
    icon: '🎵',
    canCombine: false
  },
  diary_page: {
    id: 'diary_page',
    name: '日记残页',
    description: '演员日记：「灯光顺序是...红、蓝、黄、绿」',
    icon: '📄',
    canCombine: false
  },
  stage_key: {
    id: 'stage_key',
    name: '舞台钥匙',
    description: '通往后台的钥匙，把手是银色的',
    icon: '🗝️',
    canCombine: false
  },
  final_key: {
    id: 'final_key',
    name: '剧院大门钥匙',
    description: '刻着剧院徽章的金色钥匙，自由的希望',
    icon: '🔐',
    canCombine: false
  }
};

export const LIGHT_PUZZLES: Record<string, LightPuzzle> = {
  lobby_puzzle: {
    id: 'lobby_puzzle',
    name: '大厅灯光谜题',
    lights: [
      { id: 0, x: 200, y: 180, on: false },
      { id: 1, x: 350, y: 180, on: false },
      { id: 2, x: 500, y: 180, on: false },
      { id: 3, x: 650, y: 180, on: false },
      { id: 4, x: 350, y: 300, on: false },
      { id: 5, x: 500, y: 300, on: false }
    ],
    pattern: [true, false, true, false, true, true],
    solved: false,
    reward: 'diary_page'
  },
  stage_puzzle: {
    id: 'stage_puzzle',
    name: '舞台聚光灯谜题',
    lights: [
      { id: 0, x: 300, y: 120, on: false },
      { id: 1, x: 480, y: 120, on: false },
      { id: 2, x: 660, y: 120, on: false },
      { id: 3, x: 390, y: 220, on: false },
      { id: 4, x: 570, y: 220, on: false }
    ],
    pattern: [true, true, true, false, false],
    solved: false,
    reward: 'final_key'
  }
};

export const SCENES: Record<string, SceneConfig> = {
  lobby: {
    id: 'lobby',
    name: '剧院大厅',
    backgroundKey: 'bg_lobby',
    ambientColor: 0x1a0a0a,
    description: '布满灰尘的剧院大厅，墙上的海报已经褪色。角落里闪烁着几盏忽明忽暗的灯。',
    objects: [
      {
        id: 'poster',
        name: '褪色海报',
        position: { x: 150, y: 250 },
        size: { x: 100, y: 150 },
        spriteKey: 'obj_poster',
        interactive: true,
        type: 'clue',
        clueText: '《永恒之夜》—— 最后一场演出。海报上的日期显示着30年前的今天...'
      },
      {
        id: 'ticket_counter',
        name: '售票柜台',
        position: { x: 480, y: 400 },
        size: { x: 180, y: 100 },
        spriteKey: 'obj_counter',
        interactive: true,
        type: 'item',
        containsItem: 'rusty_key',
        collected: false,
        clueText: '柜台抽屉里有一把生锈的钥匙。'
      },
      {
        id: 'light_puzzle_panel',
        name: '灯光控制面板',
        position: { x: 780, y: 280 },
        size: { x: 120, y: 160 },
        spriteKey: 'obj_panel',
        interactive: true,
        type: 'puzzle',
        puzzleId: 'lobby_puzzle',
        solved: false
      },
      {
        id: 'lobby_flashlight',
        name: '角落杂物堆',
        position: { x: 100, y: 480 },
        size: { x: 80, y: 60 },
        spriteKey: 'obj_junk',
        interactive: true,
        type: 'item',
        containsItem: 'flashlight',
        collected: false,
        clueText: '杂物堆里有一个手电筒，居然还能用。'
      },
      {
        id: 'door_to_auditorium',
        name: '观众厅入口',
        position: { x: 850, y: 450 },
        size: { x: 80, y: 150 },
        spriteKey: 'obj_door',
        interactive: true,
        type: 'door',
        requiredItem: 'rusty_key',
        targetScene: 'auditorium',
        clueText: '一扇沉重的木门，锁孔似乎在呼唤着钥匙...'
      }
    ]
  },
  auditorium: {
    id: 'auditorium',
    name: '观众厅',
    backgroundKey: 'bg_auditorium',
    ambientColor: 0x0a1a1a,
    description: '空荡荡的观众席，一排排座位上积满了厚厚的灰尘。舞台上的幕布破烂不堪。',
    objects: [
      {
        id: 'seat_music_box',
        name: '前排座位',
        position: { x: 200, y: 450 },
        size: { x: 60, y: 80 },
        spriteKey: 'obj_seat',
        interactive: true,
        type: 'item',
        containsItem: 'music_box',
        collected: false,
        clueText: '座位上有一个精致的音乐盒，它似乎在等待被人聆听...'
      },
      {
        id: 'projection_room_door',
        name: '放映室门',
        position: { x: 120, y: 200 },
        size: { x: 70, y: 130 },
        spriteKey: 'obj_door_small',
        interactive: true,
        type: 'exit',
        targetScene: 'projection_room',
        clueText: '通往二楼放映室的楼梯。'
      },
      {
        id: 'stage_door_locked',
        name: '后台通道',
        position: { x: 840, y: 380 },
        size: { x: 70, y: 140 },
        spriteKey: 'obj_door_silver',
        interactive: true,
        type: 'door',
        requiredItem: 'stage_key',
        targetScene: 'backstage',
        clueText: '银色把手的门，通往后台。需要特殊的钥匙。'
      },
      {
        id: 'back_to_lobby',
        name: '返回大厅',
        position: { x: 40, y: 550 },
        size: { x: 100, y: 60 },
        spriteKey: 'obj_exit_sign',
        interactive: true,
        type: 'exit',
        targetScene: 'lobby',
        clueText: '返回剧院大厅。'
      }
    ]
  },
  projection_room: {
    id: 'projection_room',
    name: '放映室',
    backgroundKey: 'bg_projection',
    ambientColor: 0x111122,
    description: '狭小的放映室里堆满了胶片盒。那台老式放映机似乎缺少了什么零件。',
    objects: [
      {
        id: 'projector_machine',
        name: '老式放映机',
        position: { x: 480, y: 300 },
        size: { x: 160, y: 140 },
        spriteKey: 'obj_projector',
        interactive: true,
        type: 'item',
        containsItem: 'projector_base',
        collected: false,
        clueText: '一台老式胶片放映机，镜头已经不见了...'
      },
      {
        id: 'film_shelf',
        name: '胶片架',
        position: { x: 150, y: 200 },
        size: { x: 100, y: 200 },
        spriteKey: 'obj_shelf',
        interactive: true,
        type: 'item',
        containsItem: 'broken_lens',
        collected: false,
        clueText: '架子上的胶片盒之间，夹着一片破碎的玻璃镜片。'
      },
      {
        id: 'stage_key_drawer',
        name: '办公桌',
        position: { x: 780, y: 400 },
        size: { x: 120, y: 80 },
        spriteKey: 'obj_desk',
        interactive: true,
        type: 'item',
        containsItem: 'stage_key',
        collected: false,
        clueText: '抽屉里有一把银色把手的钥匙。'
      },
      {
        id: 'back_to_auditorium',
        name: '返回观众厅',
        position: { x: 40, y: 550 },
        size: { x: 100, y: 60 },
        spriteKey: 'obj_exit_sign',
        interactive: true,
        type: 'exit',
        targetScene: 'auditorium',
        clueText: '下楼返回观众厅。'
      }
    ]
  },
  backstage: {
    id: 'backstage',
    name: '后台',
    backgroundKey: 'bg_backstage',
    ambientColor: 0x221a0a,
    description: '杂乱的后台，化妆台上的灯泡忽明忽暗。一扇通向舞台的大门矗立在眼前。',
    objects: [
      {
        id: 'vanity_table',
        name: '化妆台',
        position: { x: 180, y: 300 },
        size: { x: 140, y: 100 },
        spriteKey: 'obj_vanity',
        interactive: true,
        type: 'clue',
        clueText: '镜子上用口红写着：「只有全部点亮，大门才会开启」'
      },
      {
        id: 'spotlight_panel',
        name: '聚光灯控制台',
        position: { x: 700, y: 250 },
        size: { x: 140, y: 180 },
        spriteKey: 'obj_spotlight_panel',
        interactive: true,
        type: 'puzzle',
        puzzleId: 'stage_puzzle',
        solved: false
      },
      {
        id: 'final_door',
        name: '剧院外门',
        position: { x: 460, y: 350 },
        size: { x: 100, y: 180 },
        spriteKey: 'obj_final_door',
        interactive: true,
        type: 'door',
        requiredItem: 'final_key',
        targetScene: 'ending',
        clueText: '刻着剧院徽章的华丽大门...外面就是自由。'
      },
      {
        id: 'back_to_auditorium_2',
        name: '返回观众厅',
        position: { x: 40, y: 550 },
        size: { x: 100, y: 60 },
        spriteKey: 'obj_exit_sign',
        interactive: true,
        type: 'exit',
        targetScene: 'auditorium',
        clueText: '返回观众厅。'
      }
    ]
  }
};

export const ENDINGS: Record<string, EndingData> = {
  good_ending: {
    id: 'good_ending',
    title: '重见光明',
    description: `你推开了剧院的大门，久违的阳光洒在脸上。\n\n30年前的那场大火，带走了无数生命，\n但被困在这里的灵魂，终于因为你的到来而得到救赎。\n\n音乐盒的旋律在风中回荡，\n那是《永恒之夜》最后的乐章。\n\n剧场的灯光，永远不会熄灭。`,
    isGood: true,
    score: 1000
  },
  bad_ending: {
    id: 'bad_ending',
    title: '永恒之夜',
    description: `当最后一盏灯熄灭，\n你发现自己再也无法找到出口。\n\n你的身影，成为了《永恒之夜》\n最后一场演出的一部分...\n\n永远留在这里，等待下一个闯入者。`,
    isGood: false,
    score: 0
  }
};

export const INITIAL_GAME_STATE = {
  currentScene: 'lobby',
  inventory: [],
  selectedItem: null,
  solvedPuzzles: [],
  collectedItems: [],
  openedDoors: [],
  startTime: 0,
  moveCount: 0,
  hintUsed: 0
};
