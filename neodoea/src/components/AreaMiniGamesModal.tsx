import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Gamepad2,
  Minus,
  Plus,
  Power,
  RotateCw,
  ShieldAlert,
  Sliders,
  X,
  Zap,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

export type AreaMiniGameType = 'minigame_circuit' | 'minigame_catcher' | 'minigame_memory';

interface AreaMiniGamesModalProps {
  mode: AreaMiniGameType;
  onComplete: () => void;
  onClose: () => void;
}

// ============================================================================
// MINI-GAME 1 (PELABUHAN): 2-PANEL 5-WIRE AMONG US-STYLE FUSE BOX + BREAKER
// ============================================================================
type WireColorId = 'red' | 'blue' | 'yellow' | 'magenta' | 'green';

interface WireSpec {
  id: WireColorId;
  name: string;
  symbol: string;
  hex: string;
  highlightHex: string;
  badgeClass: string;
}

const WIRES: WireSpec[] = [
  {
    id: 'red',
    name: 'Merah',
    symbol: '▲',
    hex: '#ef4444',
    highlightHex: '#fca5a5',
    badgeClass: 'bg-red-500 border-red-300 text-white',
  },
  {
    id: 'blue',
    name: 'Biru',
    symbol: '●',
    hex: '#3b82f6',
    highlightHex: '#93c5fd',
    badgeClass: 'bg-blue-500 border-blue-300 text-white',
  },
  {
    id: 'yellow',
    name: 'Kuning',
    symbol: '■',
    hex: '#eab308',
    highlightHex: '#fef08a',
    badgeClass: 'bg-yellow-400 border-yellow-200 text-slate-950',
  },
  {
    id: 'magenta',
    name: 'Ungu',
    symbol: '◆',
    hex: '#d946ef',
    highlightHex: '#f5d0fe',
    badgeClass: 'bg-fuchsia-500 border-fuchsia-300 text-white',
  },
  {
    id: 'green',
    name: 'Hijau',
    symbol: '✦',
    hex: '#10b981',
    highlightHex: '#6ee7b7',
    badgeClass: 'bg-emerald-500 border-emerald-300 text-white',
  },
];

const PANEL_LEFT_ORDERS: WireColorId[][] = [
  ['red', 'blue', 'yellow', 'magenta', 'green'],
  ['yellow', 'red', 'green', 'blue', 'magenta'],
];

const RIGHT_PRESETS: WireColorId[][] = [
  ['yellow', 'green', 'red', 'magenta', 'blue'],
  ['blue', 'magenta', 'green', 'yellow', 'red'],
  ['magenta', 'yellow', 'blue', 'red', 'green'],
];

const SVG_W = 400;
const SVG_H = 300;
const ROW_YS = [30, 90, 150, 210, 270];

const CircuitWireMiniGame: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [panelRound, setPanelRound] = useState<1 | 2>(1);
  const [leftOrder, setLeftOrder] = useState<WireColorId[]>(PANEL_LEFT_ORDERS[0]);
  const [rightOrder, setRightOrder] = useState<WireColorId[]>(
    () => RIGHT_PRESETS[Math.floor(Math.random() * RIGHT_PRESETS.length)]
  );
  const [connected, setConnected] = useState<Partial<Record<WireColorId, boolean>>>({});
  const [fuseIntegrity, setFuseIntegrity] = useState(3);
  const [breakerReady, setBreakerReady] = useState(false);
  const [breakerFlipped, setBreakerFlipped] = useState(false);

  const [selectedLeft, setSelectedLeft] = useState<WireColorId | null>(null);
  const [draggingLeft, setDraggingLeft] = useState<WireColorId | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [hoverRight, setHoverRight] = useState<WireColorId | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [won, setWon] = useState(false);

  const wireBayRef = useRef<HTMLDivElement | null>(null);
  const rightColRef = useRef<HTMLDivElement | null>(null);
  const dragStartClientRef = useRef<{ x: number; y: number } | null>(null);
  const didDragMoveRef = useRef(false);
  const onWinRef = useRef(onWin);
  onWinRef.current = onWin;
  const winTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (winTimerRef.current !== null) {
        window.clearTimeout(winTimerRef.current);
      }
    };
  }, []);

  const toBaySvgCoords = (clientX: number, clientY: number) => {
    const rect = wireBayRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return { x: SVG_W / 2, y: SVG_H / 2 };
    return {
      x: Math.max(0, Math.min(SVG_W, ((clientX - rect.left) / rect.width) * SVG_W)),
      y: Math.max(0, Math.min(SVG_H, ((clientY - rect.top) / rect.height) * SVG_H)),
    };
  };

  const findRightTargetAtClient = (clientX: number, clientY: number): WireColorId | null => {
    const rightRect = rightColRef.current?.getBoundingClientRect();
    if (!rightRect) return null;
    if (clientX < rightRect.left - 24 || clientX > rightRect.right + 16) return null;
    const relY = ((clientY - rightRect.top) / rightRect.height) * SVG_H;
    let bestIdx = -1;
    let bestDist = 36;
    ROW_YS.forEach((ry, idx) => {
      const dist = Math.abs(relY - ry);
      if (dist <= bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    });
    return bestIdx >= 0 ? rightOrder[bestIdx] : null;
  };

  const resetPanel = (toRound: 1 | 2, customMsg?: string) => {
    setPanelRound(toRound);
    setLeftOrder(PANEL_LEFT_ORDERS[toRound - 1]);
    const presetIdx = toRound === 2 ? (Math.floor(Math.random() * RIGHT_PRESETS.length) + 1) % RIGHT_PRESETS.length : Math.floor(Math.random() * RIGHT_PRESETS.length);
    setRightOrder(RIGHT_PRESETS[presetIdx]);
    setConnected({});
    setSelectedLeft(null);
    setDraggingLeft(null);
    setDragPos(null);
    setBreakerReady(false);
    setBreakerFlipped(false);
    setFuseIntegrity(3);
    setErrorMsg(customMsg ?? null);
  };

  const attemptConnect = (leftColor: WireColorId, rightColor: WireColorId) => {
    if (won || breakerReady) return;
    if (leftColor !== rightColor) {
      soundEngine.playSfx('wrong');
      const leftSpec = WIRES.find((w) => w.id === leftColor)!;
      const rightSpec = WIRES.find((w) => w.id === rightColor)!;
      const nextLives = fuseIntegrity - 1;
      if (nextLives <= 0) {
        resetPanel(
          panelRound,
          `Korsleting! Sekering panel ${panelRound} putus & kabel direset ulang!`
        );
      } else {
        setFuseIntegrity(nextLives);
        setErrorMsg(
          `Salah sambung (${leftSpec.name} ≠ ${rightSpec.name})! Sisa ketahanan sekering: ${nextLives}/3`
        );
      }
      return;
    }

    if (connected[leftColor]) return;

    const next = { ...connected, [leftColor]: true };
    setConnected(next);
    setSelectedLeft(null);
    setErrorMsg(null);
    soundEngine.playSfx('clue');

    const totalDone = WIRES.filter((w) => Boolean(next[w.id])).length;
    if (totalDone === WIRES.length) {
      if (panelRound === 1) {
        soundEngine.playSfx('correct');
        window.setTimeout(() => {
          resetPanel(2, 'Panel 1 aktif! Sekarang hubungkan Panel 2 dengan urutan terminal acak.');
        }, 480);
      } else {
        setBreakerReady(true);
        soundEngine.playSfx('clue');
      }
    }
  };

  const handleFlipMainBreaker = () => {
    if (!breakerReady || won) return;
    setBreakerFlipped(true);
    setWon(true);
    soundEngine.playSfx('correct');
    winTimerRef.current = window.setTimeout(() => {
      onWinRef.current();
    }, 780);
  };

  const handleLeftPointerDown = (color: WireColorId, e: React.PointerEvent) => {
    if (won || connected[color] || breakerReady) return;
    e.preventDefault();
    soundEngine.playSfx('click');
    setErrorMsg(null);
    setSelectedLeft(color);
    setDraggingLeft(color);
    didDragMoveRef.current = false;
    dragStartClientRef.current = { x: e.clientX, y: e.clientY };
    setDragPos(toBaySvgCoords(e.clientX, e.clientY));
  };

  useEffect(() => {
    if (!draggingLeft) return;

    const handleMove = (e: PointerEvent) => {
      if (dragStartClientRef.current) {
        const dist = Math.hypot(
          e.clientX - dragStartClientRef.current.x,
          e.clientY - dragStartClientRef.current.y
        );
        if (dist > 8) {
          didDragMoveRef.current = true;
        }
      }
      setDragPos(toBaySvgCoords(e.clientX, e.clientY));
      setHoverRight(findRightTargetAtClient(e.clientX, e.clientY));
    };

    const handleUp = (e: PointerEvent) => {
      const target = findRightTargetAtClient(e.clientX, e.clientY);
      if (target && didDragMoveRef.current) {
        attemptConnect(draggingLeft, target);
      }
      setDraggingLeft(null);
      setDragPos(null);
      setHoverRight(null);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  });

  const handleRightClick = (rightColor: WireColorId) => {
    if (won || !selectedLeft || breakerReady) return;
    attemptConnect(selectedLeft, rightColor);
  };

  const connectedCount = WIRES.filter((w) => Boolean(connected[w.id])).length;

  return (
    <div className="space-y-3.5">
      {/* Status & Fuse Integrity Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 bg-slate-950/75 border border-white/10 rounded-xl px-4 py-2.5">
        <span className="font-semibold text-amber-300">
          Panel {panelRound}/2 · Sambungkan 5 kabel sesuai warna & simbol!
        </span>
        <div className="flex items-center gap-3 font-mono tabular-nums">
          <span className={fuseIntegrity === 1 ? 'text-rose-400 font-bold' : 'text-emerald-300'}>
            Sekering: {fuseIntegrity}/3
          </span>
          <span className="text-sky-300 font-semibold">
            {connectedCount}/{WIRES.length}
          </span>
        </div>
      </div>

      {/* Gunmetal 5-Wire Electrical Fuse Box */}
      <div className="relative w-full h-[314px] p-2 sm:p-3 rounded-2xl bg-slate-800 border-2 border-slate-600/90 shadow-[inset_0_4px_24px_rgba(2,6,23,0.9)] select-none touch-none flex items-stretch">
        <span className="pointer-events-none absolute top-2 left-2 w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-400/50" />
        <span className="pointer-events-none absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-400/50" />
        <span className="pointer-events-none absolute bottom-2 left-2 w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-400/50" />
        <span className="pointer-events-none absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-400/50" />

        {/* Left Terminal Sockets */}
        <div className="shrink-0 flex flex-col justify-around z-20 pr-1">
          {leftOrder.map((colorId) => {
            const wire = WIRES.find((w) => w.id === colorId)!;
            const isDone = Boolean(connected[wire.id]);
            const isSelected = selectedLeft === wire.id;
            return (
              <button
                key={`left-${panelRound}-${wire.id}`}
                type="button"
                onPointerDown={(e) => handleLeftPointerDown(wire.id, e)}
                disabled={isDone || won}
                aria-label={`Kabel ${wire.name} kiri`}
                className={`relative h-10 px-2.5 sm:px-3 rounded-lg border-2 flex items-center justify-between gap-1.5 transition-transform cursor-grab active:cursor-grabbing ${
                  wire.badgeClass
                } ${
                  isSelected ? 'ring-2 ring-white scale-105' : 'hover:scale-[1.03]'
                } ${isDone ? 'opacity-95 cursor-default' : ''}`}
              >
                <span className="text-xs font-bold leading-none">{wire.symbol}</span>
                <span className="text-xs font-bold whitespace-nowrap">{wire.name}</span>
                <span className="w-2.5 h-4 rounded-r-sm bg-amber-300 border-l border-amber-700 -mr-1.5" />
              </button>
            );
          })}
        </div>

        {/* Center Wiring Bay */}
        <div
          ref={wireBayRef}
          className="relative flex-1 rounded-xl border border-slate-700/80 overflow-visible"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgba(15,23,42,0.92) 0%, rgba(7,11,20,0.98) 100%)',
          }}
        >
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
          >
            {leftOrder.map((colorId, leftIdx) => {
              const wire = WIRES.find((w) => w.id === colorId)!;
              if (!connected[wire.id]) return null;
              const rightIdx = rightOrder.indexOf(wire.id);
              const y1 = ROW_YS[leftIdx];
              const y2 = ROW_YS[rightIdx];
              const pathD = `M 0 ${y1} C ${SVG_W * 0.36} ${y1}, ${SVG_W * 0.64} ${y2}, ${SVG_W} ${y2}`;
              return (
                <g key={`wire-${panelRound}-${wire.id}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke="rgba(0,0,0,0.45)"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  <path
                    d={pathD}
                    fill="none"
                    stroke={wire.hex}
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <path
                    d={pathD}
                    fill="none"
                    stroke={wire.highlightHex}
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.78"
                  />
                </g>
              );
            })}

            {draggingLeft && dragPos && (() => {
              const leftIdx = leftOrder.indexOf(draggingLeft);
              const wire = WIRES.find((w) => w.id === draggingLeft)!;
              const y1 = ROW_YS[leftIdx];
              const x2 = dragPos.x;
              const y2 = dragPos.y;
              const midX = x2 / 2;
              const pathD = `M 0 ${y1} Q ${midX} ${Math.max(y1, y2) + 16}, ${x2} ${y2}`;
              return (
                <g>
                  <path
                    d={pathD}
                    fill="none"
                    stroke="rgba(0,0,0,0.5)"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  <path
                    d={pathD}
                    fill="none"
                    stroke={wire.hex}
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <path
                    d={pathD}
                    fill="none"
                    stroke={wire.highlightHex}
                    strokeWidth="3"
                    strokeLinecap="round"
                    opacity="0.75"
                  />
                  <circle cx={x2} cy={y2} r="6.5" fill="#f59e0b" stroke="#fef3c7" strokeWidth="2" />
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Right Terminal Sockets */}
        <div ref={rightColRef} className="shrink-0 flex flex-col justify-around z-20 pl-1">
          {rightOrder.map((colorId) => {
            const wire = WIRES.find((w) => w.id === colorId)!;
            const isDone = Boolean(connected[colorId]);
            const isHovered = hoverRight === colorId;
            return (
              <button
                key={`right-${panelRound}-${colorId}`}
                type="button"
                onClick={() => handleRightClick(colorId)}
                disabled={isDone || won}
                aria-label={`Terminal ${wire.name} kanan`}
                className={`relative h-10 px-2.5 sm:px-3 rounded-lg border-2 flex items-center justify-between gap-1.5 transition-all cursor-pointer ${
                  wire.badgeClass
                } ${
                  isHovered
                    ? 'ring-2 ring-white scale-105'
                    : selectedLeft && !isDone
                    ? 'hover:scale-105 hover:ring-2 hover:ring-white/80'
                    : ''
                } ${isDone ? 'ring-2 ring-emerald-300 cursor-default' : ''}`}
              >
                <span className="w-2.5 h-4 rounded-l-sm bg-amber-300 border-r border-amber-700 -ml-1.5" />
                <span className="text-xs font-bold leading-none">{wire.symbol}</span>
                <span className="text-xs font-bold whitespace-nowrap">{wire.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                    isDone
                      ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-300/60'
                      : 'bg-slate-950/75 text-slate-300'
                  }`}
                >
                  {isDone ? 'ON' : 'OFF'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Halte Breaker Activation Step */}
      {breakerReady && !won && (
        <div className="rounded-xl bg-amber-950/45 border border-amber-400/60 p-3.5 flex items-center justify-between gap-3">
          <div className="text-xs text-amber-100">
            <p className="font-bold text-amber-300">Semua 10 Jalur Kabel Tersambung!</p>
            <p>Nyalakan Saklar Breaker Utama sekarang untuk mengalirkan listrik Halte Neo-Bus.</p>
          </div>
          <button
            type="button"
            onClick={handleFlipMainBreaker}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shrink-0 transition-transform active:scale-95 ${
              breakerFlipped
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/30'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>Nyalakan Saklar Utama</span>
          </button>
        </div>
      )}

      {/* Feedback / Status Footer */}
      {won ? (
        <div className="flex items-center gap-2 text-emerald-300 bg-emerald-950/50 border border-emerald-400/40 rounded-xl p-3 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Kedua panel tersambung & Saklar Utama aktif! Lampu Halte Neo-Bus menyala kembali.</span>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-rose-300 min-h-[1rem]">
            {errorMsg ||
              (selectedLeft
                ? `Kabel ${WIRES.find((w) => w.id === selectedLeft)?.name} dipilih — klik terminal warna yang sama di kanan.`
                : 'Hati-hati: salah sambung 3 kali akan memutus sekering & mereset panel!')}
          </p>
          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx('click');
              resetPanel(panelRound);
            }}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MINI-GAME 2 (PLAZA): PROGRESSIVE WAVE SIGNAL CATCHER + DRIFTING VIRUS ZAPPER
// ============================================================================
interface FallingOrb {
  id: number;
  baseX: number;
  x: number;
  y: number;
  speed: number;
  driftAmp: number;
  phase: number;
  kind: 'good' | 'gold' | 'glitch' | 'virus';
}

const TARGET_ORBS = 18;

const SignalCatcherMiniGame: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [paddleX, setPaddleX] = useState(50);
  const [orbs, setOrbs] = useState<FallingOrb[]>([]);
  const [flashText, setFlashText] = useState<string | null>(null);
  const [won, setWon] = useState(false);

  const onWinRef = useRef(onWin);
  onWinRef.current = onWin;
  const winTimerRef = useRef<number | null>(null);

  const stateRef = useRef({
    paddleX: 50,
    left: false,
    right: false,
    score: 0,
    combo: 0,
    nextId: 1,
    spawnTimer: 0,
    elapsed: 0,
    orbs: [] as FallingOrb[],
    won: false,
  });

  useEffect(() => {
    return () => {
      if (winTimerRef.current !== null) {
        window.clearTimeout(winTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') stateRef.current.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') stateRef.current.right = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') stateRef.current.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') stateRef.current.right = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const triggerWinIfReached = () => {
    const st = stateRef.current;
    if (st.score >= TARGET_ORBS && !st.won) {
      st.won = true;
      setWon(true);
      soundEngine.playSfx('correct');
      winTimerRef.current = window.setTimeout(() => onWinRef.current(), 800);
    }
  };

  const handleZapHazard = (orbId: number, e: React.PointerEvent) => {
    e.stopPropagation();
    const st = stateRef.current;
    if (st.won) return;
    const idx = st.orbs.findIndex(
      (o) => o.id === orbId && (o.kind === 'glitch' || o.kind === 'virus')
    );
    if (idx === -1) return;
    const orb = st.orbs[idx];
    st.orbs.splice(idx, 1);
    st.combo += 1;
    const bonus = orb.kind === 'virus' ? 2 : 1;
    st.score = Math.min(TARGET_ORBS, st.score + bonus);
    soundEngine.playSfx('clue');
    setFlashText(
      orb.kind === 'virus' ? `Hancurkan Virus Zig-Zag! +${bonus}` : 'Zap Glitch! +1 Sinyal Bersih'
    );
    setScore(st.score);
    setCombo(st.combo);
    setOrbs([...st.orbs]);
    triggerWinIfReached();
  };

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const st = stateRef.current;
      st.elapsed += dt;

      if (!st.won) {
        const dir = (st.right ? 1 : 0) - (st.left ? 1 : 0);
        if (dir !== 0) {
          st.paddleX = Math.max(10, Math.min(90, st.paddleX + dir * 84 * dt));
        }

        const waveLevel = st.score >= 12 ? 3 : st.score >= 6 ? 2 : 1;
        const spawnInterval = waveLevel === 3 ? 0.36 : waveLevel === 2 ? 0.44 : 0.52;

        st.spawnTimer += dt;
        if (st.spawnTimer >= spawnInterval) {
          st.spawnTimer = 0;
          const r = Math.random();
          const kind: FallingOrb['kind'] =
            waveLevel >= 2 && r < 0.18
              ? 'virus'
              : r < 0.38
              ? 'glitch'
              : r < 0.52
              ? 'gold'
              : 'good';
          const baseX = 12 + Math.random() * 76;
          st.orbs.push({
            id: st.nextId++,
            baseX,
            x: baseX,
            y: -6,
            speed: (waveLevel === 3 ? 46 : waveLevel === 2 ? 40 : 35) + Math.random() * 18,
            driftAmp: kind === 'virus' ? 14 : kind === 'gold' ? 7 : 0,
            phase: Math.random() * Math.PI * 2,
            kind,
          });
        }

        const remaining: FallingOrb[] = [];
        let scoreChanged = false;
        for (const orb of st.orbs) {
          const ny = orb.y + orb.speed * dt;
          const nx =
            orb.driftAmp > 0
              ? Math.max(8, Math.min(92, orb.baseX + Math.sin(st.elapsed * 3.8 + orb.phase) * orb.driftAmp))
              : orb.baseX;
          const caught = ny >= 80 && ny <= 92 && Math.abs(nx - st.paddleX) <= 13;
          if (caught) {
            if (orb.kind === 'glitch' || orb.kind === 'virus') {
              const penalty = orb.kind === 'virus' ? 2 : 1;
              st.score = Math.max(0, st.score - penalty);
              st.combo = 0;
              soundEngine.playSfx('wrong');
              setFlashText(`-${penalty} Tertabrak ${orb.kind === 'virus' ? 'Virus' : 'Glitch'}!`);
            } else if (orb.kind === 'gold') {
              st.combo += 1;
              const gain = st.combo >= 4 ? 3 : 2;
              st.score = Math.min(TARGET_ORBS, st.score + gain);
              soundEngine.playSfx('clue');
              setFlashText(`+${gain} Sinyal Emas Turbo!`);
            } else {
              st.combo += 1;
              st.score = Math.min(TARGET_ORBS, st.score + 1);
              soundEngine.playSfx('click');
              setFlashText('+1 Sinyal');
            }
            scoreChanged = true;
          } else if (ny < 104) {
            remaining.push({ ...orb, x: nx, y: ny });
          }
        }
        st.orbs = remaining;

        if (scoreChanged) {
          setScore(st.score);
          setCombo(st.combo);
        }
        if (st.score >= TARGET_ORBS && !st.won) {
          st.won = true;
          setWon(true);
          soundEngine.playSfx('correct');
          winTimerRef.current = window.setTimeout(() => onWinRef.current(), 800);
        }
      }

      setPaddleX(st.paddleX);
      setOrbs([...st.orbs]);
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  const waveBadge = score >= 12 ? 'Gelombang 3 (Ekstrem)' : score >= 6 ? 'Gelombang 2 (Cepat)' : 'Gelombang 1';

  return (
    <div className="space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 bg-slate-950/70 border border-white/10 rounded-xl px-4 py-2.5">
        <span>
          Geser kolektor (<strong className="text-sky-300">A / D</strong> atau pointer) &{' '}
          <strong className="text-rose-300">klik Glitch/Virus</strong> sebelum jatuh!
        </span>
        <div className="flex items-center gap-3 font-mono tabular-nums shrink-0">
          <span className="text-violet-300 hidden sm:inline">{waveBadge}</span>
          <span className="text-amber-300">Combo: {combo}x</span>
          <span className="text-cyan-300 font-bold">
            Energi: {score} / {TARGET_ORBS}
          </span>
        </div>
      </div>

      <div
        onPointerMove={(e) => {
          if (stateRef.current.won) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = ((e.clientX - rect.left) / rect.width) * 100;
          stateRef.current.paddleX = Math.max(10, Math.min(90, pct));
        }}
        className="relative w-full h-72 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950/50 border border-cyan-400/30 overflow-hidden touch-none select-none cursor-ew-resize"
      >
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(56,189,248,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.25) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        {flashText && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-900/90 border border-white/15 text-[11px] font-semibold text-amber-200 pointer-events-none z-20">
            {flashText}
          </div>
        )}

        {orbs.map((orb) =>
          orb.kind === 'glitch' || orb.kind === 'virus' ? (
            <button
              key={orb.id}
              type="button"
              onPointerDown={(e) => handleZapHazard(orb.id, e)}
              aria-label={orb.kind === 'virus' ? 'Hancurkan Virus Zig-Zag' : 'Hancurkan Glitch Merah'}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-lg rotate-45 border-2 flex items-center justify-center text-white cursor-crosshair z-10 active:scale-90 transition-transform ${
                orb.kind === 'virus'
                  ? 'bg-fuchsia-600 hover:bg-fuchsia-500 border-fuchsia-100 shadow-[0_0_16px_rgba(217,70,239,0.95)]'
                  : 'bg-rose-500 hover:bg-rose-400 border-rose-100 shadow-[0_0_14px_rgba(244,63,94,0.9)]'
              }`}
              style={{ left: `${orb.x}%`, top: `${orb.y}%` }}
            >
              {orb.kind === 'virus' ? (
                <ShieldAlert className="w-4 h-4 -rotate-45" />
              ) : (
                <Zap className="w-4 h-4 -rotate-45" />
              )}
            </button>
          ) : (
            <div
              key={orb.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${orb.x}%`, top: `${orb.y}%` }}
            >
              {orb.kind === 'gold' ? (
                <div className="w-7 h-7 rounded-full bg-amber-400 border-2 border-yellow-100 shadow-[0_0_16px_rgba(251,191,36,0.9)] flex items-center justify-center text-[10px] font-bold text-slate-950">
                  +{combo >= 4 ? 3 : 2}
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-cyan-400 border-2 border-cyan-100 shadow-[0_0_14px_rgba(34,211,238,0.85)]" />
              )}
            </div>
          )
        )}

        {/* Collector Paddle */}
        <div
          className="absolute bottom-4 -translate-x-1/2 h-4 w-24 rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-400 border-2 border-white shadow-[0_0_18px_rgba(56,189,248,0.85)] pointer-events-none"
          style={{ left: `${paddleX}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-2">
          <button
            type="button"
            onPointerDown={() => (stateRef.current.left = true)}
            onPointerUp={() => (stateRef.current.left = false)}
            onPointerLeave={() => (stateRef.current.left = false)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-semibold text-white cursor-pointer"
          >
            ◀ Kiri
          </button>
          <button
            type="button"
            onPointerDown={() => (stateRef.current.right = true)}
            onPointerUp={() => (stateRef.current.right = false)}
            onPointerLeave={() => (stateRef.current.right = false)}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs font-semibold text-white cursor-pointer"
          >
            Kanan ▶
          </button>
        </div>

        <div className="h-2.5 flex-1 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-amber-300 transition-all duration-200"
            style={{ width: `${(score / TARGET_ORBS) * 100}%` }}
          />
        </div>
      </div>

      {won && (
        <div className="flex items-center gap-2 text-emerald-300 bg-emerald-950/50 border border-emerald-400/40 rounded-xl p-3 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Pemindai sinyal Plaza stabil! Gangguan frekuensi & virus zig-zag berhasil dinetralkan.</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MINI-GAME 4 (TERMINAL): 3-STAGE CYBER WAVEFORM FREQUENCY + PHASE TUNER
// ============================================================================
const WAVE_STAGES = [
  {
    label: 'Kanal 1/3 · Frekuensi Dasar',
    targetFreq: 5,
    targetAmp: 4,
    targetPhaseStep: 0,
    startFreq: 2,
    startAmp: 2,
    startPhaseStep: 0,
    hasPhase: false,
  },
  {
    label: 'Kanal 2/3 · Harmonik & Fase',
    targetFreq: 6,
    targetAmp: 5,
    targetPhaseStep: 3,
    startFreq: 3,
    startAmp: 2,
    startPhaseStep: 0,
    hasPhase: true,
  },
  {
    label: 'Kanal 3/3 · Inti Server Stabilisasi Penuh',
    targetFreq: 7,
    targetAmp: 3,
    targetPhaseStep: 4,
    startFreq: 4,
    startAmp: 6,
    startPhaseStep: 1,
    hasPhase: true,
  },
];

function buildSinePath(freq: number, amp: number, phase: number): string {
  const width = 460;
  const midY = 74;
  const ampPx = amp * 9.2;
  const pts: string[] = [];
  for (let x = 0; x <= width; x += 6) {
    const t = (x / width) * Math.PI * 2 * freq + phase;
    const y = midY + Math.sin(t) * ampPx;
    pts.push(`${x === 0 ? 'M' : 'L'} ${x} ${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

const FrequencyTunerMiniGame: React.FC<{ onWin: () => void }> = ({ onWin }) => {
  const [stageIdx, setStageIdx] = useState(0);
  const [freq, setFreq] = useState(WAVE_STAGES[0].startFreq);
  const [amp, setAmp] = useState(WAVE_STAGES[0].startAmp);
  const [phaseStep, setPhaseStep] = useState(WAVE_STAGES[0].startPhaseStep);
  const [phaseAnim, setPhaseAnim] = useState(0);
  const [won, setWon] = useState(false);

  const onWinRef = useRef(onWin);
  onWinRef.current = onWin;
  const winTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (winTimerRef.current !== null) {
        window.clearTimeout(winTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      setPhaseAnim((p) => (p + dt * 2.5) % (Math.PI * 20));
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  const currentStage = WAVE_STAGES[stageIdx];
  const freqDiff = Math.abs(freq - currentStage.targetFreq);
  const ampDiff = Math.abs(amp - currentStage.targetAmp);
  const phaseDiff = currentStage.hasPhase
    ? Math.min(
        Math.abs(phaseStep - currentStage.targetPhaseStep),
        6 - Math.abs(phaseStep - currentStage.targetPhaseStep)
      )
    : 0;
  const syncPct = Math.max(0, Math.round(100 - freqDiff * 9 - ampDiff * 11 - phaseDiff * 12));
  const isAligned = syncPct >= 95;

  const targetPhaseOffset = currentStage.hasPhase ? (currentStage.targetPhaseStep / 6) * Math.PI * 2 : 0;
  const playerPhaseOffset = currentStage.hasPhase ? (phaseStep / 6) * Math.PI * 2 : 0;

  const targetPath = buildSinePath(currentStage.targetFreq, currentStage.targetAmp, phaseAnim + targetPhaseOffset);
  const livePath = buildSinePath(freq, amp, phaseAnim + playerPhaseOffset);

  const handleLockSync = () => {
    if (!isAligned || won) {
      soundEngine.playSfx('wrong');
      return;
    }

    if (stageIdx < WAVE_STAGES.length - 1) {
      soundEngine.playSfx('clue');
      const next = stageIdx + 1;
      setStageIdx(next);
      setFreq(WAVE_STAGES[next].startFreq);
      setAmp(WAVE_STAGES[next].startAmp);
      setPhaseStep(WAVE_STAGES[next].startPhaseStep);
    } else {
      setWon(true);
      soundEngine.playSfx('correct');
      winTimerRef.current = window.setTimeout(() => onWinRef.current(), 800);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300 bg-slate-950/75 border border-white/10 rounded-xl px-4 py-2.5">
        <span className="font-semibold text-violet-300">{currentStage.label}</span>
        <span
          className={`font-mono font-bold tabular-nums ${
            isAligned ? 'text-emerald-300' : 'text-amber-300'
          }`}
        >
          Sinkronisasi: {syncPct}%
        </span>
      </div>

      {/* Live Dual Oscilloscope Display */}
      <div className="relative rounded-2xl bg-slate-950 border border-violet-400/35 p-3 overflow-hidden shadow-inner">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 px-1">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-amber-300/75 inline-block" />
            Gelombang Target Server
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-3 h-0.5 inline-block ${isAligned ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
            Gelombang Kalibrasimu
          </span>
        </div>

        <svg viewBox="0 0 460 148" className="w-full h-36 rounded-xl bg-slate-900/70 border border-white/5">
          <line x1="0" y1="74" x2="460" y2="74" stroke="rgba(148,163,184,0.2)" strokeDasharray="4 4" />
          <line x1="230" y1="0" x2="230" y2="148" stroke="rgba(148,163,184,0.15)" strokeDasharray="4 4" />

          <path
            d={targetPath}
            fill="none"
            stroke="rgba(251, 191, 36, 0.75)"
            strokeWidth="3.5"
            strokeDasharray="7 5"
          />

          <path
            d={livePath}
            fill="none"
            stroke={isAligned ? '#34d399' : '#22d3ee'}
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Interactive Sliders (Frequency, Amplitude, plus Phase Offset on Kanal 2 & 3) */}
      <div className={`grid grid-cols-1 ${currentStage.hasPhase ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
        <div className="rounded-xl bg-slate-950/75 border border-white/10 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-300" />
              Frekuensi
            </span>
            <span className="font-mono font-bold text-cyan-300 tabular-nums">{freq} Hz</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={won || freq <= 1}
              onClick={() => {
                soundEngine.playSfx('click');
                setFreq((f) => Math.max(1, f - 1));
              }}
              aria-label="Kurangi Frekuensi"
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white flex items-center justify-center cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
              type="range"
              min={1}
              max={8}
              step={1}
              value={freq}
              disabled={won}
              onChange={(e) => setFreq(Number(e.target.value))}
              className="flex-1 accent-cyan-400 cursor-pointer"
            />
            <button
              type="button"
              disabled={won || freq >= 8}
              onClick={() => {
                soundEngine.playSfx('click');
                setFreq((f) => Math.min(8, f + 1));
              }}
              aria-label="Tambah Frekuensi"
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white flex items-center justify-center cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-slate-950/75 border border-white/10 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-violet-300" />
              Amplitudo
            </span>
            <span className="font-mono font-bold text-violet-300 tabular-nums">Lv.{amp}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={won || amp <= 1}
              onClick={() => {
                soundEngine.playSfx('click');
                setAmp((a) => Math.max(1, a - 1));
              }}
              aria-label="Kurangi Amplitudo"
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white flex items-center justify-center cursor-pointer"
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
              type="range"
              min={1}
              max={6}
              step={1}
              value={amp}
              disabled={won}
              onChange={(e) => setAmp(Number(e.target.value))}
              className="flex-1 accent-violet-400 cursor-pointer"
            />
            <button
              type="button"
              disabled={won || amp >= 6}
              onClick={() => {
                soundEngine.playSfx('click');
                setAmp((a) => Math.min(6, a + 1));
              }}
              aria-label="Tambah Amplitudo"
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white flex items-center justify-center cursor-pointer"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        {currentStage.hasPhase && (
          <div className="rounded-xl bg-slate-950/75 border border-amber-400/25 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-200 flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-amber-300" />
                Geser Fase
              </span>
              <span className="font-mono font-bold text-amber-300 tabular-nums">
                {phaseStep * 60}°
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={won}
                onClick={() => {
                  soundEngine.playSfx('click');
                  setPhaseStep((p) => (p + 5) % 6);
                }}
                aria-label="Geser Fase Kiri"
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="range"
                min={0}
                max={5}
                step={1}
                value={phaseStep}
                disabled={won}
                onChange={(e) => setPhaseStep(Number(e.target.value))}
                className="flex-1 accent-amber-400 cursor-pointer"
              />
              <button
                type="button"
                disabled={won}
                onClick={() => {
                  soundEngine.playSfx('click');
                  setPhaseStep((p) => (p + 1) % 6);
                }}
                aria-label="Geser Fase Kanan"
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {won ? (
        <div className="flex items-center gap-2 text-emerald-300 bg-emerald-950/50 border border-emerald-400/40 rounded-xl p-3 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Gelombang Inti Server selaras sempurna! Silakan temui Pak Arga di kanan terminal.</span>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 pt-1">
          <p className="text-xs text-slate-400">
            {isAligned
              ? 'Gelombang sejajar sempurna! Tekan tombol di kanan untuk mengunci kanal.'
              : 'Samakan lengkung, tinggi, dan posisi fase gelombang biru dengan garis putus-putus kuning.'}
          </p>
          <button
            type="button"
            onClick={handleLockSync}
            disabled={!isAligned}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs sm:text-sm font-semibold cursor-pointer disabled:cursor-not-allowed whitespace-nowrap"
          >
            {stageIdx < WAVE_STAGES.length - 1 ? `Kunci Kanal ${stageIdx + 1}` : 'Kunci Sinkronisasi'}
          </button>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// MAIN MODAL SHELL FOR NON-MATERIAL AREA MINI-GAMES
// ============================================================================
export const AreaMiniGamesModal: React.FC<AreaMiniGamesModalProps> = ({
  mode,
  onComplete,
  onClose,
}) => {
  const meta =
    mode === 'minigame_circuit'
      ? {
          title: 'Mini-Game: Panel Listrik Halte Neo-Bus',
          subtitle: 'Sambungkan 5 kabel pada dua panel berurutan & nyalakan Saklar Utama tanpa memutus sekering!',
          accent: 'border-amber-400/35',
        }
      : mode === 'minigame_catcher'
      ? {
          title: 'Mini-Game: Pemindai & Penangkap Sinyal Plaza',
          subtitle: 'Hadapi 3 gelombang sinyal: tangkap orb emas/biru & hancurkan Glitch/Virus zig-zag sebelum menabrak!',
          accent: 'border-cyan-400/35',
        }
      : {
          title: 'Mini-Game: Kalibrasi Gelombang Inti Server',
          subtitle: 'Atur Frekuensi, Amplitudo, & Fase di 3 kanal server hingga gelombang target sejajar 100%!',
          accent: 'border-violet-400/35',
        };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className={`w-full max-w-2xl rounded-2xl bg-slate-900 border ${meta.accent} shadow-2xl p-6 space-y-5`}>
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg md:text-xl font-bold text-white">{meta.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{meta.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {mode === 'minigame_circuit' && <CircuitWireMiniGame onWin={onComplete} />}
        {mode === 'minigame_catcher' && <SignalCatcherMiniGame onWin={onComplete} />}
        {mode === 'minigame_memory' && <FrequencyTunerMiniGame onWin={onComplete} />}
      </div>
    </div>
  );
};
