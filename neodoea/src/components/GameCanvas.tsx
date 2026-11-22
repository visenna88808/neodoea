import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ChevronDown, Hand, Lock, MapPin, Sparkles } from 'lucide-react';
import { AREAS, INTERACTABLES } from '../data/gameData';
import type {
  AreaId,
  DialogueChoice,
  DialogueNode,
  InteractableObject,
  PlayableCharacterId,
  QuestId,
} from '../types/game';
import { AnimeCharacterSprite } from './AnimeCharacterSprite';
import { DialogueBox, type SpeakerAnchor } from './DialogueBox';
import { soundEngine } from '../audio/soundEngine';

export interface DialogueOverlayConfig {
  node: DialogueNode;
  showSceneIllustration: boolean;
  onAdvance: () => void;
  onSelectChoice: (choice: DialogueChoice) => void;
}

interface GameCanvasProps {
  areaId: AreaId;
  initialX: number;
  activeCharacter: PlayableCharacterId;
  questId: QuestId;
  flags: Record<string, boolean>;
  stageActivityDone: boolean;
  algoPuzzleDone: boolean;
  worldTransformed: boolean;
  isPaused: boolean;
  hasActiveOverlay: boolean;
  showTouchControls: boolean;
  portalArrivalActive?: boolean;
  dialogueOverlay?: DialogueOverlayConfig | null;
  onPortalArrivalComplete?: () => void;
  onPlayerMove: (x: number) => void;
  onInteract: (obj: InteractableObject) => void;
  onChangeArea: (targetArea: AreaId, spawnX: number) => void;
  onShowToast: (msg: string) => void;
}

const GROUND_BOTTOM_PX = 96;
const GRAVITY = 1900;
const JUMP_VELOCITY = 680;
const MOVE_SPEED = 330;

export const GameCanvas: React.FC<GameCanvasProps> = ({
  areaId,
  initialX,
  activeCharacter,
  questId,
  flags,
  stageActivityDone,
  algoPuzzleDone,
  worldTransformed,
  isPaused,
  hasActiveOverlay,
  showTouchControls,
  portalArrivalActive = false,
  dialogueOverlay = null,
  onPortalArrivalComplete,
  onPlayerMove,
  onInteract,
  onChangeArea,
  onShowToast,
}) => {
  const area = AREAS[areaId];
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [viewportWidth, setViewportWidth] = useState(1280);
  const [viewportHeight, setViewportHeight] = useState(720);

  // Physics state stored in refs for smooth 60fps loop, synced to React render state
  const keysRef = useRef<{ left: boolean; right: boolean; jump: boolean }>({
    left: false,
    right: false,
    jump: false,
  });

  const prevAreaRef = useRef<AreaId>(areaId);
  const lastReportedXRef = useRef<number>(initialX);

  // Compute non-overlapping companion positions strictly behind leader's initial facing direction
  const computeInitialCompanions = (spawnX: number, worldW: number, wallRight?: number) => {
    const minB = 45;
    const maxB = wallRight ?? worldW - 55;
    const initDir = spawnX > worldW * 0.65 ? -1 : 1;
    const c1 = Math.max(minB, Math.min(maxB, spawnX - initDir * 78));
    const c2 = Math.max(minB, Math.min(maxB, spawnX - initDir * 150));
    return { c1, c2 };
  };

  const initialComp = computeInitialCompanions(
    initialX,
    area.worldWidth,
    area.id === 'terminal' && !flags.terminal_hacked ? 490 : undefined
  );

  const physRef = useRef({
    x: initialX,
    y: 0, // Height above ground
    vx: 0,
    vy: 0,
    facing: 'right' as 'left' | 'right',
    isMoving: false,
    speedRatio: 0,
    walkPhase: 0,
    isJumping: false,
    ilyasX: initialComp.c1,
    ilyasVx: 0,
    ilyasFacing: 'right' as 'left' | 'right',
    ilyasMoving: false,
    ilyasSpeedRatio: 0,
    ilyasWalkPhase: 0,
    diraX: initialComp.c2,
    diraVx: 0,
    diraFacing: 'right' as 'left' | 'right',
    diraMoving: false,
    diraSpeedRatio: 0,
    diraWalkPhase: 0,
    animTime: 0,
    stepTimer: 0,
    interactingTimer: 0,
  });

  const arrivalRef = useRef({
    active: false,
    elapsed: 0,
    step1Played: false,
    step2Played: false,
    completed: false,
  });

  const [renderState, setRenderState] = useState({
    x: initialX,
    y: 0,
    facing: 'right' as 'left' | 'right',
    isMoving: false,
    speedRatio: 0,
    walkPhase: 0,
    isJumping: false,
    ilyasX: initialComp.c1,
    ilyasFacing: 'right' as 'left' | 'right',
    ilyasMoving: false,
    ilyasSpeedRatio: 0,
    ilyasWalkPhase: 0,
    diraX: initialComp.c2,
    diraFacing: 'right' as 'left' | 'right',
    diraMoving: false,
    diraSpeedRatio: 0,
    diraWalkPhase: 0,
    animTime: 0,
    isInteracting: false,
    arrivalProgress: 1,
  });

  // Trigger smooth portal emergence sequence when arriving from the prologue
  useEffect(() => {
    if (portalArrivalActive) {
      arrivalRef.current = {
        active: true,
        elapsed: 0,
        step1Played: false,
        step2Played: false,
        completed: false,
      };
      physRef.current.x = 190;
      physRef.current.y = 0;
      physRef.current.vx = 0;
      physRef.current.vy = 0;
      physRef.current.facing = 'right';
      physRef.current.speedRatio = 0;
      physRef.current.isMoving = false;
      physRef.current.walkPhase = 0;
      keysRef.current = { left: false, right: false, jump: false };
      setRenderState((prev) => ({
        ...prev,
        x: 190,
        y: 0,
        facing: 'right',
        speedRatio: 0,
        isMoving: false,
        arrivalProgress: 0,
      }));
    } else {
      arrivalRef.current.active = false;
    }
  }, [portalArrivalActive]);

  // Sync ONLY on real area transitions or external resets (ignore periodic onPlayerMove sync)
  useEffect(() => {
    const areaChanged = prevAreaRef.current !== areaId;
    const isExternalTeleport =
      Math.abs(initialX - lastReportedXRef.current) > 2 &&
      Math.abs(initialX - physRef.current.x) > 40;

    if (!areaChanged && !isExternalTeleport) {
      return;
    }

    prevAreaRef.current = areaId;
    lastReportedXRef.current = initialX;
    const nextComp = computeInitialCompanions(
      initialX,
      AREAS[areaId].worldWidth,
      areaId === 'terminal' && !flags.terminal_hacked ? 490 : undefined
    );
    const initFacing: 'left' | 'right' = initialX > AREAS[areaId].worldWidth * 0.65 ? 'left' : 'right';

    physRef.current.x = initialX;
    physRef.current.y = 0;
    physRef.current.vx = 0;
    physRef.current.vy = 0;
    physRef.current.facing = initFacing;
    physRef.current.speedRatio = 0;
    physRef.current.ilyasX = nextComp.c1;
    physRef.current.ilyasVx = 0;
    physRef.current.ilyasFacing = initFacing;
    physRef.current.ilyasSpeedRatio = 0;
    physRef.current.diraX = nextComp.c2;
    physRef.current.diraVx = 0;
    physRef.current.diraFacing = initFacing;
    physRef.current.diraSpeedRatio = 0;
    setRenderState((prev) => ({
      ...prev,
      x: initialX,
      y: 0,
      facing: initFacing,
      speedRatio: 0,
      ilyasX: nextComp.c1,
      ilyasFacing: initFacing,
      ilyasSpeedRatio: 0,
      diraX: nextComp.c2,
      diraFacing: initFacing,
      diraSpeedRatio: 0,
    }));
  }, [areaId, initialX, flags.terminal_hacked]);

  const prevMetFriendsRef = useRef<boolean>(Boolean(flags.met_friends));

  // Sync companion starting positions seamlessly with their NPC spots when first recruited in outskirts
  useEffect(() => {
    const wasMet = prevMetFriendsRef.current;
    prevMetFriendsRef.current = Boolean(flags.met_friends);
    if (!wasMet && flags.met_friends && areaId === 'outskirts') {
      // NPC Dira stood at left: 325 (center 381), NPC Ilyas at left: 432 (center 488)
      physRef.current.ilyasX = 488;
      physRef.current.ilyasVx = 0;
      physRef.current.ilyasSpeedRatio = 0;
      physRef.current.ilyasMoving = false;
      physRef.current.ilyasFacing = physRef.current.facing;
      physRef.current.diraX = 381;
      physRef.current.diraVx = 0;
      physRef.current.diraSpeedRatio = 0;
      physRef.current.diraMoving = false;
      physRef.current.diraFacing = physRef.current.facing;
      setRenderState((prev) => ({
        ...prev,
        ilyasX: 488,
        ilyasSpeedRatio: 0,
        ilyasMoving: false,
        ilyasFacing: physRef.current.facing,
        diraX: 381,
        diraSpeedRatio: 0,
        diraMoving: false,
        diraFacing: physRef.current.facing,
      }));
    }
  }, [flags.met_friends, areaId]);

  // Measure viewport
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setViewportWidth(containerRef.current.clientWidth);
        setViewportHeight(containerRef.current.clientHeight);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Filter active interactables in current area
  const visibleInteractables = INTERACTABLES.filter((obj) => {
    if (obj.areaId !== areaId) return false;
    if (obj.hiddenIfFlag && flags[obj.hiddenIfFlag]) return false;
    if (obj.requiredFlag && !flags[obj.requiredFlag]) return false;
    return true;
  });

  // Find nearest interactable within reach
  const activeTarget = visibleInteractables.reduce<InteractableObject | null>((closest, obj) => {
    const dist = Math.abs(renderState.x - obj.x);
    if (dist <= obj.width / 2 + 65) {
      if (!closest || dist < Math.abs(renderState.x - closest.x)) {
        return obj;
      }
    }
    return closest;
  }, null);

  // Check exit proximity
  const nearLeftExit = area.leftExit && renderState.x < 115;
  const nearRightExit = area.rightExit && renderState.x > area.worldWidth - 115;

  const triggerPrimaryAction = () => {
    if (isPaused || hasActiveOverlay) return;
    soundEngine.unlock();
    if (activeTarget) {
      physRef.current.interactingTimer = 0.65;
      soundEngine.playSfx('click');
      onInteract(activeTarget);
      return;
    }
    if (nearLeftExit && area.leftExit) {
      soundEngine.playSfx('click');
      onChangeArea(area.leftExit.targetArea, area.leftExit.spawnX);
      return;
    }
    if (nearRightExit && area.rightExit) {
      if (area.rightExit.requiredFlag && !flags[area.rightExit.requiredFlag]) {
        soundEngine.playSfx('wrong');
        onShowToast(area.rightExit.lockedMessage || 'Area ini masih terkunci.');
        return;
      }
      soundEngine.playSfx('click');
      onChangeArea(area.rightExit.targetArea, area.rightExit.spawnX);
    }
  };

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused || hasActiveOverlay) return;
      soundEngine.unlock();
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = true;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        keysRef.current.jump = true;
      } else if (e.key === 'e' || e.key === 'E' || e.key === 'Enter') {
        e.preventDefault();
        triggerPrimaryAction();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = false;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        keysRef.current.jump = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  });

  // Clear stuck movement keys when overlays open or during portal arrival
  useEffect(() => {
    if (isPaused || hasActiveOverlay || portalArrivalActive) {
      keysRef.current = { left: false, right: false, jump: false };
    }
  }, [isPaused, hasActiveOverlay, portalArrivalActive]);

  // Main 60fps side-scrolling physics & companion loop
  useEffect(() => {
    let frameId = 0;
    let lastTime = performance.now();
    let syncAccum = 0;

    const step = (now: number) => {
      const dt = Math.min(0.04, (now - lastTime) / 1000);
      lastTime = now;

      const p = physRef.current;
      p.animTime += dt;
      if (p.interactingTimer > 0) p.interactingTimer = Math.max(0, p.interactingTimer - dt);

      let arrivalProgress = 1;

      if (arrivalRef.current.active && !isPaused) {
        const TOTAL_ARRIVAL_SEC = 2.25;
        arrivalRef.current.elapsed += dt;
        const u = Math.min(1, arrivalRef.current.elapsed / TOTAL_ARRIVAL_SEC);
        arrivalProgress = u;

        if (u < 0.28) {
          // Materializing inside the glowing portal vortex
          p.x = 190;
          p.y = 0;
          p.vx = 0;
          p.facing = 'right';
          p.speedRatio = 0;
          p.isMoving = false;
        } else if (u < 0.84) {
          // Stepping smoothly out of the portal onto the Neo-Metropolis sidewalk
          const stepT = (u - 0.28) / 0.56;
          const eased = 1 - Math.pow(1 - stepT, 3);
          const prevX = p.x;
          p.x = 190 + (250 - 190) * eased;
          const deltaX = Math.abs(p.x - prevX);
          p.y = 0;
          p.facing = 'right';
          const walkIntensity = stepT < 0.92 ? Math.max(0.18, Math.sin(stepT * Math.PI) * 0.78) : 0;
          p.speedRatio = walkIntensity;
          p.isMoving = walkIntensity > 0.05;
          p.walkPhase += (deltaX / MOVE_SPEED) * 18;

          if (stepT > 0.22 && !arrivalRef.current.step1Played) {
            arrivalRef.current.step1Played = true;
            soundEngine.playSfx('step');
          }
          if (stepT > 0.64 && !arrivalRef.current.step2Played) {
            arrivalRef.current.step2Played = true;
            soundEngine.playSfx('step');
          }
        } else {
          // Settling feet cleanly on the sidewalk
          p.x = 250;
          p.y = 0;
          p.vx = 0;
          p.facing = 'right';
          p.speedRatio = 0;
          p.isMoving = false;
        }

        if (u >= 1 && !arrivalRef.current.completed) {
          arrivalRef.current.completed = true;
          arrivalRef.current.active = false;
          lastReportedXRef.current = 250;
          onPlayerMove(250);
          onPortalArrivalComplete?.();
        }
      } else if (!isPaused && !hasActiveOverlay) {
        const moveDir = (keysRef.current.right ? 1 : 0) - (keysRef.current.left ? 1 : 0);
        const targetVx = moveDir * MOVE_SPEED;
        const isReversing = moveDir !== 0 && p.vx * moveDir < -10;
        const accel = isReversing ? 3800 : moveDir !== 0 ? 1950 : 2400;
        const dv = targetVx - p.vx;
        if (Math.abs(dv) <= accel * dt) {
          p.vx = targetVx;
        } else {
          p.vx += Math.sign(dv) * accel * dt;
        }

        // Facing ALWAYS matches active velocity direction so character never walks backward
        if (Math.abs(p.vx) > 12) {
          p.facing = p.vx > 0 ? 'right' : 'left';
        } else if (moveDir !== 0) {
          p.facing = moveDir > 0 ? 'right' : 'left';
        }

        p.speedRatio = Math.min(1, Math.abs(p.vx) / MOVE_SPEED);
        p.isMoving = p.speedRatio > 0.04;

        if (Math.abs(p.vx) > 1) {
          const maxRightBound =
            area.id === 'terminal' && !flags.terminal_hacked ? 490 : area.worldWidth - 55;
          const nextX = Math.max(55, Math.min(maxRightBound, p.x + p.vx * dt));
          const actualDelta = Math.abs(nextX - p.x);
          p.x = nextX;
          if (actualDelta < 0.01 && moveDir !== 0) {
            p.vx = 0;
            p.speedRatio = 0;
            p.isMoving = false;
          } else {
            // Distance-synced walk phase prevents foot sliding during accel/decel
            p.walkPhase += (actualDelta / MOVE_SPEED) * 10.6;
          }

          if (!p.isJumping && p.speedRatio > 0.35) {
            p.stepTimer += dt * p.speedRatio;
            if (p.stepTimer >= 0.34) {
              p.stepTimer = 0;
              soundEngine.playSfx('step');
            }
          }
        }

        // Jump
        if (keysRef.current.jump && !p.isJumping) {
          p.vy = JUMP_VELOCITY;
          p.isJumping = true;
          soundEngine.playSfx('jump');
        }

        // Vertical physics + Platform landing collision
        const prevY = p.y;
        p.vy -= GRAVITY * dt;
        p.y += p.vy * dt;

        let landed = false;
        if (p.vy <= 0) {
          for (const plat of area.platforms) {
            const platTop = plat.y;
            const withinX = p.x >= plat.x - 16 && p.x <= plat.x + plat.width + 16;
            if (withinX && prevY >= platTop - 4 && p.y <= platTop) {
              p.y = platTop;
              p.vy = 0;
              p.isJumping = false;
              landed = true;
              break;
            }
          }
        }

        if (!landed && p.y <= 0) {
          p.y = 0;
          p.vy = 0;
          p.isJumping = false;
        }

        // Synchronous companion following AI (Characters 2 & 3 ALWAYS move in Character 1's direction and stop when Character 1 stops)
        if (flags.met_friends) {
          const compMinX = 45;
          const compMaxX =
            area.id === 'terminal' && !flags.terminal_hacked ? 485 : area.worldWidth - 55;
          const leaderMoving = p.isMoving && Math.abs(p.vx) > 15;

          if (!leaderMoving) {
            // Leader stopped -> Companions immediately stop cleanly with zero drift or walking in place
            p.ilyasVx = 0;
            p.ilyasSpeedRatio = 0;
            p.ilyasMoving = false;
            p.ilyasFacing = p.facing;

            p.diraVx = 0;
            p.diraSpeedRatio = 0;
            p.diraMoving = false;
            p.diraFacing = p.facing;
          } else {
            const leaderDir = Math.sign(p.vx); // +1 moving right, -1 moving left
            const leaderSpeed = Math.abs(p.vx);

            const stepCompanion = (
              cX: number,
              cVx: number,
              cWalkPhase: number,
              gap: number,
              maxCatchupMult: number
            ) => {
              const rawSlot = p.x - leaderDir * gap;
              const gapError = (rawSlot - cX) * leaderDir;

              let wantVx = 0;
              if (gapError >= 0) {
                // Behind or at ideal trailing slot: move strictly in leaderDir
                const catchupSpeed = Math.min(MOVE_SPEED * maxCatchupMult, leaderSpeed + gapError * 3.2);
                wantVx = leaderDir * catchupSpeed;
              } else {
                // Temporarily ahead of trailing slot (e.g. just reversed direction or near entry edge):
                // Still walk in leaderDir at a gentler pace so all 3 move in the SAME direction while leader overtakes
                const forwardPace = Math.max(leaderSpeed * 0.36, leaderSpeed + gapError * 2.2);
                wantVx = leaderDir * Math.min(leaderSpeed * 0.95, forwardPace);
              }

              let nextVx = cVx + (wantVx - cVx) * Math.min(1, dt * 16);
              // Never allow residual opposite-direction velocity on rapid direction changes
              if (nextVx * leaderDir < 0) nextVx = 0;

              const nextX = Math.max(compMinX, Math.min(compMaxX, cX + nextVx * dt));
              const movedDist = Math.abs(nextX - cX);

              if (movedDist < 0.05) {
                nextVx = 0;
              }

              const speedRatio = nextVx === 0 ? 0 : Math.min(1, Math.abs(nextVx) / MOVE_SPEED);
              const moving = speedRatio > 0.04;
              const walkPhase = moving ? cWalkPhase + (movedDist / MOVE_SPEED) * 10.6 : cWalkPhase;

              return {
                x: nextX,
                vx: nextVx,
                speedRatio,
                moving,
                walkPhase,
                facing: p.facing,
              };
            };

            const c1 = stepCompanion(p.ilyasX, p.ilyasVx, p.ilyasWalkPhase, 92, 1.14);
            p.ilyasX = c1.x;
            p.ilyasVx = c1.vx;
            p.ilyasSpeedRatio = c1.speedRatio;
            p.ilyasMoving = c1.moving;
            p.ilyasWalkPhase = c1.walkPhase;
            p.ilyasFacing = c1.facing;

            const c2 = stepCompanion(p.diraX, p.diraVx, p.diraWalkPhase, 182, 1.12);
            p.diraX = c2.x;
            p.diraVx = c2.vx;
            p.diraSpeedRatio = c2.speedRatio;
            p.diraMoving = c2.moving;
            p.diraWalkPhase = c2.walkPhase;
            p.diraFacing = c2.facing;
          }
        }
      } else {
        p.vx = 0;
        p.speedRatio = 0;
        p.isMoving = false;
        p.ilyasVx = 0;
        p.ilyasSpeedRatio = 0;
        p.ilyasMoving = false;
        p.diraVx = 0;
        p.diraSpeedRatio = 0;
        p.diraMoving = false;
      }

      syncAccum += dt;
      if (syncAccum >= 0.35) {
        syncAccum = 0;
        const rounded = Math.round(p.x);
        lastReportedXRef.current = rounded;
        onPlayerMove(rounded);
      }

      setRenderState({
        x: p.x,
        y: p.y,
        facing: p.facing,
        isMoving: p.isMoving,
        speedRatio: p.speedRatio,
        walkPhase: p.walkPhase,
        isJumping: p.isJumping,
        ilyasX: p.ilyasX,
        ilyasFacing: p.ilyasFacing,
        ilyasMoving: p.ilyasMoving,
        ilyasSpeedRatio: p.ilyasSpeedRatio,
        ilyasWalkPhase: p.ilyasWalkPhase,
        diraX: p.diraX,
        diraFacing: p.diraFacing,
        diraMoving: p.diraMoving,
        diraSpeedRatio: p.diraSpeedRatio,
        diraWalkPhase: p.diraWalkPhase,
        animTime: p.animTime,
        isInteracting: p.interactingTimer > 0,
        arrivalProgress,
      });

      frameId = window.requestAnimationFrame(step);
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [
    area,
    flags.met_friends,
    flags.terminal_hacked,
    hasActiveOverlay,
    isPaused,
    onPlayerMove,
    onPortalArrivalComplete,
  ]);

  // Camera calculation
  const maxCamera = Math.max(0, area.worldWidth - viewportWidth);
  const cameraX = Math.max(0, Math.min(maxCamera, renderState.x - viewportWidth / 2));

  // Arrival emergence curve computations (0..1 -> smooth depth, opacity, and portal flare)
  const arrU = portalArrivalActive ? renderState.arrivalProgress : 1;
  const arrBurst = portalArrivalActive ? Math.sin(Math.min(1, arrU / 0.85) * Math.PI) : 0;
  const arrOpacity = portalArrivalActive
    ? arrU < 0.06
      ? 0
      : arrU < 0.28
      ? (arrU - 0.06) / 0.22
      : 1
    : 1;
  const arrScale = portalArrivalActive
    ? arrU < 0.28
      ? 0.72 + (1 - Math.pow(1 - arrU / 0.28, 2)) * 0.2
      : arrU < 0.84
      ? 0.92 + (1 - Math.pow(1 - (arrU - 0.28) / 0.56, 2)) * 0.08
      : 1
    : 1;
  const arrCameraZoom = portalArrivalActive ? 1 + (1 - arrU) * 0.05 : 1;

  // Subtle parallax offset for background (kept proportional so buildings never sink or crop vertically)
  const bgParallaxX = -(cameraX * 0.22);
  const bgLayerWidth = Math.max(viewportWidth + maxCamera * 0.22 + 32, viewportWidth * 1.12);

  // Compute overhead speech bubble anchor aligned with whichever character is currently speaking
  const speakerAnchor: SpeakerAnchor | undefined = dialogueOverlay
    ? (() => {
        const sp = dialogueOverlay.node.speaker;
        if (sp === 'narrator') {
          return {
            screenX: null,
            bubbleBottomPx: GROUND_BOTTOM_PX + 210,
            viewportWidth,
            viewportHeight,
          };
        }

        let worldX: number | null = null;
        let worldY = 0;

        if (sp === activeCharacter) {
          worldX = renderState.x;
          worldY = renderState.y;
        } else if (sp === 'nino' || sp === 'ilyas' || sp === 'dira') {
          if (!flags.met_friends) {
            if (sp === 'dira') worldX = 381;
            else if (sp === 'ilyas') worldX = 488;
            else worldX = renderState.x;
          } else {
            const companions = (['nino', 'ilyas', 'dira'] as const).filter(
              (c) => c !== activeCharacter
            );
            const idx = companions.indexOf(sp);
            worldX = idx === 0 ? renderState.ilyasX : renderState.diraX;
          }
        } else {
          const npcPositions: Partial<Record<AreaId, Record<string, number>>> = {
            outskirts: { sari: 740, dani: 1620 },
            plaza: { raka: 560, maya: 1640 },
            stage: { wiryo: 560, rani: 1460 },
            terminal: { ilham: 780, arga: 1580 },
          };
          const areaNpcMap = npcPositions[areaId];
          if (areaNpcMap && typeof areaNpcMap[sp] === 'number') {
            worldX = areaNpcMap[sp];
          }
        }

        return {
          screenX: worldX !== null ? Math.round(worldX - cameraX) : null,
          bubbleBottomPx: GROUND_BOTTOM_PX + worldY + 206,
          viewportWidth,
          viewportHeight,
        };
      })()
    : undefined;

  return (
    <>
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-slate-950 select-none"
      style={{
        transform: portalArrivalActive ? `scale(${arrCameraZoom.toFixed(4)})` : undefined,
        transformOrigin: '24% 72%',
      }}
    >
      {/* Parallax 2D Anime Background Painting (Anchored right to the top of the sidewalk so buildings never sink) */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none overflow-hidden"
        style={{ bottom: GROUND_BOTTOM_PX - 6 }}
      >
        <div
          className="h-full"
          style={{
            width: bgLayerWidth,
            transform: `translate3d(${bgParallaxX}px, 0, 0)`,
          }}
        >
          <img
            src={area.backgroundUrl}
            alt={area.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-bottom transition-all duration-1000"
            style={{
              filter: worldTransformed
                ? 'sepia(0.14) saturate(1.18) brightness(1.06)'
                : 'saturate(1.04) brightness(1.0)',
            }}
          />
        </div>
      </div>

      {/* Atmospheric Lighting Layer (Sore Pulang Sekolah ~16:30 WIB Before vs Golden Hour After) */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none transition-all duration-1000"
        style={{
          bottom: GROUND_BOTTOM_PX,
          background: worldTransformed
            ? 'linear-gradient(180deg, rgba(251,191,36,0.16) 0%, rgba(249,115,22,0.08) 55%, rgba(15,23,42,0.08) 100%)'
            : 'linear-gradient(180deg, rgba(249,115,22,0.20) 0%, rgba(168,85,247,0.08) 44%, rgba(15,23,42,0.08) 100%)',
        }}
      />

      {/* Ambient Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[12, 27, 41, 58, 73, 86].map((leftPct, i) => (
          <div
            key={leftPct}
            className="absolute rounded-full animate-float-slow"
            style={{
              left: `${leftPct}%`,
              top: `${18 + (i % 3) * 18}%`,
              width: 5 + (i % 2) * 3,
              height: 5 + (i % 2) * 3,
              backgroundColor: worldTransformed
                ? 'rgba(253, 224, 71, 0.55)'
                : i % 2 === 0
                ? 'rgba(251, 191, 36, 0.44)'
                : 'rgba(56, 189, 248, 0.38)',
              animationDelay: `${i * 0.6}s`,
              filter: 'blur(1px)',
            }}
          />
        ))}
      </div>

      {/* World Coordinate Layer */}
      <div
        className="absolute inset-y-0 left-0 will-change-transform"
        style={{
          width: area.worldWidth,
          transform: `translate3d(${-cameraX}px, 0, 0)`,
        }}
      >
        {/* Ground Plane */}
        <div
          className="absolute bottom-0 left-0 right-0 border-t border-white/15"
          style={{
            height: GROUND_BOTTOM_PX,
            background: worldTransformed
              ? 'linear-gradient(180deg, #292524 0%, #1c1917 100%)'
              : 'linear-gradient(180deg, #262b40 0%, #111728 100%)',
          }}
        >
          {/* Subtle futuristic sidewalk grid lines */}
          <div className="w-full h-3 bg-gradient-to-b from-white/10 to-transparent" />
        </div>

        {/* Collision Platforms */}
        {area.platforms.map((plat) => (
          <div
            key={plat.id}
            className="absolute rounded-t-md border-t-2 border-x border-sky-400/35 bg-slate-900/80 shadow-lg"
            style={{
              left: plat.x,
              bottom: GROUND_BOTTOM_PX + plat.y - plat.height,
              width: plat.width,
              height: plat.height,
            }}
          >
            {plat.label && (
              <span className="absolute -bottom-5 left-2 text-[10px] tracking-wide text-slate-400/80 whitespace-nowrap">
                {plat.label}
              </span>
            )}
          </div>
        ))}

        {/* AREA SPECIFIC IN-WORLD PROPS */}
        {areaId === 'outskirts' && (
          <>
            {/* Dimensional Portal (Arrival Gate) */}
            <div
              className="absolute flex items-center justify-center"
              style={{ left: 120, bottom: GROUND_BOTTOM_PX + 10, width: 140, height: 190 }}
            >
              {/* Ground Light Spill When Emerging */}
              {arrBurst > 0.02 && (
                <div
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full pointer-events-none blur-md"
                  style={{
                    width: 110 + arrBurst * 95,
                    height: 22,
                    opacity: arrBurst * 0.72,
                    background:
                      'radial-gradient(ellipse, rgba(125,211,252,0.85) 0%, rgba(99,102,241,0.38) 55%, transparent 75%)',
                  }}
                />
              )}

              {/* Outer Expanding Dimensional Ripple Ring during Arrival */}
              {arrBurst > 0.02 && (
                <div
                  className="absolute rounded-full border-2 border-cyan-300/75 pointer-events-none"
                  style={{
                    width: 112 + arrBurst * 46,
                    height: 176 + arrBurst * 54,
                    opacity: arrBurst * 0.7,
                    boxShadow: '0 0 36px rgba(56,189,248,0.65), inset 0 0 24px rgba(167,139,250,0.45)',
                  }}
                />
              )}

              <div
                className="w-28 h-44 rounded-full animate-portal-spin"
                style={{
                  transform: `scale(${(1 + arrBurst * 0.28).toFixed(3)})`,
                  background: worldTransformed
                    ? 'radial-gradient(circle, rgba(253,224,71,0.85) 0%, rgba(34,211,238,0.6) 55%, transparent 72%)'
                    : 'radial-gradient(circle, rgba(125,211,252,0.85) 0%, rgba(99,102,241,0.52) 55%, transparent 72%)',
                  boxShadow: worldTransformed
                    ? '0 0 42px rgba(251,191,36,0.55)'
                    : `0 0 ${Math.round(28 + arrBurst * 42)}px rgba(56,189,248,${(0.4 + arrBurst * 0.45).toFixed(2)})`,
                }}
              />
              <div
                className="absolute w-14 h-28 rounded-full border-2 border-dashed"
                style={{
                  borderColor: worldTransformed ? '#fef08a' : '#7dd3fc',
                  transform: `scale(${(1 + arrBurst * 0.22).toFixed(3)})`,
                }}
              />

              {/* Swirling Luminous Energy Sparks Exiting Portal */}
              {arrBurst > 0.04 &&
                [0, 1, 2, 3, 4, 5].map((idx) => {
                  const angle = idx * 1.05 + renderState.animTime * 3.4;
                  const px = Math.cos(angle) * (24 + idx * 9 + arrBurst * 18);
                  const py = Math.sin(angle * 1.2) * (34 + arrBurst * 26);
                  return (
                    <span
                      key={idx}
                      className="absolute rounded-full bg-cyan-200 pointer-events-none"
                      style={{
                        width: 5 + (idx % 2) * 3,
                        height: 5 + (idx % 2) * 3,
                        opacity: arrBurst * 0.85,
                        transform: `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0)`,
                        boxShadow: '0 0 10px rgba(103,232,249,0.95)',
                      }}
                    />
                  );
                })}
            </div>

            {/* Realistic Wooden Dock Bench Seated on plat_warung_bench (x: 520..690, top at y=74) */}
            <div
              className="absolute pointer-events-none"
              style={{ left: 534, bottom: GROUND_BOTTOM_PX + 74, width: 142, height: 42 }}
            >
              {/* Iron legs */}
              <div className="absolute bottom-0 left-3 w-2 h-4 bg-slate-800 border-x border-slate-600/70" />
              <div className="absolute bottom-0 right-3 w-2 h-4 bg-slate-800 border-x border-slate-600/70" />
              {/* Cast-iron armrests */}
              <div className="absolute bottom-3 left-1 w-3 h-5 rounded-t border border-slate-500/70 bg-slate-800" />
              <div className="absolute bottom-3 right-1 w-3 h-5 rounded-t border border-slate-500/70 bg-slate-800" />
              {/* Teak wooden seat plank */}
              <div className="absolute bottom-3 left-1 right-1 h-2.5 rounded-sm bg-gradient-to-b from-amber-700 to-amber-950 border border-amber-500/40 shadow" />
              {/* Backrest struts + double timber slats */}
              <div className="absolute bottom-5 left-4 w-1.5 h-5 bg-slate-700" />
              <div className="absolute bottom-5 right-4 w-1.5 h-5 bg-slate-700" />
              <div className="absolute top-2.5 left-2 right-2 h-2 rounded-xs bg-gradient-to-b from-amber-600 to-amber-900 border border-amber-500/40" />
              <div className="absolute top-0 left-2 right-2 h-2 rounded-xs bg-gradient-to-b from-amber-600 to-amber-900 border border-amber-500/40" />
            </div>

            {/* Realistic Warung Mba Sari Canopy & Signboard (x: 660..816) */}
            <div
              className="absolute pointer-events-none"
              style={{ left: 662, bottom: GROUND_BOTTOM_PX + 150, width: 156, height: 54 }}
            >
              {/* Warm hanging lantern glow */}
              {(worldTransformed || flags.outskirts_quiz_done) && (
                <div
                  className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-32 h-16 rounded-full blur-md"
                  style={{
                    background:
                      'radial-gradient(ellipse, rgba(251,191,36,0.42) 0%, transparent 72%)',
                  }}
                />
              )}
              {/* Wooden signboard */}
              <div
                className="rounded-lg border px-3 py-1.5 backdrop-blur-sm transition-colors duration-700 shadow-lg"
                style={{
                  backgroundColor:
                    worldTransformed || flags.outskirts_quiz_done
                      ? 'rgba(146, 64, 14, 0.88)'
                      : 'rgba(15, 23, 42, 0.85)',
                  borderColor:
                    worldTransformed || flags.outskirts_quiz_done
                      ? 'rgba(253, 224, 71, 0.55)'
                      : 'rgba(148, 163, 184, 0.3)',
                }}
              >
                <p className="text-xs font-semibold text-amber-100 whitespace-nowrap">Warung Mba Sari</p>
                <p className="text-[10px] text-amber-200/80 whitespace-nowrap">
                  {worldTransformed ? 'Ramai & Hangat' : flags.outskirts_mat_done ? 'Sumber Materi 1' : 'Warung Dermaga'}
                </p>
              </div>
              {/* Corrugated awning trim */}
              <div className="mt-0.5 h-2 rounded-b border-x border-b border-amber-500/40 bg-gradient-to-r from-amber-800/85 via-amber-700/85 to-amber-900/85" />
            </div>

            {/* Realistic Industrial Electrical Cable Cabinet (Papan Kabel Lampion Halte, x: 1180) */}
            <div
              className="absolute pointer-events-none"
              style={{ left: 1138, bottom: GROUND_BOTTOM_PX + 68, width: 84, height: 102 }}
            >
              {/* Steel conduit pipes descending into dock pedestal */}
              <div className="absolute -bottom-10 left-4 w-2 h-10 bg-gradient-to-r from-slate-700 to-slate-500 border-x border-slate-900" />
              <div className="absolute -bottom-10 right-4 w-2 h-10 bg-gradient-to-r from-slate-700 to-slate-500 border-x border-slate-900" />
              {/* Main Hinged Metal Cabinet */}
              <div
                className={`relative w-full h-full rounded-md border-2 p-2 transition-all duration-500 flex flex-col justify-between ${
                  flags.outskirts_game_done
                    ? 'border-amber-300/80 bg-gradient-to-b from-slate-800 to-slate-900 shadow-[0_0_26px_rgba(251,191,36,0.45)]'
                    : questId === 'Q1' && flags.outskirts_mat_done
                    ? 'border-cyan-400/90 bg-gradient-to-b from-slate-800 to-slate-950 shadow-[0_0_22px_rgba(34,211,238,0.4)]'
                    : 'border-slate-500/65 bg-gradient-to-b from-slate-800 to-slate-950'
                }`}
              >
                {/* Hazard Caution Stripe Header */}
                <div
                  className="w-full h-2.5 rounded-xs border border-slate-900"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(135deg, #f59e0b 0 6px, #1e293b 6px 12px)',
                  }}
                />
                {/* Analog Voltmeter + Status LEDs */}
                <div className="flex items-center justify-between gap-1.5 my-1">
                  <div className="w-6 h-6 rounded-full bg-slate-950 border border-slate-500 flex items-center justify-center relative">
                    <span
                      className="w-0.5 h-2.5 origin-bottom rounded-full transition-transform duration-500"
                      style={{
                        backgroundColor: flags.outskirts_game_done ? '#34d399' : '#f43f5e',
                        transform: flags.outskirts_game_done ? 'rotate(36deg)' : 'rotate(-42deg)',
                      }}
                    />
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        flags.outskirts_game_done
                          ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                          : 'bg-rose-500/80 animate-pulse'
                      }`}
                    />
                    <span className="text-[7px] font-mono text-slate-300 tracking-wider">PANEL 220V</span>
                  </div>
                </div>
                {/* Ventilated Louvers & Latch */}
                <div className="space-y-1">
                  <div className="h-1 rounded-full bg-slate-700" />
                  <div className="h-1 rounded-full bg-slate-700" />
                </div>
                <div className="flex items-center justify-between pt-0.5 border-t border-slate-700/80">
                  <span className="w-1.5 h-3 rounded-xs bg-slate-400" />
                  <span
                    className={`text-[8px] font-mono font-bold tracking-wider ${
                      flags.outskirts_game_done ? 'text-amber-300' : 'text-rose-300'
                    }`}
                  >
                    {flags.outskirts_game_done ? 'ARUS ON' : 'PADAM'}
                  </span>
                </div>
              </div>
            </div>

            {/* Realistic Glass & Steel Halte Neo-Bus Shelter (x: 1495..1745) */}
            <div
              className="absolute pointer-events-none"
              style={{ left: 1495, bottom: GROUND_BOTTOM_PX + 92, width: 245, height: 158 }}
            >
              {/* Warm Overhead Light Cone When Lamp Is Repaired */}
              {(flags.outskirts_game_done || worldTransformed) && (
                <div
                  className="absolute top-6 left-4 right-4 h-36 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(251,191,36,0.28) 0%, rgba(251,191,36,0.06) 75%, transparent 100%)',
                    clipPath: 'polygon(12% 0%, 88% 0%, 100% 100%, 0% 100%)',
                  }}
                />
              )}

              {/* Sloped Brushed-Aluminum Roof Canopy */}
              <div
                className={`absolute top-0 left-0 right-0 h-5 rounded-t-xl border-t-2 border-x shadow-xl transition-all duration-700 ${
                  flags.outskirts_game_done || worldTransformed
                    ? 'border-amber-300/80 bg-gradient-to-b from-slate-700 to-slate-900 shadow-[0_8px_28px_rgba(251,191,36,0.3)]'
                    : 'border-cyan-400/50 bg-gradient-to-b from-slate-800 to-slate-950'
                }`}
              >
                <div className="flex items-center justify-between px-3 h-full">
                  <span className="text-[9px] font-bold tracking-wider text-amber-200 uppercase">
                    Halte Neo-Bus
                  </span>
                  <span
                    className={`text-[8px] font-mono px-1.5 py-0.2 rounded ${
                      flags.outskirts_game_done || worldTransformed
                        ? 'bg-amber-400/20 text-amber-200 border border-amber-300/40'
                        : 'bg-slate-800 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {flags.outskirts_game_done || worldTransformed ? 'TERANG' : 'PADAM'}
                  </span>
                </div>
              </div>

              {/* Vertical Steel Shelter Pillars */}
              <div className="absolute top-5 bottom-0 left-3 w-2.5 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-700 border-x border-slate-900" />
              <div className="absolute top-5 bottom-0 right-3 w-2.5 bg-gradient-to-r from-slate-600 via-slate-400 to-slate-700 border-x border-slate-900" />

              {/* Frosted Safety Glass Back Wall & Illuminated Route Board */}
              <div
                className="absolute top-5 bottom-2 left-6 right-6 rounded-sm border border-sky-300/25 backdrop-blur-[1px] flex items-center justify-between px-3"
                style={{
                  background:
                    flags.outskirts_game_done || worldTransformed
                      ? 'linear-gradient(180deg, rgba(254,243,199,0.12) 0%, rgba(15,23,42,0.38) 100%)'
                      : 'linear-gradient(180deg, rgba(56,189,248,0.08) 0%, rgba(15,23,42,0.5) 100%)',
                }}
              >
                {/* Route Map Box */}
                <div className="w-24 rounded border border-cyan-400/35 bg-slate-950/75 p-1.5 shadow-inner">
                  <p className="text-[7px] font-mono text-cyan-300 uppercase">Rute Kota</p>
                  <p className="text-[8px] text-slate-200 font-medium leading-tight mt-0.5">
                    Pelabuhan → Plaza → Sanggar
                  </p>
                </div>

                {/* Wall-mounted warm lantern */}
                <div
                  className={`w-5 h-7 rounded-md border flex items-center justify-center transition-all ${
                    flags.outskirts_game_done || worldTransformed
                      ? 'border-amber-200 bg-amber-300/80 shadow-[0_0_16px_rgba(251,191,36,0.9)]'
                      : 'border-slate-600 bg-slate-800/80'
                  }`}
                >
                  <span
                    className={`w-2 h-3 rounded-full ${
                      flags.outskirts_game_done || worldTransformed ? 'bg-white' : 'bg-slate-600'
                    }`}
                  />
                </div>
              </div>

              {/* Slatted Steel Passenger Bench Inside Shelter */}
              <div className="absolute bottom-0 left-10 right-16 h-6">
                <div className="absolute bottom-0 left-2 w-1.5 h-3 bg-slate-500" />
                <div className="absolute bottom-0 right-2 w-1.5 h-3 bg-slate-500" />
                <div className="absolute bottom-2.5 inset-x-0 h-2 rounded-xs bg-gradient-to-b from-slate-400 to-slate-600 border border-slate-300/40" />
              </div>
            </div>
          </>
        )}

        {areaId === 'plaza' && (
          <>
            {/* Realistic Park Bench on plat_plaza_step1 (x: 430..630) */}
            <div
              className="absolute pointer-events-none"
              style={{ left: 444, bottom: GROUND_BOTTOM_PX + 64, width: 120, height: 36 }}
            >
              <div className="absolute bottom-0 left-2.5 w-1.5 h-3.5 bg-slate-700" />
              <div className="absolute bottom-0 right-2.5 w-1.5 h-3.5 bg-slate-700" />
              <div className="absolute bottom-2.5 inset-x-1 h-2 rounded-xs bg-gradient-to-b from-amber-700 to-amber-950 border border-amber-500/40" />
              <div className="absolute top-0.5 inset-x-2 h-2 rounded-xs bg-gradient-to-b from-amber-600 to-amber-900 border border-amber-500/40" />
            </div>

            {/* Realistic Park Bench on plat_plaza_step2 (x: 1580..1760) */}
            <div
              className="absolute pointer-events-none"
              style={{ left: 1624, bottom: GROUND_BOTTOM_PX + 68, width: 120, height: 36 }}
            >
              <div className="absolute bottom-0 left-2.5 w-1.5 h-3.5 bg-slate-700" />
              <div className="absolute bottom-0 right-2.5 w-1.5 h-3.5 bg-slate-700" />
              <div className="absolute bottom-2.5 inset-x-1 h-2 rounded-xs bg-gradient-to-b from-amber-700 to-amber-950 border border-amber-500/40" />
              <div className="absolute top-0.5 inset-x-2 h-2 rounded-xs bg-gradient-to-b from-amber-600 to-amber-900 border border-amber-500/40" />
            </div>

            {/* Sandang Ayu Plaza Signal Scanner Screen & Pedestal (x: 1080) */}
            <div
              className="absolute bg-gradient-to-t from-slate-800 via-cyan-500/45 to-transparent border-x border-cyan-400/20"
              style={{ left: 1072, bottom: GROUND_BOTTOM_PX, width: 16, height: 108 }}
            />
            <div
              className={`absolute rounded-xl border p-3 backdrop-blur-md animate-holo-pulse transition-all duration-500 ${
                flags.plaza_game_done
                  ? 'border-emerald-400/75 bg-slate-900/85 shadow-[0_0_24px_rgba(16,185,129,0.3)]'
                  : questId === 'Q2' && flags.talked_raka
                  ? 'border-amber-400/90 bg-slate-900/85 shadow-[0_0_24px_rgba(251,191,36,0.38)]'
                  : 'border-cyan-400/45 bg-slate-900/70'
              }`}
              style={{ left: 984, bottom: GROUND_BOTTOM_PX + 106, width: 192 }}
            >
              <div className="flex items-center justify-between text-[11px] text-cyan-300 font-medium">
                <span>Pemindai Sinyal</span>
                <span className="font-mono-data">{flags.plaza_game_done || worldTransformed ? 'STABIL' : '96% FOMO'}</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full transition-all duration-700"
                  style={{
                    width: flags.plaza_game_done || worldTransformed ? '50%' : '96%',
                    backgroundColor: flags.plaza_game_done || worldTransformed ? '#34d399' : '#22d3ee',
                  }}
                />
              </div>
              <p className="mt-1.5 text-[10px] text-slate-300 leading-snug">
                {flags.plaza_game_done || worldTransformed
                  ? 'Sinyal Plaza Pulih · Siap Lapor Bu Maya'
                  : 'Gelombang Iklan & Tren Seragam'}
              </p>
            </div>

            {/* Realistic Armored Plaza Relay Panel (x: 1320) */}
            <div
              className="absolute pointer-events-none"
              style={{ left: 1290, bottom: GROUND_BOTTOM_PX, width: 60, height: 84 }}
            >
              {/* Antenna mast */}
              <div className="mx-auto w-1 h-4 bg-slate-400" />
              <div
                className={`w-full h-16 rounded-md border-2 p-1.5 transition-all bg-gradient-to-b from-slate-800 to-slate-950 ${
                  flags.plaza_relay_inspected
                    ? 'border-emerald-400/70 shadow-[0_0_16px_rgba(16,185,129,0.28)]'
                    : 'border-rose-400/60 shadow-[0_0_14px_rgba(244,63,94,0.22)]'
                }`}
              >
                <div className={`w-full h-2.5 rounded-xs mb-1.5 ${flags.plaza_relay_inspected ? 'bg-emerald-500/50' : 'bg-rose-500/50 animate-pulse'}`} />
                <div className="space-y-1 mb-1">
                  <div className="h-0.5 bg-slate-700" />
                  <div className="h-0.5 bg-slate-700" />
                </div>
                <span className="block text-[8px] font-mono-data text-slate-200 text-center">RELAY</span>
              </div>
            </div>

            {/* Plaza Acoustic Forum Lectern Podium (x: 1920) */}
            <div
              className="absolute pointer-events-none"
              style={{ left: 1878, bottom: GROUND_BOTTOM_PX, width: 84, height: 92 }}
            >
              {/* Dual Gooseneck Mics */}
              <div className="flex justify-center gap-6 h-4">
                <div className="w-0.5 h-4 bg-slate-300 -rotate-12 origin-bottom" />
                <div className="w-0.5 h-4 bg-slate-300 rotate-12 origin-bottom" />
              </div>
              <div
                className={`w-full h-[76px] rounded-t-lg border-2 p-2 transition-all bg-gradient-to-b from-slate-800 to-slate-950 ${
                  questId === 'Q5' || questId === 'COMPLETED'
                    ? 'border-amber-400/80 shadow-[0_0_24px_rgba(251,191,36,0.35)]'
                    : 'border-slate-600/60'
                }`}
              >
                <div className="w-full h-8 rounded bg-slate-900 border border-amber-400/40 flex items-center justify-center">
                  <span className="text-[8px] font-mono-data text-amber-300">FORUM</span>
                </div>
              </div>
            </div>
          </>
        )}

        {areaId === 'stage' && (
          <>
            {/* Sanggar Darmoyudho Carved Wooden Canopy Banner (centered above Stage x: 980) */}
            <div
              className="absolute rounded-lg border-2 px-4 py-1.5 backdrop-blur-sm transition-all duration-700 shadow-lg"
              style={{
                left: 838,
                bottom: GROUND_BOTTOM_PX + 210,
                backgroundColor:
                  stageActivityDone || worldTransformed
                    ? 'rgba(146, 64, 14, 0.88)'
                    : 'rgba(15, 23, 42, 0.85)',
                borderColor:
                  stageActivityDone || worldTransformed
                    ? 'rgba(251, 191, 36, 0.7)'
                    : 'rgba(148, 163, 184, 0.35)',
              }}
            >
              <p className="text-xs font-semibold text-amber-100 whitespace-nowrap tracking-wide">
                {stageActivityDone || worldTransformed
                  ? 'Sanggar Darmoyudho — Aktif'
                  : 'Sanggar Darmoyudho — Terbengkalai'}
              </p>
            </div>

            {/* Detailed Carved Javanese Gamelan Rancakan + Hanging Gong Ageng on Sanggar (x: 980) */}
            <div
              className="absolute flex items-end gap-3 pointer-events-none"
              style={{ left: 902, bottom: GROUND_BOTTOM_PX + 78 }}
            >
              {/* Bonang / Saron Carved Teak Frame with 6 Bronze Pencon Kettles */}
              <div className="relative w-32 h-14 rounded-t-md bg-gradient-to-b from-amber-800 to-amber-950 border-2 border-amber-500/55 flex flex-col justify-between p-1.5 shadow-xl">
                <div className="flex items-center justify-around">
                  {[0, 1, 2, 3, 4, 5].map((k) => (
                    <div key={k} className="flex flex-col items-center">
                      <span className="w-2 h-1 rounded-t-full bg-yellow-300" />
                      <span className="w-3.5 h-2 rounded-b-sm bg-gradient-to-b from-amber-400 to-amber-700 border border-amber-950" />
                    </div>
                  ))}
                </div>
                <div className="h-2 rounded-xs bg-amber-950/90 border-t border-amber-400/35" />
              </div>

              {/* Suspended Gong Ageng on Carved Crimson-Gold Pillars */}
              <div className="relative w-14 h-20 flex flex-col items-center">
                {/* Top crossbar */}
                <div className="w-full h-2 rounded-xs bg-gradient-to-r from-red-900 via-amber-500 to-red-900 border border-amber-400/60" />
                {/* Side Pillars */}
                <div className="w-full flex-1 flex justify-between px-1">
                  <div className="w-1.5 h-full bg-red-900 border-x border-amber-500/40" />
                  <div className="w-1.5 h-full bg-red-900 border-x border-amber-500/40" />
                </div>
                {/* Bronze Gong Disc */}
                <div className="absolute top-3.5 w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 via-amber-600 to-amber-900 border-2 border-amber-950 flex items-center justify-center shadow-lg">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-200 border border-amber-900" />
                </div>
              </div>

              {(stageActivityDone || worldTransformed) && (
                <Sparkles className="w-5 h-5 text-amber-300 animate-bounce mb-10" />
              )}
            </div>

            {/* Realistic Wooden Visitor Bench on Bridge (x: 1360..1580) */}
            <div
              className="absolute pointer-events-none"
              style={{ left: 1388, bottom: GROUND_BOTTOM_PX + 64, width: 112, height: 34 }}
            >
              <div className="absolute bottom-0 left-2 w-1.5 h-3.5 bg-amber-950" />
              <div className="absolute bottom-0 right-2 w-1.5 h-3.5 bg-amber-950" />
              <div className="absolute bottom-2.5 inset-x-1 h-2 rounded-xs bg-gradient-to-b from-amber-700 to-amber-950 border border-amber-500/40" />
              <div className="absolute top-0.5 inset-x-2 h-2 rounded-xs bg-gradient-to-b from-amber-600 to-amber-900 border border-amber-500/40" />
            </div>

            {/* Realistic Audio Touring Flight Case (Kotak Panel Tata Suara, x: 1780) */}
            <div
              className={`absolute rounded-md border-2 p-2 transition-all pointer-events-none bg-gradient-to-b from-slate-800 to-slate-950 ${
                flags.stage_quiz_done && !flags.has_access_card
                  ? 'border-amber-400/90 shadow-[0_0_24px_rgba(251,191,36,0.5)]'
                  : 'border-slate-500/65'
              }`}
              style={{ left: 1750, bottom: GROUND_BOTTOM_PX, width: 60, height: 78 }}
            >
              {/* Aluminum Trim Corners */}
              <div className="w-full h-2.5 rounded-xs bg-cyan-500/35 border border-cyan-300/40 mb-2 flex items-center px-1 gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300" />
              </div>
              {/* Fader Channels */}
              <div className="grid grid-cols-3 gap-1 h-7 px-1">
                <div className="bg-slate-900 rounded-xs flex items-center justify-center">
                  <span className="w-2 h-1 bg-slate-300" />
                </div>
                <div className="bg-slate-900 rounded-xs flex items-center justify-center">
                  <span className="w-2 h-1 bg-amber-300" />
                </div>
                <div className="bg-slate-900 rounded-xs flex items-center justify-center">
                  <span className="w-2 h-1 bg-cyan-300" />
                </div>
              </div>
              <p className="mt-1.5 text-[7px] font-mono text-slate-300 text-center">AUDIO CASE</p>
            </div>
          </>
        )}

        {areaId === 'terminal' && (
          <>
            {/* Security Firewall Barrier (stops player at 490 before hack, gate at 420) */}
            {!flags.terminal_hacked && (
              <div
                className="absolute border-x-2 border-cyan-400/70 bg-cyan-500/15 backdrop-blur-[1px] flex items-center justify-center"
                style={{ left: 525, bottom: GROUND_BOTTOM_PX, width: 22, height: 220 }}
              >
                <span className="text-[10px] font-mono-data text-cyan-200 -rotate-90 whitespace-nowrap">
                  FIREWALL AKTIF
                </span>
              </div>
            )}

            {/* Technician Ergonomic Chair & Server Rack on plat_deck_core */}
            <div
              className="absolute pointer-events-none"
              style={{ left: 1036, bottom: GROUND_BOTTOM_PX + 84, width: 52, height: 74 }}
            >
              <div className="w-full h-full rounded-t border border-cyan-500/35 bg-slate-900/90 p-1.5 flex flex-col justify-between">
                {[0, 1, 2, 3].map((rack) => (
                  <div
                    key={rack}
                    className="h-2.5 rounded-xs bg-slate-800 border border-slate-700 flex items-center justify-between px-1"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${algoPuzzleDone || worldTransformed ? 'bg-emerald-400' : 'bg-cyan-400 animate-pulse'}`} />
                    <span className="w-5 h-0.5 bg-slate-600" />
                  </div>
                ))}
              </div>
            </div>

            {/* Server Core Console (x: 1150) */}
            <div
              className={`absolute rounded-t-lg border-2 p-2 transition-all bg-gradient-to-b from-slate-800 to-slate-950 ${
                algoPuzzleDone
                  ? 'border-emerald-400/75 shadow-[0_0_24px_rgba(16,185,129,0.35)]'
                  : 'border-cyan-400/50'
              }`}
              style={{ left: 1108, bottom: GROUND_BOTTOM_PX + 84, width: 88, height: 88 }}
            >
              <div className="w-full h-11 rounded bg-cyan-950 border border-cyan-400/45 flex flex-col items-center justify-center gap-1">
                <span className="text-[9px] font-mono-data text-cyan-300 font-semibold">INTI SERVER</span>
                <span className={`w-8 h-1 rounded-full ${algoPuzzleDone ? 'bg-emerald-400' : 'bg-cyan-400/60'}`} />
              </div>
            </div>

            {/* Technician Bench Next to Console */}
            <div
              className="absolute pointer-events-none"
              style={{ left: 1226, bottom: GROUND_BOTTOM_PX + 84, width: 46, height: 32 }}
            >
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-4 bg-slate-600" />
              <div className="absolute bottom-0 inset-x-2 h-1.5 rounded-full bg-slate-500" />
              <div className="absolute bottom-4 inset-x-1 h-2.5 rounded-md bg-slate-700 border border-cyan-400/35" />
            </div>

            {/* Return Dimensional Portal Directly Inside Terminal Server Kota (obj_terminal_portal at x: 1910) */}
            <div
              className="absolute flex items-center justify-center pointer-events-none"
              style={{ left: 1840, bottom: GROUND_BOTTOM_PX + 10, width: 140, height: 195 }}
            >
              {/* Ground Light Pool */}
              <div
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full blur-md transition-all duration-700"
                style={{
                  width: worldTransformed ? 150 : 95,
                  height: 20,
                  opacity: worldTransformed ? 0.85 : 0.35,
                  background: worldTransformed
                    ? 'radial-gradient(ellipse, rgba(251,191,36,0.9) 0%, rgba(56,189,248,0.45) 55%, transparent 75%)'
                    : 'radial-gradient(ellipse, rgba(56,189,248,0.5) 0%, transparent 75%)',
                }}
              />
              {/* Outer Arch Ring */}
              <div
                className={`w-28 h-44 rounded-full transition-all duration-700 ${
                  worldTransformed ? 'animate-portal-spin' : ''
                }`}
                style={{
                  background: worldTransformed
                    ? 'radial-gradient(circle, rgba(253,224,71,0.9) 0%, rgba(34,211,238,0.68) 55%, transparent 74%)'
                    : 'radial-gradient(circle, rgba(56,189,248,0.22) 0%, rgba(15,23,42,0.55) 60%, transparent 74%)',
                  boxShadow: worldTransformed
                    ? '0 0 46px rgba(251,191,36,0.65), 0 0 24px rgba(34,211,238,0.5)'
                    : '0 0 18px rgba(56,189,248,0.25)',
                }}
              />
              {/* Inner Dashed Seal Ring */}
              <div
                className="absolute w-16 h-30 rounded-full border-2 border-dashed transition-colors duration-700"
                style={{
                  borderColor: worldTransformed ? '#fef08a' : '#38bdf8',
                  opacity: worldTransformed ? 0.95 : 0.45,
                }}
              />
              {/* Status Tag */}
              <div
                className={`absolute -top-3 px-2.5 py-0.5 rounded-md border text-[9px] font-mono uppercase tracking-wider whitespace-nowrap ${
                  worldTransformed
                    ? 'bg-amber-950/90 border-amber-300/80 text-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.5)]'
                    : 'bg-slate-950/85 border-cyan-500/40 text-cyan-300/85'
                }`}
              >
                {worldTransformed ? 'Portal Pulang · Aktif' : 'Portal Pulang · Segel 4/4'}
              </div>
            </div>
          </>
        )}

        {/* IN-WORLD INTERACTABLE NPCs */}
        {areaId === 'outskirts' && !flags.met_friends && (
          <>
            <div style={{ position: 'absolute', left: 325, bottom: GROUND_BOTTOM_PX }}>
              <AnimeCharacterSprite character="dira" facing="left" animTime={renderState.animTime + 1} />
            </div>
            <div style={{ position: 'absolute', left: 432, bottom: GROUND_BOTTOM_PX }}>
              <AnimeCharacterSprite character="ilyas" facing="left" animTime={renderState.animTime} />
            </div>
          </>
        )}

        {areaId === 'outskirts' && (
          <>
            <div style={{ position: 'absolute', left: 684, bottom: GROUND_BOTTOM_PX }}>
              <AnimeCharacterSprite
                character="sari"
                facing={renderState.x < 740 ? 'left' : 'right'}
                isTransformed={worldTransformed || flags.outskirts_quiz_done}
                animTime={renderState.animTime}
              />
            </div>
            <div style={{ position: 'absolute', left: 1564, bottom: GROUND_BOTTOM_PX }}>
              <AnimeCharacterSprite
                character="dani"
                facing={renderState.x < 1620 ? 'left' : 'right'}
                isTransformed={worldTransformed || flags.outskirts_quiz_done}
                animTime={renderState.animTime + 0.6}
              />
            </div>
          </>
        )}

        {areaId === 'plaza' && (
          <>
            <div style={{ position: 'absolute', left: 504, bottom: GROUND_BOTTOM_PX }}>
              <AnimeCharacterSprite
                character="raka"
                facing={renderState.x < 560 ? 'left' : 'right'}
                isTransformed={worldTransformed || flags.plaza_quiz_done}
                animTime={renderState.animTime}
              />
            </div>
            <div style={{ position: 'absolute', left: 1584, bottom: GROUND_BOTTOM_PX }}>
              <AnimeCharacterSprite
                character="maya"
                facing={renderState.x < 1640 ? 'left' : 'right'}
                isTransformed={worldTransformed || flags.plaza_quiz_done}
                animTime={renderState.animTime + 0.7}
              />
            </div>
          </>
        )}

        {areaId === 'stage' && (
          <>
            <div style={{ position: 'absolute', left: 504, bottom: GROUND_BOTTOM_PX }}>
              <AnimeCharacterSprite
                character="wiryo"
                facing={renderState.x < 560 ? 'left' : 'right'}
                isTransformed={worldTransformed || stageActivityDone}
                animTime={renderState.animTime}
              />
            </div>
            <div style={{ position: 'absolute', left: 1404, bottom: GROUND_BOTTOM_PX }}>
              <AnimeCharacterSprite
                character="rani"
                facing={renderState.x < 1460 ? 'left' : 'right'}
                isTransformed={worldTransformed || flags.stage_quiz_done}
                animTime={renderState.animTime + 0.5}
              />
            </div>
          </>
        )}

        {areaId === 'terminal' && (
          <>
            <div style={{ position: 'absolute', left: 724, bottom: GROUND_BOTTOM_PX }}>
              <AnimeCharacterSprite
                character="ilham"
                facing={renderState.x < 780 ? 'left' : 'right'}
                isTransformed={worldTransformed || algoPuzzleDone}
                animTime={renderState.animTime}
              />
            </div>
            <div style={{ position: 'absolute', left: 1524, bottom: GROUND_BOTTOM_PX }}>
              <AnimeCharacterSprite
                character="arga"
                facing={renderState.x < 1580 ? 'left' : 'right'}
                isTransformed={worldTransformed || flags.terminal_quiz_done}
                animTime={renderState.animTime + 0.8}
              />
            </div>
          </>
        )}

        {/* COMPANIONS FOLLOWING ACTIVE LEADER (once met) */}
        {flags.met_friends &&
          (['nino', 'ilyas', 'dira'] as const)
            .filter((c) => c !== activeCharacter)
            .map((companion, idx) => {
              const cX = idx === 0 ? renderState.ilyasX : renderState.diraX;
              const cFacing = idx === 0 ? renderState.ilyasFacing : renderState.diraFacing;
              const cMoving = idx === 0 ? renderState.ilyasMoving : renderState.diraMoving;
              const cSpeed = idx === 0 ? renderState.ilyasSpeedRatio : renderState.diraSpeedRatio;
              const cPhase = idx === 0 ? renderState.ilyasWalkPhase : renderState.diraWalkPhase;
              return (
                <div
                  key={companion}
                  style={{
                    position: 'absolute',
                    left: cX - 56,
                    bottom: GROUND_BOTTOM_PX,
                    zIndex: 18 + idx,
                  }}
                >
                  <AnimeCharacterSprite
                    character={companion}
                    facing={cFacing}
                    isMoving={cMoving}
                    speedRatio={cSpeed}
                    walkPhase={cPhase}
                    strictGround
                    isTransformed={worldTransformed}
                    animTime={renderState.animTime + 0.35 * (idx + 1)}
                  />
                </div>
              );
            })}

        {/* GROUND-PROJECTED SHADOW DURING JUMP */}
        {renderState.y > 2 && (
          <div
            className="absolute rounded-full bg-slate-950/60 blur-[2px] pointer-events-none"
            style={{
              left: renderState.x - 22,
              bottom: GROUND_BOTTOM_PX - 3,
              width: Math.max(24, 46 - renderState.y * 0.14),
              height: 7,
              zIndex: 20,
            }}
          />
        )}

        {/* ACTIVE CONTROLLED CHARACTER */}
        <div
          style={{
            position: 'absolute',
            left: renderState.x - 56,
            bottom: GROUND_BOTTOM_PX + renderState.y,
            zIndex: 25,
            opacity: arrOpacity,
            transform: `scale(${arrScale.toFixed(4)})`,
            transformOrigin: 'bottom center',
            filter:
              arrBurst > 0.08
                ? `drop-shadow(0 0 ${Math.round(arrBurst * 16)}px rgba(56,189,248,${(arrBurst * 0.78).toFixed(2)}))`
                : undefined,
          }}
        >
          <AnimeCharacterSprite
            character={activeCharacter}
            facing={renderState.facing}
            isMoving={renderState.isMoving}
            speedRatio={renderState.speedRatio}
            walkPhase={renderState.walkPhase}
            isJumping={renderState.isJumping}
            isInteracting={renderState.isInteracting}
            strictGround
            mood={
              portalArrivalActive && arrU < 0.75
                ? 'surprised'
                : activeTarget
                ? 'curious'
                : 'neutral'
            }
            eyeLookX={activeTarget ? 0.55 : 0}
            isTransformed={worldTransformed}
            isActiveLeader={Boolean(flags.met_friends)}
            animTime={renderState.animTime}
          />
        </div>

        {/* FLOATING INTERACTABLE INDICATORS (Strictly Blind — Never Spoils Character Skill) */}
        {visibleInteractables.map((obj) => {
          const isTarget = activeTarget?.id === obj.id;

          const isQuestRelevant =
            (questId === 'Q1' &&
              ((!flags.met_friends && obj.id === 'obj_meet_friends') ||
                (flags.met_friends && !flags.outskirts_mat_done && obj.id === 'obj_warung_sari') ||
                (flags.outskirts_mat_done && !flags.outskirts_game_done && obj.id === 'obj_minigame_outskirts') ||
                (flags.outskirts_game_done && !flags.outskirts_quiz_done && obj.id === 'obj_dani'))) ||
            (questId === 'Q2' &&
              ((!flags.talked_raka && obj.id === 'obj_raka') ||
                (flags.talked_raka && !flags.plaza_game_done && obj.id === 'obj_minigame_plaza') ||
                (flags.plaza_game_done && !flags.plaza_quiz_done && obj.id === 'obj_maya'))) ||
            (questId === 'Q3' &&
              ((!flags.talked_wiryo && obj.id === 'obj_pak_wiryo') ||
                (flags.talked_wiryo && !stageActivityDone && obj.id === 'obj_gamelan') ||
                (stageActivityDone && !flags.stage_quiz_done && obj.id === 'obj_rani') ||
                (flags.stage_quiz_done && !flags.has_access_card && obj.id === 'obj_access_card_box'))) ||
            (questId === 'Q4' &&
              ((!flags.terminal_hacked && obj.id === 'obj_security_gate') ||
                (flags.terminal_hacked && !flags.terminal_mat_done && obj.id === 'obj_ilham') ||
                (flags.terminal_mat_done && !algoPuzzleDone && obj.id === 'obj_algo_console') ||
                (algoPuzzleDone && !flags.terminal_quiz_done && obj.id === 'obj_arga'))) ||
            (questId === 'Q5' && (obj.id === 'obj_arga' || obj.id === 'obj_plaza_forum')) ||
            (questId === 'COMPLETED' &&
              (obj.id === 'obj_terminal_portal' || obj.id === 'obj_portal'));

          const promptBottom =
            obj.id === 'obj_plaza_relay' ||
            obj.id === 'obj_access_card_box' ||
            obj.id === 'obj_plaza_forum'
              ? GROUND_BOTTOM_PX + 104
              : obj.id === 'obj_minigame_outskirts'
              ? GROUND_BOTTOM_PX + 184
              : obj.id === 'obj_minigame_plaza' || obj.id === 'obj_algo_console'
              ? GROUND_BOTTOM_PX + 216
              : obj.id === 'obj_gamelan'
              ? GROUND_BOTTOM_PX + 158
              : obj.id === 'obj_terminal_portal'
              ? GROUND_BOTTOM_PX + 224
              : GROUND_BOTTOM_PX + 194;

          return (
            <div
              key={obj.id}
              style={{ left: obj.x, bottom: promptBottom }}
              className="absolute -translate-x-1/2 z-30 flex flex-col items-center"
            >
              {isTarget ? (
                <button
                  type="button"
                  onClick={() => triggerPrimaryAction()}
                  className="px-3.5 py-2 rounded-lg bg-slate-900/95 border border-sky-400/75 text-slate-100 shadow-xl hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span className="text-xs font-semibold text-sky-300">
                    [E] {obj.promptText}
                  </span>
                </button>
              ) : isQuestRelevant ? (
                <div className="flex flex-col items-center animate-float-slow pointer-events-none">
                  <div className="px-2.5 py-1 rounded-md bg-amber-500/95 border border-amber-200 text-[11px] font-bold text-slate-950 shadow-[0_0_16px_rgba(251,191,36,0.55)] whitespace-nowrap flex items-center gap-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{obj.label}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-amber-300 -mt-0.5 drop-shadow" />
                </div>
              ) : null}
            </div>
          );
        })}

        {/* AREA EXITS (LEFT & RIGHT) */}
        {area.leftExit && (
          <button
            type="button"
            onClick={() => onChangeArea(area.leftExit!.targetArea, area.leftExit!.spawnX)}
            style={{ left: 32, bottom: GROUND_BOTTOM_PX + 24 }}
            className={`absolute z-30 px-3 py-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              nearLeftExit
                ? 'bg-sky-600/90 border-sky-300 text-white shadow-lg scale-105'
                : 'bg-slate-900/80 border-slate-600/70 text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{area.leftExit.label}</span>
          </button>
        )}

        {area.rightExit && (() => {
          const rightLocked = Boolean(
            area.rightExit.requiredFlag && !flags[area.rightExit.requiredFlag]
          );
          const sqFlag =
            areaId === 'outskirts'
              ? 'sq_outskirts_done'
              : areaId === 'plaza'
              ? 'sq_plaza_done'
              : areaId === 'stage'
              ? 'sq_stage_done'
              : '';
          const needsSideQuest = Boolean(!rightLocked && sqFlag && !flags[sqFlag]);

          return (
            <button
              type="button"
              onClick={() => {
                if (rightLocked) {
                  soundEngine.playSfx('wrong');
                  onShowToast(area.rightExit?.lockedMessage || 'Terkunci.');
                  return;
                }
                onChangeArea(area.rightExit!.targetArea, area.rightExit!.spawnX);
              }}
              style={{ right: 32, bottom: GROUND_BOTTOM_PX + 24 }}
              className={`absolute z-30 px-3 py-2 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                rightLocked
                  ? 'bg-slate-950/85 border-slate-700/80 text-slate-400 hover:bg-slate-900'
                  : needsSideQuest
                  ? nearRightExit
                    ? 'bg-amber-600/95 border-amber-200 text-slate-950 font-bold shadow-lg scale-105'
                    : 'bg-amber-950/85 border-amber-400/70 text-amber-200 hover:bg-amber-900/85'
                  : nearRightExit
                  ? 'bg-sky-600/90 border-sky-300 text-white shadow-lg scale-105'
                  : 'bg-slate-900/80 border-slate-600/70 text-slate-200 hover:bg-slate-800'
              }`}
            >
              {rightLocked ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Terkunci · {area.rightExit.label}</span>
                </>
              ) : needsSideQuest ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>Side Quest · {area.rightExit.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>{area.rightExit.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          );
        })()}
      </div>

      {/* BOTTOM CONTROL HINT & OPTIONAL TOUCH CONTROLS */}
      <div className="absolute bottom-3 left-4 right-4 z-30 flex items-end justify-between pointer-events-none">
        <div className="hidden md:flex items-center gap-3 px-3.5 py-2 rounded-lg bg-slate-950/80 border border-white/10 text-xs text-slate-300 backdrop-blur-md">
          <span>A / D atau Panah: Jalan</span>
          <span aria-hidden="true">·</span>
          <span>W / Spasi: Lompat</span>
          <span aria-hidden="true">·</span>
          <span>E: Periksa / Bicara</span>
          {flags.met_friends && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-sky-300">1/2/3 atau Tab: Ganti Karakter</span>
            </>
          )}
        </div>

        {showTouchControls && (
          <div className="flex items-center justify-between w-full md:w-auto md:gap-4 pointer-events-auto">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Gerak Kiri"
                onPointerDown={() => {
                  soundEngine.unlock();
                  keysRef.current.left = true;
                }}
                onPointerUp={() => (keysRef.current.left = false)}
                onPointerLeave={() => (keysRef.current.left = false)}
                className="w-12 h-12 rounded-xl bg-slate-900/85 border border-white/20 text-white flex items-center justify-center active:bg-sky-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                aria-label="Gerak Kanan"
                onPointerDown={() => {
                  soundEngine.unlock();
                  keysRef.current.right = true;
                }}
                onPointerUp={() => (keysRef.current.right = false)}
                onPointerLeave={() => (keysRef.current.right = false)}
                className="w-12 h-12 rounded-xl bg-slate-900/85 border border-white/20 text-white flex items-center justify-center active:bg-sky-600"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Lompat"
                onPointerDown={() => {
                  soundEngine.unlock();
                  keysRef.current.jump = true;
                }}
                onPointerUp={() => (keysRef.current.jump = false)}
                onPointerLeave={() => (keysRef.current.jump = false)}
                className="w-12 h-12 rounded-xl bg-slate-900/85 border border-white/20 text-white flex items-center justify-center active:bg-sky-600"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
              <button
                type="button"
                aria-label="Periksa Objek"
                onClick={() => triggerPrimaryAction()}
                className="h-12 px-4 rounded-xl bg-sky-600/90 border border-sky-300/60 text-white font-medium text-xs flex items-center gap-1.5 active:bg-sky-500"
              >
                <Hand className="w-4 h-4" />
                <span>Periksa</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    {dialogueOverlay && (
      <DialogueBox
        node={dialogueOverlay.node}
        areaId={areaId}
        activeCharacter={activeCharacter}
        worldTransformed={worldTransformed}
        speakerAnchor={speakerAnchor}
        showSceneIllustration={dialogueOverlay.showSceneIllustration}
        onAdvance={dialogueOverlay.onAdvance}
        onSelectChoice={dialogueOverlay.onSelectChoice}
      />
    )}
    </>
  );
};
