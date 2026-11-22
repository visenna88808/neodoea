export type AreaId = 'outskirts' | 'plaza' | 'stage' | 'terminal';

export type ScreenMode = 'TITLE_MENU' | 'PROLOGUE' | 'PLAYING' | 'PAUSED' | 'ENDING' | 'GAME_OVER';

export type PlayableCharacterId = 'nino' | 'ilyas' | 'dira';

export type CharacterId =
  | PlayableCharacterId
  | 'raka'
  | 'wiryo'
  | 'sari'
  | 'dani'
  | 'maya'
  | 'rani'
  | 'ilham'
  | 'arga'
  | 'narrator';

export type Expression = 'neutral' | 'curious' | 'worried' | 'happy' | 'serious' | 'determined';

export type QuestId = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Q5' | 'COMPLETED';

export type PuzzleModalType =
  | 'board1'
  | 'board2'
  | 'stage_activity'
  | 'minigame_circuit'
  | 'minigame_catcher'
  | 'minigame_memory'
  | 'side_quest'
  | 'final_collab'
  | 'city_choice'
  | 'ending'
  | 'curiosity_plaza'
  | 'curiosity_panel'
  | 'empathy_raka'
  | 'empathy_wiryo'
  | 'hacking_gate'
  | 'hacking_kiosk'
  | 'hacking_log';

export interface GameOverReason {
  title: string;
  cause: string;
  lesson: string;
  chosenCharacter: PlayableCharacterId;
  recommendedSkill: 'Curiosity Trigger' | 'Data Hacking' | 'Social Empathy';
  questLabel: string;
}

export interface Clue {
  id: string;
  code: string;
  title: string;
  summary: string;
  sociologyConcept: string;
  source: string;
  questId: QuestId;
}

export interface DialogueChoice {
  label: string;
  nextNodeId: string;
  requiresSkill?: 'curiosity' | 'hacking' | 'empathy';
  effect?: {
    addClueId?: string;
    setFlag?: string;
    advanceQuest?: QuestId;
    openModal?: PuzzleModalType;
    unlockArea?: AreaId;
  };
}

export interface DialogueNode {
  id: string;
  speaker: CharacterId;
  speakerName: string;
  expression: Expression;
  text: string;
  nextNodeId?: string;
  choices?: DialogueChoice[];
  onComplete?: {
    addClueId?: string;
    setFlag?: string;
    advanceQuest?: QuestId;
    openModal?: PuzzleModalType;
    unlockArea?: AreaId;
  };
}

export interface PlatformBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export interface InteractableObject {
  id: string;
  areaId: AreaId;
  x: number;
  width: number;
  label: string;
  type: 'portal' | 'npc' | 'prop' | 'terminal' | 'door';
  characterId?: CharacterId;
  requiredCharacter?: PlayableCharacterId;
  requiredFlag?: string;
  hiddenIfFlag?: string;
  minQuest?: QuestId;
  promptText: string;
  skillBadge?: 'Curiosity Trigger' | 'Data Hacking' | 'Social Empathy';
}

export interface AreaDefinition {
  id: AreaId;
  name: string;
  subtitle: string;
  backgroundUrl: string;
  worldWidth: number;
  groundColor: string;
  accentColor: string;
  leftExit?: { targetArea: AreaId; spawnX: number; label: string };
  rightExit?: { targetArea: AreaId; spawnX: number; label: string; requiredFlag?: string; lockedMessage?: string };
  platforms: PlatformBox[];
}

export interface CharacterProfile {
  id: PlayableCharacterId;
  fullName: string;
  nickname: string;
  birthInfo: string;
  zodiac: string;
  mbti: string;
  height: string;
  schoolClass: string;
  appearance: string[];
  personality: string;
  role: string;
  abilityName: string;
  abilityDesc: string;
  dutySummary: string;
  whenToUse: string;
  specificTasks: string[];
  portraitUrl: string;
  accentHex: string;
}

export interface InvestigationSynthesis {
  id: 'board1' | 'board2';
  title: string;
  prompt: string;
  requiredClueIds: string[];
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
  rewardFlag: string;
  nextQuest?: QuestId;
}

export interface EvaluationQuestion {
  id: string;
  topic: string;
  question: string;
  options: { key: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctKey: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  showTouchControls: boolean;
}

export interface SceneReward {
  id: 'reward_village' | 'reward_plaza' | 'reward_stage' | 'reward_terminal' | 'reward_metropolis';
  sceneName: string;
  keyName: string;
  unlocksScene: string;
  badgeName: string;
  itemReward: string;
  description: string;
  accentHex: string;
}

export interface SaveState {
  currentArea: AreaId;
  playerX: number;
  activeCharacter: PlayableCharacterId;
  questId: QuestId;
  discoveredClues: string[];
  flags: Record<string, boolean>;
  solvedBoards: string[];
  stageActivityDone: boolean;
  algoPuzzleDone: boolean;
  cityChoiceMade: 'A' | 'B' | 'C' | null;
  evaluationAnswers: Record<string, boolean>;
  evaluationAttempts: number;
  evaluationCompleted: boolean;
  worldTransformed: boolean;
  unlockedRewards: string[];
  rewardPoints: number;
  updatedAt: number;
}
