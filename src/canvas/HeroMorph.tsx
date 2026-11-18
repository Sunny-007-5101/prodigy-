import { useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { bundle, insulator, towerHead, type CP } from './shapes';
import { rng, useCanvasLoop } from './useCanvasLoop';

/**
 * Hero loop, no text: one point cloud that keeps re-forming into the grid's
 * components, in the same style as the "What we solve" tiles:
 * insulator string → conductor bundle → tower head → …
 */

type Stage = {
  build: (n: number, r: () => number) => CP[];
  rotX: number;
  roll: number;
  yaw: number;
  /** inspection sweep axis while holding */
  scan?: 'x' | 'y';
  /** accent parts take turns lighting up */
  cycle?: boolean;
};

const STAGES: Stage[] = [
  { build: (n, r) => insulator(n, r, 8), rotX: -0.32, roll: 0.5, yaw: 0.4, scan: 'y' },
  { build: (n, r) => bundle(n, r), rotX: -0.3, roll: -0.08, yaw: 0.65, cycle: true },
  { build: (n, r) => towerHead(n, r), rotX: -0.26, roll: 0, yaw: 0.5, scan: 'x' },
];

const HOLD = 4.4; // seconds a component stays formed
const MORPH = 1.8; // seconds to re-form into the next one
const STEP = HOLD + MORPH;
const EXTENT = 4.2; // every shape is normalised to this size

type P = { x: number; y: number; z: number; kind: 0 | 1; lane: number };

const easeIO = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const clamp01 = (k: number) => Math.max(0, Math.min(1, k));

/** Build a shape with exactly n points, centred and scaled to EXTENT, ordered along x for a sweeping morph. */
function prepare(stage: Stage, n: number, seed: number): P[] {
  const r = rng(seed);
  let pts = stage.build(Math.round(n * 1.05), r).map((p) => ({ x: p.x, y: p.y, z: p.z, kind: p.kind, lane: p.lane }));
  // resample to exactly n
  while (pts.length < n) pts.push({ ...pts[Math.floor(r() * pts.length)] });
  for (let i = pts.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [pts[i], pts[j]] = [pts[j], pts[i]];
  }
  pts = pts.slice(0, n);
  let mnx = Infinity, mxx = -Infinity, mny = Infinity, mxy = -Infinity, mnz = Infinity, mxz = -Infinity;
  for (const p of pts) {
    mnx = Math.min(mnx, p.x); mxx = Math.max(mxx, p.x);
    mny = Math.min(mny, p.y); mxy = Math.max(mxy, p.y);
    mnz = Math.min(mnz, p.z); mxz = Math.max(mxz, p.z);
  }
  const s = EXTENT / Math.max(mxx - mnx, mxy - mny, mxz - mnz);
  const cx = (mnx + mxx) / 2, cy = (mny + mxy) / 2, cz = (mnz + mxz) / 2;
  for (const p of pts) {
    p.x = (p.x - cx) * s;
    p.y = (p.y - cy) * s;
    p.z = (p.z - cz) * s;
  }
  // after roll the long axis runs diagonally; order by that so points travel coherently
  const cr = Math.cos(stage.roll), sr = Math.sin(stage.roll);
  return pts.sort((a, b) => a.x * cr - a.y * sr - (b.x * cr - b.y * sr));
}

export function HeroMorph({ className = '' }: { className?: string }) {
  const reduce = !!useReducedMotion();
  const s = useRef({
    shapes: [] as P[][],
    noise: [] as [number, number, number][],
    mobile: false,
    built: false,
    lanes: [] as number[],
  });

  const ref = useCanvasLoop({
    still: reduce,
    setup(_w, _h, mobile) {
      const st = s.current;
      if (st.built && st.mobile === mobile) return;
      const n = mobile ? 1700 : 3400;
      st.shapes = STAGES.map((stg, i) => prepare(stg, n, 31 + i * 7));
      const r = rng(99);
      st.noise = Array.from({ length: n }, () => [r() - 0.5, r() - 0.5, r() - 0.5]);
      st.lanes = st.shapes.map((sh) => Math.max(1, ...sh.filter((p) => p.kind === 1).map((p) => p.lane + 1)));
      st.mobile = mobile;
      st.built = true;
    },
    draw({ ctx, w, h, t }) {
      const st = s.current;
      const time = reduce ? 2 : t + HOLD * 0.15;
      const idx = Math.floor(time / STEP) % STAGES.length;
      const nxt = (idx + 1) % STAGES.length;
      const local = time % STEP;
      const m = local > HOLD ? easeIO(clamp01((local - HOLD) / MORPH)) : 0;
      const A = st.shapes[idx], B = st.shapes[nxt];
      const sa = STAGES[idx], sb = STAGES[nxt];

      const lerp = (a: number, b: number) => a + (b - a) * m;
      const rotX = lerp(sa.rotX, sb.rotX);
      const roll = lerp(sa.roll, sb.roll);
      const rotY = lerp(sa.yaw, sb.yaw) + (reduce ? 0 : Math.sin(t * 0.32) * 0.38);
      const cyR = Math.cos(rotY), syR = Math.sin(rotY);
      const cx = Math.cos(rotX), sx = Math.sin(rotX);
      const cr = Math.cos(roll), sr = Math.sin(roll);
      const sc = (Math.min(w, h) * (st.mobile ? 0.92 : 0.86)) / EXTENT;
      const D = 7;
      const size0 = st.mobile ? 1.5 : 1.7;

      // inspection sweep while a component is formed
      let scanPos = Infinity;
      const scanAx = sa.scan;
      if (scanAx && !reduce && local > 0.6 && local < HOLD) {
        const k = (local - 0.6) / (HOLD - 1.0);
        scanPos = -EXTENT / 2 + k * EXTENT;
      }
      const band = EXTENT * 0.035;
      const active = sa.cycle ? Math.floor(local / 0.9) % st.lanes[idx] : -1;
      const formed = 1 - Math.sin(m * Math.PI); // 0 mid-morph

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < A.length; i++) {
        const a = A[i], b = B[i];
        const nz = st.noise[i];
        const lift = Math.sin(m * Math.PI) * 0.9; // particles drift apart mid-morph
        const x0 = a.x + (b.x - a.x) * m + nz[0] * lift;
        const y0 = a.y + (b.y - a.y) * m + nz[1] * lift;
        const z0 = a.z + (b.z - a.z) * m + nz[2] * lift;
        const x1 = x0 * cyR - z0 * syR;
        const z1 = x0 * syR + z0 * cyR;
        const y1 = y0 * cx - z1 * sx;
        const z2 = y0 * sx + z1 * cx;
        const f = D / (D + z2);
        const px = x1 * sc * f;
        const py = y1 * sc * f;
        const X = w / 2 + px * cr - py * sr;
        const Y = h / 2 + px * sr + py * cr;
        const depth = clamp01(0.55 - z2 / 3);

        const p = m < 0.5 ? a : b;
        let hot = 0;
        if (scanPos !== Infinity && m === 0) hot = Math.max(0, 1 - Math.abs(a[scanAx!] - scanPos) / band);

        if (p.kind === 1) {
          const lit = sa.cycle && m === 0 ? (a.lane === active ? 0.95 : 0.28) : 0.5 + depth * 0.45;
          ctx.fillStyle = `rgba(61,216,255,${lit * (0.35 + formed * 0.65)})`;
        } else if (hot > 0) {
          ctx.fillStyle = `rgba(61,216,255,${0.3 + hot * 0.7})`;
        } else {
          ctx.fillStyle = `rgba(175,196,228,${(0.18 + depth * 0.62) * (0.55 + formed * 0.45)})`;
        }
        const sz = size0 * f * (hot > 0.6 ? 1.35 : 1);
        ctx.fillRect(X - sz / 2, Y - sz / 2, sz, sz);
      }
      ctx.globalCompositeOperation = 'source-over';
    },
  });

  return <canvas ref={ref} aria-hidden="true" className={`block h-full w-full ${className}`} />;
}
