import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronRight,
  Compass,
  FastForward,
  Home,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';
import { ASSETS } from '../data/gameData';

interface EndingCutsceneModalProps {
  discoveredCount: number;
  unlockedKeysCount?: number;
  onExploreGoldenCity: () => void;
  onMainMenu: () => void;
  onRestart: () => void;
}

type ReturnBeatId =
  | 'ec_restored_city'
  | 'ec_farewell_trio'
  | 'ec_step_into_portal'
  | 'ec_vortex_return'
  | 'ec_arrive_real_world'
  | 'ec_epilogue_finale';

interface ReturnBeat {
  id: ReturnBeatId;
  sceneLabel: string;
  speaker: string;
  speakerColor: string;
  text: string;
  durationSec: number;
  alt: string;
}

const RETURN_BEATS: ReturnBeat[] = [
  {
    id: 'ec_restored_city',
    sceneLabel: 'Babak Akhir · Neo-Metropolis Kembali Pulih',
    speaker: 'Narasi',
    speakerColor: 'text-amber-300',
    text: 'Langit Neo-Metropolis bermandikan cahaya senja keemasan. Sanggar Darmoyudho kembali hidup oleh alunan gamelan, warung pelabuhan Mba Sari ramai oleh obrolan hangat warga, dan layar kota kini berimbang.',
    durationSec: 5.2,
    alt: 'Kota Neo-Metropolis yang telah pulih dengan Sanggar Darmoyudho dan warga bercengkerama di bawah langit keemasan',
  },
  {
    id: 'ec_farewell_trio',
    sceneLabel: 'Babak Akhir · Di Hadapan Portal Pulang',
    speaker: 'Dira & Ilyas',
    speakerColor: 'text-sky-300',
    text: 'Ilyas: "Frekuensi Portal Pulang sudah terbuka utuh, Nino!" — Dira: "Kita berhasil membuktikan bahwa teknologi modern dan budaya lokal bisa hidup berdampingan dengan harmonis."',
    durationSec: 5.0,
    alt: 'Dira, Ilyas, dan Nino berseragam batik biru langit berdiri di depan Portal Pulang Neo-Metropolis',
  },
  {
    id: 'ec_step_into_portal',
    sceneLabel: 'Babak Akhir · Tarikan Pusaran Portal Pulang',
    speaker: 'Narasi',
    speakerColor: 'text-cyan-300',
    text: 'Angin dimensi berhembus kencang menggoyangkan kemeja batik mereka! Sambil menggenggam tangan satu sama lain, Dira, Ilyas, dan Nino melangkah menembus pusaran cahaya emas-biru Portal Pulang.',
    durationSec: 5.4,
    alt: 'Dira, Ilyas, dan Nino bergandengan tangan melangkah masuk ke pusaran portal dimensi emas-biru yang dramatis',
  },
  {
    id: 'ec_vortex_return',
    sceneLabel: 'Transisi Dimensi · Terowongan Cahaya Pulang',
    speaker: 'Nino',
    speakerColor: 'text-red-300',
    text: '"Pegangan yang erat, Yas, Dir! Pusaran cahayanya makin cepat—cahaya dunia kita sudah terlihat di ujung terowongan!"',
    durationSec: 5.4,
    alt: 'Nino, Ilyas, dan Dira meluncur bersama menembus terowongan dimensi cahaya emas-biru menuju dunia nyata',
  },
  {
    id: 'ec_arrive_real_world',
    sceneLabel: 'Epilog · Kembali ke Dunia Nyata',
    speaker: 'Ilyas & Dira',
    speakerColor: 'text-emerald-300',
    text: 'Cahaya hangat sore menyapu halaman sekolah SMA mereka. Begitu kilau portal perlahan memudar di belakang mereka, ketiganya saling tersenyum lega—akhirnya mereka benar-benar pulang!',
    durationSec: 5.2,
    alt: 'Dira, Ilyas, dan Nino berdiri selamat kembali di sekolah SMA yang disinari matahari sore',
  },
  {
    id: 'ec_epilogue_finale',
    sceneLabel: 'Epilog · Harmoni Budaya & Literasi Digital',
    speaker: 'Adnan Naurel Elnino (Nino)',
    speakerColor: 'text-amber-200',
    text: '"Budaya lokal dan teknologi modern tidak harus bermusuhan—asal kita sadar, kritis memilih informasi, dan tetap menjaga hubungan nyata satu sama lain. Terima kasih sudah berpetualang bersama kami!"',
    durationSec: 6.0,
    alt: 'Dira, Ilyas, dan Nino tersenyum bersama di sekolah dunia nyata',
  },
];

const RETURN_BACKDROP_LAYERS = [
  { key: 'cityRestored', src: ASSETS.returnCityRestored },
  { key: 'portalEnter', src: ASSETS.returnPortalEnterTrio },
  { key: 'portalVortex', src: ASSETS.returnPortalVortexTrio },
  { key: 'realWorld', src: ASSETS.returnRealWorldCorridor },
] as const;

type ReturnLayerKey = (typeof RETURN_BACKDROP_LAYERS)[number]['key'];

const PARTICLES = Array.from({ length: 34 }, (_, idx) => ({
  id: idx,
  left: ((idx * 37 + 9) % 94) + 3,
  top: ((idx * 53 + 11) % 86) + 6,
  size: (idx % 3) + 2,
  phase: idx * 0.68,
  speed: 0.65 + (idx % 4) * 0.22,
}));

const PORTAL_SPEED_STREAKS = Array.from({ length: 24 }, (_, idx) => ({
  id: idx,
  angleDeg: idx * 15,
  widthPx: idx % 3 === 0 ? 3 : 1.8,
  lengthPct: 24 + (idx % 4) * 6,
}));

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

export const EndingCutsceneModal: React.FC<EndingCutsceneModalProps> = ({
  discoveredCount,
  unlockedKeysCount = 4,
  onExploreGoldenCity,
  onMainMenu,
  onRestart,
}) => {
  const [beatIdx, setBeatIdx] = useState(0);
  const [beatElapsed, setBeatElapsed] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [imgFailedMap, setImgFailedMap] = useState<Record<string, boolean>>({});

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 1280, height: 720 });

  const timerRef = useRef({
    beatIdx: 0,
    beatElapsed: 0,
    autoPlay: true,
    globalTime: 0,
  });

  // Preload & decode all 4 realistic anime return keyframes for zero-flicker transitions
  useEffect(() => {
    RETURN_BACKDROP_LAYERS.forEach(({ src }) => {
      const img = new Image();
      img.decoding = 'sync';
      img.src = src;
      if (typeof img.decode === 'function') {
        img.decode().catch(() => {});
      }
    });
  }, []);

  // Measure viewport to maintain exact 16:9 unified world/camera proportions
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

  const beat = RETURN_BEATS[beatIdx];
  const isFinalBeat = beatIdx >= RETURN_BEATS.length - 1;
  const progress = clamp01(beatElapsed / beat.durationSec);
  const progressPct = Math.round(progress * 100);

  // Beat sound effects synced to portal entry, dimensional travel, and real-world return
  useEffect(() => {
    timerRef.current.beatIdx = beatIdx;
    timerRef.current.beatElapsed = 0;
    setBeatElapsed(0);
    soundEngine.startMusic('ending');

    if (beat.id === 'ec_step_into_portal') {
      soundEngine.playSfx('portal');
      const windTimer = window.setTimeout(() => {
        soundEngine.playSfx('wind');
      }, 950);
      return () => window.clearTimeout(windTimer);
    } else if (beat.id === 'ec_vortex_return') {
      soundEngine.playSfx('wind');
      const burstTimer = window.setTimeout(() => {
        soundEngine.playSfx('portal');
      }, 2200);
      return () => window.clearTimeout(burstTimer);
    } else if (beat.id === 'ec_arrive_real_world') {
      soundEngine.playSfx('clue');
    } else if (beat.id === 'ec_epilogue_finale') {
      soundEngine.playSfx('correct');
    }
  }, [beat.id]);

  useEffect(() => {
    timerRef.current.autoPlay = autoPlay;
  }, [autoPlay]);

  // 60fps synchronized animation & beat progression loop
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;
      timerRef.current.globalTime += dt;

      const idx = timerRef.current.beatIdx;
      const curBeat = RETURN_BEATS[idx];
      let nextElapsed = timerRef.current.beatElapsed;

      if (timerRef.current.autoPlay && idx < RETURN_BEATS.length - 1) {
        nextElapsed += dt;
        if (nextElapsed >= curBeat.durationSec) {
          timerRef.current.beatIdx = idx + 1;
          timerRef.current.beatElapsed = 0;
          setBeatIdx(idx + 1);
          setBeatElapsed(0);
        } else {
          timerRef.current.beatElapsed = nextElapsed;
          setBeatElapsed(nextElapsed);
        }
      } else {
        // Keep epilogue finale gently breathing while letting user choose next action
        nextElapsed = Math.min(curBeat.durationSec, nextElapsed + dt);
        timerRef.current.beatElapsed = nextElapsed;
        setBeatElapsed(nextElapsed);
      }

      rafId = window.requestAnimationFrame(frame);
    };

    rafId = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const advanceBeat = () => {
    soundEngine.unlock();
    soundEngine.playSfx('click');
    if (beatIdx + 1 < RETURN_BEATS.length) {
      setBeatIdx((i) => i + 1);
    }
  };

  const skipToEpilogue = () => {
    soundEngine.unlock();
    soundEngine.playSfx('portal');
    const lastIdx = RETURN_BEATS.length - 1;
    setBeatIdx(lastIdx);
    setBeatElapsed(RETURN_BEATS[lastIdx].durationSec);
  };

  const replayCutscene = () => {
    soundEngine.unlock();
    soundEngine.playSfx('click');
    setAutoPlay(true);
    setBeatIdx(0);
    setBeatElapsed(0);
  };

  const gTime = timerRef.current.globalTime;

  // === LAYER OPACITY MIXING FOR SEAMLESS CROSSFADES ===
  const layerOpacity: Record<ReturnLayerKey, number> = {
    cityRestored:
      beat.id === 'ec_restored_city' || beat.id === 'ec_farewell_trio'
        ? 1
        : beat.id === 'ec_step_into_portal'
        ? 1 - smoothstep(0.0, 0.24, progress)
        : 0,
    portalEnter:
      beat.id === 'ec_step_into_portal'
        ? smoothstep(0.0, 0.24, progress)
        : beat.id === 'ec_vortex_return'
        ? 1 - smoothstep(0.0, 0.22, progress)
        : 0,
    portalVortex:
      beat.id === 'ec_vortex_return' ? smoothstep(0.0, 0.22, progress) : 0,
    realWorld:
      beat.id === 'ec_arrive_real_world' || beat.id === 'ec_epilogue_finale' ? 1 : 0,
  };

  // === UNIFIED CINEMA CAMERA RIG (Dramatic Suction Pull, Shake & Gentle Tilt) ===
  let camScale = 1.02;
  let camX = 0;
  let camY = 0;
  let camRotateDeg = 0;

  if (beat.id === 'ec_restored_city') {
    const p = smoothstep(0, 1, progress);
    camScale = 1.08 - 0.06 * p;
    camX = 1.6 - 2.0 * p;
    camY = -0.5 + 0.5 * p;
  } else if (beat.id === 'ec_farewell_trio') {
    const p = smoothstep(0, 1, progress);
    camScale = 1.03 + 0.10 * p;
    camX = -0.6 - 1.4 * p;
    camY = -0.3 - 0.6 * p;
  } else if (beat.id === 'ec_step_into_portal') {
    const p = smoothstep(0, 1, progress);
    const tremor = Math.sin(gTime * 22) * (0.18 + p * 0.28);
    camScale = 1.02 + 0.24 * p;
    camX = tremor;
    camY = -0.8 * p + Math.cos(gTime * 19) * (0.14 + p * 0.2);
    camRotateDeg = Math.sin(p * Math.PI) * 1.1;
  } else if (beat.id === 'ec_vortex_return') {
    const p = smoothstep(0, 1, progress);
    camScale = 1.04 + 0.26 * p;
    camX = Math.sin(gTime * 3.1) * (0.7 + p * 0.6);
    camY = Math.cos(gTime * 2.7) * (0.6 + p * 0.5);
    camRotateDeg = Math.sin(gTime * 1.9) * 1.8;
  } else if (beat.id === 'ec_arrive_real_world') {
    const p = smoothstep(0, 1, progress);
    camScale = 1.10 - 0.07 * p;
    camX = -0.8 + 0.8 * p;
    camY = 0.4 * (1 - p);
  } else if (beat.id === 'ec_epilogue_finale') {
    camScale = 1.03 + Math.sin(gTime * 0.45) * 0.01;
    camX = Math.sin(gTime * 0.32) * 0.5;
    camY = -0.3;
  }

  // Intense mid-entry cyan-gold energy surge & final return whiteout
  const entrySurgeFlash =
    beat.id === 'ec_step_into_portal'
      ? smoothstep(0.76, 1.0, progress) * 0.52
      : beat.id === 'ec_vortex_return'
      ? (1 - smoothstep(0.0, 0.22, progress)) * 0.48
      : 0;

  const vortexWhiteout =
    beat.id === 'ec_vortex_return'
      ? smoothstep(0.72, 1.0, progress)
      : beat.id === 'ec_arrive_real_world'
      ? 1 - smoothstep(0.0, 0.32, progress)
      : 0;

  const showCityPortalShimmer =
    beat.id === 'ec_restored_city' || beat.id === 'ec_farewell_trio';
  const showEnterPortalRing = beat.id === 'ec_step_into_portal';
  const showVortexRings = beat.id === 'ec_vortex_return';
  const showClosingPortalShimmer = beat.id === 'ec_arrive_real_world' && progress < 0.88;
  const isDramaticPortalBeat = showEnterPortalRing || showVortexRings;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between overflow-hidden select-none">
      {/* === HD 2D REALISTIC ANIME CINEMATIC STAGE === */}
      <div
        ref={viewportRef}
        className="relative flex-1 w-full bg-slate-950 overflow-hidden flex items-center justify-center"
      >
        <div
          className="relative overflow-hidden shrink-0"
          style={{
            width: `${stageDims.width}px`,
            height: `${stageDims.height}px`,
          }}
        >
          {/* Outer Synchronized Camera Rig (Transforms Anime Scene + Portal Energy Together) */}
          <div
            className="absolute inset-0 will-change-transform"
            style={{
              transform: `scale(${camScale.toFixed(4)}) translate3d(${camX.toFixed(
                2
              )}%, ${camY.toFixed(2)}%, 0) rotate(${camRotateDeg.toFixed(2)}deg)`,
              transformOrigin: 'center center',
            }}
          >
            {RETURN_BACKDROP_LAYERS.map((layer) => {
              const opacity = layerOpacity[layer.key];
              if (imgFailedMap[layer.src]) return null;
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
                  className="absolute inset-0 w-full h-full object-cover will-change-[opacity]"
                  style={{
                    opacity,
                    pointerEvents: 'none',
                  }}
                />
              );
            })}

            {/* Unified Portal Aura in Restored Neo-Metropolis (Matches Left-Center Portal Position) */}
            {showCityPortalShimmer && (
              <div
                className="absolute inset-0 pointer-events-none mix-blend-screen"
                aria-hidden="true"
              >
                <div
                  className="absolute left-[31%] top-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: stageDims.width * 0.32,
                    height: stageDims.width * 0.42,
                    background:
                      'conic-gradient(from 0deg, transparent 0deg, rgba(253,224,71,0.3) 45deg, transparent 105deg, rgba(56,189,248,0.34) 185deg, transparent 255deg, rgba(251,191,36,0.24) 320deg, transparent 360deg)',
                    transform: `rotate(${(gTime * 64) % 360}deg) scale(${(
                      1 +
                      Math.sin(gTime * 2.8) * 0.05
                    ).toFixed(3)})`,
                    opacity: 0.72,
                  }}
                />
              </div>
            )}

            {/* DRAMATIC COUNTER-ROTATING VORTEX RINGS & SPEED STREAKS AS TRIO ENTERS PORTAL */}
            {showEnterPortalRing && (
              <div
                className="absolute inset-0 pointer-events-none mix-blend-screen"
                aria-hidden="true"
              >
                <div
                  className="absolute left-[50%] top-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: stageDims.width * 0.72,
                    height: stageDims.width * 0.72,
                    background:
                      'conic-gradient(from 0deg, transparent 0deg, rgba(253,224,71,0.42) 38deg, transparent 88deg, rgba(56,189,248,0.45) 165deg, transparent 220deg, rgba(251,191,36,0.36) 295deg, transparent 360deg)',
                    transform: `rotate(${(gTime * 150) % 360}deg) scale(${(
                      0.96 +
                      progress * 0.2
                    ).toFixed(3)})`,
                    opacity: 0.65 + progress * 0.35,
                  }}
                />
                <div
                  className="absolute left-[50%] top-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: stageDims.width * 0.54,
                    height: stageDims.width * 0.54,
                    background:
                      'conic-gradient(from 120deg, transparent 0deg, rgba(103,232,249,0.4) 50deg, transparent 115deg, rgba(254,240,138,0.38) 210deg, transparent 285deg, transparent 360deg)',
                    transform: `rotate(${-((gTime * 115) % 360)}deg) scale(${(
                      1.04 -
                      progress * 0.14
                    ).toFixed(3)})`,
                    opacity: 0.55 + progress * 0.4,
                  }}
                />
                <div
                  className="absolute left-[50%] top-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
                  style={{
                    width: stageDims.width * 0.34,
                    height: stageDims.width * 0.34,
                    background:
                      'radial-gradient(circle, rgba(255,255,255,0.72) 0%, rgba(254,240,138,0.45) 38%, rgba(56,189,248,0.28) 65%, transparent 100%)',
                    opacity: 0.45 + progress * 0.5,
                  }}
                />
              </div>
            )}

            {/* Concentric Golden-Cyan Tunnel Swirl Inside Dimensional Return */}
            {showVortexRings && (
              <div
                className="absolute inset-0 pointer-events-none mix-blend-screen"
                aria-hidden="true"
              >
                <div
                  className="absolute left-[49%] top-[48%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    width: stageDims.width * 0.92,
                    height: stageDims.width * 0.92,
                    background:
                      'conic-gradient(from 0deg, transparent 0deg, rgba(253,224,71,0.38) 42deg, transparent 92deg, rgba(56,189,248,0.42) 172deg, transparent 235deg, rgba(251,191,36,0.36) 305deg, transparent 360deg)',
                    transform: `rotate(${(gTime * 175) % 360}deg) scale(${(
                      1 +
                      Math.sin(gTime * 4.5) * 0.06
                    ).toFixed(3)})`,
                  }}
                />
                <div
                  className="absolute left-[49%] top-[48%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
                  style={{
                    width: stageDims.width * 0.42,
                    height: stageDims.width * 0.42,
                    background:
                      'radial-gradient(circle, rgba(255,255,255,0.82) 0%, rgba(253,224,71,0.42) 55%, transparent 100%)',
                    opacity: 0.52 + progress * 0.48,
                  }}
                />
              </div>
            )}

            {/* Dissolving Closing Portal Shimmer Behind Trio in School Courtyard */}
            {showClosingPortalShimmer && (
              <div
                className="absolute inset-0 pointer-events-none mix-blend-screen"
                style={{ opacity: (1 - smoothstep(0.22, 0.88, progress)) * 0.78 }}
                aria-hidden="true"
              >
                <div
                  className="absolute left-[48%] top-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-xl"
                  style={{
                    width: stageDims.width * 0.28,
                    height: stageDims.width * 0.36,
                    background:
                      'radial-gradient(circle, rgba(253,224,71,0.55) 0%, rgba(56,189,248,0.32) 55%, transparent 100%)',
                    transform: `scale(${(1 - progress * 0.25).toFixed(3)})`,
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Dramatic Radial Speed Lines & Edge Dimensional Vignette During Portal Suction */}
        {isDramaticPortalBeat && (
          <div
            className="absolute inset-0 pointer-events-none z-20 overflow-hidden"
            style={{
              opacity: showEnterPortalRing ? 0.4 + progress * 0.5 : 0.72,
            }}
            aria-hidden="true"
          >
            {PORTAL_SPEED_STREAKS.map((s) => {
              const pulse = ((gTime * 1.8 + s.id * 0.13) % 1);
              return (
                <span
                  key={s.id}
                  className="absolute left-1/2 top-[48%] rounded-full"
                  style={{
                    width: `${s.widthPx}px`,
                    height: `${s.lengthPct}%`,
                    background:
                      s.id % 2 === 0
                        ? 'linear-gradient(180deg, rgba(125,211,252,0.9), transparent)'
                        : 'linear-gradient(180deg, rgba(253,224,71,0.9), transparent)',
                    transformOrigin: 'center 185%',
                    transform: `translate(-50%, -185%) rotate(${s.angleDeg}deg) scaleY(${(
                      0.8 +
                      pulse * 0.65
                    ).toFixed(2)})`,
                    opacity: 0.45 + pulse * 0.55,
                  }}
                />
              );
            })}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 50% 48%, transparent 38%, rgba(8,47,73,0.48) 78%, rgba(2,6,23,0.8) 100%)',
              }}
            />
          </div>
        )}

        {/* Contrast Scrim & Subtle Cinema Letterbox Bars */}
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/75 via-transparent to-slate-950/35 z-10"
          aria-hidden="true"
        />
        <div className="hidden md:block absolute top-0 inset-x-0 h-5 bg-black/90 pointer-events-none z-20" />
        <div className="hidden md:block absolute bottom-0 inset-x-0 h-5 bg-black/90 pointer-events-none z-20" />

        {/* Atmospheric Golden Sunset Motes & Dimensional Portal Sparks */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden z-20"
          aria-hidden="true"
        >
          {PARTICLES.map((p) => {
            const isPortalActive =
              beat.id === 'ec_step_into_portal' || beat.id === 'ec_vortex_return';
            const driftY = Math.sin(gTime * p.speed + p.phase) * (isPortalActive ? 24 : 11);
            const driftX = isPortalActive
              ? Math.cos(gTime * p.speed * 1.6 + p.phase) * 32
              : Math.cos(gTime * 0.45 + p.phase) * 8;
            return (
              <span
                key={p.id}
                className="absolute rounded-full"
                style={{
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  width: `${p.size * (isPortalActive ? 1.55 : 1)}px`,
                  height: `${p.size * (isPortalActive ? 1.55 : 1)}px`,
                  backgroundColor: isPortalActive
                    ? p.id % 2 === 0
                      ? 'rgba(56, 189, 248, 0.9)'
                      : 'rgba(253, 224, 71, 0.9)'
                    : 'rgba(254, 240, 138, 0.52)',
                  transform: `translate3d(${driftX}px, ${driftY}px, 0)`,
                }}
              />
            );
          })}
        </div>

        {/* Cyan-Gold Energy Surge Between Stepping In & Vortex Travel */}
        {entrySurgeFlash > 0 && (
          <div
            className="absolute inset-0 pointer-events-none z-30 mix-blend-screen"
            style={{
              opacity: entrySurgeFlash,
              background:
                'radial-gradient(circle at 50% 48%, rgba(254,240,138,0.9) 0%, rgba(56,189,248,0.65) 55%, transparent 100%)',
            }}
            aria-hidden="true"
          />
        )}

        {/* Luminous Portal Whiteout Transition Overlay */}
        {vortexWhiteout > 0 && (
          <div
            className="absolute inset-0 pointer-events-none z-30"
            style={{
              opacity: vortexWhiteout,
              background:
                'radial-gradient(circle at 50% 48%, rgba(255,255,255,0.98) 0%, rgba(254,243,199,0.95) 65%, rgba(224,242,254,0.92) 100%)',
            }}
            aria-hidden="true"
          />
        )}

        {/* Top-Right Cinema Controls */}
        <div className="absolute top-7 right-4 z-40 flex items-center gap-2">
          {!isFinalBeat ? (
            <>
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
                onClick={skipToEpilogue}
                className="px-3.5 py-2 rounded-lg bg-slate-950/85 hover:bg-slate-900 border border-white/15 text-xs font-medium text-slate-100 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <FastForward className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Lewati Cutscene</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={replayCutscene}
              className="px-3.5 py-2 rounded-lg bg-slate-950/85 hover:bg-slate-900 border border-white/15 text-xs font-medium text-slate-100 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Putar Ulang Cutscene</span>
            </button>
          )}
        </div>
      </div>

      {/* === CINEMA NARRATION & POST-CUTSCENE ACTION BAR === */}
      <div className="relative z-40 bg-slate-950 border-t border-white/15 px-4 py-4">
        <div className="max-w-4xl mx-auto space-y-2.5">
          <div className="h-1 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-sky-400 transition-all duration-100"
              style={{ width: `${isFinalBeat || !autoPlay ? 100 : progressPct}%` }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <span className="font-medium text-amber-300 flex items-center gap-1.5">
              {isFinalBeat ? (
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{beat.sceneLabel}</span>
            </span>
            <span className="font-mono tabular-nums">
              {beatIdx + 1} / {RETURN_BEATS.length} · {discoveredCount} Petunjuk ·{' '}
              {unlockedKeysCount}/4 Kunci Terbuka
            </span>
          </div>

          <div className="rounded-xl bg-slate-900 border border-white/10 p-3.5 md:p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className={`font-display text-sm font-bold ${beat.speakerColor}`}>
                  {beat.speaker}
                </p>
                <p className="text-sm text-slate-100 leading-relaxed">{beat.text}</p>
              </div>

              {!isFinalBeat && (
                <button
                  type="button"
                  onClick={advanceBeat}
                  className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>Lanjutkan</span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
              )}
            </div>

            {isFinalBeat && (
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-white/10">
                <button
                  type="button"
                  onClick={onExploreGoldenCity}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-200 text-sm font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Compass className="w-4 h-4 shrink-0" />
                  <span>Jelajahi Kota Keemasan</span>
                </button>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onRestart}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <RotateCcw className="w-4 h-4 shrink-0" />
                    <span>Main Lagi</span>
                  </button>
                  <button
                    type="button"
                    onClick={onMainMenu}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Home className="w-4 h-4 shrink-0" />
                    <span>Menu Utama</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
