import type { LightBase, LightTypes, ReactAreaParams, SpotLightParams } from './types.ts';

export function isReactAreaLight(light: LightBase<LightTypes>): light is ReactAreaParams {
  return light.type === 'react-area';
}

export function isSpotLight(light: LightBase<LightTypes>): light is SpotLightParams {
  return light.type === 'spot';
}