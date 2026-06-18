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
  hintUsed: 0,
  archiveState: {
    discoveredClues: [],
    collectedFragments: [],
    completedDocuments: [],
    readDocuments: [],
    searchHistory: [],
    unlockedSecrets: [],
    logs: []
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

import type { ArchiveState } from '@/types';

export const INITIAL_ARCHIVE_STATE: ArchiveState = {
  discoveredClues: [],
  collectedFragments: [],
  completedDocuments: [],
  readDocuments: [],
  searchHistory: [],
  unlockedSecrets: [],
  logs: []
};
