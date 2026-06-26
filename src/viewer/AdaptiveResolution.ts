import type { WebGPURenderer } from 'three/webgpu';
import { ADAPTIVE_RESOLUTION } from '@/viewer/constants.ts';

export type AdaptiveResolutionOptions = {
  targetFps: number;
  minFps: number;
  minPixelRatio: number;
  maxPixelRatio: number;
  step: number;
  cooldownMs: number;
  emergencyCooldownMs: number;
  sampleSize: number;
  hysteresis: number;
}

export class AdaptiveResolution {
  private renderer: WebGPURenderer;
  private enabled = true;

  private readonly targetMs: number;
  private readonly floorMs: number;
  private readonly step: number;
  private readonly cooldownMs: number;
  private readonly emergencyCooldownMs: number;
  private readonly sampleSize: number;
  private readonly hysteresis: number;

  private minPixelRatio: number;
  private maxPixelRatio: number;
  private pixelRatio: number;

  private samples: number[] = [];
  private sampleSum = 0;
  private lastTime = 0;
  private lastChange = 0;

  constructor(renderer: WebGPURenderer, options: Partial<AdaptiveResolutionOptions> = {}) {
    this.renderer = renderer;

    this.targetMs = 1000 / (options.targetFps ?? ADAPTIVE_RESOLUTION.targetFps);
    this.floorMs = 1000 / (options.minFps ?? ADAPTIVE_RESOLUTION.minFps);
    this.maxPixelRatio = options.maxPixelRatio ?? ADAPTIVE_RESOLUTION.maxPixelRatio;
    this.minPixelRatio = Math.min(options.minPixelRatio ?? ADAPTIVE_RESOLUTION.minPixelRatio, this.maxPixelRatio);
    this.step = options.step ?? ADAPTIVE_RESOLUTION.step;
    this.cooldownMs = options.cooldownMs ?? ADAPTIVE_RESOLUTION.cooldownMs;
    this.emergencyCooldownMs = options.emergencyCooldownMs ?? ADAPTIVE_RESOLUTION.emergencyCooldownMs;
    this.sampleSize = options.sampleSize ?? ADAPTIVE_RESOLUTION.sampleSize;
    this.hysteresis = options.hysteresis ?? ADAPTIVE_RESOLUTION.hysteresis;

    this.pixelRatio = this.maxPixelRatio;
    this.apply();
  }

  get currentPixelRatio(): number {
    return this.pixelRatio;
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(value: boolean): void {
    if (this.enabled === value) {
      return;
    }

    this.enabled = value;
    this.reset();

    if (!value) {
      this.pixelRatio = this.maxPixelRatio;
      this.apply();
    }
  }

  /** Re-clamp the ceiling when the active display changes (call on resize). */
  setMaxPixelRatio(value: number): void {
    this.maxPixelRatio = value;
    this.minPixelRatio = Math.min(this.minPixelRatio, value);
    this.pixelRatio = clamp(this.pixelRatio, this.minPixelRatio, this.maxPixelRatio);
    this.apply();
  }

  /** Call once per frame, after rendering. */
  update(): void {
    const now = performance.now();
    const last = this.lastTime;
    this.lastTime = now;

    if (!this.enabled || last === 0) {
      return;
    }

    const frameMs = now - last;

    if (frameMs > 100) {
      this.reset();

      return;
    }

    this.samples.push(frameMs);
    this.sampleSum += frameMs;
    if (this.samples.length > this.sampleSize) {
      this.sampleSum -= this.samples.shift()!;
    }

    if (
      frameMs > this.floorMs &&
      this.pixelRatio > this.minPixelRatio &&
      now - this.lastChange > this.emergencyCooldownMs
    ) {
      this.adjust(-this.step, now);
      return;
    }

    if (this.samples.length < this.sampleSize) {
      return;
    }

    if (now - this.lastChange < this.cooldownMs) {
      return;
    }

    const average = this.sampleSum / this.samples.length;
    const upper = this.targetMs * (1 + this.hysteresis);
    const lower = this.targetMs * (1 - this.hysteresis);

    if (average > upper && this.pixelRatio > this.minPixelRatio) {
      this.adjust(-this.step, now);
    } else if (average < lower && this.pixelRatio < this.maxPixelRatio) {
      this.adjust(+this.step, now);
    }
  }

  private adjust(delta: number, now: number): void {
    const next = clamp(round2(this.pixelRatio + delta), this.minPixelRatio, this.maxPixelRatio);
    if (next === this.pixelRatio) {
      return;
    }

    this.pixelRatio = next;
    this.lastChange = now;
    this.reset();
    this.apply();
  }

  private apply(): void {
    this.renderer.setPixelRatio(this.pixelRatio);
  }

  private reset(): void {
    this.samples.length = 0;
    this.sampleSum = 0;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
