import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const assets = JSON.parse(readFileSync(new URL('../components/hero-assets.json', import.meta.url), 'utf8'));
const source = readFileSync(new URL('../components/hero-motion.ts', import.meta.url), 'utf8')
  .replace('import assets from "./hero-assets.json";', `const assets = ${JSON.stringify(assets)};`);
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
}).outputText;
const { poseFrame, spriteFrame, NEUTRAL_FRAME, PATCH, SHEET_COUNT, MOTION_FRAMES, POSE_PATHS, damp, coverRect, portraitRect, responsiveAxis, advancePose, preferredAxis } =
  await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

const near = (a, b, epsilon = 1e-9) => assert.ok(Math.abs(a - b) < epsilon, `${a} != ${b}`);

test('portrait crop centers the character and covers narrow and desktop frames', () => {
  for (const [width, height] of [[465, 560], [310, 409], [390, 520]]) {
    const crop = portraitRect(width, height);
    near(crop.x + 640 * crop.width / 1280, width / 2);
    assert.ok(crop.x <= -8 && crop.y <= -8);
    assert.ok(crop.x + crop.width >= width + 8);
    assert.ok(crop.y + crop.height >= height + 8);
  }
});

test('every intermediate cursor position selects exactly one complete captured pose', () => {
  for (const axis of ['horizontal', 'vertical']) {
    for (let position = -1; position <= 1.001; position += 0.005) {
      const index = poseFrame(axis, position);
      assert.equal(typeof index, 'number');
      assert.ok(MOTION_FRAMES.includes(index));
      const sprite = spriteFrame(index);
      assert.ok(sprite.sheet >= 0 && sprite.sheet < SHEET_COUNT);
      assert.ok(sprite.x >= 0 && sprite.x + PATCH.width <= PATCH.width * assets.columns);
      assert.ok(sprite.y >= 0 && sprite.y + PATCH.height <= PATCH.height * 4);
    }
  }
});

test('small movements select directional poses and neutral remains exact', () => {
  for (const [x, y, path] of [[-0.02, 0, 'left'], [0.02, 0, 'right'], [0, -0.02, 'up'], [0, 0.02, 'down']]) {
    const frame = poseFrame(x ? 'horizontal' : 'vertical', responsiveAxis(x || y));
    assert.notEqual(frame, NEUTRAL_FRAME);
    assert.ok(POSE_PATHS[path].includes(frame));
  }
  assert.ok(MOTION_FRAMES.length > 40);
  assert.equal(poseFrame('horizontal', 0), NEUTRAL_FRAME);
});

test('diagonal jitter keeps the current axis; deliberate axis changes pass through neutral', () => {
  for (const value of [-0.9, -0.5, -0.1, 0.1, 0.5, 0.9]) {
    assert.equal(preferredAxis('horizontal', value, value + 0.005), 'horizontal');
    assert.equal(preferredAxis('vertical', value + 0.005, value), 'vertical');
  }
  let pose = { axis: 'horizontal', position: 0.8 };
  let sawNeutral = false;
  for (let i = 0; i < 60; i++) {
    const previous = pose;
    pose = advancePose(pose, 0.1, -0.9, 1000 / 60);
    if (previous.axis !== pose.axis) {
      assert.equal(pose.position, 0);
      sawNeutral = true;
    }
    assert.ok(MOTION_FRAMES.includes(poseFrame(pose.axis, pose.position)));
  }
  assert.ok(sawNeutral);
  assert.equal(pose.axis, 'vertical');
  near(pose.position, -0.9);
});

test('damping is refresh-rate independent and settles exactly at neutral', () => {
  near(damp(0, 1, 1000 / 30), damp(damp(0, 1, 1000 / 60), 1, 1000 / 60));
  let value = 1, frames = 0;
  while (value !== 0 && frames < 120) { value = damp(value, 0, 1000 / 60); frames++; }
  assert.equal(value, 0);
  assert.ok(frames < 60);
});

test('the shared fallback and canvas crop always covers the viewport', () => {
  for (const [width, height] of [[1440, 900], [1366, 768], [1280, 800], [1024, 768], [390, 844]]) {
    const crop = coverRect(width, height);
    assert.ok(crop.x <= 0 && crop.y <= 0);
    assert.ok(crop.x + crop.width >= width && crop.y + crop.height >= height);
  }
});

test('near-center direction changes do not incur a fixed 100 ms pause', () => {
  const pose = advancePose({ axis: 'horizontal', position: 0.03 }, 0, -0.7, 1000 / 60);
  assert.equal(pose.axis, 'vertical');
  assert.ok(advancePose(pose, 0, -0.7, 1000 / 60).position < -0.1);
});
