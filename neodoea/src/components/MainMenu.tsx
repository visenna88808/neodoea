import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  ChevronRight,
  Film,
  Info,
  Play,
  RotateCcw,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { AREAS, ASSETS, CHARACTER_PROFILES, QUEST_INFO } from '../data/gameData';
import type { AreaId, QuestId } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface MainMenuProps {
  hasSave: boolean;
  savedQuestId?: QuestId;
  savedAreaId?: AreaId;
  savedCluesCount?: number;
  onNewGame: () => void;
  onContinue: () => void;
  onWatchPrologue: () => void;
  onOpenSettings: () => void;
  onOpenCharacters: () => void;
}

const BACKDROP_SCENES: { id: AreaId; label: string; image: string }[] = [
  { id: 'plaza', label: 'Sandang Ayu Plaza', image: ASSETS.bgPlaza },
  { id: 'outskirts', label: 'Pelabuhan', image: ASSETS.bgOutskirts },
  { id: 'stage', label: 'Sanggar Darmoyudho', image: ASSETS.bgStage },
  { id: 'terminal', label: 'Terminal Server', image: ASSETS.bgTerminal },
];

export const MainMenu: React.FC<MainMenuProps> = ({
  hasSave,
  savedQuestId,
  savedAreaId,
  savedCluesCount = 0,
  onNewGame,
  onContinue,
  onWatchPrologue,
  onOpenSettings,
  onOpenCharacters,
}) => {
  const [showCredits, setShowCredits] = useState(false);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [manualSceneOverride, setManualSceneOverride] = useState(false);
  const [hoveredCmd, setHoveredCmd] = useState<number>(0);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // Gentle auto-cycle across scenic Neo-Metropolis backdrops
  useEffect(() => {
    if (manualSceneOverride) return;
    const timer = window.setInterval(() => {
      setSceneIdx((idx) => (idx + 1) % BACKDROP_SCENES.length);
    }, 9500);
    return () => window.clearInterval(timer);
  }, [manualSceneOverride]);

  const commands = useMemo(() => {
    const list: {
      id: string;
      label: string;
      meta?: string;
      icon: React.ComponentType<{ className?: string }>;
      primary?: boolean;
      linkedSceneIdx: number;
      action: () => void;
    }[] = [];

    if (hasSave && savedQuestId) {
      const qInfo = QUEST_INFO[savedQuestId];
      list.push({
        id: 'continue',
        label: 'Lanjutkan',
        meta: qInfo.number,
        icon: Play,
        primary: true,
        linkedSceneIdx: 0,
        action: () => {
          soundEngine.unlock();
          soundEngine.playSfx('portal');
          onContinue();
        },
      });
    }

    list.push({
      id: 'new_game',
      label: hasSave ? 'Mulai Baru' : 'Mulai Main',
      icon: hasSave ? RotateCcw : Play,
      primary: !hasSave,
      linkedSceneIdx: 1,
      action: () => {
        soundEngine.unlock();
        soundEngine.playSfx('portal');
        onNewGame();
      },
    });

    list.push({
      id: 'prologue',
      label: 'Tonton Prolog',
      icon: Film,
      linkedSceneIdx: 1,
      action: () => {
        soundEngine.unlock();
        soundEngine.playSfx('portal');
        onWatchPrologue();
      },
    });

    list.push({
      id: 'characters',
      label: 'Tim & Karakter',
      icon: Users,
      linkedSceneIdx: 2,
      action: () => {
        soundEngine.unlock();
        soundEngine.playSfx('click');
        onOpenCharacters();
      },
    });

    list.push({
      id: 'settings',
      label: 'Pengaturan',
      icon: Settings,
      linkedSceneIdx: 3,
      action: () => {
        soundEngine.unlock();
        soundEngine.playSfx('click');
        onOpenSettings();
      },
    });

    list.push({
      id: 'credits',
      label: 'Tentang Game',
      icon: Info,
      linkedSceneIdx: 0,
      action: () => {
        soundEngine.unlock();
        soundEngine.playSfx('click');
        setShowCredits(true);
      },
    });

    return list;
  }, [hasSave, savedQuestId, onContinue, onNewGame, onWatchPrologue, onOpenCharacters, onOpenSettings]);

  const selectCommand = (idx: number) => {
    setHoveredCmd(idx);
    const cmd = commands[idx];
    if (cmd && !manualSceneOverride) {
      setSceneIdx(cmd.linkedSceneIdx);
    }
  };

  // Smooth keyboard navigation (Up / Down / Enter)
  useEffect(() => {
    if (showCredits) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        soundEngine.unlock();
        soundEngine.playSfx('click');
        selectCommand((hoveredCmd + 1) % commands.length);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        soundEngine.unlock();
        soundEngine.playSfx('click');
        selectCommand((hoveredCmd - 1 + commands.length) % commands.length);
      } else if (e.key === 'Enter') {
        if (document.activeElement?.tagName === 'BUTTON') return;
        e.preventDefault();
        commands[hoveredCmd]?.action();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const currentScene = BACKDROP_SCENES[sceneIdx];
  const savedAreaName = savedAreaId ? AREAS[savedAreaId]?.name : 'Neo-Metropolis';
  const activeQuestTitle = savedQuestId ? QUEST_INFO[savedQuestId].title : 'Gerbang Portal Misterius';

  return (
    <div
      onMouseMove={(e) => {
        const nx = (e.clientX / window.innerWidth - 0.5) * 12;
        const ny = (e.clientY / window.innerHeight - 0.5) * 8;
        setParallax({ x: nx, y: ny });
      }}
      className="relative w-full h-screen overflow-y-auto lg:overflow-hidden bg-[#0c1226] text-slate-50 flex flex-col justify-between px-6 sm:px-10 lg:px-14 py-6 sm:py-8"
    >
      {/* LAYER 1: Airy Anime World Backdrop with Warm Sunset-Indigo Color Harmony */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {BACKDROP_SCENES.map((scene, idx) => (
          <img
            key={scene.id}
            src={scene.image}
            alt={scene.label}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000"
            style={{
              opacity: idx === sceneIdx ? 0.88 : 0,
              transform: `scale(1.04) translate3d(${-parallax.x * 0.55}px, ${parallax.y * 0.45}px, 0)`,
              filter: 'saturate(1.08)',
            }}
          />
        ))}

        {/* Soft Twilight Indigo & Warm Golden-Hour Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d132b]/88 via-[#101836]/28 to-[#0d132b]/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1024]/82 via-transparent to-[#0d132b]/45" />
        <div
          className="absolute inset-0 opacity-45"
          style={{
            background:
              'radial-gradient(circle at 75% 28%, rgba(251, 191, 36, 0.22), transparent 48%), radial-gradient(circle at 22% 68%, rgba(56, 189, 248, 0.2), transparent 45%)',
          }}
        />

        {/* Soft Floating Light Motes */}
        {[24, 42, 60, 78].map((leftPct, i) => (
          <div
            key={leftPct}
            className="absolute rounded-full animate-float-slow"
            style={{
              left: `${leftPct}%`,
              top: `${22 + (i % 3) * 20}%`,
              width: 4 + (i % 2) * 2,
              height: 4 + (i % 2) * 2,
              backgroundColor:
                i % 2 === 0 ? 'rgba(125, 211, 252, 0.65)' : 'rgba(253, 224, 71, 0.55)',
              animationDelay: `${i * 0.8}s`,
              filter: 'blur(0.6px)',
            }}
          />
        ))}
      </div>

      {/* TOP BAR: Clean Title Mark (Top-Left) + Minimal Team & Settings Controls (Top-Right) */}
      <header className="relative z-10 w-full flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-medium text-amber-200/95 tracking-wide drop-shadow-[0_1px_6px_rgba(11,16,36,0.9)]">
            Petualangan Sosiologi · Kelas XII
          </p>
          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight drop-shadow-[0_3px_14px_rgba(11,16,36,0.75)]">
            Misteri Portal{' '}
            <span className="bg-gradient-to-r from-sky-200 via-cyan-200 to-amber-200 bg-clip-text text-transparent">
              Neo-Metropolis
            </span>
          </h1>
        </div>

        {/* Minimal Top-Right Action Pill & Settings Button */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              soundEngine.unlock();
              soundEngine.playSfx('click');
              onOpenCharacters();
            }}
            title="Lihat Profil Nino, Ilyas, & Dira"
            className="flex items-center gap-2.5 pl-2 pr-3.5 py-1.5 rounded-2xl bg-slate-950/45 hover:bg-slate-900/65 border border-white/15 hover:border-sky-300/45 backdrop-blur-md transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-300"
          >
            <div className="flex -space-x-2">
              {CHARACTER_PROFILES.map((member) => (
                <img
                  key={member.id}
                  src={member.portraitUrl}
                  alt={member.nickname}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover object-top ring-1 ring-slate-900"
                />
              ))}
            </div>
            <span className="text-xs font-medium text-slate-100 whitespace-nowrap hidden sm:inline">
              Tim XI IPS-1
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.unlock();
              soundEngine.playSfx('click');
              onOpenSettings();
            }}
            aria-label="Pengaturan"
            title="Pengaturan Audio & Kontrol"
            className="w-10 h-10 rounded-2xl bg-slate-950/45 hover:bg-slate-900/65 border border-white/15 hover:border-amber-200/50 backdrop-blur-md text-slate-100 hover:text-amber-200 flex items-center justify-center transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-300"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MIDDLE STAGE: Left Minimal Vertical Menu + Wide Open Breathable World View */}
      <main className="relative z-10 flex-1 w-full flex flex-col lg:flex-row lg:items-center justify-between gap-8 my-6 lg:my-0">
        {/* LEFT COLUMN: Airy Soft-Rounded Youthful Menu Stack */}
        <nav aria-label="Menu Utama" className="flex flex-col items-start gap-2 w-full max-w-[290px]">
          {commands.map((cmd, idx) => {
            const Icon = cmd.icon;
            const active = hoveredCmd === idx;
            return (
              <button
                key={cmd.id}
                type="button"
                onMouseEnter={() => selectCommand(idx)}
                onFocus={() => selectCommand(idx)}
                onClick={cmd.action}
                className={`group w-full flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-300 ${
                  cmd.primary
                    ? active
                      ? 'bg-gradient-to-r from-amber-300 via-rose-300 to-sky-300 text-slate-950 shadow-[0_8px_28px_rgba(251,191,36,0.35)] translate-x-1.5'
                      : 'bg-gradient-to-r from-amber-300/90 via-orange-200/90 to-sky-200/90 text-slate-950 shadow-[0_4px_18px_rgba(251,191,36,0.22)]'
                    : active
                    ? 'bg-white/16 backdrop-blur-md border border-white/25 text-white shadow-[0_6px_22px_rgba(15,23,42,0.35)] translate-x-1.5'
                    : 'bg-transparent border border-transparent text-slate-100/85 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      active ? 'scale-110' : ''
                    } ${
                      cmd.primary
                        ? 'text-slate-900'
                        : active
                        ? 'text-amber-200'
                        : 'text-sky-200/80'
                    }`}
                  />
                  <span className="font-display text-lg sm:text-xl font-semibold tracking-tight whitespace-nowrap">
                    {cmd.label}
                  </span>
                </span>

                <span className="flex items-center gap-1.5 shrink-0">
                  {cmd.meta && (
                    <span
                      className={`text-[11px] font-medium whitespace-nowrap ${
                        cmd.primary ? 'text-slate-800/85' : 'text-sky-200/80'
                      }`}
                    >
                      {cmd.meta}
                    </span>
                  )}
                  <ChevronRight
                    className={`w-4 h-4 transition-all duration-200 ${
                      active ? 'opacity-90 translate-x-0.5' : 'opacity-0 -translate-x-1'
                    } ${cmd.primary ? 'text-slate-900' : 'text-amber-200'}`}
                  />
                </span>
              </button>
            );
          })}
        </nav>

        {/* RIGHT SIDE: Minimal Floating Chapter / Prologue Card (Keeps Center Open & Uncluttered) */}
        <aside className="self-end lg:self-end w-full sm:w-[300px] shrink-0">
          <button
            type="button"
            onClick={() => {
              soundEngine.unlock();
              soundEngine.playSfx('portal');
              if (hasSave) {
                onContinue();
              } else {
                onWatchPrologue();
              }
            }}
            className="group relative w-full rounded-2xl overflow-hidden bg-slate-950/50 hover:bg-slate-950/65 border border-white/15 hover:border-amber-200/50 backdrop-blur-lg p-4 text-left transition-all duration-200 hover:-translate-y-0.5 shadow-[0_12px_32px_rgba(8,12,28,0.45)] cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-300"
          >
            <div className="flex items-center gap-3.5">
              <img
                src={hasSave ? ASSETS.portraitNino : ASSETS.cutsceneCorridorPortal}
                alt={hasSave ? 'Lanjutkan Petualangan' : 'Prolog Sekolah'}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-xl object-cover object-top shrink-0 border border-white/15 group-hover:scale-105 transition-transform duration-300"
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-[11px] font-medium text-amber-200">
                  {hasSave && savedQuestId
                    ? `${QUEST_INFO[savedQuestId].number} · ${savedCluesCount}/7 Petunjuk`
                    : 'Kisah Pembuka Anime'}
                </p>
                <p className="font-display text-sm font-semibold text-white truncate">
                  {hasSave ? activeQuestTitle : 'Lorong & Portal Sekolah'}
                </p>
                <p className="text-xs text-sky-200/85 truncate">
                  {hasSave ? `Lokasi: ${savedAreaName}` : 'Tonton cutscene prolog'}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-200/80 shrink-0 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </aside>
      </main>

      {/* BOTTOM BAR: Lightweight Team Portraits (Bottom-Left) + Soft Scenic Dots (Bottom-Right) */}
      <footer className="relative z-10 w-full flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
          {CHARACTER_PROFILES.map((member) => (
            <button
              key={member.id}
              type="button"
              onClick={() => {
                soundEngine.unlock();
                soundEngine.playSfx('click');
                onOpenCharacters();
              }}
              title={`${member.nickname} — ${member.role}`}
              className="group relative w-9 h-9 rounded-xl overflow-hidden border border-white/20 hover:border-amber-200/80 bg-slate-950/40 transition-all duration-150 hover:-translate-y-0.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-sky-300"
            >
              <img
                src={member.portraitUrl}
                alt={member.nickname}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
            </button>
          ))}
          <span className="ml-1.5 text-xs text-slate-200/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            Nino · Ilyas · Dira
          </span>
        </div>

        {/* Minimal Backdrop Location Switcher */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-200/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            {currentScene.label}
          </span>
          <div className="flex items-center gap-1.5">
            {BACKDROP_SCENES.map((scene, idx) => (
              <button
                key={scene.id}
                type="button"
                aria-label={`Lihat latar ${scene.label}`}
                title={scene.label}
                onClick={() => {
                  soundEngine.unlock();
                  soundEngine.playSfx('click');
                  setManualSceneOverride(true);
                  setSceneIdx(idx);
                }}
                className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                  idx === sceneIdx
                    ? 'w-6 bg-amber-200 shadow-[0_0_8px_rgba(253,230,138,0.6)]'
                    : 'w-2 bg-white/35 hover:bg-white/65'
                }`}
              />
            ))}
          </div>
        </div>
      </footer>

      {/* Credits & Sociology Summary Modal */}
      {showCredits && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900/95 border border-white/15 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-sky-300" />
                <h2 className="font-display text-xl font-bold text-white">
                  Tentang & Materi Pembelajaran
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCredits(false)}
                aria-label="Tutup"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
              <p>
                <strong className="text-white">Misteri Portal Neo-Metropolis</strong> adalah game
                petualangan naratif 2D bergaya anime untuk pembelajaran Sosiologi SMA Kelas XII.
              </p>
              <p>
                Topik inti: Globalisasi (Anthony Giddens), perubahan pola interaksi sosial,
                homogenisasi budaya dan pelestarian budaya lokal, literasi digital terhadap sistem
                algoritma, serta sikap selektif dan adaptif dalam masyarakat global.
              </p>
              <p className="text-xs text-slate-400 pt-2 border-t border-white/10">
                Tokoh: Adnan Naurel Elnino (Nino) · Ilyas Saputra · Adira Widhiyani (Dira)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
