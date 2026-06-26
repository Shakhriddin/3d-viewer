import './style.css';
import { Viewer3D } from '@/viewer';
import { sceneConfig } from './scene-config.ts';
import type { LightBase, LightTypes } from '@/environment';

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
viewer3D.loadModel(modelURL);

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  viewer3D.resize({ width, height });
}

window.addEventListener('resize', resize);