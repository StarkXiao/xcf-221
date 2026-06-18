import type { Item, SceneConfig, LightPuzzle, MechPuzzle, EndingData } from '@/types';

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
  },
  old_photo: {
    id: 'old_photo',
    name: '泛黄的旧照片',
    description: '照片上是一位穿着戏服的年轻女演员，背面写着「赠我永远的夜莺」',
    icon: '📷',
    canCombine: false
  },
  costume_fragment: {
    id: 'costume_fragment',
    name: '戏服碎片',
    description: '一片绣着金线的蓝色丝绸碎片，似乎来自某件华丽的戏服',
    icon: '🧵',
    canCombine: false
  },
  wilted_rose: {
    id: 'wilted_rose',
    name: '枯萎的白玫瑰',
    description: '一朵干枯的白玫瑰，花瓣上还残留着淡淡的香水味',
    icon: '🥀',
    canCombine: false
  },
  nightingale_brooch: {
    id: 'nightingale_brooch',
    name: '夜莺胸针',
    description: '一枚精致的银色胸针，造型是一只歌唱的夜莺，这是林婉清最珍爱的饰品',
    icon: '🪶',
    canCombine: false
  },
  unfinished_letter: {
    id: 'unfinished_letter',
    name: '未写完的信',
    description: '「思远，如果你看到这封信...」——字迹到这里就断了，纸上有泪痕',
    icon: '✉️',
    canCombine: false
  },
  gear_worn: {
    id: 'gear_worn',
    name: '磨损的齿轮',
    description: '一只锈迹斑驳的铜齿轮，齿牙几乎磨平，似乎无法正常咬合',
    icon: '⚙️',
    canCombine: true,
    combineWith: ['oil_can'],
    combineResult: 'gear_restored'
  },
  oil_can: {
    id: 'oil_can',
    name: '润滑油壶',
    description: '一壶尚有余量的机械润滑油，可以润滑锈蚀的零件',
    icon: '🛢️',
    canCombine: true,
    combineWith: ['gear_worn'],
    combineResult: 'gear_restored'
  },
  gear_restored: {
    id: 'gear_restored',
    name: '修复的齿轮',
    description: '经过润滑的铜齿轮，齿牙恢复了光泽，可以重新嵌入机关',
    icon: '🔧',
    canCombine: false
  },
  valve_handle: {
    id: 'valve_handle',
    name: '阀门手轮',
    description: '一只铸铁手轮，可以安装在管道阀门上控制蒸汽流向',
    icon: '🔄',
    canCombine: false
  },
  mech_room_key: {
    id: 'mech_room_key',
    name: '机械房钥匙',
    description: '沉甸甸的铁钥匙，上面刻着齿轮纹章——这是地下机械房的通行凭证',
    icon: '🗝️',
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

export const MECH_PUZZLES: Record<string, MechPuzzle> = {
  mech_valve_puzzle: {
    id: 'mech_valve_puzzle',
    name: '蒸汽阀门联动谜题',
    valves: [
      { id: 0, x: 220, y: 200, position: 2, maxPositions: 4, linkedValveIds: [1, 3] },
      { id: 1, x: 420, y: 200, position: 1, maxPositions: 4, linkedValveIds: [0, 2] },
      { id: 2, x: 620, y: 200, position: 3, maxPositions: 4, linkedValveIds: [1, 3] },
      { id: 3, x: 420, y: 360, position: 0, maxPositions: 4, linkedValveIds: [0, 2] }
    ],
    targetPattern: [0, 0, 0, 0],
    solved: false,
    reward: 'mech_room_key'
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
    description: '空荡荡的观众席，一排排座位上积满了厚厚的灰尘。舞台上的幕布破烂不堪。角落里似乎有一道若隐若现的身影...',
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
        id: 'ghost_actor_auditorium',
        name: '神秘身影',
        position: { x: 480, y: 320 },
        size: { x: 80, y: 120 },
        spriteKey: 'obj_ghost',
        interactive: true,
        type: 'clue',
        clueText: '舞台边站着一位穿着蓝色戏服的女子，她的身影半透明，似乎在凝视着什么...'
      },
      {
        id: 'wilted_rose_seat',
        name: '楼座角落',
        position: { x: 720, y: 200 },
        size: { x: 60, y: 50 },
        spriteKey: 'obj_seat_small',
        interactive: true,
        type: 'item',
        containsItem: 'wilted_rose',
        collected: false,
        clueText: '楼座最偏僻的角落，一朵枯萎的白玫瑰静静地躺在座位上。'
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
    description: '狭小的放映室里堆满了胶片盒。那台老式放映机似乎缺少了什么零件。窗台上有什么东西在闪光。',
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
        id: 'old_photo_window',
        name: '窗台',
        position: { x: 620, y: 150 },
        size: { x: 90, y: 50 },
        spriteKey: 'obj_windowsill',
        interactive: true,
        type: 'item',
        containsItem: 'old_photo',
        collected: false,
        clueText: '窗台上放着一张泛黄的旧照片，照片上的女子穿着蓝色戏服...'
      },
      {
        id: 'costume_hanger',
        name: '角落衣架',
        position: { x: 850, y: 250 },
        size: { x: 70, y: 140 },
        spriteKey: 'obj_hanger',
        interactive: true,
        type: 'item',
        containsItem: 'costume_fragment',
        collected: false,
        clueText: '角落的衣架上挂着一件破烂的蓝色戏服，衣角上有金线刺绣...'
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
    description: '杂乱的后台，化妆台上的灯泡忽明忽暗。角落里有一面等身镜子，镜中似乎映着一个不属于这里的身影...',
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
        id: 'ghost_actor_backstage',
        name: '镜中身影',
        position: { x: 460, y: 300 },
        size: { x: 100, y: 160 },
        spriteKey: 'obj_mirror_ghost',
        interactive: true,
        type: 'clue',
        clueText: '镜中站着一位穿蓝色戏服的女子，她转过身来，用哀伤的眼神看着你...'
      },
      {
        id: 'unfinished_letter_drawer',
        name: '化妆台抽屉',
        position: { x: 200, y: 420 },
        size: { x: 80, y: 40 },
        spriteKey: 'obj_drawer',
        interactive: true,
        type: 'item',
        containsItem: 'unfinished_letter',
        collected: false,
        clueText: '抽屉最深处有一封被揉皱的信，上面泪痕斑驳...'
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
        position: { x: 460, y: 500 },
        size: { x: 100, y: 120 },
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
      },
      {
        id: 'door_to_mech_room',
        name: '地下室入口',
        position: { x: 780, y: 450 },
        size: { x: 80, y: 120 },
        spriteKey: 'obj_hatch_door',
        interactive: true,
        type: 'exit',
        targetScene: 'mechanical_room',
        clueText: '地板上一扇生锈的铁门，锁似乎已经坏了...用力一拉，门吱呀一声打开了，一股阴冷的空气扑面而来。'
      }
    ]
  },
  mechanical_room: {
    id: 'mechanical_room',
    name: '地下机械房',
    backgroundKey: 'bg_mechanical',
    ambientColor: 0x1a1a1a,
    description: '阴冷的地下空间，管道纵横交错，蒸汽从锈蚀的接缝中嘶嘶作响。巨大的齿轮组沉默地矗立在中央，等待着被唤醒。',
    objects: [
      {
        id: 'workbench_oil',
        name: '工具台',
        position: { x: 160, y: 400 },
        size: { x: 120, y: 80 },
        spriteKey: 'obj_workbench',
        interactive: true,
        type: 'item',
        containsItem: 'oil_can',
        collected: false,
        clueText: '工具台上放着一壶润滑油，瓶身上的标签已经模糊不清，但还能闻到刺鼻的油味。'
      },
      {
        id: 'gear_rack',
        name: '齿轮架',
        position: { x: 750, y: 350 },
        size: { x: 100, y: 140 },
        spriteKey: 'obj_gear_rack',
        interactive: true,
        type: 'item',
        containsItem: 'gear_worn',
        collected: false,
        clueText: '架子上挂着一枚磨损严重的铜齿轮，齿牙已被岁月磨平...如果能润滑一下，也许还能用。'
      },
      {
        id: 'valve_bench',
        name: '备件箱',
        position: { x: 840, y: 180 },
        size: { x: 90, y: 80 },
        spriteKey: 'obj_crate',
        interactive: true,
        type: 'item',
        containsItem: 'valve_handle',
        collected: false,
        clueText: '箱子里翻出一只铸铁手轮，大小刚好能套在管道阀门上。'
      },
      {
        id: 'mech_valve_panel',
        name: '蒸汽控制台',
        position: { x: 420, y: 280 },
        size: { x: 160, y: 180 },
        spriteKey: 'obj_valve_panel',
        interactive: true,
        type: 'mech_puzzle',
        mechPuzzleId: 'mech_valve_puzzle',
        requiredItem: 'valve_handle',
        solved: false
      },
      {
        id: 'gear_mechanism',
        name: '中央齿轮组',
        position: { x: 420, y: 480 },
        size: { x: 140, y: 100 },
        spriteKey: 'obj_gear_mechanism',
        interactive: true,
        type: 'door',
        requiredItemOneOf: ['gear_restored', 'mech_room_key'],
        targetScene: 'backstage',
        clueText: '巨大的齿轮组缺少一枚关键齿轮，无法咬合运转...或许可以找到合适的齿轮嵌入，或是用专用钥匙直接解锁。'
      },
      {
        id: 'mech_wall_note',
        name: '墙上的标语',
        position: { x: 120, y: 200 },
        size: { x: 100, y: 60 },
        spriteKey: 'obj_wall_note',
        interactive: true,
        type: 'clue',
        clueText: '褪色的标语写着：「所有阀门归零，蒸汽方能通达——安全操作规程第7条」'
      },
      {
        id: 'pipe_clue',
        name: '管道标识',
        position: { x: 600, y: 150 },
        size: { x: 80, y: 40 },
        spriteKey: 'obj_pipe_label',
        interactive: true,
        type: 'clue',
        clueText: '管道上用油漆标注的箭头和编号：0号→1号→2号→3号，形成一个菱形回路。转动任一阀门会联动对角线上的两个阀门。'
      },
      {
        id: 'back_to_backstage',
        name: '返回后台',
        position: { x: 40, y: 550 },
        size: { x: 100, y: 60 },
        spriteKey: 'obj_exit_sign',
        interactive: true,
        type: 'exit',
        targetScene: 'backstage',
        clueText: '爬上铁梯回到后台。'
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
  hintUsed: 0,
  archiveState: {
    discoveredClues: [],
    collectedFragments: [],
    completedDocuments: [],
    readDocuments: [],
    searchHistory: [],
    unlockedSecrets: [],
    logs: []
  },
  ghostActorState: {
    trustValue: 0,
    maxTrust: 100,
    currentDialogId: 'ga_intro_1',
    unlockedFlags: [],
    deliveredItems: [],
    receivedItems: [],
    dialogHistory: [],
    questCompleted: false,
    endingTriggered: null,
    encounterCount: 0
  }
};

import type { Clue, DocumentFragment, ArchiveDocument } from '@/types';

export const CLUES: Record<string, Clue> = {
  clue_theater_founder: {
    id: 'clue_theater_founder',
    title: '剧院创始人',
    content: '陈思远，1920年创办「永夜剧院」。据说他痴迷于神秘学，相信戏剧是连接两个世界的媒介。最后一场演出《永恒之夜》是他自编自导的作品，首演当夜发生了神秘大火。',
    category: 'person',
    tags: ['陈思远', '创始人', '永夜剧院', '神秘学', '1920'],
    relatedClues: ['clue_eternal_night', 'clue_fire_incident'],
    discovered: false,
    icon: '👤',
    description: '关于剧院创始人陈思远的资料'
  },
  clue_eternal_night: {
    id: 'clue_eternal_night',
    title: '《永恒之夜》',
    content: '三幕悲剧。讲述一位女演员为追求永恒之神许愿换取不朽艺术，最终迷失在永恒黑夜中的故事。据说剧本是陈思远的真实经历改编，女主角原型是他的未婚妻林婉清。',
    category: 'event',
    tags: ['永恒之夜', '剧本', '林婉清', '三幕悲剧', '女主角'],
    relatedClues: ['clue_theater_founder', 'clue_actress_diary', 'clue_music_box_secret'],
    discovered: false,
    icon: '🎭',
    description: '关于最后一场演出的剧本'
  },
  clue_fire_incident: {
    id: 'clue_fire_incident',
    title: '1956年大火',
    content: '1956年8月15日夜，《永恒之夜》首演第三幕时，后台突发大火。官方报告称是线路老化，但目击者说火焰是从舞台中央凭空燃起的。全剧场127人无一生还。',
    category: 'event',
    tags: ['大火', '1956年', '首演', '127人', '神秘'],
    relatedClues: ['clue_theater_founder', 'clue_eternal_night', 'clue_newspaper_clipping'],
    discovered: false,
    icon: '🔥',
    description: '关于那场神秘大火的记录'
  },
  clue_actress_diary: {
    id: 'clue_actress_diary',
    title: '女主角日记',
    content: '林婉清，艺名「夜莺」，是当时最负盛名的舞台剧演员。她在日记中写道：「思远说，只要完成这出戏，我们就能永远在一起了。我害怕，但也期待。」',
    category: 'person',
    tags: ['林婉清', '夜莺', '日记', '女演员', '爱情'],
    relatedClues: ['clue_eternal_night', 'clue_music_box_secret', 'clue_photo_found'],
    discovered: false,
    icon: '📔',
    description: '关于女主角林婉清的介绍'
  },
  clue_music_box_secret: {
    id: 'clue_music_box_secret',
    title: '音乐盒的秘密',
    content: '这个音乐盒是陈思远送给林婉清的定情信物。旋律来自《永恒之夜》第三幕的咏叹调。盒底刻着：「黑夜尽头，与君相逢。」据说这是打开某个机关的钥匙。',
    category: 'item',
    tags: ['音乐盒', '定情信物', '咏叹调', '机关', '钥匙'],
    relatedClues: ['clue_actress_diary', 'clue_projection_room_hidden'],
    discovered: false,
    icon: '🎵',
    description: '音乐盒背后隐藏的秘密'
  },
  clue_projection_room_hidden: {
    id: 'clue_projection_room_hidden',
    title: '放映室暗格',
    content: '放映室办公桌最下层抽屉里有一个暗格，需要用放映机投射特定光影才能打开。暗格里存放着剧院的真正秘密——陈林二人的亲笔信和一张合影。',
    category: 'location',
    tags: ['放映室', '暗格', '亲笔信', '合影', '光影机关'],
    relatedClues: ['clue_music_box_secret', 'clue_theater_founder', 'clue_secret_letter'],
    discovered: false,
    icon: '📽️',
    description: '放映室里的隐藏空间'
  },
  clue_newspaper_clipping: {
    id: 'clue_newspaper_clipping',
    title: '旧报纸剪报',
    content: '《城市晨报》1956年8月16日头条：「永夜剧院突发大火，百人遇难。警方初步调查称系意外，但幸存者（？）称见神秘女子立于火中唱歌。」',
    category: 'item',
    tags: ['报纸', '1956年', '晨报', '神秘女子', '火中唱歌'],
    relatedClues: ['clue_fire_incident', 'clue_actress_diary'],
    discovered: false,
    icon: '📰',
    description: '关于大火次日的新闻报道'
  },
  clue_secret_letter: {
    id: 'clue_secret_letter',
    title: '未寄出的信',
    content: '婉清亲启：「仪式即将开始，我知道你害怕。但这是我们唯一的出路。我会在第三幕后台等你，音乐盒响起时，握住我的手。——思远」',
    category: 'item',
    tags: ['信件', '仪式', '第三幕', '后台', '牵手'],
    relatedClues: ['clue_theater_founder', 'clue_eternal_night', 'clue_final_door_truth'],
    discovered: false,
    icon: '💌',
    description: '陈思远写给林婉清的最后一封信'
  },
  clue_photo_found: {
    id: 'clue_photo_found',
    title: '泛黄的照片',
    content: '照片上是一对年轻男女站在剧院门前。男子温文尔雅，女子笑靥如花。背面写着：「1955年夏，永恒之夜彩排第一天。我们会永远在一起。」',
    category: 'item',
    tags: ['照片', '1955年', '合影', '彩排', '永远在一起'],
    relatedClues: ['clue_actress_diary', 'clue_theater_founder'],
    discovered: false,
    icon: '🖼️',
    description: '陈林二人的合影'
  },
  clue_stage_key_origin: {
    id: 'clue_stage_key_origin',
    title: '舞台钥匙的来历',
    content: '银色把手的钥匙是林婉清的私人钥匙。剧院建成时，陈思远特意为她打造了这把钥匙，上面刻着一只夜莺的图案。只有她能自由出入后台。',
    category: 'item',
    tags: ['舞台钥匙', '夜莺', '私人钥匙', '后台', '定制'],
    relatedClues: ['clue_actress_diary', 'clue_theater_founder'],
    discovered: false,
    icon: '🗝️',
    description: '舞台钥匙背后的故事'
  },
  clue_final_door_truth: {
    id: 'clue_final_door_truth',
    title: '最终之门的真相',
    content: '剧院外门并非通向外界的出口。它是「永恒之门」——完成仪式后，通过这扇门，灵魂可以进入永恒的戏剧世界。但这也意味着，永远无法返回人间...',
    category: 'secret',
    tags: ['最终之门', '永恒之门', '仪式', '灵魂', '永恒世界'],
    relatedClues: ['clue_secret_letter', 'clue_theater_founder', 'clue_eternal_night'],
    discovered: false,
    icon: '🚪',
    description: '关于剧院外门的真正秘密'
  },
  clue_lights_pattern: {
    id: 'clue_lights_pattern',
    title: '灯光的含义',
    content: '红蓝黄绿四色灯光对应戏剧的四幕：序幕(红)、发展(蓝)、高潮(黄)、结局(绿)。日记中写的顺序实际是「让序幕和高潮同时点亮」——这是召唤仪式的开始。',
    category: 'secret',
    tags: ['灯光', '四幕', '召唤仪式', '序幕', '高潮'],
    relatedClues: ['clue_eternal_night', 'clue_theater_founder'],
    discovered: false,
    icon: '💡',
    description: '灯光密码背后的仪式含义'
  },
  clue_mech_room_history: {
    id: 'clue_mech_room_history',
    title: '地下机械房',
    content: '剧院地下有一间被遗忘的机械房，曾经是整座剧院的蒸汽动力中心。大火之后，这里被封死。据说陈思远曾独自来此进行仪式的准备工作，他修改了管道走向，让蒸汽成为一种「灵媒」。',
    category: 'location',
    tags: ['机械房', '地下', '蒸汽', '仪式准备', '管道'],
    relatedClues: ['clue_theater_founder', 'clue_secret_letter'],
    discovered: false,
    icon: '🏭',
    description: '关于地下机械房的记录'
  },
  clue_valve_mechanism: {
    id: 'clue_valve_mechanism',
    title: '阀门联动原理',
    content: '四座阀门通过管道以菱形方式连接，转动一个阀门会沿对角线联动另外两个。安全规程要求所有阀门归零才能启动蒸汽——这是某种设计上的安全互锁，也是谜题的关键。',
    category: 'item',
    tags: ['阀门', '联动', '菱形', '归零', '蒸汽'],
    relatedClues: ['clue_mech_room_history'],
    discovered: false,
    icon: '🔄',
    description: '蒸汽阀门系统的运作原理'
  }
};

export const DOCUMENT_FRAGMENTS: Record<string, DocumentFragment> = {
  frag_actress_diary_1: {
    id: 'frag_actress_diary_1',
    documentId: 'doc_actress_diary',
    title: '日记残页·一',
    content: '1955年3月12日\n\n今天思远说要为我写一出戏，是他花了三年心血的作品。他说这出戏将改变一切，改变我们的命运。',
    position: 0,
    totalPieces: 4,
    collected: false,
    hint: '在售票柜台附近发现'
  },
  frag_actress_diary_2: {
    id: 'frag_actress_diary_2',
    documentId: 'doc_actress_diary',
    title: '日记残页·二',
    content: '1955年6月20日\n\n剧本写完了，名叫《永恒之夜》。第三幕有一段很特别的台词，思远说是专门写给我的。他让我一定要在首演之夜完整地念出来。',
    position: 1,
    totalPieces: 4,
    collected: false,
    hint: '观众厅前排座椅夹缝中'
  },
  frag_actress_diary_3: {
    id: 'frag_actress_diary_3',
    documentId: 'doc_actress_diary',
    title: '日记残页·三',
    content: '1956年8月10日\n\n还有五天就是首演了。思远最近很神秘，总是一个人躲在放映室里。我在他桌上看到了一些奇怪的符文和我看不懂的书。他说那是「舞台灯光的布置图。',
    position: 2,
    totalPieces: 4,
    collected: false,
    hint: '放映室胶片盒里'
  },
  frag_actress_diary_4: {
    id: 'frag_actress_diary_4',
    documentId: 'doc_actress_diary',
    title: '日记残页·四',
    content: '1956年8月14日\n\n明天就是首演了。今晚思远把音乐盒给了我，他说音乐盒响起的时候，就是我们永远在一起的时刻。我有些害怕，但更多的是期待。爱你，思远。',
    position: 3,
    totalPieces: 4,
    collected: false,
    hint: '后台化妆台抽屉深处'
  },
  frag_founders_journal_1: {
    id: 'frag_founders_journal_1',
    documentId: 'doc_founders_journal',
    title: '创始人手札·一',
    content: '研究笔记第47号\n\n古老的戏剧仪式记载，在特定的时间、特定的地点，通过戏剧的形式，可以打开两个世界的通道。',
    position: 0,
    totalPieces: 3,
    collected: false,
    hint: '大厅褪色海报背后'
  },
  frag_founders_journal_2: {
    id: 'frag_founders_journal_2',
    documentId: 'doc_founders_journal',
    title: '创始人手札·二',
    content: '研究笔记第48号\n\n通道需要四个关键：1)四色灯光按特定顺序点亮；2)演员念诵第三幕的关键台词；3)音乐盒的旋律作为媒介；4)两颗真诚相爱的心。',
    position: 1,
    totalPieces: 3,
    collected: false,
    hint: '灯光控制面板夹层'
  },
  frag_founders_journal_3: {
    id: 'frag_founders_journal_3',
    documentId: 'doc_founders_journal',
    title: '创始人手札·三',
    content: '研究笔记第49号\n\n代价是...（此处被撕掉了大部分）...永远无法返回...但只要能和婉清在一起，任何代价我都愿意承担。仪式就在首演之夜，第三幕高潮时。',
    position: 2,
    totalPieces: 3,
    collected: false,
    hint: '放映室办公桌暗格'
  }
};

export const ARCHIVE_DOCUMENTS: Record<string, ArchiveDocument> = {
  doc_actress_diary: {
    id: 'doc_actress_diary',
    title: '林婉清私人日记',
    author: '林婉清',
    date: '1955-1956年',
    type: 'diary',
    fragments: ['frag_actress_diary_1', 'frag_actress_diary_2', 'frag_actress_diary_3', 'frag_actress_diary_4'],
    assembledContent: `【林婉清私人日记】\n\n━━━━━━━━━━━━━━━━━━━━\n\n1955年3月12日\n今天思远说要为我写一出戏，是他花了三年心血的作品。他说这出戏将改变一切，改变我们的命运。\n\n━━━━━━━━━━━━━━━━━━━━\n\n1955年6月20日\n剧本写完了，名叫《永恒之夜》。第三幕有一段很特别的台词，思远说是专门写给我的。他让我一定要在首演之夜完整地念出来。\n\n━━━━━━━━━━━━━━━━━━━━\n\n1956年8月10日\n还有五天就是首演了。思远最近很神秘，总是一个人躲在放映室里。我在他桌上看到了一些奇怪的符文和我看不懂的书。他说那是「舞台灯光的布置图」。\n\n━━━━━━━━━━━━━━━━━━━━\n\n1956年8月14日\n明天就是首演了。今晚思远把音乐盒给了我，他说音乐盒响起的时候，就是我们永远在一起的时刻。我有些害怕，但更多的是期待。爱你，思远。`,
    completed: false,
    isRead: false,
    summary: '林婉清从1955年到1956年首演前写下的日记，记录了她和陈思远的爱情以及对《永恒之夜》的期待。字里行间充满了对未来的憧憬，也透露着一丝不安。',
    reveals: ['clue_actress_diary', 'clue_music_box_secret']
  },
  doc_founders_journal: {
    id: 'doc_founders_journal',
    title: '陈思远研究手札',
    author: '陈思远',
    date: '不详',
    type: 'report',
    fragments: ['frag_founders_journal_1', 'frag_founders_journal_2', 'frag_founders_journal_3'],
    assembledContent: `【陈思远研究手札】\n\n━━━━━━━━━━━━━━━━━━━━\n\n研究笔记第47号\n古老的戏剧仪式记载，在特定的时间、特定的地点，通过戏剧的形式，可以打开两个世界的通道。\n\n━━━━━━━━━━━━━━━━━━━━\n\n研究笔记第48号\n通道需要四个关键：\n1) 四色灯光按特定顺序点亮\n2) 演员念诵第三幕的关键台词\n3) 音乐盒的旋律作为媒介\n4) 两颗真诚相爱的心\n\n━━━━━━━━━━━━━━━━━━━━\n\n研究笔记第49号\n代价是...（此处被撕掉了大部分）...永远无法返回...但只要能和婉清在一起，任何代价我都愿意承担。仪式就在首演之夜，第三幕高潮时。`,
    completed: false,
    isRead: false,
    summary: '陈思远的神秘研究笔记，揭示了一个古老的戏剧仪式——通过特定的四个要素可以打开通往永恒世界的通道。最后部分被撕掉，暗示了某种可怕的代价。',
    reveals: ['clue_theater_founder', 'clue_lights_pattern', 'clue_final_door_truth']
  }
};

import type { ArchiveState, DialogNode, GhostActorEndingData, GhostActorHint, GhostActorState } from '@/types';

export const INITIAL_ARCHIVE_STATE: ArchiveState = {
  discoveredClues: [],
  collectedFragments: [],
  completedDocuments: [],
  readDocuments: [],
  searchHistory: [],
  unlockedSecrets: [],
  logs: []
};

export const GHOST_ACTOR_DIALOGS: Record<string, DialogNode> = {
  ga_intro_1: {
    id: 'ga_intro_1',
    speaker: '???',
    text: '你......能看见我？',
    emotion: 'scared',
    choices: [
      { id: 'c1_1', text: '你是谁？为什么在这里？', nextDialogId: 'ga_intro_2a', trustChange: 5 },
      { id: 'c1_2', text: '（后退）你是......幽灵？', nextDialogId: 'ga_intro_2b', trustChange: -5 },
      { id: 'c1_3', text: '（静静等待）', nextDialogId: 'ga_intro_2c', trustChange: 10 }
    ]
  },
  ga_intro_2a: {
    id: 'ga_intro_2a',
    speaker: '林婉清',
    text: '我叫林婉清......曾经是这家剧院的演员。我被困在这里很久很久了，久到我已经记不清过了多少年。',
    emotion: 'sad',
    nextDialogId: 'ga_intro_3',
    autoTrustChange: 5,
    autoUnlockFlag: 'met_wanqing'
  },
  ga_intro_2b: {
    id: 'ga_intro_2b',
    speaker: '林婉清',
    text: '......是的，我是幽灵。你不用害怕，我不会伤害你。我只是......只是想离开这里。',
    emotion: 'sad',
    nextDialogId: 'ga_intro_3',
    autoUnlockFlag: 'met_wanqing'
  },
  ga_intro_2c: {
    id: 'ga_intro_2c',
    speaker: '林婉清',
    text: '......你不怕我？已经很久没有人愿意这样平静地看着我了。谢谢你。我叫林婉清，曾经是这里的女主角。',
    emotion: 'hopeful',
    nextDialogId: 'ga_intro_3',
    autoTrustChange: 10,
    autoUnlockFlag: 'met_wanqing'
  },
  ga_intro_3: {
    id: 'ga_intro_3',
    speaker: '林婉清',
    text: '那场大火之后，我就被困在了这里。思远......他应该也在附近，但我找不到他。你能......帮帮我吗？',
    emotion: 'hopeful',
    choices: [
      { id: 'c3_1', text: '我会帮你的，告诉我该怎么做。', nextDialogId: 'ga_quest_accept', trustChange: 15 },
      { id: 'c3_2', text: '思远是谁？先告诉我发生了什么。', nextDialogId: 'ga_story_1', trustChange: 10 },
      { id: 'c3_3', text: '我需要先探索一下，稍后再说。', nextDialogId: 'ga_quest_defer', trustChange: 0 }
    ]
  },
  ga_quest_accept: {
    id: 'ga_quest_accept',
    speaker: '林婉清',
    text: '真的吗？太好了！我......我有几样东西散落在剧院各处，如果能找回来，也许能召唤思远的灵魂。那些东西对我都很重要......',
    emotion: 'happy',
    nextDialogId: 'ga_quest_detail',
    autoTrustChange: 10,
    autoUnlockFlag: 'quest_started'
  },
  ga_story_1: {
    id: 'ga_story_1',
    speaker: '林婉清',
    text: '思远是陈思远，这家剧院的创始人，也是......我最爱的人。他为了能和我永远在一起，进行了一个古老的仪式。但是仪式出了差错，大火......那场大火带走了所有人。',
    emotion: 'sad',
    backgroundEffect: 'dim',
    nextDialogId: 'ga_story_2',
    autoTrustChange: 5,
    autoUnlockFlag: 'knows_story'
  },
  ga_story_2: {
    id: 'ga_story_2',
    speaker: '林婉清',
    text: '我们的灵魂被困在了这里。我一直在寻找他，但始终找不到。也许......也许是因为我还没有原谅自己。',
    emotion: 'sad',
    choices: [
      { id: 'c2s_1', text: '原谅自己？发生了什么？', nextDialogId: 'ga_story_3', trustChange: 10 },
      { id: 'c2s_2', text: '我会帮你们团聚的。', nextDialogId: 'ga_quest_accept', trustChange: 15 }
    ]
  },
  ga_story_3: {
    id: 'ga_story_3',
    speaker: '林婉清',
    text: '仪式当晚......我其实有些害怕。我写了一封信想要阻止思远，但是......我没有勇气交给他。火燃起来的时候，我甚至在想，如果我当初把信给他，一切会不会不同......',
    emotion: 'sad',
    nextDialogId: 'ga_quest_accept',
    autoTrustChange: 10,
    autoUnlockFlag: 'knows_regret'
  },
  ga_quest_defer: {
    id: 'ga_quest_defer',
    speaker: '林婉清',
    text: '好的......我就在这附近徘徊，你想找我的时候就来观众厅或者后台吧。我等你。',
    emotion: 'sad',
    nextDialogId: 'ga_generic_chat'
  },
  ga_quest_detail: {
    id: 'ga_quest_detail',
    speaker: '林婉清',
    text: '我丢失了四样东西：一张旧照片、一片戏服碎片、一朵枯萎的白玫瑰，还有......一封没有写完的信。如果你能把它们找回来交给我，我会非常感激的。',
    emotion: 'hopeful',
    choices: [
      { id: 'qd_1', text: '旧照片是什么样的？', nextDialogId: 'ga_hint_photo', trustChange: 0 },
      { id: 'qd_2', text: '我这就去找。', nextDialogId: 'ga_end_quest_info', trustChange: 5 }
    ],
    autoUnlockFlag: 'knows_items'
  },
  ga_hint_photo: {
    id: 'ga_hint_photo',
    speaker: '林婉清',
    text: '那是我和思远的合影，我把它放在放映室的窗台上......因为那里是我们第一次见面的地方。你愿意帮我找回来吗？',
    emotion: 'happy',
    nextDialogId: 'ga_end_quest_info',
    autoUnlockFlag: 'hint_photo'
  },
  ga_end_quest_info: {
    id: 'ga_end_quest_info',
    speaker: '林婉清',
    text: '你随时可以来找我。如果收集到了什么，就带给我看看吧。希望......这次真的能让一切结束。',
    emotion: 'hopeful',
    nextDialogId: 'ga_generic_chat'
  },
  ga_return_photo: {
    id: 'ga_return_photo',
    speaker: '林婉清',
    text: '这......这是！我以为再也找不到这张照片了......谢谢你，真的谢谢你。你看，那时候的我们笑得多开心......',
    emotion: 'happy',
    nextDialogId: 'ga_after_item_generic',
    autoTrustChange: 15,
    autoTakeItem: 'old_photo',
    autoUnlockFlag: 'delivered_photo'
  },
  ga_return_costume: {
    id: 'ga_return_costume',
    speaker: '林婉清',
    text: '这是《永恒之夜》第三幕的戏服......我穿着它唱完了最后一句台词。金线刺绣是思远亲手缝上去的......他说我是他唯一的夜莺。',
    emotion: 'happy',
    nextDialogId: 'ga_after_item_generic',
    autoTrustChange: 15,
    autoTakeItem: 'costume_fragment',
    autoUnlockFlag: 'delivered_costume'
  },
  ga_return_rose: {
    id: 'ga_return_rose',
    speaker: '林婉清',
    text: '这朵玫瑰......是首演当晚思远放在我化妆台上的。他说白玫瑰代表永恒的爱。哪怕它枯萎了，我也舍不得扔掉......',
    emotion: 'sad',
    nextDialogId: 'ga_after_item_generic',
    autoTrustChange: 15,
    autoTakeItem: 'wilted_rose',
    autoUnlockFlag: 'delivered_rose'
  },
  ga_return_letter: {
    id: 'ga_return_letter',
    speaker: '林婉清',
    text: '这封信......我写了一半就哭到写不下去了。「思远，如果你看到这封信，可不可以不要进行那个仪式了？我只想和你平平凡凡地过一辈子......」可我最终还是没把它给他。',
    emotion: 'sad',
    backgroundEffect: 'dim',
    nextDialogId: 'ga_after_letter',
    autoTrustChange: 25,
    autoTakeItem: 'unfinished_letter',
    autoUnlockFlag: 'delivered_letter'
  },
  ga_after_item_generic: {
    id: 'ga_after_item_generic',
    speaker: '林婉清',
    text: '......还有其他东西吗？如果还能找到更多，也许我就有勇气去面对他了。',
    emotion: 'hopeful',
    nextDialogId: 'ga_generic_chat'
  },
  ga_after_letter: {
    id: 'ga_after_letter',
    speaker: '林婉清',
    text: '这么多年了......我一直在自责。如果我把这封信给他，如果我更勇敢一些......也许我们都会有不同的结局。',
    emotion: 'sad',
    choices: [
      { id: 'al_1', text: '你不需要自责，你已经尽力了。', nextDialogId: 'ga_forgive_1', trustChange: 20 },
      { id: 'al_2', text: '现在还不晚，我们可以一起弥补。', nextDialogId: 'ga_forgive_2', trustChange: 25 }
    ]
  },
  ga_forgive_1: {
    id: 'ga_forgive_1',
    speaker: '林婉清',
    text: '......你说的对。也许......也许我该放下了。只是......我真的好想再见他一面，亲口告诉他我没有怪他。',
    emotion: 'hopeful',
    nextDialogId: 'ga_final_check',
    autoUnlockFlag: 'wanqing_forgiven'
  },
  ga_forgive_2: {
    id: 'ga_forgive_2',
    speaker: '林婉清',
    text: '......嗯！你说得对。谢谢你，让我重新有了勇气。现在......集齐所有东西后，我想我可以召唤思远了。',
    emotion: 'hopeful',
    nextDialogId: 'ga_final_check',
    autoTrustChange: 10,
    autoUnlockFlag: 'wanqing_forgiven'
  },
  ga_final_check: {
    id: 'ga_final_check',
    speaker: '林婉清',
    text: '把四样东西都给我之后，我就可以进行召唤。你......你愿意陪我等到那时候吗？',
    emotion: 'hopeful',
    choices: [
      { id: 'fc_1', text: '当然，我会一直陪着你。', nextDialogId: 'ga_promise', trustChange: 15 },
      { id: 'fc_2', text: '我先去找剩下的东西。', nextDialogId: 'ga_end_quest_info', trustChange: 0 }
    ]
  },
  ga_promise: {
    id: 'ga_promise',
    speaker: '林婉清',
    text: '谢谢你......我好像......已经很久没有这样期待过什么了。你一定是上天派来帮助我们的人。',
    emotion: 'happy',
    autoUnlockFlag: 'promise_made',
    nextDialogId: 'ga_generic_chat'
  },
  ga_all_items_delivered: {
    id: 'ga_all_items_delivered',
    speaker: '林婉清',
    text: '四样东西都齐了......还有这封信......我现在......我现在可以召唤思远了。你......你愿意见证这一切吗？',
    emotion: 'hopeful',
    backgroundEffect: 'fade',
    choices: [
      { id: 'aid_1', text: '（握住她的手）我们一起。', nextDialogId: 'ga_reunion_perfect', trustChange: 20, triggerEnding: 'ga_reunion_perfect', requiresMinTrust: 80 },
      { id: 'aid_2', text: '开始吧，我看着。', nextDialogId: 'ga_reunion_good', triggerEnding: 'ga_reunion_normal' },
      { id: 'aid_3', text: '等等......用夜莺胸针试试？', nextDialogId: 'ga_reunion_brooch', requiredItem: 'nightingale_brooch', takeItem: 'nightingale_brooch', trustChange: 10, triggerEnding: 'ga_reunion_perfect' }
    ],
    autoUnlockFlag: 'ritual_ready'
  },
  ga_reunion_good: {
    id: 'ga_reunion_good',
    speaker: '林婉清',
    text: '（她将四样东西摆放在面前，轻声念起了《永恒之夜》的台词。空气中浮现出一个模糊的身影......是陈思远。）',
    emotion: 'hopeful',
    backgroundEffect: 'flash',
    nextDialogId: 'ga_reunion_2'
  },
  ga_reunion_perfect: {
    id: 'ga_reunion_perfect',
    speaker: '林婉清',
    text: '（你紧紧握住她的手。温暖的触感传来，她的身影渐渐凝实。四样东西开始发光，空气中浮现出另一道身影......是陈思远。）',
    emotion: 'happy',
    backgroundEffect: 'flash',
    nextDialogId: 'ga_reunion_perfect_2'
  },
  ga_reunion_brooch: {
    id: 'ga_reunion_brooch',
    speaker: '林婉清',
    text: '（夜莺胸针在你手中发出温柔的光芒，在空中划出银色的轨迹。四样东西悬浮起来，两道身影在光芒中逐渐清晰......）',
    emotion: 'happy',
    backgroundEffect: 'flash',
    nextDialogId: 'ga_reunion_perfect_2'
  },
  ga_reunion_2: {
    id: 'ga_reunion_2',
    speaker: '陈思远',
    text: '......婉清？是你吗？我找了你好久......我以为......我以为你永远不会原谅我了。',
    emotion: 'sad',
    nextDialogId: 'ga_reunion_3'
  },
  ga_reunion_perfect_2: {
    id: 'ga_reunion_perfect_2',
    speaker: '陈思远',
    text: '婉清！我终于找到你了......这枚胸针......是我送给你的第一份礼物，它居然还在......还有这封信，对不起，都是我的错......',
    emotion: 'happy',
    nextDialogId: 'ga_reunion_3'
  },
  ga_reunion_3: {
    id: 'ga_reunion_3',
    speaker: '林婉清',
    text: '思远......我从来没有怪过你。是我不好，如果我把信给你......我们就不会......',
    emotion: 'sad',
    nextDialogId: 'ga_reunion_4'
  },
  ga_reunion_4: {
    id: 'ga_reunion_4',
    speaker: '陈思远',
    text: '不，是我的执念太深了。我想永远和你在一起，却用错了方式。现在......现在这样就很好了。至少......我们又在一起了。',
    emotion: 'happy',
    nextDialogId: 'ga_reunion_final'
  },
  ga_reunion_final: {
    id: 'ga_reunion_final',
    speaker: '林婉清',
    text: '（两人相视而笑，身影逐渐变得透明。在消失之前，林婉清转向你。）谢谢你......帮我们完成了这场迟到了三十年的重逢。我们......终于可以安息了。（两道光芒飞向天空，剧院的灯光一盏接一盏地亮起。）',
    emotion: 'happy',
    backgroundEffect: 'flash',
    autoUnlockFlag: 'quest_complete'
  },
  ga_low_trust_warning: {
    id: 'ga_low_trust_warning',
    speaker: '林婉清',
    text: '你......我不太确定能不能相信你。也许......我们应该多聊聊？你知道，有些事情......不是所有人都愿意听的。',
    emotion: 'scared'
  },
  ga_generic_chat: {
    id: 'ga_generic_chat',
    speaker: '林婉清',
    text: '还有什么想知道的吗？关于这家剧院，关于我们，或者关于那场仪式......',
    emotion: 'neutral',
    choices: [
      { id: 'gc_1', text: '告诉我更多关于《永恒之夜》的事。', nextDialogId: 'ga_talk_play', trustChange: 5 },
      { id: 'gc_2', text: '那场大火到底是怎么回事？', nextDialogId: 'ga_talk_fire', trustChange: 10, requiredFlag: 'knows_story' },
      { id: 'gc_3', text: '（交还找到的物品）', nextDialogId: 'ga_check_inventory', trustChange: 0 },
      { id: 'gc_4', text: '我先去探索了，回头聊。', nextDialogId: 'ga_end_conversation', trustChange: 0 }
    ]
  },
  ga_talk_play: {
    id: 'ga_talk_play',
    speaker: '林婉清',
    text: '《永恒之夜》是思远为我写的。故事讲的是一位女演员为了追求永恒的艺术，与黑夜做了交易。但她不知道，永恒的代价是失去所爱的一切......第三幕那段咏叹调，是思远最喜欢的部分。',
    emotion: 'happy',
    nextDialogId: 'ga_generic_chat',
    autoUnlockFlag: 'knows_play'
  },
  ga_talk_fire: {
    id: 'ga_talk_fire',
    speaker: '林婉清',
    text: '当我念完最后一句台词，舞台中央突然燃起了蓝色的火焰。不是红色，是幽幽的蓝色......所有人都在尖叫，但我动不了。我看到思远站在火中，微笑着向我伸出手。那时候我才明白，他计划的根本不是什么「永恒」......是殉情。',
    emotion: 'sad',
    backgroundEffect: 'dim',
    nextDialogId: 'ga_generic_chat',
    autoTrustChange: 15,
    autoUnlockFlag: 'knows_fire_truth'
  },
  ga_check_inventory: {
    id: 'ga_check_inventory',
    speaker: '林婉清',
    text: '你找到什么了吗？让我看看......',
    emotion: 'hopeful',
    nextDialogId: 'ga_generic_chat'
  },
  ga_end_conversation: {
    id: 'ga_end_conversation',
    speaker: '林婉清',
    text: '好的，小心点。剧院里有些地方......不太安全。如果你看到其他奇怪的东西......就当作没看见吧。',
    emotion: 'sad',
    nextDialogId: 'ga_generic_chat'
  }
};

export const GHOST_ACTOR_ENDINGS: Record<string, GhostActorEndingData> = {
  ga_reunion_perfect: {
    id: 'ga_reunion_perfect',
    title: '永恒之夜·完美终章',
    description: '在夜莺胸针的指引下，两颗分离了三十年的灵魂终于找到了彼此。蓝色的火焰变成了温柔的金光，笼罩着整个剧院。',
    isGood: true,
    requiredTrust: 80,
    requiredFlags: ['wanqing_forgiven', 'delivered_photo', 'delivered_costume', 'delivered_rose', 'delivered_letter'],
    scoreBonus: 800,
    epilogueText: `陈思远和林婉清手牵着手，在金色的光芒中渐渐远去。\n\n他们之间的误会、遗憾和痛苦，都在这一刻化作了云烟。\n\n「黑夜尽头，与君相逢。」\n\n音乐盒的旋律最后一次响起，剧院的灯光一盏接一盏地熄灭。\n\n但你知道，永夜终于过去，黎明即将到来。\n\n——《永恒之夜》完美落幕——`
  },
  ga_reunion_normal: {
    id: 'ga_reunion_normal',
    title: '永恒之夜·重逢',
    description: '三十年的等待，终于换来了这一刻的重逢。虽然有遗憾，但两人的心已经紧紧相连。',
    isGood: true,
    requiredTrust: 40,
    requiredFlags: ['delivered_photo', 'delivered_costume', 'delivered_rose', 'delivered_letter'],
    scoreBonus: 500,
    epilogueText: `林婉清和陈思远的身影渐渐变得透明。\n\n「对不起，让你等了这么久。」\n「没关系，至少我们最后还是在一起了。」\n\n两道光芒缠绕着飞向天空，\n剧院的灯光闪烁了几下，归于平静。\n\n你推开大门，外面的阳光有些刺眼。\n\n身后的剧院，终于不再传出哀婉的歌声。\n\n——《永恒之夜》谢幕——`
  },
  ga_unfinished: {
    id: 'ga_unfinished',
    title: '永恒之夜·未完待续',
    description: '你离开了剧院，但林婉清的故事还没有结束。也许某天，会有人替你完成这件事......',
    isGood: false,
    scoreBonus: 0,
    epilogueText: `你推开剧院的大门，阳光洒在脸上。\n\n但你知道，有什么东西被留在了那里。\n\n身后传来若有若无的歌声，\n是《永恒之夜》第三幕的咏叹调。\n\n你没有回头。\n\n只是在心里默默希望——\n某天，会有人替她完成那个未了的心愿。\n\n——《永恒之夜》未完待续——`
  }
};

export const GHOST_ACTOR_HINTS: GhostActorHint[] = [
  {
    id: 'hint_meet_ghost',
    condition: 'encounter',
    text: '👻 观众厅的舞台边似乎站着一个身影，试着和她说话？'
  },
  {
    id: 'hint_low_trust',
    condition: 'low_trust',
    text: '💔 林婉清对你还有戒心，试着对她更温柔一些，倾听她的故事...'
  },
  {
    id: 'hint_high_trust',
    condition: 'high_trust',
    text: '✨ 你和林婉清的关系越来越好了！继续完成她的心愿吧。'
  },
  {
    id: 'hint_find_photo',
    condition: 'missing_item',
    relatedId: 'old_photo',
    text: '📷 旧照片在放映室的窗台上，那里是他们第一次见面的地方。'
  },
  {
    id: 'hint_find_costume',
    condition: 'missing_item',
    relatedId: 'costume_fragment',
    text: '🧵 蓝色戏服的碎片在放映室角落的衣架上。'
  },
  {
    id: 'hint_find_rose',
    condition: 'missing_item',
    relatedId: 'wilted_rose',
    text: '🥀 枯萎的白玫瑰在观众厅的楼座角落，她最爱那个位置。'
  },
  {
    id: 'hint_find_letter',
    condition: 'missing_item',
    relatedId: 'unfinished_letter',
    text: '✉️ 那封没写完的信在后台化妆台的抽屉最深处。'
  },
  {
    id: 'hint_deliver_items',
    condition: 'has_item',
    relatedId: 'old_photo',
    text: '🎁 你找到东西了！回到观众厅或者后台去找林婉清吧。'
  }
];

export const GHOST_ACTOR_TRIGGER_OBJECTS: Record<string, string[]> = {
  auditorium: ['ghost_actor_auditorium'],
  backstage: ['ghost_actor_backstage']
};

export const TRUST_THRESHOLDS = {
  hostile: 0,
  wary: 15,
  neutral: 30,
  friendly: 50,
  trusting: 70,
  intimate: 90
};

export const INITIAL_GHOST_ACTOR_STATE: GhostActorState = {
  trustValue: 0,
  maxTrust: 100,
  currentDialogId: 'ga_intro_1',
  unlockedFlags: [],
  deliveredItems: [],
  receivedItems: [],
  dialogHistory: [],
  questCompleted: false,
  endingTriggered: null,
  encounterCount: 0
};
