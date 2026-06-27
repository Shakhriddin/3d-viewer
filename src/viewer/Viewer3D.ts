import {
  AgXToneMapping,
  EventDispatcher,
  Material,
  Mesh,
  PerspectiveCamera,
  Raycaster,
  Scene,
  SRGBColorSpace,
  Timer,
  WebGPURenderer
} from 'three/webgpu';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { acceleratedRaycast, CENTER, MeshBVH } from 'three-mesh-bvh';
import { ViewerControls } from '@/controls';
import { SceneEnvironment } from '@/environment';
import { GLBLoader } from '@/loaders';
import { RenderGraph } from '@/render-graph';
import { AdaptiveResolution } from './AdaptiveResolution.ts';
import { getDevicePixelRatio } from './utils.ts';
import { ADAPTIVE_RESOLUTION, MAX_PIXEL_RATIO, MIN_PIXEL_RATIO } from './constants.ts';
import type { CanvasSize } from './types.ts';

Mesh.prototype.raycast = acceleratedRaycast;
Raycaster.prototype.firstHitOnly = true;

export type Viewer3DOptions = {
  canvas: HTMLCanvasElement;
  enablePostProcessing?: boolean;
  showFPS?: boolean;
}

export class Viewer3D extends EventDispatcher {
  private options: Viewer3DOptions;
  public renderer!: WebGPURenderer;
  public scene!: Scene;
  public camera!: PerspectiveCamera;
  public controls!: ViewerControls;
  public loader!: GLBLoader;
  public timer: Timer;
  public sceneEnvironment!: SceneEnvironment;
  public stats?: Stats;
  public renderGraph!: RenderGraph;
  public adaptiveResolution!: AdaptiveResolution;
  public enablePostProcessing: boolean = true;

  constructor(options: Viewer3DOptions) {
    super();

    this.options = options;
    this.timer = new Timer();
  }

  public async init(): Promise<void> {
    // Canvas client size
    const size = this.getCanvasSize();

    // Camera
    this.camera = new PerspectiveCamera(55, size.width / size.height, 0.1, 100);

    // Viewer Controls
    this.controls = new ViewerControls(this.camera, this.options.canvas);

    // Scene
    this.scene = new Scene();

    // Lights
    this.sceneEnvironment = new SceneEnvironment(this.scene);

    // Renderer
    this.renderer = new WebGPURenderer({ canvas: this.options.canvas, antialias: false });
    this.renderer.autoClear = true;
    this.renderer.shadowMap.enabled = true;
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.renderer.toneMapping = AgXToneMapping;

    this.adaptiveResolution = new AdaptiveResolution(this.renderer, {
      ...ADAPTIVE_RESOLUTION,
      minPixelRatio: Math.min(getDevicePixelRatio(), MIN_PIXEL_RATIO),
      maxPixelRatio: Math.min(getDevicePixelRatio(), MAX_PIXEL_RATIO),
    });

    this.renderer.setAnimationLoop(this.animate.bind(this));
    this.resize(size);

    await this.renderer.init();

    // Render Graph
    this.renderGraph = new RenderGraph(this.renderer, this.scene, this.camera);

    // Loader
    this.loader = new GLBLoader(this.renderer);

    if (this.options.enablePostProcessing !== undefined) {
      this.enablePostProcessing = this.options.enablePostProcessing;
    }

    if (this.options.showFPS) {
      this.stats = new Stats();
      this.stats.dom.style.userSelect = 'none';
      this.options.canvas.parentElement?.append(this.stats.dom);
    }
  }

  public async loadModel(url: string) {
    try {
      const gltf = await this.loader.loadAsync(url);
      gltf.scene.traverse((node) => {
        const mesh = node as Mesh;
        const material = mesh.material as Material;

        if (mesh.isMesh) {
          mesh.castShadow = !material.transparent;
          mesh.receiveShadow = true;

          mesh.geometry.boundsTree = new MeshBVH(mesh.geometry, {
            strategy: CENTER,
            maxLeafSize: 1,
            maxDepth: 40,
            setBoundingBox: true,
          });
          this.controls.addColliderMeshes(mesh);
        }
      });

      this.scene.add(gltf.scene);

      return gltf;
    } catch (error) {
      console.error(error);
    }
  }

  public resize({ width, height }: CanvasSize) {
    this.adaptiveResolution.setMaxPixelRatio(Math.min(getDevicePixelRatio(), MAX_PIXEL_RATIO));
    this.renderer.setSize(width, height);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }


  private animate() {
    this.stats?.begin();
    this.timer.update();

    // update controls
    this.controls.update(this.timer.getDelta());
    this.adaptiveResolution.update();

    // render scene
    if (this.enablePostProcessing) {
      this.renderGraph.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }

    this.stats?.end();
  }

  private getCanvasSize(): CanvasSize {
    const width = this.options.canvas.clientWidth;
    const height = this.options.canvas.clientHeight;

    return { width, height };
  }
}