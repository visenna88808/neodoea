import React, { useState } from 'react';
import { Compass, CheckCircle2, MessageSquare } from 'lucide-react';
import { ASSETS } from '../data/gameData';
import { soundEngine } from '../audio/soundEngine';

interface CityChoiceModalProps {
  onConfirmChoice: (choice: 'A' | 'B' | 'C') => void;
  onClose: () => void;
}

const CHOICES: {
  key: 'A' | 'B' | 'C';
  title: string;
  responseSpeaker: string;
  portrait: string;
  feedback: string;
  isBalanced: boolean;
}[] = [
  {
    key: 'A',
    title: 'A. Menolak seluruh pengaruh budaya asing dan kembali sepenuhnya ke cara tradisional.',
    responseSpeaker: 'Dira',
    portrait: ASSETS.portraitDira,
    feedback:
      'Kelebihannya: identitas lokal terlindungi cepat. Namun keterbatasannya: menutup diri total membuat masyarakat tertinggal dari pertukaran ilmu, teknologi bermanfaat, dan ruang kreativitas baru.',
    isBalanced: false,
  },
  {
    key: 'B',
    title: 'B. Mengikuti seluruh tren global karena dianggap lebih modern dan efisien.',
    responseSpeaker: 'Ilyas',
    portrait: ASSETS.portraitIlyas,
    feedback:
      'Kelebihannya: adaptasi teknologi sangat cepat. Namun keterbatasannya: tanpa filter kritis, masyarakat berisiko mengalami homogenisasi budaya dan kehilangan jati diri serta kedekatan sosial lokal.',
    isBalanced: false,
  },
  {
    key: 'C',
    title: 'C. Menerima pengaruh global secara kritis, mempertahankan nilai lokal, dan mengadaptasikannya agar relevan dengan zaman.',
    responseSpeaker: 'Nino, Ilyas & Dira',
    portrait: ASSETS.portraitNino,
    feedback:
      'Pilihan paling seimbang! Teknologi dan budaya global dimanfaatkan secara sadar lewat literasi digital, sementara budaya lokal diberi ruang berkreasi dan berakulturasi secara positif.',
    isBalanced: true,
  },
];

export const CityChoiceModal: React.FC<CityChoiceModalProps> = ({ onConfirmChoice, onClose }) => {
  const [selected, setSelected] = useState<'A' | 'B' | 'C' | null>(null);
  const current = CHOICES.find((c) => c.key === selected);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/88 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-sky-400/25 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Compass className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="font-display text-xl font-bold text-white">Pilihan Masa Depan Neo-Metropolis</h2>
              <p className="text-xs text-slate-400">
                Gunakan hasil investigasimu untuk menentukan sikap terbaik bagi masyarakat kota
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
          >
            Tutup
          </button>
        </div>

        <div className="space-y-3">
          {CHOICES.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                soundEngine.playSfx(opt.isBalanced ? 'correct' : 'click');
                setSelected(opt.key);
              }}
              className={`w-full text-left p-4 rounded-xl border text-sm transition-colors cursor-pointer ${
                selected === opt.key
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

        {current && (
          <div className="rounded-xl bg-slate-950/85 border border-white/15 p-4 flex items-start gap-4">
            <img
              src={current.portrait}
              alt={current.responseSpeaker}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-xl object-cover object-top border border-white/15 shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Tanggapan {current.responseSpeaker}</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{current.feedback}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
          <p className="text-xs text-slate-400">
            {current && !current.isBalanced
              ? 'Disarankan memilih pendekatan C yang paling seimbang sebelum lanjut ke Evaluasi Akhir.'
              : 'Lanjutkan ke Terminal Evaluasi untuk mengesahkan pemulihan kota.'}
          </p>
          <button
            type="button"
            disabled={!current || !current.isBalanced}
            onClick={() => {
              if (current?.isBalanced) {
                soundEngine.playSfx('correct');
                onConfirmChoice(current.key);
              }
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-sm font-semibold cursor-pointer disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Sahkan Pilihan & Evaluasi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
