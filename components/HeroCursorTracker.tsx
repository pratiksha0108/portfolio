"use client";

import { useEffect, useRef } from "react";

const FRAME_RATE = 10;
const FRAME_COUNT = 100;
const DISPLAY_FPS = 45;
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

const responsiveAxis = (value: number) => {
  const absolute = Math.abs(value);
  if (absolute < 0.004) return 0;
  const normalized = clamp((absolute - 0.004) / 0.996, 0, 1);
  const shaped = 0.12 * normalized + 0.88 * Math.pow(normalized, 0.62);
  return Math.sign(value) * shaped;
};

export default function HeroCursorTracker() {
  const shellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const shellNode = shellRef.current;
    const canvasNode = canvasRef.current;
    const heroNode = shellNode?.closest<HTMLElement>(".hero-section");
    if (!shellNode || !canvasNode || !heroNode) return;

    const canvasContext = canvasNode.getContext("2d", { alpha: false });
    if (!canvasContext) return;

    const shell: HTMLDivElement = shellNode;
    // The foreground copy is a sibling of the media and covers most of it.
    // Track their common parent so text, links, and empty space all respond.
    const hero: HTMLElement = heroNode;
    const stage: HTMLCanvasElement = canvasNode;
    const context: CanvasRenderingContext2D = canvasContext;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

    if (prefersReducedMotion || !hasFinePointer) return;

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    let bounds = hero.getBoundingClientRect();
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
    let renderFrame: FrameRequestCallback = () => undefined;

    const images = Array.from({ length: FRAME_COUNT }, () => {
      const image = new Image();
      image.decoding = "async";
      return image;
    });
    const loaded = Array.from({ length: FRAME_COUNT }, () => false);

    const scheduleRender = () => {
      if (!destroyed && rafId === null)
        rafId = window.requestAnimationFrame(renderFrame);
    };

    const resize = () => {
      bounds = hero.getBoundingClientRect();
      viewWidth = Math.max(1, Math.round(bounds.width));
      viewHeight = Math.max(1, Math.round(bounds.height));
      stage.width = viewWidth;
      stage.height = viewHeight;
      stage.style.width = `${viewWidth}px`;
      stage.style.height = `${viewHeight}px`;
      scheduleRender();
    };

    const drawCover = (image: HTMLImageElement, alpha = 1) => {
      if (!image.naturalWidth || !image.naturalHeight || alpha <= 0.002) return;

      const desktop = viewWidth >= 900;
      const zoom = desktop ? 1.085 : viewWidth >= 600 ? 1.045 : 1.02;
      const scale =
        Math.max(
          stage.width / image.naturalWidth,
          stage.height / image.naturalHeight,
        ) * zoom;
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const centeredX = (stage.width - drawWidth) / 2;
      const horizontalShift =
        stage.width * (desktop ? 0.135 : viewWidth >= 600 ? 0.07 : 0.02);
      const drawX = clamp(centeredX + horizontalShift, stage.width - drawWidth, 0);
      const drawY = (stage.height - drawHeight) / 2;

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

      if (lower && upper && upper !== lower) {
        drawCover(lower, alpha * (1 - blend));
        drawCover(upper, alpha * blend);
      } else if (lower) {
        drawCover(lower, alpha);
      } else if (upper) {
        drawCover(upper, alpha);
      }
    };

    const horizontalTimeFor = (x: number) => {
      const magnitude = Math.abs(x);
      return x < 0
        ? TIMELINE.centerHorizontal +
            (TIMELINE.left - TIMELINE.centerHorizontal) * magnitude
        : TIMELINE.centerHorizontal +
            (TIMELINE.right - TIMELINE.centerHorizontal) * magnitude;
    };

    const verticalTimeFor = (y: number) => {
      const magnitude = Math.abs(y);
      return y < 0
        ? TIMELINE.centerVertical +
            (TIMELINE.up - TIMELINE.centerVertical) * magnitude
        : TIMELINE.centerVertical +
            (TIMELINE.down - TIMELINE.centerVertical) * magnitude;
    };

    renderFrame = (now: number) => {
      rafId = null;
      if (!imagesReady) return;

      if (now - lastDrawAt < 1000 / DISPLAY_FPS) {
        scheduleRender();
        return;
      }

      const delta = lastMotionAt ? Math.min(48, now - lastMotionAt) : 16.7;
      lastMotionAt = now;
      const easing = 1 - Math.exp(-delta / 66);
      displayX += (targetX - displayX) * easing;
      displayY += (targetY - displayY) * easing;

      const horizontalMagnitude = Math.abs(displayX);
      const verticalMagnitude = Math.abs(displayY);
      const totalMagnitude = horizontalMagnitude + verticalMagnitude;
      const previousAxis = activeAxis;

      if (totalMagnitude < 0.003) {
        activeAxis = "horizontal";
      } else if (
        activeAxis === "horizontal" &&
        verticalMagnitude > horizontalMagnitude * 1.04
      ) {
        activeAxis = "vertical";
      } else if (
        activeAxis === "vertical" &&
        horizontalMagnitude > verticalMagnitude * 1.04
      ) {
        activeAxis = "horizontal";
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
      context.fillRect(0, 0, stage.width, stage.height);

      const transitionProgress =
        transitionStartedAt < 0
          ? 1
          : clamp((now - transitionStartedAt) / 120, 0, 1);

      if (transitionProgress < 1) {
        drawTimeline(transitionFromTime, 1 - transitionProgress);
        drawTimeline(currentTime, transitionProgress);
      } else {
        drawTimeline(currentTime, 1);
      }

      context.globalAlpha = 1;
      lastDrawAt = now;

      const stillMoving =
        Math.abs(targetX - displayX) > 0.0015 ||
        Math.abs(targetY - displayY) > 0.0015 ||
        transitionProgress < 1;
      if (stillMoving) scheduleRender();
    };

    const setPointerTarget = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rawX = clamp(
        ((event.clientX - bounds.left) / Math.max(bounds.width, 1)) * 2 - 1,
        -1,
        1,
      );
      const rawY = clamp(
        ((event.clientY - bounds.top) / Math.max(bounds.height, 1)) * 2 - 1,
        -1,
        1,
      );
      targetX = responsiveAxis(rawX);
      targetY = responsiveAxis(rawY);
      lastPointerAt = performance.now();
      scheduleRender();
    };

    const refreshBounds = () => {
      bounds = hero.getBoundingClientRect();
    };

    const enterHero = (event: PointerEvent) => {
      refreshBounds();
      setPointerTarget(event);
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
      targetY = responsiveAxis(progress * 0.34);
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
        for (let offset = -6; offset <= 6; offset += 1) {
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
    resizeObserver.observe(hero);
    hero.addEventListener("pointerenter", enterHero);
    hero.addEventListener("pointermove", setPointerTarget, { passive: true });
    hero.addEventListener("pointerleave", resetPointer);
    hero.addEventListener("pointercancel", resetPointer);
    window.addEventListener("blur", resetPointer);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      destroyed = true;
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      hero.removeEventListener("pointerenter", enterHero);
      hero.removeEventListener("pointermove", setPointerTarget);
      hero.removeEventListener("pointerleave", resetPointer);
      hero.removeEventListener("pointercancel", resetPointer);
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
