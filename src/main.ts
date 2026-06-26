import './style.css';
import type { BufferGeometry, Mesh, MeshPhysicalMaterial } from 'three/webgpu';
import type { LightBase, LightTypes } from '@/environment';
import GUI from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { Viewer3D } from '@/viewer';
import { sceneConfig } from './scene-config.ts';

// Meshes with incorrect faced normals, remove it after 3D model fix
const brokenNormals = ['mesh_0', 'mesh_0_4', 'mesh_0_5', 'mesh_0_6', 'mesh_0_7', 'mesh_0_9', 'mesh_0_14', 'mesh_0_16', 'mesh_0_17', 'mesh_0_55', 'mesh_0_27', 'mesh_0_49', 'mesh_0_21', 'mesh_0_34'];

const modelURL = '/bathroom.glb';
const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const viewer3D = new Viewer3D({ canvas });
await viewer3D.init();

// Scene Config
const { camera, lights } = sceneConfig;

viewer3D.controls.setLookAt(
  camera.position.x, camera.position.y, camera.position.z,
  camera.target.x, camera.target.y, camera.target.z,
  false,
);

lights.forEach((light) => {
  viewer3D.sceneLights.createLight(light as LightBase<LightTypes>);
});


// Load 3D Model
viewer3D.loadModel(modelURL)
  .then((gltf) => {
    if (gltf) {
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
        }
      });
    }
  });

// GUI
const params = {
  postprocessing: viewer3D.enablePostProcessing,
};

const gui = new GUI();
gui.add(params, 'postprocessing').onChange((enable) => {
  viewer3D.enablePostProcessing = enable;
});

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  viewer3D.resize({ width, height });
}

window.addEventListener('resize', resize);