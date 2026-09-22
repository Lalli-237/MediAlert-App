/**
 * Web Audio API synthesized medical alarm chime & sound effects
 * Completely offline capable - zero external audio files needed
 */

class MedicalAudioAlarmService {
  private ctx: AudioContext | null = null;
  private intervalId: number | null = null;
  private isAlarmPlaying: boolean = false;
  private volume: number = 0.8;

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Plays a single melodic medical alarm chime sequence
   */
  private playChimeBurst() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (clear clinical chime)

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        // Gentle envelope to sound like an acoustic hospital/digital medical pager
        gain.gain.setValueAtTime(0.0001, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.35 * this.volume, now + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.4);
      });
    } catch (e) {
      console.warn('Audio alarm playback error:', e);
    }
  }

  /**
   * Starts a continuous alarm pattern repeating every 1.8 seconds
   */
  public startAlarm(volume?: number) {
    if (volume !== undefined) {
      this.setVolume(volume);
    }

    // Force context resume on user action
    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
    } catch {
      // ignore
    }

    if (this.isAlarmPlaying) return;
    this.isAlarmPlaying = true;

    // First burst immediate
    this.playChimeBurst();

    // Repeat every 1.8s
    this.intervalId = window.setInterval(() => {
      if (this.isAlarmPlaying) {
        this.playChimeBurst();
      }
    }, 1800);
  }

  /**
   * Loud single burst buzzer test for senior diagnostic check
   */
  public testBuzzerSound(volume: number = 0.9): void {
    try {
      this.setVolume(volume);
      const ctx = this.getContext();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      this.playChimeBurst();
    } catch (e) {
      console.warn('Test buzzer playback failed:', e);
    }
  }

  public stopAlarm() {
    this.isAlarmPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public isPlaying(): boolean {
    return this.isAlarmPlaying;
  }

  /**
   * Positive celebration chime when dose is logged
   */
  public playDoseTakenSound() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const chord = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5 major chord

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.25 * this.volume, now + idx * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.6);
      });
    } catch {
      // ignore
    }
  }

  /**
   * Subdued double-beep for snooze action
   */
  public playSnoozeSound() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      [0, 0.15].forEach(offset => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now + offset);

        gain.gain.setValueAtTime(0.15 * this.volume, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.12);
      });
    } catch {
      // ignore
    }
  }
}

export const audioAlarm = new MedicalAudioAlarmService();
