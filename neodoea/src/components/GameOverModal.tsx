import React from 'react';
import { RotateCcw, ShieldAlert, Home, RefreshCw } from 'lucide-react';
import { CHARACTER_PROFILES } from '../data/gameData';
import type { GameOverReason } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface GameOverModalProps {
  reason: GameOverReason;
  onRetryCheckpoint: () => void;
  onRestartGame: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  reason,
  onRetryCheckpoint,
  onRestartGame,
  onMainMenu,
}) => {
  const chosenProfile =
    CHARACTER_PROFILES.find((p) => p.id === reason.chosenCharacter) || CHARACTER_PROFILES[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/92 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-rose-500/40 shadow-2xl p-6 md:p-7 space-y-5">
        {/* Top Failure Header */}
        <div className="flex items-start gap-4 border-b border-white/10 pb-5">
          <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-400/40 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-rose-300">
              Game Over · {reason.questLabel}
            </p>
            <h2 className="font-display text-2xl font-bold text-white mt-0.5 leading-snug">
              {reason.title}
            </h2>
          </div>
        </div>

        {/* Chosen Character & Cause */}
        <div className="flex items-start gap-4 rounded-xl bg-slate-950/75 border border-white/10 p-4">
          <img
            src={chosenProfile.portraitUrl}
            alt={chosenProfile.fullName}
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-xl object-cover object-top border border-rose-400/35 shrink-0 grayscale-[35%]"
          />
          <div className="space-y-1.5">
            <p className="text-xs text-slate-400">
              Karakter yang ditugaskan: <strong className="text-slate-100">{chosenProfile.nickname}</strong> ({chosenProfile.abilityName})
            </p>
            <p className="text-sm text-rose-100 leading-relaxed">{reason.cause}</p>
          </div>
        </div>

        {/* Sociological / Tactical Insight */}
        <div className="rounded-xl bg-slate-800/60 border border-white/10 p-4 space-y-1.5">
          <p className="text-xs font-semibold text-sky-300">
            Evaluasi Tim · Keahlian yang Dibutuhkan: {reason.recommendedSkill}
          </p>
          <p className="text-sm text-slate-200 leading-relaxed">{reason.lesson}</p>
        </div>

        {/* Recovery Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx('click');
              onMainMenu();
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Home className="w-4 h-4" />
            <span>Menu Utama</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx('click');
              onRestartGame();
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Mulai Ulang</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx('click');
              onRetryCheckpoint();
            }}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shadow-lg"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Coba Lagi dari Checkpoint</span>
          </button>
        </div>
      </div>
    </div>
  );
};
