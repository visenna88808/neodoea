import React, { useState } from 'react';
import { ArrowDown, ArrowUp, CheckCircle2, Cpu, X } from 'lucide-react';
import { ALGORITHM_LOGS } from '../data/gameData';
import { soundEngine } from '../audio/soundEngine';

interface AlgorithmPuzzleModalProps {
  onComplete: () => void;
  onClose: () => void;
}

const INITIAL_ORDER = [
  { id: 'step3', title: 'Ruang Gema (Filter Bubble)', desc: 'Feed menampilkan 96% konten seragam sehingga tren lain tenggelam.' },
  { id: 'step1', title: 'Interaksi Awal Pengguna', desc: 'Pengguna menonton 1 klip musik pop global berdurasi 15 detik.' },
  { id: 'step2', title: 'Penguatan Bobot Algoritma', desc: 'Sistem menaikkan skor topik serupa dan menurunkan unggahan lokal.' },
];

const CORRECT_IDS = ['step1', 'step2', 'step3'];

export const AlgorithmPuzzleModal: React.FC<AlgorithmPuzzleModalProps> = ({ onComplete, onClose }) => {
  const [items, setItems] = useState(INITIAL_ORDER);
  const [literacyAnswer, setLiteracyAnswer] = useState<'none' | 'all_control' | 'agency'>('none');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  const moveItem = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return;
    soundEngine.playSfx('click');
    const copy = [...items];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    setItems(copy);
    setErrorMsg(null);
  };

  const handleVerify = () => {
    const orderOk = items.every((it, idx) => it.id === CORRECT_IDS[idx]);
    if (!orderOk) {
      soundEngine.playSfx('wrong');
      setErrorMsg('Urutan mekanisme algoritma belum tepat. Mulailah dari pemicu awal interaksi hingga terbentuknya ruang gema.');
      return;
    }
    if (literacyAnswer === 'none') {
      soundEngine.playSfx('wrong');
      setErrorMsg('Pilih kesimpulan literasi digital mengenai hubungan algoritma dan kebebasan individu.');
      return;
    }
    if (literacyAnswer === 'all_control') {
      soundEngine.playSfx('wrong');
      setErrorMsg('Hati-hati: algoritma memang memengaruhi paparan informasi, tetapi tidak sepenuhnya menentukan pilihan individu.');
      return;
    }

    soundEngine.playSfx('correct');
    setSolved(true);
    window.setTimeout(() => {
      onComplete();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/88 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-cyan-400/25 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-display text-xl font-bold text-white">Konsol Analisis Log Algoritma</h2>
              <p className="text-xs text-slate-400">
                Bantu Ilyas membaca riwayat rekomendasi dan mengurai pola penyaringan informasi kota
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recommendation History Log Table */}
        <div className="rounded-xl bg-slate-950/90 border border-white/10 p-4 space-y-2.5">
          <p className="text-xs font-semibold text-cyan-300">Cuplikan Riwayat Rekomendasi Pengguna (Akun: Raka_XI)</p>
          <div className="space-y-2">
            {ALGORITHM_LOGS.map((log, i) => (
              <div
                key={log.step}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900/90 border border-white/5 text-xs"
              >
                <div>
                  <span className="font-mono-data text-cyan-400 mr-2">0{i + 1}.</span>
                  <span className="font-semibold text-white">{log.step}:</span>{' '}
                  <span className="text-slate-300">{log.action}</span>
                </div>
                <span className="font-mono-data text-[11px] text-amber-300 shrink-0">{log.localRatio}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Order Sequence */}
        <div>
          <p className="text-xs font-semibold text-cyan-300 mb-2">
            Teka-teki 1: Susun urutan proses terbentuknya ruang gema algoritma (dari atas ke bawah)
          </p>
          <div className="space-y-2">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <span className="font-mono-data text-xs font-bold text-cyan-300 mt-0.5">
                    {idx + 1}.
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-slate-300">{item.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    disabled={idx === 0 || solved}
                    onClick={() => moveItem(idx, -1)}
                    aria-label="Naikkan"
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-700 disabled:opacity-35 text-slate-200 flex items-center justify-center cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === items.length - 1 || solved}
                    onClick={() => moveItem(idx, 1)}
                    aria-label="Turunkan"
                    className="w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-700 disabled:opacity-35 text-slate-200 flex items-center justify-center cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Critical Digital Literacy */}
        <div>
          <p className="text-xs font-semibold text-cyan-300 mb-2">
            Teka-teki 2: Apa kesimpulan literasi digital yang tepat dari pola ini?
          </p>
          <div className="space-y-2">
            <button
              type="button"
              disabled={solved}
              onClick={() => {
                soundEngine.playSfx('click');
                setLiteracyAnswer('all_control');
                setErrorMsg(null);
              }}
              className={`w-full text-left p-3.5 rounded-xl border text-sm cursor-pointer ${
                literacyAnswer === 'all_control'
                  ? 'bg-rose-950/60 border-rose-400 text-white'
                  : 'bg-slate-800/70 border-white/10 text-slate-200 hover:bg-slate-800'
              }`}
            >
              Algoritma mengendalikan pilihan hidup manusia secara mutlak sehingga pengguna tidak bisa menolak tren.
            </button>
            <button
              type="button"
              disabled={solved}
              onClick={() => {
                soundEngine.playSfx('click');
                setLiteracyAnswer('agency');
                setErrorMsg(null);
              }}
              className={`w-full text-left p-3.5 rounded-xl border text-sm cursor-pointer ${
                literacyAnswer === 'agency'
                  ? 'bg-cyan-950/60 border-cyan-400 text-white'
                  : 'bg-slate-800/70 border-white/10 text-slate-200 hover:bg-slate-800'
              }`}
            >
              Algoritma memengaruhi informasi yang sering muncul, tetapi pengguna tetap memegang kendali lewat literasi digital dan pilihan sadar.
            </button>
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-300 bg-rose-950/50 border border-rose-400/40 rounded-lg p-3">
            {errorMsg}
          </p>
        )}

        {solved && (
          <div className="flex items-center gap-2 text-emerald-300 bg-emerald-950/50 border border-emerald-400/40 rounded-lg p-3 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Pola log terpecahkan! Petunjuk 05 masuk ke Jurnal dan Papan Analisis Kasus Utama siap diselesaikan.</span>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={handleVerify}
            disabled={solved}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
          >
            Verifikasi Pola Algoritma
          </button>
        </div>
      </div>
    </div>
  );
};
