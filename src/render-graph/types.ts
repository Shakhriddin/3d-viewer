export type AOParams = {
  resolutionScale: number;
  scale: number;
  radius: number;
  thickness: number;
  distanceFallOff: number;
  distanceExponent: number;
  useTemporalFiltering: boolean;
  samples: number;
}

export type BloomParams = {
  strength: number;
  radius: number;
  threshold: number;
}

export type PassOptions = {
  ao?: AOParams;
  bloom?: BloomParams
}