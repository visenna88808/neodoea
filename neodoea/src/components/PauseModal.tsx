import React from 'react';
import { Play, RotateCcw, Sliders, Home } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenSettings,
  onMainMenu,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-white/15 shadow-2xl p-6 space-y-4">
        <div className="text-center pb-2 border-b border-white/10">
          <h2 className="font-display text-2xl font-bold text-white">Permainan Dijeda</h2>
          <p className="text-xs text-slate-400 mt-1">Progresmu tersimpan otomatis di perangkat ini</p>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onResume}
            className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>Lanjutkan</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-medium text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>Pengaturan</span>
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-200 font-medium text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Mulai Ulang dari Awal</span>
          </button>

          <button
            type="button"
            onClick={onMainMenu}
            className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-white/10 text-slate-300 font-medium text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Menu Utama</span>
          </button>
        </div>
      </div>
    </div>
  );
};
