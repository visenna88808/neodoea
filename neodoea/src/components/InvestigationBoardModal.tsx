import React, { useState } from 'react';
import { CheckCircle2, Network, RotateCcw, X, AlertCircle } from 'lucide-react';
import { CLUES, INVESTIGATION_BOARDS } from '../data/gameData';
import { soundEngine } from '../audio/soundEngine';

interface InvestigationBoardModalProps {
  discoveredClues: string[];
  solvedBoards: string[];
  initialBoard?: 'board1' | 'board2';
  onSolveBoard: (boardId: 'board1' | 'board2') => void;
  onClose: () => void;
}

export const InvestigationBoardModal: React.FC<InvestigationBoardModalProps> = ({
  discoveredClues,
  solvedBoards,
  initialBoard = 'board1',
  onSolveBoard,
  onClose,
}) => {
  const [activeBoardId, setActiveBoardId] = useState<'board1' | 'board2'>(initialBoard);
  const [linkedClueIds, setLinkedClueIds] = useState<string[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const board = INVESTIGATION_BOARDS[activeBoardId];
  const isAlreadySolved = solvedBoards.includes(activeBoardId);
  const hasAllRequiredClues = board.requiredClueIds.every((id) => discoveredClues.includes(id));

  const toggleClue = (clueId: string) => {
    if (isAlreadySolved) return;
    soundEngine.playSfx('click');
    setFeedback(null);
    setLinkedClueIds((prev) =>
      prev.includes(clueId) ? prev.filter((id) => id !== clueId) : [...prev, clueId]
    );
  };

  const handleAnalyze = () => {
    if (!hasAllRequiredClues) {
      soundEngine.playSfx('wrong');
      setFeedback({
        ok: false,
        text: 'Belum semua petunjuk wajib terkumpul. Lanjutkan eksplorasi area terkait terlebih dahulu.',
      });
      return;
    }

    const allRequiredLinked = board.requiredClueIds.every((id) => linkedClueIds.includes(id));
    if (!allRequiredLinked) {
      soundEngine.playSfx('wrong');
      setFeedback({
        ok: false,
        text: `Pilih dan tautkan semua bukti relevan (${board.requiredClueIds.map((id) => CLUES[id].code).join(', ')}) di papan bukti terlebih dahulu.`,
      });
      return;
    }

    if (!selectedOptionId) {
      soundEngine.playSfx('wrong');
      setFeedback({ ok: false, text: 'Pilih salah satu rumusan kesimpulan di bawah ini.' });
      return;
    }

    const chosen = board.options.find((o) => o.id === selectedOptionId);
    if (!chosen) return;

    if (chosen.isCorrect) {
      soundEngine.playSfx('correct');
      setFeedback({ ok: true, text: chosen.feedback });
      onSolveBoard(activeBoardId);
    } else {
      soundEngine.playSfx('wrong');
      setFeedback({ ok: false, text: chosen.feedback });
    }
  };

  const switchBoard = (id: 'board1' | 'board2') => {
    setActiveBoardId(id);
    setLinkedClueIds([]);
    setSelectedOptionId(null);
    setFeedback(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/88 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-white/15 shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Network className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-display text-xl font-bold text-white">Papan Investigasi</h2>
              <p className="text-xs text-slate-400">
                Hubungkan petunjuk lapangan untuk merumuskan kesimpulan sosiologis
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Papan Investigasi"
            className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Board Switcher */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950/80 w-fit">
            {(['board1', 'board2'] as const).map((id, idx) => {
              const solved = solvedBoards.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => switchBoard(id)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    activeBoardId === id
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>Kasus {idx + 1}</span>
                  {solved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
                </button>
              );
            })}
          </div>

          <div>
            <h3 className="font-display text-lg font-bold text-white">{board.title}</h3>
            <p className="text-sm text-slate-300 mt-1">{board.prompt}</p>
          </div>

          {/* Step 1: Link Evidence Cards */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-sky-300">
                Langkah 1: Pilih & tautkan bukti yang dibutuhkan ({board.requiredClueIds.length} bukti)
              </p>
              {!isAlreadySolved && linkedClueIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setLinkedClueIds([])}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset tautan</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {board.requiredClueIds.map((clueId) => {
                const clue = CLUES[clueId];
                const found = discoveredClues.includes(clueId);
                const linked = isAlreadySolved || linkedClueIds.includes(clueId);

                return (
                  <button
                    key={clueId}
                    type="button"
                    disabled={!found || isAlreadySolved}
                    onClick={() => toggleClue(clueId)}
                    className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer disabled:cursor-not-allowed ${
                      !found
                        ? 'bg-slate-950/60 border-white/5 opacity-50'
                        : linked
                        ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-800/70 border-white/10 text-slate-200 hover:border-sky-400/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-medium text-cyan-300">{clue.code}</span>
                      <span className="text-[11px] text-slate-400">
                        {!found ? 'Belum ditemukan' : linked ? 'Tertaut' : 'Klik untuk tautkan'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold mt-1">
                      {found ? clue.title : 'Bukti belum terbuka'}
                    </p>
                    {found && <p className="text-xs text-slate-300 mt-1 line-clamp-2">{clue.summary}</p>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Conclusion */}
          <div>
            <p className="text-xs font-semibold text-sky-300 mb-2">
              Langkah 2: Tentukan kesimpulan yang paling sesuai dengan bukti
            </p>
            <div className="space-y-2.5">
              {board.options.map((opt) => {
                const selected = isAlreadySolved ? opt.isCorrect : selectedOptionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={isAlreadySolved}
                    onClick={() => {
                      soundEngine.playSfx('click');
                      setSelectedOptionId(opt.id);
                      setFeedback(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border text-sm transition-colors cursor-pointer disabled:cursor-default ${
                      selected
                        ? isAlreadySolved
                          ? 'bg-emerald-950/60 border-emerald-400 text-emerald-100'
                          : 'bg-sky-950/70 border-sky-400 text-white'
                        : 'bg-slate-800/60 border-white/10 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback Banner */}
          {(feedback || isAlreadySolved) && (
            <div
              className={`rounded-xl p-4 border flex items-start gap-3 ${
                feedback?.ok || isAlreadySolved
                  ? 'bg-emerald-950/50 border-emerald-400/50 text-emerald-100'
                  : 'bg-rose-950/50 border-rose-400/50 text-rose-100'
              }`}
            >
              {feedback?.ok || isAlreadySolved ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <p className="text-sm leading-relaxed">
                {isAlreadySolved
                  ? board.options.find((o) => o.isCorrect)?.feedback
                  : feedback?.text}
              </p>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
            {isAlreadySolved ? (
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold cursor-pointer"
              >
                Lanjutkan Investigasi
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAnalyze}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold cursor-pointer"
              >
                Periksa Kesimpulan
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
