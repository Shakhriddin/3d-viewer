const camera = {
  position: {
    x: -0.7836919103360374,
    y: 2.2196328375545358,
    z: -0.9051607303819748
  },
  target: {
    x: 0.05097242816788963,
    y: 1.5,
    z: -0.06580467140172315
  }
};

const lights = [
  {
    type: 'react-area',
    color: '#ffffff',
    intensity: Math.PI,
    width: 2,
    height: 0.1,
    position: {
      x: 0.1,
      y: 2.75,
      z: 0.9
    },
    target: {
      x: 0.1,
      y: 0,
      z: 0.9
    },
  },
  {
    type: 'spot',
    color: '#ffffff',
    intensity: Math.PI * 2,
    distance: 4,
    angle: 1.2,
    penumbra: 1,
    decay: 1,
    position: {
      x: 0.07656757818144978,
      y: 3.2,
      z: -0.03917110711797923
    },
    target: {
      x: 0.07656757818144978,
      y: 0,
      z: -0.03917110711797923
    },
    shadowParams: {
      receiveShadow: true,
      width: 1024,
      height: 1024,
      bias: -0.004,
      normalBias: 0.001
    }
  },
  {
    type: 'spot',
    color: '#ffffff',
    intensity: Math.PI,
    distance: 4,
    angle: 1.2,
    penumbra: 1,
    decay: 1,
    position: {
      x: 0.06700806808911995,
      y: 3,
      z: -1.345563841221863
    },
    target: {
      x: 0.06700806808911995,
      y: 0,
      z: -1.345563841221863
    }
  }
];

const cubeCamera = {
  position: {
    x: 0.09654927253723145,
    y: 1.4052783157676458,
    z: 0.30609771609306335,
  },
  size: {
    x: 2.2272696495056157,
    y: 2.8105566315352917,
    z: 2.3172813057899475,
  }
};

export const sceneConfig = {
  camera,
  lights,
  cubeCamera,
};