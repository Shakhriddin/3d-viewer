export function getDevicePixelRatio(): number {
  return typeof window !== 'undefined' ? window.devicePixelRatio : 1;
}