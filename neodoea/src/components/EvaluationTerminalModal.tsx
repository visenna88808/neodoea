import React, { useState } from 'react';
import { Award, CheckCircle2, AlertCircle, Terminal } from 'lucide-react';
import { EVALUATION_QUESTIONS } from '../data/gameData';
import { soundEngine } from '../audio/soundEngine';

interface EvaluationTerminalModalProps {
  onComplete: (score: number, attempts: number) => void;
  onClose: () => void;
}

export const EvaluationTerminalModal: React.FC<EvaluationTerminalModalProps> = ({
  onComplete,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedKey, setSelectedKey] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isCorrectCurrent, setIsCorrectCurrent] = useState(false);
  const [wrongMsg, setWrongMsg] = useState<string | null>(null);
  const [firstTryCorrectCount, setFirstTryCorrectCount] = useState(0);
  const [hadWrongOnCurrent, setHadWrongOnCurrent] = useState(false);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = EVALUATION_QUESTIONS[currentIndex];

  const handleSubmitAnswer = () => {
    if (!selectedKey) return;
    setTotalAttempts((a) => a + 1);

    if (selectedKey === q.correctKey) {
      soundEngine.playSfx('correct');
      if (!hadWrongOnCurrent) {
        setFirstTryCorrectCount((c) => c + 1);
      }
      setIsCorrectCurrent(true);
      setWrongMsg(null);
    } else {
      soundEngine.playSfx('wrong');
      setHadWrongOnCurrent(true);
      setWrongMsg('Jawaban belum tepat. Coba tinjau kembali konsep globalisasi atau homogenisasi budaya lalu pilih lagi.');
    }
  };

  const handleNextQuestion = () => {
    soundEngine.playSfx('click');
    if (currentIndex + 1 < EVALUATION_QUESTIONS.length) {
      setCurrentIndex((i) => i + 1);
      setSelectedKey(null);
      setIsCorrectCurrent(false);
      setWrongMsg(null);
      setHadWrongOnCurrent(false);
    } else {
      setFinished(true);
    }
  };

  const finalScore = Math.round((firstTryCorrectCount / EVALUATION_QUESTIONS.length) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-emerald-400/30 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="font-display text-xl font-bold text-white">Terminal Evaluasi Pembelajaran</h2>
              <p className="text-xs text-slate-400">
                {finished
                  ? 'Evaluasi Sosiologi Selesai'
                  : `Pertanyaan ${currentIndex + 1} dari ${EVALUATION_QUESTIONS.length} · Wajib diselesaikan untuk menstabilkan portal`}
              </p>
            </div>
          </div>
          {!finished && (
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 cursor-pointer"
            >
              Tunda
            </button>
          )}
        </div>

        {!finished ? (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-emerald-300">{q.topic}</p>
            <p className="text-base text-white leading-relaxed font-medium">{q.question}</p>

            <div className="space-y-2.5">
              {q.options.map((opt) => {
                const isSelected = selectedKey === opt.key;
                const showCorrectHighlight = isCorrectCurrent && opt.key === q.correctKey;

                return (
                  <button
                    key={opt.key}
                    type="button"
                    disabled={isCorrectCurrent}
                    onClick={() => {
                      soundEngine.playSfx('click');
                      setSelectedKey(opt.key);
                      setWrongMsg(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border text-sm transition-colors cursor-pointer disabled:cursor-default flex items-start gap-3 ${
                      showCorrectHighlight
                        ? 'bg-emerald-950/65 border-emerald-400 text-emerald-100'
                        : isSelected
                        ? 'bg-sky-950/70 border-sky-400 text-white'
                        : 'bg-slate-800/75 border-white/10 text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-mono-data font-bold text-sky-300">{opt.key}.</span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>

            {wrongMsg && (
              <div className="rounded-xl p-3.5 bg-rose-950/50 border border-rose-400/50 flex items-start gap-2.5 text-sm text-rose-100">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span>{wrongMsg}</span>
              </div>
            )}

            {isCorrectCurrent && (
              <div className="rounded-xl p-4 bg-emerald-950/55 border border-emerald-400/50 flex items-start gap-3 text-sm text-emerald-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-emerald-300">Benar!</p>
                  <p className="mt-1 leading-relaxed">{q.explanation}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-white/10">
              {!isCorrectCurrent ? (
                <button
                  type="button"
                  disabled={!selectedKey}
                  onClick={handleSubmitAnswer}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white text-sm font-semibold cursor-pointer"
                >
                  Kirim Jawaban
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold cursor-pointer"
                >
                  {currentIndex + 1 < EVALUATION_QUESTIONS.length ? 'Soal Berikutnya' : 'Lihat Skor & Ringkasan'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-xl bg-emerald-950/40 border border-emerald-400/40 p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <Award className="w-9 h-9 text-amber-300 shrink-0" />
                <div>
                  <p className="text-xs text-emerald-300 font-medium">Evaluasi Selesai</p>
                  <h3 className="font-display text-2xl font-bold text-white">
                    Skor Ketepatan Awal: <span className="font-mono-data text-amber-300">{finalScore}/100</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Menjawab tepat pada percobaan pertama: {firstTryCorrectCount}/{EVALUATION_QUESTIONS.length} soal · Total percobaan: {totalAttempts}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950/80 border border-white/10 p-5 space-y-3">
              <h4 className="font-display text-base font-bold text-sky-300">Ringkasan Materi Sosiologi (Kelas XII)</h4>
              <ul className="space-y-2 text-sm text-slate-200 leading-relaxed list-disc list-inside">
                <li>
                  <strong className="text-white">Globalisasi (Anthony Giddens):</strong> Intensifikasi hubungan sosial mendunia yang membuat interaksi lokal dan global saling terhubung cepat.
                </li>
                <li>
                  <strong className="text-white">Homogenisasi Budaya vs Akulturasi:</strong> Homogenisasi menyeragamkan pola konsumsi populer, sedangkan akulturasi kreatif memadukan budaya lokal dan global menjadi identitas baru yang positif.
                </li>
                <li>
                  <strong className="text-white">Literasi Digital & Algoritma:</strong> Algoritma rekomendasi dapat memperkuat ruang gema, tetapi masyarakat tetap memegang peran kritis untuk menyaring pengaruh global.
                </li>
              </ul>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playSfx('portal');
                  onComplete(finalScore, totalAttempts);
                }}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm cursor-pointer"
              >
                Aktifkan Pemulihan Neo-Metropolis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
