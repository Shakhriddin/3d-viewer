import type { AdaptiveResolutionOptions } from './AdaptiveResolution.ts';

export const MAX_PIXEL_RATIO = 2;
export const MIN_PIXEL_RATIO = 1.5;

export const ADAPTIVE_RESOLUTION: AdaptiveResolutionOptions = {
  targetFps: 30,
  minFps: 30,
  minPixelRatio: 1,
  maxPixelRatio: 1,
  step: 0.1,
  cooldownMs: 600,
  emergencyCooldownMs: 150,
  sampleSize: 30,
  hysteresis: 0.1,
};
