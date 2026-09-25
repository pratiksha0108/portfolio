"use client";

import { useEffect, useRef } from "react";

const FRAME_RATE = 10;
const FRAME_COUNT = 100;
const DISPLAY_FPS = 30;
const BASE_PATH = process.env.NODE_ENV === "production" ? "/portfolio" : "";
const framePath = (index: number) =>
  `${BASE_PATH}/hero-frames/frame-${String(index).padStart(3, "0")}.jpg`;

const TIMELINE = {
  left: 1.7,
  centerHorizontal: 3.3,
  right: 5.0,
  centerVertical: 6.2,
  up: 7.3,
  down: 9.0,
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const frameAt = (time: number) =>
  clamp(Math.round(time * FRAME_RATE), 0, FRAME_COUNT - 1);

export default function HeroCursorTracker() {
  const shellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const shell = shellRef.current;
    const canvas = canvasRef.current;
    if (!shell || !canvas) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

    if (prefersReducedMotion) return;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "medium";

    let bounds = shell.getBoundingClientRect();
    let viewWidth = Math.max(1, Math.round(bounds.width));
    let viewHeight = Math.max(1, Math.round(bounds.height));
    let rafId: number | null = null;
    let lastDrawAt = 0;
    let lastMotionAt = 0;
    let lastPointerAt = 0;
    let destroyed = false;
    let imagesReady = false;

    let targetX = 0;
    let targetY = 0;
    let displayX = 0;
    let displayY = 0;
    let activeAxis: "horizontal" | "vertical" = "horizontal";
    let transitionFromTime = TIMELINE.centerHorizontal;
    let transitionStartedAt = -1;

    const images: HTMLImageElement[] = Array.from(
      { length: FRAME_COUNT },
      () => {
        const image = new Image();
        image.decoding = "async";
        return image;
      },
    );
    const loaded = Array.from({ length: FRAME_COUNT }, () => false);

    const scheduleRender = () => {
      if (rafId === null) rafId = window.requestAnimationFrame(render);
    };

    const resize = () => {
      bounds = shell.getBoundingClientRect();
      viewWidth = Math.max(1, Math.round(bounds.width));
      viewHeight = Math.max(1, Math.round(bounds.height));

      // A 1x backing canvas is substantially lighter than a retina-sized canvas
      // and is visually sufficient for a full-bleed photographic hero.
      canvas.width = viewWidth;
      canvas.height = viewHeight;
      canvas.style.width = `${viewWidth}px`;
      canvas.style.height = `${viewHeight}px`;
      scheduleRender();
    };

    const drawCover = (image: HTMLImageElement, alpha = 1) => {
      if (!image.naturalWidth || !image.naturalHeight || alpha <= 0.002) return;

      const desktop = viewWidth >= 900;
      const zoom = desktop ? 1.085 : viewWidth >= 600 ? 1.045 : 1.02;
      const scale =
        Math.max(
          canvas.width / image.naturalWidth,
          canvas.height / image.naturalHeight,
        ) * zoom;
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const centeredX = (canvas.width - drawWidth) / 2;
      const horizontalShift = canvas.width * (desktop ? 0.135 : viewWidth >= 600 ? 0.07 : 0.02);
      const drawX = clamp(centeredX + horizontalShift, canvas.width - drawWidth, 0);
      const drawY = (canvas.height - drawHeight) / 2;

      context.globalAlpha = alpha;
      context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    };

    const nearestLoaded = (index: number) => {
      const safeIndex = clamp(index, 0, FRAME_COUNT - 1);
      if (loaded[safeIndex]) return images[safeIndex];

      for (let distance = 1; distance < FRAME_COUNT; distance += 1) {
        const before = safeIndex - distance;
        const after = safeIndex + distance;
        if (before >= 0 && loaded[before]) return images[before];
        if (after < FRAME_COUNT && loaded[after]) return images[after];
      }
      return null;
    };

    const drawTimeline = (time: number, alpha = 1) => {
      const rawFrame = clamp(time * FRAME_RATE, 0, FRAME_COUNT - 1);
      const lowerIndex = Math.floor(rawFrame);
      const upperIndex = Math.min(FRAME_COUNT - 1, lowerIndex + 1);
      const blend = rawFrame - lowerIndex;
      const lower = nearestLoaded(lowerIndex);
      const upper = nearestLoaded(upperIndex);

      if (lower) drawCover(lower, alpha);
      if (upper && upper !== lower && blend > 0.015) {
        drawCover(upper, alpha * blend);
      }
    };

    const horizontalTimeFor = (x: number) => {
      const magnitude = Math.pow(Math.abs(x), 1.36);
      return x < 0
        ? TIMELINE.centerHorizontal +
            (TIMELINE.left - TIMELINE.centerHorizontal) * magnitude
        : TIMELINE.centerHorizontal +
            (TIMELINE.right - TIMELINE.centerHorizontal) * magnitude;
    };

    const verticalTimeFor = (y: number) => {
      const magnitude = Math.pow(Math.abs(y), 1.36);
      return y < 0
        ? TIMELINE.centerVertical +
            (TIMELINE.up - TIMELINE.centerVertical) * magnitude
        : TIMELINE.centerVertical +
            (TIMELINE.down - TIMELINE.centerVertical) * magnitude;
    };

    function render(now: number) {
      rafId = null;
      if (!imagesReady) return;

      if (now - lastDrawAt < 1000 / DISPLAY_FPS) {
        scheduleRender();
        return;
      }

      const delta = lastMotionAt ? Math.min(48, now - lastMotionAt) : 16.7;
      lastMotionAt = now;
      const easing = 1 - Math.exp(-delta / 82);

      displayX += (targetX - displayX) * easing;
      displayY += (targetY - displayY) * easing;

      const horizontalMagnitude = Math.pow(Math.abs(displayX), 1.36);
      const verticalMagnitude = Math.pow(Math.abs(displayY), 1.36);
      const totalMagnitude = horizontalMagnitude + verticalMagnitude;
      const previousAxis = activeAxis;

      if (totalMagnitude < 0.025) {
        activeAxis = "horizontal";
      } else if (horizontalMagnitude > verticalMagnitude * 1.18) {
        activeAxis = "horizontal";
      } else if (verticalMagnitude > horizontalMagnitude * 1.18) {
        activeAxis = "vertical";
      }

      const horizontalTime = horizontalTimeFor(displayX);
      const verticalTime = verticalTimeFor(displayY);
      const currentTime =
        activeAxis === "horizontal" ? horizontalTime : verticalTime;

      if (activeAxis !== previousAxis) {
        transitionFromTime =
          previousAxis === "horizontal" ? horizontalTime : verticalTime;
        transitionStartedAt = now;
      }

      context.globalAlpha = 1;
      context.fillStyle = "#090b16";
      context.fillRect(0, 0, canvas.width, canvas.height);

      const transitionProgress =
        transitionStartedAt < 0
          ? 1
          : clamp((now - transitionStartedAt) / 150, 0, 1);

      if (transitionProgress < 1) {
        drawTimeline(transitionFromTime, 1);
        drawTimeline(currentTime, transitionProgress);
      } else {
        drawTimeline(currentTime, 1);
      }

      context.globalAlpha = 1;
      lastDrawAt = now;

      const stillMoving =
        Math.abs(targetX - displayX) > 0.0025 ||
        Math.abs(targetY - displayY) > 0.0025 ||
        transitionProgress < 1;
      if (stillMoving) scheduleRender();
    }

    const setPointerTarget = (event: PointerEvent) => {
      if (!hasFinePointer) return;
      targetX = clamp(
        ((event.clientX - bounds.left) / Math.max(bounds.width, 1)) * 2 - 1,
        -1,
        1,
      );
      targetY = clamp(
        ((event.clientY - bounds.top) / Math.max(bounds.height, 1)) * 2 - 1,
        -1,
        1,
      );
      lastPointerAt = performance.now();
      scheduleRender();
    };

    const refreshBounds = () => {
      bounds = shell.getBoundingClientRect();
    };

    const resetPointer = () => {
      targetX = 0;
      targetY = 0;
      scheduleRender();
    };

    const onScroll = () => {
      refreshBounds();
      if (hasFinePointer && performance.now() - lastPointerAt < 1500) return;
      const progress = clamp(-bounds.top / Math.max(bounds.height, 1), 0, 1);
      targetX = 0;
      targetY = progress * 0.34;
      scheduleRender();
    };

    const loadFrame = (index: number) =>
      new Promise<void>((resolve) => {
        const image = images[index];
        const finish = () => {
          loaded[index] = image.complete && image.naturalWidth > 0;
          resolve();
        };

        image.onload = () => {
          void image.decode().catch(() => undefined).finally(finish);
        };
        image.onerror = finish;
        image.src = framePath(index);
      });

    const loadFrames = async () => {
      const anchors = Object.values(TIMELINE).map(frameAt);
      const priority = new Set<number>();
      anchors.forEach((anchor) => {
        for (let offset = -5; offset <= 5; offset += 1) {
          priority.add(clamp(anchor + offset, 0, FRAME_COUNT - 1));
        }
      });

      await Promise.all([...priority].map(loadFrame));
      if (destroyed) return;

      imagesReady = loaded.some(Boolean);
      if (imagesReady) {
        shell.classList.add("is-canvas-ready");
        scheduleRender();
      }

      const remaining = Array.from(
        { length: FRAME_COUNT },
        (_, index) => index,
      ).filter((index) => !priority.has(index));

      for (let start = 0; start < remaining.length && !destroyed; start += 10) {
        await Promise.all(remaining.slice(start, start + 10).map(loadFrame));
        scheduleRender();
        await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
      }
    };

    resize();
    void loadFrames();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(shell);
    shell.addEventListener("pointerenter", refreshBounds);
    shell.addEventListener("pointermove", setPointerTarget, { passive: true });
    shell.addEventListener("pointerleave", resetPointer);
    window.addEventListener("blur", resetPointer);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      destroyed = true;
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      shell.removeEventListener("pointerenter", refreshBounds);
      shell.removeEventListener("pointermove", setPointerTarget);
      shell.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("blur", resetPointer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={shellRef} className="hero-media" aria-hidden="true">
      <div
        className="hero-fallback-frame"
        style={{ backgroundImage: `url(${framePath(33)})` }}
      />
      <canvas ref={canvasRef} className="hero-canvas" />
      <div className="hero-media-vignette" />
      <div className="hero-media-grain" />
    </div>
  );
}
