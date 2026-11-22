import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  Compass,
  Lock,
  Radio,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Unlock,
  X,
  Zap,
} from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

export type BorderSideQuestKey = 'outskirts' | 'plaza' | 'stage';

interface SideQuestModalProps {
  questKey: BorderSideQuestKey;
  onComplete: () => void;
  onClose: () => void;
}

// ============================================================================
// SIDE QUEST 1 (OUTSKIRTS -> PLAZA): RAMBU RUTE & LAMPU PENYEBERANGAN
// ============================================================================
const CORRECT_SIGNS = ['Pelabuhan', 'Halte Neo-Bus', 'Gerbang Plaza'];

const OutskirtsSideQuest: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [signs, setSigns] = useState<string[]>(['Gerbang Plaza', 'Pelabuhan', 'Halte Neo-Bus']);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [charge, setCharge] = useState(0);
  const [won, setWon] = useState(false);

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const winTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (winTimerRef.current !== null) window.clearTimeout(winTimerRef.current);
    };
  }, []);

  const orderMatched = signs.every((s, idx) => s === CORRECT_SIGNS[idx]);

  const handleTapSign = (idx: number) => {
    if (won || orderMatched) return;
    soundEngine.playSfx('click');
    if (selectedIdx === null) {
      setSelectedIdx(idx);
      return;
    }
    if (selectedIdx === idx) {
      setSelectedIdx(null);
      return;
    }
    const next = [...signs];
    [next[selectedIdx], next[idx]] = [next[idx], next[selectedIdx]];
    setSigns(next);
    setSelectedIdx(null);
    if (next.every((s, i) => s === CORRECT_SIGNS[i])) {
      soundEngine.playSfx('clue');
    }
  };

  const handleChargePress = () => {
    if (won || !orderMatched) {
      soundEngine.playSfx('wrong');
      return;
    }
    const next = Math.min(100, charge + 25);
    setCharge(next);
    soundEngine.playSfx(next >= 100 ? 'correct' : 'click');
    if (next >= 100 && !won) {
      setWon(true);
      winTimerRef.current = window.setTimeout(() => onDoneRef.current(), 760);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-slate-950/75 border border-white/10 p-3.5 text-xs text-slate-300 space-y-1">
        <p className="font-semibold text-amber-300">Tantangan Perbatasan 1: Buka Penyeberangan ke Sandang Ayu Plaza</p>
        <p>
          1) Klik dua papan rute untuk menukar posisinya hingga urut: <strong className="text-white">Pelabuhan → Halte Neo-Bus → Gerbang Plaza</strong>.
          <br />
          2) Setelah urut, tekan tombol daya penyeberangan hingga <strong className="text-emerald-300">100%</strong>!
        </p>
      </div>

      {/* Step 1: Order Signs */}
      <div className="grid grid-cols-3 gap-2.5">
        {signs.map((label, idx) => {
          const isSelected = selectedIdx === idx;
          const isRightPos = label === CORRECT_SIGNS[idx];
          return (
            <button
              key={`${label}-${idx}`}
              type="button"
              disabled={won || orderMatched}
              onClick={() => handleTapSign(idx)}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                orderMatched
                  ? 'bg-emerald-950/50 border-emerald-400/60 text-emerald-200 cursor-default'
                  : isSelected
                  ? 'bg-sky-600/30 border-sky-300 text-white scale-[1.03]'
                  : isRightPos
                  ? 'bg-slate-800/90 border-amber-400/40 text-slate-100 hover:bg-slate-800'
                  : 'bg-slate-800/80 border-white/15 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="block text-[10px] font-mono text-slate-400 mb-1">Rambu #{idx + 1}</span>
              <span className="text-xs font-bold block">{label}</span>
              {!orderMatched && (
                <ArrowRightLeft className="w-3.5 h-3.5 mx-auto mt-1.5 text-slate-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Step 2: Charge Crossing Light */}
      <div className="rounded-xl bg-slate-950/80 border border-white/10 p-4 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-300" />
            Daya Lampu Penyeberangan
          </span>
          <span className="font-mono font-bold tabular-nums text-emerald-300">{charge}%</span>
        </div>

        <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-150"
            style={{ width: `${charge}%` }}
          />
        </div>

        <button
          type="button"
          disabled={!orderMatched || won}
          onClick={handleChargePress}
          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs sm:text-sm font-semibold cursor-pointer disabled:cursor-not-allowed"
        >
          {orderMatched ? 'Isi Daya Penyeberangan (+25%)' : 'Susun Urutan Rambu Terlebih Dahulu'}
        </button>
      </div>

      {won && (
        <div className="flex items-center gap-2 text-emerald-300 bg-emerald-950/50 border border-emerald-400/40 rounded-xl p-3 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Lampu penyeberangan hijau menyala! Melanjutkan perjalanan ke Sandang Ayu Plaza...</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SIDE QUEST 2 (PLAZA -> STAGE): KALIBRASI 3 ANTENA SIARAN PENDOPO
// ============================================================================
const ANTENNAS = [
  { id: 'west', name: 'Antena Barat', target: 90, init: 0 },
  { id: 'mid', name: 'Antena Tengah', target: 180, init: 90 },
  { id: 'east', name: 'Antena Timur', target: 270, init: 0 },
];

const PlazaSideQuest: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [angles, setAngles] = useState<number[]>(() => ANTENNAS.map((a) => a.init));
  const [won, setWon] = useState(false);

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const winTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (winTimerRef.current !== null) window.clearTimeout(winTimerRef.current);
    };
  }, []);

  const rotateAntenna = (idx: number) => {
    if (won) return;
    const next = [...angles];
    next[idx] = (next[idx] + 90) % 360;
    setAngles(next);
    const matchedNow = next[idx] === ANTENNAS[idx].target;
    soundEngine.playSfx(matchedNow ? 'clue' : 'click');

    if (next.every((ang, i) => ang === ANTENNAS[i].target)) {
      setWon(true);
      soundEngine.playSfx('correct');
      winTimerRef.current = window.setTimeout(() => onDoneRef.current(), 760);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-slate-950/75 border border-white/10 p-3.5 text-xs text-slate-300 space-y-1">
        <p className="font-semibold text-cyan-300">Tantangan Perbatasan 2: Sinkronisasi Antena Menuju Sanggar Darmoyudho</p>
        <p>Klik masing-masing dial antena untuk memutarnya 90° hingga arah jarum sejajar dengan sudut target.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {ANTENNAS.map((ant, idx) => {
          const cur = angles[idx];
          const aligned = cur === ant.target;
          return (
            <button
              key={ant.id}
              type="button"
              disabled={won}
              onClick={() => rotateAntenna(idx)}
              className={`rounded-2xl border p-4 flex flex-col items-center gap-2.5 transition-colors cursor-pointer ${
                aligned
                  ? 'bg-emerald-950/45 border-emerald-400/70 text-emerald-200'
                  : 'bg-slate-800/80 border-white/15 text-slate-200 hover:bg-slate-800'
              }`}
            >
              <span className="text-xs font-bold">{ant.name}</span>

              <div className="relative w-20 h-20 rounded-full bg-slate-950 border-2 border-white/15 flex items-center justify-center">
                {/* Target tick marker */}
                <span
                  className="absolute w-2.5 h-2.5 rounded-full bg-amber-300 border border-slate-950"
                  style={{
                    transform: `rotate(${ant.target}deg) translateY(-38px)`,
                  }}
                />
                {/* Rotating needle */}
                <div
                  className="w-1.5 h-8 rounded-full origin-bottom transition-transform duration-200"
                  style={{
                    transform: `translateY(-14px) rotate(${cur}deg)`,
                    backgroundColor: aligned ? '#34d399' : '#38bdf8',
                  }}
                />
                <Radio className={`w-4 h-4 ${aligned ? 'text-emerald-300' : 'text-sky-300'}`} />
              </div>

              <div className="text-[11px] font-mono tabular-nums space-y-0.5">
                <p>
                  Kini: <strong className={aligned ? 'text-emerald-300' : 'text-sky-300'}>{cur}°</strong>
                </p>
                <p className="text-amber-300/90">Target: {ant.target}°</p>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                <RotateCw className="w-3 h-3" /> Putar 90°
              </span>
            </button>
          );
        })}
      </div>

      {won && (
        <div className="flex items-center gap-2 text-emerald-300 bg-emerald-950/50 border border-emerald-400/40 rounded-xl p-3 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Ketiga antena terhubung! Membuka jalur menuju Sanggar Darmoyudho...</span>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// SIDE QUEST 3 (STAGE -> TERMINAL): GEMBOK JEMBATAN TIGA TUAS TIM
// ============================================================================
const LEVER_SPECS = [
  { id: 'nino', title: 'Tuas Nino · Kunci Mekanik', min: 65, max: 85, init: 25, accent: 'accent-red-400' },
  { id: 'ilyas', title: 'Tuas Ilyas · Kunci Enkripsi', min: 50, max: 70, init: 15, accent: 'accent-sky-400' },
  { id: 'dira', title: 'Tuas Dira · Kunci Otorisasi', min: 70, max: 90, init: 35, accent: 'accent-rose-400' },
];

const StageSideQuest: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [vals, setVals] = useState<number[]>(() => LEVER_SPECS.map((l) => l.init));
  const [won, setWon] = useState(false);

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const winTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (winTimerRef.current !== null) window.clearTimeout(winTimerRef.current);
    };
  }, []);

  const inZone = vals.map((v, idx) => v >= LEVER_SPECS[idx].min && v <= LEVER_SPECS[idx].max);
  const allLocked = inZone.every(Boolean);

  const handleOpenBridge = () => {
    if (!allLocked || won) {
      soundEngine.playSfx('wrong');
      return;
    }
    setWon(true);
    soundEngine.playSfx('correct');
    winTimerRef.current = window.setTimeout(() => onDoneRef.current(), 760);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-slate-950/75 border border-white/10 p-3.5 text-xs text-slate-300 space-y-1">
        <p className="font-semibold text-amber-300">Tantangan Perbatasan 3: Gembok Jembatan Terminal Server</p>
        <p>Tarik ketiga tuas pengaman tim masuk ke zona target hijau secara bersamaan untuk menurunkan jembatan besi!</p>
      </div>

      <div className="space-y-3">
        {LEVER_SPECS.map((lever, idx) => {
          const val = vals[idx];
          const ok = inZone[idx];
          return (
            <div
              key={lever.id}
              className={`rounded-xl border p-3.5 space-y-2 transition-colors ${
                ok ? 'bg-emerald-950/35 border-emerald-400/55' : 'bg-slate-950/75 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  {ok ? <Unlock className="w-3.5 h-3.5 text-emerald-300" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
                  {lever.title}
                </span>
                <span className="font-mono tabular-nums text-[11px]">
                  <span className={ok ? 'text-emerald-300 font-bold' : 'text-slate-300'}>{val}%</span>
                  <span className="text-slate-500"> · Zona: {lever.min}–{lever.max}%</span>
                </span>
              </div>

              <div className="relative pt-1">
                <div className="h-2 rounded-full bg-slate-800 relative overflow-hidden mb-1.5">
                  <div
                    className="absolute inset-y-0 bg-emerald-400/35 border-x border-emerald-300/70"
                    style={{ left: `${lever.min}%`, width: `${lever.max - lever.min}%` }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={val}
                  disabled={won}
                  onChange={(e) => {
                    const next = [...vals];
                    next[idx] = Number(e.target.value);
                    setVals(next);
                  }}
                  className={`w-full cursor-pointer ${lever.accent}`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {won ? (
        <div className="flex items-center gap-2 text-emerald-300 bg-emerald-950/50 border border-emerald-400/40 rounded-xl p-3 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Jembatan gerbang terbuka! Memasuki Terminal Server Kota...</span>
        </div>
      ) : (
        <button
          type="button"
          disabled={!allLocked}
          onClick={handleOpenBridge}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs sm:text-sm font-bold cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>{allLocked ? 'Buka Jembatan Terminal Server' : 'Sejajarkan Ketiga Tuas ke Zona Hijau'}</span>
        </button>
      )}
    </div>
  );
};

// ============================================================================
// MAIN BORDER SIDE QUEST MODAL
// ============================================================================
export const SideQuestModal: React.FC<SideQuestModalProps> = ({
  questKey,
  onComplete,
  onClose,
}) => {
  const titleMap: Record<BorderSideQuestKey, { title: string; subtitle: string }> = {
    outskirts: {
      title: 'Side Quest Perbatasan: Rute Menuju Plaza',
      subtitle: 'Kunci Gerbang Plaza aktif — tuntaskan rintangan perbatasan ini untuk melintas!',
    },
    plaza: {
      title: 'Side Quest Perbatasan: Jalur Sanggar Darmoyudho',
      subtitle: 'Kunci Sanggar Darmoyudho aktif — hubungkan pemancar perbatasan terlebih dahulu!',
    },
    stage: {
      title: 'Side Quest Perbatasan: Jembatan Terminal Server',
      subtitle: 'Kunci Terminal Server aktif — selesaikan gembok tiga tuas tim untuk masuk!',
    },
  };

  const info = titleMap[questKey];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-amber-400/35 shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/35 flex items-center justify-center text-amber-300 shrink-0">
              {questKey === 'outskirts' ? (
                <Compass className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-white">{info.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{info.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Side Quest"
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {questKey === 'outskirts' && <OutskirtsSideQuest onDone={onComplete} />}
        {questKey === 'plaza' && <PlazaSideQuest onDone={onComplete} />}
        {questKey === 'stage' && <StageSideQuest onDone={onComplete} />}
      </div>
    </div>
  );
};
