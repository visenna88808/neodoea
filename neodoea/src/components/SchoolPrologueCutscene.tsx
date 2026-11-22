import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, ChevronRight, FastForward, Pause, Play, Volume2 } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { ASSETS } from '../data/gameData';
import { AnimeCharacterSprite, type SpriteMood } from './AnimeCharacterSprite';

interface SchoolPrologueCutsceneProps {
  onComplete: () => void;
}

type BeatId =
  | 's1_classroom_lesson'
  | 's1_sleep_zoom'
  | 's2_dream_sweep'
  | 's2_dream_walk'
  | 's3_wake_up'
  | 's4_classroom_exit'
  | 's4_corridor_walk'
  | 's5_enter_portal'
  | 's5_inside_portal'
  | 's5_title';

interface AnimeBeat {
  id: BeatId;
  sceneLabel: string;
  speaker: string;
  text: string;
  durationSec: number;
  music: 'menu' | 'prologue_mystery' | 'prologue_adventure';
  alt: string;
}

const ANIME_BEATS: AnimeBeat[] = [
  {
    id: 's1_classroom_lesson',
    sceneLabel: 'Scene 1 · Suasana Kelas SMA',
    speaker: 'Guru Sosiologi',
    text: 'Sinar matahari siang menembus jendela kelas. Guru menjelaskan materi Globalisasi sementara para siswa mencatat di meja masing-masing.',
    durationSec: 4.8,
    music: 'menu',
    alt: 'Ruang kelas SMA Indonesia pada siang hari dengan guru menjelaskan materi Globalisasi',
  },
  {
    id: 's1_sleep_zoom',
    sceneLabel: 'Scene 1 · Terlelap di Atas Meja',
    speaker: 'Narasi',
    text: 'Nino duduk di bangkunya sambil menahan kantuk. Kepalanya sempat terkulai beberapa kali sebelum akhirnya bersandar pulas di atas lipatan tangan...',
    durationSec: 6.6,
    music: 'menu',
    alt: 'Nino mengantuk, terkantuk-kantuk lalu tertidur pulas di atas meja kelas SMA',
  },
  {
    id: 's2_dream_sweep',
    sceneLabel: 'Scene 2 · Kota Globalisasi',
    speaker: 'Nino',
    text: 'Nino terbangun di kota modern penuh pengaruh globalisasi: gedung pencakar langit dengan iklan digital, monorel listrik, kedai internasional, dan transaksi tanpa tunai.',
    durationSec: 4.8,
    music: 'prologue_adventure',
    alt: 'Panorama kota modern globalisasi dengan monorel, papan iklan digital, dan trotoar kota',
  },
  {
    id: 's2_dream_walk',
    sceneLabel: 'Scene 2 · Berjalan Menyusuri Trotoar',
    speaker: 'Narasi',
    text: 'Nino berjalan menyusuri trotoar kota yang semarak, sesekali berhenti menatap papan informasi global dan laju monorel di atas kota.',
    durationSec: 6.8,
    music: 'prologue_adventure',
    alt: 'Nino berjalan menyusuri trotoar kota globalisasi sambil mengamati sekelilingnya',
  },
  {
    id: 's3_wake_up',
    sceneLabel: 'Scene 3 · Kembali ke Kenyataan',
    speaker: 'Guru Sosiologi',
    text: '"Nino!" — Suara guru membuyarkan kota mimpi. Nino tersentak bangkit dari meja, menoleh ke kiri dan kanan dengan bingung... lalu bel pulang berbunyi!',
    durationSec: 6.4,
    music: 'menu',
    alt: 'Nino tersentak bangun dari meja, menoleh kiri dan kanan kebingungan saat bel sekolah berbunyi',
  },
  {
    id: 's4_classroom_exit',
    sceneLabel: 'Scene 4 · Beranjak dari Kelas',
    speaker: 'Nino',
    text: 'Nino berdiri dari bangkunya, menyampirkan tas ransel merahnya, lalu melangkah menuju pintu kelas yang bermandikan cahaya senja.',
    durationSec: 3.8,
    music: 'prologue_mystery',
    alt: 'Nino berdiri mengambil tas ransel merah dan berjalan keluar pintu kelas',
  },
  {
    id: 's4_corridor_walk',
    sceneLabel: 'Scene 4 · Lorong Sekolah Misterius',
    speaker: 'Nino',
    text: 'Ia menyusuri koridor sekolah yang lengang di waktu senja. Tiba-tiba hembusan angin menerpa dan pusaran cahaya biru-ungu membentuk portal raksasa di ujung lorong!',
    durationSec: 7.6,
    music: 'prologue_mystery',
    alt: 'Nino berjalan menyusuri koridor sekolah senja hingga terhenti kaget melihat portal misterius',
  },
  {
    id: 's5_enter_portal',
    sceneLabel: 'Scene 5 · Memasuki Hal Tak Dikenal',
    speaker: 'Narasi',
    text: 'Berdiri di hadapan gerbang cahaya yang berputar kuat, Nino menarik napas dalam lalu melangkah maju menembus ambang portal misterius.',
    durationSec: 5.4,
    music: 'prologue_adventure',
    alt: 'Nino berdiri dari belakang menghadap portal bercahaya lalu melangkah masuk',
  },
  {
    id: 's5_inside_portal',
    sceneLabel: 'Scene 5 · Menembus Pusaran Portal',
    speaker: 'Nino',
    text: 'Arus cahaya dimensi dan simbol budaya dunia berputar deras di sekeliling Nino saat ia melesat masuk menuju dunia baru yang penuh tanda tanya.',
    durationSec: 5.4,
    music: 'prologue_adventure',
    alt: 'Nino berada di dalam pusaran cahaya portal menuju dunia globalisasi',
  },
  {
    id: 's5_title',
    sceneLabel: 'Prolog · Awal Petualangan',
    speaker: 'neodoea · Awal Perjalanan',
    text: 'Cahaya portal mereda — kini Nino, Ilyas, dan Dira siap melangkah memasuki misteri Neo-Metropolis.',
    durationSec: 4.4,
    music: 'prologue_adventure',
    alt: 'Ilustrasi Nino, Ilyas, dan Dira berseragam batik biru langit dengan logo neodoea',
  },
];

const NINO_WALK_FRAMES = [
  '/assets/sprites/nino_0.png',
  '/assets/sprites/nino_1.png',
  '/assets/sprites/nino_2.png',
  '/assets/sprites/nino_3.png',
] as const;

const NINO_WALK_CYCLE = [1, 2, 3, 2] as const;

const PRELOAD_ASSET_LIST = [
  ASSETS.cutsceneClassroomDay,
  ASSETS.ninoDeskDrowsy,
  ASSETS.ninoDeskNodding,
  ASSETS.ninoDeskAsleep,
  ASSETS.ninoDeskLifting,
  ASSETS.ninoDeskSurprised,
  ASSETS.ninoDeskLookLeft,
  ASSETS.ninoDeskLookRight,
  ASSETS.dreamCitySidewalk,
  ASSETS.ninoClassroomExit,
  ASSETS.corridorSunsetWalk,
  ASSETS.corridorSunsetPortal,
  ASSETS.ninoCorridorPortalShock,
  ASSETS.ninoPortalRearStep,
  ASSETS.ninoEnteringPortalVortex,
  ASSETS.prologueFinalArt,
  ...NINO_WALK_FRAMES,
] as const;

const BACKDROP_LAYERS = [
  { key: 'classroomDay', src: ASSETS.cutsceneClassroomDay },
  { key: 'deskDrowsy', src: ASSETS.ninoDeskDrowsy },
  { key: 'deskNodding', src: ASSETS.ninoDeskNodding },
  { key: 'deskAsleep', src: ASSETS.ninoDeskAsleep },
  { key: 'deskLifting', src: ASSETS.ninoDeskLifting },
  { key: 'deskSurprised', src: ASSETS.ninoDeskSurprised },
  { key: 'deskLookLeft', src: ASSETS.ninoDeskLookLeft },
  { key: 'deskLookRight', src: ASSETS.ninoDeskLookRight },
  { key: 'dreamCity', src: ASSETS.dreamCitySidewalk },
  { key: 'classroomExit', src: ASSETS.ninoClassroomExit },
  { key: 'corridorWalk', src: ASSETS.corridorSunsetWalk },
  { key: 'corridorPortal', src: ASSETS.corridorSunsetPortal },
  { key: 'corridorShock', src: ASSETS.ninoCorridorPortalShock },
  { key: 'portalRearStep', src: ASSETS.ninoPortalRearStep },
  { key: 'enteringPortal', src: ASSETS.ninoEnteringPortalVortex },
  { key: 'prologueFinal', src: ASSETS.prologueFinalArt },
] as const;

type LayerKey = (typeof BACKDROP_LAYERS)[number]['key'];

const PARTICLES = Array.from({ length: 32 }, (_, idx) => ({
  id: idx,
  left: ((idx * 37 + 11) % 94) + 3,
  top: ((idx * 53 + 7) % 86) + 5,
  size: (idx % 3) + 2,
  phase: idx * 0.65,
  speed: 0.7 + (idx % 4) * 0.25,
}));

const ANIME_RADIAL_STREAKS = Array.from({ length: 18 }, (_, idx) => ({
  id: idx,
  angleDeg: idx * 20,
  widthPx: idx % 3 === 0 ? 3 : 1.5,
  lengthPct: 24 + (idx % 4) * 5,
}));

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

export const SchoolPrologueCutscene: React.FC<SchoolPrologueCutsceneProps> = ({ onComplete }) => {
  const [beatIdx, setBeatIdx] = useState(0);
  const [beatElapsed, setBeatElapsed] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [imgFailedMap, setImgFailedMap] = useState<Record<string, boolean>>({});
  const [bellRinging, setBellRinging] = useState(false);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 1280, height: 720 });

  const timerRef = useRef({
    beatIdx: 0,
    beatElapsed: 0,
    autoPlay: true,
    globalTime: 0,
  });

  // Preload and decode every image immediately on mount so beat & frame switches have 0ms lag
  useEffect(() => {
    PRELOAD_ASSET_LIST.forEach((src) => {
      const img = new Image();
      img.decoding = 'sync';
      img.src = src;
      if (typeof img.decode === 'function') {
        img.decode().catch(() => {});
      }
    });
  }, []);

  // Measure viewport to maintain exact 16:9 ground-plane synchronization across all screen sizes
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setViewportSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stageDims = useMemo(() => {
    const { width: vw, height: vh } = viewportSize;
    const ratio = vw / Math.max(1, vh);
    if (ratio >= 1.35) {
      const w = Math.max(vw, vh * (16 / 9));
      return { width: w, height: w * (9 / 16) };
    }
    return { width: vw, height: vw * (9 / 16) };
  }, [viewportSize]);

  const beat = ANIME_BEATS[beatIdx];
  const progress = clamp01(beatElapsed / beat.durationSec);
  const progressPct = Math.round(progress * 100);

  // Beat transitions & sound effects
  useEffect(() => {
    timerRef.current.beatIdx = beatIdx;
    timerRef.current.beatElapsed = 0;
    setBeatElapsed(0);
    setBellRinging(false);
    soundEngine.startMusic(beat.music);

    if (beat.id === 's3_wake_up') {
      soundEngine.playSfx('glitch');
      const bellTimer = window.setTimeout(() => {
        setBellRinging(true);
        soundEngine.playSfx('bell');
      }, 4100);
      return () => window.clearTimeout(bellTimer);
    }
    if (beat.id === 's4_corridor_walk') {
      const windTimer = window.setTimeout(() => {
        soundEngine.playSfx('wind');
      }, 3900);
      return () => window.clearTimeout(windTimer);
    }
    if (beat.id === 's5_enter_portal' || beat.id === 's5_inside_portal') {
      soundEngine.playSfx('portal');
    }
  }, [beat.id, beat.music]);

  useEffect(() => {
    timerRef.current.autoPlay = autoPlay;
  }, [autoPlay]);

  const advanceBeat = () => {
    soundEngine.unlock();
    if (beatIdx + 1 < ANIME_BEATS.length) {
      soundEngine.playSfx('click');
      setBeatIdx((i) => i + 1);
    } else {
      soundEngine.playSfx('portal');
      onComplete();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        advanceBeat();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // 60fps animation timer
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const s = timerRef.current;
      s.globalTime += dt;
      if (s.autoPlay) {
        s.beatElapsed += dt;
      }

      const activeBeat = ANIME_BEATS[s.beatIdx];
      setBeatElapsed(s.beatElapsed);

      if (s.autoPlay && s.beatElapsed >= activeBeat.durationSec) {
        if (s.beatIdx + 1 < ANIME_BEATS.length) {
          s.beatIdx += 1;
          s.beatElapsed = 0;
          setBeatIdx(s.beatIdx);
        } else {
          onComplete();
          return;
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [onComplete]);

  const ease = progress * progress * (3 - 2 * progress);
  const gTime = timerRef.current.globalTime;

  // === LAYER OPACITIES & CEL-ANIMATED CAMERA / CHARACTER CHOREOGRAPHY ===
  const layerOpacity: Record<LayerKey, number> = {
    classroomDay: 0,
    deskDrowsy: 0,
    deskNodding: 0,
    deskAsleep: 0,
    deskLifting: 0,
    deskSurprised: 0,
    deskLookLeft: 0,
    deskLookRight: 0,
    dreamCity: 0,
    classroomExit: 0,
    corridorWalk: 0,
    corridorPortal: 0,
    corridorShock: 0,
    portalRearStep: 0,
    enteringPortal: 0,
    prologueFinal: 0,
  };

  let camScale = 1.04;
  let camX = 0;
  let camY = 0;
  let camRotateDeg = 0;
  let stageFilter = '';

  // Frame-specific kinetic motion values (for snappy anime anticipation & follow-through)
  const layerShift: Partial<Record<LayerKey, { x?: number; y?: number; rot?: number; sy?: number; origin?: string }>> = {};

  let showWakeShockLines = false;
  let wakeShockAlpha = 0;

  if (beat.id === 's1_classroom_lesson') {
    const fadeNext = smoothstep(0.84, 1.0, progress);
    layerOpacity.classroomDay = 1 - fadeNext;
    layerOpacity.deskDrowsy = fadeNext;
    camScale = 1.03 + ease * 0.11;
    camX = -2.8 * ease;
    camY = 1.4 * ease;
  } else if (beat.id === 's1_sleep_zoom') {
    // True multi-frame cel animation:
    // 0.00..0.15 drowsy -> 0.15..0.28 first heavy nod -> 0.28..0.38 brief startled catch ->
    // 0.38..0.54 second deep nod -> 0.54..1.00 head drops onto folded arms & breathes rhythmically
    const nod1In = smoothstep(0.14, 0.18, progress);
    const catchUp = smoothstep(0.27, 0.30, progress);
    const nod2In = smoothstep(0.37, 0.41, progress);
    const toAsleep = smoothstep(0.52, 0.58, progress);

    if (progress < 0.28) {
      layerOpacity.deskDrowsy = 1 - nod1In;
      layerOpacity.deskNodding = nod1In;
    } else if (progress < 0.39) {
      layerOpacity.deskNodding = 1 - catchUp;
      layerOpacity.deskDrowsy = catchUp;
    } else if (progress < 0.56) {
      layerOpacity.deskDrowsy = 1 - nod2In;
      layerOpacity.deskNodding = nod2In * (1 - toAsleep);
      layerOpacity.deskAsleep = toAsleep;
    } else {
      layerOpacity.deskAsleep = 1;
    }

    const nodDriftY = progress >= 0.37 && progress < 0.56 ? smoothstep(0.37, 0.55, progress) * 1.4 : 0;
    const catchSnapY = progress >= 0.28 && progress < 0.35 ? -Math.sin(((progress - 0.28) / 0.07) * Math.PI) * 0.7 : 0;
    const breathWave = Math.sin(gTime * 1.8);

    layerShift.deskDrowsy = { y: catchSnapY, origin: '50% 65%' };
    layerShift.deskNodding = { y: nodDriftY, rot: nodDriftY * 0.45, origin: '50% 65%' };
    layerShift.deskAsleep = {
      y: breathWave * 0.42 + (1 - toAsleep) * -1.2,
      sy: 1 + breathWave * 0.0085,
      origin: '50% 72%',
    };

    camScale = 1.03 + ease * 0.12;
    camX = -0.5 * ease;
    camY = 0.7 * ease;
  } else if (beat.id === 's2_dream_sweep') {
    layerOpacity.dreamCity = 1;
    camScale = 1.15 - ease * 0.08;
    camX = 3.8 - ease * 7.6;
    camY = -0.6 + ease * 0.8;
  } else if (beat.id === 's2_dream_walk') {
    layerOpacity.dreamCity = 1;
    camScale = 1.11;
    const camWalkCurve =
      progress < 0.46
        ? smoothstep(0, 0.46, progress) * 0.58
        : progress < 0.68
        ? 0.58
        : 0.58 + smoothstep(0.68, 1, progress) * 0.42;
    camX = 3.8 - camWalkCurve * 8.2;
    camY = -1.8;
  } else if (beat.id === 's3_wake_up') {
    // True 5-keyframe anime wake-up animation:
    // 0.00..0.18: dream dissolves -> 0.18..0.24: asleep -> 0.24..0.34: deskLifting (jolt + shock lines) ->
    // 0.34..0.49: deskSurprised -> 0.49..0.66: deskLookLeft -> 0.66..0.85: deskLookRight -> 0.85..1.00: deskSurprised
    if (progress < 0.19) {
      const distP = progress / 0.19;
      layerOpacity.dreamCity = 1 - smoothstep(0.65, 1, distP);
      layerOpacity.deskAsleep = smoothstep(0.65, 1, distP);
      camScale = 1.09 + distP * 0.08;
      stageFilter = `blur(${(distP * 7).toFixed(1)}px) brightness(${(1 + distP * 0.26).toFixed(2)})`;
    } else if (progress < 0.24) {
      layerOpacity.deskAsleep = 1;
      camScale = 1.13;
    } else if (progress < 0.34) {
      // Abrupt upward spring jolt!
      const liftT = (progress - 0.24) / 0.1;
      const snap = smoothstep(0, 0.2, liftT);
      layerOpacity.deskAsleep = 1 - snap;
      layerOpacity.deskLifting = snap;
      showWakeShockLines = true;
      wakeShockAlpha = 1 - smoothstep(0.55, 1, liftT);
      const joltShakeY = Math.sin(liftT * Math.PI * 3) * (1 - liftT) * 1.1;
      layerShift.deskLifting = {
        y: (1 - smoothstep(0, 0.65, liftT)) * 1.6 + joltShakeY,
        origin: '50% 70%',
      };
      camScale = 1.13 - liftT * 0.04;
      camY = joltShakeY * 0.6;
    } else if (progress < 0.49) {
      // Upright wide-eyed shock + recoil bounce
      const t = (progress - 0.34) / 0.15;
      const snap = smoothstep(0, 0.16, t);
      layerOpacity.deskLifting = 1 - snap;
      layerOpacity.deskSurprised = snap;
      const recoilY = t < 0.45 ? -Math.sin((t / 0.45) * Math.PI) * 0.9 : 0;
      layerShift.deskSurprised = { y: recoilY, origin: '50% 68%' };
      camScale = 1.09 - smoothstep(0, 0.5, t) * 0.03;
    } else if (progress < 0.66) {
      // Crisp anime head turn LEFT!
      const t = (progress - 0.49) / 0.17;
      const snap = smoothstep(0, 0.15, t);
      layerOpacity.deskSurprised = 1 - snap;
      layerOpacity.deskLookLeft = snap;
      const turnRecoilX = t < 0.35 ? -Math.sin((t / 0.35) * Math.PI) * 0.45 : 0;
      layerShift.deskLookLeft = {
        x: turnRecoilX,
        rot: turnRecoilX * 0.8,
        origin: '50% 68%',
      };
      camScale = 1.06;
      camX = 0.6 * smoothstep(0, 0.5, t);
    } else if (progress < 0.85) {
      // Crisp anime head turn RIGHT as bell rings!
      const t = (progress - 0.66) / 0.19;
      const snap = smoothstep(0, 0.14, t);
      layerOpacity.deskLookLeft = 1 - snap;
      layerOpacity.deskLookRight = snap;
      const turnRecoilX = t < 0.35 ? Math.sin((t / 0.35) * Math.PI) * 0.5 : 0;
      layerShift.deskLookRight = {
        x: turnRecoilX,
        rot: turnRecoilX * 0.8,
        origin: '50% 68%',
      };
      camScale = 1.06;
      camX = 0.6 - 1.2 * smoothstep(0, 0.45, t);
    } else {
      // Settle back forward in realization
      const t = (progress - 0.85) / 0.15;
      const snap = smoothstep(0, 0.18, t);
      layerOpacity.deskLookRight = 1 - snap;
      layerOpacity.deskSurprised = snap;
      layerShift.deskSurprised = {
        y: Math.sin(gTime * 2.4) * 0.25,
        origin: '50% 68%',
      };
      camScale = 1.06 - t * 0.02;
      camX = -0.6 * (1 - smoothstep(0, 0.5, t));
    }
  } else if (beat.id === 's4_classroom_exit') {
    const fadeOut = smoothstep(0.86, 1.0, progress);
    layerOpacity.classroomExit = 1 - fadeOut;
    layerOpacity.corridorWalk = fadeOut;
    const strideRhythm = Math.abs(Math.sin(progress * Math.PI * 5)) * 0.45;
    camScale = 1.04 + ease * 0.11;
    camX = 2.2 - ease * 5.6;
    camY = 0.4 * ease + strideRhythm;
  } else if (beat.id === 's4_corridor_walk') {
    // 0.00..0.56: Life-size Nino walking naturally down the corridor ->
    // 0.50..0.60: Portal erupts at corridor end ->
    // 0.58..1.00: Dramatic anime medium-shot cut (nino_corridor_portal_shock) with wind & portal glow!
    const portalOpenT = smoothstep(0.49, 0.59, progress);
    const reactionCutT = smoothstep(0.57, 0.61, progress);

    if (progress < 0.61) {
      layerOpacity.corridorWalk = (1 - portalOpenT) * (1 - reactionCutT);
      layerOpacity.corridorPortal = portalOpenT * (1 - reactionCutT);
      layerOpacity.corridorShock = reactionCutT;

      const walkCamT = smoothstep(0.0, 0.55, progress);
      camScale = 1.04 + smoothstep(0.46, 0.58, progress) * 0.04;
      camX = 2.6 - walkCamT * 4.8;
      camY = 0.3;
    } else {
      layerOpacity.corridorShock = 1;
      const shockP = (progress - 0.61) / 0.39;
      const breezeMicroY = Math.sin(gTime * 7.5) * 0.18;
      camScale = 1.04 + smoothstep(0, 1, shockP) * 0.12;
      camX = -1.2 * smoothstep(0, 1, shockP);
      camY = breezeMicroY;
    }
  } else if (beat.id === 's5_enter_portal') {
    const fadeIntoVortex = smoothstep(0.86, 1.0, progress);
    layerOpacity.portalRearStep = 1 - fadeIntoVortex;
    layerOpacity.enteringPortal = fadeIntoVortex;

    const breathRise = progress < 0.26 ? Math.sin((progress / 0.26) * Math.PI) * -0.55 : 0;
    const stepT = smoothstep(0.24, 1.0, progress);
    const stepBob = stepT > 0 ? Math.abs(Math.sin(stepT * Math.PI * 4)) * 0.55 : 0;
    camScale = 1.04 + stepT * 0.24;
    camY = breathRise + stepBob - stepT * 1.2;
  } else if (beat.id === 's5_inside_portal') {
    layerOpacity.enteringPortal = 1;
    const vortexSurge = smoothstep(0.0, 1.0, progress);
    const windJitterX = Math.sin(gTime * 19) * 0.24;
    const windJitterY = Math.cos(gTime * 23) * 0.24;
    camScale = 1.05 + vortexSurge * 0.28;
    camX = windJitterX;
    camY = windJitterY;
    camRotateDeg = Math.sin(progress * Math.PI * 1.5) * 1.4;
  } else if (beat.id === 's5_title') {
    layerOpacity.prologueFinal = 1;
    const settleP = smoothstep(0.0, 1.0, progress);
    camScale = 1.08 - settleP * 0.06;
    camY = (1 - settleP) * 0.6;
  }

  // === ATMOSPHERIC & TRANSITION OVERLAYS ===
  const sleepDarkness =
    beat.id === 's1_sleep_zoom' && progress > 0.78
      ? smoothstep(0.78, 0.99, progress)
      : 0;

  const dreamRippleFlash =
    beat.id === 's3_wake_up' && progress >= 0.15 && progress <= 0.30
      ? 1 - Math.abs(progress - 0.225) / 0.075
      : 0;

  const corridorPortalFlash =
    beat.id === 's4_corridor_walk' && progress >= 0.49 && progress <= 0.63
      ? (1 - Math.abs(progress - 0.56) / 0.07) * 0.45
      : 0;

  const portalBurstWhiteout =
    beat.id === 's5_inside_portal' && progress > 0.78
      ? smoothstep(0.78, 0.99, progress)
      : beat.id === 's5_title'
      ? 1 - smoothstep(0.0, 0.28, progress)
      : 0;

  // === SCENE 2: GROUND-LOCKED SIDEWALK WALK CHOREOGRAPHY (Unchanged Nino HD Sprite) ===
  let scene2NinoLeft = 22;
  let scene2SpeedRatio = 0;
  let scene2WalkPhase = 0;
  let scene2Mood: SpriteMood = 'neutral';
  let scene2LookX = 0;
  let scene2LookY = -0.15;
  if (beat.id === 's2_dream_walk') {
    if (progress < 0.46) {
      const t = progress / 0.46;
      const accel = smoothstep(0, 0.22, t);
      const decel = 1 - smoothstep(0.74, 1, t);
      scene2SpeedRatio = accel * decel;
      const dist = smoothstep(0, 1, t) * 28;
      scene2NinoLeft = 22 + dist;
      scene2WalkPhase = dist * 0.78;
      scene2Mood = 'curious';
      scene2LookX = 0.35;
    } else if (progress < 0.68) {
      const tPause = (progress - 0.46) / 0.22;
      scene2SpeedRatio = 0;
      scene2NinoLeft = 50;
      scene2WalkPhase = 28 * 0.78;
      scene2Mood = 'curious';
      scene2LookX = Math.sin(tPause * Math.PI * 2) * 0.85;
      scene2LookY = -0.45;
    } else {
      const t2 = (progress - 0.68) / 0.32;
      scene2SpeedRatio = smoothstep(0, 0.26, t2);
      const dist2 = smoothstep(0, 1, t2) * 20;
      scene2NinoLeft = 50 + dist2;
      scene2WalkPhase = (28 + dist2) * 0.78;
      scene2Mood = 'happy';
      scene2LookX = 0.55;
    }
  }
  const scene2SpriteScale = (stageDims.height * 0.285) / 186;

  // === SCENE 4: REALISTIC DOOR-PROPORTIONAL CORRIDOR WALK (56% -> 48% Stage Height) ===
  const showCorridorWalkSprite = beat.id === 's4_corridor_walk' && progress < 0.59;
  const corrWalkMoveT = smoothstep(0.02, 0.52, progress);
  const corrSpeedRatio =
    progress < 0.52
      ? smoothstep(0.02, 0.14, progress) * (1 - smoothstep(0.4, 0.52, progress))
      : 0;
  const corrDist = corrWalkMoveT * 24;
  const corridorNinoLeftPct = 18 + corrDist;
  const corridorNinoBottomPct = 3.5 + corrWalkMoveT * 5.2;
  // Native 320x510 sprite sizing: 56% of stage height near Door XII MIPA 1 (which is 61% tall), tapering naturally to 48%
  const corridorTargetHeightPx = stageDims.height * (0.56 - corrWalkMoveT * 0.08);
  const corridorTargetWidthPx = corridorTargetHeightPx * (320 / 510);
  const corridorWalkPhase = corrDist * 0.85;
  const corridorCycleNorm = (((corridorWalkPhase / (Math.PI * 2)) % 1) + 1) % 1;
  const corridorActiveFrame =
    corrSpeedRatio > 0.05 ? NINO_WALK_CYCLE[Math.floor(corridorCycleNorm * 4) % 4] : 0;
  const corridorStrideBounce =
    corrSpeedRatio > 0.05 ? Math.abs(Math.sin(corridorWalkPhase)) * 3.5 * corrSpeedRatio : 0;
  const corridorBreathScaleY = 1 + Math.sin(gTime * 2.4) * 0.008;
  const corridorPortalMix = smoothstep(0.49, 0.59, progress);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between overflow-hidden select-none">
      {/* === HD 2D ANIME CINEMATIC VIEWPORT === */}
      <div
        ref={viewportRef}
        className="relative flex-1 w-full bg-slate-950 overflow-hidden flex items-center justify-center"
      >
        {/* Exact 16:9 Synchronized Camera & World Stage (Pre-mounted Layers for 0ms Transitions) */}
        <div
          className="relative overflow-hidden shrink-0"
          style={{
            width: `${stageDims.width}px`,
            height: `${stageDims.height}px`,
          }}
        >
          {/* Outer Camera Rig (Transforms Backdrop AND Grounded Actors Together) */}
          <div
            className="absolute inset-0 will-change-transform"
            style={{
              transform: `scale(${camScale.toFixed(4)}) translate3d(${camX.toFixed(2)}%, ${camY.toFixed(2)}%, 0) rotate(${camRotateDeg.toFixed(2)}deg)`,
              transformOrigin: 'center center',
              filter: stageFilter || undefined,
            }}
          >
            {/* All 15 Preloaded Anime Backdrop & Keyframe Layers */}
            {BACKDROP_LAYERS.map((layer) => {
              const opacity = layerOpacity[layer.key];
              if (imgFailedMap[layer.src]) return null;

              const shift = layerShift[layer.key];
              const extraTransform = shift
                ? `translate3d(${(shift.x ?? 0).toFixed(2)}%, ${(shift.y ?? 0).toFixed(2)}%, 0) rotate(${(shift.rot ?? 0).toFixed(2)}deg) scaleY(${(shift.sy ?? 1).toFixed(4)})`
                : undefined;

              return (
                <img
                  key={layer.key}
                  src={layer.src}
                  alt={opacity > 0.4 ? beat.alt : ''}
                  aria-hidden={opacity <= 0.05}
                  loading="eager"
                  decoding="sync"
                  referrerPolicy="no-referrer"
                  onError={() => setImgFailedMap((prev) => ({ ...prev, [layer.src]: true }))}
                  className="absolute inset-0 w-full h-full object-cover will-change-[opacity,transform]"
                  style={{
                    opacity,
                    transform: extraTransform,
                    transformOrigin: shift?.origin || 'center center',
                    pointerEvents: 'none',
                  }}
                />
              );
            })}

            {/* === SCENE 2: NINO GROUNDED DIRECTLY ON SIDEWALK PAVEMENT === */}
            {beat.id === 's2_dream_walk' && (
              <div
                className="absolute z-10 pointer-events-none"
                style={{
                  left: `${scene2NinoLeft.toFixed(2)}%`,
                  bottom: '9.8%',
                  transform: `translateX(-50%) scale(${scene2SpriteScale.toFixed(3)})`,
                  transformOrigin: 'bottom center',
                }}
              >
                <div
                  className="absolute -bottom-1 left-[58%] w-[86px] h-[16px] rounded-full blur-[3.5px]"
                  style={{
                    background:
                      'radial-gradient(ellipse at center, rgba(15,23,42,0.58) 0%, rgba(30,41,59,0.28) 55%, transparent 100%)',
                    transform: 'translateX(-40%) skewX(-34deg)',
                  }}
                  aria-hidden="true"
                />
                <div
                  style={{
                    filter:
                      'brightness(1.02) saturate(1.04) drop-shadow(0 2px 6px rgba(251,191,36,0.22))',
                  }}
                >
                  <AnimeCharacterSprite
                    character="nino"
                    facing="right"
                    isMoving={scene2SpeedRatio > 0.05}
                    speedRatio={scene2SpeedRatio}
                    walkPhase={scene2WalkPhase}
                    mood={scene2Mood}
                    eyeLookX={scene2LookX}
                    eyeLookY={scene2LookY}
                    strictGround
                    disableIdleQuirk
                    animTime={gTime}
                  />
                </div>
              </div>
            )}

            {/* === SCENE 4A: REALISTIC LIFE-SIZE NATIVE 320x510 NINO WALKING DOWN SUNSET CORRIDOR === */}
            {showCorridorWalkSprite && (
              <div
                className="absolute z-10 pointer-events-none"
                style={{
                  left: `${corridorNinoLeftPct.toFixed(2)}%`,
                  bottom: `${corridorNinoBottomPct.toFixed(2)}%`,
                  width: `${corridorTargetWidthPx.toFixed(1)}px`,
                  height: `${corridorTargetHeightPx.toFixed(1)}px`,
                  transform: `translate3d(-50%, ${(-corridorStrideBounce).toFixed(2)}px, 0) scaleY(${corridorBreathScaleY.toFixed(4)})`,
                  transformOrigin: 'bottom center',
                  opacity: 1 - smoothstep(0.56, 0.59, progress),
                }}
              >
                {/* Polished Corridor Floor Reflection Under Nino's Shoes */}
                <div
                  className="absolute bottom-[-24%] left-1/2 -translate-x-1/2 pointer-events-none overflow-hidden"
                  style={{
                    width: '100%',
                    height: '28%',
                    opacity: 0.24 + corridorPortalMix * 0.14,
                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)',
                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)',
                    filter: 'blur(1.8px)',
                  }}
                  aria-hidden="true"
                >
                  <img
                    src={NINO_WALK_FRAMES[corridorActiveFrame]}
                    alt=""
                    draggable={false}
                    className="w-full h-auto object-contain object-top"
                    style={{
                      transform: 'scaleY(-0.34)',
                      transformOrigin: 'top center',
                    }}
                  />
                </div>

                {/* Directional Warm Sunset / Cool Portal Contact Shadow */}
                <div
                  className="absolute -bottom-1.5 left-1/2 rounded-full blur-[5px]"
                  style={{
                    width: '62%',
                    height: '6%',
                    background:
                      corridorPortalMix > 0.3
                        ? 'radial-gradient(ellipse at center, rgba(15,23,42,0.72) 0%, rgba(56,189,248,0.24) 60%, transparent 100%)'
                        : 'radial-gradient(ellipse at center, rgba(30,20,10,0.62) 0%, rgba(120,53,15,0.22) 60%, transparent 100%)',
                    transform: `translateX(${corridorPortalMix > 0.4 ? '-62%' : '-38%'}) skewX(${corridorPortalMix > 0.4 ? '28deg' : '-32deg'})`,
                  }}
                  aria-hidden="true"
                />

                {/* Native High-Res 320x510 Nino Walk Frame Stack */}
                <div
                  className="relative w-full h-full"
                  style={{
                    filter:
                      corridorPortalMix > 0.2
                        ? `brightness(${(0.95 - corridorPortalMix * 0.04).toFixed(2)}) drop-shadow(${(corridorPortalMix * 5).toFixed(1)}px 0 ${(corridorPortalMix * 16).toFixed(1)}px rgba(56,189,248,0.6))`
                        : 'sepia(0.07) saturate(1.06) brightness(0.95) drop-shadow(-4px 3px 10px rgba(245,158,11,0.24))',
                  }}
                >
                  {NINO_WALK_FRAMES.map((src, idx) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      aria-hidden="true"
                      draggable={false}
                      className="absolute inset-0 w-full h-full object-contain object-bottom select-none pointer-events-none"
                      style={{
                        opacity: corridorActiveFrame === idx ? 1 : 0,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Scene 3 Anime Impact / Shock Speed Lines on Abrupt Wake-Up */}
            {showWakeShockLines && wakeShockAlpha > 0 && (
              <div
                className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
                style={{ opacity: wakeShockAlpha * 0.55 }}
                aria-hidden="true"
              >
                {ANIME_RADIAL_STREAKS.map((s) => (
                  <span
                    key={s.id}
                    className="absolute left-1/2 top-[44%] bg-white/85 rounded-full"
                    style={{
                      width: `${s.widthPx}px`,
                      height: `${s.lengthPct}%`,
                      transformOrigin: 'center 220%',
                      transform: `translate(-50%, -180%) rotate(${s.angleDeg}deg)`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Scene 3 Anime Surprise Spark */}
            {beat.id === 's3_wake_up' && progress >= 0.34 && progress < 0.72 && (
              <div
                className="absolute top-[16%] left-[59%] z-20 pointer-events-none font-display font-bold text-2xl sm:text-4xl text-amber-300 drop-shadow-[0_3px_12px_rgba(245,158,11,0.9)]"
                style={{
                  transform: `scale(${(0.95 + Math.sin(gTime * 12) * 0.08).toFixed(3)})`,
                }}
              >
                ?!
              </div>
            )}

            {/* Scene 4B Anime Surprise Spark when Portal Tears Open */}
            {beat.id === 's4_corridor_walk' && progress >= 0.58 && progress < 0.88 && (
              <div
                className="absolute top-[22%] left-[44%] z-20 pointer-events-none font-display font-bold text-2xl sm:text-3xl text-sky-200 drop-shadow-[0_3px_12px_rgba(56,189,248,0.95)]"
                style={{
                  transform: `scale(${(0.95 + Math.sin(gTime * 11) * 0.07).toFixed(3)})`,
                }}
              >
                !?
              </div>
            )}

            {/* Scene 5A: Spinning Portal Light Rings Behind Nino's Silhouette */}
            {beat.id === 's5_enter_portal' && (
              <div
                className="absolute inset-0 pointer-events-none z-10 mix-blend-screen"
                aria-hidden="true"
              >
                <div
                  className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: stageDims.width * 0.62,
                    height: stageDims.width * 0.62,
                    background:
                      'conic-gradient(from 0deg, transparent 0deg, rgba(56,189,248,0.22) 40deg, transparent 90deg, rgba(192,132,252,0.2) 170deg, transparent 230deg, rgba(253,224,71,0.18) 300deg, transparent 360deg)',
                    transform: `rotate(${(gTime * 75) % 360}deg) scale(${(0.95 + progress * 0.14).toFixed(3)})`,
                    opacity: 0.55 + progress * 0.35,
                  }}
                />
              </div>
            )}

            {/* Scene 5B: Animated Luminous Energy Rings Inside Portal Vortex */}
            {beat.id === 's5_inside_portal' && (
              <div
                className="absolute inset-0 pointer-events-none z-10 mix-blend-screen"
                aria-hidden="true"
              >
                <div
                  className="absolute left-[62%] top-[48%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: stageDims.width * 0.72,
                    height: stageDims.width * 0.72,
                    background:
                      'conic-gradient(from 0deg, transparent 0deg, rgba(56,189,248,0.28) 45deg, transparent 95deg, rgba(192,132,252,0.26) 170deg, transparent 230deg, rgba(253,224,71,0.22) 300deg, transparent 360deg)',
                    transform: `rotate(${(gTime * 95) % 360}deg) scale(${(1 + Math.sin(gTime * 4) * 0.04).toFixed(3)})`,
                  }}
                />
                <div
                  className="absolute left-[62%] top-[48%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl"
                  style={{
                    width: stageDims.width * 0.34,
                    height: stageDims.width * 0.34,
                    background:
                      'radial-gradient(circle, rgba(255,255,255,0.65) 0%, rgba(125,211,252,0.35) 50%, transparent 100%)',
                    opacity: 0.45 + progress * 0.45,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Measured Contrast Scrim */}
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/35 z-10"
          aria-hidden="true"
        />

        {/* Subtle Cinema Letterbox Bars */}
        <div className="hidden md:block absolute top-0 inset-x-0 h-5 bg-black/90 pointer-events-none z-20" />
        <div className="hidden md:block absolute bottom-0 inset-x-0 h-5 bg-black/90 pointer-events-none z-20" />

        {/* Atmospheric Dust Motes & Magical Portal Particles */}
        {beat.id !== 's5_title' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20" aria-hidden="true">
            {PARTICLES.map((p) => {
              const isEnergy =
                beat.id === 's4_corridor_walk' ||
                beat.id === 's5_enter_portal' ||
                beat.id === 's5_inside_portal';
              const driftY = Math.sin(gTime * p.speed + p.phase) * (isEnergy ? 18 : 12);
              const driftX = isEnergy
                ? Math.cos(gTime * p.speed * 1.4 + p.phase) * 28
                : Math.cos(gTime * 0.5 + p.phase) * 8;
              return (
                <span
                  key={p.id}
                  className="absolute rounded-full"
                  style={{
                    left: `${p.left}%`,
                    top: `${p.top}%`,
                    width: `${p.size * (isEnergy ? 1.45 : 1)}px`,
                    height: `${p.size * (isEnergy ? 1.45 : 1)}px`,
                    backgroundColor: isEnergy
                      ? p.id % 3 === 0
                        ? 'rgba(56, 189, 248, 0.82)'
                        : p.id % 3 === 1
                        ? 'rgba(192, 132, 252, 0.78)'
                        : 'rgba(253, 224, 71, 0.82)'
                      : 'rgba(254, 240, 138, 0.5)',
                    transform: `translate3d(${driftX}px, ${driftY}px, 0)`,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Scene 3: School Bell Ringing Banner */}
        {bellRinging && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-semibold text-xs sm:text-sm shadow-lg flex items-center gap-2 whitespace-nowrap">
            <Bell className="w-4 h-4 shrink-0" />
            <span>Kringgg! Bel Pulang Sekolah Berbunyi</span>
          </div>
        )}

        {/* Scene 3 Soft Dream Distortion Flash */}
        {dreamRippleFlash > 0 && (
          <div
            className="absolute inset-0 pointer-events-none z-30 bg-sky-200 mix-blend-screen"
            style={{ opacity: dreamRippleFlash * 0.6 }}
          />
        )}

        {/* Scene 4 Portal Materialization Light Flare */}
        {corridorPortalFlash > 0 && (
          <div
            className="absolute inset-0 pointer-events-none z-30 bg-cyan-200 mix-blend-screen"
            style={{ opacity: corridorPortalFlash }}
          />
        )}

        {/* Scene 1 Sleep Fade-to-Black Overlay */}
        {sleepDarkness > 0 && (
          <div
            className="absolute inset-0 pointer-events-none z-30 bg-slate-950"
            style={{ opacity: sleepDarkness }}
          />
        )}

        {/* Scene 5 Whiteout Light Burst Bridging Portal Into Key-Art Reveal */}
        {portalBurstWhiteout > 0 && (
          <div
            className="absolute inset-0 pointer-events-none z-30 bg-white"
            style={{ opacity: portalBurstWhiteout }}
          />
        )}

        {/* Top-Right Cinema Controls */}
        <div className="absolute top-7 right-4 z-40 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundEngine.unlock();
              soundEngine.playSfx('click');
              setAutoPlay((v) => !v);
            }}
            className="px-3.5 py-2 rounded-lg bg-slate-950/85 hover:bg-slate-900 border border-white/15 text-xs font-medium text-slate-100 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            {autoPlay ? (
              <>
                <Pause className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                <span>Jeda</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                <span>Putar</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.unlock();
              soundEngine.playSfx('portal');
              onComplete();
            }}
            className="px-3.5 py-2 rounded-lg bg-slate-950/85 hover:bg-slate-900 border border-white/15 text-xs font-medium text-slate-100 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <FastForward className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>Lewati Prolog</span>
          </button>
        </div>
      </div>

      {/* === SUBTITLE & SCENE NARRATION BAR === */}
      <div className="relative z-40 bg-slate-950 border-t border-white/15 px-4 py-4">
        <div className="max-w-4xl mx-auto space-y-2.5">
          <div className="h-1 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-sky-400 transition-all duration-100"
              style={{ width: `${autoPlay ? progressPct : 100}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-4 text-xs text-slate-400">
            <span className="font-medium text-amber-300 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 shrink-0" />
              <span>{beat.sceneLabel}</span>
            </span>
            <span className="font-mono tabular-nums">
              {beatIdx + 1} / {ANIME_BEATS.length}
            </span>
          </div>

          <div className="rounded-xl bg-slate-900 border border-white/10 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-display text-sm font-bold text-red-300">{beat.speaker}</p>
              <p className="text-sm text-slate-100 leading-relaxed">{beat.text}</p>
            </div>

            <button
              type="button"
              onClick={advanceBeat}
              className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>{beatIdx + 1 < ANIME_BEATS.length ? 'Lanjutkan' : 'Mulai Gameplay'}</span>
              <ChevronRight className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
