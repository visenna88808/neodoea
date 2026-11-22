import type {
  AreaDefinition,
  AreaId,
  CharacterProfile,
  Clue,
  DialogueNode,
  EvaluationQuestion,
  InteractableObject,
  InvestigationSynthesis,
  QuestId,
  SceneReward,
} from '../types/game';

export const ASSETS = {
  portraitNino: '/assets/aistudio/WhatsApp_Image_2026-11-21_at_22.34.40_d6c8cabd.jpeg',
  portraitIlyas: '/assets/aistudio/WhatsApp_Image_2026-11-21_at_22.34.40__1__562fd704.jpeg',
  portraitDira: '/assets/aistudio/WhatsApp_Image_2026-11-21_at_22.34.40__2__fe8ecc70.jpeg',
  portraitSari: '/assets/sprites/sari_portrait.jpg',
  portraitRaka: '/assets/sprites/raka_0.png',
  portraitWiryo: '/assets/sprites/wiryo_0.png',
  portraitDani: '/assets/sprites/dani_0.png',
  portraitMaya: '/assets/sprites/maya_0.png',
  portraitRani: '/assets/sprites/rani_0.png',
  portraitIlham: '/assets/sprites/ilham_0.png',
  portraitArga: '/assets/sprites/arga_0.png',
  bgOutskirts: '/src/assets/images/bg_harbor_pelabuhan_1795337721768.jpg',
  bgPlaza: '/src/assets/images/bg_central_plaza_1794919776377.jpg',
  bgStage: '/src/assets/images/bg_cultural_stage_1794919777672.jpg',
  bgTerminal: '/src/assets/images/bg_server_terminal_1794919778150.jpg',
  prologueFinalArt: '/assets/aistudio/WhatsApp_Image_2026-11-22_at_15.32.50_1030cfa5.jpeg',
  cutsceneEnding: '/src/assets/images/cutscene_ending_portal_1794919779699.jpg',
  cutsceneClassroomDay: '/src/assets/images/cutscene_classroom_day_1795272633709.jpg',
  cutsceneDreamGlobalization: '/src/assets/images/cutscene_dream_globalization_1795272633526.jpg',
  cutsceneCorridorPortal: '/src/assets/images/cutscene_corridor_portal_1795272633916.jpg',
  cutsceneDimensionTunnel: '/src/assets/images/cutscene_dimension_tunnel_1795272633780.jpg',
  animeNinoSleepDesk: '/src/assets/images/anime_nino_sleep_desk_1795273297882.jpg',
  animeNinoDreamWalk: '/src/assets/images/anime_nino_dream_walk_1795273299670.jpg',
  animeNinoPortalVortex: '/src/assets/images/anime_nino_portal_vortex_1795273298552.jpg',
  animeCorridorSideView: '/src/assets/images/anime_corridor_side_view_1795273675659.jpg',
  animeNinoSilhouettePortal: '/src/assets/images/anime_nino_silhouette_portal_1795273675536.jpg',
  ninoDeskDrowsy: '/src/assets/images/nino_desk_drowsy_1795283822301.jpg',
  ninoDeskNodding: '/src/assets/images/nino_desk_nodding_1795284297955.jpg',
  ninoDeskAsleep: '/src/assets/images/nino_desk_asleep_1795283823923.jpg',
  ninoDeskLifting: '/src/assets/images/nino_desk_lifting_1795284299804.jpg',
  ninoDeskSurprised: '/src/assets/images/nino_desk_surprised_1795283824382.jpg',
  ninoDeskLookLeft: '/src/assets/images/nino_desk_look_left_1795284298911.jpg',
  ninoDeskLookRight: '/src/assets/images/nino_desk_look_right_1795284299376.jpg',
  dreamCitySidewalk: '/src/assets/images/dream_city_sidewalk_1795283820620.jpg',
  ninoClassroomExit: '/src/assets/images/nino_classroom_exit_1795283821016.jpg',
  corridorSunsetWalk: '/src/assets/images/corridor_sunset_walk_1795283820701.jpg',
  corridorSunsetPortal: '/src/assets/images/corridor_sunset_portal_1795283820983.jpg',
  ninoCorridorPortalShock: '/src/assets/images/nino_corridor_portal_shock_1795284297966.jpg',
  ninoPortalRearStep: '/src/assets/images/nino_portal_rear_step_1795283821175.jpg',
  ninoEnteringPortalVortex: '/src/assets/images/nino_entering_portal_vortex_1795283821839.jpg',
  returnCityRestored: '/src/assets/images/ending_city_restored_batik_1795337741691.jpg',
  returnPortalEnterTrio: '/src/assets/images/ending_portal_suction_batik_1795337741518.jpg',
  returnPortalVortexTrio: '/src/assets/images/return_portal_vortex_trio_1795334848012.jpg',
  returnRealWorldCorridor: '/src/assets/images/ending_real_world_batik_1795337741836.jpg',
  collabTrioVictory: '/src/assets/images/collab_trio_victory_1795337741921.jpg',
  spriteNino: '/assets/sprites/nino_idle.png',
  spriteIlyas: '/assets/sprites/ilyas_idle.png',
  spriteDira: '/assets/sprites/dira_idle.png',
  spriteSari: '/assets/sprites/sari_0.png',
};

export const CHARACTER_PROFILES: CharacterProfile[] = [
  {
    id: 'nino',
    fullName: 'Adnan Naurel Elnino',
    nickname: 'Nino',
    birthInfo: 'Jakarta, 20 Desember',
    zodiac: 'Sagittarius',
    mbti: 'ISFP',
    height: '168 cm',
    schoolClass: 'XI IPS-1',
    appearance: [
      'Rambut cokelat berantakan sebahu',
      'Topi merah berlogo segitiga putih & tas ransel merah',
      'Kemeja batik biru langit bermotif cendrawasih emas & flora dipakai terbuka',
      'Kaos dalam hitam, celana panjang putih berikat pinggang gelap, & sepatu gelap',
    ],
    personality:
      'Blak-blakan, terkesan acuh, sulit diatur, dan terkadang melontarkan komentar polos. Di balik itu, ia diam-diam peduli terhadap orang lain, menyimpan sisi kesepian, dan terbiasa menarik topi menutupi wajahnya.',
    role: 'Investigator Lapangan & Pengumpul Bukti Fisik',
    abilityName: 'Curiosity Trigger',
    abilityDesc: 'Memeriksa benda mencurigakan, menemukan petunjuk tersembunyi, dan mengamati detail perubahan ruang sosial.',
    dutySummary: 'Pencari bukti fisik, panel tersembunyi, & observasi ruang publik',
    whenToUse: 'Gunakan Nino [1] saat memeriksa objek fisik, panel relay, arsip kabel, kotak tata suara, dan suasana bangku taman.',
    specificTasks: [
      'Bab 2 (Sandang Ayu Plaza): Mengamati Kursi Plaza Sepi (C2) dan mengisolasi anomali pada Panel Relay Tersembunyi (C2B).',
      'Bab 3 (Sanggar Darmoyudho): Memeriksa Kotak Panel Tata Suara panggung untuk menemukan Kartu Akses Server Kota (C4).',
      'Bab 4 (Terminal Server): Menyelidiki Rak Arsip Kabel Tua untuk mengungkap catatan gotong royong sebelum era algoritma (C4C).',
    ],
    portraitUrl: ASSETS.portraitNino,
    accentHex: '#ef4444',
  },
  {
    id: 'ilyas',
    fullName: 'Ilyas Saputra',
    nickname: 'Ilyas',
    birthInfo: 'Jakarta, 14 April',
    zodiac: 'Aries',
    mbti: 'ENFJ',
    height: '178 cm',
    schoolClass: 'XI IPS-1',
    appearance: [
      'Rambut cokelat tua bergelombang rapi berponi belah',
      'Kemeja batik biru langit bermotif cendrawasih emas & flora dikancing rapi',
      'Celana panjang putih dengan ikat pinggang kulit cokelat gelap',
      'Tas ransel hitam/abu tua tersampir di bahu',
    ],
    personality:
      'Tampak karismatik, cerdas, dan terstruktur karena berasal dari keluarga akademis beraturan ketat. Sebenarnya sering merasa takut gagal, terlalu teliti, dan mudah panik di bawah tekanan—ia mendambakan kebebasan menentukan jalannya sendiri.',
    role: 'Analis Sistem Digital & Dekriptor Algoritma',
    abilityName: 'Data Hacking',
    abilityDesc: 'Mengakses terminal keamanan kota, meretas firewall biner, mendekripsi paket log heksadesimal, dan menata ulang sistem penyiaran.',
    dutySummary: 'Peretas firewall, pemulih kios digital, & analis log algoritma',
    whenToUse: 'Wajib tugaskan Ilyas [2] pada konsol digital, kios penyiaran, firewall biner, dan dekripsi log (salah pilih karakter berujung Game Over).',
    specificTasks: [
      'Bab 3 (Sanggar Darmoyudho): Memperbaiki parameter Kios Jadwal Digital agar acara lokal kembali tayang sejajar di layar kota (C3B).',
      'Bab 4 (Terminal Server): Meretas Gerbang Keamanan dengan menyamakan Checksum Biner 3 baris.',
      'Bab 4 (Terminal Server): Mendekripsi 3 paket log heksadesimal dan mengurai pola filter bubble (C5).',
    ],
    portraitUrl: ASSETS.portraitIlyas,
    accentHex: '#38bdf8',
  },
  {
    id: 'dira',
    fullName: 'Adira Widhiyani',
    nickname: 'Dira',
    birthInfo: 'Neo-Metropolis / Jakarta',
    zodiac: '—',
    mbti: '—',
    height: '165 cm',
    schoolClass: 'XI IPS-1',
    appearance: [
      'Rambut bob bergelombang biru-ungu gelap dengan cepol messy bun di atas',
      'Kemeja batik biru langit bermotif cendrawasih emas & flora',
      'Rok sekolah putih selutut & sepatu gelap',
    ],
    personality:
      'Supel, bebas, bijaksana, dan berpikiran kritis terhadap ketimpangan sosial. Selalu tenang saat situasi genting dan menjadi penengah antara Nino yang blak-blakan dengan Ilyas yang mudah cemas.',
    role: 'Negosiator Sosial & Pendengar Empatik Warga',
    abilityName: 'Social Empathy',
    abilityDesc: 'Membaca emosi warga, membuka hati NPC yang defensif atau kecewa, serta merumuskan solusi sosial yang manusiawi.',
    dutySummary: 'Pendekatan empatik, membujuk NPC defensif, & mediasi forum warga',
    whenToUse: 'Wajib tugaskan Dira [3] saat berhadapan dengan warga atau seniman yang tertutup, cemas, atau ragu bekerja sama.',
    specificTasks: [
      'Bab 2 (Sandang Ayu Plaza): Menggunakan pendekatan Social Empathy 2 tahap untuk membujuk Raka membuka cerita tekanan FOMO (C1 & C1B).',
      'Bab 3 (Sanggar Darmoyudho): Meyakinkan Pak Wiryo agar mau membuka kembali sanggar gamelan (salah pilih karakter memicu Game Over, membuka C3).',
      'Bab 5 (Podium Warga): Menengahi diskusi penentuan kebijakan sosial Neo-Metropolis yang adil dan adaptif.',
    ],
    portraitUrl: ASSETS.portraitDira,
    accentHex: '#fb7185',
  },
];

export const QUEST_INFO: Record<QuestId, { number: string; title: string; objective: string; areaHint: string }> = {
  Q1: {
    number: 'Kunci 0/4 · Pelabuhan',
    title: 'Jejak Sinyal di Warung & Halte',
    objective: 'Temui Mba Sari, sambungkan kabel halte, lalu jawab uji materi Bang Dani untuk meraih Kunci Gerbang Plaza.',
    areaHint: 'Pelabuhan',
  },
  Q2: {
    number: 'Kunci 1/4 · Sandang Ayu Plaza',
    title: 'Jebakan FOMO & Layar Plaza',
    objective: 'Temui Raka, stabilkan sinyal pemindai Plaza, lalu jawab uji materi Bu Maya untuk meraih Kunci Sanggar Darmoyudho.',
    areaHint: 'Sandang Ayu Plaza',
  },
  Q3: {
    number: 'Kunci 2/4 · Sanggar Darmoyudho',
    title: 'Sanggar Sunyi & Kunci Terminal',
    objective: 'Temui Pak Wiryo, mainkan ritme gamelan, jawab Teh Rani, lalu temukan Kunci Terminal Server.',
    areaHint: 'Sanggar Darmoyudho',
  },
  Q4: {
    number: 'Kunci 3/4 · Terminal Server Kota',
    title: 'Menembus Ruang Gema Algoritma',
    objective: 'Tembus firewall, simak Mas Ilham, kalibrasi gelombang inti server, lalu hadapi uji akhir Pak Arga.',
    areaHint: 'Terminal Server',
  },
  Q5: {
    number: 'Kolaborasi Akhir · Harmoni Kota',
    title: 'Misi Bersama Tiga Karakter',
    objective: 'Nino, Ilyas, dan Dira berkolaborasi memulihkan inti kota untuk membuka Kunci Master Portal Pulang.',
    areaHint: 'Terminal Server',
  },
  COMPLETED: {
    number: '4/4 Kunci Terkumpul',
    title: 'Portal Pulang Siap Dimasuki',
    objective: 'Masuki Portal Pulang [E] di sisi kanan Terminal Server Kota untuk pulang ke dunia asal!',
    areaHint: 'Terminal Server',
  },
};

export const SCENE_REWARDS: Record<SceneReward['id'], SceneReward> = {
  reward_village: {
    id: 'reward_village',
    sceneName: 'Pelabuhan & Warung Mba Sari',
    keyName: 'Kunci Gerbang Plaza',
    unlocksScene: 'Sandang Ayu Plaza',
    badgeName: 'Penjaga Kohesi Pelabuhan',
    itemReward: 'Bekal Teh Jahe & Kunci Gerbang Plaza',
    description:
      'Mba Sari dan Bang Dani menyerahkan Kunci Gerbang Plaza agar timmu bisa menelusuri jejak sinyal di pusat kota.',
    accentHex: '#10b981',
  },
  reward_plaza: {
    id: 'reward_plaza',
    sceneName: 'Sandang Ayu Plaza',
    keyName: 'Kunci Sanggar Darmoyudho',
    unlocksScene: 'Sanggar Darmoyudho',
    badgeName: 'Penjaga Ruang Publik Plaza',
    itemReward: 'Pin Literasi Digital & Kunci Sanggar Darmoyudho',
    description:
      'Bu Maya dan Raka memercayakan Kunci Sanggar Darmoyudho untuk melacak jalur siaran sanggar seni yang diblokir.',
    accentHex: '#38bdf8',
  },
  reward_stage: {
    id: 'reward_stage',
    sceneName: 'Sanggar Darmoyudho',
    keyName: 'Kunci Terminal Server',
    unlocksScene: 'Terminal Server Kota',
    badgeName: 'Pelestari Akulturasi Budaya',
    itemReward: 'Kartu Akses & Kunci Terminal Server',
    description:
      'Sanggar Darmoyudho kembali hidup dengan harmoni gamelan; Kartu Akses dari kotak suara membuka akses ke Terminal Server Kota.',
    accentHex: '#f59e0b',
  },
  reward_terminal: {
    id: 'reward_terminal',
    sceneName: 'Kolaborasi Akhir Terminal Server',
    keyName: 'Kunci Master Portal Pulang',
    unlocksScene: 'Portal Dimensi Pulang',
    badgeName: 'Duta Globalisasi Adaptif',
    itemReward: 'Kunci Master Portal & Piagam Harmoni',
    description:
      'Kolaborasi Nino, Ilyas, dan Dira menstabilkan server kota, mengubah langit menjadi keemasan dan membuka Portal Pulang.',
    accentHex: '#fbbf24',
  },
  reward_metropolis: {
    id: 'reward_metropolis',
    sceneName: 'Harmoni Neo-Metropolis',
    keyName: 'Kunci Master Portal Pulang',
    unlocksScene: 'Portal Dimensi Pulang',
    badgeName: 'Duta Globalisasi Adaptif',
    itemReward: 'Kunci Master Portal & Piagam Harmoni',
    description:
      'Kolaborasi Nino, Ilyas, dan Dira memulihkan Neo-Metropolis menjadi kota modern yang seimbang dan menjaga budaya lokal.',
    accentHex: '#fbbf24',
  },
};

export const SCENE_REWARD_LIST: SceneReward[] = [
  SCENE_REWARDS.reward_village,
  SCENE_REWARDS.reward_plaza,
  SCENE_REWARDS.reward_stage,
  SCENE_REWARDS.reward_terminal,
];

export interface ChapterTaskMeta {
  id: string;
  label: string;
  assignee: 'Nino' | 'Ilyas' | 'Dira' | 'Tim';
  flagKey?: string;
  boardId?: string;
  fieldKey?: 'stageActivityDone' | 'algoPuzzleDone' | 'cityChoiceMade' | 'evaluationCompleted';
}

export interface StoryChapterMeta {
  questId: QuestId;
  chapter: string;
  title: string;
  location: string;
  sociologyTopic: string;
  summary: string;
  tasks: ChapterTaskMeta[];
}

export const STORY_CHAPTERS: StoryChapterMeta[] = [
  {
    questId: 'Q1',
    chapter: 'Wilayah 1',
    title: 'Jejak Sinyal di Warung & Halte',
    location: 'Pelabuhan (Kunci 1/4)',
    sociologyTopic: 'Globalisasi (Anthony Giddens) & Interaksi Sosial Primer',
    summary: 'Mba Sari menjelaskan pergeseran interaksi primer akibat globalisasi; setelah menyambung kabel halte, Bang Dani menguji materi untuk memberikan Kunci Gerbang Plaza, lalu selesaikan tantangan penyeberangan perbatasan.',
    tasks: [
      { id: 't1_1', label: 'Berkenalan dengan Dira & Ilyas & tetapkan tujuan mengumpulkan 4 kunci portal pulang', assignee: 'Tim', flagKey: 'met_friends' },
      { id: 't1_2', label: 'Orang 1 (Mba Sari): Simak materi sosiologi globalisasi & interaksi primer', assignee: 'Tim', flagKey: 'outskirts_mat_done' },
      { id: 't1_3', label: 'Mini-Game 1: Sambungkan kabel warna-warni Lampion Halte Neo-Bus', assignee: 'Tim', flagKey: 'outskirts_game_done' },
      { id: 't1_4', label: 'Orang 2 (Bang Dani): Jawab uji materi & raih Kunci Gerbang Plaza', assignee: 'Tim', flagKey: 'outskirts_quiz_done' },
      { id: 't1_5', label: 'Side Quest Perbatasan: Atur rambu rute & sinyal penyeberangan menuju Plaza', assignee: 'Tim', flagKey: 'sq_outskirts_done' },
    ],
  },
  {
    questId: 'Q2',
    chapter: 'Wilayah 2',
    title: 'Jebakan FOMO & Layar Plaza',
    location: 'Sandang Ayu Plaza (Kunci 2/4)',
    sociologyTopic: 'FOMO, Konformitas Digital, & Kedekatan Semu',
    summary: 'Dengan Kunci Gerbang Plaza, dekati Raka untuk mempelajari dampak FOMO, selesaikan pemindai sinyal interaktif, jawab pertanyaan Bu Maya demi Kunci Sanggar Darmoyudho, dan kalibrasi antena perbatasan.',
    tasks: [
      { id: 't2_1', label: 'Orang 1 (Raka): Tugaskan anggota tim yang tepat & simak materi FOMO serta kedekatan semu', assignee: 'Dira', flagKey: 'talked_raka' },
      { id: 't2_2', label: 'Mini-Game 2: Tangkap energi sinyal & basmi glitch pemindai Plaza', assignee: 'Tim', flagKey: 'plaza_game_done' },
      { id: 't2_3', label: 'Orang 2 (Bu Maya): Jawab pertanyaan materi & raih Kunci Sanggar Darmoyudho', assignee: 'Tim', flagKey: 'plaza_quiz_done' },
      { id: 't2_4', label: 'Side Quest Perbatasan: Kalibrasi 3 antena undangan menuju Sanggar Darmoyudho', assignee: 'Tim', flagKey: 'sq_plaza_done' },
    ],
  },
  {
    questId: 'Q3',
    chapter: 'Wilayah 3',
    title: 'Sanggar Sunyi & Kunci Terminal',
    location: 'Sanggar Darmoyudho (Kunci 3/4)',
    sociologyTopic: 'Homogenisasi Budaya vs Akulturasi Kreatif & Sikap Selektif-Adaptif',
    summary: 'Yakinkan Pak Wiryo untuk mempelajari materi akulturasi kreatif, nyalakan ritme gamelan, jawab uji materi Teh Rani, temukan Kunci Terminal Server, lalu sinkronkan tuas jembatan.',
    tasks: [
      { id: 't3_1', label: 'Orang 1 (Pak Wiryo): Tugaskan karakter yang tepat & pelajari homogenisasi vs akulturasi', assignee: 'Dira', flagKey: 'talked_wiryo' },
      { id: 't3_2', label: 'Mini-Game 3: Mainkan ketukan ritme gamelan 3 jalur hingga sanggar menyala', assignee: 'Tim', fieldKey: 'stageActivityDone' },
      { id: 't3_3', label: 'Orang 2 (Teh Rani): Jawab materi Pak Wiryo & ketahui lokasi kunci di ujung sanggar', assignee: 'Tim', flagKey: 'stage_quiz_done' },
      { id: 't3_4', label: 'Kotak Panel Suara: Tugaskan karakter yang tepat untuk meraih Kunci Terminal Server', assignee: 'Nino', flagKey: 'has_access_card' },
      { id: 't3_5', label: 'Side Quest Perbatasan: Sinkronkan 3 tuas keamanan jembatan ke Terminal Server', assignee: 'Tim', flagKey: 'sq_stage_done' },
    ],
  },
  {
    questId: 'Q4',
    chapter: 'Wilayah 4',
    title: 'Di Balik Ruang Gema Server Kota',
    location: 'Terminal Server Kota (Kunci 4/4)',
    sociologyTopic: 'Filter Bubble (Ruang Gema), Bias Algoritma, & Literasi Digital Kritis',
    summary: 'Tembus gerbang firewall, simak Mas Ilham tentang ruang gema, kalibrasi frekuensi gelombang inti server secara interaktif, dan hadapi uji materi Pak Arga.',
    tasks: [
      { id: 't4_1', label: 'Gerbang Firewall: Tugaskan karakter yang tepat untuk menembus pengaman biner', assignee: 'Ilyas', flagKey: 'terminal_hacked' },
      { id: 't4_2', label: 'Orang 1 (Mas Ilham): Simak materi ruang gema, bias algoritma, & literasi digital', assignee: 'Tim', flagKey: 'terminal_mat_done' },
      { id: 't4_3', label: 'Mini-Game 4: Kalibrasi frekuensi & amplitudo gelombang Inti Server', assignee: 'Tim', fieldKey: 'algoPuzzleDone' },
      { id: 't4_4', label: 'Orang 2 (Pak Arga): Jawab materi Mas Ilham untuk memulai Kolaborasi Akhir Tim', assignee: 'Tim', flagKey: 'terminal_quiz_done' },
    ],
  },
  {
    questId: 'Q5',
    chapter: 'Penutup',
    title: 'Kolaborasi Akhir Tiga Karakter',
    location: 'Inti Server Neo-Metropolis',
    sociologyTopic: 'Sinergi Curiosity Trigger, Data Hacking, & Social Empathy',
    summary: 'Nino membongkar kunci fisik server, Ilyas menyeimbangkan algoritma kota, dan Dira memandu konsensus warga untuk meraih Kunci Master Portal Pulang.',
    tasks: [
      { id: 't5_1', label: 'Kolaborasi 3 Karakter (Nino · Ilyas · Dira) memulihkan Neo-Metropolis & meraih Kunci Master Portal', assignee: 'Tim', fieldKey: 'cityChoiceMade' },
    ],
  },
];

export interface QuestStepProgress {
  stepLabel: string;
  instruction: string;
  sociologyConcept: string;
}

export function getQuestStepProgress(save: {
  questId: QuestId;
  flags: Record<string, boolean>;
  solvedBoards: string[];
  stageActivityDone: boolean;
  algoPuzzleDone: boolean;
  cityChoiceMade: 'A' | 'B' | 'C' | null;
  evaluationCompleted: boolean;
}): QuestStepProgress {
  switch (save.questId) {
    case 'Q1':
      if (!save.flags.met_friends) {
        return {
          stepLabel: 'Awal Misi · 0/4 Kunci',
          instruction: 'Temui Dira & Ilyas di dekat portal untuk memulai misi 4 kunci.',
          sociologyConcept: 'Misi: Kumpulkan 4 Kunci Portal',
        };
      }
      if (!save.flags.outskirts_mat_done) {
        return {
          stepLabel: 'Tahap 1/3 · Materi',
          instruction: 'Bicara dengan Orang Pertama: Mba Sari di Warung Lokal [E].',
          sociologyConcept: 'Globalisasi & Interaksi Primer',
        };
      }
      if (!save.flags.outskirts_game_done) {
        return {
          stepLabel: 'Tahap 2/3 · Mini-Game',
          instruction: 'Sambungkan Kabel Lampion Halte [E] untuk menyalakan lampu halte.',
          sociologyConcept: 'Misi Teknis Halte',
        };
      }
      if (!save.flags.outskirts_quiz_done) {
        return {
          stepLabel: 'Tahap 3/3 · Uji Kunci 1',
          instruction: 'Temui Bang Dani [E] & jawab materi Mba Sari untuk Kunci Gerbang Plaza.',
          sociologyConcept: 'Uji Pemahaman Wilayah 1',
        };
      }
      return {
        stepLabel: 'Kunci 1/4 Dimiliki',
        instruction: save.flags.sq_outskirts_done
          ? 'Lanjut ke kanan menuju Sandang Ayu Plaza!'
          : 'Menuju pintu kanan untuk Side Quest Perbatasan ke Plaza!',
        sociologyConcept: 'Tantangan Perbatasan Plaza',
      };

    case 'Q2':
      if (!save.flags.sq_outskirts_done) {
        return {
          stepLabel: 'Side Quest · Perbatasan',
          instruction: 'Selesaikan tantangan pintu kanan Pelabuhan untuk masuk ke Plaza.',
          sociologyConcept: 'Tantangan Perbatasan Plaza',
        };
      }
      if (!save.flags.talked_raka) {
        return {
          stepLabel: 'Tahap 1/3 · Materi',
          instruction: 'Temui Orang Pertama: Raka [E] di Plaza (pilih anggota tim yang tepat!).',
          sociologyConcept: 'FOMO & Konformitas Digital',
        };
      }
      if (!save.flags.plaza_game_done) {
        return {
          stepLabel: 'Tahap 2/3 · Mini-Game',
          instruction: 'Mainkan Konsol Pemindai Sinyal [E] di tengah Plaza.',
          sociologyConcept: 'Stabilisator Sinyal Plaza',
        };
      }
      if (!save.flags.plaza_quiz_done) {
        return {
          stepLabel: 'Tahap 3/3 · Uji Kunci 2',
          instruction: 'Temui Bu Maya [E] di sisi kanan Plaza untuk meraih Kunci Sanggar Darmoyudho.',
          sociologyConcept: 'Uji Pemahaman Wilayah 2',
        };
      }
      return {
        stepLabel: 'Kunci 2/4 Dimiliki',
        instruction: save.flags.sq_plaza_done
          ? 'Masuk ke Sanggar Darmoyudho di kanan Plaza!'
          : 'Menuju pintu kanan Plaza untuk Side Quest Kalibrasi Antena!',
        sociologyConcept: 'Tantangan Perbatasan Sanggar',
      };

    case 'Q3':
      if (!save.flags.sq_plaza_done) {
        return {
          stepLabel: 'Side Quest · Perbatasan',
          instruction: 'Selesaikan kalibrasi antena di pintu kanan Plaza untuk menuju Sanggar Darmoyudho.',
          sociologyConcept: 'Tantangan Perbatasan Sanggar',
        };
      }
      if (!save.flags.talked_wiryo) {
        return {
          stepLabel: 'Tahap 1/3 · Materi',
          instruction: 'Temui Orang Pertama: Pak Wiryo [E] (pilih anggota tim yang tepat!).',
          sociologyConcept: 'Homogenisasi vs Akulturasi',
        };
      }
      if (!save.stageActivityDone) {
        return {
          stepLabel: 'Tahap 2/3 · Mini-Game',
          instruction: 'Mainkan perangkat Gamelan & Angklung [E] di Sanggar Darmoyudho.',
          sociologyConcept: 'Harmoni Ritme Sanggar',
        };
      }
      if (!save.flags.stage_quiz_done) {
        return {
          stepLabel: 'Tahap 3/3 · Uji Materi',
          instruction: 'Temui Orang Kedua: Teh Rani [E] & jawab materi dari Pak Wiryo.',
          sociologyConcept: 'Uji Pemahaman Wilayah 3',
        };
      }
      if (!save.flags.has_access_card) {
        return {
          stepLabel: 'Cari Kunci Terminal',
          instruction: 'Periksa Kotak Panel Tata Suara [E] di ujung kanan (pilih anggota tim yang tepat!).',
          sociologyConcept: 'Kunci 3/4 · Terminal Server',
        };
      }
      return {
        stepLabel: 'Kunci 3/4 Dimiliki',
        instruction: save.flags.sq_stage_done
          ? 'Masuk ke Terminal Server Kota di kanan!'
          : 'Menuju pintu kanan Sanggar untuk Side Quest Gembok Jembatan!',
        sociologyConcept: 'Tantangan Perbatasan Server',
      };

    case 'Q4':
      if (!save.flags.sq_stage_done) {
        return {
          stepLabel: 'Side Quest · Perbatasan',
          instruction: 'Selesaikan Side Quest di pintu kanan Sanggar Darmoyudho untuk memasuki Terminal Server.',
          sociologyConcept: 'Tantangan Perbatasan Server',
        };
      }
      if (!save.flags.terminal_hacked) {
        return {
          stepLabel: 'Akses Terminal',
          instruction: 'Hadapi Gerbang Firewall [E] (tugaskan anggota tim yang menguasai sistem digital!).',
          sociologyConcept: 'Penetrasi Keamanan Data',
        };
      }
      if (!save.flags.terminal_mat_done) {
        return {
          stepLabel: 'Tahap 1/3 · Materi',
          instruction: 'Temui Orang Pertama: Mas Ilham [E] untuk mempelajari rahasia Ruang Gema.',
          sociologyConcept: 'Filter Bubble & Bias Algoritma',
        };
      }
      if (!save.algoPuzzleDone) {
        return {
          stepLabel: 'Tahap 2/3 · Mini-Game',
          instruction: 'Akses Konsol Inti Server [E] untuk mengkalibrasi gelombang frekuensi.',
          sociologyConcept: 'Kalibrasi Inti Server',
        };
      }
      if (!save.flags.terminal_quiz_done) {
        return {
          stepLabel: 'Tahap 3/3 · Uji Akhir',
          instruction: 'Temui Pak Arga [E] di kanan terminal & jawab materi Mas Ilham.',
          sociologyConcept: 'Uji Pemahaman Wilayah 4',
        };
      }
      return {
        stepLabel: 'Kolaborasi Akhir',
        instruction: 'Temui Pak Arga [E] untuk memulai kolaborasi Nino, Ilyas, & Dira!',
        sociologyConcept: 'Kolaborasi Tiga Karakter',
      };

    case 'Q5':
      return {
        stepLabel: 'Kolaborasi Akhir Tim',
        instruction: 'Temui Pak Arga [E] untuk menyelesaikan kolaborasi 3 karakter & membuka Kunci Master Portal.',
        sociologyConcept: 'Sikap Selektif-Adaptif & Sinergi Tim',
      };

    case 'COMPLETED':
      return {
        stepLabel: '4/4 Kunci Terkumpul',
        instruction: 'Masuki Portal Pulang [E] di kanan Terminal Server Kota untuk pulang ke dunia asal!',
        sociologyConcept: 'Harmoni Budaya & Teknologi',
      };
  }
}

export const AREAS: Record<AreaId, AreaDefinition> = {
  outskirts: {
    id: 'outskirts',
    name: 'Pelabuhan & Warung Lokal',
    subtitle: 'Kawasan dermaga Neo-Metropolis — tempat hilangnya jejak sinyal warga',
    backgroundUrl: ASSETS.bgOutskirts,
    worldWidth: 2100,
    groundColor: '#1e293b',
    accentColor: '#38bdf8',
    rightExit: {
      targetArea: 'plaza',
      spawnX: 170,
      label: 'Ke Sandang Ayu Plaza',
      requiredFlag: 'outskirts_quiz_done',
      lockedMessage:
        'Gerbang terkunci! Kamu belum memiliki Kunci Gerbang Plaza. Selesaikan misi Pelabuhan (Mba Sari -> Kabel Halte -> Bang Dani) terlebih dahulu.',
    },
    platforms: [
      { id: 'plat_warung_bench', x: 520, y: 74, width: 170, height: 18, label: 'Bangku Dermaga' },
      { id: 'plat_crate_1', x: 1120, y: 68, width: 130, height: 18 },
      { id: 'plat_bus_stop', x: 1510, y: 92, width: 210, height: 20, label: 'Halte Neo-Bus' },
    ],
  },
  plaza: {
    id: 'plaza',
    name: 'Sandang Ayu Plaza',
    subtitle: 'Pusat layar hologram & sinyal yang menyedot perhatian remaja kota',
    backgroundUrl: ASSETS.bgPlaza,
    worldWidth: 2200,
    groundColor: '#1e2436',
    accentColor: '#22d3ee',
    leftExit: {
      targetArea: 'outskirts',
      spawnX: 1910,
      label: 'Ke Pelabuhan',
    },
    rightExit: {
      targetArea: 'stage',
      spawnX: 165,
      label: 'Ke Sanggar Darmoyudho',
      requiredFlag: 'plaza_quiz_done',
      lockedMessage:
        'Gerbang terkunci! Kamu membutuhkan Kunci Sanggar Darmoyudho dari Bu Maya setelah menyelesaikan materi Raka dan Pemindai Sinyal.',
    },
    platforms: [
      { id: 'plat_plaza_step1', x: 430, y: 64, width: 200, height: 18 },
      { id: 'plat_plaza_fountain', x: 1000, y: 88, width: 240, height: 20, label: 'Pelataran Air Mancur' },
      { id: 'plat_plaza_step2', x: 1580, y: 68, width: 180, height: 18 },
    ],
  },
  stage: {
    id: 'stage',
    name: 'Sanggar Darmoyudho',
    subtitle: 'Sanggar kesenian tradisional yang salurannya diblokir dari layar informasi kota',
    backgroundUrl: ASSETS.bgStage,
    worldWidth: 2150,
    groundColor: '#192231',
    accentColor: '#f59e0b',
    leftExit: {
      targetArea: 'plaza',
      spawnX: 2010,
      label: 'Ke Sandang Ayu Plaza',
    },
    rightExit: {
      targetArea: 'terminal',
      spawnX: 170,
      label: 'Ke Terminal Server Kota',
      requiredFlag: 'has_access_card',
      lockedMessage:
        'Pintu terkunci! Kamu belum memiliki Kunci Terminal Server. Selesaikan gamelan, uji materi Teh Rani, lalu periksa Kotak Panel Suara di kanan.',
    },
    platforms: [
      { id: 'plat_pendopo', x: 790, y: 78, width: 380, height: 22, label: 'Lantai Sanggar' },
      { id: 'plat_bridge', x: 1360, y: 64, width: 220, height: 18, label: 'Jembatan Taman' },
    ],
  },
  terminal: {
    id: 'terminal',
    name: 'Terminal Server Kota',
    subtitle: 'Sumber utama sistem rekomendasi dan segel keempat Portal Pulang',
    backgroundUrl: ASSETS.bgTerminal,
    worldWidth: 2140,
    groundColor: '#0f172a',
    accentColor: '#06b6d4',
    leftExit: {
      targetArea: 'stage',
      spawnX: 1960,
      label: 'Ke Sanggar Darmoyudho',
    },
    platforms: [
      { id: 'plat_deck_left', x: 350, y: 72, width: 220, height: 18 },
      { id: 'plat_deck_core', x: 1020, y: 84, width: 340, height: 20, label: 'Platform Inti Server' },
    ],
  },
};

export const INTERACTABLES: InteractableObject[] = [
  // WILAYAH 1: OUTSKIRTS (Orang 1 Sari -> Mini-Game Kabel -> Orang 2 Bang Dani)
  {
    id: 'obj_portal',
    areaId: 'outskirts',
    x: 190,
    width: 120,
    label: 'Portal Dimensi',
    type: 'portal',
    promptText: 'Periksa Portal Dimensi',
  },
  {
    id: 'obj_meet_friends',
    areaId: 'outskirts',
    x: 395,
    width: 150,
    label: 'Dira & Ilyas',
    type: 'npc',
    characterId: 'dira',
    hiddenIfFlag: 'met_friends',
    promptText: 'Berkenalan dengan Dira & Ilyas',
  },
  {
    id: 'obj_warung_sari',
    areaId: 'outskirts',
    x: 740,
    width: 140,
    label: 'Mba Sari (Materi 1)',
    type: 'npc',
    characterId: 'sari',
    promptText: 'Bicara dengan Mba Sari',
  },
  {
    id: 'obj_minigame_outskirts',
    areaId: 'outskirts',
    x: 1180,
    width: 140,
    label: 'Papan Kabel Halte',
    type: 'terminal',
    promptText: 'Sambungkan Kabel Lampion Halte',
  },
  {
    id: 'obj_dani',
    areaId: 'outskirts',
    x: 1620,
    width: 130,
    label: 'Bang Dani (Uji Materi 1)',
    type: 'npc',
    characterId: 'dani',
    promptText: 'Bicara dengan Bang Dani',
  },

  // WILAYAH 2: PLAZA (Orang 1 Raka [Blind Dispatch] -> Mini-Game Sinyal -> Orang 2 Bu Maya)
  {
    id: 'obj_raka',
    areaId: 'plaza',
    x: 560,
    width: 120,
    label: 'Raka (Materi 2)',
    type: 'npc',
    characterId: 'raka',
    promptText: 'Temui Raka',
  },
  {
    id: 'obj_minigame_plaza',
    areaId: 'plaza',
    x: 1080,
    width: 150,
    label: 'Konsol Pemindai Sinyal',
    type: 'terminal',
    promptText: 'Mainkan Pemindai Sinyal Plaza',
  },
  {
    id: 'obj_plaza_relay',
    areaId: 'plaza',
    x: 1320,
    width: 110,
    label: 'Panel Relay Plaza',
    type: 'terminal',
    promptText: 'Periksa Panel Relay Plaza',
  },
  {
    id: 'obj_maya',
    areaId: 'plaza',
    x: 1640,
    width: 130,
    label: 'Bu Maya (Uji Materi 2)',
    type: 'npc',
    characterId: 'maya',
    promptText: 'Bicara dengan Bu Maya',
  },
  {
    id: 'obj_plaza_forum',
    areaId: 'plaza',
    x: 1920,
    width: 140,
    label: 'Podium Diskusi Warga',
    type: 'terminal',
    minQuest: 'Q5',
    promptText: 'Buka Forum Masa Depan Kota',
  },

  // WILAYAH 3: STAGE (Orang 1 Pak Wiryo [Blind Dispatch] -> Mini-Game Gamelan -> Orang 2 Teh Rani -> Panel Suara [Blind Dispatch])
  {
    id: 'obj_pak_wiryo',
    areaId: 'stage',
    x: 560,
    width: 120,
    label: 'Pak Wiryo (Materi 3)',
    type: 'npc',
    characterId: 'wiryo',
    promptText: 'Temui Pak Wiryo',
  },
  {
    id: 'obj_gamelan',
    areaId: 'stage',
    x: 980,
    width: 165,
    label: 'Perangkat Gamelan',
    type: 'prop',
    promptText: 'Mainkan Ritme Gamelan',
  },
  {
    id: 'obj_rani',
    areaId: 'stage',
    x: 1460,
    width: 125,
    label: 'Teh Rani (Uji Materi 3)',
    type: 'npc',
    characterId: 'rani',
    promptText: 'Bicara dengan Teh Rani',
  },
  {
    id: 'obj_access_card_box',
    areaId: 'stage',
    x: 1780,
    width: 130,
    label: 'Kotak Panel Tata Suara',
    type: 'prop',
    promptText: 'Periksa Kotak Panel Suara',
  },

  // WILAYAH 4: TERMINAL (Firewall [Blind Dispatch] -> Orang 1 Mas Ilham -> Mini-Game Memori -> Orang 2 Pak Arga)
  {
    id: 'obj_security_gate',
    areaId: 'terminal',
    x: 420,
    width: 140,
    label: 'Gerbang Firewall',
    type: 'terminal',
    hiddenIfFlag: 'terminal_hacked',
    promptText: 'Periksa Gerbang Firewall',
  },
  {
    id: 'obj_ilham',
    areaId: 'terminal',
    x: 780,
    width: 130,
    label: 'Mas Ilham (Materi 4)',
    type: 'npc',
    characterId: 'ilham',
    promptText: 'Bicara dengan Mas Ilham',
  },
  {
    id: 'obj_algo_console',
    areaId: 'terminal',
    x: 1150,
    width: 160,
    label: 'Konsol Inti Server',
    type: 'terminal',
    promptText: 'Kalibrasi Gelombang Inti Server',
  },
  {
    id: 'obj_arga',
    areaId: 'terminal',
    x: 1580,
    width: 135,
    label: 'Pak Arga (Uji Akhir)',
    type: 'npc',
    characterId: 'arga',
    promptText: 'Temui Pak Arga',
  },
  {
    id: 'obj_terminal_portal',
    areaId: 'terminal',
    x: 1910,
    width: 130,
    label: 'Portal Pulang Terminal',
    type: 'portal',
    promptText: 'Masuki Portal Pulang',
  },
];

export const CLUES: Record<string, Clue> = {
  C0: {
    id: 'C0',
    code: 'Petunjuk Tambahan A',
    title: 'Warung Lokal sebagai Ruang Interaksi Langsung',
    summary:
      'Menurut Mba Sari, warung di dekat pelabuhan dulunya menjadi tempat warga saling menyapa dan bertukar cerita. Pergeseran ke transaksi layar membuat ruang interaksi tatap muka ikut menyusut.',
    sociologyConcept: 'Perubahan Sosial & Ruang Interaksi Primer',
    source: 'Percakapan dengan Mba Sari — Pelabuhan',
    questId: 'Q1',
  },
  C1: {
    id: 'C1',
    code: 'Petunjuk 01',
    title: 'Kedekatan Semu dengan Selebritas Asing',
    summary:
      'Raka hafal jadwal harian selebritas luar negeri dari siaran hologram, tetapi tidak tahu kabar teman sebangkunya sendiri.',
    sociologyConcept: 'Perubahan Pola Interaksi Sosial',
    source: 'Percakapan dengan Raka — Sandang Ayu Plaza',
    questId: 'Q2',
  },
  C1B: {
    id: 'C1B',
    code: 'Petunjuk Tambahan B',
    title: 'Ketakutan Tertinggal Tren (FOMO) & Autoplay',
    summary:
      'Raka mengaku takut dianggap ketinggalan zaman jika tidak mengikuti siaran hologram yang terus memutar konten serupa tanpa jeda.',
    sociologyConcept: 'Tekanan Konformitas Digital & Budaya Populer',
    source: 'Pendalaman Dialog Raka — Sandang Ayu Plaza',
    questId: 'Q2',
  },
  C2: {
    id: 'C2',
    code: 'Petunjuk 02',
    title: 'Ruang Publik yang Ramai Namun Sunyi',
    summary:
      'Puluhan warga duduk berdekatan di kursi plaza, namun nyaris tidak ada obrolan tatap muka karena masing-masing larut dalam feed digital.',
    sociologyConcept: 'Dampak Teknologi Komunikasi terhadap Kontak Sosial',
    source: 'Observasi Kursi & Layar Sandang Ayu Plaza',
    questId: 'Q2',
  },
  C2B: {
    id: 'C2B',
    code: 'Petunjuk Lapangan Relay',
    title: 'Manipulasi Slot Layar Publik',
    summary:
      'Inspeksi Nino pada panel relay plaza membuktikan adanya modul penyaring tag acara lokal dan loop autoplay tanpa jeda yang menggeser perhatian warga.',
    sociologyConcept: 'Kurasi Informasi & Ruang Publik Digital',
    source: 'Panel Relay Tersembunyi — Sandang Ayu Plaza',
    questId: 'Q2',
  },
  C3: {
    id: 'C3',
    code: 'Petunjuk 03',
    title: 'Kelesuan Sanggar Darmoyudho',
    summary:
      'Sanggar Darmoyudho sepi bukan semata karena budaya asing hadir, melainkan karena kurangnya promosi digital kreatif, minim regenerasi, dan tidak adanya ruang adaptasi bagi anak muda.',
    sociologyConcept: 'Homogenisasi Budaya & Pelestarian Budaya Lokal',
    source: 'Wawancara Pak Wiryo — Sanggar Darmoyudho',
    questId: 'Q3',
  },
  C3B: {
    id: 'C3B',
    code: 'Petunjuk Kios Digital',
    title: 'Restorasi Jadwal Kolaborasi Sanggar',
    summary:
      'Setelah Ilyas memperbaiki kios penyiaran digital, jadwal pentas gamelan dan kolaborasi musik anak muda di Sanggar Darmoyudho kembali muncul sejajar dengan konten global di layar kota.',
    sociologyConcept: 'Akulturasi Kreatif & Demokratisasi Media',
    source: 'Kios Jadwal Digital — Sanggar Darmoyudho',
    questId: 'Q3',
  },
  C4: {
    id: 'C4',
    code: 'Petunjuk 04',
    title: 'Kartu Akses Sistem Informasi Kota',
    summary:
      'Kartu akses milik teknisi festival terdahulu yang menghubungkan penjadwalan ruang publik dengan server algoritma utama kota.',
    sociologyConcept: 'Infrastruktur Informasi Kota',
    source: 'Panel Tata Suara Panggung',
    questId: 'Q3',
  },
  C4B: {
    id: 'C4B',
    code: 'Petunjuk Tambahan C',
    title: 'Catatan Prioritas Penyiaran Firewall',
    summary:
      'Dari dekripsi tenang Ilyas, terlihat bahwa modul penyiaran kota otomatis menurunkan prioritas konten acara lokal yang tidak memiliki lonjakan klik instan.',
    sociologyConcept: 'Bias Visibilitas Algoritma Media',
    source: 'Dekripsi Gerbang Keamanan — Terminal Server',
    questId: 'Q4',
  },
  C4C: {
    id: 'C4C',
    code: 'Petunjuk Arsip Kota',
    title: 'Sejarah Gotong Royong Sebelum Algoritma Baru',
    summary:
      'Nino menemukan cetak biru lama yang mencatat bahwa sebelum sistem penyiaran otomatis diaktifkan, warga rutin berkumpul di warung dan pendopo tiap akhir pekan.',
    sociologyConcept: 'Perubahan Sosial & Kohesi Komunitas',
    source: 'Rak Arsip Kabel Tua — Terminal Server',
    questId: 'Q4',
  },
  C5: {
    id: 'C5',
    code: 'Petunjuk 05',
    title: 'Gema Berulang Sistem Rekomendasi',
    summary:
      'Algoritma kota terus mendorong konten yang mirip dengan riwayat klik sebelumnya sehingga membentuk ruang gema, meski pengguna sebenarnya tetap memiliki kebebasan memilih.',
    sociologyConcept: 'Globalisasi Informasi & Literasi Digital',
    source: 'Konsol Log Rekomendasi — Terminal Server',
    questId: 'Q4',
  },
};

export const INVESTIGATION_BOARDS: Record<'board1' | 'board2', InvestigationSynthesis> = {
  board1: {
    id: 'board1',
    title: 'Analisis Awal: Pola Interaksi di Sandang Ayu Plaza',
    prompt:
      'Hubungkan Petunjuk 01 (Raka) dan Petunjuk 02 (Suasana Plaza) untuk merumuskan gejala awal The Global Wave Syndrome.',
    requiredClueIds: ['C1', 'C2'],
    rewardFlag: 'board1_solved',
    nextQuest: 'Q3',
    options: [
      {
        id: 'b1_opt1',
        text: 'Teknologi hologram merusak seluruh kemampuan bicara manusia secara permanen.',
        isCorrect: false,
        feedback:
          'Kurang tepat. Teknologi tidak merusak kemampuan bicara, melainkan mengalihkan perhatian dan mengurangi frekuensi interaksi tatap muka.',
      },
      {
        id: 'b1_opt2',
        text: 'Paparan arus informasi global yang terus-menerus menggeser interaksi sosial langsung menjadi kedekatan sepihak dengan konten digital.',
        isCorrect: true,
        feedback:
          'Tepat! Globalisasi informasi lewat perangkat digital membuat warga lebih terhubung ke tren jauh ketimbang lingkungan sosial terdekatnya.',
      },
      {
        id: 'b1_opt3',
        text: 'Budaya lokal harus dilarang agar warga mau duduk di bangku plaza.',
        isCorrect: false,
        feedback:
          'Tidak sesuai bukti. Permasalahannya ada pada pola konsumsi digital yang menggerus interaksi langsung, bukan keberadaan budaya lokal.',
      },
    ],
  },
  board2: {
    id: 'board2',
    title: 'Analisis Kasus Utama: Akar The Global Wave Syndrome',
    prompt:
      'Gabungkan seluruh temuan lapangan (C1, C2, C3, C5) untuk menyimpulkan penyebab utama krisis sosial-budaya di Neo-Metropolis.',
    requiredClueIds: ['C1', 'C2', 'C3', 'C5'],
    rewardFlag: 'board2_solved',
    nextQuest: 'Q5',
    options: [
      {
        id: 'b2_opt1',
        text: 'Kehadiran budaya asing adalah satu-satunya penyebab hancurnya tradisi lokal dan interaksi sosial.',
        isCorrect: false,
        feedback:
          'Belum tepat. Pak Wiryo dan data terminal menunjukkan budaya asing bukan penyebab tunggal—kurangnya ruang adaptasi lokal dan penggunaan teknologi tanpa literasi kritis juga berperan besar.',
      },
      {
        id: 'b2_opt2',
        text: 'Kombinasi algoritma rekomendasi yang menciptakan ruang gema, konsumsi tren global tanpa saringan kritis, serta kurangnya ruang kreatif dan promosi budaya lokal.',
        isCorrect: true,
        feedback:
          'Analisis sempurna! Krisis ini terjadi karena ketimpangan perhatian, algoritma yang mengulang tren serupa, minimnya literasi digital, dan kurangnya dukungan ruang bagi budaya lokal untuk beradaptasi.',
      },
      {
        id: 'b2_opt3',
        text: 'Algoritma mengendalikan pikiran manusia seratus persen sehingga individu tidak bisa membuat keputusan sendiri.',
        isCorrect: false,
        feedback:
          'Perhatikan lagi data terminal: algoritma memang memengaruhi paparan informasi, tetapi individu tetap memiliki kehendak dan kesadaran kritis untuk memilih.',
      },
    ],
  },
};

export const ALGORITHM_LOGS = [
  {
    user: 'Raka_XI',
    step: 'Interaksi Awal',
    action: 'Menonton 1 klip musik pop global berdurasi 15 detik',
    localRatio: '45% Lokal · 55% Global',
  },
  {
    user: 'Raka_XI',
    step: 'Penguatan Bobot Preferensi',
    action: 'Sistem menaikkan skor topik serupa sebesar +340% dan menurunkan unggahan seni pendopo',
    localRatio: '12% Lokal · 88% Global',
  },
  {
    user: 'Raka_XI',
    step: 'Ruang Gema (Filter Bubble)',
    action: 'Feed menampilkan 96% tren seragam; pengguna mengira seluruh kota hanya menyukai satu gaya hidup yang sama',
    localRatio: '4% Lokal · 96% Global',
  },
];

export const EVALUATION_QUESTIONS: EvaluationQuestion[] = [
  {
    id: 'eval_1',
    topic: 'Soal 1 (Bab 1 & 2) — Perubahan Interaksi Sosial',
    question:
      'Warga Neo-Metropolis tetap duduk berdekatan di bangku taman dan warung, namun nyaris tidak saling menyapa karena sibuk menatap layar hologram masing-masing. Dalam kajian sosiologi, fenomena ini menunjukkan...',
    options: [
      { key: 'A', text: 'Hilangnya seluruh kebutuhan manusia untuk berkomunikasi.' },
      { key: 'B', text: 'Pergeseran dari interaksi sosial tatap muka (primer) ke keterlibatan digital sepihak.' },
      { key: 'C', text: 'Berakhirnya seluruh bentuk kelompok sosial di masyarakat modern.' },
      { key: 'D', text: 'Peningkatan solidaritas mekanik di ruang publik perkotaan.' },
    ],
    correctKey: 'B',
    explanation:
      'Kemajuan teknologi komunikasi sering menggeser perhatian dari kontak sosial primer tatap muka menjadi konsumsi layar atau relasi digital sepihak, meski kedekatan fisik tetap ada.',
  },
  {
    id: 'eval_2',
    topic: 'Soal 2 (Bab 2) — Globalisasi (Anthony Giddens)',
    question:
      'Fenomena tren musik, gaya berpakaian, dan informasi dari berbagai negara yang dapat menyebar dengan cepat melalui media sosial menunjukkan proses globalisasi. Menurut Anthony Giddens, fenomena tersebut berkaitan dengan...',
    options: [
      { key: 'A', text: 'Penghapusan seluruh batas negara.' },
      { key: 'B', text: 'Intensifikasi hubungan sosial mendunia.' },
      { key: 'C', text: 'Hilangnya seluruh identitas budaya lokal.' },
      { key: 'D', text: 'Penurunan hubungan antarnegara.' },
    ],
    correctKey: 'B',
    explanation:
      'Globalisasi menurut Anthony Giddens berkaitan dengan semakin intensifnya hubungan sosial dalam skala dunia yang menghubungkan kejadian lokal dengan peristiwa di belahan dunia lain.',
  },
  {
    id: 'eval_3',
    topic: 'Soal 3 (Bab 3) — Homogenisasi Budaya',
    question:
      'Meningkatnya konsumsi produk, hiburan, dan gaya hidup populer yang serupa di berbagai negara dapat menyebabkan pola konsumsi masyarakat menjadi semakin seragam. Fenomena tersebut disebut...',
    options: [
      { key: 'A', text: 'Asimilasi sosial.' },
      { key: 'B', text: 'Diferensiasi sosial.' },
      { key: 'C', text: 'Homogenisasi budaya.' },
      { key: 'D', text: 'Mobilitas sosial.' },
    ],
    correctKey: 'C',
    explanation:
      'Homogenisasi budaya merupakan proses ketika unsur budaya yang beragam menjadi semakin seragam akibat penyebaran pengaruh budaya populer secara luas.',
  },
  {
    id: 'eval_4',
    topic: 'Soal 4 (Bab 3 & 5) — Sikap Terhadap Globalisasi & Akulturasi',
    question:
      'Seorang remaja menyukai musik dari luar negeri, tetapi tetap mempelajari musik tradisional dan mencoba menggabungkan keduanya dalam sebuah pertunjukan. Fenomena tersebut paling tepat menunjukkan...',
    options: [
      { key: 'A', text: 'Penolakan terhadap globalisasi.' },
      { key: 'B', text: 'Sikap selektif dan adaptif terhadap globalisasi.' },
      { key: 'C', text: 'Hilangnya identitas budaya.' },
      { key: 'D', text: 'Isolasi sosial.' },
    ],
    correctKey: 'B',
    explanation:
      'Masyarakat dapat menerima pengaruh global secara selektif sekaligus mempertahankan, memadukan (akulturasi kreatif), dan mengembangkan unsur budaya lokal.',
  },
  {
    id: 'eval_5',
    topic: 'Soal 5 (Bab 4) — Algoritma Ruang Gema & Literasi Digital',
    question:
      'Sistem rekomendasi digital cenderung menampilkan konten serupa secara berulang sehingga membentuk ruang gema (filter bubble). Sikap sosiologis yang paling tepat bagi pelajar dalam menghadapi fenomena tersebut adalah...',
    options: [
      { key: 'A', text: 'Mempercayai bahwa seluruh tren di beranda mencerminkan kehidupan nyata masyarakat.' },
      { key: 'B', text: 'Melarang penggunaan seluruh perangkat digital dalam kehidupan sehari-hari.' },
      { key: 'C', text: 'Mengembangkan literasi digital agar tetap sadar memilih informasi secara kritis dan seimbang.' },
      { key: 'D', text: 'Menyerahkan seluruh keputusan gaya hidup kepada rekomendasi sistem otomatis.' },
    ],
    correctKey: 'C',
    explanation:
      'Algoritma hanya memengaruhi paparan informasi berdasarkan riwayat klik. Literasi digital membantu pelajar menyaring informasi secara kritis dan tetap menjaga ruang interaksi lokal.',
  },
];

export const DIALOGUES: Record<string, DialogueNode> = {
  // === INTRO & TUJUAN BESAR GAME (MEMBUKA 4 SEGEL PORTAL PULANG) ===
  intro_portal: {
    id: 'intro_portal',
    speaker: 'nino',
    speakerName: 'Nino',
    expression: 'curious',
    text: '...Hah?! Cahaya portal di lorong sekolah beneran melempar aku ke kota asing! Tapi kenapa pintu portal di belakangku tertutup cahaya biru?!',
    nextNodeId: 'intro_portal_2',
  },
  intro_portal_2: {
    id: 'intro_portal_2',
    speaker: 'narrator',
    speakerName: 'Narasi',
    expression: 'neutral',
    text: 'Dua teman sekelasnya berlari menghampiri Nino dari pinggir jalan. Mereka berdua juga mencari jalan pulang dari Neo-Metropolis.',
    nextNodeId: 'meet_friends_1',
  },
  portal_locked_hint: {
    id: 'portal_locked_hint',
    speaker: 'ilyas',
    speakerName: 'Ilyas',
    expression: 'worried',
    text: 'Portal Pulang dikunci oleh 4 segel frekuensi Global Wave di kota ini. Kita harus memecahkan misteri di keempat wilayah berurutan sebelum gerbang pulang terbuka!',
  },

  meet_friends_1: {
    id: 'meet_friends_1',
    speaker: 'dira',
    speakerName: 'Dira',
    expression: 'happy',
    text: 'Nino! Syukurlah kamu selamat! Aku Adira (Dira) dan ini Ilyas. Kita bertiga terjebak di Neo-Metropolis karena Portal Pulang disegel 4 kunci gangguan sosial "Global Wave".',
    nextNodeId: 'meet_friends_2',
  },
  meet_friends_2: {
    id: 'meet_friends_2',
    speaker: 'ilyas',
    speakerName: 'Ilyas',
    expression: 'serious',
    text: 'Benar! Untuk membuka 4 segel Portal Pulang, kita harus menelusuri 4 wilayah yang saling terhubung: Pelabuhan -> Sandang Ayu Plaza -> Sanggar Darmoyudho -> Terminal Server.',
    nextNodeId: 'meet_friends_3',
  },
  meet_friends_3: {
    id: 'meet_friends_3',
    speaker: 'dira',
    speakerName: 'Dira',
    expression: 'determined',
    text: 'Ingat baik-baik keahlian masing-masing tim kita ya: Nino jeli memeriksa detail fisik tersembunyi [Curiosity Trigger], Ilyas ahli membongkar sistem & enkripsi digital [Data Hacking], dan aku mampu membaca perasaan warga yang defensif [Social Empathy].',
    nextNodeId: 'meet_friends_4',
  },
  meet_friends_4: {
    id: 'meet_friends_4',
    speaker: 'nino',
    speakerName: 'Nino',
    expression: 'determined',
    text: 'Siap! Jadi di setiap tempat kita gali materi kasusnya dulu, beresin gangguan teknisnya, lalu buka jejak ke wilayah berikutnya sampai 4 segel portal terbuka!',
    onComplete: {
      setFlag: 'met_friends',
    },
  },

  // ============================================================================
  // WILAYAH 1: PELABUHAN
  // 1. Orang Pertama: Mba Sari (Materi Sosiologi Globalisasi + Misteri Awal)
  // 2. Mini-Game 1: Sambung Kabel Lampion Halte (Non-Materi)
  // 3. Orang Kedua: Bang Dani (Tanya Materi Mba Sari + Misteri Lanjut ke Plaza)
  // ============================================================================
  sari_mat_1: {
    id: 'sari_mat_1',
    speaker: 'sari',
    speakerName: 'Mba Sari',
    expression: 'worried',
    text: 'Syukurlah ada anak muda yang mau mampir ngobrol, Nak... Sejak sinyal aneh "Gelombang Global" muncul semalam, warung dan lingkungan sini jadi sunyi sekali.',
    nextNodeId: 'sari_mat_2',
  },
  sari_mat_2: {
    id: 'sari_mat_2',
    speaker: 'sari',
    speakerName: 'Mba Sari',
    expression: 'neutral',
    text: 'Dalam sosiologi, sosiolog Anthony Giddens menyebut globalisasi sebagai intensifikasi hubungan sosial mendunia—kejadian atau tren jauh dari luar negeri langsung memengaruhi kebiasaan kita sehari-hari.',
    nextNodeId: 'sari_mat_3',
  },
  sari_mat_3: {
    id: 'sari_mat_3',
    speaker: 'sari',
    speakerName: 'Mba Sari',
    expression: 'serious',
    text: 'Akibatnya, interaksi sosial primer tatap muka—seperti warga saling menyapa langsung di warung—bergeser menjadi keterlibatan sepihak lewat layar digital. Fisik berdekatan, tapi hati terasa berjauhan.',
    nextNodeId: 'sari_mat_4',
  },
  sari_mat_4: {
    id: 'sari_mat_4',
    speaker: 'sari',
    speakerName: 'Mba Sari',
    expression: 'curious',
    text: 'Misteri yang bikin Mba curiga: semalam lampu kabel di Halte Neo-Bus padam bersamaan saat gelombang sinyal asing melintas ke timur! Coba sambungkan lagi kabel halte itu, lalu temui Bang Dani di halte.',
    onComplete: {
      addClueId: 'C0',
      setFlag: 'outskirts_mat_done',
    },
  },
  sari_reminder: {
    id: 'sari_reminder',
    speaker: 'sari',
    speakerName: 'Mba Sari',
    expression: 'happy',
    text: 'Jangan lupa ya, Nak: menurut Anthony Giddens globalisasi itu intensifikasi hubungan sosial mendunia, yang sering menggeser interaksi primer tatap muka menjadi keterlibatan layar sepihak.',
  },
  sari_after: {
    id: 'sari_after',
    speaker: 'sari',
    speakerName: 'Mba Sari',
    expression: 'happy',
    text: 'Semangat membuka empat segel pulang, Nak! Warga pelabuhan mulai berani keluar rumah dan ngobrol di warung lagi setelah lampu halte menyala.',
  },

  // Orang Kedua Wilayah 1: Bang Dani (Uji Materi Mba Sari + Sambung Misteri Plaza)
  dani_need_material: {
    id: 'dani_need_material',
    speaker: 'dani',
    speakerName: 'Bang Dani',
    expression: 'neutral',
    text: 'Halo adik-adik! Sebaiknya kalian dengarkan cerita Mba Sari di Warung Lokal dulu sebelum melintas ke halte ya.',
  },
  dani_need_minigame: {
    id: 'dani_need_minigame',
    speaker: 'dani',
    speakerName: 'Bang Dani',
    expression: 'worried',
    text: 'Waduh, papan kabel lampion halte di sebelah kiri masih mati gelap! Tolong sambungkan jalur kabelnya dulu di kotak papan kabel sebelum kita bahas jejak sinyal semalam.',
  },
  dani_quiz_1: {
    id: 'dani_quiz_1',
    speaker: 'dani',
    speakerName: 'Bang Dani',
    expression: 'happy',
    text: 'Mantap, lampion halte menyala terang! Sebelum kuberi tahu ke mana jejak sinyal semalam pergi, aku mau cek pemahaman kalian dari materi Mba Sari. Menurut Anthony Giddens, apa inti fenomena globalisasi?',
    choices: [
      {
        label: 'A. Penghapusan seluruh batas budaya asli secara paksa.',
        nextNodeId: 'dani_quiz_1_wrong',
      },
      {
        label: 'B. Intensifikasi hubungan sosial mendunia yang menghubungkan lokal dan global.',
        nextNodeId: 'dani_quiz_2',
      },
      {
        label: 'C. Larangan warga berkomunikasi dengan negara lain.',
        nextNodeId: 'dani_quiz_1_wrong',
      },
    ],
  },
  dani_quiz_1_wrong: {
    id: 'dani_quiz_1_wrong',
    speaker: 'dani',
    speakerName: 'Bang Dani',
    expression: 'worried',
    text: 'Hmm, belum tepat! Ingat penjelasan Mba Sari tentang Anthony Giddens—globalisasi mempererat dan mengintensifkan hubungan sosial lintas dunia. Coba pilih lagi!',
    nextNodeId: 'dani_quiz_1',
  },
  dani_quiz_2: {
    id: 'dani_quiz_2',
    speaker: 'dani',
    speakerName: 'Bang Dani',
    expression: 'curious',
    text: 'Betul! Pertanyaan kedua dari penjelasan Mba Sari: ketika warga terus menatap layar hologram meski duduk berdekatan di warung, pergeseran apa yang terjadi?',
    choices: [
      {
        label: 'A. Interaksi primer tatap muka bergeser menjadi keterlibatan layar sepihak.',
        nextNodeId: 'dani_quiz_pass',
      },
      {
        label: 'B. Solidaritas tatap muka justru meningkat tajam.',
        nextNodeId: 'dani_quiz_2_wrong',
      },
    ],
  },
  dani_quiz_2_wrong: {
    id: 'dani_quiz_2_wrong',
    speaker: 'dani',
    speakerName: 'Bang Dani',
    expression: 'worried',
    text: 'Coba diingat lagi cerita Mba Sari: warga kehilangan obrolan langsung karena interaksi tatap muka (primer) tergeser layar. Ulangi pertanyaan ini ya!',
    nextNodeId: 'dani_quiz_2',
  },
  dani_quiz_pass: {
    id: 'dani_quiz_pass',
    speaker: 'dani',
    speakerName: 'Bang Dani',
    expression: 'happy',
    text: 'Tepat sekali! Nah, ini misteri lanjutannya: saat kabel halte ini padam, sinyal pengacau itu menembak lurus ke Layar Utama Sandang Ayu Plaza! Segel 1/4 terbuka—teruskan pelacakan kalian ke Plaza di kanan!',
    onComplete: {
      setFlag: 'outskirts_quiz_done',
      addClueId: 'C0',
      advanceQuest: 'Q2',
    },
  },
  dani_after: {
    id: 'dani_after',
    speaker: 'dani',
    speakerName: 'Bang Dani',
    expression: 'happy',
    text: 'Jejak sinyal mengarah ke timur menuju Sandang Ayu Plaza! Segel 1 sudah beres, hati-hati di pusat kota ya!',
  },

  // ============================================================================
  // WILAYAH 2: SANDANG AYU PLAZA
  // 1. Orang Pertama: Raka [Blind Dispatch] -> Materi FOMO, Konformitas, & Parasosial
  // 2. Mini-Game 2: Tangkap Energi Sinyal Plaza (Non-Materi)
  // 3. Orang Kedua: Bu Maya (Tanya Materi Raka + Misteri Lanjut ke Panggung Budaya)
  // ============================================================================
  raka_mat_1: {
    id: 'raka_mat_1',
    speaker: 'raka',
    speakerName: 'Raka',
    expression: 'worried',
    text: 'Maaf tadi aku ketus... Rasanya capek juga terus-terusan mantengin feed hologram ini. Tapi lihat deh bagaimana budaya populer global bekerja di plaza ini.',
    nextNodeId: 'raka_mat_2',
  },
  raka_mat_2: {
    id: 'raka_mat_2',
    speaker: 'raka',
    speakerName: 'Raka',
    expression: 'serious',
    text: 'Di sini banyak pelajar kena FOMO (Fear of Missing Out) dan konformitas digital—rasa takut dianggap ketinggalan zaman kalau tidak mengikuti tren gaya hidup seragam yang viral di layar setiap jam.',
    nextNodeId: 'raka_mat_3',
  },
  raka_mat_3: {
    id: 'raka_mat_3',
    speaker: 'raka',
    speakerName: 'Raka',
    expression: 'neutral',
    text: 'Parahnya lagi, muncul kedekatan semu (hubungan parasosial): aku hafal makanan favorit artis luar negeri, tapi lupa menanyakan kabar teman sebangkuku di dunia nyata karena kontak sosial langsung menyusut.',
    nextNodeId: 'raka_mat_4',
  },
  raka_mat_4: {
    id: 'raka_mat_4',
    speaker: 'raka',
    speakerName: 'Raka',
    expression: 'curious',
    text: 'Ngomong-ngomong, gelombang yang bikin layar plaza kacau ini berpusat di Konsol Pemindai Sinyal sebelah kanan. Tolong stabilkan sinyalnya lewat pemindai itu, lalu temui Bu Maya di ujung plaza!',
    onComplete: {
      addClueId: 'C1',
      setFlag: 'talked_raka',
    },
  },
  raka_after: {
    id: 'raka_after',
    speaker: 'raka',
    speakerName: 'Raka',
    expression: 'happy',
    text: 'Ingat ya: FOMO bikin orang ikut-ikutan tren karena takut tersisih (konformitas digital), dan kedekatan dengan idola layar cuma kedekatan semu!',
  },

  // Orang Kedua Wilayah 2: Bu Maya
  maya_need_material: {
    id: 'maya_need_material',
    speaker: 'maya',
    speakerName: 'Bu Maya',
    expression: 'neutral',
    text: 'Selamat sore. Saya masih memantau laporan pelajar yang terpaku di layar depan Plaza. Coba bicaralah dulu dengan Raka di sisi kiri agar kalian paham situasinya.',
  },
  maya_need_minigame: {
    id: 'maya_need_minigame',
    speaker: 'maya',
    speakerName: 'Bu Maya',
    expression: 'worried',
    text: 'Sinyal liar di tengah Sandang Ayu Plaza masih menyebar! Jalankan dulu Konsol Pemindai Sinyal di tengah plaza untuk menangkap energi pengganggunya.',
  },
  maya_quiz_1: {
    id: 'maya_quiz_1',
    speaker: 'maya',
    speakerName: 'Bu Maya',
    expression: 'curious',
    text: 'Bagus, energi sinyal Plaza sudah stabil! Sekarang jawab pertanyaan dari penjelasan Raka tadi: apa yang dimaksud FOMO yang mendorong konformitas digital remaja?',
    choices: [
      {
        label: 'A. Rasa takut tertinggal tren sehingga ikut-ikutan agar tetap diterima kelompok.',
        nextNodeId: 'maya_quiz_2',
      },
      {
        label: 'B. Keinginan melestarikan kesenian tradisional bersama tetangga.',
        nextNodeId: 'maya_quiz_1_wrong',
      },
    ],
  },
  maya_quiz_1_wrong: {
    id: 'maya_quiz_1_wrong',
    speaker: 'maya',
    speakerName: 'Bu Maya',
    expression: 'worried',
    text: 'Belum tepat. Raka menjelaskan FOMO (Fear of Missing Out) sebagai rasa takut ketinggalan tren sehingga memicu konformitas digital. Ayo jawab lagi!',
    nextNodeId: 'maya_quiz_1',
  },
  maya_quiz_2: {
    id: 'maya_quiz_2',
    speaker: 'maya',
    speakerName: 'Bu Maya',
    expression: 'serious',
    text: 'Tepat! Satu lagi dari materi Raka: ketika remaja hafal detail hidup selebritas di layar namun menjauh dari teman sebangku, fenomena itu menunjukkan...',
    choices: [
      {
        label: 'A. Terjadinya kedekatan semu digital yang menggeser kontak sosial langsung.',
        nextNodeId: 'maya_quiz_pass',
      },
      {
        label: 'B. Menguatnya kontak sosial primer di sekolah.',
        nextNodeId: 'maya_quiz_2_wrong',
      },
    ],
  },
  maya_quiz_2_wrong: {
    id: 'maya_quiz_2_wrong',
    speaker: 'maya',
    speakerName: 'Bu Maya',
    expression: 'worried',
    text: 'Perhatikan lagi: perhatian ke tokoh layar membuat kontak langsung melemah—itulah kedekatan semu. Coba pilih jawaban yang benar!',
    nextNodeId: 'maya_quiz_2',
  },
  maya_quiz_pass: {
    id: 'maya_quiz_pass',
    speaker: 'maya',
    speakerName: 'Bu Maya',
    expression: 'happy',
    text: 'Brilian! Begitu sinyal Plaza diredam, radar menunjukkan sumber pemblokir siaran budaya warga mengarah ke timur: Sanggar Darmoyudho! Segel 2/4 terbuka—lanjutkan penelusuran ke sana!',
    onComplete: {
      addClueId: 'C2',
      setFlag: 'plaza_quiz_done',
      advanceQuest: 'Q3',
    },
  },
  maya_after: {
    id: 'maya_after',
    speaker: 'maya',
    speakerName: 'Bu Maya',
    expression: 'happy',
    text: 'Sumber gangguan berikutnya berada di Sanggar Darmoyudho di sebelah kanan Plaza. Segel 2 sudah terbuka!',
  },

  // ============================================================================
  // WILAYAH 3: SANGGAR DARMOYUDHO
  // 1. Orang Pertama: Pak Wiryo [Blind Dispatch] -> Materi Homogenisasi vs Akulturasi Kreatif
  // 2. Mini-Game 3: Ritme Gamelan 3 Jalur (Non-Materi)
  // 3. Orang Kedua: Teh Rani (Tanya Materi Pak Wiryo + Lokasi Kunci ke Server)
  // 4. Kotak Panel Tata Suara [Blind Dispatch] -> Kartu Akses ke Terminal Server
  // ============================================================================
  wiryo_mat_1: {
    id: 'wiryo_mat_1',
    speaker: 'wiryo',
    speakerName: 'Pak Wiryo',
    expression: 'happy',
    text: 'Terima kasih sudah mau mendengarkan hati seorang seniman tua di Sanggar Darmoyudho ini. Sebenarnya Bapak tidak membenci perkembangan zaman atau budaya asing.',
    nextNodeId: 'wiryo_mat_2',
  },
  wiryo_mat_2: {
    id: 'wiryo_mat_2',
    speaker: 'wiryo',
    speakerName: 'Pak Wiryo',
    expression: 'serious',
    text: 'Dalam sosiologi, penyebaran budaya populer yang membuat selera, hiburan, dan gaya hidup masyarakat menjadi seragam di mana-mana disebut homogenisasi budaya.',
    nextNodeId: 'wiryo_mat_3',
  },
  wiryo_mat_3: {
    id: 'wiryo_mat_3',
    speaker: 'wiryo',
    speakerName: 'Pak Wiryo',
    expression: 'determined',
    text: 'Solusinya bukan menolak budaya luar, melainkan sikap selektif-adaptif dan akulturasi kreatif: menerima unsur modern yang baik lalu memadukannya harmonis dengan budaya lokal tanpa menghilangkan jati diri!',
    nextNodeId: 'wiryo_mat_4',
  },
  wiryo_mat_4: {
    id: 'wiryo_mat_4',
    speaker: 'wiryo',
    speakerName: 'Pak Wiryo',
    expression: 'curious',
    text: 'Nah, coba hidupkan kembali perangkat Gamelan di Sanggar Darmoyudho dengan irama yang pas, lalu temui Teh Rani di kanan panggung untuk melacak penyabotase jalur siaran kita!',
    onComplete: {
      addClueId: 'C3',
      setFlag: 'talked_wiryo',
    },
  },
  wiryo_after: {
    id: 'wiryo_after',
    speaker: 'wiryo',
    speakerName: 'Pak Wiryo',
    expression: 'happy',
    text: 'Ingat Nak: lawan homogenisasi budaya dengan akulturasi kreatif dan sikap selektif-adaptif!',
  },

  gamelan_need_wiryo: {
    id: 'gamelan_need_wiryo',
    speaker: 'nino',
    speakerName: 'Nino',
    expression: 'neutral',
    text: 'Gamelan di Sanggar Darmoyudho ini perlu izin dari Pak Wiryo di sebelah kiri sebelum dimainkan.',
  },

  // Orang Kedua Wilayah 3: Teh Rani
  rani_need_material: {
    id: 'rani_need_material',
    speaker: 'rani',
    speakerName: 'Teh Rani',
    expression: 'neutral',
    text: 'Halo! Sanggar Darmoyudho baru boleh disetel ulang setelah Pak Wiryo di sebelah kiri merasa tenang. Temui beliau terlebih dahulu ya.',
  },
  rani_need_minigame: {
    id: 'rani_need_minigame',
    speaker: 'rani',
    speakerName: 'Teh Rani',
    expression: 'worried',
    text: 'Lampu Sanggar Darmoyudho masih redup! Mainkan dulu perangkat Gamelan & Angklung di tengah panggung sampai alunan ritmenya menyalakan resonansi sanggar.',
  },
  rani_quiz_1: {
    id: 'rani_quiz_1',
    speaker: 'rani',
    speakerName: 'Teh Rani',
    expression: 'happy',
    text: 'Merdu sekali alunan gamelannya! Sebelum kuberi tahu ke mana penyabotase acara sanggar lari, jawab dulu pertanyaan dari materi Pak Wiryo: apa yang dimaksud homogenisasi budaya?',
    choices: [
      {
        label: 'A. Proses pola konsumsi & gaya hidup masyarakat menjadi seragam akibat dominasi budaya populer.',
        nextNodeId: 'rani_quiz_2',
      },
      {
        label: 'B. Pertunjukan seni daerah yang berkolaborasi dengan musik modern.',
        nextNodeId: 'rani_quiz_1_wrong',
      },
    ],
  },
  rani_quiz_1_wrong: {
    id: 'rani_quiz_1_wrong',
    speaker: 'rani',
    speakerName: 'Teh Rani',
    expression: 'worried',
    text: 'Kurang tepat! Homogenisasi artinya penyeragaman—pola hidup dan selera warga menjadi seragam karena dominasi satu tren populer. Coba lagi!',
    nextNodeId: 'rani_quiz_1',
  },
  rani_quiz_2: {
    id: 'rani_quiz_2',
    speaker: 'rani',
    speakerName: 'Teh Rani',
    expression: 'curious',
    text: 'Benar! Soal kedua dari Pak Wiryo: jika remaja menyukai musik modern namun tetap memadukannya dengan gamelan tanpa menghilangkan akar tradisi, sikap apa yang ditunjukkan?',
    choices: [
      {
        label: 'A. Sikap menutup diri total dari dunia luar.',
        nextNodeId: 'rani_quiz_2_wrong',
      },
      {
        label: 'B. Sikap selektif-adaptif dan akulturasi kreatif.',
        nextNodeId: 'rani_quiz_pass',
      },
    ],
  },
  rani_quiz_2_wrong: {
    id: 'rani_quiz_2_wrong',
    speaker: 'rani',
    speakerName: 'Teh Rani',
    expression: 'worried',
    text: 'Belum pas—memadukan budaya lokal dan unsur global yang baik tanpa kehilangan jati diri adalah akulturasi kreatif serta sikap selektif-adaptif. Pilih lagi ya!',
    nextNodeId: 'rani_quiz_2',
  },
  rani_quiz_pass: {
    id: 'rani_quiz_pass',
    speaker: 'rani',
    speakerName: 'Teh Rani',
    expression: 'determined',
    text: 'Tepat 100%! Ini lanjutan misterinya: sebelum kabur ke Terminal Server Kota, petugas misterius menyembunyikan Kartu Akses Server di dalam Kotak Panel Tata Suara di ujung kanan panggung!',
    onComplete: {
      addClueId: 'C3B',
      setFlag: 'stage_quiz_done',
    },
  },
  rani_after: {
    id: 'rani_after',
    speaker: 'rani',
    speakerName: 'Teh Rani',
    expression: 'happy',
    text: 'Kartu Akses disembunyikan di Kotak Panel Tata Suara di sebelah kanan! Siapa di tim kalian yang paling jeli mencari benda tersembunyi?',
  },
  access_card_need_rani: {
    id: 'access_card_need_rani',
    speaker: 'nino',
    speakerName: 'Nino',
    expression: 'neutral',
    text: 'Kotak panel tata suara ini berdebu. Sebaiknya selesaikan pendopo dan bicara dengan Teh Rani dulu sebelum menggeledahnya.',
  },
  access_card_found: {
    id: 'access_card_found',
    speaker: 'nino',
    speakerName: 'Nino',
    expression: 'happy',
    text: 'Ketemu! Kartu Akses Server Kota terselip di balik gulungan kabel audio! Segel 3/4 terbuka—saatnya menuju Terminal Server Kota di kanan!',
    onComplete: {
      addClueId: 'C4',
      setFlag: 'has_access_card',
      advanceQuest: 'Q4',
    },
  },

  // ============================================================================
  // WILAYAH 4: TERMINAL SERVER KOTA
  // 0. Firewall [Blind Dispatch] -> Buka Pintu
  // 1. Orang Pertama: Mas Ilham -> Materi Filter Bubble, Bias Algoritma, & Literasi Digital
  // 2. Mini-Game 4: Memori Pola Inti Server (Non-Materi)
  // 3. Orang Kedua: Pak Arga (Tanya Materi Mas Ilham -> Kebijakan Kota -> Segel 4/4 Terbuka!)
  // ============================================================================
  ilham_mat_1: {
    id: 'ilham_mat_1',
    speaker: 'ilham',
    speakerName: 'Mas Ilham',
    expression: 'worried',
    text: 'Akhirnya ada yang berhasil menembus firewall! Akulah yang menyusun arsitektur awal server ini sebelum sistem rekomendasinya disetel terlalu ekstrem.',
    nextNodeId: 'ilham_mat_2',
  },
  ilham_mat_2: {
    id: 'ilham_mat_2',
    speaker: 'ilham',
    speakerName: 'Mas Ilham',
    expression: 'serious',
    text: 'Begini cara kerjanya secara sosiologis: algoritma rekomendasi memberi skor berlipat pada tren yang sering diklik, hingga tercipta "Ruang Gema" (Filter Bubble)—layar hanya memantulkan konten seragam berulang kali.',
    nextNodeId: 'ilham_mat_3',
  },
  ilham_mat_3: {
    id: 'ilham_mat_3',
    speaker: 'ilham',
    speakerName: 'Mas Ilham',
    expression: 'determined',
    text: 'Akibat bias visibilitas algoritma itu, informasi acara warga dan budaya lokal tenggelam. Namun algoritma tidak mengendalikan pikiran 100%—kuncinya adalah Literasi Digital Kritis agar pengguna sadar menyaring informasi!',
    nextNodeId: 'ilham_mat_4',
  },
  ilham_mat_4: {
    id: 'ilham_mat_4',
    speaker: 'ilham',
    speakerName: 'Mas Ilham',
    expression: 'curious',
    text: 'Untuk mereset inti server dan membuka kunci terakhir Portal Pulang, kalibrasi dulu frekuensi gelombang di Konsol Inti Server sebelah kanan, lalu hadapi Pak Arga sang Kepala Pengawas!',
    onComplete: {
      addClueId: 'C4C',
      setFlag: 'terminal_mat_done',
    },
  },
  ilham_after: {
    id: 'ilham_after',
    speaker: 'ilham',
    speakerName: 'Mas Ilham',
    expression: 'happy',
    text: 'Ingat intinya: Ruang Gema (Filter Bubble) muncul karena algoritma mengulang topik serupa, dan obatnya adalah Literasi Digital Kritis!',
  },

  algo_need_hack: {
    id: 'algo_need_hack',
    speaker: 'ilyas',
    speakerName: 'Ilyas',
    expression: 'worried',
    text: 'Konsol inti masih terkunci firewall! Kita harus bicara dengan Mas Ilham setelah gerbang keamanan terbuka.',
  },
  algo_need_ilham: {
    id: 'algo_need_ilham',
    speaker: 'nino',
    speakerName: 'Nino',
    expression: 'neutral',
    text: 'Konsol ini penuh data ruang gema. Ayo dengarkan dulu penjelasan Mas Ilham di sebelah kiri.',
  },

  // Orang Kedua Wilayah 4: Pak Arga (Uji Materi Mas Ilham + Kolaborasi Akhir 3 Karakter)
  arga_need_material: {
    id: 'arga_need_material',
    speaker: 'arga',
    speakerName: 'Pak Arga',
    expression: 'serious',
    text: 'Kalian sudah sampai jauh, anak-anak muda. Sebelum berdiskusi dengan saya, pelajari dulu laporan Mas Ilham di sisi kiri terminal.',
  },
  arga_need_minigame: {
    id: 'arga_need_minigame',
    speaker: 'arga',
    speakerName: 'Pak Arga',
    expression: 'serious',
    text: 'Gelombang inti server di sebelah kiri masih belum selaras. Selesaikan kalibrasi gelombang server terlebih dahulu agar kunci portal keempat bisa diuji!',
  },
  arga_quiz_1: {
    id: 'arga_quiz_1',
    speaker: 'arga',
    speakerName: 'Pak Arga',
    expression: 'serious',
    text: 'Impresif! Kalian menyelaraskan gelombang inti server. Sekarang buktikan pemahaman kalian atas penjelasan Mas Ilham: apa dampak utama terbentuknya Ruang Gema (Filter Bubble)?',
    choices: [
      {
        label: 'A. Pengguna terus menerima informasi seragam sesuai klik sebelumnya dan terisolasi dari perspektif lain.',
        nextNodeId: 'arga_quiz_2',
      },
      {
        label: 'B. Semua berita lokal otomatis dipromosikan lebih tinggi daripada tren global.',
        nextNodeId: 'arga_quiz_1_wrong',
      },
    ],
  },
  arga_quiz_1_wrong: {
    id: 'arga_quiz_1_wrong',
    speaker: 'arga',
    speakerName: 'Pak Arga',
    expression: 'worried',
    text: 'Keliru! Ruang Gema justru mempersempit sudut pandang karena layar terus mengulang topik klik sebelumnya dan menyembunyikan keragaman lokal. Coba lagi!',
    nextNodeId: 'arga_quiz_1',
  },
  arga_quiz_2: {
    id: 'arga_quiz_2',
    speaker: 'arga',
    speakerName: 'Pak Arga',
    expression: 'curious',
    text: 'Tepat! Pertanyaan kedua: menurut Mas Ilham, sikap sosiologis apa yang paling tepat bagi pelajar dalam menghadapi sistem rekomendasi digital?',
    choices: [
      {
        label: 'A. Mempercayai semua tren beranda sebagai kenyataan mutlak.',
        nextNodeId: 'arga_quiz_2_wrong',
      },
      {
        label: 'B. Mengembangkan literasi digital kritis agar tetap sadar memilih informasi secara seimbang.',
        nextNodeId: 'arga_quiz_3',
      },
    ],
  },
  arga_quiz_2_wrong: {
    id: 'arga_quiz_2_wrong',
    speaker: 'arga',
    speakerName: 'Pak Arga',
    expression: 'worried',
    text: 'Masih kurang tepat! Manusia tetap punya kendali melalui Literasi Digital Kritis, bukan tunduk penuh pada layar atau menolak teknologi total. Jawab ulang ya!',
    nextNodeId: 'arga_quiz_2',
  },
  arga_quiz_3: {
    id: 'arga_quiz_3',
    speaker: 'arga',
    speakerName: 'Pak Arga',
    expression: 'serious',
    text: 'Pertanyaan penentu terakhir: "Algoritma media sosial cenderung menampilkan konten yang sesuai dengan minat penggunanya. Akibatnya, remaja dapat terus-menerus terpapar budaya dari negara lain. Mengapa kondisi tersebut dapat memengaruhi pola pikir, perilaku, dan identitas budaya remaja?"',
    choices: [
      {
        label: 'A. Karena paparan berulang menormalkan nilai asing, mengubah kebiasaan serta selera gaya hidup, dan dapat melemahkan keterikatan terhadap budaya lokal bila tanpa kesadaran kritis.',
        nextNodeId: 'arga_quiz_pass',
      },
      {
        label: 'B. Karena algoritma langsung menghapus seluruh bahasa daerah dan ingatan tradisi remaja dalam satu hari.',
        nextNodeId: 'arga_quiz_3_wrong',
      },
      {
        label: 'C. Karena konten media sosial sama sekali tidak memiliki pengaruh terhadap cara berpikir maupun kebiasaan penggunanya.',
        nextNodeId: 'arga_quiz_3_wrong',
      },
    ],
  },
  arga_quiz_3_wrong: {
    id: 'arga_quiz_3_wrong',
    speaker: 'arga',
    speakerName: 'Pak Arga',
    expression: 'worried',
    text: 'Cermati lagi cara kerja algoritma: paparan yang diulang terus-menerus perlahan membentuk standar normal baru dalam pola pikir, kebiasaan perilaku, hingga jati diri remaja bila tidak disaring secara kritis. Coba pilih analisis yang tepat!',
    nextNodeId: 'arga_quiz_3',
  },
  arga_quiz_pass: {
    id: 'arga_quiz_pass',
    speaker: 'arga',
    speakerName: 'Pak Arga',
    expression: 'happy',
    text: 'Luar biasa! Sekarang inti server terbuka penuh untuk kalian bertiga. Gabungkan keahlian Nino, Ilyas, dan Dira dalam Kolaborasi Akhir untuk meraih Kunci Master Portal Pulang!',
    onComplete: {
      setFlag: 'terminal_quiz_done',
      advanceQuest: 'Q5',
      openModal: 'final_collab',
    },
  },
  arga_ready_choice: {
    id: 'arga_ready_choice',
    speaker: 'arga',
    speakerName: 'Pak Arga',
    expression: 'happy',
    text: 'Saatnya kalian bertiga berkolaborasi memulihkan server kota demi membuka Kunci Master Portal Pulang!',
    onComplete: {
      openModal: 'final_collab',
    },
  },
  arga_after: {
    id: 'arga_after',
    speaker: 'arga',
    speakerName: 'Pak Arga',
    expression: 'happy',
    text: 'Kolaborasi yang mengagumkan! Cahaya keemasan menyelimuti Neo-Metropolis dan Portal Pulang kini terbuka tepat di sisi kanan Terminal Server ini!',
  },

  eval_need_q5: {
    id: 'eval_need_q5',
    speaker: 'ilyas',
    speakerName: 'Ilyas',
    expression: 'neutral',
    text: 'Akses Podium Warga baru terbuka setelah kita menuntaskan misi keempat di Terminal Server Kota.',
  },
  eval_need_choice: {
    id: 'eval_need_choice',
    speaker: 'dira',
    speakerName: 'Dira',
    expression: 'serious',
    text: 'Ayo selesaikan kolaborasi akhir kita bertiga untuk menentukan masa depan warga Neo-Metropolis!',
    onComplete: {
      openModal: 'final_collab',
    },
  },

  city_transformed_portal: {
    id: 'city_transformed_portal',
    speaker: 'dira',
    speakerName: 'Dira',
    expression: 'happy',
    text: 'Keempat kunci sudah terkumpul dan langit Neo-Metropolis berubah keemasan! Kunci Master membuka Portal Pulang sepenuhnya, Nin! Siap pulang sekarang?',
    choices: [
      {
        label: 'Masuk ke Portal Pulang (Saksikan Ending)',
        nextNodeId: 'ending_trigger_node',
      },
      {
        label: 'Jalan-jalan sebentar lagi di kota yang baru',
        nextNodeId: 'stay_awhile',
      },
    ],
  },
  stay_awhile: {
    id: 'stay_awhile',
    speaker: 'nino',
    speakerName: 'Nino',
    expression: 'happy',
    text: 'Sebentar lagi deh, aku mau pamitan dulu sama Mba Sari, Raka, dan Pak Wiryo.',
  },
  ending_trigger_node: {
    id: 'ending_trigger_node',
    speaker: 'nino',
    speakerName: 'Nino',
    expression: 'happy',
    text: 'Ayo pulang ke dunia nyata, Yas, Dir!',
    onComplete: {
      openModal: 'ending',
    },
  },
};
