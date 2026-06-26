import type { WebGPURenderer } from 'three/webgpu';
import type { WebGLRenderer } from 'three';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

const PATH = 'https://d2o6dud95v10sk.cloudfront.net/transcoder/gzip/';

export class GLBLoader extends GLTFLoader {
  workersCount: number = 3;

  constructor(renderer: WebGPURenderer | WebGLRenderer) {
    super();

    this.setMeshoptDecoder(MeshoptDecoder);

    const ktxLoader = new KTX2Loader();
    ktxLoader.detectSupport(renderer);
    ktxLoader.setWorkerLimit(this.workersCount);
    ktxLoader.setTranscoderPath(PATH);
    this.setKTX2Loader(ktxLoader);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(PATH);
    dracoLoader.setWorkerLimit(this.workersCount);
    this.setDRACOLoader(dracoLoader);
  }


  dispose(): void {
    this.ktx2Loader?.dispose();
    this.dracoLoader?.dispose();

    this.meshoptDecoder = null;
    this.ktx2Loader = null;
    this.dracoLoader = null;
  }
}