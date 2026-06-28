import {
  PassNode,
  PerspectiveCamera,
  RenderPipeline,
  SampleNode,
  Scene,
  TextureNode,
  UnsignedByteType,
  WebGPURenderer
} from 'three/webgpu';
import {
  builtinAOContext,
  emissive,
  mrt,
  normalView,
  packNormalToRGB,
  pass,
  sample,
  screenUV,
  unpackRGBToNormal,
  velocity
} from 'three/tsl';
import TRAANode, { traa } from 'three/examples/jsm/tsl/display/TRAANode.js';
import GTAONode, { ao } from 'three/examples/jsm/tsl/display/GTAONode.js';
import BloomNode, { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';
import { DEFAULT_AO_PARAMS, DEFAULT_BLOOM_PARAMS } from './constants.ts';
import type { PassOptions } from './types.ts';

export class RenderGraph {
  private renderPipeline: RenderPipeline;
  private prePass: PassNode;
  private scenePass: PassNode;
  private aoPass: GTAONode;
  private traaPass: TRAANode;
  private bloomPass: BloomNode;
  private camera: PerspectiveCamera;
  private scene: Scene;

  constructor(renderer: WebGPURenderer, scene: Scene, camera: PerspectiveCamera, options?: PassOptions) {
    this.camera = camera;
    this.scene = scene;
    this.renderPipeline = new RenderPipeline(renderer);

    const { passDepth, passEmissive, passNormal, passVelocity, prePass } = this.buildPrePass();
    this.prePass = prePass;
    this.prePass.name = 'Pre-Pass';

    this.scenePass = pass(this.scene, this.camera);
    const scenePassColor = this.scenePass.getTextureNode();

    this.aoPass = this.buildAOPass(passDepth, passNormal, options?.ao);
    const aoPassColor = this.aoPass.getTextureNode().sample(screenUV).r;
    this.scenePass.contextNode = builtinAOContext(aoPassColor);

    this.bloomPass = this.buildBloomPass(passEmissive, options?.bloom);
    const outputNode = scenePassColor.add(this.bloomPass);

    this.traaPass = traa(outputNode, passDepth, passVelocity, camera);
    this.traaPass.useSubpixelCorrection = false;

    this.renderPipeline.outputNode = this.traaPass;
  }

  public render() {
    this.renderPipeline.render();
  }

  private buildPrePass() {
    const prePass = pass(this.scene, this.camera);
    prePass.transparent = false;

    prePass.setMRT(mrt({
      output: packNormalToRGB(normalView),
      emissive,
      velocity,
    }));

    const passNormal = sample((uv) => {
      return unpackRGBToNormal(prePass.getTextureNode().sample(uv));
    });

    const passDepth = prePass.getTextureNode('depth');
    const passEmissive = prePass.getTextureNode('emissive');
    const passVelocity = prePass.getTextureNode('velocity');

    prePass.getTexture('output').type = UnsignedByteType;
    prePass.getTexture('emissive').type = UnsignedByteType;

    return {
      prePass,
      passDepth,
      passEmissive,
      passNormal,
      passVelocity,
    };
  }

  private buildAOPass(depth: TextureNode, normal: SampleNode<'vec3'>, aoParams = DEFAULT_AO_PARAMS) {
    const aoPass = ao(depth, normal, this.camera);
    aoPass.resolutionScale = aoParams.resolutionScale;
    aoPass.scale.value = aoParams.scale;
    aoPass.radius.value = aoParams.radius;
    aoPass.samples.value = aoParams.samples;
    aoPass.thickness.value = aoParams.thickness;
    aoPass.distanceFallOff.value = aoParams.distanceFallOff;
    aoPass.distanceExponent.value = aoParams.distanceExponent;
    aoPass.useTemporalFiltering = aoParams.useTemporalFiltering;
    aoPass.name = 'AOPass';

    return aoPass;
  }

  private buildBloomPass(emissive: TextureNode, bloomParams = DEFAULT_BLOOM_PARAMS) {
    const bloomPass = bloom(emissive, bloomParams.strength, bloomParams.radius, bloomParams.threshold);
    bloomPass.name = 'BloomPass';

    return bloomPass;
  }
}