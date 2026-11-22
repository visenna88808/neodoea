import React, { useEffect } from 'react';
import { Award, CheckCircle2, Gift, KeyRound, Unlock, X } from 'lucide-react';
import type { SceneReward } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface MissionRewardModalProps {
  reward: SceneReward;
  unlockedCount: number;
  totalRewards: number;
  onClose: () => void;
}

export const MissionRewardModal: React.FC<MissionRewardModalProps> = ({
  reward,
  unlockedCount,
  totalRewards,
  onClose,
}) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        soundEngine.playSfx('click');
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="w-full max-w-md rounded-2xl bg-slate-900 border-2 shadow-2xl overflow-hidden"
        style={{ borderColor: `${reward.accentHex}88` }}
      >
        <div
          className="px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3"
          style={{
            background: `linear-gradient(135deg, ${reward.accentHex}26 0%, rgba(15,23,42,0.95) 100%)`,
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border"
              style={{
                backgroundColor: `${reward.accentHex}22`,
                borderColor: `${reward.accentHex}66`,
                color: reward.accentHex,
              }}
            >
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                Kunci Akses Terbuka!
              </p>
              <h3 className="font-display text-lg font-bold text-white leading-tight">
                {reward.keyName}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx('click');
              onClose();
            }}
            aria-label="Tutup Hadiah"
            className="w-9 h-9 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{reward.description}</p>

          <div className="rounded-xl bg-slate-950/80 border border-white/10 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Unlock className="w-4 h-4 text-emerald-400 shrink-0" />
                Membuka Scene Berikutnya
              </span>
              <span className="font-semibold text-emerald-300 text-right">{reward.unlocksScene}</span>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t border-white/10">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-sky-300 shrink-0" />
                Lencana Wilayah
              </span>
              <span className="font-semibold text-white text-right">{reward.badgeName}</span>
            </div>

            <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t border-white/10">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-amber-300 shrink-0" />
                Hadiah Misi
              </span>
              <span className="font-semibold text-amber-200 text-right">{reward.itemReward}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-xs text-slate-400 flex items-center gap-1.5 tabular-nums">
              <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                Koleksi Kunci: <strong className="text-amber-200">{unlockedCount}/{totalRewards}</strong>
              </span>
            </span>

            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('click');
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs sm:text-sm font-bold cursor-pointer whitespace-nowrap"
            >
              Simpan Kunci [Spasi]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

