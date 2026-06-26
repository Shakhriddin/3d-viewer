import {
  Box3,
  Matrix4,
  Object3D,
  PerspectiveCamera,
  Quaternion,
  Raycaster,
  Sphere,
  Spherical,
  Vector2,
  Vector3,
  Vector4
} from 'three/webgpu';
import CameraControls from 'camera-controls';

const MIN_DISTANCE = 0.5;
const MAX_DISTANCE = 30;
const MAX_POLAR_ANGLE = Math.PI - Math.PI / 6;
const MIN_POLAR_ANGLE = Math.PI / 6;
const REST_THRESHOLD = 0.1;

CameraControls.install({
  THREE: {
    Vector2: Vector2,
    Vector3: Vector3,
    Vector4: Vector4,
    Quaternion: Quaternion,
    Matrix4: Matrix4,
    Spherical: Spherical,
    Box3: Box3,
    Sphere: Sphere,
    Raycaster: Raycaster,
  }
});

export class ViewerControls extends CameraControls {
  constructor(camera: PerspectiveCamera, domElement: HTMLElement) {
    super(camera, domElement);

    this.mouseButtons.left = CameraControls.ACTION.ROTATE;
    this.mouseButtons.right = CameraControls.ACTION.SCREEN_PAN; //.ROTATE
    this.touches.two = CameraControls.ACTION.TOUCH_SCREEN_PAN;
    this.minDistance = MIN_DISTANCE;
    this.maxDistance = MAX_DISTANCE;
    this.maxPolarAngle = MAX_POLAR_ANGLE;
    this.minPolarAngle = MIN_POLAR_ANGLE;
    this.restThreshold = REST_THRESHOLD;
    this.colliderMeshes = [];

    this.setLookAt(
      1, 1, 0,
      1, 1, 0,
      false,
    );
  }

  public addColliderMeshes(mesh: Object3D): void {
    this.colliderMeshes.push(mesh);
  }

  public removeColliderMesh(mesh: Object3D): void {
    const index = this.colliderMeshes.findIndex(({ uuid }) => uuid === mesh.uuid);

    if (index > -1) {
      this.colliderMeshes.splice(index, 1);
    }
  }
}