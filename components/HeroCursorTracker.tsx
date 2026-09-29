"use client";

import { useEffect, useRef } from "react";
import {
  NEUTRAL_FRAME, PATCH, SHEET_COUNT, advancePose, clamp, coverRect, damp,
  poseFrame, responsiveAxis, spriteFrame, type Pose,
} from "./hero-motion";

const BASE_PATH = process.env.NODE_ENV === "production" ? "/portfolio" : "";
const assetPath = (name: string) => `${BASE_PATH}/hero-motion/${name}.webp`;

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
      let targetX = 0, targetY = 0, displayX = 0, displayY = 0;
      let pose: Pose = { axis: "horizontal", position: 0 };
      let crop = coverRect(bounds.width, bounds.height);
      let ready = false;
      let paintedFrame = -1;
      let poster: HTMLImageElement | undefined;
      const sheets: HTMLImageElement[] = [];
      const pixelRatio = () => Math.min(window.devicePixelRatio || 1, 1.5);

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
      const loadImage = async (name: string) => {
        const image = new Image();
        image.decoding = "async";
        image.src = assetPath(name);
        await image.decode();
        return image;
      };
      const paint = (index: number) => {
        if (!ready || index === paintedFrame) return;
        const frame = spriteFrame(index);
        const scale = crop.width / 1280;
        // Only the character region changes. The sky and city are painted once
        // on resize; each new pose needs one opaque draw and no face blending.
        context.drawImage(sheets[frame.sheet], frame.x, frame.y, PATCH.width, PATCH.height,
          crop.x + PATCH.x * scale, crop.y + PATCH.y * scale,
          PATCH.width * scale, PATCH.height * scale);
        paintedFrame = index;
      };
      const paintBackdrop = () => {
        if (!poster) return;
        context.drawImage(poster, crop.x, crop.y, crop.width, crop.height);
        paintedFrame = -1;
        if (ready) paint(poseFrame(pose.axis, pose.position));
        shell.classList.add("is-canvas-ready");
      };

      const renderFrame = (now: number) => {
        rafId = null;
        if (destroyed || !visible || document.hidden) return;
        const delta = lastMotionAt ? Math.min(32, now - lastMotionAt) : 1000 / 60;
        displayX = damp(displayX, targetX, delta);
        displayY = damp(displayY, targetY, delta);
        if (ready) {
          pose = advancePose(pose, targetX, targetY, delta);
          paint(poseFrame(pose.axis, pose.position));
        }
        // The compositor handles subtle continuous movement without repainting
        // a full-screen canvas each refresh. Snap to physical pixels for clarity.
        const ratio = pixelRatio();
        const x = Math.round(displayX * 6 * ratio) / ratio;
        const y = Math.round(displayY * 5 * ratio) / ratio;
        stage.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        lastMotionAt = now;
        const wanted = pose.axis === "horizontal" ? targetX : targetY;
        if ((ready && pose.position !== wanted) || displayX !== targetX || displayY !== targetY) scheduleRender();
        else lastMotionAt = 0;
      };

      const resize = () => {
        bounds = hero.getBoundingClientRect();
        const width = Math.max(1, Math.round(bounds.width));
        const height = Math.max(1, Math.round(bounds.height));
        crop = coverRect(width, height);
        fallback.style.backgroundSize = `${crop.width}px ${crop.height}px`;
        fallback.style.backgroundPosition = `${crop.x}px ${crop.y}px`;
        const pixelWidth = Math.round(width * pixelRatio());
        const pixelHeight = Math.round(height * pixelRatio());
        // Reassigning dimensions clears the canvas, even when unchanged.
        if (stage.width !== pixelWidth || stage.height !== pixelHeight) {
          stage.width = pixelWidth;
          stage.height = pixelHeight;
          context.setTransform(pixelWidth / width, 0, 0, pixelHeight / height, 0, 0);
          context.imageSmoothingEnabled = true;
          context.imageSmoothingQuality = "high";
        }
        paintBackdrop();
        scheduleRender();
      };
      const resetPointer = () => { targetX = 0; targetY = 0; scheduleRender(); };
      const setPointerTarget = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        targetX = responsiveAxis(clamp((event.clientX - bounds.left) / bounds.width * 2 - 1, -1, 1));
        targetY = responsiveAxis(clamp((event.clientY - bounds.top) / bounds.height * 2 - 1, -1, 1));
        scheduleRender();
      };
      const enterHero = (event: PointerEvent) => { bounds = hero.getBoundingClientRect(); setPointerTarget(event); };
      const onScroll = () => { bounds = hero.getBoundingClientRect(); resetPointer(); };
      const onVisibility = () => { resetPointer(); if (document.hidden) stopRender(); };
      const resizeObserver = new ResizeObserver(resize);
      const visibilityObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) scheduleRender();
        else { resetPointer(); stopRender(); }
      });

      resize();
      resizeObserver.observe(hero);
      visibilityObserver.observe(hero);
      hero.addEventListener("pointerenter", enterHero);
      hero.addEventListener("pointermove", setPointerTarget, { passive: true });
      hero.addEventListener("pointerleave", resetPointer);
      hero.addEventListener("pointercancel", resetPointer);
      window.addEventListener("blur", resetPointer);
      window.addEventListener("resize", resize, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);

      void (async () => {
        try {
          const neutral = await loadImage("neutral");
          if (destroyed) return;
          poster = neutral;
          paintBackdrop();
          // Decode the compact pose sheets before enabling head turns. Pointer
          // movement continues as parallax while loading, with no mid-turn I/O.
          const loaded = await Promise.all(Array.from({ length: SHEET_COUNT }, (_, i) => loadImage(`poses-${i}`)));
          if (destroyed) return;
          sheets.push(...loaded);
          ready = true;
          pose = { axis: "horizontal", position: 0 };
          paint(NEUTRAL_FRAME);
          scheduleRender();
        } catch {
          // Keep the sharp poster and lightweight parallax if an asset fails.
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
        window.removeEventListener("resize", resize);
        window.removeEventListener("scroll", onScroll);
        document.removeEventListener("visibilitychange", onVisibility);
        shell.classList.remove("is-canvas-ready");
        stage.style.transform = "";
        poster = undefined;
        sheets.length = 0;
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
      <div className="hero-fallback-frame" style={{ backgroundImage: `url(${assetPath("neutral")})` }} />
      <canvas ref={canvasRef} className="hero-canvas" />
      <div className="hero-media-vignette" />
      <div className="hero-media-grain" />
    </div>
  );
}
