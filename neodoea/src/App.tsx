import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BookOpen, KeyRound, Lock, LockOpen, MapPin, Network, Pause, Users, Compass, Sparkles } from 'lucide-react';
import {
  AREAS,
  ASSETS,
  CHARACTER_PROFILES,
  CLUES,
  DIALOGUES,
  SCENE_REWARDS,
  SCENE_REWARD_LIST,
  getQuestStepProgress,
} from './data/gameData';
import type {
  AreaId,
  DialogueChoice,
  DialogueNode,
  GameOverReason,
  GameSettings,
  InteractableObject,
  PlayableCharacterId,
  QuestId,
  SaveState,
  SceneReward,
  ScreenMode,
} from './types/game';
import { soundEngine } from './audio/soundEngine';
import { MainMenu } from './components/MainMenu';
import { GameCanvas } from './components/GameCanvas';
import { CharacterSheetModal } from './components/CharacterSheetModal';
import { InvestigationJournalModal } from './components/InvestigationJournalModal';
import { InvestigationBoardModal } from './components/InvestigationBoardModal';
import { StageActivityModal } from './components/StageActivityModal';
import { AreaMiniGamesModal } from './components/AreaMiniGamesModal';
import { CharacterPuzzlesModal } from './components/CharacterPuzzlesModal';
import { SideQuestModal, type BorderSideQuestKey } from './components/SideQuestModal';
import { FinalCollaborationModal } from './components/FinalCollaborationModal';
import { SettingsModal } from './components/SettingsModal';
import { PauseModal } from './components/PauseModal';
import { EndingCutsceneModal } from './components/EndingCutsceneModal';
import { GameOverModal } from './components/GameOverModal';
import { SchoolPrologueCutscene } from './components/SchoolPrologueCutscene';
import { MissionRewardModal } from './components/MissionRewardModal';

const SAVE_STORAGE_KEY = 'neo_metropolis_save_v1';
const SETTINGS_STORAGE_KEY = 'neo_metropolis_settings_v1';
const AREA_ORDER: AreaId[] = ['outskirts', 'plaza', 'stage', 'terminal'];

const createInitialSave = (): SaveState => ({
  currentArea: 'outskirts',
  playerX: 250,
  activeCharacter: 'nino',
  questId: 'Q1',
  discoveredClues: [],
  flags: {},
  solvedBoards: [],
  stageActivityDone: false,
  algoPuzzleDone: false,
  cityChoiceMade: null,
  evaluationAnswers: {},
  evaluationAttempts: 0,
  evaluationCompleted: false,
  worldTransformed: false,
  unlockedRewards: [],
  rewardPoints: 0,
  updatedAt: Date.now(),
});

const loadInitialSave = (): SaveState | null => {
  try {
    const raw = localStorage.getItem(SAVE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SaveState;
    const rawRewards = Array.isArray(parsed.unlockedRewards) ? parsed.unlockedRewards : [];
    const normalizedRewards = Array.from(
      new Set(
        rawRewards.map((id) => (id === 'reward_metropolis' ? 'reward_terminal' : id))
      )
    );
    return {
      ...createInitialSave(),
      ...parsed,
      activeCharacter: parsed.activeCharacter || 'nino',
      unlockedRewards: normalizedRewards,
      rewardPoints: 0,
    };
  } catch {
    return null;
  }
};

const loadInitialSettings = (): GameSettings => {
  const isTouchDevice =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 900);
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as GameSettings;
    }
  } catch {
    // ignore storage errors
  }
  return {
    musicVolume: 0.45,
    sfxVolume: 0.65,
    showTouchControls: isTouchDevice,
  };
};

type ActiveModal =
  | null
  | 'journal'
  | 'board1'
  | 'board2'
  | 'characters'
  | 'settings'
  | 'stage_activity'
  | 'minigame_circuit'
  | 'minigame_catcher'
  | 'minigame_memory'
  | 'side_quest'
  | 'final_collab'
  | 'curiosity_plaza'
  | 'curiosity_panel'
  | 'empathy_raka'
  | 'empathy_wiryo'
  | 'hacking_gate'
  | 'hacking_kiosk'
  | 'hacking_log'
  | 'city_choice';

export default function App() {
  const [savedSnapshot, setSavedSnapshot] = useState<SaveState | null>(() => loadInitialSave());
  const [save, setSave] = useState<SaveState>(() => loadInitialSave() || createInitialSave());
  const [screen, setScreen] = useState<ScreenMode>('TITLE_MENU');
  const [settings, setSettings] = useState<GameSettings>(() => loadInitialSettings());

  const [activeDialogueId, setActiveDialogueId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [pendingSideQuest, setPendingSideQuest] = useState<BorderSideQuestKey | null>(null);
  const [journalInitialTab, setJournalInitialTab] = useState<'clues' | 'roadmap' | 'rewards'>('clues');
  const [pendingRewardQueue, setPendingRewardQueue] = useState<SceneReward['id'][]>([]);
  const [gameOverReason, setGameOverReason] = useState<GameOverReason | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [prologueReplayOnly, setPrologueReplayOnly] = useState(false);
  const [portalArrivalActive, setPortalArrivalActive] = useState(false);
  const [areaTransition, setAreaTransition] = useState<{
    phase: 'enter' | 'unlocking' | 'unlocked' | 'out' | 'in';
    direction: 'left' | 'right';
    areaName: string;
    areaSubtitle: string;
    unlockKeyLabel?: string;
    unlockAccent?: string;
  } | null>(null);
  const [arrivalBanner, setArrivalBanner] = useState<{
    name: string;
    subtitle: string;
  } | null>(null);
  const transitionTimersRef = useRef<number[]>([]);

  const clearTransitionTimers = useCallback(() => {
    for (const id of transitionTimersRef.current) {
      window.clearTimeout(id);
    }
    transitionTimersRef.current = [];
  }, []);

  useEffect(() => {
    return () => clearTransitionTimers();
  }, [clearTransitionTimers]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  const grantSceneReward = useCallback(
    (rewardId: SceneReward['id'], showPopup = true) => {
      const reward = SCENE_REWARDS[rewardId];
      if (!reward) return;

      const alreadyHad = (save.unlockedRewards || []).includes(rewardId);
      setSave((prev) => {
        const currentRewards = prev.unlockedRewards || [];
        if (currentRewards.includes(rewardId)) return prev;
        return {
          ...prev,
          unlockedRewards: [...currentRewards, rewardId],
          updatedAt: Date.now(),
        };
      });

      if (!alreadyHad && showPopup) {
        setPendingRewardQueue((q) => (q.includes(rewardId) ? q : [...q, rewardId]));
      }
    },
    [save.unlockedRewards]
  );

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3600);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Sync audio volumes & background theme
  useEffect(() => {
    soundEngine.setVolumes(settings.musicVolume, settings.sfxVolume);
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    soundEngine.setDialogueDuck(
      Boolean(activeDialogueId) ||
        areaTransition?.phase === 'out' ||
        areaTransition?.phase === 'unlocking' ||
        areaTransition?.phase === 'unlocked'
    );
  }, [activeDialogueId, areaTransition?.phase]);

  useEffect(() => {
    if (screen === 'TITLE_MENU') {
      soundEngine.startMusic('menu');
    } else if (screen === 'ENDING') {
      soundEngine.startMusic('ending');
    } else if (screen === 'GAME_OVER') {
      soundEngine.stopMusic();
    } else if (screen === 'PLAYING') {
      if (activeModal === 'stage_activity') {
        soundEngine.startMusic('stage_gamelan');
      } else if (
        activeModal === 'hacking_gate' ||
        activeModal === 'hacking_log' ||
        activeModal === 'minigame_circuit' ||
        activeModal === 'minigame_catcher' ||
        activeModal === 'minigame_memory' ||
        activeModal === 'side_quest' ||
        activeModal === 'final_collab' ||
        activeModal === 'board1' ||
        activeModal === 'board2'
      ) {
        soundEngine.startMusic('puzzle_tension');
      } else if (save.currentArea === 'stage') {
        soundEngine.startMusic(
          save.stageActivityDone || save.worldTransformed ? 'stage_gamelan' : 'stage'
        );
      } else if (save.worldTransformed) {
        soundEngine.startMusic('ending');
      } else {
        soundEngine.startMusic(save.currentArea);
      }
    }
  }, [
    screen,
    save.currentArea,
    save.stageActivityDone,
    save.worldTransformed,
    activeModal,
  ]);

  // Persist save state automatically during play
  useEffect(() => {
    if (screen === 'PLAYING' || screen === 'PAUSED' || screen === 'ENDING') {
      try {
        localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(save));
        setSavedSnapshot(save);
      } catch {
        // ignore
      }
    }
  }, [save, screen]);

  const applyEffect = useCallback(
    (effect?: DialogueNode['onComplete'] | DialogueChoice['effect']) => {
      if (!effect) return;

      setSave((prev) => {
        const nextClues =
          effect.addClueId && !prev.discoveredClues.includes(effect.addClueId)
            ? [...prev.discoveredClues, effect.addClueId]
            : prev.discoveredClues;

        const nextFlags = effect.setFlag
          ? { ...prev.flags, [effect.setFlag]: true }
          : prev.flags;

        const nextQuest = effect.advanceQuest ?? prev.questId;

        return {
          ...prev,
          discoveredClues: nextClues,
          flags: nextFlags,
          questId: nextQuest,
          updatedAt: Date.now(),
        };
      });

      if (effect.addClueId && CLUES[effect.addClueId]) {
        soundEngine.playSfx('clue');
        showToast(`Petunjuk ditemukan: ${CLUES[effect.addClueId].title}`);
      }

      if (effect.setFlag === 'outskirts_quiz_done') {
        grantSceneReward('reward_village', true);
      } else if (effect.setFlag === 'plaza_quiz_done') {
        grantSceneReward('reward_plaza', true);
      } else if (effect.setFlag === 'has_access_card') {
        grantSceneReward('reward_stage', true);
      }

      if (effect.openModal) {
        if (effect.openModal === 'ending') {
          setScreen('ENDING');
          setActiveModal(null);
        } else {
          setActiveModal(effect.openModal);
        }
      }
    },
    [showToast, grantSceneReward]
  );

  const transitionToArea = useCallback(
    (
      targetArea: AreaId,
      spawnX: number,
      extra?: { worldTransformed?: boolean; toastMsg?: string; skipKeyAnim?: boolean }
    ) => {
      if (
        areaTransition?.phase === 'out' ||
        areaTransition?.phase === 'unlocking' ||
        areaTransition?.phase === 'unlocked'
      ) {
        return;
      }
      clearTransitionTimers();

      const fromIdx = AREA_ORDER.indexOf(save.currentArea);
      const toIdx = AREA_ORDER.indexOf(targetArea);
      const direction: 'left' | 'right' = toIdx >= fromIdx ? 'right' : 'left';
      const targetDef = AREAS[targetArea];

      const unlockConfig =
        !extra?.skipKeyAnim && direction === 'right' && toIdx > fromIdx
          ? targetArea === 'plaza'
            ? { label: SCENE_REWARDS.reward_village.keyName, accent: SCENE_REWARDS.reward_village.accentHex }
            : targetArea === 'stage'
            ? { label: SCENE_REWARDS.reward_plaza.keyName, accent: SCENE_REWARDS.reward_plaza.accentHex }
            : targetArea === 'terminal'
            ? { label: SCENE_REWARDS.reward_stage.keyName, accent: SCENE_REWARDS.reward_stage.accentHex }
            : undefined
          : undefined;

      if (unlockConfig) {
        soundEngine.playSfx('transition');
        setAreaTransition({
          phase: 'enter',
          direction,
          areaName: targetDef.name,
          areaSubtitle: targetDef.subtitle,
          unlockKeyLabel: unlockConfig.label,
          unlockAccent: unlockConfig.accent,
        });

        const tLockEngage = window.setTimeout(() => {
          setAreaTransition((prev) => (prev ? { ...prev, phase: 'unlocking' } : null));
        }, 30);

        const tLockOpen = window.setTimeout(() => {
          soundEngine.playSfx('correct');
          setAreaTransition((prev) => (prev ? { ...prev, phase: 'unlocked' } : null));
        }, 560);

        const tSwap = window.setTimeout(() => {
          setSave((prev) => ({
            ...prev,
            currentArea: targetArea,
            playerX: spawnX,
            worldTransformed: extra?.worldTransformed ?? prev.worldTransformed,
            updatedAt: Date.now(),
          }));
          setAreaTransition({
            phase: 'in',
            direction,
            areaName: targetDef.name,
            areaSubtitle: targetDef.subtitle,
            unlockKeyLabel: unlockConfig.label,
            unlockAccent: unlockConfig.accent,
          });
          setArrivalBanner({
            name: targetDef.name,
            subtitle: targetDef.subtitle,
          });
        }, 1020);

        const tClear = window.setTimeout(() => {
          setAreaTransition(null);
          if (extra?.toastMsg) {
            showToast(extra.toastMsg);
          }
        }, 1440);

        const tBanner = window.setTimeout(() => {
          setArrivalBanner(null);
        }, 3300);

        transitionTimersRef.current = [tLockEngage, tLockOpen, tSwap, tClear, tBanner];
        return;
      }

      soundEngine.playSfx('transition');
      setAreaTransition({
        phase: 'enter',
        direction,
        areaName: targetDef.name,
        areaSubtitle: targetDef.subtitle,
      });

      const tFadeIn = window.setTimeout(() => {
        setAreaTransition((prev) => (prev ? { ...prev, phase: 'out' } : null));
      }, 20);

      const tSwap = window.setTimeout(() => {
        setSave((prev) => ({
          ...prev,
          currentArea: targetArea,
          playerX: spawnX,
          worldTransformed: extra?.worldTransformed ?? prev.worldTransformed,
          updatedAt: Date.now(),
        }));
        setAreaTransition({
          phase: 'in',
          direction,
          areaName: targetDef.name,
          areaSubtitle: targetDef.subtitle,
        });
        setArrivalBanner({
          name: targetDef.name,
          subtitle: targetDef.subtitle,
        });
      }, 320);

      const tClear = window.setTimeout(() => {
        setAreaTransition(null);
        if (extra?.toastMsg) {
          showToast(extra.toastMsg);
        }
      }, 740);

      const tBanner = window.setTimeout(() => {
        setArrivalBanner(null);
      }, 2600);

      transitionTimersRef.current = [tFadeIn, tSwap, tClear, tBanner];
    },
    [areaTransition?.phase, clearTransitionTimers, save.currentArea, showToast]
  );

  const handleStartNewGame = () => {
    soundEngine.unlock();
    soundEngine.playSfx('portal');
    clearTransitionTimers();
    setAreaTransition(null);
    setArrivalBanner(null);
    setPortalArrivalActive(false);
    const fresh = createInitialSave();
    setSave(fresh);
    setActiveModal(null);
    setActiveDialogueId(null);
    setPendingRewardQueue([]);
    setPrologueReplayOnly(false);
    setScreen('PROLOGUE');
  };

  const handleWatchPrologue = () => {
    soundEngine.unlock();
    soundEngine.playSfx('portal');
    setActiveModal(null);
    setPrologueReplayOnly(true);
    setScreen('PROLOGUE');
  };

  const handleContinueGame = () => {
    if (savedSnapshot) {
      setSave(savedSnapshot);
    }
    clearTransitionTimers();
    setAreaTransition(null);
    setArrivalBanner(null);
    setPortalArrivalActive(false);
    setActiveModal(null);
    setPrologueReplayOnly(false);
    setScreen('PLAYING');
  };

  const handleDialogueAdvance = () => {
    if (!activeDialogueId) return;
    const node = DIALOGUES[activeDialogueId];
    if (!node) {
      setActiveDialogueId(null);
      return;
    }

    if (node.onComplete) {
      applyEffect(node.onComplete);
    }

    if (node.nextNodeId) {
      setActiveDialogueId(node.nextNodeId);
    } else {
      setActiveDialogueId(null);
    }
  };

  const handleDialogueChoice = (choice: DialogueChoice) => {
    if (choice.effect) {
      applyEffect(choice.effect);
    }
    if (choice.nextNodeId && DIALOGUES[choice.nextNodeId]) {
      setActiveDialogueId(choice.nextNodeId);
    } else {
      setActiveDialogueId(null);
    }
  };

  const handleSwitchCharacter = useCallback(
    (char: PlayableCharacterId) => {
      if (!save.flags.met_friends && char !== 'nino') {
        showToast('Temui Ilyas & Dira terlebih dahulu untuk berganti karakter.');
        return;
      }
      soundEngine.playSfx('click');
      setSave((prev) => ({ ...prev, activeCharacter: char, updatedAt: Date.now() }));
      const label =
        char === 'nino'
          ? 'Nino · Curiosity Trigger'
          : char === 'ilyas'
          ? 'Ilyas · Data Hacking'
          : 'Dira · Social Empathy';
      showToast(`Karakter aktif: ${label}`);
    },
    [save.flags.met_friends, showToast]
  );

  const handleInteract = (obj: InteractableObject) => {
    switch (obj.id) {
      case 'obj_portal':
      case 'obj_terminal_portal':
        if (save.worldTransformed && (save.unlockedRewards || []).includes('reward_terminal')) {
          setActiveDialogueId('city_transformed_portal');
        } else {
          setActiveDialogueId('portal_locked_hint');
        }
        break;

      case 'obj_meet_friends':
        setActiveDialogueId('meet_friends_1');
        break;

      // === WILAYAH 1: PELABUHAN ===
      case 'obj_warung_sari':
        if (!save.flags.met_friends) {
          setActiveDialogueId('meet_friends_1');
        } else if (save.worldTransformed) {
          setActiveDialogueId('sari_after');
        } else if (save.flags.outskirts_mat_done) {
          setActiveDialogueId('sari_reminder');
        } else {
          setActiveDialogueId('sari_mat_1');
        }
        break;

      case 'obj_minigame_outskirts':
        if (!save.flags.outskirts_mat_done) {
          showToast('Simak dulu penjelasan Mba Sari di Warung Lokal sebelum menyambung kabel halte.');
        } else if (!save.flags.outskirts_game_done) {
          setActiveModal('minigame_circuit');
        } else {
          showToast('Lampion Halte Neo-Bus sudah menyala terang! Temui Bang Dani di sebelah kanan.');
        }
        break;

      case 'obj_dani':
        if (!save.flags.outskirts_mat_done) {
          setActiveDialogueId('dani_need_material');
        } else if (!save.flags.outskirts_game_done) {
          setActiveDialogueId('dani_need_minigame');
        } else if (!save.flags.outskirts_quiz_done) {
          setActiveDialogueId('dani_quiz_1');
        } else {
          setActiveDialogueId('dani_after');
        }
        break;

      // === WILAYAH 2: SANDANG AYU PLAZA ===
      case 'obj_raka':
        if (!save.flags.outskirts_quiz_done) {
          showToast('Selesaikan dulu penyelidikan di Pelabuhan.');
        } else if (!save.flags.talked_raka) {
          setActiveModal('empathy_raka');
        } else {
          setActiveDialogueId('raka_after');
        }
        break;

      case 'obj_minigame_plaza':
        if (!save.flags.talked_raka) {
          showToast('Temui dulu Raka di sebelah kiri Plaza sebelum mengoperasikan pemindai sinyal.');
        } else if (!save.flags.plaza_game_done) {
          setActiveModal('minigame_catcher');
        } else {
          showToast('Pemindai Sinyal Plaza sudah stabil! Lapor kepada Bu Maya di sebelah kanan.');
        }
        break;

      case 'obj_plaza_relay':
        if (!save.flags.plaza_relay_inspected) {
          setActiveModal('curiosity_plaza');
        } else {
          showToast('Panel relay Sandang Ayu Plaza sudah diperiksa.');
        }
        break;

      case 'obj_maya':
        if (!save.flags.talked_raka) {
          setActiveDialogueId('maya_need_material');
        } else if (!save.flags.plaza_game_done) {
          setActiveDialogueId('maya_need_minigame');
        } else if (!save.flags.plaza_quiz_done) {
          setActiveDialogueId('maya_quiz_1');
        } else {
          setActiveDialogueId('maya_after');
        }
        break;

      case 'obj_plaza_forum':
        if (save.questId !== 'Q5' && save.questId !== 'COMPLETED') {
          setActiveDialogueId('eval_need_q5');
        } else if (!save.cityChoiceMade) {
          setActiveModal('final_collab');
        } else {
          setActiveDialogueId('arga_after');
        }
        break;

      // === WILAYAH 3: SANGGAR DARMOYUDHO ===
      case 'obj_pak_wiryo':
        if (!save.flags.talked_wiryo) {
          setActiveModal('empathy_wiryo');
        } else {
          setActiveDialogueId('wiryo_after');
        }
        break;

      case 'obj_gamelan':
        if (!save.flags.talked_wiryo) {
          setActiveDialogueId('gamelan_need_wiryo');
        } else if (!save.stageActivityDone) {
          setActiveModal('stage_activity');
        } else {
          soundEngine.playSfx('gamelan3');
          showToast('Alunan gamelan berpadu indah dengan suasana Sanggar Darmoyudho!');
        }
        break;

      case 'obj_rani':
        if (!save.flags.talked_wiryo) {
          setActiveDialogueId('rani_need_material');
        } else if (!save.stageActivityDone) {
          setActiveDialogueId('rani_need_minigame');
        } else if (!save.flags.stage_quiz_done) {
          setActiveDialogueId('rani_quiz_1');
        } else {
          setActiveDialogueId('rani_after');
        }
        break;

      case 'obj_access_card_box':
        if (!save.flags.stage_quiz_done) {
          setActiveDialogueId('access_card_need_rani');
        } else if (!save.flags.has_access_card) {
          setActiveModal('curiosity_panel');
        } else {
          showToast('Kartu Akses Server Kota sudah kamu amankan.');
        }
        break;

      // === WILAYAH 4: TERMINAL SERVER KOTA ===
      case 'obj_security_gate':
        setActiveModal('hacking_gate');
        break;

      case 'obj_ilham':
        if (!save.flags.terminal_hacked) {
          setActiveDialogueId('algo_need_hack');
        } else if (!save.flags.terminal_mat_done) {
          setActiveDialogueId('ilham_mat_1');
        } else {
          setActiveDialogueId('ilham_after');
        }
        break;

      case 'obj_algo_console':
        if (!save.flags.terminal_hacked) {
          setActiveDialogueId('algo_need_hack');
        } else if (!save.flags.terminal_mat_done) {
          setActiveDialogueId('algo_need_ilham');
        } else if (!save.algoPuzzleDone) {
          setActiveModal('minigame_memory');
        } else {
          showToast('Memori inti server sudah sinkron! Hadapi Pak Arga di sisi kanan terminal.');
        }
        break;

      case 'obj_arga':
        if (!save.flags.terminal_mat_done) {
          setActiveDialogueId('arga_need_material');
        } else if (!save.algoPuzzleDone) {
          setActiveDialogueId('arga_need_minigame');
        } else if (!save.flags.terminal_quiz_done) {
          setActiveDialogueId('arga_quiz_1');
        } else if (!save.cityChoiceMade) {
          setActiveDialogueId('arga_ready_choice');
        } else {
          setActiveDialogueId('arga_after');
        }
        break;

      default:
        break;
    }
  };

  // Global keyboard shortcuts for Journal (J), Board (B), Character Switch (1/2/3/Tab), Pause (Escape)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'PLAYING' && screen !== 'PAUSED') return;
      if (e.key === 'Escape') {
        if (activeModal) {
          setActiveModal(null);
        } else if (!activeDialogueId) {
          setScreen((s) => (s === 'PAUSED' ? 'PLAYING' : 'PAUSED'));
        }
      } else if (!activeDialogueId && !activeModal && screen === 'PLAYING') {
        if (e.key === 'j' || e.key === 'J') {
          soundEngine.playSfx('click');
          setJournalInitialTab('clues');
          setActiveModal('journal');
        } else if (e.key === 'b' || e.key === 'B') {
          soundEngine.playSfx('click');
          setActiveModal(save.solvedBoards.includes('board1') ? 'board2' : 'board1');
        } else if (e.key === '1') {
          handleSwitchCharacter('nino');
        } else if (e.key === '2') {
          handleSwitchCharacter('ilyas');
        } else if (e.key === '3') {
          handleSwitchCharacter('dira');
        } else if (e.key === 'Tab') {
          e.preventDefault();
          const order: PlayableCharacterId[] = ['nino', 'ilyas', 'dira'];
          const next = order[(order.indexOf(save.activeCharacter) + 1) % order.length];
          handleSwitchCharacter(next);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, activeModal, activeDialogueId, save.solvedBoards, save.activeCharacter, handleSwitchCharacter]);

  const activeDialogueNode = activeDialogueId ? DIALOGUES[activeDialogueId] : null;
  const currentAreaDef = AREAS[save.currentArea];
  const currentStep = getQuestStepProgress(save);
  const unlockedKeysCount = SCENE_REWARD_LIST.filter((r) =>
    (save.unlockedRewards || []).includes(r.id)
  ).length;

  const activeRewardId =
    screen === 'PLAYING' && !activeDialogueNode && !activeModal && !gameOverReason
      ? pendingRewardQueue[0] || null
      : null;
  const activeReward = activeRewardId ? SCENE_REWARDS[activeRewardId] : null;

  useEffect(() => {
    if (activeRewardId) {
      soundEngine.playSfx('correct');
    }
  }, [activeRewardId]);

  if (screen === 'TITLE_MENU') {
    return (
      <>
        <MainMenu
          hasSave={Boolean(savedSnapshot)}
          savedQuestId={savedSnapshot?.questId}
          savedAreaId={savedSnapshot?.currentArea}
          savedCluesCount={savedSnapshot?.discoveredClues?.length ?? 0}
          onNewGame={handleStartNewGame}
          onContinue={handleContinueGame}
          onWatchPrologue={handleWatchPrologue}
          onOpenSettings={() => setActiveModal('settings')}
          onOpenCharacters={() => setActiveModal('characters')}
        />
        {activeModal === 'settings' && (
          <SettingsModal
            settings={settings}
            onUpdate={setSettings}
            onClose={() => setActiveModal(null)}
          />
        )}
        {activeModal === 'characters' && (
          <CharacterSheetModal onClose={() => setActiveModal(null)} />
        )}
      </>
    );
  }

  if (screen === 'PROLOGUE') {
    return (
      <SchoolPrologueCutscene
        onComplete={() => {
          soundEngine.playSfx('portal');
          if (prologueReplayOnly) {
            setPrologueReplayOnly(false);
            setScreen('TITLE_MENU');
          } else {
            setScreen('PLAYING');
            setPortalArrivalActive(true);
          }
        }}
      />
    );
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950">
      {/* Main 2D Side-Scrolling Game World */}
      <GameCanvas
        areaId={save.currentArea}
        initialX={save.playerX}
        activeCharacter={save.activeCharacter}
        questId={save.questId}
        flags={save.flags}
        stageActivityDone={save.stageActivityDone}
        algoPuzzleDone={save.algoPuzzleDone}
        worldTransformed={save.worldTransformed}
        isPaused={screen === 'PAUSED' || screen === 'ENDING' || screen === 'GAME_OVER'}
        hasActiveOverlay={Boolean(
          activeDialogueNode ||
            activeModal ||
            activeReward ||
            gameOverReason ||
            portalArrivalActive ||
            areaTransition?.phase === 'out' ||
            areaTransition?.phase === 'unlocking' ||
            areaTransition?.phase === 'unlocked'
        )}
        showTouchControls={settings.showTouchControls}
        portalArrivalActive={portalArrivalActive}
        dialogueOverlay={
          activeDialogueNode && screen === 'PLAYING'
            ? {
                node: activeDialogueNode,
                showSceneIllustration: false,
                onAdvance: handleDialogueAdvance,
                onSelectChoice: handleDialogueChoice,
              }
            : null
        }
        onPortalArrivalComplete={() => {
          setPortalArrivalActive(false);
          setActiveDialogueId('intro_portal');
        }}
        onPlayerMove={(x) => setSave((prev) => ({ ...prev, playerX: x }))}
        onInteract={handleInteract}
        onChangeArea={(targetArea: AreaId, spawnX: number) => {
          const rewards = save.unlockedRewards || [];
          if (targetArea === 'plaza') {
            if (!save.flags.met_friends) {
              showToast('Berkenalan dulu dengan Dira & Ilyas di dekat portal kedatangan.');
              return;
            }
            if (!save.flags.outskirts_quiz_done || !rewards.includes('reward_village')) {
              showToast('Kamu belum memiliki Kunci Gerbang Plaza! Selesaikan dulu misi Mba Sari -> Kabel Halte -> Bang Dani.');
              return;
            }
            if (!save.flags.sq_outskirts_done) {
              setPendingSideQuest('outskirts');
              setActiveModal('side_quest');
              return;
            }
          } else if (targetArea === 'stage') {
            if (!save.flags.plaza_quiz_done || !rewards.includes('reward_plaza')) {
              showToast('Kamu belum memiliki Kunci Sanggar Darmoyudho! Selesaikan dulu misi Raka -> Pemindai Sinyal -> Bu Maya.');
              return;
            }
            if (!save.flags.sq_plaza_done) {
              setPendingSideQuest('plaza');
              setActiveModal('side_quest');
              return;
            }
          } else if (targetArea === 'terminal') {
            if (!save.flags.has_access_card || !rewards.includes('reward_stage')) {
              showToast('Kamu belum memiliki Kunci Terminal Server! Temukan Kartu Akses dari Kotak Panel Suara di Sanggar Darmoyudho.');
              return;
            }
            if (!save.flags.sq_stage_done) {
              setPendingSideQuest('stage');
              setActiveModal('side_quest');
              return;
            }
          }
          transitionToArea(targetArea, spawnX);
        }}
        onShowToast={showToast}
      />

      {/* COMPACT IN-GAME HUD (Slim single-row layout so gameplay remains unobstructed) */}
      <header className="fixed top-0 inset-x-0 z-30 px-3 py-2 flex items-center justify-between gap-2 pointer-events-none">
        {/* Left: Compact Quest Strip (Click to open full Journal) */}
        <button
          type="button"
          onClick={() => {
            soundEngine.playSfx('click');
            setJournalInitialTab('clues');
            setActiveModal('journal');
          }}
          title={currentStep.instruction}
          className="pointer-events-auto text-left max-w-[240px] sm:max-w-[300px] rounded-lg bg-slate-950/75 hover:bg-slate-900/90 border border-white/15 backdrop-blur-md px-3 py-1.5 shadow-lg transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-300">
            <Compass className="w-3 h-3 text-amber-300 shrink-0" />
            <span className="text-amber-300 whitespace-nowrap">{save.questId === 'COMPLETED' ? 'Selesai' : save.questId} · {currentStep.stepLabel}</span>
            <span aria-hidden="true" className="text-slate-500">·</span>
            <span className="inline-flex items-center gap-1 text-slate-300 truncate font-normal">
              <MapPin className="w-2.5 h-2.5 shrink-0" />
              {currentAreaDef.name}
            </span>
          </div>
          <p className="text-[11px] text-slate-100 mt-0.5 truncate">{currentStep.instruction}</p>
        </button>

        {/* Center: Simple Compact Party Switcher */}
        {save.flags.met_friends && (
          <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-lg bg-slate-950/75 border border-white/15 backdrop-blur-md shadow-lg">
            {(
              [
                { id: 'nino', keyNum: '1', name: 'Nino', img: ASSETS.portraitNino },
                { id: 'ilyas', keyNum: '2', name: 'Ilyas', img: ASSETS.portraitIlyas },
                { id: 'dira', keyNum: '3', name: 'Dira', img: ASSETS.portraitDira },
              ] as const
            ).map((member) => {
              const active = save.activeCharacter === member.id;
              const profile = CHARACTER_PROFILES.find((p) => p.id === member.id);
              return (
                <button
                  key={member.id}
                  type="button"
                  title={`${profile?.nickname} (${profile?.abilityName})`}
                  onClick={() => handleSwitchCharacter(member.id)}
                  className={`px-2 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    active
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <img
                    src={member.img}
                    alt={member.name}
                    referrerPolicy="no-referrer"
                    className="w-5 h-5 rounded-full object-cover object-top border border-white/25"
                  />
                  <span className="text-[11px] font-semibold hidden sm:inline">
                    [{member.keyNum}] {member.name}
                  </span>
                  <span className="text-[10px] font-semibold sm:hidden">{member.keyNum}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Right: Compact HUD Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx('click');
              setJournalInitialTab('rewards');
              setActiveModal('journal');
            }}
            title="Lihat Koleksi Kunci Akses Scene"
            className="px-2.5 py-1.5 rounded-lg bg-slate-950/75 hover:bg-slate-800 border border-amber-400/35 text-amber-200 text-[11px] font-medium backdrop-blur-md flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-mono tabular-nums">{unlockedKeysCount}/4 Kunci</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx('click');
              setJournalInitialTab('clues');
              setActiveModal('journal');
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950/75 hover:bg-slate-800 border border-white/15 text-slate-100 text-[11px] font-medium backdrop-blur-md flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-300" />
            <span className="hidden md:inline">Jurnal [J]</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx('click');
              setActiveModal(save.solvedBoards.includes('board1') ? 'board2' : 'board1');
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950/75 hover:bg-slate-800 border border-white/15 text-slate-100 text-[11px] font-medium backdrop-blur-md flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <Network className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden md:inline">Analisis [B]</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx('click');
              setActiveModal('characters');
            }}
            className="hidden sm:flex px-2.5 py-1.5 rounded-lg bg-slate-950/75 hover:bg-slate-800 border border-white/15 text-slate-100 text-[11px] font-medium backdrop-blur-md items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <Users className="w-3.5 h-3.5 text-rose-300" />
            <span className="hidden lg:inline">Tim</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playSfx('click');
              setScreen('PAUSED');
            }}
            aria-label="Jeda Permainan"
            className="px-2.5 py-1.5 rounded-lg bg-slate-950/75 hover:bg-slate-800 border border-white/15 text-slate-100 text-[11px] font-medium backdrop-blur-md flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <Pause className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Jeda</span>
          </button>
        </div>
      </header>

      {/* Area Arrival Banner (Non-blocking brief location header) */}
      {arrivalBanner && !toast && !activeDialogueNode && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-fade-in">
          <div className="px-5 py-2 rounded-xl bg-slate-950/85 border border-white/15 backdrop-blur-md shadow-xl text-center">
            <div className="flex items-center justify-center gap-1.5 text-sky-300 text-xs font-semibold tracking-wide">
              <MapPin className="w-3.5 h-3.5" />
              <span>{arrivalBanner.name}</span>
            </div>
            <p className="text-[11px] text-slate-300/85 mt-0.5">{arrivalBanner.subtitle}</p>
          </div>
        </div>
      )}

      {/* Smooth Cinematic Area Transition Veil + Key-Insertion Unlock Animation */}
      {areaTransition && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[45] pointer-events-none flex items-center justify-center transition-all duration-300 ease-in-out"
          style={{
            opacity:
              areaTransition.phase === 'out' ||
              areaTransition.phase === 'unlocking' ||
              areaTransition.phase === 'unlocked'
                ? 1
                : 0,
            background:
              areaTransition.unlockKeyLabel
                ? 'radial-gradient(circle at 50% 45%, rgba(18,28,54,0.95) 0%, rgba(6,10,20,0.99) 100%)'
                : 'radial-gradient(circle at 50% 45%, rgba(15,23,42,0.92) 0%, rgba(7,11,20,0.98) 100%)',
            transform:
              areaTransition.phase === 'out' ||
              areaTransition.phase === 'unlocking' ||
              areaTransition.phase === 'unlocked'
                ? 'translate3d(0, 0, 0)'
                : areaTransition.phase === 'enter'
                ? `translate3d(${areaTransition.direction === 'right' ? '20px' : '-20px'}, 0, 0)`
                : `translate3d(${areaTransition.direction === 'right' ? '-24px' : '24px'}, 0, 0)`,
          }}
        >
          {areaTransition.unlockKeyLabel ? (
            <div className="relative text-center px-6 flex flex-col items-center">
              {/* Unlock Energy Flash Ring */}
              <div
                className="relative flex items-center justify-center w-44 h-28 rounded-2xl border transition-all duration-500"
                style={{
                  borderColor:
                    areaTransition.phase === 'unlocked'
                      ? areaTransition.unlockAccent || '#fbbf24'
                      : 'rgba(148,163,184,0.35)',
                  backgroundColor:
                    areaTransition.phase === 'unlocked'
                      ? 'rgba(251,191,36,0.14)'
                      : 'rgba(15,23,42,0.8)',
                  boxShadow:
                    areaTransition.phase === 'unlocked'
                      ? `0 0 48px ${areaTransition.unlockAccent || '#fbbf24'}66, inset 0 0 24px ${areaTransition.unlockAccent || '#fbbf24'}33`
                      : '0 16px 40px rgba(0,0,0,0.65)',
                }}
              >
                {/* Sliding Key Inserting Into Lock Cylinder */}
                <div
                  className="flex items-center justify-center transition-all duration-500 ease-out"
                  style={{
                    transform:
                      areaTransition.phase === 'enter'
                        ? 'translateX(-48px) rotate(0deg) scale(0.95)'
                        : areaTransition.phase === 'unlocking'
                        ? 'translateX(-10px) rotate(0deg) scale(1.05)'
                        : 'translateX(0px) rotate(90deg) scale(1.15)',
                  }}
                >
                  <KeyRound
                    className="w-10 h-10 drop-shadow-[0_0_12px_rgba(251,191,36,0.75)]"
                    style={{ color: areaTransition.unlockAccent || '#fbbf24' }}
                  />
                </div>

                {/* Lock / Keyhole Cylinder */}
                <div
                  className="ml-3 w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all duration-300"
                  style={{
                    borderColor:
                      areaTransition.phase === 'unlocked'
                        ? '#34d399'
                        : 'rgba(148,163,184,0.55)',
                    backgroundColor:
                      areaTransition.phase === 'unlocked'
                        ? 'rgba(16,185,129,0.22)'
                        : 'rgba(30,41,59,0.9)',
                  }}
                >
                  {areaTransition.phase === 'unlocked' ? (
                    <LockOpen className="w-6 h-6 text-emerald-300 animate-pulse" />
                  ) : (
                    <Lock className="w-6 h-6 text-slate-300" />
                  )}
                </div>
              </div>

              <p
                className="mt-4 text-[11px] uppercase tracking-[0.24em] font-semibold transition-colors duration-300"
                style={{
                  color:
                    areaTransition.phase === 'unlocked'
                      ? '#34d399'
                      : areaTransition.unlockAccent || '#fbbf24',
                }}
              >
                {areaTransition.phase === 'unlocked'
                  ? `Gerbang Terbuka · ${areaTransition.unlockKeyLabel}`
                  : `Memasukkan ${areaTransition.unlockKeyLabel}...`}
              </p>
              <p className="font-display text-2xl font-bold text-white mt-1.5">
                {areaTransition.areaName}
              </p>
              <p className="text-xs text-slate-300/80 mt-1">{areaTransition.areaSubtitle}</p>
            </div>
          ) : (
            <div className="text-center px-6">
              <p className="text-[11px] uppercase tracking-[0.22em] text-sky-300/80 font-medium">
                Menuju Wilayah
              </p>
              <p className="font-display text-2xl font-bold text-white mt-1">
                {areaTransition.areaName}
              </p>
              <p className="text-xs text-slate-300/80 mt-1">{areaTransition.areaSubtitle}</p>
            </div>
          )}
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-xl bg-slate-900/95 border border-sky-400/50 text-sky-100 text-xs font-medium shadow-2xl flex items-center gap-2 max-w-md text-center">
          <Sparkles className="w-4 h-4 text-sky-300 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Modals */}
      {activeModal === 'journal' && (
        <InvestigationJournalModal
          save={save}
          initialTab={journalInitialTab}
          onClose={() => setActiveModal(null)}
        />
      )}

      {(activeModal === 'board1' || activeModal === 'board2') && (
        <InvestigationBoardModal
          discoveredClues={save.discoveredClues}
          solvedBoards={save.solvedBoards}
          initialBoard={activeModal}
          onSolveBoard={(boardId) => {
            setSave((prev) => {
              const solvedBoards = prev.solvedBoards.includes(boardId)
                ? prev.solvedBoards
                : [...prev.solvedBoards, boardId];
              const nextQuest: QuestId =
                boardId === 'board1' && prev.questId === 'Q2'
                  ? 'Q3'
                  : boardId === 'board2' && prev.questId === 'Q4'
                  ? 'Q5'
                  : prev.questId;
              return {
                ...prev,
                solvedBoards,
                questId: nextQuest,
                flags: { ...prev.flags, [`${boardId}_solved`]: true },
              };
            });
            showToast(
              boardId === 'board1'
                ? 'Analisis 1 selesai! Lanjutkan perjalanan menuju Sanggar Darmoyudho.'
                : 'Analisis Utama selesai! Temui Pak Arga di Terminal Server untuk Kolaborasi Akhir.'
            );
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'stage_activity' && (
        <StageActivityModal
          onComplete={() => {
            setSave((prev) => ({
              ...prev,
              stageActivityDone: true,
              flags: { ...prev.flags, stage_revived: true },
            }));
            setActiveModal(null);
            showToast('Ritme gamelan menghidupkan Sanggar Darmoyudho! Sekarang temui Teh Rani di kanan sanggar.');
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {(activeModal === 'minigame_circuit' ||
        activeModal === 'minigame_catcher' ||
        activeModal === 'minigame_memory') && (
        <AreaMiniGamesModal
          mode={activeModal}
          onComplete={() => {
            if (activeModal === 'minigame_circuit') {
              setSave((prev) => ({
                ...prev,
                flags: { ...prev.flags, outskirts_game_done: true },
              }));
              soundEngine.playSfx('correct');
              showToast('Kabel Lampion Halte menyala! Temui Bang Dani di halte sebelah kanan.');
              setActiveModal(null);
            } else if (activeModal === 'minigame_catcher') {
              setSave((prev) => ({
                ...prev,
                flags: { ...prev.flags, plaza_game_done: true },
              }));
              soundEngine.playSfx('correct');
              showToast('Sinyal Sandang Ayu Plaza stabil! Sekarang temui Bu Maya di sisi kanan Plaza.');
              setActiveModal(null);
            } else if (activeModal === 'minigame_memory') {
              setSave((prev) => ({
                ...prev,
                algoPuzzleDone: true,
                discoveredClues: prev.discoveredClues.includes('C5')
                  ? prev.discoveredClues
                  : [...prev.discoveredClues, 'C5'],
              }));
              soundEngine.playSfx('correct');
              showToast('Gelombang Inti Server selaras! Hadapi Pak Arga di ujung kanan terminal.');
              setActiveModal(null);
            }
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {(activeModal === 'curiosity_plaza' ||
        activeModal === 'curiosity_panel' ||
        activeModal === 'empathy_raka' ||
        activeModal === 'empathy_wiryo' ||
        activeModal === 'hacking_gate' ||
        activeModal === 'hacking_kiosk' ||
        activeModal === 'hacking_log') && (
        <CharacterPuzzlesModal
          mode={activeModal}
          activeCharacter={save.activeCharacter}
          onSelectCharacter={(char) => {
            setSave((prev) => ({ ...prev, activeCharacter: char, updatedAt: Date.now() }));
          }}
          onWrongCharacter={(reason) => {
            setActiveModal(null);
            setActiveDialogueId(null);
            setGameOverReason(reason);
            setScreen('GAME_OVER');
          }}
          onSuccess={() => {
            if (activeModal === 'curiosity_plaza') {
              setSave((prev) => ({
                ...prev,
                flags: { ...prev.flags, plaza_relay_inspected: true },
                discoveredClues: prev.discoveredClues.includes('C2B')
                  ? prev.discoveredClues
                  : [...prev.discoveredClues, 'C2B'],
              }));
              soundEngine.playSfx('clue');
              showToast('Petunjuk Lapangan Relay (C2B) berhasil diamankan!');
              setActiveModal(null);
            } else if (activeModal === 'curiosity_panel') {
              setActiveModal(null);
              setActiveDialogueId('access_card_found');
            } else if (activeModal === 'empathy_raka') {
              setActiveModal(null);
              setActiveDialogueId('raka_mat_1');
            } else if (activeModal === 'empathy_wiryo') {
              setActiveModal(null);
              setActiveDialogueId('wiryo_mat_1');
            } else if (activeModal === 'hacking_kiosk') {
              setSave((prev) => ({
                ...prev,
                flags: { ...prev.flags, stage_kiosk_fixed: true },
              }));
              soundEngine.playSfx('clue');
              showToast('Kios jadwal digital berhasil dipulihkan!');
              setActiveModal(null);
            } else if (activeModal === 'hacking_gate') {
              setSave((prev) => ({
                ...prev,
                flags: { ...prev.flags, terminal_hacked: true },
              }));
              soundEngine.playSfx('correct');
              showToast('Firewall berhasil ditembus! Mas Ilham menunggu di dalam terminal.');
              setActiveModal(null);
            } else if (activeModal === 'hacking_log') {
              setSave((prev) => ({
                ...prev,
                flags: { ...prev.flags, log_decrypted: true },
              }));
              soundEngine.playSfx('correct');
              setActiveModal('minigame_memory');
            }
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'side_quest' && pendingSideQuest && (
        <SideQuestModal
          questKey={pendingSideQuest}
          onComplete={() => {
            const flagMap: Record<BorderSideQuestKey, string> = {
              outskirts: 'sq_outskirts_done',
              plaza: 'sq_plaza_done',
              stage: 'sq_stage_done',
            };
            const destMap: Record<BorderSideQuestKey, { area: AreaId; x: number; msg: string }> = {
              outskirts: {
                area: 'plaza',
                x: 170,
                msg: 'Side Quest Perbatasan tuntas! Memasuki Sandang Ayu Plaza...',
              },
              plaza: {
                area: 'stage',
                x: 165,
                msg: 'Side Quest Antena tuntas! Memasuki Sanggar Darmoyudho...',
              },
              stage: {
                area: 'terminal',
                x: 170,
                msg: 'Jembatan terbuka! Memasuki Terminal Server Kota...',
              },
            };
            const flag = flagMap[pendingSideQuest];
            const dest = destMap[pendingSideQuest];
            setSave((prev) => ({
              ...prev,
              flags: { ...prev.flags, [flag]: true },
              updatedAt: Date.now(),
            }));
            setPendingSideQuest(null);
            setActiveModal(null);
            transitionToArea(dest.area, dest.x, { toastMsg: dest.msg });
          }}
          onClose={() => {
            setPendingSideQuest(null);
            setActiveModal(null);
          }}
        />
      )}

      {(activeModal === 'final_collab' || activeModal === 'city_choice') && (
        <FinalCollaborationModal
          onComplete={(choice) => {
            grantSceneReward('reward_terminal', true);
            setSave((prev) => ({
              ...prev,
              cityChoiceMade: choice,
              evaluationCompleted: true,
              worldTransformed: true,
              questId: 'COMPLETED',
              updatedAt: Date.now(),
            }));
            setActiveModal(null);
            setActiveDialogueId('arga_after');
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeReward && (
        <MissionRewardModal
          reward={activeReward}
          unlockedCount={unlockedKeysCount}
          totalRewards={SCENE_REWARD_LIST.length}
          onClose={() => setPendingRewardQueue((q) => q.slice(1))}
        />
      )}

      {activeModal === 'characters' && (
        <CharacterSheetModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          settings={settings}
          onUpdate={setSettings}
          onClose={() => setActiveModal(null)}
        />
      )}

      {screen === 'PAUSED' && !activeModal && (
        <PauseModal
          onResume={() => setScreen('PLAYING')}
          onRestart={() => {
            handleStartNewGame();
          }}
          onOpenSettings={() => setActiveModal('settings')}
          onMainMenu={() => {
            setActiveModal(null);
            setActiveDialogueId(null);
            setScreen('TITLE_MENU');
          }}
        />
      )}

      {screen === 'GAME_OVER' && gameOverReason && (
        <GameOverModal
          reason={gameOverReason}
          onRetryCheckpoint={() => {
            setGameOverReason(null);
            setActiveModal(null);
            setActiveDialogueId(null);
            setScreen('PLAYING');
            showToast('Kembali ke titik penyelidikan terakhir. Ingat kembali keahlian masing-masing anggota tim!');
          }}
          onRestartGame={() => {
            setGameOverReason(null);
            handleStartNewGame();
          }}
          onMainMenu={() => {
            setGameOverReason(null);
            setActiveModal(null);
            setActiveDialogueId(null);
            setScreen('TITLE_MENU');
          }}
        />
      )}

      {screen === 'ENDING' && (
        <EndingCutsceneModal
          discoveredCount={save.discoveredClues.length}
          unlockedKeysCount={unlockedKeysCount}
          onExploreGoldenCity={() => {
            setScreen('PLAYING');
            transitionToArea('outskirts', 300, {
              worldTransformed: true,
              toastMsg: 'Selamat datang di Neo-Metropolis yang baru dan hangat!',
            });
          }}
          onMainMenu={() => {
            setScreen('TITLE_MENU');
          }}
          onRestart={() => {
            handleStartNewGame();
          }}
        />
      )}
    </div>
  );
}
