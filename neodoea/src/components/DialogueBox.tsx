import React, { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import type {
  AreaId,
  CharacterId,
  DialogueChoice,
  DialogueNode,
  Expression,
  PlayableCharacterId,
} from '../types/game';
import { soundEngine } from '../audio/soundEngine';

export interface SpeakerAnchor {
  screenX: number | null;
  bubbleBottomPx: number;
  viewportWidth: number;
  viewportHeight: number;
}

interface DialogueBoxProps {
  node: DialogueNode;
  areaId?: AreaId;
  activeCharacter?: PlayableCharacterId;
  worldTransformed?: boolean;
  speakerAnchor?: SpeakerAnchor;
  showSceneIllustration?: boolean;
  onAdvance: () => void;
  onSelectChoice: (choice: DialogueChoice) => void;
}

const EXPRESSION_LABEL: Record<Expression, string> = {
  neutral: 'Tenang',
  curious: 'Penasaran',
  worried: 'Cemas',
  happy: 'Hangat',
  serious: 'Serius',
  determined: 'Bertekad',
};

const SPEAKER_ROLE_SUBTITLE: Record<CharacterId, string> = {
  nino: 'Adnan "Nino" · Investigator',
  ilyas: 'Ilyas Saputra · Analis Data',
  dira: 'Adira "Dira" · Empati Sosial',
  sari: 'Mba Sari · Warga Pelabuhan',
  dani: 'Bang Dani · Petugas Halte',
  raka: 'Raka · Pelajar Plaza',
  maya: 'Bu Maya · Pengelola Plaza',
  wiryo: 'Pak Wiryo · Seniman Sanggar',
  rani: 'Teh Rani · Kurator Sanggar',
  ilham: 'Mas Ilham · Arsitek Server',
  arga: 'Pak Arga · Pengawas Terminal',
  narrator: 'Neo-Metropolis',
};

const SPEAKER_ACCENT: Record<CharacterId, { border: string; text: string }> = {
  nino: { border: 'border-red-400/75', text: 'text-red-300' },
  ilyas: { border: 'border-sky-400/75', text: 'text-sky-300' },
  dira: { border: 'border-rose-400/75', text: 'text-rose-300' },
  sari: { border: 'border-teal-400/75', text: 'text-teal-300' },
  dani: { border: 'border-blue-400/75', text: 'text-blue-300' },
  raka: { border: 'border-cyan-400/75', text: 'text-cyan-300' },
  maya: { border: 'border-indigo-400/75', text: 'text-indigo-300' },
  wiryo: { border: 'border-amber-400/75', text: 'text-amber-300' },
  rani: { border: 'border-orange-400/75', text: 'text-orange-300' },
  ilham: { border: 'border-violet-400/75', text: 'text-violet-300' },
  arga: { border: 'border-emerald-400/75', text: 'text-emerald-300' },
  narrator: { border: 'border-slate-400/55', text: 'text-slate-200' },
};

export const DialogueBox: React.FC<DialogueBoxProps> = ({
  node,
  speakerAnchor,
  onAdvance,
  onSelectChoice,
}) => {
  const [displayedCount, setDisplayedCount] = useState(0);
  const fullText = node.text;
  const isFinished = displayedCount >= fullText.length;

  useEffect(() => {
    setDisplayedCount(0);
  }, [node.id]);

  useEffect(() => {
    if (displayedCount >= fullText.length) return;
    const timer = window.setTimeout(() => {
      setDisplayedCount((c) => {
        const next = Math.min(fullText.length, c + 2);
        if (next % 6 === 0) {
          soundEngine.playSfx('dialogue', node.speaker);
        }
        return next;
      });
    }, 17);
    return () => window.clearTimeout(timer);
  }, [displayedCount, fullText, node.speaker]);

  const handleBoxClick = () => {
    if (!isFinished) {
      setDisplayedCount(fullText.length);
      return;
    }
    if (!node.choices || node.choices.length === 0) {
      soundEngine.playSfx('click');
      onAdvance();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'e' || e.key === 'E') {
        if (node.choices && node.choices.length > 0 && isFinished) return;
        e.preventDefault();
        handleBoxClick();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const accent = SPEAKER_ACCENT[node.speaker];
  const vw =
    speakerAnchor?.viewportWidth ?? (typeof window !== 'undefined' ? window.innerWidth : 1280);
  const vh =
    speakerAnchor?.viewportHeight ?? (typeof window !== 'undefined' ? window.innerHeight : 720);
  const hasChoices = Boolean(node.choices && node.choices.length > 0);
  const bubbleWidth = Math.min(460, Math.max(280, vw - 32));

  const isWorldSpeaker = speakerAnchor && speakerAnchor.screenX !== null;
  const speakerX = isWorldSpeaker ? (speakerAnchor.screenX as number) : vw / 2;

  const bubbleLeft = isWorldSpeaker
    ? Math.max(16, Math.min(vw - bubbleWidth - 16, speakerX - bubbleWidth / 2))
    : Math.max(16, (vw - bubbleWidth) / 2);

  const tailOffset = Math.max(24, Math.min(bubbleWidth - 24, speakerX - bubbleLeft));

  const minSafeBottom = 112;
  const maxBottomAllowed = hasChoices ? Math.max(112, vh - 350) : Math.max(132, vh - 220);
  const bubbleBottom = isWorldSpeaker
    ? Math.min(maxBottomAllowed, Math.max(minSafeBottom, speakerAnchor.bubbleBottomPx))
    : Math.max(minSafeBottom, Math.round(vh * 0.42));

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* === CLEAN OVERHEAD SPEECH BUBBLE ABOVE CURRENT SPEAKER'S HEAD === */}
      <div
        key={`bubble-${node.id}`}
        style={{
          left: bubbleLeft,
          bottom: bubbleBottom,
          width: bubbleWidth,
        }}
        className="fixed z-40 pointer-events-auto animate-bubble-pop"
      >
        <div
          onClick={handleBoxClick}
          className={`relative rounded-2xl bg-slate-950/94 border-2 ${accent.border} shadow-[0_12px_36px_rgba(2,6,23,0.85)] backdrop-blur-xl px-4 py-3.5 cursor-pointer`}
        >
          {/* Speaker Header */}
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`font-display text-sm md:text-base font-bold truncate ${accent.text}`}>
                {node.speakerName}
              </span>
              <span className="text-[11px] text-slate-400 truncate hidden sm:inline">
                · {SPEAKER_ROLE_SUBTITLE[node.speaker]}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-white/10 text-slate-300 shrink-0">
              {EXPRESSION_LABEL[node.expression]}
            </span>
          </div>

          {/* Speech Text */}
          <p className="text-xs md:text-sm text-slate-100 leading-relaxed max-h-40 overflow-y-auto pr-1">
            {fullText.slice(0, displayedCount)}
          </p>

          {/* Interactive Choices Inside Overhead Bubble */}
          {isFinished && node.choices && node.choices.length > 0 && (
            <div className="mt-3 space-y-1.5 pt-2 border-t border-white/10">
              {node.choices.map((choice) => (
                <button
                  key={choice.label}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    soundEngine.playSfx('click');
                    onSelectChoice(choice);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl bg-slate-900 hover:bg-sky-950/90 border border-sky-400/45 hover:border-sky-300 text-slate-100 text-xs font-medium transition-colors cursor-pointer flex items-center justify-between gap-2"
                >
                  <span className="leading-snug">{choice.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Continue Hint */}
          {(!hasChoices || !isFinished) && (
            <div className="mt-2.5 flex items-center justify-end">
              {!isFinished ? (
                <span className="text-[10px] text-slate-400">Klik / Spasi untuk tampilkan penuh</span>
              ) : (
                <span className="text-[11px] font-semibold text-sky-300 flex items-center gap-0.5">
                  <span>Lanjut [Spasi / E]</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              )}
            </div>
          )}

          {/* Speech Bubble Downward Pointer Aimed at Speaker's Head */}
          {isWorldSpeaker && (
            <div
              aria-hidden="true"
              style={{ left: tailOffset }}
              className="absolute -bottom-2.5 -translate-x-1/2 w-0 h-0 border-l-[9px] border-l-transparent border-r-[9px] border-r-transparent border-t-[10px] border-t-slate-950 drop-shadow-[0_2px_0_rgba(148,163,184,0.45)]"
            />
          )}
        </div>
      </div>
    </div>
  );
};
