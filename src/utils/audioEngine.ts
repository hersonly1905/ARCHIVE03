/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private primaryGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  
  // Oscillators and modulators for the ambient pad
  private padOscs: OscillatorNode[] = [];
  private padGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  
  private isMuted: boolean = false;
  private chordInterval: any = null;
  private arpeggiatorInterval: any = null;
  private currentMood: 'fresh' | 'comfort' | 'intense' | 'poem' | 'loading' = 'loading';
  private isYoutubeActive: boolean = false;

  constructor() {
    // Lazy initialisation happens on first user interaction to comply with browser safety
  }

  public init() {
    if (this.ctx) return;

    try {
      // @ts-ignore
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
      
      // Main chain Setup
      this.primaryGain = this.ctx.createGain();
      this.primaryGain.gain.setValueAtTime(0.25, this.ctx.currentTime); // Gentle master volume

      // Analyser for sound visualization
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;

      // Echo / Delay feedback network
      this.delayNode = this.ctx.createDelay(1.0);
      this.delayNode.delayTime.setValueAtTime(0.4, this.ctx.currentTime); // 400ms echo
      this.delayGain = this.ctx.createGain();
      this.delayGain.gain.setValueAtTime(0.35, this.ctx.currentTime); // soft feedback

      // Feedback routing
      this.delayNode.connect(this.delayGain);
      this.delayGain.connect(this.delayNode);

      // Lowpass Filter for analog warmth
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(800, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(2.0, this.ctx.currentTime);

      // Pad gain
      this.padGain = this.ctx.createGain();
      this.padGain.gain.setValueAtTime(0.15, this.ctx.currentTime);

      // Connections: Synth Nodes -> Filter -> PadGain -> Main Output / Delay
      this.padGain.connect(this.primaryGain);
      this.filterNode.connect(this.padGain);

      // Delay input connects from the filter
      this.filterNode.connect(this.delayNode);
      this.delayNode.connect(this.primaryGain);

      // Connect master gain to analyzer and dest
      this.primaryGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // Start beautiful subtle LFO modulating the filter frequency for warmth
      this.lfo = this.ctx.createOscillator();
      this.lfo.type = 'sine';
      this.lfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // ultra slow drift
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(150, this.ctx.currentTime); // +/- 150Hz
      
      this.lfo.connect(lfoGain);
      lfoGain.connect(this.filterNode.frequency);
      this.lfo.start();

      // Start playing background thread
      this.startAmbientEngine();
    } catch (e) {
      console.warn("AudioContext failed to initialize:", e);
    }
  }

  public getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.updateGain();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app-audio-mute-changed', { detail: this.isMuted }));
    }
    return this.isMuted;
  }

  public getMutedState(): boolean {
    return this.isMuted;
  }

  public setYoutubeActive(active: boolean) {
    this.isYoutubeActive = active;
    this.updateGain();
  }

  public getYoutubeActive(): boolean {
    return this.isYoutubeActive;
  }

  private updateGain() {
    if (this.primaryGain && this.ctx) {
      const targetGain = (this.isMuted || this.isYoutubeActive) ? 0 : 0.25;
      this.primaryGain.gain.exponentialRampToValueAtTime(Math.max(targetGain, 0.0001), this.ctx.currentTime + 0.3);
    }
  }

  private startAmbientEngine() {
    this.setMood('fresh');
  }

  // Play a soft bell synth note for arpeggios
  public playSparkleNote(freq: number, duration: number = 2.0) {
    if (!this.ctx || this.isMuted || this.isYoutubeActive) return;

    try {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gainNode);
      if (this.filterNode) {
        gainNode.connect(this.filterNode);
      } else if (this.primaryGain) {
        gainNode.connect(this.primaryGain);
      }

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (err) {
      // safe bypass
    }
  }

  public setMood(mood: 'fresh' | 'comfort' | 'intense' | 'poem' | 'loading') {
    this.currentMood = mood;
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    // Clear existing chord/arp schedulers
    if (this.chordInterval) clearInterval(this.chordInterval);
    if (this.arpeggiatorInterval) clearInterval(this.arpeggiatorInterval);

    // Fade out active pad oscillators
    this.clearPadOscillators();

    const now = this.ctx.currentTime;
    
    // Choose filters and tempos depending on the relationship chapter
    if (this.filterNode) {
      if (mood === 'fresh') {
        this.filterNode.frequency.exponentialRampToValueAtTime(750, now + 1.5);
        this.filterNode.Q.setValueAtTime(1.5, now);
      } else if (mood === 'comfort') {
        this.filterNode.frequency.exponentialRampToValueAtTime(550, now + 1.5);
        this.filterNode.Q.setValueAtTime(3.0, now);
      } else if (mood === 'intense') {
        this.filterNode.frequency.exponentialRampToValueAtTime(1100, now + 2.0);
        this.filterNode.Q.setValueAtTime(4.0, now);
      } else { // poem / loading
        this.filterNode.frequency.exponentialRampToValueAtTime(400, now + 1.0);
        this.filterNode.Q.setValueAtTime(1.0, now);
      }
    }

    // Harmonic Chord Structures mimicking the romantic flow
    let chords: number[][]; // notes in Hz
    let arpeggioPattern: number[];

    switch (mood) {
      case 'fresh': // Rang Jo Laggeyo Vibe: Bright, cheerful, tender (Cmaj9 - Fmaj7 - G6)
        chords = [
          [130.81, 196.00, 261.63, 311.13, 392.00], // Cmaj7 structure
          [174.61, 261.63, 349.23, 440.00, 523.25], // Fmaj7 structure
          [196.00, 293.66, 392.00, 493.88, 587.33]  // G6 structure
        ];
        arpeggioPattern = [261.63, 311.13, 392.00, 523.25, 587.33, 783.99];
        break;

      case 'comfort': // Jeene Laga Hoon Vibe: Cozy, harmonic progression of growing closer
        chords = [
          [146.83, 220.00, 293.66, 349.23, 440.00], // Dm7 cozy
          [196.00, 293.66, 392.00, 493.88, 587.33], // G7 warm
          [130.81, 196.00, 261.63, 329.63, 392.00]  // Cmaj7 comfort
        ];
        arpeggioPattern = [293.66, 349.23, 440.00, 493.88, 587.33, 659.25];
        break;

      case 'intense': // Janam Janam Vibe: Deep devotion minor-major orchestral swell
        chords = [
          [110.00, 165.00, 220.00, 277.18, 329.63], // Am dramatic
          [174.61, 261.63, 349.23, 415.30, 523.25], // Fmaj7 tension
          [130.81, 196.00, 261.63, 329.63, 392.00], // C epic resolve
          [164.81, 246.94, 329.63, 415.30, 493.88]  // E7 intense
        ];
        arpeggioPattern = [220.00, 277.18, 329.63, 415.30, 523.25, 659.25];
        break;

      case 'poem': // Be Intehaan Vibe: Whispering dream textures, warm soft clouds
      default:
        chords = [
          [116.54, 174.61, 233.08, 293.66, 349.23], // Bbmaj7 clouds
          [130.81, 196.00, 261.63, 329.63, 392.00]  // Cmaj7 cloud resolve
        ];
        arpeggioPattern = [233.08, 293.66, 349.23, 392.00, 523.25];
        break;
    }

    // Cycle through chords
    let chordIdx = 0;
    const playChordCycle = () => {
      this.clearPadOscillators();
      const chord = chords[chordIdx];
      
      chord.forEach((freq) => {
        this.startPadOscillator(freq);
      });

      chordIdx = (chordIdx + 1) % chords.length;
    };

    // Trigger first cycle instantly
    playChordCycle();
    this.chordInterval = setInterval(playChordCycle, 6000); // Change chords every 6 seconds

    // Arpeggiator cycle - triggers sparkling high-notes in steps
    let arpIdx = 0;
    const playArpStep = () => {
      if (Math.random() > 0.3) {
        // Sparkle random note from pattern with variable octave
        const baseNote = arpeggioPattern[arpIdx % arpeggioPattern.length];
        const octMultiplier = Math.random() > 0.7 ? 2.0 : 1.0;
        this.playSparkleNote(baseNote * octMultiplier, 2.5);
      }
      arpIdx++;
    };

    this.arpeggiatorInterval = setInterval(playArpStep, mood === 'intense' ? 600 : 1200);
  }

  private startPadOscillator(freq: number) {
    if (!this.ctx || !this.filterNode) return;

    try {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      // Soft detuned custom mixture to sound very warm and analogue analog-synthesizer-like
      osc.type = Math.random() > 0.5 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      // Detune slightly for lush thickness
      osc.detune.setValueAtTime((Math.random() - 0.5) * 15, this.ctx.currentTime);

      // Soft attack curve to prevent pops
      oscGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      oscGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 1.5);

      osc.connect(oscGain);
      oscGain.connect(this.filterNode);
      osc.start();

      this.padOscs.push(osc);
    } catch (err) {
      // safe bypass
    }
  }

  private clearPadOscillators() {
    this.padOscs.forEach(o => {
      try {
        o.stop(this.ctx!.currentTime + 1.0); // Fade-out period
      } catch (e) {}
    });
    this.padOscs = [];
  }

  // Safe release of everything
  public destroy() {
    if (this.chordInterval) clearInterval(this.chordInterval);
    if (this.arpeggiatorInterval) clearInterval(this.arpeggiatorInterval);
    this.clearPadOscillators();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

// Global active instance
export const audioController = new AudioEngine();
