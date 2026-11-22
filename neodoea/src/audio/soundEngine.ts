import type { AreaId, CharacterId } from '../types/game';

export type MusicTheme =
  | AreaId
  | 'stage_gamelan'
  | 'puzzle_tension'
  | 'menu'
  | 'ending'
  | 'prologue_mystery'
  | 'prologue_adventure';

export type SfxType =
  | 'click'
  | 'jump'
  | 'step'
  | 'clue'
  | 'dialogue'
  | 'correct'
  | 'wrong'
  | 'gameover'
  | 'portal'
  | 'bell'
  | 'glitch'
  | 'wind'
  | 'transition'
  | 'gamelan1'
  | 'gamelan2'
  | 'gamelan3';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicVolume = 0.45;
  private sfxVolume = 0.65;
  private currentTheme: MusicTheme | null = null;
  private loopTimer: number | null = null;
  private fadeSwapTimer: number | null = null;
  private stepIndex = 0;
  private barIndex = 0;
  private isDucked = false;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.gain.value = this.getTargetMusicGain();
      this.sfxGain.gain.value = this.sfxVolume * 0.36;
      this.musicGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private getTargetMusicGain(): number {
    const duckFactor = this.isDucked ? 0.5 : 1;
    return this.musicVolume * 0.3 * duckFactor;
  }

  public unlock(): void {
    this.ensureContext();
  }

  public setVolumes(music: number, sfx: number): void {
    this.musicVolume = Math.max(0, Math.min(1, music));
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.getTargetMusicGain(), this.ctx.currentTime, 0.08);
    }
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume * 0.36, this.ctx.currentTime, 0.05);
    }
  }

  public setDialogueDuck(ducked: boolean): void {
    this.isDucked = ducked;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.getTargetMusicGain(), this.ctx.currentTime, 0.14);
    }
  }

  public startMusic(theme: MusicTheme): void {
    if (this.currentTheme === theme && this.loopTimer !== null) return;

    if (this.fadeSwapTimer !== null) {
      window.clearTimeout(this.fadeSwapTimer);
      this.fadeSwapTimer = null;
    }

    const hadTheme = this.currentTheme !== null && this.loopTimer !== null;

    if (this.loopTimer !== null) {
      window.clearInterval(this.loopTimer);
      this.loopTimer = null;
    }

    this.currentTheme = theme;
    this.stepIndex = 0;
    this.barIndex = 0;

    const tempoMs =
      theme === 'terminal'
        ? 250
        : theme === 'stage_gamelan'
        ? 270
        : theme === 'puzzle_tension'
        ? 310
        : theme === 'prologue_adventure'
        ? 330
        : theme === 'plaza'
        ? 350
        : theme === 'ending'
        ? 370
        : theme === 'outskirts'
        ? 430
        : theme === 'prologue_mystery'
        ? 450
        : theme === 'stage'
        ? 500
        : 460;

    const launchLoop = () => {
      if (this.ctx && this.musicGain) {
        this.musicGain.gain.setTargetAtTime(
          this.getTargetMusicGain(),
          this.ctx.currentTime,
          0.18
        );
      }

      const tick = () => {
        if (!this.ctx || this.ctx.state !== 'running' || !this.musicGain || this.musicVolume <= 0.01) {
          return;
        }
        this.playThemeStep(theme, this.stepIndex, this.barIndex);
        this.stepIndex = (this.stepIndex + 1) % 16;
        if (this.stepIndex === 0) {
          this.barIndex = (this.barIndex + 1) % 4;
        }
      };

      // Play beat 0 right away if audio is already running so transitions feel seamless
      if (this.ctx && this.ctx.state === 'running' && this.musicVolume > 0.01) {
        tick();
      }
      this.loopTimer = window.setInterval(tick, tempoMs);
    };

    if (hadTheme && this.ctx && this.musicGain) {
      // Smooth crossfade out before launching the next area/situation theme
      this.musicGain.gain.setTargetAtTime(0.0005, this.ctx.currentTime, 0.05);
      this.fadeSwapTimer = window.setTimeout(() => {
        this.fadeSwapTimer = null;
        if (this.currentTheme === theme) {
          launchLoop();
        }
      }, 150);
    } else {
      launchLoop();
    }
  }

  public stopMusic(): void {
    if (this.fadeSwapTimer !== null) {
      window.clearTimeout(this.fadeSwapTimer);
      this.fadeSwapTimer = null;
    }
    if (this.loopTimer !== null) {
      window.clearInterval(this.loopTimer);
      this.loopTimer = null;
    }
    this.currentTheme = null;
  }

  /**
   * Warm detuned pad note for atmospheric ambient depth
   */
  private playPad(freqs: number[], duration: number, peak: number, cutoffHz = 950): void {
    const ctx = this.ctx;
    const out = this.musicGain;
    if (!ctx || !out) return;

    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoffHz, now);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(peak, now + Math.min(0.45, duration * 0.25));
    env.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    filter.connect(env);
    env.connect(out);

    for (const freq of freqs) {
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.connect(filter);
      osc.start(now);
      osc.stop(now + duration + 0.04);
    }
  }

  /**
   * Soft melodic synth/kalimba/electric-piano note
   */
  private playVoice(
    freq: number,
    duration: number,
    type: OscillatorType,
    peak: number,
    delaySec = 0,
    cutoffHz = 2800
  ): void {
    const ctx = this.ctx;
    const out = this.musicGain;
    if (!ctx || !out) return;

    const start = ctx.currentTime + delaySec;
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const env = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoffHz, start);
    filter.frequency.exponentialRampToValueAtTime(Math.max(420, cutoffHz * 0.4), start + duration);

    env.gain.setValueAtTime(0.0001, start);
    env.gain.linearRampToValueAtTime(peak, start + 0.015);
    env.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(filter);
    filter.connect(env);
    env.connect(out);
    osc.start(start);
    osc.stop(start + duration + 0.03);
  }

  /**
   * Authentic Indonesian Gamelan bronze metallophone (Saron / Bonang / Gender / Kenong)
   * Features bronze overtone (~2.756x fundamental) + subtle ombak shimmer + mallet attack
   */
  private playMetallophone(
    freq: number,
    duration: number,
    peak: number,
    delaySec = 0,
    shimmerAmount = 0.24
  ): void {
    const ctx = this.ctx;
    const out = this.musicGain;
    if (!ctx || !out) return;

    const start = ctx.currentTime + delaySec;

    // 1. Primary bronze resonance
    const fund = ctx.createOscillator();
    const fundEnv = ctx.createGain();
    fund.type = 'sine';
    fund.frequency.setValueAtTime(freq, start);
    fundEnv.gain.setValueAtTime(0.0001, start);
    fundEnv.gain.linearRampToValueAtTime(peak, start + 0.008);
    fundEnv.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    fund.connect(fundEnv);
    fundEnv.connect(out);
    fund.start(start);
    fund.stop(start + duration + 0.04);

    // 2. Detuned twin for characteristic Javanese "ombak" shimmer
    const twin = ctx.createOscillator();
    const twinEnv = ctx.createGain();
    twin.type = 'sine';
    twin.frequency.setValueAtTime(freq * 1.0045, start);
    twinEnv.gain.setValueAtTime(0.0001, start);
    twinEnv.gain.linearRampToValueAtTime(peak * 0.42, start + 0.01);
    twinEnv.gain.exponentialRampToValueAtTime(0.0001, start + duration * 0.88);
    twin.connect(twinEnv);
    twinEnv.connect(out);
    twin.start(start);
    twin.stop(start + duration + 0.04);

    // 3. Inharmonic bronze overtone (2.756x partial) + brief mallet click
    const over = ctx.createOscillator();
    const overEnv = ctx.createGain();
    over.type = 'triangle';
    over.frequency.setValueAtTime(freq * 2.756, start);
    overEnv.gain.setValueAtTime(0.0001, start);
    overEnv.gain.linearRampToValueAtTime(peak * shimmerAmount, start + 0.005);
    overEnv.gain.exponentialRampToValueAtTime(0.0001, start + Math.min(0.28, duration * 0.35));
    over.connect(overEnv);
    overEnv.connect(out);
    over.start(start);
    over.stop(start + Math.min(0.32, duration * 0.4));
  }

  /**
   * Deep resonant Javanese Gong Ageng / Kempul
   */
  private playGong(baseFreq: number, duration: number, peak: number): void {
    const ctx = this.ctx;
    const out = this.musicGain;
    if (!ctx || !out) return;

    const now = ctx.currentTime;
    const partials = [
      { mult: 1.0, amp: 1.0, dur: duration },
      { mult: 1.008, amp: 0.72, dur: duration * 0.96 }, // slow ombak wave beat
      { mult: 1.5, amp: 0.36, dur: duration * 0.7 },
      { mult: 2.02, amp: 0.22, dur: duration * 0.55 },
    ];

    for (const p of partials) {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * p.mult * 1.015, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * p.mult * 0.985, now + p.dur);

      env.gain.setValueAtTime(0.0001, now);
      env.gain.linearRampToValueAtTime(peak * p.amp, now + 0.045);
      env.gain.exponentialRampToValueAtTime(0.0001, now + p.dur);

      osc.connect(env);
      env.connect(out);
      osc.start(now);
      osc.stop(now + p.dur + 0.05);
    }
  }

  /**
   * Warm Indonesian Kendang hand-drum skin thump ("dung" / "tak")
   */
  private playKendang(kind: 'dung' | 'tak', peak = 0.14): void {
    const ctx = this.ctx;
    const out = this.musicGain;
    if (!ctx || !out) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = kind === 'dung' ? 'sine' : 'triangle';

    const startHz = kind === 'dung' ? 122 : 285;
    const endHz = kind === 'dung' ? 62 : 142;
    const dur = kind === 'dung' ? 0.16 : 0.085;

    osc.frequency.setValueAtTime(startHz, now);
    osc.frequency.exponentialRampToValueAtTime(endHz, now + dur);

    env.gain.setValueAtTime(0.0001, now);
    env.gain.linearRampToValueAtTime(peak, now + 0.006);
    env.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    osc.connect(env);
    env.connect(out);
    osc.start(now);
    osc.stop(now + dur + 0.02);
  }

  private playThemeStep(theme: MusicTheme, step: number, bar: number): void {
    // 1. MENU — Warm twilight synth pads + nostalgic bell electric piano
    if (theme === 'menu') {
      const chords = [
        [220, 261.63, 329.63], // Am
        [174.61, 220, 261.63], // F
        [196, 246.94, 293.66], // G
        [164.81, 196, 246.94], // Em
      ];
      const melody = [
        440, 523.25, 659.25, 587.33, 523.25, 493.88, 392, 440,
        349.23, 440, 523.25, 493.88, 392, 440, 329.63, 392,
      ];
      if (step === 0 || step === 8) {
        const chordIdx = (bar * 2 + (step === 8 ? 1 : 0)) % chords.length;
        this.playPad(chords[chordIdx], 3.4, 0.075, 820);
      }
      if (step % 2 === 0) {
        this.playVoice(melody[step], 0.72, 'sine', 0.11, 0, 2200);
        this.playVoice(melody[step] * 2, 0.28, 'sine', 0.025, 0, 3200);
      }
      return;
    }

    // 2. OUTSKIRTS — Warm afternoon neighborhood acoustic plucks + calm breeze pad
    if (theme === 'outskirts') {
      const chords = [
        [146.83, 220, 293.66], // D5/add
        [196, 246.94, 293.66], // G
        [164.81, 246.94, 329.63], // Em
        [220, 277.18, 329.63], // A
      ];
      const plucks = [
        293.66, 369.99, 440, 587.33, 493.88, 440, 369.99, 329.63,
        293.66, 329.63, 369.99, 440, 587.33, 493.88, 440, 369.99,
      ];
      if (step === 0) {
        this.playPad(chords[bar % chords.length], 4.2, 0.065, 750);
      }
      if (step % 4 === 0) {
        this.playVoice(chords[bar % chords.length][0], 0.9, 'triangle', 0.09, 0, 620);
      }
      if (step % 2 === 0 || step === 7 || step === 15) {
        this.playVoice(plucks[step], 0.55, 'triangle', 0.095, 0, 1750);
      }
      return;
    }

    // 3. PLAZA — Sleek cosmopolitan digital city pulse + cool Rhodes chords
    if (theme === 'plaza') {
      const chords = [
        [261.63, 311.13, 392, 466.16], // Cm7
        [233.08, 293.66, 349.23, 440], // Bbmaj7
        [207.65, 261.63, 311.13, 392], // Abmaj7
        [196, 233.08, 293.66, 349.23], // Gm7
      ];
      const arp = [
        392, 466.16, 523.25, 466.16, 622.25, 523.25, 466.16, 392,
        349.23, 466.16, 523.25, 587.33, 523.25, 466.16, 392, 349.23,
      ];
      if (step === 0) {
        this.playPad(chords[bar % chords.length], 3.8, 0.06, 1150);
      }
      // Subtle modern city offbeat pulse
      if (step % 4 === 2) {
        this.playVoice(130.81, 0.14, 'triangle', 0.07, 0, 480);
      } else if (step % 4 === 0) {
        this.playVoice(chords[bar % chords.length][0] / 2, 0.55, 'triangle', 0.11, 0, 560);
      }
      this.playVoice(arp[step], 0.34, 'sine', step % 2 === 0 ? 0.095 : 0.055, 0, 2600);
      return;
    }

    // 4. STAGE (Neglected Pendopo) — Quiet, reflective solo Pelog Gamelan
    if (theme === 'stage') {
      // Pelog Bem scale in D: D4(293.66), Eb4(311.13), F#4(369.99), A4(440), Bb4(466.16), D5(587.33)
      const soloPelog: Record<number, number> = {
        0: 293.66,
        3: 311.13,
        6: 440.0,
        8: 466.16,
        11: 440.0,
        14: 369.99,
      };
      if (step === 0) {
        this.playGong(110, 2.8, 0.09);
      }
      if (step === 8) {
        this.playMetallophone(146.83, 1.5, 0.08, 0, 0.14);
      }
      const note = soloPelog[step];
      if (note) {
        this.playMetallophone(note, 1.25, 0.12, 0, 0.2);
      }
      return;
    }

    // 5. STAGE_GAMELAN — Full lively Javanese/Nusantara Gamelan Ensemble!
    if (theme === 'stage_gamelan') {
      // Slendro/Nusantara celebratory scale: D4(293.66), E4(329.63), G4(392), A4(440), C5(523.25), D5(587.33), E5(659.25), G5(783.99)
      const balunganBars = [
        [392.0, 440.0, 523.25, 440.0, 392.0, 329.63, 293.66, 329.63],
        [440.0, 523.25, 587.33, 523.25, 440.0, 392.0, 329.63, 392.0],
      ];
      const balungan = balunganBars[bar % 2];
      const kotekanHigh = [587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 659.25, 783.99];

      // Deep Gong Ageng on bar start (cycles 0 & 2), warm Kempul on step 8
      if (step === 0) {
        if (bar % 2 === 0) {
          this.playGong(98.0, 3.2, 0.15);
        } else {
          this.playGong(146.83, 2.0, 0.1);
        }
      }
      // Kenong / Kempul markers
      if (step === 4 || step === 12) {
        this.playMetallophone(196.0, 1.15, 0.11, 0, 0.15);
      } else if (step === 8) {
        this.playMetallophone(220.0, 1.25, 0.12, 0, 0.16);
      }

      // Saron Balungan core melody on even steps
      if (step % 2 === 0) {
        const saronFreq = balungan[Math.floor(step / 2)];
        this.playMetallophone(saronFreq, 0.72, 0.14, 0, 0.28);
      }

      // Bonang / Peking interlocking kotekan on odd steps + lively accents
      if (step % 2 === 1) {
        const bonangFreq = kotekanHigh[Math.floor(step / 2)];
        this.playMetallophone(bonangFreq, 0.44, 0.085, 0, 0.32);
      } else if (step === 6 || step === 14) {
        this.playMetallophone(kotekanHigh[Math.floor(step / 2)], 0.36, 0.06, 0.12, 0.3);
      }

      // Kendang hand-drum groove
      if (step === 0 || step === 6 || step === 8 || step === 14) {
        this.playKendang('dung', 0.12);
      } else if (step === 3 || step === 7 || step === 11 || step === 15) {
        this.playKendang('tak', 0.09);
      }
      return;
    }

    // 6. TERMINAL — Tense cyberpunk algorithmic bass ostinato + digital shimmer
    if (theme === 'terminal') {
      const bassLine = [98.0, 98.0, 116.54, 98.0, 130.81, 116.54, 146.83, 130.81];
      const synthLead = [392, 466.16, 587.33, 523.25, 466.16, 392, 349.23, 392];

      const bassFreq = bassLine[step % bassLine.length];
      this.playVoice(bassFreq, 0.22, 'sawtooth', step % 2 === 0 ? 0.11 : 0.065, 0, 680);

      if (step % 2 === 0) {
        this.playVoice(synthLead[(step / 2 + bar) % synthLead.length], 0.26, 'triangle', 0.075, 0, 2100);
      }
      if (step === 0 || step === 10) {
        this.playVoice(783.99, 0.3, 'sine', 0.045, 0, 3400);
      }
      return;
    }

    // 7. PUZZLE_TENSION — Focused investigative mystery groove during hacking/boards
    if (theme === 'puzzle_tension') {
      const bass = [110, 110, 87.31, 98.0];
      const ticks = [440, 523.25, 493.88, 392, 440, 659.25, 587.33, 523.25];
      if (step === 0) {
        this.playVoice(bass[bar % bass.length], 1.4, 'triangle', 0.1, 0, 540);
      }
      if (step % 2 === 0) {
        this.playVoice(ticks[(step / 2) % ticks.length], 0.2, 'sine', 0.075, 0, 1800);
      }
      if (step === 4 || step === 12) {
        this.playVoice(220, 0.18, 'triangle', 0.06, 0, 900);
      }
      return;
    }

    // 8. ENDING — Warm Golden Hour Nusantara celebration (Strings Pad + Joyful Gamelan Harmony)
    if (theme === 'ending') {
      const chords = [
        [146.83, 220, 293.66, 369.99], // Dmaj
        [196.0, 246.94, 293.66, 392.0], // Gmaj
        [246.94, 293.66, 369.99, 440.0], // Bm7
        [220.0, 277.18, 329.63, 440.0], // A6
      ];
      const hopeful = [
        587.33, 659.25, 739.99, 587.33, 880, 739.99, 659.25, 587.33,
        493.88, 587.33, 659.25, 739.99, 659.25, 587.33, 440, 587.33,
      ];
      const gamelanAccent = [392.0, 440.0, 587.33, 440.0, 392.0, 329.63, 293.66, 440.0];

      if (step === 0) {
        this.playPad(chords[bar % chords.length], 3.8, 0.08, 1250);
        if (bar % 2 === 0) {
          this.playGong(146.83, 2.4, 0.085);
        }
      }
      if (step % 2 === 0) {
        this.playVoice(hopeful[step], 0.65, 'sine', 0.1, 0, 2600);
      }
      // Gentle woven Nusantara gamelan chime accents on beats 2, 6, 10, 14
      if (step % 4 === 2) {
        this.playMetallophone(gamelanAccent[(step / 2) % gamelanAccent.length], 0.85, 0.09, 0, 0.22);
      }
      return;
    }

    // 9. PROLOGUE_MYSTERY / PROLOGUE_ADVENTURE
    const scale =
      theme === 'prologue_mystery'
        ? [246.94, 293.66, 369.99, 440, 493.88, 440, 369.99, 329.63]
        : [261.63, 329.63, 392, 493.88, 587.33, 523.25, 440, 392];
    if (step === 0) {
      this.playPad([scale[0] / 2, scale[2] / 2, scale[4] / 2], 3.2, 0.065, 920);
    }
    if (step % 2 === 0 || theme === 'prologue_adventure') {
      this.playVoice(scale[step % scale.length], 0.45, 'sine', 0.095, 0, 2200);
    }
    if (step % 4 === 0) {
      this.playVoice(scale[step % scale.length] / 2, 0.8, 'triangle', 0.085, 0, 620);
    }
  }

  public playSfx(type: SfxType, speaker?: CharacterId): void {
    const ctx = this.ensureContext();
    const out = this.sfxGain;
    if (!ctx || !out || this.sfxVolume <= 0.01) return;

    const now = ctx.currentTime;

    if (type === 'click') {
      this.tone(ctx, out, 640, 880, 0.06, 'sine', 0.18, now);
    } else if (type === 'jump') {
      this.tone(ctx, out, 240, 460, 0.14, 'triangle', 0.2, now);
    } else if (type === 'step') {
      this.tone(ctx, out, 120, 90, 0.04, 'triangle', 0.08, now);
    } else if (type === 'dialogue') {
      const pitch =
        speaker === 'dira'
          ? 520
          : speaker === 'sari'
          ? 485
          : speaker === 'ilyas'
          ? 370
          : speaker === 'nino'
          ? 420
          : speaker === 'wiryo'
          ? 280
          : 440;
      this.tone(ctx, out, pitch, pitch * 1.04, 0.045, 'sine', 0.1, now);
    } else if (type === 'clue') {
      this.tone(ctx, out, 523.25, 523.25, 0.12, 'triangle', 0.25, now);
      this.tone(ctx, out, 659.25, 659.25, 0.12, 'triangle', 0.25, now + 0.09);
      this.tone(ctx, out, 783.99, 1046.5, 0.28, 'sine', 0.28, now + 0.18);
    } else if (type === 'correct') {
      this.tone(ctx, out, 440, 554.37, 0.12, 'triangle', 0.24, now);
      this.tone(ctx, out, 659.25, 880, 0.25, 'sine', 0.28, now + 0.1);
    } else if (type === 'wrong') {
      this.tone(ctx, out, 220, 155, 0.22, 'sawtooth', 0.16, now);
    } else if (type === 'gameover') {
      this.tone(ctx, out, 293.66, 261.63, 0.2, 'sawtooth', 0.18, now);
      this.tone(ctx, out, 220, 196, 0.24, 'sawtooth', 0.18, now + 0.18);
      this.tone(ctx, out, 164.81, 110, 0.45, 'triangle', 0.24, now + 0.38);
    } else if (type === 'portal') {
      this.tone(ctx, out, 260, 620, 0.65, 'sine', 0.24, now);
      this.tone(ctx, out, 390, 920, 0.7, 'triangle', 0.15, now + 0.06);
      this.tone(ctx, out, 520, 1180, 0.5, 'sine', 0.1, now + 0.18);
    } else if (type === 'transition') {
      this.tone(ctx, out, 240, 420, 0.28, 'sine', 0.1, now);
      this.tone(ctx, out, 360, 540, 0.26, 'sine', 0.07, now + 0.06);
    } else if (type === 'bell') {
      this.tone(ctx, out, 659.25, 659.25, 0.22, 'sine', 0.28, now);
      this.tone(ctx, out, 783.99, 783.99, 0.22, 'sine', 0.28, now + 0.22);
      this.tone(ctx, out, 987.77, 987.77, 0.45, 'sine', 0.3, now + 0.44);
    } else if (type === 'glitch') {
      this.tone(ctx, out, 520, 180, 0.08, 'sawtooth', 0.2, now);
      this.tone(ctx, out, 160, 740, 0.08, 'square', 0.14, now + 0.08);
      this.tone(ctx, out, 380, 120, 0.14, 'sawtooth', 0.18, now + 0.16);
    } else if (type === 'wind') {
      this.tone(ctx, out, 190, 340, 0.65, 'sine', 0.14, now);
      this.tone(ctx, out, 320, 540, 0.55, 'triangle', 0.09, now + 0.1);
    } else if (type === 'gamelan1') {
      // Bonang resonant bronze strike
      this.tone(ctx, out, 392, 390, 0.85, 'sine', 0.3, now);
      this.tone(ctx, out, 393.8, 391.5, 0.8, 'sine', 0.16, now);
      this.tone(ctx, out, 1080, 1072, 0.28, 'triangle', 0.11, now);
    } else if (type === 'gamelan2') {
      // Saron clear bronze strike
      this.tone(ctx, out, 440, 438, 0.85, 'sine', 0.3, now);
      this.tone(ctx, out, 442, 439.8, 0.8, 'sine', 0.16, now);
      this.tone(ctx, out, 1212, 1202, 0.28, 'triangle', 0.11, now);
    } else if (type === 'gamelan3') {
      // Gong / Kenong deep warm bronze resonance
      this.tone(ctx, out, 261.63, 258, 1.35, 'sine', 0.32, now);
      this.tone(ctx, out, 523.25, 519, 1.05, 'sine', 0.22, now);
      this.tone(ctx, out, 784, 779, 0.6, 'triangle', 0.1, now);
    }
  }

  private tone(
    ctx: AudioContext,
    out: AudioNode,
    startFreq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType,
    peak: number,
    startTime: number
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, startTime);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), startTime + duration);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(peak, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(out);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }
}

export const soundEngine = new SoundEngine();
