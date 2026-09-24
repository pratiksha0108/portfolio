'use client';

import { useEffect, useRef } from 'react';

/**
 * Full-screen hero with a cursor/scroll-tracking head-turn animation.
 * Frames live in /public/hero-frames/frame-000.jpg ... frame-099.jpg
 * (100 frames extracted at 10fps from a 10s source clip).
 *
 * Timestamps below were measured directly from the source clip and mark
 * the peak pose for each direction. FPS must match the extraction rate
 * used to generate the frame sequence.
 */

const FPS = 10;
const FRAME_COUNT = 100;
const FRAME_PATH = (i: number) => `/hero-frames/frame-${String(i).padStart(3, '0')}.jpg`;

// Peak-pose timestamps (seconds), measured from the source video
const T = { left: 1.7, center: 3.3, right: 5.0, center2: 6.2, up: 7.3, down: 9.0 };

const MAX_AMPLITUDE = 0.72; // caps how close we get to the most extreme pose (0..1)
const CURVE = 1.6; // >1 = small cursor moves near center produce even smaller head motion
const EASE = 0.14; // lerp factor per frame

export default function HeroCursorTracker() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resizeCanvas() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function drawCover(img: HTMLImageElement) {
      if (!canvas || !ctx) return;
      const cw = canvas.width;
      const ch = canvas.height;
      const iw = img.width;
      const ih = img.height;
      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    }

    // Preload all frames
    const images: HTMLImageElement[] = new Array(FRAME_COUNT);
    let loadedCount = 0;
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (i === 0) drawCover(img);
      };
      img.src = FRAME_PATH(i);
      images[i] = img;
    }
    imagesRef.current = images;

    let targetH = T.center;
    let targetV = T.center2;
    let displayH = T.center;
    let displayV = T.center2;
    let dominantIsH = true;
    let hasInteracted = false;
    let lastDrawnIndex = -1;
    let rafId: number;

    function setTargetFromNormalized(nx: number, ny: number) {
      hasInteracted = true;
      const ax = Math.min(1, Math.abs(nx)) ** CURVE * MAX_AMPLITUDE;
      const ay = Math.min(1, Math.abs(ny)) ** CURVE * MAX_AMPLITUDE;

      targetH = nx <= 0 ? T.center + (T.left - T.center) * ax : T.center + (T.right - T.center) * ax;
      targetV = ny <= 0 ? T.center2 + (T.up - T.center2) * ay : T.center2 + (T.down - T.center2) * ay;

      dominantIsH = Math.abs(nx) >= Math.abs(ny);
    }

    function onMouseMove(e: MouseEvent) {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      setTargetFromNormalized(nx, ny);
    }

    function onMouseLeave() {
      hasInteracted = false;
      targetH = T.center;
      targetV = T.center2;
    }

    function onScroll() {
      if (hasInteracted) return;
      const max = document.body.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      targetV = T.center2 + (T.down - T.center2) * Math.min(p * 1.4, 1) * MAX_AMPLITUDE;
      dominantIsH = false;
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('scroll', onScroll, { passive: true });

    function raf() {
      displayH += (targetH - displayH) * EASE;
      displayV += (targetV - displayV) * EASE;

      const displayTime = dominantIsH ? displayH : displayV;
      let idx = Math.round(displayTime * FPS);
      idx = Math.max(0, Math.min(FRAME_COUNT - 1, idx));

      const img = imagesRef.current[idx];
      if (idx !== lastDrawnIndex && img && img.complete) {
        drawCover(img);
        lastDrawnIndex = idx;
      }
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', background: '#0a0a0f' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(10,10,15,0.15) 0%, rgba(10,10,15,0.05) 40%, rgba(10,10,15,0.55) 100%)',
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'absolute', bottom: 48, left: 40, right: 40, color: '#fff', pointerEvents: 'none' }}>
        <h1 style={{ fontSize: 'clamp(28px, 6vw, 56px)', margin: '0 0 8px 0', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Pratiksha Shirsat
        </h1>
        <p style={{ fontSize: 'clamp(14px, 2vw, 18px)', margin: 0, opacity: 0.85 }}>Developer/Consultant, Chicago</p>
      </div>
    </section>
  );
}
