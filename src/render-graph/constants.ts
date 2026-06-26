import type { AOParams, BloomParams } from './types';

export const DEFAULT_AO_PARAMS: AOParams = {
  resolutionScale: 0.5,
  scale: 0.5,
  radius: 0.1,
  samples: 8,
  thickness: 1.0,
  distanceFallOff: 1.0,
  distanceExponent: 1.0,
  useTemporalFiltering: true,
};

export const DEFAULT_BLOOM_PARAMS: BloomParams = {
  radius: 0,
  strength: 0.3,
  threshold: 0.
};