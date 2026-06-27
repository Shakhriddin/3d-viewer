import { float, Fn, min, normalize, positionWorld, vec3 } from 'three/tsl';
import type { Node, } from 'three/webgpu';
import type { LightBase, LightTypes, ReactAreaParams, SpotLightParams } from './types.ts';

export function isReactAreaLight(light: LightBase<LightTypes>): light is ReactAreaParams {
  return light.type === 'react-area';
}

export function isSpotLight(light: LightBase<LightTypes>): light is SpotLightParams {
  return light.type === 'spot';
}

export const parallaxCorrectFn = Fn(([dir, cubeSize, cubePos]: [dir: Node<'vec3'>, cubeSize: Node<'vec3'>, cubePos: Node<'vec3'>]) => {
  const nDir: any = normalize(dir).toVar();

  const cubePosition = vec3(cubePos.x, cubeSize.y.mul(0.5), cubePos.z).toVar();

  const rbmax = cubeSize.mul(0.5).add(cubePosition).sub(positionWorld).div(nDir).toVar();
  const rbmin = cubeSize.mul(-0.5).add(cubePosition).sub(positionWorld).div(nDir).toVar();

  const rbminmax: any = vec3(0, 0, 0).toVar();
  rbminmax.x = nDir.x.greaterThan(float(0)).select(rbmax.x, rbmin.x);
  rbminmax.y = nDir.y.greaterThan(float(0)).select(rbmax.y, rbmin.y);
  rbminmax.z = nDir.z.greaterThan(float(0)).select(rbmax.z, rbmin.z);

  const correction = min(rbminmax.x, rbminmax.y, rbminmax.z).toVar();
  const boxIntersection = positionWorld.add(nDir.mul(correction)).toVar();

  return boxIntersection.sub(cubePos);
});