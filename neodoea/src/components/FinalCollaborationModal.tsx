import React, { useState } from 'react';
import {
  CheckCircle2,
  Cpu,
  HeartHandshake,
  Search,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { ASSETS } from '../data/gameData';
import { soundEngine } from '../audio/soundEngine';

interface FinalCollaborationModalProps {
  onComplete: (choice: 'A' | 'B' | 'C') => void;
  onClose: () => void;
}

// Stage 1: Nino Curiosity Scan (3 hidden sabotage nodes on Server Core)
const SERVER_NODES = [
  {
    id: 'n1',
    label: 'Kabel Pembatas Acara Lokal',
    isSabotage: true,
    x: 24,
    y: 34,
    hint: 'Tepat! Kabel ini sengaja menyumbat siaran budaya lokal agar tidak muncul di beranda kota.',
  },
  {
    id: 'n2',
    label: 'Pendingin Standar Server',
    isSabotage: false,
    x: 74,
    y: 28,
    hint: 'Bukan masalah—kipas pendingin server berjalan normal.',
  },
  {
    id: 'n3',
    label: 'Chip Loop Autoplay Paksa',
    isSabotage: true,
    x: 50,
    y: 54,
    hint: 'Ketemu! Chip ini mengunci warga dalam tontonan seragam tanpa jeda.',
  },
  {
    id: 'n4',
    label: 'Catu Daya Cadangan',
    isSabotage: false,
    x: 26,
    y: 74,
    hint: 'Aman—pasokan listrik utama server dalam kondisi stabil.',
  },
  {
    id: 'n5',
    label: 'Segel Antena Portal Pulang',
    isSabotage: true,
    x: 76,
    y: 72,
    hint: 'Berhasil! Segel fisik yang memblokir frekuensi Portal Pulang berhasil dilepas.',
  },
];

// Stage 3: Dira Social Consensus
const CONSENSUS_CHOICES: {
  key: 'A' | 'B' | 'C';
  title: string;
  speaker: string;
  portrait: string;
  feedback: string;
  isBalanced: boolean;
}[] = [
  {
    key: 'A',
    title: 'A. Memutus seluruh koneksi global dan melarang tren luar agar warga hanya kembali ke tradisi lama.',
    speaker: 'Dira',
    portrait: ASSETS.portraitDira,
    feedback:
      'Menutup diri total melindungi tradisi sementara, namun membuat warga tertinggal dari pertukaran ilmu dan teknologi yang bermanfaat.',
    isBalanced: false,
  },
  {
    key: 'B',
    title: 'B. Membiarkan algoritma tren global mendominasi seluruh layar demi efisiensi penuh.',
    speaker: 'Ilyas',
    portrait: ASSETS.portraitIlyas,
    feedback:
      'Jika algoritma dibiarkan tanpa kendali literasi digital, homogenisasi budaya dan kesepian sosial akan terulang kembali.',
    isBalanced: false,
  },
  {
    key: 'C',
    title: 'C. Menggabungkan literasi digital kritis dengan ruang akulturasi kreatif budaya lokal dan interaksi nyata warga.',
    speaker: 'Nino, Ilyas & Dira',
    portrait: ASSETS.portraitNino,
    feedback:
      'Sinergi sempurna! Teknologi dimanfaatkan secara sadar, informasi beragam, budaya lokal berakulturasi kreatif, dan hubungan tatap muka kembali hangat.',
    isBalanced: true,
  },
];

export const FinalCollaborationModal: React.FC<FinalCollaborationModalProps> = ({
  onComplete,
  onClose,
}) => {
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);

  // Stage 1 state (Nino)
  const [foundSabotage, setFoundSabotage] = useState<string[]>([]);
  const [ninoFeedback, setNinoFeedback] = useState<string>(
    'Klik 3 titik anomali tersembunyi pada cetak biru Inti Server.'
  );

  // Stage 2 state (Ilyas)
  const [localWeight, setLocalWeight] = useState(20);
  const [globalWeight, setGlobalWeight] = useState(90);
  const [communityWeight, setCommunityWeight] = useState(25);

  // Stage 3 state (Dira)
  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | 'C' | null>(null);

  const sabotageCount = foundSabotage.length;
  const ninoDone = sabotageCount === 3;

  const isInHarmony = (v: number) => v >= 40 && v <= 70;
  const ilyasDone =
    isInHarmony(localWeight) && isInHarmony(globalWeight) && isInHarmony(communityWeight);

  const activeConsensus = CONSENSUS_CHOICES.find((c) => c.key === selectedChoice);

  const handleInspectNode = (node: (typeof SERVER_NODES)[number]) => {
    if (ninoDone) return;
    if (node.isSabotage) {
      if (!foundSabotage.includes(node.id)) {
        const next = [...foundSabotage, node.id];
        setFoundSabotage(next);
        soundEngine.playSfx(next.length === 3 ? 'correct' : 'clue');
      }
      setNinoFeedback(node.hint);
    } else {
      soundEngine.playSfx('click');
      setNinoFeedback(node.hint);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-slate-900 border border-amber-400/35 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/35 flex items-center justify-center text-amber-300 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                Kolaborasi Akhir: Nino · Ilyas · Dira
              </h2>
              <p className="text-xs text-slate-400">
                Satukan ketiga keahlian tim untuk memulihkan Neo-Metropolis dan meraih Kunci Master Portal Pulang
              </p>
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

        {/* 3-Character Stepper */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { num: 1, name: 'Nino · Audit Fisik', img: ASSETS.portraitNino, done: stage > 1 || ninoDone },
            { num: 2, name: 'Ilyas · Algoritma', img: ASSETS.portraitIlyas, done: stage > 2 },
            { num: 3, name: 'Dira · Konsensus', img: ASSETS.portraitDira, done: stage > 3 },
          ].map((step) => {
            const active = stage === step.num;
            return (
              <div
                key={step.num}
                className={`rounded-xl border px-3 py-2 flex items-center gap-2 ${
                  active
                    ? 'bg-sky-950/60 border-sky-400/70 text-white'
                    : step.done
                    ? 'bg-emerald-950/40 border-emerald-400/40 text-emerald-200'
                    : 'bg-slate-950/60 border-white/10 text-slate-400'
                }`}
              >
                <img
                  src={step.img}
                  alt={step.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover object-top border border-white/25 shrink-0"
                />
                <span className="text-[11px] font-semibold truncate">{step.name}</span>
              </div>
            );
          })}
        </div>

        {/* STAGE 1: NINO CURIOSITY TRIGGER */}
        {stage === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 bg-red-950/35 border border-red-400/30 rounded-xl p-3.5">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-red-300 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-red-200">Tahap 1 · Nino (Curiosity Trigger)</p>
                  <p className="text-xs text-slate-200 mt-0.5">{ninoFeedback}</p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-amber-300 tabular-nums shrink-0">
                {sabotageCount}/3
              </span>
            </div>

            <div className="relative h-60 rounded-2xl bg-slate-950 border border-red-400/25 overflow-hidden">
              {/* Server Core Circuit Diagram */}
              <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full opacity-40 pointer-events-none">
                <rect x="40" y="30" width="320" height="140" rx="14" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6 4" />
                <circle cx="200" cy="100" r="38" fill="none" stroke="#f59e0b" strokeWidth="2" />
                <line x1="96" y1="68" x2="170" y2="95" stroke="#64748b" strokeWidth="2" />
                <line x1="296" y1="56" x2="230" y2="92" stroke="#64748b" strokeWidth="2" />
                <line x1="104" y1="148" x2="175" y2="115" stroke="#64748b" strokeWidth="2" />
                <line x1="304" y1="144" x2="230" y2="112" stroke="#64748b" strokeWidth="2" />
              </svg>

              {SERVER_NODES.map((node) => {
                const discovered = foundSabotage.includes(node.id);
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => handleInspectNode(node)}
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      discovered
                        ? 'bg-emerald-600/80 border-emerald-200 text-white shadow-lg'
                        : 'bg-slate-800/95 hover:bg-slate-700 border-amber-300/45 text-slate-100 hover:scale-105'
                    }`}
                  >
                    {discovered ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Search className="w-3.5 h-3.5 text-amber-300" />}
                    <span className="whitespace-nowrap">{node.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                disabled={!ninoDone}
                onClick={() => {
                  soundEngine.playSfx('click');
                  setStage(2);
                }}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-sm font-semibold cursor-pointer disabled:cursor-not-allowed"
              >
                Lanjut ke Tahap 2 (Ilyas)
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: ILYAS DATA HACKING */}
        {stage === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-sky-950/40 border border-sky-400/35 rounded-xl p-3.5">
              <Cpu className="w-5 h-5 text-sky-300 shrink-0" />
              <div>
                <p className="text-xs font-bold text-sky-200">Tahap 2 · Ilyas (Data Hacking)</p>
                <p className="text-xs text-slate-200 mt-0.5">
                  Atur ketiga kanal algoritma kota masuk ke <strong className="text-emerald-300">Zona Harmoni (40%–70%)</strong> secara bersamaan untuk membubarkan Ruang Gema!
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: 'Eksposur Budaya & Seni Lokal',
                  val: localWeight,
                  setter: setLocalWeight,
                  accent: 'accent-amber-400',
                },
                {
                  label: 'Arus Tren Informasi Global',
                  val: globalWeight,
                  setter: setGlobalWeight,
                  accent: 'accent-cyan-400',
                },
                {
                  label: 'Prioritas Forum & Ruang Diskusi Warga',
                  val: communityWeight,
                  setter: setCommunityWeight,
                  accent: 'accent-emerald-400',
                },
              ].map((ch) => {
                const ok = isInHarmony(ch.val);
                return (
                  <div
                    key={ch.label}
                    className={`rounded-xl border p-3.5 space-y-2 ${
                      ok ? 'bg-emerald-950/35 border-emerald-400/50' : 'bg-slate-950/75 border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white">{ch.label}</span>
                      <span className={`font-mono font-bold tabular-nums ${ok ? 'text-emerald-300' : 'text-amber-300'}`}>
                        {ch.val}% · {ok ? 'Harmonis' : 'Belum Seimbang'}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={ch.val}
                      onChange={(e) => ch.setter(Number(e.target.value))}
                      className={`w-full cursor-pointer ${ch.accent}`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStage(1)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
              >
                Kembali ke Nino
              </button>
              <button
                type="button"
                disabled={!ilyasDone}
                onClick={() => {
                  soundEngine.playSfx('correct');
                  setStage(3);
                }}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-sm font-semibold cursor-pointer disabled:cursor-not-allowed"
              >
                Lanjut ke Tahap 3 (Dira)
              </button>
            </div>
          </div>
        )}

        {/* STAGE 3: DIRA SOCIAL EMPATHY & CONSENSUS */}
        {stage === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 bg-rose-950/35 border border-rose-400/35 rounded-xl p-3.5">
              <HeartHandshake className="w-5 h-5 text-rose-300 shrink-0" />
              <div>
                <p className="text-xs font-bold text-rose-200">Tahap 3 · Dira (Social Empathy)</p>
                <p className="text-xs text-slate-200 mt-0.5">
                  Nino sudah melepas segel fisik dan Ilyas menyeimbangkan algoritma. Kini pimpin konsensus akhir warga Neo-Metropolis!
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {CONSENSUS_CHOICES.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    soundEngine.playSfx(opt.isBalanced ? 'correct' : 'click');
                    setSelectedChoice(opt.key);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-colors cursor-pointer ${
                    selectedChoice === opt.key
                      ? opt.isBalanced
                        ? 'bg-emerald-950/60 border-emerald-400 text-white'
                        : 'bg-amber-950/50 border-amber-400 text-white'
                      : 'bg-slate-800/75 border-white/10 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {opt.title}
                </button>
              ))}
            </div>

            {activeConsensus && (
              <div className="rounded-xl bg-slate-950/85 border border-white/15 p-4 flex items-start gap-3.5">
                <img
                  src={activeConsensus.portrait}
                  alt={activeConsensus.speaker}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-xl object-cover object-top border border-white/15 shrink-0"
                />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-sky-300">Tanggapan {activeConsensus.speaker}</p>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{activeConsensus.feedback}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStage(2)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
              >
                Kembali ke Ilyas
              </button>
              <button
                type="button"
                disabled={!activeConsensus?.isBalanced}
                onClick={() => {
                  if (activeConsensus?.isBalanced) {
                    soundEngine.playSfx('portal');
                    setStage(4);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 text-xs sm:text-sm font-bold cursor-pointer disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4" />
                <span>Satukan Kekuatan Tim!</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 4: ANIMATED 3-CHARACTER COLLABORATION COMPLETION ILLUSTRATION */}
        {stage === 4 && (
          <div className="space-y-4 animate-cutin-enter">
            <div className="relative aspect-video w-full rounded-2xl border-2 border-amber-300/75 overflow-hidden bg-slate-950 shadow-[0_0_45px_rgba(251,191,36,0.35)]">
              {/* Rotating Golden-Cyan Harmonic Halo Overlay */}
              <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none z-10 mix-blend-screen flex items-center justify-center"
              >
                <div
                  className="w-[120%] aspect-square rounded-full animate-portal-spin opacity-55"
                  style={{
                    background:
                      'conic-gradient(from 0deg, transparent 0deg, rgba(253,224,71,0.36) 40deg, transparent 95deg, rgba(56,189,248,0.38) 180deg, transparent 250deg, rgba(251,191,36,0.3) 315deg, transparent 360deg)',
                  }}
                />
              </div>

              {/* Realistic Anime Trio Victory Illustration */}
              <img
                src={ASSETS.collabTrioVictory}
                alt="Ilustrasi kolaborasi Ilyas, Dira, dan Nino memulihkan Inti Server Neo-Metropolis"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover animate-[pulse_6s_ease-in-out_infinite] scale-[1.02]"
              />

              {/* Floating Celebration Sparkles */}
              <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-10">
                {[14, 28, 46, 66, 84].map((leftPct, i) => (
                  <span
                    key={leftPct}
                    className="absolute w-2 h-2 rounded-full bg-amber-200 shadow-[0_0_12px_#fde047] animate-float-slow"
                    style={{
                      left: `${leftPct}%`,
                      top: `${16 + (i % 3) * 20}%`,
                      animationDelay: `${i * 0.4}s`,
                    }}
                  />
                ))}
              </div>

              {/* Bottom Caption Scrim */}
              <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent px-5 pt-10 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Sinergi Tim Sempurna · Harmoni Terpulihkan!
                    </p>
                    <h3 className="font-display text-base sm:text-lg font-bold text-white mt-0.5">
                      Nino, Ilyas, dan Dira Berhasil Menstabilkan Inti Server Neo-Metropolis
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="rounded-xl bg-red-950/35 border border-red-400/30 p-3">
                <p className="font-bold text-red-200">Nino · Curiosity Trigger</p>
                <p className="text-slate-300 mt-0.5">Melepas 3 segel sabotase fisik pada inti server kota.</p>
              </div>
              <div className="rounded-xl bg-sky-950/35 border border-sky-400/30 p-3">
                <p className="font-bold text-sky-200">Ilyas · Data Hacking</p>
                <p className="text-slate-300 mt-0.5">Menyeimbangkan bobot budaya lokal, tren global, & forum warga.</p>
              </div>
              <div className="rounded-xl bg-rose-950/35 border border-rose-400/30 p-3">
                <p className="font-bold text-rose-200">Dira · Social Empathy</p>
                <p className="text-slate-300 mt-0.5">Menyatukan warga lewat literasi digital & akulturasi kreatif.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx('correct');
                  onComplete(activeConsensus?.key || 'C');
                }}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-500/25"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Terima Kunci Master & Buka Portal Pulang</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
