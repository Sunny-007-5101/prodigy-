import { useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import type { CP } from './shapes';
import { rng, useCanvasLoop } from './useCanvasLoop';

export type CloudConfig = {
  build: (count: number, rand: () => number, mobile: boolean) => CP[];
  count: [desktop: number, mobile: number];
  seed?: number;
  /** camera pitch (rad) */
  rotX: number;
  /** screen-space roll (rad) */
  roll?: number;
  /** Y rotation: continuous spin speed, or oscillation around `yaw` */
  spin?: number;
  yaw?: number;
  sway?: number; // oscillation amplitude (rad)
  /** inspection sweep along a model axis */
  scan?: 'x' | 'y' | 'y-up';
  /** current flowing along points that have u >= 0 */
  flow?: boolean;
  /** accent parts take turns lighting up (by lane) */
  cycle?: number;
  /** draw the scan plane as a line (perpendicular to the y axis) */
  scanLine?: boolean;
  pointSize?: number;
  pad?: number;
};

const ease = (k: number) => 1 - Math.pow(1 - k, 4);

/** Generic 3D point-cloud renderer: assembles from scatter, rotates, scans. */
export function PointCloud({ config, className = '' }: { config: CloudConfig; className?: string }) {
  const reduce = !!useReducedMotion();
  const s = useRef({
    pts: [] as CP[],
    clock: 0,
    scale: 1,
    cx: 0,
    cy: 0,
    mobile: false,
    built: false,
    axisMin: 0,
    axisMax: 1,
  });
  const c = config;

  const rotYAt = (t: number) => {
    if (reduce) return c.yaw ?? 0.6;
    if (c.sway != null) return (c.yaw ?? 0) + Math.sin(t * (c.spin ?? 0.4)) * c.sway;
    return (c.yaw ?? 0) + t * (c.spin ?? 0.14);
  };

  const ref = useCanvasLoop({
    still: reduce,
    setup(w, h, mobile) {
      const st = s.current;
      if (!st.built || st.mobile !== mobile) {
        st.pts = c.build(mobile ? c.count[1] : c.count[0], rng(c.seed ?? 11), mobile);
        st.built = true;
      }
      st.mobile = mobile;
      const ax = c.scan === 'x' ? 'x' : 'y';
      st.axisMin = Math.min(...st.pts.map((p) => p[ax]));
      st.axisMax = Math.max(...st.pts.map((p) => p[ax]));

      // Fit: sample the rotation range and take the largest projected bounds.
      const roll = c.roll ?? 0;
      const cr = Math.cos(roll), sr = Math.sin(roll);
      const cxr = Math.cos(c.rotX), sxr = Math.sin(c.rotX);
      const angles =
        c.sway != null
          ? [-1, -0.5, 0, 0.5, 1].map((k) => (c.yaw ?? 0) + k * c.sway!)
          : Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2);
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      for (const a of angles) {
        const ca = Math.cos(a), sa = Math.sin(a);
        for (let i = 0; i < st.pts.length; i += 3) {
          const p = st.pts[i];
          const x1 = p.x * ca - p.z * sa;
          const z1 = p.x * sa + p.z * ca;
          const y1 = p.y * cxr - z1 * sxr;
          const X = x1 * cr - y1 * sr;
          const Y = x1 * sr + y1 * cr;
          if (X < minX) minX = X; if (X > maxX) maxX = X;
          if (Y < minY) minY = Y; if (Y > maxY) maxY = Y;
        }
      }
      const pad = c.pad ?? 0.86;
      st.scale = Math.min((w * pad) / (maxX - minX), (h * pad) / (maxY - minY));
      st.cx = (minX + maxX) / 2;
      st.cy = (minY + maxY) / 2;
      if (reduce) st.clock = 10;
    },
    draw({ ctx, w, h, t, dt }) {
      const st = s.current;
      st.clock += dt;
      ctx.clearRect(0, 0, w, h);

      const rect = ctx.canvas.getBoundingClientRect();
      const vh = window.innerHeight;
      const prog = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
      const rotY = rotYAt(t) + (prog - 0.5) * 0.35;
      const cy = Math.cos(rotY), sy = Math.sin(rotY);
      const cx = Math.cos(c.rotX), sx = Math.sin(c.rotX);
      const roll = c.roll ?? 0;
      const cr = Math.cos(roll), sr = Math.sin(roll);
      const D = 7;
      const sc = st.scale;
      const ox = w / 2 - st.cx * sc;
      const oy = h / 2 - st.cy * sc;
      const size0 = (c.pointSize ?? 1.5) * (st.mobile ? 0.9 : 1);

      // sweep position along the scan axis
      const span = st.axisMax - st.axisMin;
      let scanPos = Infinity;
      if (c.scan && !reduce && st.clock > 1.6) {
        const k = ((st.clock - 1.6) * 0.22) % 1.25; // pause between sweeps
        scanPos = c.scan === 'y-up' ? st.axisMax - k * span : st.axisMin + k * span;
      }
      const band = span * 0.035;
      const ax = c.scan === 'x' ? 'x' : 'y';
      const flowT = st.clock * 0.32;
      const active = c.cycle ? Math.floor(st.clock / c.cycle) % 4 : -1;

      ctx.globalCompositeOperation = 'lighter';
      for (const p of st.pts) {
        const k = reduce ? 1 : ease(Math.max(0, Math.min(1, (st.clock - p.delay) / 1.4)));
        const x0 = p.sx + (p.x - p.sx) * k;
        const y0 = p.sy + (p.y - p.sy) * k;
        const z0 = p.sz + (p.z - p.sz) * k;
        const x1 = x0 * cy - z0 * sy;
        const z1 = x0 * sy + z0 * cy;
        const y1 = y0 * cx - z1 * sx;
        const z2 = y0 * sx + z1 * cx;
        const f = D / (D + z2);
        const px = x1 * sc * f;
        const py = y1 * sc * f;
        const X = ox + px * cr - py * sr;
        const Y = oy + px * sr + py * cr;
        const depth = Math.max(0, Math.min(1, 0.55 - z2 / 3));
        const settled = k > 0.95;

        let hot = 0;
        if (settled && scanPos !== Infinity) hot = Math.max(0, 1 - Math.abs(p[ax] - scanPos) / band);
        if (settled && c.flow && p.u >= 0) {
          let dd = Math.abs(p.u - ((flowT + p.lane * 0.37) % 1));
          dd = Math.min(dd, 1 - dd);
          hot = Math.max(hot, 1 - dd / 0.07);
        }

        if (p.kind === 1 && settled) {
          const a = c.cycle ? (p.lane === active ? 0.95 : 0.28) : 0.55 + depth * 0.45;
          ctx.fillStyle = `rgba(61,216,255,${a})`;
        } else if (hot > 0) {
          ctx.fillStyle = `rgba(61,216,255,${0.3 + hot * 0.7})`;
        } else {
          ctx.fillStyle = `rgba(175,196,228,${(0.16 + depth * 0.6) * (0.35 + k * 0.65)})`;
        }
        const sz = size0 * f * (hot > 0.6 ? 1.3 : 1);
        ctx.fillRect(X - sz / 2, Y - sz / 2, sz, sz);
      }
      ctx.globalCompositeOperation = 'source-over';

      if (c.scanLine && scanPos !== Infinity && c.scan !== 'x') {
        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(roll);
        const half = sc * 2.2;
        const g = ctx.createLinearGradient(-half, 0, half, 0);
        g.addColorStop(0, 'rgba(61,216,255,0)');
        g.addColorStop(0.5, 'rgba(61,216,255,0.45)');
        g.addColorStop(1, 'rgba(61,216,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(-half, scanPos * sc, half * 2, 1);
        ctx.restore();
      }
    },
  });

  return <canvas ref={ref} aria-hidden="true" className={`block h-full w-full ${className}`} />;
}
