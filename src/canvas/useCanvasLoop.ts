import { useEffect, useRef } from 'react';

export type Frame = {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
  t: number; // seconds since start
  dt: number; // seconds since last frame
};

type Opts = {
  /** Called on mount and on every resize. Return value is passed to draw. */
  setup: (w: number, h: number, mobile: boolean) => void;
  draw: (f: Frame) => void;
  /** When true, draw a single frame and stop (prefers-reduced-motion). */
  still?: boolean;
};

/**
 * Shared canvas plumbing: DPR scaling, resize, pausing when offscreen or when
 * the tab is hidden, and a 30fps cap on small screens.
 */
export function useCanvasLoop({ setup, draw, still }: Opts) {
  const ref = useRef<HTMLCanvasElement>(null);
  const fns = useRef({ setup, draw });
  fns.current = { setup, draw };

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = true;
    let last = performance.now();
    const t0 = last;
    let mobile = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      mobile = window.innerWidth < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fns.current.setup(w, h, mobile);
      if (still) fns.current.draw({ ctx, w, h, t: 2, dt: 0 });
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const minStep = mobile ? 1000 / 30 : 0;
      if (now - last < minStep) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      fns.current.draw({ ctx, w, h, t: (now - t0) / 1000, dt });
    };

    const start = () => {
      if (still || raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    resize();
    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 120);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      visible ? start() : stop();
    });
    io.observe(canvas);

    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);

    start();
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.clearTimeout(resizeTimer);
    };
  }, [still]);

  return ref;
}

/** Deterministic PRNG so layouts don't jump between renders. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
