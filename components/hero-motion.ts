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
    const step = milliseconds / 1000 * 2.4;
    if (Math.abs(pose.position) > step) {
      return { axis: pose.axis, position: pose.position - Math.sign(pose.position) * step };
    }
    return { axis: wanted, position: 0 };
  }
  const axis = wanted;
  const target = axis === "horizontal" ? x : y;
  const eased = damp(pose.position, target, milliseconds);
  // Cap angular travel so a pointer sweep cannot skip straight to a far pose.
  const step = milliseconds / 1000 * 2.4;
  return { axis, position: pose.position + clamp(eased - pose.position, -step, step) };
}

export function poseFrame(axis: Axis, position: number): number {
  const path = axis === "horizontal"
    ? position < 0 ? POSE_PATHS.left : POSE_PATHS.right
    : position < 0 ? POSE_PATHS.up : POSE_PATHS.down;
  // Select a sharp resting pose. The renderer only blends briefly when this
  // selection changes, never leaving two faces superimposed while idle.
  return path[Math.round(clamp(Math.abs(position), 0, 1) * (path.length - 1))];
}

export function damp(current: number, target: number, milliseconds: number) {
  const next = current + (target - current) * (1 - Math.exp(-milliseconds / 110));
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
