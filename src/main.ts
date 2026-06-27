import './style.css';
import { type BufferGeometry, type Mesh, type MeshPhysicalMaterial, Vector3 } from 'three/webgpu';
import { type LightBase, type LightTypes, parallaxCorrectFn } from '@/environment';
import { pmremTexture, reflectVector } from 'three/tsl';
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { Viewer3D } from '@/viewer';
import { sceneConfig } from './scene-config.ts';

// Meshes with incorrect faced normals, remove it after 3D model fix
const brokenNormals = ['mesh_0', 'mesh_0_4', 'mesh_0_5', 'mesh_0_6', 'mesh_0_7', 'mesh_0_9', 'mesh_0_14', 'mesh_0_16', 'mesh_0_17', 'mesh_0_55', 'mesh_0_27', 'mesh_0_49', 'mesh_0_21', 'mesh_0_34'];

const modelURL = '/bathroom.glb';
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const viewer3D = new Viewer3D({ canvas, enablePostProcessing: true, showFPS: true });
await viewer3D.init();

// Scene Config
const { camera, lights, cubeCamera } = sceneConfig;

viewer3D.controls.setLookAt(
  camera.position.x, camera.position.y, camera.position.z,
  camera.target.x, camera.target.y, camera.target.z,
  false,
);

lights.forEach((light) => {
  viewer3D.sceneEnvironment.createLight(light as LightBase<LightTypes>);
});

const cubePosition = new Vector3().copy(cubeCamera.position);
const cubeSize = new Vector3().copy(cubeCamera.size);

viewer3D.sceneEnvironment.createCubeCamera(cubeCamera);

// Load 3D Model
viewer3D.loadModel(modelURL)
  .then((gltf) => {
    removePageLoader();

    if (gltf) {
      const cubeTexture = viewer3D.sceneEnvironment.cubeTexture;
      gltf.scene.traverse((node) => {
        const mesh = node as Mesh<BufferGeometry, MeshPhysicalMaterial>;
        const material = mesh.material;

        if (mesh.isMesh) {
          // remove broken normals, but should be fixed in Blender by 3D artists
          if (brokenNormals.includes(mesh.name)) {
            mesh.geometry.deleteAttribute('normal');
            mesh.geometry.computeVertexNormals();
          }

          // To fix problem with transparent meshes
          if (material.transparent) {
            material.alphaHash = false;
            material.depthWrite = true;
            material.needsUpdate = true;
          }

          const shouldProject = material.transparent || material.roughness < 1 || material.metalness > 0;
          if (cubeTexture && shouldProject) {
            material.envNode = pmremTexture(cubeTexture, parallaxCorrectFn(reflectVector, cubeSize, cubePosition));
          }
        }
      });

      viewer3D.sceneEnvironment.updateCubeCamera(viewer3D.renderer);
    }
  });

function removePageLoader() {
  const element = document.getElementById('loader');
  element?.remove();
}

// GUI
const params = {
  postprocessing: viewer3D.enablePostProcessing,
  adaptiveResolution: viewer3D.adaptiveResolution.isEnabled,
};

const gui = new GUI();
gui.add(params, 'postprocessing').onChange((enable) => {
  viewer3D.enablePostProcessing = enable;
});
gui.add(params, 'adaptiveResolution').name('adaptive resolution').onChange((enable) => {
  viewer3D.adaptiveResolution.setEnabled(enable);
});

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  viewer3D.resize({ width, height });
}

window.addEventListener('resize', resize);