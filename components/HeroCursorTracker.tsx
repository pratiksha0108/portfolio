"use client";

import { useEffect, useRef } from "react";
import {
  MOTION_FRAMES, NEUTRAL_FRAME, advancePose, clamp, coverRect, damp, opaqueLayers,
  poseWeights, responsiveAxis, type Pose, type WeightedFrame,
} from "./hero-motion";

const BASE_PATH = process.env.NODE_ENV === "production" ? "/portfolio" : "";
const framePath = (index: number) =>
  `${BASE_PATH}/hero-frames/frame-${String(index).padStart(3, "0")}.jpg`;

export default function HeroCursorTracker() {
  const shellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const shell = shellRef.current;
    const stage = canvasRef.current;
    const hero = shell?.closest<HTMLElement>(".hero-section");
    const fallback = shell?.querySelector<HTMLElement>(".hero-fallback-frame");
    if (!shell || !stage || !hero || !fallback) return;
    const context = stage.getContext("2d", { alpha: false });
    if (!context) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");

    const start = () => {
      let destroyed = false;
      let bounds = hero.getBoundingClientRect();
      let visible = bounds.bottom > 0 && bounds.top < window.innerHeight;
      let rafId: number | null = null;
      let lastMotionAt = 0;
      let targetX = 0;
      let targetY = 0;
      let displayX = 0;
      let displayY = 0;
      let pose: Pose = { axis: "horizontal", position: 0 };
      let crop = coverRect(bounds.width, bounds.height);
      let painted = false;
      const images = new Map<number, HTMLImageElement>();
      const pending = new Map<number, Promise<void>>();
      const failed = new Set<number>();

      const scheduleRender = () => {
        if (!destroyed && visible && !document.hidden && rafId === null) {
          rafId = window.requestAnimationFrame(renderFrame);
        }
      };
      const stopRender = () => {
        if (rafId !== null) window.cancelAnimationFrame(rafId);
        rafId = null;
        lastMotionAt = 0;
      };
      const loadFrame = (index: number): Promise<void> => {
        if (destroyed || images.has(index) || failed.has(index)) return Promise.resolve();
        const existing = pending.get(index);
        if (existing) return existing;
        const task = new Promise<void>((resolve) => {
          const image = new Image();
          image.decoding = "async";
          const finish = (success: boolean) => {
            image.onload = null;
            image.onerror = null;
            if (!destroyed) {
              if (success) images.set(index, image);
              else failed.add(index);
              pending.delete(index);
              scheduleRender();
            }
            resolve();
          };
          image.onload = () => {
            void image.decode().then(() => finish(true), () => finish(false));
          };
          image.onerror = () => finish(false);
          image.src = framePath(index);
        });
        pending.set(index, task);
        return task;
      };

      const paint = (frames: WeightedFrame[], x = displayX, y = displayY) => {
        if (frames.some(({ index }) => !images.has(index))) {
          // Hold the last complete pose while loading. Never substitute an
          // unrelated frame or expose an empty canvas between downloads.
          frames.forEach(({ index }) => { void loadFrame(index); });
          return false;
        }
        for (const { index, alpha } of opaqueLayers(frames)) {
          context.globalAlpha = alpha;
          context.drawImage(images.get(index)!, crop.x + x * 6, crop.y + y * 5, crop.width, crop.height);
        }
        context.globalAlpha = 1;
        if (!painted) {
          painted = true;
          shell.classList.add("is-canvas-ready");
        }
        return true;
      };

      function renderFrame(now: number) {
        rafId = null;
        if (destroyed || !visible || document.hidden) return;
        if (!painted && !paint([{ index: NEUTRAL_FRAME, weight: 1 }])) return;
        const delta = lastMotionAt ? Math.min(32, now - lastMotionAt) : 1000 / 60;
        const nextX = damp(displayX, targetX, delta);
        const nextY = damp(displayY, targetY, delta);
        const nextPose = advancePose(pose, targetX, targetY, delta);
        if (!paint(poseWeights(nextPose.axis, nextPose.position), nextX, nextY)) {
          lastMotionAt = 0;
          return;
        }
        pose = nextPose;
        displayX = nextX;
        displayY = nextY;
        lastMotionAt = now;
        const wantedPosition = pose.axis === "horizontal" ? targetX : targetY;
        if (pose.transition || pose.position !== wantedPosition ||
            displayX !== targetX || displayY !== targetY) scheduleRender();
        else lastMotionAt = 0;
      }

      const resize = () => {
        bounds = hero.getBoundingClientRect();
        const width = Math.max(1, Math.round(bounds.width));
        const height = Math.max(1, Math.round(bounds.height));
        crop = coverRect(width, height);
        fallback.style.backgroundSize = `${crop.width}px ${crop.height}px`;
        fallback.style.backgroundPosition = `${crop.x}px ${crop.y}px`;
        // Assigning canvas dimensions clears its pixels, even if unchanged.
        if (stage.width !== width || stage.height !== height) {
          stage.width = width;
          stage.height = height;
          context.imageSmoothingEnabled = true;
          context.imageSmoothingQuality = "high";
          if (painted) paint(poseWeights(pose.axis, pose.position));
        }
        scheduleRender();
      };
      const resetPointer = () => {
        targetX = 0;
        targetY = 0;
        scheduleRender();
      };
      const setPointerTarget = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        targetX = responsiveAxis(clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1));
        targetY = responsiveAxis(clamp((event.clientY - bounds.top) / bounds.height * 2 - 1, -1, 1));
        scheduleRender();
      };
      const enterHero = (event: PointerEvent) => {
        bounds = hero.getBoundingClientRect();
        setPointerTarget(event);
      };
      const onScroll = () => {
        bounds = hero.getBoundingClientRect();
        // Scrolling should not select another pose after the pointer leaves.
        resetPointer();
      };
      const onVisibility = () => {
        resetPointer();
        if (document.hidden) stopRender();
      };
      const resizeObserver = new ResizeObserver(resize);
      const visibilityObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) scheduleRender();
        else { resetPointer(); stopRender(); }
      });

      resize();
      resizeObserver.observe(hero);
      visibilityObserver.observe(hero);
      // Capture the common parent: the copy and links sit above the media.
      hero.addEventListener("pointerenter", enterHero);
      hero.addEventListener("pointermove", setPointerTarget, { passive: true });
      hero.addEventListener("pointerleave", resetPointer);
      hero.addEventListener("pointercancel", resetPointer);
      window.addEventListener("blur", resetPointer);
      window.addEventListener("scroll", onScroll, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);

      void (async () => {
        // Show neutral immediately, then load only the calibrated poses in
        // small batches. Phones and reduced-motion users never enter this path.
        await loadFrame(NEUTRAL_FRAME);
        const priority = [31, 39, 65, 93];
        const rest = MOTION_FRAMES.filter(index => index !== NEUTRAL_FRAME && !priority.includes(index));
        const queue = [...priority, ...rest];
        for (let i = 0; i < queue.length && !destroyed; i += 3) {
          await Promise.all(queue.slice(i, i + 3).map(loadFrame));
        }
      })();

      return () => {
        destroyed = true;
        stopRender();
        resizeObserver.disconnect();
        visibilityObserver.disconnect();
        hero.removeEventListener("pointerenter", enterHero);
        hero.removeEventListener("pointermove", setPointerTarget);
        hero.removeEventListener("pointerleave", resetPointer);
        hero.removeEventListener("pointercancel", resetPointer);
        window.removeEventListener("blur", resetPointer);
        window.removeEventListener("scroll", onScroll);
        document.removeEventListener("visibilitychange", onVisibility);
        shell.classList.remove("is-canvas-ready");
        images.clear();
      };
    };

    let stop: (() => void) | undefined;
    const syncPreferences = () => {
      stop?.();
      stop = undefined;
      if (!reducedMotion.matches && finePointer.matches) stop = start();
    };
    syncPreferences();
    reducedMotion.addEventListener("change", syncPreferences);
    finePointer.addEventListener("change", syncPreferences);
    return () => {
      stop?.();
      reducedMotion.removeEventListener("change", syncPreferences);
      finePointer.removeEventListener("change", syncPreferences);
    };
  }, []);

  return (
    <div ref={shellRef} className="hero-media" aria-hidden="true">
      <div className="hero-fallback-frame" style={{ backgroundImage: `url(${framePath(NEUTRAL_FRAME)})` }} />
      <canvas ref={canvasRef} className="hero-canvas" />
      <div className="hero-media-vignette" />
      <div className="hero-media-grain" />
    </div>
  );
}
