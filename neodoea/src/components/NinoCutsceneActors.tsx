import React, { useId } from 'react';
import { AnimeCharacterSprite, type SpriteMood } from './AnimeCharacterSprite';

interface ClassroomActorProps {
  mode: 'sleep' | 'wake' | 'stand_exit';
  /** Normalized 0..1 progress within the beat */
  progress: number;
  animTime: number;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

/**
 * High-craft 2D anime classroom actor for Nino:
 * - 'sleep': sits on chair, nods off with drooping eyelids, folds arms onto desk, rests head & breathes rhythmically.
 * - 'wake': startled head lift from folded arms, wide surprised eyes, confused left-right glance, natural blink.
 * - 'stand_exit': pushes chair back, stands smoothly from sitting, slings red backpack on shoulder, walks out opening door.
 */
export const NinoClassroomDeskActor: React.FC<ClassroomActorProps> = ({
  mode,
  progress,
  animTime,
}) => {
  const uid = useId().replace(/:/g, '');
  const batikId = `cls-batik-${uid}`;
  const placketId = `cls-placket-${uid}`;
  const skinId = `cls-skin-${uid}`;
  const woodId = `cls-wood-${uid}`;
  const eyeId = `cls-eye-${uid}`;

  // === STAND UP + TAKE BAG + WALK OUT DOOR MODE ===
  if (mode === 'stand_exit') {
    const p = clamp01(progress);
    const standT = smoothstep(0.0, 0.34, p);
    const bagGrabT = smoothstep(0.32, 0.54, p);
    const walkT = smoothstep(0.54, 1.0, p);
    const walkSpeed = p < 0.54 ? 0 : smoothstep(0.54, 0.68, p);
    const doorOpenT = smoothstep(0.68, 0.88, p);
    const walkX = 28 + walkT * 52; // % across floor from desk to right doorway
    const walkPhase = (p - 0.54) * 38;
    const stepFadeOut = 1 - smoothstep(0.88, 1.0, p);

    return (
      <div className="relative w-full h-full pointer-events-none select-none overflow-hidden">
        {/* Classroom tiled floor strip aligned to perspective */}
        <div
          className="absolute inset-x-0 bottom-0 h-[24%] bg-gradient-to-t from-amber-950/70 via-stone-900/45 to-transparent border-t border-amber-200/20"
          aria-hidden="true"
        />

        {/* Wooden Classroom Exit Door on Right Side */}
        <div
          className="absolute right-[8%] bottom-[13%] w-[15%] max-w-[155px] aspect-[1/1.9] z-10"
          style={{ perspective: 700 }}
        >
          {/* Bright warm corridor light behind open door */}
          <div
            className="absolute inset-1 rounded-t-md bg-gradient-to-b from-amber-100 via-amber-200/90 to-amber-300/70 shadow-[0_0_28px_rgba(253,224,71,0.55)]"
            style={{ opacity: 0.3 + doorOpenT * 0.7 }}
          />
          {/* Door Frame */}
          <div className="absolute inset-0 border-4 border-amber-950 rounded-t-md shadow-xl" />
          {/* Swinging Wooden Door Panel */}
          <div
            className="absolute inset-1 bg-gradient-to-br from-amber-800 via-amber-900 to-stone-900 border border-amber-700/60 rounded-t-sm flex items-center justify-end pr-2"
            style={{
              transformOrigin: 'left center',
              transform: `rotateY(${(-doorOpenT * 74).toFixed(1)}deg)`,
            }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-amber-300 shadow" />
          </div>
        </div>

        {/* Desk & Sliding Wooden Chair Stage (Left-Center) */}
        <svg
          viewBox="0 0 320 260"
          className="absolute left-[14%] bottom-[11%] w-[32%] max-w-[330px] h-auto z-10 overflow-visible"
        >
          {/* Chair (slides gently back as Nino stands up) */}
          <g transform={`translate(${(-standT * 18).toFixed(1)}, 0)`}>
            <rect x="64" y="132" width="12" height="58" rx="3" fill="#92400e" stroke="#451a03" strokeWidth="2" />
            <rect x="62" y="130" width="16" height="32" rx="3" fill="#b45309" stroke="#451a03" strokeWidth="2" />
            <rect x="64" y="184" width="54" height="10" rx="3" fill="#b45309" stroke="#451a03" strokeWidth="2" />
            <line x1="70" y1="194" x2="67" y2="248" stroke="#78350f" strokeWidth="5.5" strokeLinecap="round" />
            <line x1="112" y1="194" x2="114" y2="248" stroke="#78350f" strokeWidth="5.5" strokeLinecap="round" />
          </g>

          {/* Desk */}
          <rect x="132" y="156" width="118" height="13" rx="3" fill="#d97706" stroke="#451a03" strokeWidth="2" />
          <rect x="138" y="169" width="106" height="22" fill="#b45309" stroke="#451a03" strokeWidth="1.8" />
          <line x1="146" y1="191" x2="144" y2="248" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
          <line x1="236" y1="191" x2="238" y2="248" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
          {/* Closed notebook left neatly on desk */}
          <rect x="158" y="151" width="42" height="6" rx="1.5" fill="#e2e8f0" stroke="#475569" strokeWidth="1.2" />

          {/* Red Backpack sitting beside chair before Nino picks it up */}
          {bagGrabT < 0.78 && (
            <g
              transform={`translate(${(bagGrabT * 26).toFixed(1)}, ${(-bagGrabT * 92).toFixed(1)}) rotate(${(bagGrabT * -18).toFixed(1)}, 42, 220)`}
              opacity={1 - smoothstep(0.55, 0.78, bagGrabT)}
            >
              <path
                d="M28 196 Q24 184 40 184 Q56 184 54 198 L56 238 Q56 247 41 247 Q26 247 26 237 Z"
                fill="#dc2626"
                stroke="#7f1d1d"
                strokeWidth="2"
              />
              <rect x="31" y="212" width="20" height="22" rx="4" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="1.5" />
            </g>
          )}
        </svg>

        {/* Smooth Transition: Seated Pose -> Standing Up -> Picking Bag -> Walking Out Door */}
        {p < 0.54 ? (
          <div
            className="absolute left-[22.5%] bottom-[13%] z-20"
            style={{
              transform: `translate3d(${(standT * 28).toFixed(1)}px, 0, 0) scale(${(0.9 + standT * 0.08).toFixed(3)})`,
              transformOrigin: 'bottom center',
            }}
          >
            {/* Custom standing-up / grabbing-bag pose before seamless handoff to walk sprite */}
            <svg viewBox="0 0 180 260" className="w-[116px] h-[168px] overflow-visible drop-shadow-[0_6px_12px_rgba(2,6,23,0.45)]">
              <defs>
                <pattern id={batikId} width="28" height="28" patternUnits="userSpaceOnUse">
                  <rect width="28" height="28" fill="#52afe5" />
                  <path d="M4 14 Q11 8 17 12 Q20 17 14 20 Z" fill="#facc15" stroke="#78350f" strokeWidth="0.6" />
                  <circle cx="8" cy="7" r="2.1" fill="#f43f5e" />
                  <circle cx="22" cy="21" r="1.9" fill="#fb7185" />
                </pattern>
              </defs>
              {/* Interpolated hip height from chair (y=168) to standing (y=142) */}
              {(() => {
                const hipY = 172 - standT * 30;
                const torsoAngle = (1 - standT) * 14 + Math.sin(bagGrabT * Math.PI) * 18;
                const kneeX = 96 + (1 - standT) * 26;
                const kneeY = 204 - standT * 10;
                const reachAngle = Math.sin(bagGrabT * Math.PI) * 55;
                return (
                  <g>
                    {/* Legs straightening smoothly from seated bend to standing */}
                    <path
                      d={`M86 ${hipY} L${kneeX} ${kneeY} L94 245 L79 245 L${kneeX - 14} ${kneeY} L74 ${hipY} Z`}
                      fill="#f1f5f9"
                      stroke="#64748b"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                    <path d="M78 244 L97 244 L109 253 L109 258 L77 258 Z" fill="#27272a" stroke="#18181b" strokeWidth="1.3" />

                    {/* Torso lifting upright */}
                    <g transform={`translate(82, ${hipY}) rotate(${torsoAngle.toFixed(1)}, 0, 0)`}>
                      {/* Bag once slung on back */}
                      {bagGrabT > 0.55 && (
                        <path
                          d="M-24 -64 Q-36 -56 -34 -22 L-30 2 Q-18 6 -10 -2 L-10 -62 Z"
                          fill="#dc2626"
                          stroke="#7f1d1d"
                          strokeWidth="1.4"
                          opacity={smoothstep(0.55, 0.85, bagGrabT)}
                        />
                      )}
                      <path
                        d="M-12 -68 L14 -68 L14 2 L-12 2 Z"
                        fill="#1f1f24"
                        stroke="#18181b"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M-18 -68 L4 -68 L4 6 L-16 4 Z"
                        fill={`url(#${batikId})`}
                        stroke="#1b496e"
                        strokeWidth="1.3"
                      />
                      <path
                        d="M6 -68 L22 -67 L21 5 L6 6 Z"
                        fill={`url(#${batikId})`}
                        stroke="#1b496e"
                        strokeWidth="1.3"
                      />
                      {/* Head rising smoothly */}
                      <g transform="translate(2, -74)">
                        <path d="M-16 -24 Q-15 -42 4 -42 Q22 -42 22 -22 Q21 -7 9 -2 Q-4 -2 -14 -14 Z" fill="#f9cca7" stroke="#7a4935" strokeWidth="1.3" />
                        <ellipse cx="10" cy="-21" rx="2.6" ry="3.2" fill="#6b341a" />
                        <path d="M-18 -20 Q-20 -46 3 -47 Q24 -46 24 -27 Q16 -35 9 -28 L2 -36 L-5 -27 L-12 -33 Z" fill="#8c4a2b" stroke="#4a2413" strokeWidth="1.35" strokeLinejoin="round" />
                      </g>
                      {/* Arm reaching for backpack then settling naturally */}
                      <g transform={`translate(-4, -60) rotate(${reachAngle.toFixed(1)}, 0, 0)`}>
                        <path d="M-8 -4 L8 -4 L7 26 L-7 26 Z" fill={`url(#${batikId})`} stroke="#1b496e" strokeWidth="1.25" />
                        <path d="M-5 25 L5 25 L4 62 L-4 62 Z" fill="#f9cca7" stroke="#7a4935" strokeWidth="1.2" />
                      </g>
                    </g>
                  </g>
                );
              })()}
            </svg>
          </div>
        ) : (
          <div
            className="absolute bottom-[13%] z-20"
            style={{
              left: `${walkX}%`,
              opacity: stepFadeOut,
              transform: 'translateX(-50%) scale(0.92)',
              transformOrigin: 'bottom center',
            }}
          >
            <AnimeCharacterSprite
              character="nino"
              facing="right"
              isMoving
              speedRatio={walkSpeed}
              walkPhase={walkPhase}
              hideCap
              strictGround
              mood="curious"
              eyeLookX={0.45}
              animTime={animTime}
            />
          </div>
        )}
      </div>
    );
  }

  // === MEDIUM CLOSE-UP CLASSROOM DESK ACTOR ('sleep' | 'wake') ===
  // Compute frame-accurate animation curves
  let torsoLeanDeg = 6;
  let headPitchDeg = 4;
  let headTurnX = 0;
  let headDropY = 0;
  let armFoldT = 0;
  let lidClosed = 0.25;
  let eyeLookX = 0;
  let eyeLookY = 0.2;
  let mood: SpriteMood = 'sleepy';
  let breathAmp = 1.6;
  let breathRate = 1.8;

  if (mode === 'sleep') {
    const p = clamp01(progress);
    // Drowsy nod at ~0.18, brief micro-jerk awake at ~0.27, then deep drop to folded arms
    const nodWave =
      p < 0.45
        ? smoothstep(0.0, 0.24, p) * 16 -
          smoothstep(0.24, 0.31, p) * 9 +
          smoothstep(0.31, 0.45, p) * 14
        : 21;

    armFoldT = smoothstep(0.42, 0.68, p);
    const restT = smoothstep(0.48, 0.74, p);

    torsoLeanDeg = 7 + nodWave * 0.25 + restT * 26;
    headPitchDeg = 5 + nodWave + restT * 18;
    headDropY = restT * 34;

    // Gradual heavy eyelid droop + slow heavy blinks before shutting completely
    const slowBlink = Math.max(0, Math.sin(p * Math.PI * 3.5)) * 0.35;
    lidClosed =
      p < 0.56
        ? Math.min(0.96, 0.25 + p * 1.15 + slowBlink)
        : 1;
    mood = p >= 0.56 ? 'sleeping' : 'sleepy';
    breathAmp = p >= 0.65 ? 2.5 : 1.5;
    breathRate = p >= 0.65 ? 1.45 : 2.1;
  } else {
    // 'wake': 0.0 -> 0.14 asleep, 0.14 -> 0.34 jolt upright, 0.34 -> 0.82 confused glance L->R, 0.82 -> 1.0 settle
    const p = clamp01(progress);
    const wakeLiftT = smoothstep(0.14, 0.35, p);
    const settleBounce =
      p >= 0.3 && p < 0.5 ? Math.sin(((p - 0.3) / 0.2) * Math.PI) * -4.5 : 0;

    armFoldT = 1 - wakeLiftT * 0.85;
    torsoLeanDeg = 33 * (1 - wakeLiftT) + 4 * wakeLiftT + settleBounce * 0.35;
    headPitchDeg = 38 * (1 - wakeLiftT) + settleBounce;
    headDropY = 34 * (1 - wakeLiftT);

    // Wide startled eyes immediately on lifting head, then blinking calmly near end
    const wakeBlinkPhase = p > 0.72 && p < 0.82 ? Math.sin(((p - 0.72) / 0.1) * Math.PI) : 0;
    lidClosed = p < 0.16 ? 1 : p < 0.26 ? 1 - smoothstep(0.16, 0.26, p) : wakeBlinkPhase;

    // Look left then right in confusion
    if (p >= 0.36 && p < 0.56) {
      const t = (p - 0.36) / 0.2;
      eyeLookX = -Math.sin(t * Math.PI) * 0.95;
      headTurnX = -Math.sin(t * Math.PI) * 4.5;
    } else if (p >= 0.56 && p < 0.78) {
      const t = (p - 0.56) / 0.22;
      eyeLookX = Math.sin(t * Math.PI) * 0.95;
      headTurnX = Math.sin(t * Math.PI) * 4.5;
    } else {
      eyeLookX = 0;
      headTurnX = 0;
    }
    eyeLookY = p < 0.36 ? 0.2 : -0.15;
    mood = p < 0.18 ? 'sleeping' : p < 0.68 ? 'surprised' : 'curious';
    breathAmp = p < 0.36 ? 2.4 : 1.7;
    breathRate = p < 0.36 ? 1.5 : 2.5;
  }

  const breathY = Math.sin(animTime * breathRate) * breathAmp;
  const hairSpringY = breathY * 0.55 + Math.sin(animTime * 2.1) * 0.7;

  return (
    <div className="relative w-full h-full flex items-end justify-center pointer-events-none select-none overflow-hidden">
      <svg
        viewBox="0 0 640 360"
        className="w-full max-w-[920px] h-auto max-h-full overflow-visible drop-shadow-[0_14px_32px_rgba(2,6,23,0.55)]"
      >
        <defs>
          <linearGradient id={skinId} x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#ffece0" />
            <stop offset="65%" stopColor="#f9cca7" />
            <stop offset="100%" stopColor="#dc9d76" />
          </linearGradient>
          <linearGradient id={woodId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#eab308" stopOpacity="0.9" />
            <stop offset="25%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>
          <linearGradient id={eyeId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b1d0e" />
            <stop offset="55%" stopColor="#854524" />
            <stop offset="100%" stopColor="#d98a57" />
          </linearGradient>
          <pattern id={batikId} width="30" height="30" patternUnits="userSpaceOnUse">
            <rect width="30" height="30" fill="#52afe5" />
            <rect width="30" height="15" fill="#63beef" opacity="0.4" />
            <path d="M0 9 Q9 3 16 12 T30 10" fill="none" stroke="#1e3a5f" strokeWidth="1.2" />
            <path d="M6 17 Q12 10 19 13 Q23 17 19 22 Q14 23 9 20 Z" fill="#facc15" stroke="#78350f" strokeWidth="0.7" />
            <circle cx="8" cy="7" r="2.3" fill="#f43f5e" stroke="#fff" strokeWidth="0.4" />
            <circle cx="22" cy="22" r="2.0" fill="#fb7185" stroke="#fff" strokeWidth="0.4" />
          </pattern>
          <pattern id={placketId} width="9" height="14" patternUnits="userSpaceOnUse">
            <rect width="9" height="14" fill="#fef3c7" />
            <polygon points="4.5,1 8,7 4.5,13 1,7" fill="#38bdf8" stroke="#b45309" strokeWidth="0.6" />
            <circle cx="4.5" cy="7" r="1.2" fill="#f43f5e" />
          </pattern>
        </defs>

        {/* === WOODEN CLASSROOM CHAIR BACKREST BEHIND NINO === */}
        <g transform="translate(0, 6)">
          <rect x="228" y="162" width="14" height="145" rx="4" fill="#78350f" stroke="#451a03" strokeWidth="2.2" />
          <rect x="394" y="162" width="14" height="145" rx="4" fill="#78350f" stroke="#451a03" strokeWidth="2.2" />
          <rect x="224" y="158" width="188" height="38" rx="6" fill="#b45309" stroke="#451a03" strokeWidth="2.4" />
          {/* Red backpack draped behind chair */}
          <path
            d="M214 198 Q194 214 198 265 L234 268 L236 196 Z"
            fill="#dc2626"
            stroke="#7f1d1d"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
        </g>

        {/* === ANIMATED NINO SEATED BEHIND DESK === */}
        <g transform={`translate(0, ${(breathY * 0.85).toFixed(2)})`}>
          {/* Seated Lower Torso & Lap */}
          <path
            d="M258 242 L386 242 L392 296 L252 296 Z"
            fill="#f1f5f9"
            stroke="#64748b"
            strokeWidth="2"
          />

          {/* Leaning Upper Torso (Sky-Blue Batik Open over Charcoal Tee) */}
          <g transform={`translate(322, 250) rotate(${(torsoLeanDeg * 0.35).toFixed(2)}, 0, 0) translate(0, ${(headDropY * 0.45).toFixed(2)})`}>
            {/* Charcoal Crewneck Inner Tee */}
            <path
              d="M-36 -96 Q0 -84 36 -96 L42 -2 L-42 -2 Z"
              fill="#1f1f24"
              stroke="#18181b"
              strokeWidth="2"
            />
            {/* Left & Right Sky-Blue Batik Shirt Panels */}
            <path
              d="M-74 -92 Q-52 -104 -18 -98 L-16 -2 L-64 -2 Z"
              fill={`url(#${batikId})`}
              stroke="#1b496e"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <path
              d="M18 -98 Q52 -104 74 -92 L64 -2 L16 -2 Z"
              fill={`url(#${batikId})`}
              stroke="#1b496e"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            {/* Batik Placket Strips */}
            <rect x="-23" y="-96" width="8" height="94" fill={`url(#${placketId})`} stroke="#1b496e" strokeWidth="1.2" />
            <rect x="15" y="-96" width="8" height="94" fill={`url(#${placketId})`} stroke="#1b496e" strokeWidth="1.2" />
            {/* Shirt Collars */}
            <path d="M-36 -104 L-16 -96 L-24 -76 L-44 -86 Z" fill={`url(#${batikId})`} stroke="#1b496e" strokeWidth="2" strokeLinejoin="round" />
            <path d="M36 -104 L16 -96 L24 -76 L44 -86 Z" fill={`url(#${batikId})`} stroke="#1b496e" strokeWidth="2" strokeLinejoin="round" />
          </g>

          {/* === HEAD + NECK (Smooth nodding, sleeping drop, startled wake-up & eye glances) === */}
          <g
            transform={`translate(${(322 + headTurnX).toFixed(2)}, ${(144 + headDropY + breathY * 0.4).toFixed(2)}) rotate(${(headPitchDeg * 0.35).toFixed(2)}, 0, 12)`}
          >
            {/* Neck */}
            <path d="M-14 4 L14 4 L16 28 L-16 28 Z" fill={`url(#${skinId})`} stroke="#7a4935" strokeWidth="1.8" />
            <path d="M-14 6 Q0 16 14 6 L14 16 Q0 22 -14 15 Z" fill="#dc9d76" />

            {/* Back Chestnut Hair */}
            <path
              d={`M-46 -22 Q-55 ${6 + hairSpringY} -38 22 L-26 12 L-30 22 L-14 14 L18 14 L32 22 L28 12 L40 20 Q53 ${4 + hairSpringY} 45 -24 Z`}
              fill="#6e351a"
              stroke="#4a2413"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Ears */}
            <path d="M-40 -12 Q-50 -12 -49 -1 Q-48 8 -38 6" fill="#f9cca7" stroke="#7a4935" strokeWidth="1.8" />
            <path d="M40 -12 Q50 -12 49 -1 Q48 8 38 6" fill="#f9cca7" stroke="#7a4935" strokeWidth="1.8" />

            {/* Face Contour */}
            <path
              d="M-38 -36 Q-38 -62 0 -62 Q38 -62 38 -36 Q38 -8 28 8 Q14 21 0 21 Q-14 21 -28 8 Q-38 -8 -38 -36 Z"
              fill={`url(#${skinId})`}
              stroke="#7a4935"
              strokeWidth="2.1"
              strokeLinejoin="round"
            />

            {/* Soft Warm Cheek Blush */}
            <ellipse cx="-22" cy="1" rx="8.5" ry="4" fill="#fb7185" opacity="0.28" />
            <ellipse cx="22" cy="1" rx="8.5" ry="4" fill="#fb7185" opacity="0.28" />

            {/* Eyebrows (droop when sleepy, shoot up when surprised) */}
            <path
              d={
                mood === 'surprised'
                  ? 'M-29 -24 Q-19 -31 -9 -24'
                  : mood === 'curious'
                  ? 'M-29 -21 Q-19 -25 -9 -20'
                  : 'M-29 -19 Q-19 -21 -9 -18'
              }
              stroke="#4a2413"
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d={
                mood === 'surprised'
                  ? 'M9 -24 Q19 -31 29 -24'
                  : mood === 'curious'
                  ? 'M9 -20 Q19 -26 29 -21'
                  : 'M9 -18 Q19 -21 29 -19'
              }
              stroke="#4a2413"
              strokeWidth="2.4"
              fill="none"
              strokeLinecap="round"
            />

            {/* Expressive Eyes with Smooth Eyelid Droop & Left-Right Glance */}
            {lidClosed >= 0.92 ? (
              <>
                <path d="M-29 -11 Q-19 -5 -9 -11" stroke="#4a2413" strokeWidth="2.6" fill="none" strokeLinecap="round" />
                <path d="M9 -11 Q19 -5 29 -11" stroke="#4a2413" strokeWidth="2.6" fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                {[-19, 19].map((cx) => {
                  const openScale = Math.max(0.08, 1 - lidClosed);
                  return (
                    <g
                      key={cx}
                      transform={`translate(${cx}, -11) scale(1, ${openScale.toFixed(3)}) translate(${-cx}, 11)`}
                    >
                      <path
                        d={`M${cx - 10} -15 Q${cx} -19 ${cx + 10} -15 L${cx + 9} -6 Q${cx} -3 ${cx - 9} -6 Z`}
                        fill="#ffffff"
                      />
                      <g transform={`translate(${(eyeLookX * 3.8).toFixed(2)}, ${(eyeLookY * 1.8).toFixed(2)})`}>
                        <ellipse
                          cx={cx}
                          cy="-10.8"
                          rx={mood === 'surprised' ? 4.4 : 5.4}
                          ry={mood === 'surprised' ? 5.6 : 5.3}
                          fill={`url(#${eyeId})`}
                          stroke="#4a2413"
                          strokeWidth="1.1"
                        />
                        <circle cx={cx} cy="-10.5" r={mood === 'surprised' ? 1.8 : 2.3} fill="#0f0a09" />
                        <circle cx={cx - 2} cy="-12.8" r="1.9" fill="#ffffff" />
                        <circle cx={cx + 2.2} cy="-8.2" r="1" fill="#ffffff" />
                      </g>
                      <path
                        d={`M${cx - 11} -14 Q${cx} -20 ${cx + 11} -14`}
                        stroke="#4a2413"
                        strokeWidth="2.8"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })}
              </>
            )}

            {/* Subtle Nose & Mouth */}
            <path d="M0 -3 L2 1.5 L-1 2.5" stroke="#dc9d76" strokeWidth="1.9" fill="none" strokeLinecap="round" />
            {mood === 'surprised' ? (
              <ellipse cx="0" cy="10.5" rx="4.2" ry="5.2" fill="#e11d48" stroke="#881337" strokeWidth="1.7" />
            ) : mood === 'curious' ? (
              <ellipse cx="0" cy="10" rx="2.8" ry="2.1" fill="#be123c" stroke="#7a4935" strokeWidth="1.5" />
            ) : (
              <path d="M-6 10 Q0 11.5 6 9.8" stroke="#7a4935" strokeWidth="2.1" fill="none" strokeLinecap="round" />
            )}

            {/* Messy Chestnut Top Hair & Bangs */}
            <path
              d={`M-42 -26 Q-45 -68 0 -70 Q44 -68 42 -26 L36 -38 Q26 -24 18 -38 L9 -24 L0 -39 L-10 -24 L-19 -38 L-28 -25 L-35 -36 Z`}
              fill="#8c4a2b"
              stroke="#4a2413"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <path d="M-24 -56 Q0 -64 24 -55" stroke="#c97d55" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          </g>
        </g>

        {/* === FOREGROUND WOODEN CLASSROOM DESK + OPEN BOOK + ARMS FOLDING NATURALLY === */}
        <g>
          {/* Desk Surface & Apron */}
          <rect x="86" y="252" width="468" height="22" rx="5" fill={`url(#${woodId})`} stroke="#451a03" strokeWidth="2.4" />
          <rect x="104" y="274" width="432" height="86" fill="#92400e" stroke="#451a03" strokeWidth="2.2" />
          <line x1="94" y1="257" x2="546" y2="257" stroke="#fde047" strokeOpacity="0.32" strokeWidth="2" />

          {/* Open Sociology Notebook & Pen on Desk */}
          <g transform="translate(245, 236)">
            <path d="M0 14 Q36 6 72 14 L72 22 Q36 15 0 22 Z" fill="#f8fafc" stroke="#64748b" strokeWidth="1.5" />
            <path d="M72 14 Q108 6 144 14 L144 22 Q108 15 72 22 Z" fill="#ffffff" stroke="#64748b" strokeWidth="1.5" />
            <line x1="72" y1="13" x2="72" y2="22" stroke="#94a3b8" strokeWidth="1.6" />
          </g>
          <rect x="188" y="247" width="38" height="4.5" rx="2" transform="rotate(-8 188 247)" fill="#0284c7" stroke="#0f172a" strokeWidth="1" />
          <rect x="424" y="246" width="34" height="4.5" rx="2" transform="rotate(14 424 246)" fill="#e11d48" stroke="#0f172a" strokeWidth="1" />

          {/* Articulated Left & Right Arms Resting Naturally on Desk / Folding Under Head */}
          <g transform={`translate(0, ${(breathY * 0.4).toFixed(2)})`}>
            {/* Left Upper Arm & Forearm sliding inward to fold */}
            <path
              d={`M${252 + armFoldT * 6} ${176 + armFoldT * 24} L${224 + armFoldT * 10} ${232 + armFoldT * 10} L${246 + armFoldT * 14} ${244 + armFoldT * 4} L${274 + armFoldT * 6} ${194 + armFoldT * 20} Z`}
              fill={`url(#${batikId})`}
              stroke="#1b496e"
              strokeWidth="2.1"
              strokeLinejoin="round"
            />
            <path
              d={`M226 ${234 + armFoldT * 10} L${312 + armFoldT * 36} ${242 + armFoldT * 4} L${310 + armFoldT * 36} ${258 + armFoldT * 2} L222 ${250 + armFoldT * 8} Z`}
              fill={`url(#${skinId})`}
              stroke="#7a4935"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Right Upper Arm & Forearm sliding across top of left arm */}
            <path
              d={`M${392 - armFoldT * 6} ${176 + armFoldT * 24} L${420 - armFoldT * 10} ${232 + armFoldT * 10} L${398 - armFoldT * 14} ${244 + armFoldT * 4} L${370 - armFoldT * 6} ${194 + armFoldT * 20} Z`}
              fill={`url(#${batikId})`}
              stroke="#1b496e"
              strokeWidth="2.1"
              strokeLinejoin="round"
            />
            <path
              d={`M418 ${234 + armFoldT * 10} L${324 - armFoldT * 32} ${238 + armFoldT * 2} L${326 - armFoldT * 32} ${254 + armFoldT * 2} L422 ${250 + armFoldT * 8} Z`}
              fill={`url(#${skinId})`}
              stroke="#7a4935"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};

interface BackPortalActorProps {
  /** 0..1 progress across standing/breathing (0..0.28) then stepping smoothly forward into portal (0.28..1) */
  progress: number;
  animTime: number;
}

/**
 * 2D Anime Rear/3-4 Rim-Lit Silhouette Actor for Scene 5:
 * Shows Nino from behind wearing his Sky-Blue Batik shirt & red backpack, taking a deep breath,
 * then walking smoothly forward step-by-step into the glowing dimensional gateway.
 */
export const NinoBackPortalActor: React.FC<BackPortalActorProps> = ({ progress, animTime }) => {
  const uid = useId().replace(/:/g, '');
  const batikId = `back-batik-${uid}`;

  const p = clamp01(progress);
  const walkSpeed = p < 0.24 ? 0 : smoothstep(0.24, 0.42, p);
  const walkDist = Math.max(0, p - 0.24) / 0.76;
  const walkPhase = walkDist * 14.5;

  // Deep breath before stepping forward, then rhythmic walk bounce
  const preBreath = p < 0.28 ? Math.sin((p / 0.28) * Math.PI) * 3.2 : 0;
  const walkHipSway = Math.sin(walkPhase) * 2.5 * walkSpeed;
  const walkBob = -Math.abs(Math.cos(walkPhase)) * 3.5 * walkSpeed;

  // Articulated rear stride (leg alternating scale & vertical lift for clean back-view perspective walk)
  const leftSwing = Math.sin(walkPhase) * walkSpeed;
  const rightSwing = -Math.sin(walkPhase) * walkSpeed;
  const leftLift = Math.max(0, Math.cos(walkPhase)) * 12 * walkSpeed;
  const rightLift = Math.max(0, -Math.cos(walkPhase)) * 12 * walkSpeed;

  const armL = Math.sin(walkPhase + Math.PI) * 10 * walkSpeed;
  const armR = Math.sin(walkPhase) * 10 * walkSpeed;
  const windFlutter = Math.sin(animTime * 4.5) * (1.2 + walkDist * 2.4);

  return (
    <svg
      viewBox="0 0 200 320"
      className="w-[155px] h-[250px] overflow-visible drop-shadow-[0_0_24px_rgba(56,189,248,0.45)]"
    >
      <defs>
        <pattern id={batikId} width="26" height="26" patternUnits="userSpaceOnUse">
          <rect width="26" height="26" fill="#469cd1" />
          <path d="M4 13 Q10 8 16 12 Q18 16 12 19 Z" fill="#eab308" stroke="#78350f" strokeWidth="0.5" />
          <circle cx="8" cy="7" r="1.9" fill="#f43f5e" />
          <circle cx="20" cy="20" r="1.7" fill="#fb7185" />
        </pattern>
      </defs>

      {/* Portal floor glow reflection shadow beneath Nino's shoes */}
      <ellipse cx="100" cy="316" rx={36 - walkDist * 6} ry="7" fill="rgba(15, 23, 42, 0.72)" />

      <g transform={`translate(${walkHipSway.toFixed(2)}, ${walkBob.toFixed(2)})`}>
        {/* === LEFT LEG & SHOE (rear view with heel lift on push-off) === */}
        <g transform={`translate(0, ${(-leftLift).toFixed(2)})`}>
          <path
            d={`M76 178 L97 178 L95 ${244 - leftLift * 0.3} L92 ${300 - leftSwing * 4} L76 ${300 - leftSwing * 4} L75 244 Z`}
            fill="#e2e8f0"
            stroke="#475569"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d={`M75 ${298 - leftSwing * 4} L93 ${298 - leftSwing * 4} L94 ${314 - leftLift * 0.4} L73 ${314 - leftLift * 0.4} Z`}
            fill="#1e293b"
            stroke="#0f172a"
            strokeWidth="1.4"
          />
          {leftLift > 2 && (
            <ellipse cx="83.5" cy={312 - leftLift * 0.3} rx="7" ry="2.8" fill="#475569" opacity="0.85" />
          )}
        </g>

        {/* === RIGHT LEG & SHOE (rear view alternating) === */}
        <g transform={`translate(0, ${(-rightLift).toFixed(2)})`}>
          <path
            d={`M102 178 L123 178 L124 244 L121 ${300 - rightSwing * 4} L105 ${300 - rightSwing * 4} L103 ${244 - rightLift * 0.3} Z`}
            fill="#e2e8f0"
            stroke="#475569"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d={`M104 ${298 - rightSwing * 4} L122 ${298 - rightSwing * 4} L124 ${314 - rightLift * 0.4} L103 ${314 - rightLift * 0.4} Z`}
            fill="#1e293b"
            stroke="#0f172a"
            strokeWidth="1.4"
          />
          {rightLift > 2 && (
            <ellipse cx="113.5" cy={312 - rightLift * 0.3} rx="7" ry="2.8" fill="#475569" opacity="0.85" />
          )}
        </g>

        {/* === ARMS SWINGING NATURALLY BEHIND TORSO === */}
        <g transform={`translate(0, ${(-preBreath).toFixed(2)})`}>
          <g transform={`rotate(${armL.toFixed(2)}, 68, 92)`}>
            <path d="M58 88 L74 86 L72 122 L56 120 Z" fill={`url(#${batikId})`} stroke="#1b496e" strokeWidth="1.4" />
            <path d="M58 120 L70 121 L67 170 L56 169 Z" fill="#e8b48c" stroke="#7a4935" strokeWidth="1.3" />
          </g>
          <g transform={`rotate(${armR.toFixed(2)}, 132, 92)`}>
            <path d="M126 86 L142 88 L144 120 L128 122 Z" fill={`url(#${batikId})`} stroke="#1b496e" strokeWidth="1.4" />
            <path d="M130 121 L142 120 L144 169 L133 170 Z" fill="#e8b48c" stroke="#7a4935" strokeWidth="1.3" />
          </g>

          {/* === SKY-BLUE BATIK SHIRT BACK + COLLAR (Portal-Lit Rim) === */}
          <path
            d={`M70 84 Q100 78 130 84 L${128 + windFlutter * 0.4} 174 Q100 179 ${72 - windFlutter * 0.4} 174 Z`}
            fill={`url(#${batikId})`}
            stroke="#1b496e"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {/* Rim light glow along upper shoulders from portal */}
          <path
            d="M72 86 Q100 79 128 86"
            fill="none"
            stroke="#7dd3fc"
            strokeWidth="2.2"
            opacity="0.8"
          />
          <path d="M84 78 Q100 84 116 78 L113 90 Q100 94 87 90 Z" fill={`url(#${batikId})`} stroke="#1b496e" strokeWidth="1.4" />

          {/* === RED BACKPACK FROM BEHIND (Sways gently with step & breath) === */}
          <g transform={`translate(${(walkHipSway * 0.4).toFixed(2)}, ${(preBreath * -0.35 + Math.sin(walkPhase * 2) * 1.4 * walkSpeed).toFixed(2)})`}>
            {/* Top shoulder straps */}
            <path d="M77 84 Q80 96 78 112" stroke="#991b1b" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M123 84 Q120 96 122 112" stroke="#991b1b" strokeWidth="6" strokeLinecap="round" fill="none" />
            {/* Main red pack body */}
            <path
              d="M74 96 Q100 86 126 96 L130 158 Q130 171 100 172 Q70 171 70 158 Z"
              fill="#dc2626"
              stroke="#7f1d1d"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Rim lighting edge */}
            <path d="M76 98 Q100 89 124 98" stroke="#fca5a5" strokeWidth="1.8" fill="none" opacity="0.7" />
            {/* Front pocket & zipper detail */}
            <rect x="78" y="130" width="44" height="32" rx="7" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="1.5" />
            <line x1="84" y1="138" x2="116" y2="138" stroke="#450a0a" strokeWidth="1.8" strokeLinecap="round" />
            <rect x="94" y="110" width="12" height="7" rx="2" fill="#450a0a" />
          </g>

          {/* === BACK OF HEAD & CHESTNUT HAIR (Portal Rim Glow) === */}
          <g transform={`translate(0, ${(-preBreath * 0.4).toFixed(2)})`}>
            <rect x="92" y="66" width="16" height="18" fill="#e8b48c" stroke="#7a4935" strokeWidth="1.3" />
            <path d="M76 48 Q71 48 72 56 Q73 61 77 60" fill="#e8b48c" stroke="#7a4935" strokeWidth="1.2" />
            <path d="M124 48 Q129 48 128 56 Q127 61 123 60" fill="#e8b48c" stroke="#7a4935" strokeWidth="1.2" />
            {/* Messy chestnut back hair */}
            <path
              d={`M73 56 Q68 35 82 22 Q100 13 118 22 Q132 35 127 56 L120 69 L112 63 L105 71 L96 63 L87 71 L80 63 Z`}
              fill="#7c3e22"
              stroke="#3b1b0e"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            {/* Cyan-violet portal rim light on hair spikes */}
            <path
              d={`M76 42 Q85 ${20 + windFlutter * 0.25} 100 18 Q115 ${20 - windFlutter * 0.25} 124 42`}
              fill="none"
              stroke="#a5f3fc"
              strokeWidth="2.1"
              strokeLinecap="round"
              opacity="0.85"
            />
          </g>
        </g>
      </g>
    </svg>
  );
};
