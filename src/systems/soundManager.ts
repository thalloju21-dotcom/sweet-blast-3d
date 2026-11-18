import { GameSettings, SpecialCandyType } from '../types/game';

export type MusicTrackType = 'none' | 'menu' | 'gameplay';

/**
 * SWEET BLAST 3D – Studio-Grade Procedural Audio & Music Engine (44.1 kHz)
 *
 * Synthesizes 100% original, multi-layered casual puzzle music and tactile candy SFX:
 *  - Home Screen Music: Magical fantasy bells, wooden marimba, felt piano & warm string pads.
 *  - Gameplay Music: Upbeat playful xylophone, staccato piano, light shaker/woodblock percussion & bass.
 *  - Smooth Crossfading: Dedicated Web Audio GainNode buses prevent track overlap and glitches.
 *  - Distinct Match 3, Match 4, and Match 5+ jelly-pop & magical sparkle sound effects.
 *  - Special Bomb Sounds: Striped laser blast, Colour Bomb rainbow lightning, Wrapped double-explosion.
 *  - Jingles: Level Complete victory melody, playful Game Over & friendly Retry, Daily Gift opening & Coins.
 */
class SoundManager {
  private ctx: AudioContext | null = null;
  private musicMasterGain: GainNode | null = null;
  private sfxMasterGain: GainNode | null = null;

  private settings: GameSettings = {
    music: true,
    sound: true,
    vibration: true,
    musicVolume: 0.35,
    soundVolume: 0.75,
    language: 'en',
  };

  private currentTrack: MusicTrackType = 'none';
  private desiredTrack: MusicTrackType = 'menu';
  private stepTimer: number | null = null;
  private stepIndex = 0;
  private unlockListenersBound = false;
  private lastSfxTimestamp: Record<string, number> = {};

  // =========================================================================
  // 1. ORIGINAL HOME SCREEN FANTASY SCORE (F Major / D Minor Magical Waltz-Pop)
  // Instruments: Celesta Bells + Wooden Marimba + Soft Piano Chords + Warm Strings
  // =========================================================================
  private readonly menuMelody: (number | null)[] = [
    // Bar 1 (Fmaj7): C5 - F5 - A5 - G5 - F5 - E5 - D5 - C5
    523.25, 698.46, 880.0, 783.99, 698.46, 659.25, 587.33, 523.25,
    // Bar 2 (Bbmaj7 -> C7): D5 - F5 - Bb5 - A5 - G5 - F5 - E5 - G5
    587.33, 698.46, 932.33, 880.0, 783.99, 698.46, 659.25, 783.99,
    // Bar 3 (Am7 -> Dm7): A5 - C6 - A5 - G5 - F5 - A5 - D6 - C6
    880.0, 1046.5, 880.0, 783.99, 698.46, 880.0, 1174.66, 1046.5,
    // Bar 4 (Gm7 -> C7 -> F): Bb5 - A5 - G5 - F5 - E5 - G5 - F5 - rest
    932.33, 880.0, 783.99, 698.46, 659.25, 783.99, 698.46, null,
  ];

  private readonly menuMarimbaCounter: (number | null)[] = [
    349.23, null, 440.0, 523.25, 349.23, null, 440.0, null,
    466.16, null, 587.33, 523.25, 392.0, null, 523.25, null,
    440.0, null, 523.25, 659.25, 293.66, null, 440.0, 587.33,
    392.0, 466.16, 523.25, 392.0, 523.25, 659.25, 349.23, null,
  ];

  private readonly menuChords: number[][] = [
    [174.61, 261.63, 349.23, 440.0], // F Major
    [233.08, 293.66, 349.23, 440.0], // Bb Major 7
    [196.0, 261.63, 329.63, 392.0], // C Major
    [220.0, 261.63, 329.63, 392.0], // A Minor 7
    [146.83, 220.0, 293.66, 349.23], // D Minor 7
    [196.0, 233.08, 293.66, 349.23], // G Minor 7
    [196.0, 261.63, 329.63, 440.0], // C13
    [174.61, 220.0, 261.63, 349.23], // F Major Resolve
  ];

  // =========================================================================
  // 2. ORIGINAL GAMEPLAY PUZZLE SCORE (G Major Cheerful Upbeat Groove)
  // Instruments: Playful Xylophone + Bouncy Piano + Light Woodblock/Shaker + Bass
  // =========================================================================
  private readonly gameplayMelody: (number | null)[] = [
    // Phrase A
    783.99, 880.0, 987.77, 1174.66, 987.77, 880.0, 783.99, 659.25,
    587.33, 659.25, 783.99, 880.0, 783.99, null, 587.33, null,
    // Phrase B
    659.25, 783.99, 1046.5, 987.77, 880.0, 783.99, 659.25, 783.99,
    880.0, 987.77, 880.0, 659.25, 587.33, 659.25, 783.99, null,
    // Phrase C
    1174.66, 987.77, 880.0, 783.99, 1046.5, 880.0, 783.99, 659.25,
    783.99, 880.0, 987.77, 1174.66, 1318.51, 1174.66, 987.77, 880.0,
    // Phrase D (Resolve)
    783.99, 659.25, 587.33, 659.25, 783.99, 987.77, 880.0, 659.25,
    783.99, null, 987.77, null, 783.99, null, null, null,
  ];

  private readonly gameplayBass: number[] = [
    196.0, 293.66, 196.0, 293.66, // G
    164.81, 246.94, 164.81, 246.94, // Em
    130.81, 196.0, 130.81, 196.0, // C
    146.83, 220.0, 146.83, 220.0, // D
  ];

  constructor() {
    this.bindAutoplayUnlockListeners();
  }

  /**
   * Respects mobile & browser autoplay policies by unlocking the AudioContext
   * on the first user pointer/touch/keyboard interaction.
   */
  private bindAutoplayUnlockListeners(): void {
    if (typeof window === 'undefined' || this.unlockListenersBound) return;
    this.unlockListenersBound = true;

    const unlockHandler = () => {
      const ctx = this.ensureContext();
      if (ctx && ctx.state === 'running') {
        if (this.settings.music && this.currentTrack === 'none' && this.desiredTrack !== 'none') {
          this.switchMusicTrack(this.desiredTrack);
        }
      }
    };

    window.addEventListener('pointerdown', unlockHandler, { passive: true });
    window.addEventListener('touchstart', unlockHandler, { passive: true });
    window.addEventListener('keydown', unlockHandler, { passive: true });
  }

  /**
   * Initializes 44.1 kHz AudioContext and master volume buses for Music and SFX.
   */
  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        try {
          this.ctx = new AudioCtx({ sampleRate: 44100, latencyHint: 'interactive' });
        } catch {
          this.ctx = new AudioCtx();
        }

        // Create dedicated master gain buses for glitch-free volume control & crossfading
        this.musicMasterGain = this.ctx.createGain();
        this.musicMasterGain.gain.setValueAtTime(
          this.settings.music ? this.settings.musicVolume : 0.0001,
          this.ctx.currentTime
        );
        this.musicMasterGain.connect(this.ctx.destination);

        this.sfxMasterGain = this.ctx.createGain();
        this.sfxMasterGain.gain.setValueAtTime(
          this.settings.sound ? this.settings.soundVolume : 0.0001,
          this.ctx.currentTime
        );
        this.sfxMasterGain.connect(this.ctx.destination);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Prevents rapid duplicate SFX triggers within a short window (anti-glitch guard).
   */
  private canTriggerSfx(key: string, minGapMs = 28): boolean {
    const now = performance.now();
    const last = this.lastSfxTimestamp[key] || 0;
    if (now - last < minGapMs) return false;
    this.lastSfxTimestamp[key] = now;
    return true;
  }

  public updateSettings(newSettings: GameSettings): void {
    const prevMusic = this.settings.music;
    this.settings = { ...newSettings };

    if (this.ctx && this.musicMasterGain && this.sfxMasterGain) {
      const now = this.ctx.currentTime;
      const targetMusicGain = this.settings.music
        ? Math.max(0.0001, this.settings.musicVolume)
        : 0.0001;
      const targetSfxGain = this.settings.sound
        ? Math.max(0.0001, this.settings.soundVolume)
        : 0.0001;

      this.musicMasterGain.gain.cancelScheduledValues(now);
      this.musicMasterGain.gain.setTargetAtTime(targetMusicGain, now, 0.06);

      this.sfxMasterGain.gain.cancelScheduledValues(now);
      this.sfxMasterGain.gain.setTargetAtTime(targetSfxGain, now, 0.03);
    }

    if (!this.settings.music && this.currentTrack !== 'none') {
      this.stopMusic();
    } else if (this.settings.music && !prevMusic) {
      this.switchMusicTrack(this.desiredTrack === 'none' ? 'menu' : this.desiredTrack);
    }
  }

  public vibrate(pattern: number | number[] = 18): void {
    if (!this.settings.vibration) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore on unsupported devices
      }
    }
  }

  // =========================================================================
  // BACKGROUND MUSIC CONTROLLER (Menu vs. Gameplay with Smooth Crossfade)
  // =========================================================================

  public playMenuMusic(): void {
    this.desiredTrack = 'menu';
    if (this.currentTrack === 'menu') return;
    this.switchMusicTrack('menu');
  }

  public playGameplayMusic(): void {
    this.desiredTrack = 'gameplay';
    if (this.currentTrack === 'gameplay') return;
    this.switchMusicTrack('gameplay');
  }

  /**
   * Legacy alias: starts or resumes the currently desired track.
   */
  public startMusic(track?: MusicTrackType): void {
    const target = track || (this.desiredTrack === 'none' ? 'gameplay' : this.desiredTrack);
    this.desiredTrack = target;
    this.switchMusicTrack(target);
  }

  private switchMusicTrack(track: MusicTrackType): void {
    // Always clear any existing loop timer to prevent overlapping background tracks
    if (this.stepTimer !== null) {
      window.clearInterval(this.stepTimer);
      this.stepTimer = null;
    }

    if (!this.settings.music || track === 'none') {
      this.currentTrack = 'none';
      return;
    }

    const ctx = this.ensureContext();
    if (!ctx || !this.musicMasterGain) return;

    this.currentTrack = track;
    this.stepIndex = 0;

    // Smooth fade-in on track switch
    const now = ctx.currentTime;
    this.musicMasterGain.gain.cancelScheduledValues(now);
    this.musicMasterGain.gain.setValueAtTime(0.001, now);
    this.musicMasterGain.gain.linearRampToValueAtTime(
      Math.max(0.01, this.settings.musicVolume),
      now + 0.45
    );

    const stepIntervalMs = track === 'menu' ? 280 : 210;
    this.stepTimer = window.setInterval(() => {
      if (!this.settings.music || !this.ctx || this.ctx.state !== 'running') return;
      if (this.currentTrack === 'menu') {
        this.tickMenuMusicStep();
      } else if (this.currentTrack === 'gameplay') {
        this.tickGameplayMusicStep();
      }
    }, stepIntervalMs);
  }

  public stopMusic(): void {
    if (this.stepTimer !== null) {
      window.clearInterval(this.stepTimer);
      this.stepTimer = null;
    }
    this.currentTrack = 'none';
    if (this.ctx && this.musicMasterGain) {
      const now = this.ctx.currentTime;
      this.musicMasterGain.gain.cancelScheduledValues(now);
      this.musicMasterGain.gain.setTargetAtTime(0.0001, now, 0.08);
    }
  }

  /**
   * Temporarily ducks background music volume during major jingles (Victory / Game Over).
   */
  private duckMusicTemporarily(durationSec: number): void {
    if (!this.ctx || !this.musicMasterGain || !this.settings.music) return;
    const now = this.ctx.currentTime;
    const normalVol = Math.max(0.01, this.settings.musicVolume);
    this.musicMasterGain.gain.cancelScheduledValues(now);
    this.musicMasterGain.gain.setTargetAtTime(normalVol * 0.12, now, 0.04);
    this.musicMasterGain.gain.setTargetAtTime(normalVol, now + durationSec, 0.25);
  }

  private tickMenuMusicStep(): void {
    const step = this.stepIndex % 32;
    this.stepIndex++;

    // 1. Lead Celesta / Bell Note
    const leadFreq = this.menuMelody[step];
    if (leadFreq) {
      this.synthBellNote(leadFreq, 0.18, 0.42);
    }

    // 2. Wooden Marimba Counter-Melody
    const marimbaFreq = this.menuMarimbaCounter[step];
    if (marimbaFreq) {
      this.synthMarimbaNote(marimbaFreq, 0.14, 0.22);
    }

    // 3. Soft Felt Piano & Warm String Pad on bar downbeats (every 4 steps)
    if (step % 4 === 0) {
      const chord = this.menuChords[Math.floor(step / 4) % this.menuChords.length];
      this.synthWarmStringPad(chord, 0.055, 1.05);
    }
  }

  private tickGameplayMusicStep(): void {
    const step = this.stepIndex % 64;
    this.stepIndex++;

    // 1. Playful Xylophone & Staccato Piano Lead
    const note = this.gameplayMelody[step];
    if (note) {
      this.synthXylophoneNote(note, 0.17, 0.19);
      if (step % 2 === 0) {
        this.synthBellNote(note * 1.5, 0.05, 0.15);
      }
    }

    // 2. Bouncy Felt Piano Bassline (every 2 steps)
    if (step % 2 === 0) {
      const bassStep = Math.floor(step / 2) % this.gameplayBass.length;
      const bassFreq = this.gameplayBass[bassStep];
      this.synthMarimbaNote(bassFreq, 0.15, 0.2);
    }

    // 3. Light Percussion (Soft Shaker & Woodblock Tick)
    if (step % 4 === 2) {
      this.synthWoodblockTick(820, 0.06);
    } else if (step % 2 === 1) {
      this.synthSoftShaker(0.035);
    }
  }

  // =========================================================================
  // MUSICAL INSTRUMENT SYNTHESIZERS (Connected to musicMasterGain)
  // =========================================================================

  private synthBellNote(freq: number, level: number, duration: number): void {
    if (!this.ctx || !this.musicMasterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const overtone = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    overtone.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    overtone.frequency.setValueAtTime(freq * 2.0, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(level, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + duration);

    const overtoneGain = this.ctx.createGain();
    overtoneGain.gain.setValueAtTime(0.22, now);

    osc.connect(gain);
    overtone.connect(overtoneGain);
    overtoneGain.connect(gain);
    gain.connect(this.musicMasterGain);

    osc.start(now);
    overtone.start(now);
    osc.stop(now + duration + 0.02);
    overtone.stop(now + duration + 0.02);
  }

  private synthMarimbaNote(freq: number, level: number, duration: number): void {
    if (!this.ctx || !this.musicMasterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(level, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + duration);

    osc.connect(gain);
    gain.connect(this.musicMasterGain);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  private synthXylophoneNote(freq: number, level: number, duration: number): void {
    if (!this.ctx || !this.musicMasterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const harmonic = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    harmonic.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    harmonic.frequency.setValueAtTime(freq * 3.0, now);

    const harmGain = this.ctx.createGain();
    harmGain.gain.setValueAtTime(0.15, now);
    harmGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(level, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + duration);

    osc.connect(gain);
    harmonic.connect(harmGain);
    harmGain.connect(gain);
    gain.connect(this.musicMasterGain);

    osc.start(now);
    harmonic.start(now);
    osc.stop(now + duration + 0.02);
    harmonic.stop(now + duration + 0.02);
  }

  private synthWarmStringPad(chordFreqs: number[], level: number, duration: number): void {
    if (!this.ctx || !this.musicMasterGain) return;
    const now = this.ctx.currentTime;

    chordFreqs.forEach((freq) => {
      if (!this.ctx || !this.musicMasterGain) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(level, now + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicMasterGain);

      osc.start(now);
      osc.stop(now + duration + 0.04);
    });
  }

  private synthWoodblockTick(freq: number, level: number): void {
    if (!this.ctx || !this.musicMasterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.65, now + 0.035);

    gain.gain.setValueAtTime(level, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.04);

    osc.connect(gain);
    gain.connect(this.musicMasterGain);
    osc.start(now);
    osc.stop(now + 0.045);
  }

  private synthSoftShaker(level: number): void {
    if (!this.ctx || !this.musicMasterGain) return;
    const now = this.ctx.currentTime;
    const dur = 0.04;
    const bufferSize = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(5200, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(level, now);
    gain.gain.exponentialRampToValueAtTime(0.0005, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicMasterGain);

    noise.start(now);
    noise.stop(now + dur);
  }

  // =========================================================================
  // 3. UI & CANDY MATCH SOUND EFFECTS (Match 3, Match 4, Match 5+)
  // =========================================================================

  public playButton(): void {
    if (!this.settings.sound || !this.canTriggerSfx('button', 25)) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxMasterGain) return;
    this.vibrate(10);

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(940, now + 0.065);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

    osc.connect(gain);
    gain.connect(this.sfxMasterGain);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playSwap(): void {
    if (!this.settings.sound || !this.canTriggerSfx('swap', 30)) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxMasterGain) return;
    this.vibrate(12);

    const now = ctx.currentTime;
    // Soft candy whoosh + jelly bounce
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.085);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);

    osc.connect(gain);
    gain.connect(this.sfxMasterGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playInvalidSwap(): void {
    if (!this.settings.sound || !this.canTriggerSfx('invalid', 80)) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxMasterGain) return;
    this.vibrate([25, 40, 25]);

    const now = ctx.currentTime;
    // Playful rubbery double-boing
    [240, 175].forEach((freq, i) => {
      if (!this.ctx || !this.sfxMasterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + i * 0.085;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.linearRampToValueAtTime(freq * 0.78, start + 0.08);
      gain.gain.setValueAtTime(0.22, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.09);
      osc.connect(gain);
      gain.connect(this.sfxMasterGain);
      osc.start(start);
      osc.stop(start + 0.095);
    });
  }

  /**
   * Distinct Candy Match SFX for Match 3, Match 4, and Match 5+ with Jelly Pop & Sparkles!
   */
  public playMatch(comboLevel = 1, matchSize = 3): void {
    if (!this.settings.sound || !this.canTriggerSfx('match', 35)) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxMasterGain) return;
    this.vibrate(matchSize >= 5 ? [25, 20, 35] : matchSize === 4 ? [20, 20] : 18);

    const now = ctx.currentTime;
    // Escalate pitch with cascade combo level
    const baseFreq = 440 * Math.pow(1.085, Math.min(comboLevel - 1, 10));

    // 1. Sweet Popping & Satisfying Jelly Bounce Layer
    const popCount = matchSize >= 5 ? 4 : matchSize === 4 ? 3 : 2;
    for (let p = 0; p < popCount; p++) {
      const popOsc = ctx.createOscillator();
      const popGain = ctx.createGain();
      const t = now + p * 0.038;
      const startPitch = (280 + p * 95) * Math.pow(1.05, Math.min(comboLevel - 1, 8));
      popOsc.type = 'sine';
      popOsc.frequency.setValueAtTime(startPitch, t);
      popOsc.frequency.exponentialRampToValueAtTime(startPitch * 2.35, t + 0.055);

      popGain.gain.setValueAtTime(0.24, t);
      popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.065);

      popOsc.connect(popGain);
      popGain.connect(this.sfxMasterGain);
      popOsc.start(t);
      popOsc.stop(t + 0.07);
    }

    // 2. Distinct Harmonic Chime for Match 3 vs Match 4 vs Match 5+
    const intervals =
      matchSize >= 5
        ? [1, 1.25, 1.5, 1.875, 2.0, 2.5] // Grand Major 9th Sparkling Cascade
        : matchSize === 4
        ? [1, 1.25, 1.5, 2.0] // Bright 4-Note Octave Shimmer
        : [1, 1.25, 1.5]; // Classic Sweet Triad

    intervals.forEach((ratio, idx) => {
      if (!this.ctx || !this.sfxMasterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = matchSize >= 4 ? 'triangle' : 'sine';
      const start = now + idx * 0.032;
      const freq = baseFreq * ratio;
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.04, start + 0.16);

      gain.gain.setValueAtTime(0.22, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxMasterGain);
      osc.start(start);
      osc.stop(start + 0.21);
    });

    // 3. Magical High Sparkle Twinkles for Match 4, Match 5+, or High Combos
    if (matchSize >= 4 || comboLevel >= 2) {
      const sparkleCount = matchSize >= 5 ? 5 : 3;
      for (let s = 0; s < sparkleCount; s++) {
        const spOsc = ctx.createOscillator();
        const spGain = ctx.createGain();
        const t = now + 0.06 + s * 0.035;
        const spFreq = 1760 + s * 320;
        spOsc.type = 'sine';
        spOsc.frequency.setValueAtTime(spFreq, t);
        spGain.gain.setValueAtTime(0.11, t);
        spGain.gain.exponentialRampToValueAtTime(0.0008, t + 0.12);
        spOsc.connect(spGain);
        spGain.connect(this.sfxMasterGain);
        spOsc.start(t);
        spOsc.stop(t + 0.13);
      }
    }
  }

  public playSpecialCreated(special: SpecialCandyType): void {
    if (!this.settings.sound || !this.canTriggerSfx('special_create', 40)) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxMasterGain) return;
    this.vibrate([25, 30, 45]);

    const now = ctx.currentTime;
    const notes =
      special === 'color_bomb'
        ? [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98]
        : special === 'wrapped'
        ? [440, 554.37, 659.25, 880, 1108.73]
        : [493.88, 659.25, 880, 1174.66];

    notes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxMasterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const t = now + i * 0.038;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
      osc.connect(gain);
      gain.connect(this.sfxMasterGain);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  public playComboTransform(): void {
    if (!this.settings.sound || !this.canTriggerSfx('combo_transform', 45)) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxMasterGain) return;
    this.vibrate([20, 25, 35]);

    const now = ctx.currentTime;
    const scale = [523.25, 659.25, 783.99, 987.77, 1174.66, 1567.98, 2093.0];
    scale.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxMasterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const t = now + idx * 0.032;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(gain);
      gain.connect(this.sfxMasterGain);
      osc.start(t);
      osc.stop(t + 0.19);
    });
  }

  // =========================================================================
  // 4. SPECIAL BOMB EXPLOSION SOUNDS (Striped, Colour Bomb, Wrapped 1&2, Chain)
  // =========================================================================

  public playExplosion(
    intensity: 'line' | 'wrapped' | 'wrapped_1' | 'wrapped_2' | 'color_bomb' | 'supernova' = 'line'
  ): void {
    if (!this.settings.sound || !this.canTriggerSfx(`exp_${intensity}`, 35)) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxMasterGain) return;
    this.vibrate(
      intensity === 'supernova' || intensity === 'wrapped_2'
        ? [50, 30, 85]
        : intensity === 'color_bomb'
        ? [35, 25, 55]
        : [30, 20, 35]
    );

    const now = ctx.currentTime;
    const duration =
      intensity === 'supernova'
        ? 0.68
        : intensity === 'wrapped_2' || intensity === 'color_bomb'
        ? 0.5
        : intensity === 'wrapped' || intensity === 'wrapped_1'
        ? 0.36
        : 0.32;

    // 1. Textured Sugar-Burst Noise + Swept Resonant Filter
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const startCutoff =
      intensity === 'line'
        ? 1450
        : intensity === 'color_bomb'
        ? 1650
        : intensity === 'wrapped_2'
        ? 580
        : 850;
    filter.frequency.setValueAtTime(startCutoff, now);
    filter.frequency.exponentialRampToValueAtTime(120, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.36, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxMasterGain);
    noise.start(now);
    noise.stop(now + duration);

    // 2. Signature Melodic & Sub-Bass Layers per Special Bomb Type
    if (intensity === 'color_bomb' || intensity === 'supernova') {
      // Magical Rainbow Colour Bomb Explosion: Electric prism chord + sparkling arpeggio
      const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0];
      chord.forEach((freq, idx) => {
        if (!this.ctx || !this.sfxMasterGain) return;
        const osc = this.ctx.createOscillator();
        const oGain = this.ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
        const t = now + idx * 0.026;
        osc.frequency.setValueAtTime(freq * 1.35, t);
        osc.frequency.exponentialRampToValueAtTime(freq, t + 0.3);
        oGain.gain.setValueAtTime(0.14, t);
        oGain.gain.exponentialRampToValueAtTime(0.001, t + 0.36);
        osc.connect(oGain);
        oGain.connect(this.sfxMasterGain);
        osc.start(t);
        osc.stop(t + 0.38);
      });
    } else if (intensity === 'wrapped_1' || intensity === 'wrapped') {
      // Wrapped Candy 1st Explosion: Punchy pop + rising charge whine for 2nd explosion
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'triangle';
      sub.frequency.setValueAtTime(290, now);
      sub.frequency.exponentialRampToValueAtTime(55, now + duration);
      subGain.gain.setValueAtTime(0.38, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      sub.connect(subGain);
      subGain.connect(this.sfxMasterGain);
      sub.start(now);
      sub.stop(now + duration);

      // Charge-up shimmer priming the 2nd blast
      const charge = ctx.createOscillator();
      const chargeGain = ctx.createGain();
      charge.type = 'sine';
      charge.frequency.setValueAtTime(440, now + 0.08);
      charge.frequency.exponentialRampToValueAtTime(1180, now + duration);
      chargeGain.gain.setValueAtTime(0.16, now + 0.08);
      chargeGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      charge.connect(chargeGain);
      chargeGain.connect(this.sfxMasterGain);
      charge.start(now + 0.08);
      charge.stop(now + duration + 0.02);
    } else if (intensity === 'wrapped_2') {
      // Wrapped Candy 2nd Explosion: Massive double-boom + sparkling sugar shower
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'triangle';
      sub.frequency.setValueAtTime(220, now);
      sub.frequency.exponentialRampToValueAtTime(42, now + duration);
      subGain.gain.setValueAtTime(0.45, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      sub.connect(subGain);
      subGain.connect(this.sfxMasterGain);
      sub.start(now);
      sub.stop(now + duration);

      [880, 1174.66, 1396.91, 1760].forEach((freq, i) => {
        if (!this.ctx || !this.sfxMasterGain) return;
        const sp = this.ctx.createOscillator();
        const spG = this.ctx.createGain();
        const t = now + 0.04 + i * 0.03;
        sp.type = 'sine';
        sp.frequency.setValueAtTime(freq, t);
        spG.gain.setValueAtTime(0.18, t);
        spG.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        sp.connect(spG);
        spG.connect(this.sfxMasterGain);
        sp.start(t);
        sp.stop(t + 0.26);
      });
    } else {
      // Powerful Striped Candy Row/Column Laser Blast
      const sweep = ctx.createOscillator();
      const sweepGain = ctx.createGain();
      sweep.type = 'sine';
      sweep.frequency.setValueAtTime(1560, now);
      sweep.frequency.exponentialRampToValueAtTime(210, now + duration);
      sweepGain.gain.setValueAtTime(0.28, now);
      sweepGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      sweep.connect(sweepGain);
      sweepGain.connect(this.sfxMasterGain);
      sweep.start(now);
      sweep.stop(now + duration);
    }
  }

  // =========================================================================
  // 5, 6, 7. VICTORY, GAME OVER, RETRY & DAILY REWARD CELEBRATION JINGLES
  // =========================================================================

  /**
   * Magical Gift Box Opening Sound (Ribbon untie + music-box arpeggio + fairy sparkles)
   */
  public playGiftOpen(): void {
    if (!this.settings.sound) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxMasterGain) return;
    this.vibrate([30, 40, 60]);

    const now = ctx.currentTime;
    const arp = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093.0];
    arp.forEach((freq, i) => {
      if (!this.ctx || !this.sfxMasterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const t = now + i * 0.055;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      osc.connect(gain);
      gain.connect(this.sfxMasterGain);
      osc.start(t);
      osc.stop(t + 0.34);
    });
  }

  /**
   * Coin Collection Sound (Crisp metallic golden coin clinks)
   */
  public playCoinReward(): void {
    if (!this.settings.sound || !this.canTriggerSfx('coin', 35)) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxMasterGain) return;
    this.vibrate(15);

    const now = ctx.currentTime;
    [987.77, 1318.51, 1975.53].forEach((freq, i) => {
      if (!this.ctx || !this.sfxMasterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const t = now + i * 0.06;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
      osc.connect(gain);
      gain.connect(this.sfxMasterGain);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  }

  /**
   * Level Complete Victory Melody & Magical Celebration Jingle
   */
  public playVictory(): void {
    if (!this.settings.sound) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxMasterGain) return;
    this.vibrate([40, 50, 40, 50, 90]);
    this.duckMusicTemporarily(1.2);

    const now = ctx.currentTime;
    const melody = [
      { freq: 523.25, time: 0.0, dur: 0.14 }, // C5
      { freq: 659.25, time: 0.12, dur: 0.14 }, // E5
      { freq: 783.99, time: 0.24, dur: 0.14 }, // G5
      { freq: 1046.5, time: 0.36, dur: 0.22 }, // C6
      { freq: 880.0, time: 0.56, dur: 0.14 }, // A5
      { freq: 987.77, time: 0.7, dur: 0.16 }, // B5
      { freq: 1046.5, time: 0.86, dur: 0.55 }, // C6 Grand Resolve
    ];

    melody.forEach(({ freq, time, dur }) => {
      if (!this.ctx || !this.sfxMasterGain) return;
      const osc = this.ctx.createOscillator();
      const bell = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      bell.type = 'sine';
      const start = now + time;
      osc.frequency.setValueAtTime(freq, start);
      bell.frequency.setValueAtTime(freq * 2, start);

      gain.gain.setValueAtTime(0.28, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

      const bellGain = this.ctx.createGain();
      bellGain.gain.setValueAtTime(0.12, start);

      osc.connect(gain);
      bell.connect(bellGain);
      bellGain.connect(gain);
      gain.connect(this.sfxMasterGain);

      osc.start(start);
      bell.start(start);
      osc.stop(start + dur + 0.02);
      bell.stop(start + dur + 0.02);
    });
  }

  /**
   * Soft, Playful Game Over Jingle
   */
  public playGameOver(): void {
    if (!this.settings.sound) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxMasterGain) return;
    this.vibrate([60, 50, 80]);
    this.duckMusicTemporarily(1.0);

    const now = ctx.currentTime;
    const notes = [
      { freq: 523.25, time: 0.0, dur: 0.18 }, // C5
      { freq: 493.88, time: 0.16, dur: 0.18 }, // B4
      { freq: 440.0, time: 0.32, dur: 0.18 }, // A4
      { freq: 392.0, time: 0.48, dur: 0.45 }, // G4 Soft Resolve
    ];

    notes.forEach(({ freq, time, dur }) => {
      if (!this.ctx || !this.sfxMasterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const start = now + time;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.22, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(gain);
      gain.connect(this.sfxMasterGain);
      osc.start(start);
      osc.stop(start + dur + 0.02);
    });
  }

  /**
   * Friendly Encouraging Retry Jingle
   */
  public playRetry(): void {
    if (!this.settings.sound) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.sfxMasterGain) return;
    this.vibrate(20);

    const now = ctx.currentTime;
    [392.0, 523.25, 659.25, 783.99].forEach((freq, idx) => {
      if (!this.ctx || !this.sfxMasterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const start = now + idx * 0.055;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.24, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
      osc.connect(gain);
      gain.connect(this.sfxMasterGain);
      osc.start(start);
      osc.stop(start + 0.24);
    });
  }
}

export const soundManager = new SoundManager();
