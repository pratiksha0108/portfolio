import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../components/hero-motion.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
}).outputText;
const { poseWeights, opaqueLayers, MOTION_FRAMES, POSE_PATHS, damp, coverRect, responsiveAxis, advancePose, preferredAxis } =
  await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);

const near = (a, b, epsilon = 1e-9) => assert.ok(Math.abs(a - b) < epsilon, `${a} != ${b}`);

test('every pose stays opaque and preserves weighted colors', () => {
  for (const axis of ['horizontal', 'vertical']) {
    for (let position = -1; position <= 1.001; position += 0.005) {
      const weights = poseWeights(axis, position);
      near(weights.reduce((sum, f) => sum + f.weight, 0), 1);
      assert.ok(weights.length <= 2);
      let opacity = 0, value = 0;
      for (const layer of opaqueLayers(weights)) {
        assert.ok(layer.alpha > 0 && layer.alpha <= 1);
        opacity = layer.alpha + opacity * (1 - layer.alpha);
        value = layer.index * layer.alpha + value * (1 - layer.alpha);
      }
      near(opacity, 1);
      near(value, weights.reduce((sum, f) => sum + f.index * f.weight, 0));
    }
  }
});

test('halfway crossfades do not leave 25 percent of the dark background exposed', () => {
  const layers = opaqueLayers([{ index: 31, weight: 0.5 }, { index: 33, weight: 0.5 }]);
  assert.deepEqual(layers.map(f => f.alpha), [1, 0.5]);
});

test('small movements activate all directions without timeline detours or blinks', () => {
  for (const [x, y, path] of [[-0.02, 0, 'left'], [0.02, 0, 'right'], [0, -0.02, 'up'], [0, 0.02, 'down']]) {
    const weights = poseWeights(x ? 'horizontal' : 'vertical', responsiveAxis(x || y));
    assert.ok(weights.some(f => f.index !== 33 && f.weight > 0.05));
    assert.ok(weights.every(f => POSE_PATHS[path].includes(f.index)));
  }
  assert.equal(MOTION_FRAMES.length, 20);
  assert.ok(!MOTION_FRAMES.includes(38) && !MOTION_FRAMES.includes(64));
  assert.deepEqual(poseWeights('horizontal', 0), [{ index: 33, weight: 1 }]);
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
    assert.ok(poseWeights(pose.axis, pose.position).length <= 2);
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
