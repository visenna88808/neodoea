import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Music, Sparkles, X } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface StageActivityModalProps {
  onComplete: () => void;
  onClose: () => void;
}

interface RhythmNote {
  id: number;
  lane: 0 | 1 | 2;
  y: number;
  isChord?: boolean;
  hit: boolean;
}

const LANES = [
  { lane: 0 as const, keyLabel: '1 / A', name: 'Bonang', color: 'from-amber-400 to-orange-500', sfx: 'gamelan1' as const },
  { lane: 1 as const, keyLabel: '2 / S', name: 'Saron', color: 'from-yellow-300 to-amber-500', sfx: 'gamelan2' as const },
  { lane: 2 as const, keyLabel: '3 / D', name: 'Gong', color: 'from-emerald-300 to-teal-500', sfx: 'gamelan3' as const },
];

const TARGET_HITS = 16;

export const StageActivityModal: React.FC<StageActivityModalProps> = ({ onComplete, onClose }) => {
  const [hits, setHits] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [notes, setNotes] = useState<RhythmNote[]>([]);
  const [lanePulse, setLanePulse] = useState<number | null>(null);
  const [hitBurst, setHitBurst] = useState<{ lane: number; label: string } | null>(null);
  const [feedback, setFeedback] = useState<string>('Ketuk jalur, tombol drum, atau [1] [2] [3] saat nada masuk garis emas!');
  const [completed, setCompleted] = useState(false);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const winTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (winTimerRef.current !== null) {
        window.clearTimeout(winTimerRef.current);
      }
    };
  }, []);

  const ref = useRef({
    notes: [] as RhythmNote[],
    nextId: 1,
    spawnTimer: 0.45,
    beatCounter: 0,
    hits: 0,
    combo: 0,
    maxCombo: 0,
    completed: false,
  });

  const handleTapLane = (laneIdx: 0 | 1 | 2) => {
    if (ref.current.completed) return;
    setLanePulse(laneIdx);
    window.setTimeout(() => setLanePulse((p) => (p === laneIdx ? null : p)), 125);

    const laneMeta = LANES[laneIdx];
    const targetNote = ref.current.notes.find(
      (n) => !n.hit && n.lane === laneIdx && n.y >= 64 && n.y <= 96
    );

    if (targetNote) {
      targetNote.hit = true;
      const isPerfect = Math.abs(targetNote.y - 82) <= 7;
      ref.current.hits += 1;
      ref.current.combo += 1;
      ref.current.maxCombo = Math.max(ref.current.maxCombo, ref.current.combo);
      soundEngine.playSfx(laneMeta.sfx);
      setHits(ref.current.hits);
      setCombo(ref.current.combo);
      setMaxCombo(ref.current.maxCombo);
      setHitBurst({ lane: laneIdx, label: isPerfect ? 'SEMPURNA!' : 'PAS!' });
      window.setTimeout(() => setHitBurst(null), 320);
      setFeedback(
        `${isPerfect ? 'SEMPURNA!' : 'Tepat!'} ${laneMeta.name} berpadu harmonis (${ref.current.combo}x Combo)`
      );

      if (ref.current.hits >= TARGET_HITS) {
        ref.current.completed = true;
        setCompleted(true);
        soundEngine.playSfx('correct');
        winTimerRef.current = window.setTimeout(() => onCompleteRef.current(), 840);
      }
    } else {
      ref.current.combo = 0;
      setCombo(0);
      soundEngine.playSfx('wrong');
      setFeedback('Meleset! Tunggu bola nada menyentuh garis emas sebelum mengetuk!');
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '1' || e.key === 'a' || e.key === 'A') handleTapLane(0);
      else if (e.key === '2' || e.key === 's' || e.key === 'S') handleTapLane(1);
      else if (e.key === '3' || e.key === 'd' || e.key === 'D') handleTapLane(2);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const st = ref.current;

      if (!st.completed) {
        const speedRamp = 40 + Math.min(18, st.hits * 1.1);
        const spawnEvery = Math.max(0.46, 0.7 - st.hits * 0.013);

        st.spawnTimer += dt;
        if (st.spawnTimer >= spawnEvery) {
          st.spawnTimer = 0;
          st.beatCounter += 1;
          const lane = Math.floor(Math.random() * 3) as 0 | 1 | 2;
          const spawnChord = st.hits >= 5 && st.beatCounter % 4 === 0;
          st.notes.push({ id: st.nextId++, lane, y: -8, isChord: spawnChord, hit: false });

          if (spawnChord) {
            const secondLane = ((lane + 1 + Math.floor(Math.random() * 2)) % 3) as 0 | 1 | 2;
            st.notes.push({ id: st.nextId++, lane: secondLane, y: -8, isChord: true, hit: false });
          }
        }

        const alive: RhythmNote[] = [];
        for (const n of st.notes) {
          if (n.hit) continue;
          const ny = n.y + speedRamp * dt;
          if (ny <= 102) {
            alive.push({ ...n, y: ny });
          } else {
            st.combo = 0;
            setCombo(0);
          }
        }
        st.notes = alive;
      }

      setNotes([...st.notes]);
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-amber-400/30 shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/35 flex items-center justify-center text-amber-300">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg md:text-xl font-bold text-white">
                Mini-Game: Ketukan Ritme Gamelan Sanggar Darmoyudho
              </h2>
              <p className="text-xs text-slate-400">
                Tempo meningkat & muncul nada kembar (akord) — capai {TARGET_HITS} ketukan harmonis!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between gap-3 text-xs bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5">
          <span className="text-amber-200 font-medium truncate">{feedback}</span>
          <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums">
            <span className="text-cyan-300">Combo: {combo}x (Best {maxCombo}x)</span>
            <span className="text-amber-300 font-bold">
              Skor: {hits}/{TARGET_HITS}
            </span>
          </div>
        </div>

        {/* Interactive 3-Lane Falling Rhythm Board */}
        <div className="relative h-64 rounded-2xl bg-slate-950/90 border border-amber-500/25 overflow-hidden grid grid-cols-3 touch-none select-none">
          {LANES.map((l) => {
            const pulsed = lanePulse === l.lane;
            return (
              <div
                key={l.lane}
                onPointerDown={() => handleTapLane(l.lane)}
                className={`relative border-r last:border-r-0 border-white/10 cursor-pointer transition-colors ${
                  pulsed ? 'bg-amber-500/18' : 'hover:bg-white/[0.03]'
                }`}
              >
                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-amber-200/65 pointer-events-none">
                  {l.name}
                </span>

                {hitBurst && hitBurst.lane === l.lane && (
                  <span className="absolute top-[64%] left-1/2 -translate-x-1/2 text-[11px] font-bold text-emerald-300 animate-bounce pointer-events-none z-20">
                    {hitBurst.label}
                  </span>
                )}

                {notes
                  .filter((n) => n.lane === l.lane)
                  .map((n) => (
                    <div
                      key={n.id}
                      style={{ top: `${n.y}%` }}
                      className={`absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-6 rounded-full bg-gradient-to-r ${l.color} border ${
                        n.isChord
                          ? 'border-cyan-200 ring-2 ring-cyan-300/65'
                          : 'border-white/80'
                      } shadow-[0_0_14px_rgba(251,191,36,0.65)] pointer-events-none`}
                    />
                  ))}
              </div>
            );
          })}

          {/* Target Beat Hit Line */}
          <div
            className="absolute inset-x-0 h-11 bg-amber-400/12 border-y-2 border-amber-300/75 pointer-events-none flex items-center justify-end pr-3"
            style={{ top: '76%' }}
          >
            <Sparkles className="w-4 h-4 text-amber-300/75" />
          </div>
        </div>

        {/* 3 Drum Pads */}
        <div className="grid grid-cols-3 gap-3">
          {LANES.map((l) => {
            const pulsed = lanePulse === l.lane;
            return (
              <button
                key={l.lane}
                type="button"
                onPointerDown={() => handleTapLane(l.lane)}
                className={`py-3.5 px-3 rounded-xl border transition-all cursor-pointer text-center ${
                  pulsed
                    ? 'bg-amber-500/40 border-amber-200 scale-[0.97] text-white shadow-lg'
                    : 'bg-slate-800/90 hover:bg-slate-800 border-amber-400/35 text-amber-100'
                }`}
              >
                <p className="text-sm font-bold">{l.name}</p>
                <p className="text-[11px] text-amber-300/90 font-mono mt-0.5">Tombol [{l.keyLabel}]</p>
              </button>
            );
          })}
        </div>

        {completed && (
          <div className="flex items-center gap-2 text-emerald-300 bg-emerald-950/50 border border-emerald-400/40 rounded-xl p-3 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Alunan gamelan menggema! Lampu Sanggar Darmoyudho kembali menyala terang!</span>
          </div>
        )}
      </div>
    </div>
  );
};
