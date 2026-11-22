import React, { useState } from 'react';
import { BookOpen, CheckCircle2, Circle, Gift, KeyRound, Lock, MapPin, Unlock, X } from 'lucide-react';
import { CLUES, SCENE_REWARD_LIST, STORY_CHAPTERS } from '../data/gameData';
import type { QuestId, SaveState } from '../types/game';
import { soundEngine } from '../audio/soundEngine';

interface InvestigationJournalModalProps {
  save: SaveState;
  initialTab?: 'clues' | 'roadmap' | 'rewards';
  onClose: () => void;
}

const QUEST_ORDER: QuestId[] = ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'COMPLETED'];

export const InvestigationJournalModal: React.FC<InvestigationJournalModalProps> = ({
  save,
  initialTab = 'clues',
  onClose,
}) => {
  const { questId, discoveredClues, solvedBoards, flags, unlockedRewards = [] } = save;
  const unlockedKeysCount = SCENE_REWARD_LIST.filter((r) => unlockedRewards.includes(r.id)).length;
  const allClueList = Object.values(CLUES);
  const firstDiscovered = allClueList.find((c) => discoveredClues.includes(c.id)) || allClueList[0];
  const [activeTab, setActiveTab] = useState<'clues' | 'roadmap' | 'rewards'>(initialTab);
  const [selectedId, setSelectedId] = useState<string>(firstDiscovered.id);
  const activeClue = CLUES[selectedId] || firstDiscovered;
  const isUnlocked = discoveredClues.includes(activeClue.id);
  const currentQuestIndex = QUEST_ORDER.indexOf(questId);

  const isTaskDone = (task: (typeof STORY_CHAPTERS)[number]['tasks'][number]) => {
    if (task.flagKey) return Boolean(flags[task.flagKey]);
    if (task.boardId) return solvedBoards.includes(task.boardId);
    if (task.fieldKey) return Boolean(save[task.fieldKey]);
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[88vh] flex flex-col rounded-2xl bg-slate-900 border border-white/15 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <div>
              <h2 className="font-display text-xl font-bold text-white">Jurnal Investigasi</h2>
              <p className="text-xs text-slate-400">
                {discoveredClues.length} dari {allClueList.length} catatan terkumpul
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/80 border border-white/10">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx('click');
                  setActiveTab('clues');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'clues'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Catatan Petunjuk
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx('click');
                  setActiveTab('roadmap');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'roadmap'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Alur Misi & Tugas Tim
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx('click');
                  setActiveTab('rewards');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                  activeTab === 'rewards'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span className="tabular-nums">Kunci ({unlockedKeysCount}/{SCENE_REWARD_LIST.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup Jurnal"
              className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeTab === 'clues' ? (
          <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12">
            {/* Clue List */}
            <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-white/10 p-4 space-y-2 bg-slate-950/40">
              {allClueList.map((clue) => {
                const found = discoveredClues.includes(clue.id);
                const selected = clue.id === activeClue.id;
                return (
                  <button
                    key={clue.id}
                    type="button"
                    onClick={() => setSelectedId(clue.id)}
                    className={`w-full text-left px-3.5 py-3 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                      selected
                        ? 'bg-sky-950/70 border-sky-400/60 text-white'
                        : found
                        ? 'bg-slate-900/70 border-white/10 text-slate-200 hover:bg-slate-800/70'
                        : 'bg-slate-950/60 border-white/5 text-slate-500'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium text-sky-300/90">{clue.code}</p>
                      <p className="text-sm font-semibold truncate">
                        {found ? clue.title : 'Belum ditemukan'}
                      </p>
                    </div>
                    {found ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Clue Detail + Provisional Conclusions */}
            <div className="md:col-span-7 p-6 flex flex-col justify-between gap-6">
              {isUnlocked ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-sky-300 font-medium">
                    <span>{activeClue.code}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeClue.sociologyConcept}</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white">{activeClue.title}</h3>
                  <p className="text-sm text-slate-200 leading-relaxed">{activeClue.summary}</p>
                  <p className="text-xs text-slate-400 pt-2 border-t border-white/10">
                    Sumber: {activeClue.source}
                  </p>
                </div>
              ) : (
                <div className="py-12 text-center space-y-2">
                  <Lock className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-sm font-medium text-slate-300">Petunjuk Belum Ditemukan</p>
                  <p className="text-xs text-slate-400">
                    Jelajahi area Neo-Metropolis, ajak bicara warga, dan gunakan kemampuan tim untuk membuka catatan ini.
                  </p>
                </div>
              )}

              <div className="rounded-xl bg-slate-950/80 border border-white/10 p-4 space-y-2">
                <h4 className="text-xs font-semibold text-amber-300">Kesimpulan Sementara Investigasi</h4>
                {solvedBoards.length === 0 ? (
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Belum ada kesimpulan resmi. Kumpulkan petunjuk dari lapangan lalu hubungkan di Papan Analisis.
                  </p>
                ) : (
                  <ul className="space-y-1.5 text-xs text-slate-200 leading-relaxed list-disc list-inside">
                    {solvedBoards.includes('board1') && (
                      <li>
                        Gejala awal: Paparan arus informasi global tanpa kesadaran kritis menggeser interaksi sosial langsung di ruang publik.
                      </li>
                    )}
                    {solvedBoards.includes('board2') && (
                      <li>
                        Akar kasus: Kombinasi ruang gema algoritma, kurangnya literasi digital, serta minimnya ruang adaptasi dan promosi budaya lokal.
                      </li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'roadmap' ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-3.5 bg-slate-950/35">
            <p className="text-xs text-slate-400">
              Struktur misi Bab 1–5 beserta penanggung jawab tugas (Nino, Ilyas, Dira) dan materi Sosiologi Kelas XII.
            </p>
            {STORY_CHAPTERS.map((ch) => {
              const chapterIdx = QUEST_ORDER.indexOf(ch.questId);
              const isCompleted = currentQuestIndex > chapterIdx;
              const isCurrent = currentQuestIndex === chapterIdx;

              return (
                <div
                  key={ch.questId}
                  className={`rounded-xl border p-4 space-y-3 transition-colors ${
                    isCurrent
                      ? 'bg-sky-950/45 border-sky-400/50'
                      : isCompleted
                      ? 'bg-emerald-950/25 border-emerald-400/30'
                      : 'bg-slate-900/60 border-white/10 opacity-80'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className={isCurrent ? 'text-sky-300' : isCompleted ? 'text-emerald-300' : 'text-slate-400'}>
                        {ch.chapter}: {ch.title}
                      </span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-slate-300 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {ch.location}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isCompleted
                          ? 'text-emerald-300'
                          : isCurrent
                          ? 'text-amber-300'
                          : 'text-slate-500'
                      }`}
                    >
                      {isCompleted ? 'Selesai' : isCurrent ? 'Sedang Berjalan' : 'Berikutnya'}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-cyan-300">Materi: {ch.sociologyTopic}</p>
                    <p className="text-xs md:text-sm text-slate-300 mt-1 leading-relaxed">{ch.summary}</p>
                  </div>

                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    {ch.tasks.map((task) => {
                      const done = isTaskDone(task);
                      const displayAssignee =
                        done || task.assignee === 'Tim' ? task.assignee : '?';
                      const roleColor =
                        displayAssignee === 'Nino'
                          ? 'text-red-300'
                          : displayAssignee === 'Ilyas'
                          ? 'text-sky-300'
                          : displayAssignee === 'Dira'
                          ? 'text-rose-300'
                          : displayAssignee === '?'
                          ? 'text-slate-400'
                          : 'text-amber-300';
                      return (
                        <div key={task.id} className="flex items-start gap-2 text-xs">
                          {done ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                          )}
                          <span className={done ? 'text-slate-400 line-through' : 'text-slate-200'}>
                            <strong className={roleColor}>[{displayAssignee}]</strong> {task.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/35">
            <div className="rounded-xl bg-slate-900 border border-amber-400/30 p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-300" />
                  <span>Koleksi Kunci Akses Scene</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Setiap wilayah yang dituntaskan memberi Kunci Akses wajib untuk membuka jalan ke scene berikutnya.
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-400">Kunci Terkumpul</p>
                <p className="font-mono text-lg font-bold text-amber-300 tabular-nums">
                  {unlockedKeysCount} / {SCENE_REWARD_LIST.length}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {SCENE_REWARD_LIST.map((reward) => {
                const earned = unlockedRewards.includes(reward.id);
                return (
                  <div
                    key={reward.id}
                    className={`rounded-xl border p-4 space-y-2.5 transition-colors ${
                      earned
                        ? 'bg-slate-900/90 border-amber-400/45 shadow-lg'
                        : 'bg-slate-950/65 border-white/10 opacity-75'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center border shrink-0"
                          style={{
                            backgroundColor: earned ? `${reward.accentHex}22` : 'rgba(30,41,59,0.7)',
                            borderColor: earned ? `${reward.accentHex}66` : 'rgba(255,255,255,0.1)',
                            color: earned ? reward.accentHex : '#64748b',
                          }}
                        >
                          {earned ? <KeyRound className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-[11px] text-slate-400">{reward.sceneName}</p>
                          <h4 className="text-sm font-bold text-white">
                            {earned ? reward.keyName : 'Kunci Terkunci'}
                          </h4>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                          earned
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {earned ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        <span>{earned ? 'Terbuka' : 'Terkunci'}</span>
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {earned
                        ? reward.description
                        : `Selesaikan misi pada wilayah ini untuk memperoleh kunci menuju ${reward.unlocksScene}.`}
                    </p>

                    <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="flex items-center gap-1.5">
                        <Gift className={`w-3.5 h-3.5 shrink-0 ${earned ? 'text-amber-300' : 'text-slate-600'}`} />
                        <span className={earned ? 'text-amber-200 font-medium' : 'text-slate-500'}>
                          {earned ? reward.badgeName : 'Lencana tersembunyi'}
                        </span>
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Akses: <strong className={earned ? 'text-emerald-300' : 'text-slate-500'}>{reward.unlocksScene}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
