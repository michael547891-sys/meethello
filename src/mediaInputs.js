export function mediaErrorState(error) {
  if (error?.name === 'NotFoundError' || error?.name === 'OverconstrainedError') return 'notfound';
  if (error?.name === 'NotReadableError') return 'busy';
  return 'denied';
}

export async function acquireMediaInputs(getUserMedia, { micOn, camOn, micId, camId }, onInput) {
  async function request(kind, constraints) {
    try {
      const stream = await getUserMedia(constraints);
      onInput?.(kind, stream, 'ready');
      return stream;
    } catch (error) {
      onInput?.(kind, null, mediaErrorState(error));
      throw error;
    }
  }
  const [audioResult, videoResult] = await Promise.allSettled([
    micOn ? request('microphone', { audio: micId ? { deviceId: { exact: micId } } : true, video: false }) : Promise.resolve(null),
    camOn ? request('camera', { video: camId ? { deviceId: { exact: camId } } : true, audio: false }) : Promise.resolve(null),
  ]);
  const audio = audioResult.status === 'fulfilled' ? audioResult.value : null;
  const video = videoResult.status === 'fulfilled' ? videoResult.value : null;
  return {
    audio,
    video,
    microphone: !micOn ? 'off' : audio ? 'ready' : mediaErrorState(audioResult.reason),
    camera: !camOn ? 'off' : video ? 'ready' : mediaErrorState(videoResult.reason),
  };
}
