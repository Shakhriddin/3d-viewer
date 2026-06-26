import type { ColorRepresentation, Vector3Like } from 'three/webgpu';

type ShadowMapParams = {
  width: number;
  height: number;
  bias?: number;
  normalBias?: number;
  intensity?: number;
}

export type LightTypes = 'react-area' | 'spot';

export type LightBase<T extends LightTypes> = {
  type: T;
  position: Vector3Like;
  target?: Vector3Like;
  intensity?: number;
  color?: ColorRepresentation;
  castShadow?: boolean;
  receiveShadow?: boolean;
  shadowMap?: ShadowMapParams;
}

export type ReactAreaParams = LightBase<'react-area'> & {
  width: number;
  height: number;
}

export type SpotLightParams = LightBase<'spot'> & {
  angle: number;
  decay: number;
  distance: number;
  penumbra: number;
}