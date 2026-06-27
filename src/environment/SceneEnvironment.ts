import {
  CubeCamera, CubeReflectionMapping, CubeRenderTarget,
  HalfFloatType, Light, LinearFilter, LinearMipmapLinearFilter, RectAreaLight, RectAreaLightNode, Scene, SpotLight,
  WebGPURenderer,
} from 'three/webgpu';
import { RectAreaLightTexturesLib } from 'three/examples/jsm/lights/RectAreaLightTexturesLib.js';
import { isReactAreaLight, isSpotLight } from './utils';
import { DEFAULT_CUBE_CAMERA } from './constants.ts';
import type { CubeCameraParams, LightBase, LightTypes } from './types';

RectAreaLightNode.setLTC(RectAreaLightTexturesLib.init());

export class SceneEnvironment {
  private createdLights: Light[] = [];
  private scene: Scene;
  public cubeRenderTarget?: CubeRenderTarget;
  public cubeCamera?: CubeCamera;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  createLight(light: LightBase<LightTypes>) {
    if (isReactAreaLight(light)) {
      const rectAreaLight = new RectAreaLight(light.color, light.intensity, light.width, light.height);
      rectAreaLight.position.copy(light.position);

      if (light.target) {
        rectAreaLight.lookAt(light.target.x, light.target.y, light.target.z);
      }

      this.scene.add(rectAreaLight);
      this.createdLights.push(rectAreaLight);
    }

    if (isSpotLight(light)) {
      const spotLight = new SpotLight(light.color, light.intensity, light.distance, light.angle, light.penumbra, light.decay);
      spotLight.position.copy(light.position);

      if (light.shadowParams) {
        spotLight.castShadow = light.shadowParams.receiveShadow ?? false;
        spotLight.receiveShadow = light.shadowParams.receiveShadow ?? false;
        spotLight.shadow.mapSize.width = light.shadowParams.width;
        spotLight.shadow.mapSize.height = light.shadowParams.height;
        spotLight.shadow.bias = light.shadowParams.bias ?? 0;
        spotLight.shadow.normalBias = light.shadowParams.normalBias ?? 0;
      }

      if (light.target) {
        spotLight.target.position.copy(light.target);
        this.scene.add(spotLight.target);
      }

      this.scene.add(spotLight);
      this.createdLights.push(spotLight);
    }
  }

  removeCreatedLights() {
    this.createdLights.forEach((light) => {
      this.scene.remove((light as SpotLight).target);
      this.scene.remove(light);
      light.dispose();
    });

    this.createdLights = [];
  }

  get cubeTexture() {
    return this.cubeRenderTarget?.texture;
  }

  public createCubeCamera(options: Partial<CubeCameraParams> = {}) {
    const near = options.resolution ?? DEFAULT_CUBE_CAMERA.near;
    const far = options.resolution ?? DEFAULT_CUBE_CAMERA.far;
    const resolution = options.resolution ?? DEFAULT_CUBE_CAMERA.resolution;

    this.cubeRenderTarget = new CubeRenderTarget(resolution, {
      type: HalfFloatType,
      minFilter: LinearMipmapLinearFilter,
      magFilter: LinearFilter,
      mapping: CubeReflectionMapping,
      generateMipmaps: true
    });

    this.cubeCamera = new CubeCamera(near, far, this.cubeRenderTarget);

    if (options.position) {
      this.cubeCamera.position.copy(options.position);
    }

    this.scene.environment = this.cubeRenderTarget.texture;
  }

  public updateCubeCamera(renderer: WebGPURenderer) {
    if (this.cubeCamera) {
      this.cubeCamera.update(renderer, this.scene);
    }
  }
}