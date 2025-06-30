export async function requestDevice() {
  if (!navigator.gpu) {
    throw new Error('WebGPU is not supported.');
  }
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    throw new Error('Failed to get GPU adapter.');
  }
  const device = await adapter.requestDevice();
  return device;
}
