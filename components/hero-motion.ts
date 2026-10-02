import assets from "./hero-assets.json";

export const NEUTRAL_FRAME = assets.neutral;
export const POSE_PATHS = assets.paths;
export const MOTION_FRAMES = assets.frames;
export const PATCH = assets.patch;
export const SHEET_COUNT = Math.ceil(MOTION_FRAMES.length / assets.perSheet);

export function spriteFrame(index: number) {
  const slot = MOTION_FRAMES.indexOf(index);
  return {
    sheet: Math.floor(slot / assets.perSheet),
    x: (slot % assets.columns) * PATCH.width,
    y: Math.floor((slot % assets.perSheet) / assets.columns) * PATCH.height,
  };
}

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
    // Travel through neutral at a bounded speed, without a fixed pause on
    // every direction change. Small turns take proportionally less time.
    const step = milliseconds / 1000 * 10;
    if (Math.abs(pose.position) > step) {
      return { axis: pose.axis, position: pose.position - Math.sign(pose.position) * step };
    }
    return { axis: wanted, position: 0 };
  }
  const axis = wanted;
  return { axis, position: damp(pose.position, axis === "horizontal" ? x : y, milliseconds) };
}

export function poseFrame(axis: Axis, position: number): number {
  const path = axis === "horizontal"
    ? position < 0 ? POSE_PATHS.left : POSE_PATHS.right
    : position < 0 ? POSE_PATHS.up : POSE_PATHS.down;
  // A single captured pose keeps the eyes and hair sharp at intermediate
  // pointer positions. Crossfading different faces creates permanent ghosting.
  return path[Math.round(clamp(Math.abs(position), 0, 1) * (path.length - 1))];
}

export function damp(current: number, target: number, milliseconds: number) {
  const next = current + (target - current) * (1 - Math.exp(-milliseconds / 45));
  return Math.abs(next - target) < 0.0005 ? target : next;
}

export function coverRect(width: number, height: number) {
  const zoom = width >= 900 ? 1.085 : width >= 600 ? 1.045 : 1.02;
  const scale = Math.max((width + 16) / 1280, (height + 16) / 720) * zoom;
  const drawWidth = 1280 * scale;
  const drawHeight = 720 * scale;
  const shift = width * (width >= 900 ? 0.135 : width >= 600 ? 0.07 : 0.02);
  return {
    x: clamp((width - drawWidth) / 2 + shift, width - drawWidth + 8, -8),
    y: (height - drawHeight) / 2,
    width: drawWidth,
    height: drawHeight,
  };
}

// Frame the original animated character rather than the full skyline.
export function portraitRect(width: number, height: number) {
  const scale = Math.max((width + 16) / 520, (height + 16) / 560);
  return {
    x: (width - 1280 * scale) / 2,
    y: height - 720 * scale + 8,
    width: 1280 * scale,
    height: 720 * scale,
  };
}
