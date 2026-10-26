import { useReducedMotion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { buildTraces, pointAt, slice, type Trace } from './circuit';
import { rng, useCanvasLoop } from './useCanvasLoop';

type Pulse = { trace: Trace; d: number; speed: number; tail: number };
type Flash = { x: number; y: number; age: number };

const ACCENT = '61,216,255';
const DEEP = '30,107,232';

/**
 * Hero background: a GPU-like circuit of dashed traces with light pulses
 * running along them, like current in a high-voltage line.
 */
export function CircuitField({ className = '' }: { className?: string }) {
  const reduce = !!useReducedMotion();
  const state = useRef({
    traces: [] as Trace[],
    pulses: [] as Pulse[],
    flashes: [] as Flash[],
    staticLayer: null as HTMLCanvasElement | null,
    maxPulses: 14,
    spawnAt: 0.45,
    mouse: { x: 0, y: 0, tx: 0, ty: 0 },
    mobile: false,
    rand: rng(7),
  });

  useEffect(() => {
    const s = state.current;
    const onMove = (e: PointerEvent) => {
      s.mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      s.mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  const spawn = (s: typeof state.current) => {
    // weight by length so long traces carry more current
    const total = s.traces.reduce((a, t) => a + t.len, 0);
    let pick = s.rand() * total;
    let trace = s.traces[0];
    for (const t of s.traces) {
      pick -= t.len;
      if (pick <= 0) { trace = t; break; }
    }
    s.pulses.push({
      trace,
      d: 0,
      speed: (s.mobile ? 90 : 120) + s.rand() * 140,
      tail: 70 + s.rand() * 70,
    });
  };

  const ref = useCanvasLoop({
    still: reduce,
    setup(w, h, mobile) {
      const s = state.current;
      s.mobile = mobile;
      s.rand = rng(7);
      const cell = mobile ? 30 : 26;
      s.traces = buildTraces(w, h, cell, s.rand, mobile ? 0.55 : 1);
      s.maxPulses = mobile ? 6 : 16;
      s.pulses = [];
      s.flashes = [];

      // Pre-render the static layer once per resize.
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
      const off = document.createElement('canvas');
      off.width = Math.round((w + 40) * dpr);
      off.height = Math.round((h + 40) * dpr);
      const c = off.getContext('2d')!;
      c.scale(dpr, dpr);
      c.translate(20, 20);

      // faint dot matrix
      c.fillStyle = 'rgba(125,139,163,0.10)';
      for (let x = (w % cell) / 2; x < w; x += cell)
        for (let y = (h % cell) / 2; y < h; y += cell) c.fillRect(x - 0.5, y - 0.5, 1, 1);

      for (const t of s.traces) {
        c.beginPath();
        c.moveTo(t.pts[0].x, t.pts[0].y);
        for (let i = 1; i < t.pts.length; i++) c.lineTo(t.pts[i].x, t.pts[i].y);
        c.lineWidth = 1;
        if (t.solid) {
          c.setLineDash([]);
          c.strokeStyle = 'rgba(52,75,110,0.6)';
        } else {
          c.setLineDash([2, 5]);
          c.strokeStyle = 'rgba(62,90,132,0.9)';
        }
        c.stroke();
        c.setLineDash([]);
        const pads = [];
        if (t.endNode) pads.push(t.pts[t.pts.length - 1]);
        if (t.startNode) pads.push(t.pts[0]);
        for (const p of pads) {
          c.beginPath();
          c.arc(p.x, p.y, 2.6, 0, Math.PI * 2);
          c.fillStyle = '#0a1526';
          c.fill();
          c.strokeStyle = 'rgba(70,100,145,0.95)';
          c.stroke();
        }
      }
      s.staticLayer = off;

      // reduced motion: freeze a few pulses mid-flight
      if (reduce) {
        for (let i = 0; i < s.maxPulses; i++) {
          spawn(s);
          const p = s.pulses[s.pulses.length - 1];
          p.d = s.rand() * p.trace.len;
        }
      }
    },
    draw({ ctx, w, h, t, dt }) {
      const s = state.current;
      const m = s.mouse;
      m.x += (m.tx - m.x) * 0.04;
      m.y += (m.ty - m.y) * 0.04;
      const px = s.mobile ? 0 : -m.x * 8;
      const py = s.mobile ? 0 : -m.y * 8;

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(px, py);
      // fade the circuit in during the first 0.4s
      ctx.globalAlpha = reduce ? 1 : Math.min(1, t / 0.4);
      if (s.staticLayer) ctx.drawImage(s.staticLayer, -20, -20, w + 40, h + 40);
      ctx.globalAlpha = 1;

      // spawn pulses, staggered
      if (!reduce && t > s.spawnAt && s.pulses.length < s.maxPulses) {
        spawn(s);
        s.spawnAt = t + 0.15 + s.rand() * 0.5;
      }

      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (let i = s.pulses.length - 1; i >= 0; i--) {
        const p = s.pulses[i];
        p.d += p.speed * dt;
        const head = Math.min(p.d, p.trace.len);
        // tail drawn in segments for a gradient fade
        const SEG = 10;
        for (let k = 0; k < SEG; k++) {
          const a = p.d - p.tail + (p.tail * k) / SEG;
          const b = p.d - p.tail + (p.tail * (k + 1)) / SEG;
          const pts = slice(p.trace, a, b);
          if (pts.length < 2) continue;
          const f = (k + 1) / SEG;
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let j = 1; j < pts.length; j++) ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = f > 0.6 ? `rgba(${ACCENT},${f * 0.95})` : `rgba(${DEEP},${f * 0.9})`;
          ctx.lineWidth = 1.1 + f * 0.7;
          ctx.stroke();
        }
        if (p.d < p.trace.len) {
          const hp = pointAt(p.trace, head);
          const g = ctx.createRadialGradient(hp.x, hp.y, 0, hp.x, hp.y, 12);
          g.addColorStop(0, `rgba(${ACCENT},0.55)`);
          g.addColorStop(1, `rgba(${ACCENT},0)`);
          ctx.fillStyle = g;
          ctx.fillRect(hp.x - 12, hp.y - 12, 24, 24);
          ctx.fillStyle = 'rgba(220,250,255,0.95)';
          ctx.fillRect(hp.x - 1, hp.y - 1, 2, 2);
        }
        if (!reduce && p.d - p.tail > p.trace.len) {
          if (p.trace.endNode) {
            const e = p.trace.pts[p.trace.pts.length - 1];
            s.flashes.push({ x: e.x, y: e.y, age: 0 });
          }
          s.pulses.splice(i, 1);
        }
      }

      // node flashes when current arrives
      for (let i = s.flashes.length - 1; i >= 0; i--) {
        const f = s.flashes[i];
        f.age += dt;
        const k = f.age / 0.9;
        if (k >= 1) { s.flashes.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(f.x, f.y, 3 + k * 10, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${ACCENT},${(1 - k) * 0.7})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(f.x, f.y, 2.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT},${1 - k})`;
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
    },
  });

  return <canvas ref={ref} aria-hidden="true" className={`block h-full w-full ${className}`} />;
}
