import React, { useId } from 'react';

export type SpriteMood =
  | 'neutral'
  | 'sleepy'
  | 'sleeping'
  | 'surprised'
  | 'curious'
  | 'determined'
  | 'happy';

interface SpriteProps {
  character:
    | 'nino'
    | 'ilyas'
    | 'dira'
    | 'raka'
    | 'wiryo'
    | 'sari'
    | 'dani'
    | 'maya'
    | 'rani'
    | 'ilham'
    | 'arga';
  facing: 'left' | 'right';
  isMoving?: boolean;
  isJumping?: boolean;
  isInteracting?: boolean;
  isTransformed?: boolean;
  isActiveLeader?: boolean;
  hideCap?: boolean;
  strictGround?: boolean;
  animTime: number;
  /** Continuous movement intensity 0..1 for smooth acceleration/deceleration */
  speedRatio?: number;
  /** Explicit distance-synced walk phase (radians) to prevent foot sliding */
  walkPhase?: number;
  /** Facial expression preset */
  mood?: SpriteMood;
  /** 0 (wide awake) .. 1 (eyelids shut) */
  sleepiness?: number;
  /** Horizontal & vertical pupil glance (-1..1) */
  eyeLookX?: number;
  eyeLookY?: number;
  /** Additional head nod/tilt angle in degrees (+ = nod down/forward) */
  headNodDeg?: number;
  /** Disable periodic idle quirk (e.g. during scripted cutscene pauses) */
  disableIdleQuirk?: boolean;
}

const DEG2RAD = Math.PI / 180;

const HD_ANIME_FRAMES: Record<
  | 'nino'
  | 'ilyas'
  | 'dira'
  | 'sari'
  | 'raka'
  | 'wiryo'
  | 'dani'
  | 'maya'
  | 'rani'
  | 'ilham'
  | 'arga',
  readonly [string, string, string, string, string, string]
> = {
  nino: [
    '/assets/sprites/nino_0.png',
    '/assets/sprites/nino_1.png',
    '/assets/sprites/nino_2.png',
    '/assets/sprites/nino_3.png',
    '/assets/sprites/nino_blink.png',
    '/assets/sprites/nino_idle.png',
  ],
  ilyas: [
    '/assets/sprites/ilyas_0.png',
    '/assets/sprites/ilyas_1.png',
    '/assets/sprites/ilyas_2.png',
    '/assets/sprites/ilyas_3.png',
    '/assets/sprites/ilyas_blink.png',
    '/assets/sprites/ilyas_idle.png',
  ],
  dira: [
    '/assets/sprites/dira_0.png',
    '/assets/sprites/dira_1.png',
    '/assets/sprites/dira_2.png',
    '/assets/sprites/dira_3.png',
    '/assets/sprites/dira_blink.png',
    '/assets/sprites/dira_idle.png',
  ],
  sari: [
    '/assets/sprites/sari_0.png',
    '/assets/sprites/sari_0.png',
    '/assets/sprites/sari_0.png',
    '/assets/sprites/sari_0.png',
    '/assets/sprites/sari_blink.png',
    '/assets/sprites/sari_0.png',
  ],
  raka: [
    '/assets/sprites/raka_0.png',
    '/assets/sprites/raka_0.png',
    '/assets/sprites/raka_0.png',
    '/assets/sprites/raka_0.png',
    '/assets/sprites/raka_0.png',
    '/assets/sprites/raka_0.png',
  ],
  wiryo: [
    '/assets/sprites/wiryo_0.png',
    '/assets/sprites/wiryo_0.png',
    '/assets/sprites/wiryo_0.png',
    '/assets/sprites/wiryo_0.png',
    '/assets/sprites/wiryo_0.png',
    '/assets/sprites/wiryo_0.png',
  ],
  dani: [
    '/assets/sprites/dani_0.png',
    '/assets/sprites/dani_0.png',
    '/assets/sprites/dani_0.png',
    '/assets/sprites/dani_0.png',
    '/assets/sprites/dani_0.png',
    '/assets/sprites/dani_0.png',
  ],
  maya: [
    '/assets/sprites/maya_0.png',
    '/assets/sprites/maya_0.png',
    '/assets/sprites/maya_0.png',
    '/assets/sprites/maya_0.png',
    '/assets/sprites/maya_0.png',
    '/assets/sprites/maya_0.png',
  ],
  rani: [
    '/assets/sprites/rani_0.png',
    '/assets/sprites/rani_0.png',
    '/assets/sprites/rani_0.png',
    '/assets/sprites/rani_0.png',
    '/assets/sprites/rani_0.png',
    '/assets/sprites/rani_0.png',
  ],
  ilham: [
    '/assets/sprites/ilham_0.png',
    '/assets/sprites/ilham_0.png',
    '/assets/sprites/ilham_0.png',
    '/assets/sprites/ilham_0.png',
    '/assets/sprites/ilham_0.png',
    '/assets/sprites/ilham_0.png',
  ],
  arga: [
    '/assets/sprites/arga_0.png',
    '/assets/sprites/arga_0.png',
    '/assets/sprites/arga_0.png',
    '/assets/sprites/arga_0.png',
    '/assets/sprites/arga_0.png',
    '/assets/sprites/arga_0.png',
  ],
};

// Smooth 4-beat anime walk sequence: Stride A -> Passing -> Stride B -> Passing
const HD_WALK_CYCLE = [1, 2, 3, 2] as const;

function computeLegKinematics(phase: number, speed: number, isJumping: boolean, isNear: boolean) {
  if (isJumping) {
    const hipDeg = isNear ? 22 : -18;
    const kneeDeg = isNear ? 42 : 28;
    const footDeg = isNear ? 12 : 18;
    return solveLeg(isNear ? 86 : 110, 170, hipDeg, kneeDeg, footDeg);
  }

  const s = Math.sin(phase);
  const c = Math.cos(phase);
  // Natural forward stride angle (+ = leg swung forward)
  const hipDeg = s * 19.5 * speed;
  // Knee bends naturally during swing recovery (c > 0) and softly cushions weight on stance
  const swingKnee = c > 0 ? c * 33 : 0;
  const stancePushKnee = s < 0 ? Math.abs(s) * 12 : 0;
  const kneeDeg = (swingKnee + stancePushKnee + 3.5) * speed + (1 - speed) * 2;
  // Ankle roll: heel-strike slightly upward when forward, flat in mid-stance, toe push-off behind
  const heelStrike = s > 0.25 && c > -0.25 ? -11 * Math.min(1, s) : 0;
  const toeOff = s < -0.2 ? 15 * Math.min(1, -s) : 0;
  const footDeg = (heelStrike + toeOff) * speed;

  return solveLeg(isNear ? 86 : 110, 170, hipDeg, kneeDeg, footDeg);
}

function solveLeg(hx: number, hy: number, hipDeg: number, kneeFlexDeg: number, footTiltDeg: number) {
  const L1 = 68; // Hip -> Knee
  const L2 = 63; // Knee -> Ankle
  const hipR = hipDeg * DEG2RAD;
  const kx = hx + L1 * Math.sin(hipR);
  const ky = hy + L1 * Math.cos(hipR);

  // Knee bends backward (subtract positive flex angle)
  const shinDeg = hipDeg - Math.max(0, kneeFlexDeg);
  const shinR = shinDeg * DEG2RAD;
  const ax = kx + L2 * Math.sin(shinR);
  const ay = ky + L2 * Math.cos(shinR);

  // Compute rotated sole lowest Y relative to ankle (heel offset x=-8,y=18; toe offset x=24,y=18)
  const footR = footTiltDeg * DEG2RAD;
  const sinF = Math.sin(footR);
  const cosF = Math.cos(footR);
  const heelY = ay + -8 * sinF + 18 * cosF;
  const toeY = ay + 24 * sinF + 18 * cosF;
  const soleY = Math.max(heelY, toeY);

  return { hx, hy, kx, ky, ax, ay, hipDeg, shinDeg, footTiltDeg, soleY };
}

function solveArm(
  sx: number,
  sy: number,
  phase: number,
  speed: number,
  idleWave: number,
  isJumping: boolean,
  isFar: boolean
) {
  const U = 42;
  const F = 42;
  const s = Math.sin(phase);
  const shoulderDeg = isJumping
    ? isFar
      ? -28
      : -18
    : s * 15.5 * speed + idleWave * (1 - speed * 0.65);

  // Elbow bends naturally forward (+ angle), more pronounced when arm swings forward
  const baseBend = isJumping ? 28 : 9 + Math.max(0, s) * 17 * speed + (1 - speed) * 4;
  const forearmDeg = shoulderDeg + baseBend;

  const shR = shoulderDeg * DEG2RAD;
  const ex = sx + U * Math.sin(shR);
  const ey = sy + U * Math.cos(shR);

  const foR = forearmDeg * DEG2RAD;
  const wx = ex + F * Math.sin(foR);
  const wy = ey + F * Math.cos(foR);

  return { sx, sy, ex, ey, wx, wy, shoulderDeg, forearmDeg };
}

/**
 * High-vividness 2D Anime Adventure Game Sprite (200x320 grid, natural ~6.6-head teen proportions).
 * Features two-joint articulated knees/ankles/elbows with strict ground contact locking (y=319),
 * smooth eased blinking, pupil gaze tracking, expressive facial moods, and secondary cloth/bag motion.
 */
export const AnimeCharacterSprite: React.FC<SpriteProps> = ({
  character,
  facing,
  isMoving = false,
  isJumping = false,
  isInteracting = false,
  isTransformed = false,
  isActiveLeader = false,
  hideCap = false,
  strictGround = false,
  animTime,
  speedRatio,
  walkPhase,
  mood = 'neutral',
  sleepiness = 0,
  eyeLookX = 0,
  eyeLookY = 0,
  headNodDeg = 0,
  disableIdleQuirk = false,
}) => {
  const uid = useId().replace(/:/g, '');
  const eyeGradId = `eye-${uid}`;
  const skinGradId = `skin-${uid}`;
  const blushGradId = `blush-${uid}`;
  const batikPatId = `batik-${uid}`;
  const pantGradId = `pant-${uid}`;
  const shirtShadeId = `shirt-shade-${uid}`;

  const effectiveSpeed =
    typeof speedRatio === 'number'
      ? Math.max(0, Math.min(1, speedRatio))
      : isMoving
      ? 1
      : 0;

  const phase = typeof walkPhase === 'number' ? walkPhase : animTime * 10.2;

  // Articulated leg kinematics + strict floor lock at y = 319
  const nearLeg = computeLegKinematics(phase, effectiveSpeed, isJumping, true);
  const farLeg = computeLegKinematics(phase + Math.PI, effectiveSpeed, isJumping, false);
  const lowestFootY = Math.max(nearLeg.soleY, farLeg.soleY);
  const groundAnchorOffsetY = isJumping ? 0 : 319 - lowestFootY;
  const containerLift = !strictGround && effectiveSpeed > 0.2 && !isJumping ? 0 : 0;

  // Articulated arms (opposite swing to legs)
  const idleArmWave = Math.sin(animTime * 2.05) * 2.2;
  const nearArm = solveArm(77, 83, phase + Math.PI, effectiveSpeed, idleArmWave, isJumping, false);
  const farArm = solveArm(121, 83, phase, effectiveSpeed, -idleArmWave * 0.7, isJumping, true);

  // Subtle living breathing & torso lean
  const breatheY =
    !isJumping
      ? Math.sin(animTime * (mood === 'sleeping' ? 1.55 : 2.35)) * (1.25 * (1 - effectiveSpeed * 0.45))
      : 0;
  const torsoLean = effectiveSpeed * 3.8 + Math.sin(phase * 2) * 0.75 * effectiveSpeed;
  const headTilt =
    headNodDeg +
    (effectiveSpeed > 0.05
      ? Math.sin(phase) * 1.1 * effectiveSpeed + effectiveSpeed * 1.4
      : Math.sin(animTime * 1.25) * 1.35);

  // Smoothly eased natural blink curve (0 = open, 1 = shut)
  const blinkCycleLen = mood === 'sleepy' ? 2.6 : 4.1;
  const blinkPhase =
    (animTime + (character === 'dira' ? 1.4 : character === 'ilyas' ? 2.7 : 0.3)) % blinkCycleLen;
  let autoBlink = 0;
  if (blinkPhase > blinkCycleLen - 0.22) {
    const t = (blinkPhase - (blinkCycleLen - 0.22)) / 0.22;
    autoBlink = Math.sin(t * Math.PI);
  }
  const lidClosedAmount =
    mood === 'sleeping'
      ? 1
      : mood === 'surprised'
      ? 0
      : Math.max(autoBlink, Math.min(1, sleepiness + (mood === 'sleepy' ? 0.45 : 0)));

  const heightScale =
    character === 'ilyas' || character === 'arga' || character === 'dani'
      ? 1.04
      : character === 'wiryo' || character === 'ilham'
      ? 1.02
      : character === 'dira'
      ? 0.97
      : character === 'sari' || character === 'maya' || character === 'rani' || character === 'raka'
      ? 0.99
      : 1;
  const flipX = facing === 'left' ? -1 : 1;
  const lookShiftX = Math.max(-1, Math.min(1, eyeLookX)) * 1.65;
  const lookShiftY = Math.max(-1, Math.min(1, eyeLookY)) * 1.05;

  const leaderColor =
    character === 'nino'
      ? '#ef4444'
      : character === 'ilyas'
      ? '#38bdf8'
      : character === 'sari'
      ? '#14b8a6'
      : '#fb7185';

  // Keep hideCap prop acknowledged smoothly across consumers
  void hideCap;

  // Refined color-matched anime line art
  const lineSkin = '#7a4935';
  const lineBatik = '#1b496e';
  const linePant = '#64748b';
  const lineHair =
    character === 'nino' ? '#4a2413' : character === 'dira' ? '#1e1b3a' : '#261710';
  const lineDark = '#27272a';

  const skinHi = character === 'ilyas' ? '#f8d0b5' : '#ffece0';
  const skinMid = character === 'ilyas' ? '#e8b087' : '#f9cca7';
  const skinShd = character === 'ilyas' ? '#c88c64' : '#dc9d76';

  const renderShoe = (
    leg: ReturnType<typeof solveLeg>,
    fill: string,
    soleFill: string,
    smallShoe: boolean
  ) => (
    <g transform={`translate(${leg.ax.toFixed(2)}, ${leg.ay.toFixed(2)}) rotate(${leg.footTiltDeg.toFixed(2)})`}>
      <path
        d={
          smallShoe
            ? 'M-7 -1 L7 -1 L22 11 L22 18 L-9 18 Z'
            : 'M-8 -1 L8 -1 L24 11 L24 18 L-10 18 Z'
        }
        fill={fill}
        stroke={lineDark}
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <line
        x1={smallShoe ? -8 : -9}
        y1="15.6"
        x2={smallShoe ? 21 : 23}
        y2="15.6"
        stroke={soleFill}
        strokeWidth="2.7"
        strokeLinecap="round"
      />
    </g>
  );

  const renderLegSegments = (leg: ReturnType<typeof solveLeg>, isFar: boolean) => {
    const legSkinFill = isFar ? skinShd : `url(#${skinGradId})`;
    const pantFill =
      character === 'nino' || character === 'ilyas'
        ? `url(#${pantGradId})`
        : character === 'wiryo'
        ? isFar
          ? '#3f2e21'
          : '#523b2a'
        : isFar
        ? '#1e293b'
        : '#334155';
    const pantStroke = character === 'nino' || character === 'ilyas' ? linePant : lineDark;

    if (character === 'dira') {
      return (
        <g>
          {/* Thigh */}
          <g transform={`translate(${leg.hx}, ${leg.hy}) rotate(${-leg.hipDeg})`}>
            <path
              d="M-8 0 L9 0 L7 70 L-7 70 Z"
              fill={legSkinFill}
              stroke={lineSkin}
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </g>
          {/* Calf */}
          <g transform={`translate(${leg.kx.toFixed(2)}, ${leg.ky.toFixed(2)}) rotate(${-leg.shinDeg.toFixed(2)})`}>
            <path
              d="M-6.5 -2 L6.5 -2 L4.8 63 L-4.8 63 Z"
              fill={legSkinFill}
              stroke={lineSkin}
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {!isFar && <ellipse cx="0" cy="2" rx="3.8" ry="2.2" fill={skinHi} opacity="0.5" />}
          </g>
          {/* Shoe */}
          {renderShoe(leg, '#1e293b', isFar ? '#e2e8f0' : '#f8fafc', true)}
        </g>
      );
    }

    return (
      <g>
        {/* Thigh */}
        <g transform={`translate(${leg.hx}, ${leg.hy}) rotate(${-leg.hipDeg})`}>
          <path
            d="M-10 -2 L11 -2 L9 70 L-9 70 Z"
            fill={pantFill}
            stroke={pantStroke}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          {!isFar && (character === 'nino' || character === 'ilyas') && (
            <path d="M2 6 L3 66" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" />
          )}
        </g>
        {/* Shin */}
        <g transform={`translate(${leg.kx.toFixed(2)}, ${leg.ky.toFixed(2)}) rotate(${-leg.shinDeg.toFixed(2)})`}>
          <path
            d="M-8.6 -2 L8.6 -2 L7.2 64 L-7.2 64 Z"
            fill={pantFill}
            stroke={pantStroke}
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
          {/* Subtle knee fabric crease */}
          <path d="M-5 2 Q0 5 5 2" stroke="#cbd5e1" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          {(character === 'nino' || character === 'ilyas') && (
            <path d="M-5 57 Q0 60 5 56" stroke="#cbd5e1" strokeWidth="1.1" fill="none" strokeLinecap="round" />
          )}
        </g>
        {/* Shoe */}
        {renderShoe(
          leg,
          character === 'nino' || character === 'ilyas' ? '#27272a' : '#111827',
          character === 'nino' || character === 'ilyas' ? (isFar ? '#f8fafc' : '#ffffff') : '#cbd5e1',
          false
        )}
      </g>
    );
  };

  const renderArmSegments = (arm: ReturnType<typeof solveArm>, isFar: boolean) => {
    const sleeveStroke = lineBatik;
    if (character === 'nino' || character === 'ilyas' || character === 'dira') {
      return (
        <g>
          {/* Upper arm + Batik short sleeve */}
          <g transform={`translate(${arm.sx}, ${arm.sy}) rotate(${-arm.shoulderDeg})`}>
            <path
              d="M-6 2 L7 2 L6 43 L-5 43 Z"
              fill={isFar ? skinShd : `url(#${skinGradId})`}
              stroke={lineSkin}
              strokeWidth="1.15"
            />
            <path
              d="M-9 -4 Q0 -7 10 -4 L11 35 L-9 35 Z"
              fill={`url(#${batikPatId})`}
              stroke={sleeveStroke}
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <path
              d="M-9 -4 Q0 -7 10 -4 L11 35 L-9 35 Z"
              fill={`url(#${shirtShadeId})`}
              pointerEvents="none"
            />
            <path d="M-9 32 L11 32 L11 35.5 L-9 35.5 Z" fill="#0c4a6e" opacity="0.55" />
          </g>
          {/* Forearm + Hand */}
          <g transform={`translate(${arm.ex.toFixed(2)}, ${arm.ey.toFixed(2)}) rotate(${-arm.forearmDeg.toFixed(2)})`}>
            <path
              d="M-5.5 -2 L5.8 -2 L4.4 42 L-4.4 42 Z"
              fill={isFar ? skinShd : `url(#${skinGradId})`}
              stroke={lineSkin}
              strokeWidth="1.15"
              strokeLinejoin="round"
            />
            <path
              d="M-4.6 41 Q-5.5 52 0.2 55 Q6 55 6.4 47 L4.6 41 Z"
              fill={isFar ? skinShd : skinMid}
              stroke={lineSkin}
              strokeWidth="1.15"
              strokeLinejoin="round"
            />
          </g>
        </g>
      );
    }

    const coatColor =
      character === 'wiryo'
        ? isFar
          ? '#5c280b'
          : '#78350f'
        : character === 'sari'
        ? isFar
          ? '#0d5e58'
          : '#0f766e'
        : isFar
        ? '#0f172a'
        : '#1e293b';

    return (
      <g>
        <g transform={`translate(${arm.sx}, ${arm.sy}) rotate(${-arm.shoulderDeg})`}>
          <path
            d="M-8 -3 L9 -3 L8 43 L-7 43 Z"
            fill={coatColor}
            stroke={lineDark}
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
        </g>
        <g transform={`translate(${arm.ex.toFixed(2)}, ${arm.ey.toFixed(2)}) rotate(${-arm.forearmDeg.toFixed(2)})`}>
          <path
            d="M-7 -2 L7.5 -2 L6.5 41 L-6 41 Z"
            fill={coatColor}
            stroke={lineDark}
            strokeWidth="1.35"
            strokeLinejoin="round"
          />
          <ellipse cx="0" cy="46" rx="5.8" ry="6.4" fill={isFar ? skinMid : skinHi} stroke={lineSkin} strokeWidth="1.2" />
          {isFar && character === 'raka' && !isTransformed && (
            <g transform="translate(8, 8) rotate(10)">
              <rect
                x="0"
                y="0"
                width="20"
                height="34"
                rx="4"
                fill="rgba(34,211,238,0.28)"
                stroke="#22d3ee"
                strokeWidth="1.5"
              />
              <line x1="4" y1="9" x2="16" y2="9" stroke="#a5f3fc" strokeWidth="1.5" />
              <line x1="4" y1="16" x2="14" y2="16" stroke="#a5f3fc" strokeWidth="1.5" />
            </g>
          )}
        </g>
      </g>
    );
  };

  // Eye vertical scale based on blink/sleepiness & surprised mood
  const eyeOpenScale = Math.max(0.06, 1 - lidClosedAmount);
  const eyeHeightMul = mood === 'surprised' ? 1.15 : 1;

  // === FULL-DETAIL HD 2D ANIME SPRITES FOR ALL CAST & NPCs ===
  if (character in HD_ANIME_FRAMES) {
    const frames = HD_ANIME_FRAMES[character];
    const cycleNorm = (((phase / (Math.PI * 2)) % 1) + 1) % 1;
    const walkFrame = HD_WALK_CYCLE[Math.floor(cycleNorm * 4) % 4];
    const isMovingHD = effectiveSpeed > 0.05;
    const isStandingStill = !isMovingHD && !isJumping;

    // Living organic GPU motion layers (breathing, weight shift, walk bounce)
    const idleBreathAmt = Math.sin(animTime * (mood === 'sleeping' ? 1.6 : 2.35)) * 0.012 * (1 - effectiveSpeed * 0.45);
    const stepBounceAmt =
      isMovingHD && !isJumping ? Math.cos(phase * 2) * 0.013 * effectiveSpeed : 0;

    // Natural staggered anime eye-blinking (every ~3.8s, alternating single & quick double-blink)
    const blinkOffset =
      character === 'nino' ? 0.4 : character === 'ilyas' ? 1.85 : character === 'sari' ? 0.95 : 2.95;
    const blinkCycleSec = 3.8;
    const blinkTotalT = animTime + blinkOffset;
    const blinkIdx = Math.floor(blinkTotalT / blinkCycleSec);
    const blinkLocal = blinkTotalT % blinkCycleSec;
    const isDoubleBlinkCycle = blinkIdx % 2 === 1;
    const isNaturalBlink =
      mood === 'sleeping' ||
      (isStandingStill &&
        (blinkLocal < 0.16 || (isDoubleBlinkCycle && blinkLocal > 0.27 && blinkLocal < 0.41)));

    // Personality-specific pose & expression transitions every few seconds while standing still
    let idleFrame = isNaturalBlink ? 4 : 0;
    let quirkScaleX = 1;
    let quirkScaleY = 1;
    let quirkShiftX = isStandingStill ? Math.sin(animTime * 1.1 + blinkOffset) * 0.75 : 0;
    let quirkTiltDeg = 0;
    let ninoSighAlpha = 0;
    let ninoSighLift = 0;
    let ilyasGlintAlpha = 0;
    let diraNoteAlpha = 0;
    let diraNoteLift = 0;

    if (isStandingStill && !disableIdleQuirk && mood !== 'sleeping') {
      if (character === 'nino') {
        const cycle = 6.8;
        const t = animTime % cycle;
        if (t >= 4.15 && t < 4.33) {
          const a = (t - 4.15) / 0.18;
          quirkScaleY = 1 - 0.018 * Math.sin(a * Math.PI);
          quirkTiltDeg = 1.6 * Math.sin(a * Math.PI);
          idleFrame = 4;
        } else if (t >= 4.33 && t < 6.45) {
          const u = (t - 4.33) / 2.12;
          const settle = Math.sin(Math.min(1, u * 3.5) * Math.PI) * 0.014;
          idleFrame = 5;
          quirkScaleY = 1 + settle - Math.sin(u * Math.PI) * 0.01;
          quirkScaleX = 1 + Math.sin(u * Math.PI) * 0.008;
          quirkTiltDeg = -1.1 * Math.sin(u * Math.PI) + Math.sin(u * Math.PI * 2) * 0.9;
          quirkShiftX += -1.2 * Math.sin(u * Math.PI);
          if (u > 0.2 && u < 0.85) {
            const su = (u - 0.2) / 0.65;
            ninoSighAlpha = Math.sin(su * Math.PI) * 0.78;
            ninoSighLift = su * 14;
          }
        } else if (t >= 6.45 && t < 6.62) {
          const r = (t - 6.45) / 0.17;
          idleFrame = 4;
          quirkScaleY = 1 - 0.014 * Math.sin(r * Math.PI);
          quirkTiltDeg = 1.1 * Math.sin(r * Math.PI);
        }
      } else if (character === 'ilyas') {
        const cycle = 6.4;
        const t = (animTime + 2.1) % cycle;
        if (t >= 3.85 && t < 4.02) {
          const a = (t - 3.85) / 0.17;
          quirkScaleY = 1 + 0.016 * Math.sin(a * Math.PI);
          idleFrame = 4;
        } else if (t >= 4.02 && t < 6.12) {
          const u = (t - 4.02) / 2.1;
          const easeEnv = Math.sin(u * Math.PI);
          idleFrame = 5;
          quirkScaleY = 1 + 0.015 * easeEnv;
          quirkScaleX = 1 - 0.008 * easeEnv;
          quirkTiltDeg = Math.sin(u * Math.PI * 2) * 1.4;
          quirkShiftX += Math.sin(u * Math.PI * 2) * 0.9;
          if (u > 0.14 && u < 0.78) {
            ilyasGlintAlpha = Math.sin(((u - 0.14) / 0.64) * Math.PI) * 0.92;
          }
        } else if (t >= 6.12 && t < 6.28) {
          const r = (t - 6.12) / 0.16;
          idleFrame = 4;
          quirkScaleY = 1 - 0.012 * Math.sin(r * Math.PI);
        }
      } else if (character === 'dira') {
        const cycle = 5.8;
        const t = (animTime + 3.9) % cycle;
        if (t >= 3.25 && t < 3.42) {
          const a = (t - 3.25) / 0.17;
          quirkScaleY = 1 - 0.02 * Math.sin(a * Math.PI);
          idleFrame = 4;
        } else if (t >= 3.42 && t < 5.52) {
          const u = (t - 3.42) / 2.1;
          const env = Math.sin(u * Math.PI);
          const bounce = Math.sin(u * Math.PI * 4);
          idleFrame = 5;
          quirkScaleY = 1 + bounce * 0.018 * env;
          quirkScaleX = 1 - bounce * 0.01 * env;
          quirkTiltDeg = Math.sin(u * Math.PI * 2) * 2.1 * env;
          quirkShiftX += Math.sin(u * Math.PI * 2) * 1.4 * env;
          if (u > 0.1 && u < 0.9) {
            const nu = (u - 0.1) / 0.8;
            diraNoteAlpha = Math.sin(nu * Math.PI) * 0.9;
            diraNoteLift = nu * 16;
          }
        } else if (t >= 5.52 && t < 5.68) {
          const r = (t - 5.52) / 0.16;
          idleFrame = 4;
          quirkScaleY = 1 - 0.014 * Math.sin(r * Math.PI);
        }
      } else {
        // NPC subtle welcoming nod & natural weight shift every ~5.4s
        const cycle = 5.4;
        const t = (animTime + 1.2) % cycle;
        if (t >= 3.0 && t < 4.8) {
          const u = (t - 3.0) / 1.8;
          const env = Math.sin(u * Math.PI);
          quirkTiltDeg = Math.sin(u * Math.PI * 2) * 1.2 * env;
          quirkScaleY = 1 + 0.011 * env;
          quirkShiftX += Math.sin(u * Math.PI) * 0.8;
        }
      }
    }

    const activeFrame = isJumping ? 1 : isMovingHD ? walkFrame : idleFrame;

    const liveScaleY = (isJumping ? 0.965 : 1 + idleBreathAmt + stepBounceAmt) * quirkScaleY;
    const liveScaleX = (1 - (liveScaleY - 1) * 0.55) * quirkScaleX;
    const liveTiltDeg =
      (isJumping
        ? -2.8
        : effectiveSpeed * 2.1 +
          Math.sin(phase * 2) * 0.55 * effectiveSpeed +
          Math.sin(animTime * 1.15) * 0.65 * (1 - effectiveSpeed) +
          headNodDeg * 0.25) + quirkTiltDeg;

    return (
      <div
        className="relative pointer-events-none select-none"
        style={{
          width: 112,
          height: 186,
          transform: `scale(${flipX * heightScale}, ${heightScale}) translateY(${-containerLift}px)`,
          transformOrigin: 'bottom center',
        }}
      >
        {/* Active Leader Ground Ring */}
        {isActiveLeader && (
          <div
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border-2 transition-all duration-300"
            style={{
              width: 64,
              height: 12,
              borderColor: leaderColor,
              backgroundColor: `${leaderColor}24`,
              boxShadow: `0 0 14px ${leaderColor}77`,
            }}
          />
        )}

        {/* Soft Ground Contact Shadow */}
        <div
          className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/65 blur-[2.5px]"
          style={{
            width: isJumping ? 34 : 56,
            height: 8,
            opacity: isJumping ? 0.28 : 0.78,
          }}
        />

        {/* Active Skill Halo */}
        {isInteracting && (
          <div
            className="absolute left-1/2 bottom-1 -translate-x-1/2 rounded-full border-2 border-dashed opacity-85 animate-pulse"
            style={{
              width: 82,
              height: 172,
              borderColor: leaderColor,
              boxShadow: `0 0 18px ${leaderColor}44`,
            }}
          />
        )}

        {/* Personality Idle Micro-Cues (subtle & non-intrusive) */}
        {ninoSighAlpha > 0.02 && (
          <div
            className="absolute right-[18px] top-[24px] pointer-events-none select-none"
            style={{
              opacity: ninoSighAlpha,
              transform: `translate3d(${(ninoSighLift * 0.45).toFixed(1)}px, ${(-ninoSighLift).toFixed(1)}px, 0) scale(${(0.85 + ninoSighLift * 0.02).toFixed(2)})`,
            }}
            aria-hidden="true"
          >
            <span className="block w-3 h-2 rounded-full bg-slate-200/80 blur-[1px]" />
          </div>
        )}

        {ilyasGlintAlpha > 0.02 && (
          <div
            className="absolute right-[20px] top-[14px] pointer-events-none select-none text-sky-300 font-bold text-xs drop-shadow-[0_0_6px_rgba(56,189,248,0.9)]"
            style={{
              opacity: ilyasGlintAlpha,
              transform: `scale(${(0.75 + ilyasGlintAlpha * 0.4).toFixed(2)})`,
            }}
            aria-hidden="true"
          >
            ✦
          </div>
        )}

        {diraNoteAlpha > 0.02 && (
          <div
            className="absolute right-[14px] top-[10px] pointer-events-none select-none text-rose-300 font-bold text-sm drop-shadow-[0_0_6px_rgba(251,113,133,0.85)]"
            style={{
              opacity: diraNoteAlpha,
              transform: `translate3d(${(Math.sin(diraNoteLift * 0.35) * 3).toFixed(1)}px, ${(-diraNoteLift).toFixed(1)}px, 0)`,
            }}
            aria-hidden="true"
          >
            ♪
          </div>
        )}

        {/* Ground-Locked Living 100% HD Anime Sprite Stack (Zero Flicker Preloaded Frames) */}
        <div
          className="absolute left-1/2 bottom-0 w-[117px] h-[186px] -translate-x-1/2 overflow-visible"
          style={{
            transform: `translate3d(${quirkShiftX.toFixed(2)}px, 0, 0) scale(${liveScaleX.toFixed(4)}, ${liveScaleY.toFixed(4)}) rotate(${liveTiltDeg.toFixed(2)}deg)`,
            transformOrigin: 'bottom center',
          }}
        >
          {Array.from(new Set(frames)).map((src) => {
            const activeSrc = frames[activeFrame];
            return (
              <img
                key={src}
                src={src}
                alt=""
                aria-hidden="true"
                draggable={false}
                className="absolute inset-0 w-full h-full object-contain object-bottom select-none pointer-events-none drop-shadow-[0_4px_10px_rgba(2,6,23,0.4)]"
                style={{
                  opacity: activeSrc === src ? 1 : 0,
                }}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative pointer-events-none select-none"
      style={{
        width: 112,
        height: 186,
        transform: `scale(${flipX * heightScale}, ${heightScale}) translateY(${-containerLift}px)`,
        transformOrigin: 'bottom center',
      }}
    >
      {/* Active Leader Ground Ring */}
      {isActiveLeader && (
        <div
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border-2 transition-all duration-300"
          style={{
            width: 64,
            height: 12,
            borderColor: leaderColor,
            backgroundColor: `${leaderColor}24`,
            boxShadow: `0 0 14px ${leaderColor}77`,
          }}
        />
      )}

      {/* Soft Ground Contact Shadow */}
      <div
        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/65 blur-[2.5px]"
        style={{
          width: isJumping ? 34 : 54,
          height: 8,
          opacity: isJumping ? 0.28 : 0.78,
        }}
      />

      <svg
        viewBox="0 0 200 320"
        className="w-full h-full overflow-visible drop-shadow-[0_4px_10px_rgba(2,6,23,0.4)]"
      >
        <defs>
          <linearGradient id={skinGradId} x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor={skinHi} />
            <stop offset="65%" stopColor={skinMid} />
            <stop offset="100%" stopColor={skinShd} />
          </linearGradient>

          <radialGradient id={blushGradId} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#fb7185" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
          </radialGradient>

          <linearGradient id={pantGradId} x1="0" y1="0" x2="1" y2="0.2">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="68%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#d3dfed" />
          </linearGradient>

          <linearGradient id={shirtShadeId} x1="0" y1="0" x2="1" y2="0.3">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="55%" stopColor="#0ea5e9" stopOpacity="0" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.22" />
          </linearGradient>

          <pattern id={batikPatId} width="32" height="32" patternUnits="userSpaceOnUse">
            <rect width="32" height="32" fill="#52afe5" />
            <rect width="32" height="16" fill="#63beef" opacity="0.4" />
            <path d="M0 9 Q9 3 16 12 T32 10 M5 32 Q12 20 24 24" fill="none" stroke="#1e3a5f" strokeWidth="1.2" />
            <path d="M0 9 Q9 3 16 12 T32 10" fill="none" stroke="#ffffff" strokeWidth="0.45" strokeDasharray="1.8 1.6" />
            <path d="M6 17 Q12 10 19 13 Q23 17 19 22 Q14 23 9 20 Z" fill="#facc15" stroke="#78350f" strokeWidth="0.7" />
            <path d="M15 13 L23 9 L20 16 Z" fill="#f59e0b" />
            <path d="M10 15 Q13 13 15 15" stroke="#ef4444" strokeWidth="1.2" fill="none" />
            <path d="M8 19 L3 25 L9 22 Z" fill="#fbbf24" />
            <path d="M22 4 Q28 2 30 8 Q25 11 22 4 Z" fill="#f59e0b" stroke="#ffffff" strokeWidth="0.55" />
            <path d="M2 26 Q7 23 11 29 Q5 32 2 26 Z" fill="#fbbf24" stroke="#ffffff" strokeWidth="0.55" />
            <g transform="translate(8, 7)">
              <circle cx="0" cy="-2.4" r="1.4" fill="#f43f5e" stroke="#ffffff" strokeWidth="0.35" />
              <circle cx="2.3" cy="-0.7" r="1.4" fill="#f43f5e" stroke="#ffffff" strokeWidth="0.35" />
              <circle cx="1.4" cy="2" r="1.4" fill="#f43f5e" stroke="#ffffff" strokeWidth="0.35" />
              <circle cx="-1.4" cy="2" r="1.4" fill="#f43f5e" stroke="#ffffff" strokeWidth="0.35" />
              <circle cx="-2.3" cy="-0.7" r="1.4" fill="#f43f5e" stroke="#ffffff" strokeWidth="0.35" />
              <circle cx="0" cy="0" r="1.1" fill="#fef08a" />
            </g>
            <g transform="translate(24, 24)">
              <circle cx="0" cy="-2.1" r="1.3" fill="#fb7185" stroke="#ffffff" strokeWidth="0.35" />
              <circle cx="2" cy="-0.6" r="1.3" fill="#fb7185" stroke="#ffffff" strokeWidth="0.35" />
              <circle cx="1.3" cy="1.7" r="1.3" fill="#fb7185" stroke="#ffffff" strokeWidth="0.35" />
              <circle cx="-1.3" cy="1.7" r="1.3" fill="#fb7185" stroke="#ffffff" strokeWidth="0.35" />
              <circle cx="-2" cy="-0.6" r="1.3" fill="#fb7185" stroke="#ffffff" strokeWidth="0.35" />
              <circle cx="0" cy="0" r="0.9" fill="#fef9c3" />
            </g>
          </pattern>

          <linearGradient id={eyeGradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b1d0e" />
            <stop offset="50%" stopColor="#854524" />
            <stop offset="100%" stopColor="#d98a57" />
          </linearGradient>
        </defs>

        {/* Active Skill Halo */}
        {isInteracting && (
          <ellipse
            cx="100"
            cy="168"
            rx="62"
            ry="142"
            fill="none"
            stroke={leaderColor}
            strokeWidth="2.2"
            strokeDasharray="8 6"
            opacity="0.85"
          />
        )}

        {/* Ground-Locked Articulated NPC Rig */}
        <g transform={`translate(0, ${groundAnchorOffsetY.toFixed(2)})`}>
          {/* === FAR ARM === */}
          <g transform={`translate(0, ${breatheY.toFixed(2)})`}>{renderArmSegments(farArm, true)}</g>

          {/* === FAR & NEAR LEGS === */}
          {renderLegSegments(farLeg, true)}
          {renderLegSegments(nearLeg, false)}

          {/* === NPC TORSO === */}
          <g transform={`translate(0, ${breatheY.toFixed(2)}) rotate(${torsoLean.toFixed(2)}, 99, 150)`}>
            {character === 'raka' && (
              <>
                <path
                  d="M70 79 Q99 73 127 79 L125 169 L72 169 Z"
                  fill="#1e293b"
                  stroke={lineDark}
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
                <path d="M87 93 L118 93 L116 116 L90 116 Z" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.4" />
                <line x1="94" y1="104" x2="112" y2="104" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" />
              </>
            )}

            {character === 'wiryo' && (
              <>
                <path
                  d="M69 79 Q99 73 128 79 L126 170 L71 170 Z"
                  fill="#78350f"
                  stroke="#451a03"
                  strokeWidth="1.4"
                  strokeLinejoin="round"
                />
                <path d="M90 77 L112 77 L110 169 L92 169 Z" fill="#b45309" stroke="#78350f" strokeWidth="1.3" />
                <line x1="101" y1="88" x2="101" y2="159" stroke="#fbbf24" strokeWidth="2.2" strokeDasharray="3 5" />
              </>
            )}
          </g>

          {/* === NPC HEAD === */}
          <g transform={`translate(0, ${breatheY.toFixed(2)}) rotate(${headTilt.toFixed(2)}, 99, 72)`}>
            <path d="M92 62 L105 62 L106 81 L90 81 Z" fill={`url(#${skinGradId})`} stroke={lineSkin} strokeWidth="1.2" />
            <path d="M92 64 Q98 70 105 64 L105 71 Q98 75 92 70 Z" fill={skinShd} />

            <path
              d="M78 33 Q79 20 99 20 Q120 20 121 38 Q121 52 115 61 Q108 67 101 67 Q89 66 80 54 Q78 46 78 33 Z"
              fill={`url(#${skinGradId})`}
              stroke={lineSkin}
              strokeWidth="1.25"
              strokeLinejoin="round"
            />
            <ellipse cx="92" cy="51.5" rx="5.5" ry="2.8" fill={`url(#${blushGradId})`} />
            <ellipse cx="114" cy="50.5" rx="4.2" ry="2.2" fill={`url(#${blushGradId})`} />
            <path d="M78 42 Q73 42 74 49 Q75 55 80 54" fill={skinMid} stroke={lineSkin} strokeWidth="1.15" />

            <path
              d={
                mood === 'surprised'
                  ? 'M109 35.5 Q114 32 119 35.5'
                  : mood === 'determined'
                  ? 'M109 39.5 Q114 38 119 36.5'
                  : mood === 'curious'
                  ? 'M109 36.5 Q114 34 119 36.5'
                  : 'M109 39 Q114 37 119 39'
              }
              stroke={lineHair}
              strokeWidth="1.35"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d={
                mood === 'surprised'
                  ? 'M88 35.5 Q94 32 100 35.5'
                  : mood === 'determined'
                  ? 'M88 37 Q94 38.5 100 40.5'
                  : mood === 'curious'
                  ? 'M88 38 Q94 35.5 100 38.5'
                  : 'M88 39 Q94 37 100 39'
              }
              stroke={lineHair}
              strokeWidth="1.45"
              fill="none"
              strokeLinecap="round"
            />

            {lidClosedAmount >= 0.92 ? (
              <>
                <path d="M88 46 Q94 49.5 100 46" stroke={lineHair} strokeWidth="1.65" fill="none" strokeLinecap="round" />
                <path d="M108 45 Q114 48.5 119 45" stroke={lineHair} strokeWidth="1.55" fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                <g transform={`translate(114, 45.5) scale(1, ${(eyeOpenScale * eyeHeightMul).toFixed(3)}) translate(-114, -45.5)`}>
                  <path d="M109 43 Q114 41 119 43 L118 49 Q114 50 109 48 Z" fill="#ffffff" />
                  <g transform={`translate(${(lookShiftX * 0.85).toFixed(2)}, ${lookShiftY.toFixed(2)})`}>
                    <ellipse
                      cx="113.8"
                      cy="45.6"
                      rx={mood === 'surprised' ? 2.4 : 2.9}
                      ry={mood === 'surprised' ? 3.5 : 3.2}
                      fill={`url(#${eyeGradId})`}
                      stroke={lineHair}
                      strokeWidth="0.7"
                    />
                    <circle cx="113.8" cy="46" r={mood === 'surprised' ? 1.0 : 1.3} fill="#0f0a09" />
                    <circle cx="112.7" cy="44" r="1.15" fill="#ffffff" />
                    <circle cx="115" cy="47.5" r="0.65" fill="#ffffff" />
                  </g>
                  <path d="M108 43 Q114 40 120 43" stroke={lineHair} strokeWidth="1.75" fill="none" strokeLinecap="round" />
                </g>

                <g transform={`translate(94.5, 45.8) scale(1, ${(eyeOpenScale * eyeHeightMul).toFixed(3)}) translate(-94.5, -45.8)`}>
                  <path d="M88 43 Q94 41 100 43 L99 49 Q94 51 89 48 Z" fill="#ffffff" />
                  <g transform={`translate(${lookShiftX.toFixed(2)}, ${lookShiftY.toFixed(2)})`}>
                    <ellipse
                      cx="94.5"
                      cy="45.8"
                      rx={mood === 'surprised' ? 3.1 : 3.7}
                      ry={mood === 'surprised' ? 3.8 : 3.5}
                      fill={`url(#${eyeGradId})`}
                      stroke={lineHair}
                      strokeWidth="0.75"
                    />
                    <circle cx="94.5" cy="46.2" r={mood === 'surprised' ? 1.2 : 1.55} fill="#0f0a09" />
                    <circle cx="93" cy="44" r="1.35" fill="#ffffff" />
                    <circle cx="96.2" cy="47.8" r="0.7" fill="#ffffff" />
                  </g>
                  <path d="M87 43 Q94 40 101 43" stroke={lineHair} strokeWidth="1.9" fill="none" strokeLinecap="round" />
                </g>
              </>
            )}

            <path d="M107 51 L108.5 53.5 L106 54.5" stroke={skinShd} strokeWidth="1.3" fill="none" strokeLinecap="round" />
            {mood === 'surprised' ? (
              <ellipse cx="104" cy="59.2" rx="2.6" ry="3.2" fill="#e11d48" stroke="#881337" strokeWidth="1.1" />
            ) : mood === 'curious' ? (
              <ellipse cx="104" cy="59" rx="1.8" ry="1.5" fill="#be123c" stroke={lineSkin} strokeWidth="1" />
            ) : mood === 'happy' ? (
              <>
                <path
                  d="M98 57.5 Q104 64 110 57.5 Q104 58.2 98 57.5 Z"
                  fill="#fb7185"
                  stroke="#881337"
                  strokeWidth="1.1"
                  strokeLinejoin="round"
                />
                <path d="M100 58.2 Q104 59.5 108 58.2" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" />
              </>
            ) : isTransformed || isInteracting ? (
              <path d="M99 58.5 Q104 61.5 109 58" stroke={lineSkin} strokeWidth="1.4" fill="none" strokeLinecap="round" />
            ) : (
              <path d="M100 59 Q104 60 108 58.8" stroke={lineSkin} strokeWidth="1.4" fill="none" strokeLinecap="round" />
            )}

            {character === 'raka' && (
              <path
                d="M75 39 Q74 16 99 14 Q122 16 122 34 Q112 27 101 32 L92 27 L82 38 Z"
                fill="#1e293b"
                stroke={lineDark}
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            )}

            {character === 'wiryo' && (
              <>
                <path d="M74 33 Q76 12 99 12 Q121 13 122 31 Q99 28 74 33 Z" fill="#451a03" stroke={lineHair} strokeWidth="1.4" />
                <path d="M78 26 Q99 23 119 26" stroke="#b45309" strokeWidth="2.8" fill="none" />
                <path d="M98 53 Q106 51 112 54" stroke="#cbd5e1" strokeWidth="2.2" fill="none" strokeLinecap="round" />
              </>
            )}
          </g>

          {/* === NEAR ARM (articulated shoulder + elbow + forearm + hand) === */}
          <g transform={`translate(0, ${breatheY.toFixed(2)})`}>{renderArmSegments(nearArm, false)}</g>
        </g>
      </svg>
    </div>
  );
};
