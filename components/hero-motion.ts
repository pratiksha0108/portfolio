export const NEUTRAL_FRAME = 33;

// Monotonic, open-eye poses from the source video. The original timeline contains
// pauses and blinks, and its down sequence first travels through the up sequence.
export const POSE_PATHS = {
  left: [33, 31, 30, 29, 28, 27],
  right: [33, 39, 40, 41, 42, 43],
  up: [33, 65, 66, 67, 68, 69],
  down: [33, 93, 92, 91, 90],
};

export const MOTION_FRAMES = [...new Set(Object.values(POSE_PATHS).flat())];
export type WeightedFrame = { index: number; weight: number };
export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function responsiveAxis(value: number) {
  const magnitude = clamp(Math.abs(value), 0, 1);
  // Finite slope at the center, with no broad dead zone or sudden sensitivity jump.
  return Math.sign(value) * (1 - Math.exp(-2.4 * magnitude)) / (1 - Math.exp(-2.4));
}

export type Axis = "horizontal" | "vertical";
export type Pose = {
  axis: Axis;
  position: number;
  transition?: { axis: Axis; from: number; elapsed: number };
};

export function preferredAxis(current: Axis, x: number, y: number): Axis {
  // Keep the current axis near a diagonal so tiny pointer changes cannot chatter.
  if (Math.abs(y) > Math.abs(x) * 1.35 + 0.06) return "vertical";
  if (Math.abs(x) > Math.abs(y) * 1.35 + 0.06) return "horizontal";
  return current;
}

export function advancePose(pose: Pose, x: number, y: number, milliseconds: number): Pose {
  const wanted = Math.abs(pose.position) < 0.0005
    ? Math.abs(y) > Math.abs(x) ? "vertical" : "horizontal"
    : preferredAxis(pose.axis, x, y);
  if (wanted !== pose.axis && Math.abs(pose.position) > 0.0005) {
    const transition = pose.transition?.axis === wanted
      ? pose.transition : { axis: wanted, from: pose.position, elapsed: 0 };
    const elapsed = Math.min(100, transition.elapsed + milliseconds);
    const progress = elapsed / 100;
    const eased = progress * progress * (3 - 2 * progress);
    if (elapsed < 100) return {
      axis: pose.axis, position: transition.from * (1 - eased),
      transition: { ...transition, elapsed },
    };
    return { axis: wanted, position: 0 };
  }
  const axis = wanted;
  return { axis, position: damp(pose.position, axis === "horizontal" ? x : y, milliseconds) };
}

export function poseWeights(axis: Axis, position: number): WeightedFrame[] {
  const path = axis === "horizontal"
    ? position < 0 ? POSE_PATHS.left : POSE_PATHS.right
    : position < 0 ? POSE_PATHS.up : POSE_PATHS.down;
  const sample = clamp(Math.abs(position), 0, 1) * (path.length - 1);
  const lower = Math.floor(sample);
  const upper = Math.min(lower + 1, path.length - 1);
  const blend = sample - lower;
  if (blend === 0) return [{ index: path[lower], weight: 1 }];
  return [{ index: path[lower], weight: 1 - blend }, { index: path[upper], weight: blend }];
}

export function opaqueLayers(frames: WeightedFrame[]) {
  let accumulated = 0;
  return frames.filter(({ weight }) => weight > 0).map(({ index, weight }) => {
    accumulated += weight;
    // Source-over alpha is relative to the weight already drawn. Drawing both
    // frames at half opacity over black leaves 25% black and causes flashing.
    return { index, alpha: weight / accumulated };
  });
}

export function damp(current: number, target: number, milliseconds: number) {
  const next = current + (target - current) * (1 - Math.exp(-milliseconds / 80));
  return Math.abs(next - target) < 0.0005 ? target : next;
}

export function coverRect(width: number, height: number) {
  const zoom = width >= 900 ? 1.085 : width >= 600 ? 1.045 : 1.02;
  const scale = Math.max((width + 16) / 960, (height + 16) / 540) * zoom;
  const drawWidth = 960 * scale;
  const drawHeight = 540 * scale;
  const shift = width * (width >= 900 ? 0.135 : width >= 600 ? 0.07 : 0.02);
  return {
    x: clamp((width - drawWidth) / 2 + shift, width - drawWidth + 8, -8),
    y: (height - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  };
}
