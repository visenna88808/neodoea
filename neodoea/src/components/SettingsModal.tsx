import React from 'react';
import { Volume2, Sliders, Smartphone, X } from 'lucide-react';
import type { GameSettings } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdate: (next: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onUpdate, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/15 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-sky-400" />
            <h2 className="font-display text-xl font-bold text-white">Pengaturan</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Pengaturan"
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-200">
                <Volume2 className="w-4 h-4 text-sky-400" />
                <span>Volume Musik</span>
              </span>
              <span className="font-mono-data text-xs text-sky-300">
                {Math.round(settings.musicVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.musicVolume}
              onChange={(e) => onUpdate({ ...settings, musicVolume: Number(e.target.value) })}
              className="w-full accent-sky-500 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-200">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>Volume Efek Suara</span>
              </span>
              <span className="font-mono-data text-xs text-cyan-300">
                {Math.round(settings.sfxVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.sfxVolume}
              onChange={(e) => {
                const nextSfx = Number(e.target.value);
                onUpdate({ ...settings, sfxVolume: nextSfx });
              }}
              onMouseUp={() => soundEngine.playSfx('click')}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-200">Tombol Kontrol Sentuh</p>
                <p className="text-xs text-slate-400">Tampilkan tombol virtual di layar</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playSfx('click');
                onUpdate({ ...settings, showTouchControls: !settings.showTouchControls });
              }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                settings.showTouchControls
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-300 border border-white/10'
              }`}
            >
              {settings.showTouchControls ? 'Aktif' : 'Nonaktif'}
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold cursor-pointer"
          >
            Simpan & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
