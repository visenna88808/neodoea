import React, { useEffect, useState } from 'react';
import { X, Sparkles, Terminal, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { CHARACTER_PROFILES } from '../data/gameData';
import { AnimeCharacterSprite } from './AnimeCharacterSprite';

interface CharacterSheetModalProps {
  onClose: () => void;
}

export const CharacterSheetModal: React.FC<CharacterSheetModalProps> = ({ onClose }) => {
  const [selectedId, setSelectedId] = useState<'nino' | 'ilyas' | 'dira'>('nino');
  const [animTime, setAnimTime] = useState(0);
  const char = CHARACTER_PROFILES.find((c) => c.id === selectedId) || CHARACTER_PROFILES[0];

  useEffect(() => {
    let frameId = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setAnimTime((now - start) / 1000);
      frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const AbilityIcon =
    char.id === 'nino' ? Sparkles : char.id === 'ilyas' ? Terminal : HeartHandshake;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-white/15 shadow-2xl p-6">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <h2 className="font-display text-xl md:text-2xl font-bold text-white">
              Profil, Peran & Tugas Karakter
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Pembagian keahlian tim XI IPS-1 dan tugas spesifik di setiap bab penyelidikan
            </p>
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

        {/* Character Selector Tabs */}
        <div className="mt-4 flex items-center gap-2 p-1 bg-slate-950/70 rounded-xl w-fit">
          {CHARACTER_PROFILES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                selectedId === item.id
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {item.nickname} · {item.abilityName}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Portrait + Gameplay Anime Sprite */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="rounded-xl overflow-hidden border border-white/15 bg-slate-950 aspect-[3/4]">
              <img
                src={char.portraitUrl}
                alt={char.fullName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950/80 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-300">Sprite Anime 2D</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Pose 3/4 serong · Skala tinggi {char.height}
                </p>
              </div>
              <div className="h-28 w-24 flex items-end justify-center overflow-hidden">
                <div className="scale-[0.6] origin-bottom">
                  <AnimeCharacterSprite character={char.id} facing="right" animTime={animTime} />
                </div>
              </div>
            </div>
          </div>

          {/* Identity, Role & Specific Quest Tasks */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <h3 className="font-display text-2xl font-bold text-white">{char.fullName}</h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-sky-300 font-medium">
                <span>{char.role}</span>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span className="text-slate-300">Kelas {char.schoolClass}</span>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span className="text-slate-300">{char.height}</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>Lahir: {char.birthInfo}</span>
                {char.zodiac !== '—' && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Zodiak: {char.zodiac}</span>
                  </>
                )}
                {char.mbti !== '—' && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>MBTI: {char.mbti}</span>
                  </>
                )}
              </div>
            </div>

            {/* Ability & When To Use */}
            <div className="rounded-xl bg-slate-800/70 border border-white/10 p-4 flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-sky-500/15 border border-sky-400/30 flex items-center justify-center shrink-0 text-sky-300">
                <AbilityIcon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">Keahlian: {char.abilityName}</p>
                <p className="text-xs text-slate-200 leading-relaxed">{char.abilityDesc}</p>
                <p className="text-xs text-amber-300/95 leading-relaxed pt-1">{char.whenToUse}</p>
              </div>
            </div>

            {/* Specific Quest Duties */}
            <div className="border-t border-white/10 pt-3">
              <h4 className="text-sm font-semibold text-cyan-300">Tugas Spesifik di Alur Misi</h4>
              <ul className="mt-2 space-y-2 text-xs md:text-sm text-slate-200">
                {char.specificTasks.map((task) => (
                  <li key={task} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{task}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-white/10 pt-3">
              <h4 className="text-sm font-semibold text-sky-300">Ciri Penampilan</h4>
              <ul className="mt-1.5 space-y-1 text-xs md:text-sm text-slate-300 list-disc list-inside">
                {char.appearance.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="border-t border-white/10 pt-3">
              <h4 className="text-sm font-semibold text-sky-300">Kepribadian</h4>
              <p className="mt-1 text-xs md:text-sm text-slate-300 leading-relaxed">{char.personality}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
