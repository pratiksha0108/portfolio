"use client";

import { useEffect, useRef } from "react";

const FRAME_RATE = 10;
const FRAME_COUNT = 100;
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

    let rafId = 0;
    let lastFrameAt = 0;
    let lastPointerAt = 0;
    let destroyed = false;
    let imagesReady = false;

    let targetX = 0;
    let targetY = 0;
    let displayX = 0;
    let displayY = 0;

    const images: HTMLImageElement[] = Array.from(
      { length: FRAME_COUNT },
      () => new Image(),
    );

    const resize = () => {
      const bounds = shell.getBoundingClientRect();
      const width = Math.max(1, Math.round(bounds.width));
      const height = Math.max(1, Math.round(bounds.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    const drawCover = (image: HTMLImageElement, alpha = 1) => {
      if (!image.naturalWidth || !image.naturalHeight) return;

      const scale = Math.max(
        canvas.width / image.naturalWidth,
        canvas.height / image.naturalHeight,
      );
      const drawWidth = image.naturalWidth * scale;
      const drawHeight = image.naturalHeight * scale;
      const drawX = (canvas.width - drawWidth) / 2;
      const drawY = (canvas.height - drawHeight) / 2;

      context.globalAlpha = alpha;
      context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    };

    const drawInterpolatedFrame = (time: number, weight: number) => {
      if (weight <= 0.001) return;
      const rawFrame = clamp(time * FRAME_RATE, 0, FRAME_COUNT - 1);
      const lower = Math.floor(rawFrame);
      const upper = Math.min(FRAME_COUNT - 1, lower + 1);
      const blend = rawFrame - lower;

      drawCover(images[lower], weight * (1 - blend));
      if (upper !== lower && blend > 0.001) {
        drawCover(images[upper], weight * blend);
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!hasFinePointer) return;
      const bounds = shell.getBoundingClientRect();
      const insideHero =
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;

      if (!insideHero) {
        targetX = 0;
        targetY = 0;
        return;
      }

      targetX = clamp(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -1,
        1,
      );
      targetY = clamp(
        ((event.clientY - bounds.top) / bounds.height) * 2 - 1,
        -1,
        1,
      );
      lastPointerAt = performance.now();
    };

    const resetPointer = () => {
      targetX = 0;
      targetY = 0;
    };

    const onScroll = () => {
      if (hasFinePointer && performance.now() - lastPointerAt < 1800) return;
      const bounds = shell.getBoundingClientRect();
      const progress = clamp(-bounds.top / Math.max(bounds.height, 1), 0, 1);
      targetX = 0;
      targetY = progress * 0.42;
    };

    const render = (now: number) => {
      rafId = window.requestAnimationFrame(render);
      if (!imagesReady || now - lastFrameAt < 1000 / 30) return;
      lastFrameAt = now;

      displayX += (targetX - displayX) * 0.105;
      displayY += (targetY - displayY) * 0.105;

      const horizontalMagnitude = Math.pow(Math.abs(displayX), 1.42);
      const verticalMagnitude = Math.pow(Math.abs(displayY), 1.42);

      const horizontalTime =
        displayX < 0
          ? TIMELINE.centerHorizontal +
            (TIMELINE.left - TIMELINE.centerHorizontal) * horizontalMagnitude
          : TIMELINE.centerHorizontal +
            (TIMELINE.right - TIMELINE.centerHorizontal) * horizontalMagnitude;

      const verticalTime =
        displayY < 0
          ? TIMELINE.centerVertical +
            (TIMELINE.up - TIMELINE.centerVertical) * verticalMagnitude
          : TIMELINE.centerVertical +
            (TIMELINE.down - TIMELINE.centerVertical) * verticalMagnitude;

      const totalMagnitude = horizontalMagnitude + verticalMagnitude;
      const nearCenter = totalMagnitude < 0.055;
      const horizontalWeight = nearCenter
        ? 1
        : horizontalMagnitude / Math.max(totalMagnitude, 0.001);
      const verticalWeight = nearCenter ? 0 : 1 - horizontalWeight;

      context.globalAlpha = 1;
      context.fillStyle = "#090b16";
      context.fillRect(0, 0, canvas.width, canvas.height);
      drawInterpolatedFrame(horizontalTime, horizontalWeight);
      drawInterpolatedFrame(verticalTime, verticalWeight);
      context.globalAlpha = 1;
    };

    const loadFrames = async () => {
      await Promise.all(
        images.map(
          (image, index) =>
            new Promise<void>((resolve) => {
              image.onload = () => resolve();
              image.onerror = () => resolve();
              image.src = framePath(index);
            }),
        ),
      );

      if (destroyed) return;
      imagesReady = images.some((image) => image.complete && image.naturalWidth);
      if (imagesReady) shell.classList.add("is-canvas-ready");
    };

    resize();
    void loadFrames();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", resetPointer);
    window.addEventListener("blur", resetPointer);
    window.addEventListener("scroll", onScroll, { passive: true });
    rafId = window.requestAnimationFrame(render);

    return () => {
      destroyed = true;
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", resetPointer);
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
