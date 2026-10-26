import { useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { rng, useCanvasLoop } from './useCanvasLoop';

type P = {
  x: number; y: number; z: number; // target (model units)
  sx: number; sy: number; sz: number; // scattered start
  delay: number;
  dirty: boolean; // contamination point
};

const ease = (k: number) => 1 - Math.pow(1 - k, 4);

/** Build a cap-and-pin insulator string as a point cloud (model units, y down). */
function buildString(count: number, sheds: number, rand: () => number): P[] {
  const pts: P[] = [];
  const pitch = 1;
  const top = -((sheds - 1) * pitch) / 2;
  const R = 0.66;
  const r0 = 0.13;

  const WIDE = 1.4; // real discs are wider than their spacing
  const add = (x: number, y: number, z: number, dirty = false) => {
    x *= WIDE;
    z *= WIDE;
    // scattered start inside a wide sphere
    const u = rand() * Math.PI * 2;
    const v = Math.acos(2 * rand() - 1);
    const rr = 2.2 + rand() * 1.6;
    pts.push({
      x, y, z,
      sx: rr * Math.sin(v) * Math.cos(u),
      sy: rr * Math.cos(v) * 1.4,
      sz: rr * Math.sin(v) * Math.sin(u),
      delay: 0,
      dirty,
    });
  };

  // budget split: 82% discs, rest hardware
  const perShed = Math.floor((count * 0.82) / sheds);
  for (let i = 0; i < sheds; i++) {
    const cy = top + i * pitch;
    for (let k = 0; k < perShed; k++) {
      const th = rand() * Math.PI * 2;
      const pick = rand();
      if (pick < 0.55) {
        // top conical surface
        const r = Math.sqrt(rand() * (R * R - r0 * r0) + r0 * r0);
        const y = cy + 0.05 + ((r - r0) / (R - r0)) * 0.2;
        const n = Math.sin(th * 3 + i * 1.9) + 0.6 * Math.sin(th * 7 - i) + (r / R) * 0.9 + rand() * 0.5;
        add(Math.cos(th) * r, y, Math.sin(th) * r, n > 1.75);
      } else if (pick < 0.68) {
        // rim
        const r = R + (rand() - 0.5) * 0.02;
        add(Math.cos(th) * r, cy + 0.25 + rand() * 0.05, Math.sin(th) * r);
      } else if (pick < 0.86) {
        // two underside ribs (skirts)
        const r = rand() < 0.5 ? 0.34 : 0.5;
        add(Math.cos(th) * r, cy + 0.2 + rand() * 0.16, Math.sin(th) * r);
      } else {
        // cap
        const r = 0.13 + (rand() - 0.5) * 0.01;
        add(Math.cos(th) * r, cy - 0.16 + rand() * 0.22, Math.sin(th) * r);
      }
    }
    // pin between this disc and the next cap
    if (i < sheds - 1) {
      for (let k = 0; k < Math.floor(count * 0.008); k++) {
        const th = rand() * Math.PI * 2;
        add(Math.cos(th) * 0.04, cy + 0.3 + rand() * 0.54, Math.sin(th) * 0.04);
      }
    }
  }
  // end fittings: rod + eye at both ends
  for (const [y0, dir] of [[top - 0.18, -1], [top + (sheds - 1) * pitch + 0.32, 1]] as const) {
    for (let k = 0; k < Math.floor(count * 0.03); k++) {
      const th = rand() * Math.PI * 2;
      if (rand() < 0.55) add(Math.cos(th) * 0.045, y0 + dir * rand() * 0.55, Math.sin(th) * 0.045);
      else add(Math.cos(th) * 0.13, y0 + dir * 0.7 + Math.sin(th) * 0.13, 0);
    }
  }
  // assemble from top to bottom
  for (const p of pts) p.delay = ((p.y - top + 1) / (sheds + 1)) * 0.7 + rand() * 0.25;
  return pts;
}

/** "In focus" visual: an insulator string assembling from scattered points. */
export function InsulatorCloud({ className = '' }: { className?: string }) {
  const reduce = !!useReducedMotion();
  const s = useRef({ pts: [] as P[], clock: 0, scale: 1, mobile: false, roll: 0.45 });

  const ref = useCanvasLoop({
    still: reduce,
    setup(w, h, mobile) {
      const st = s.current;
      const changed = st.mobile !== mobile;
      st.mobile = mobile;
      const sheds = mobile ? 7 : 9;
      if (!st.pts.length || changed) st.pts = buildString(mobile ? 1400 : 3200, sheds, rng(11));
      // the string is laid diagonally across the panel
      st.roll = mobile ? 0.32 : 0.48;
      const La = sheds + 2.4;
      const Wa = 2;
      const bh = La * Math.cos(st.roll) + Wa * Math.sin(st.roll);
      const bw = La * Math.sin(st.roll) + Wa * Math.cos(st.roll);
      st.scale = Math.min((h * 0.86) / bh, (w * 0.86) / bw);
      if (reduce) st.clock = 10;
    },
    draw({ ctx, w, h, t, dt }) {
      const st = s.current;
      st.clock += dt;
      ctx.clearRect(0, 0, w, h);

      const canvas = ctx.canvas;
      const rect = canvas.getBoundingClientRect();
      const vh = window.innerHeight;
      const prog = Math.max(0, Math.min(1, (vh - rect.top) / (vh + rect.height)));
      const rotY = (reduce ? 0.6 : t * 0.14) + (prog - 0.5) * 0.5; // scroll adds up to ~15°
      const rotX = -0.32;
      const cy = Math.cos(rotY), sy = Math.sin(rotY);
      const cx = Math.cos(rotX), sx = Math.sin(rotX);
      const D = 6;
      const sc = st.scale;
      const ox = w / 2;
      const oy = h / 2;

      // inspection scan plane, top → bottom
      const span = st.pts.length ? 5.5 : 1;
      const scanY = reduce ? 0 : ((t * 0.9) % (span * 2)) - span;

      const cr = Math.cos(st.roll);
      const sr = Math.sin(st.roll);
      ctx.globalCompositeOperation = 'lighter';
      for (const p of st.pts) {
        const k = reduce ? 1 : ease(Math.max(0, Math.min(1, (st.clock - p.delay) / 1.4)));
        let x = p.sx + (p.x - p.sx) * k;
        let y = p.sy + (p.y - p.sy) * k;
        let z = p.sz + (p.z - p.sz) * k;
        // rotate Y then X
        const x1 = x * cy - z * sy;
        const z1 = x * sy + z * cy;
        const y1 = y * cx - z1 * sx;
        const z2 = y * sx + z1 * cx;
        x = x1; y = y1; z = z2;
        const f = D / (D + z);
        const px = x * sc * f;
        const py = y * sc * f;
        const X = ox + px * cr - py * sr;
        const Y = oy + px * sr + py * cr;
        const depth = Math.max(0, Math.min(1, 0.5 - z / 1.6));
        const near = k > 0.95 ? Math.max(0, 1 - Math.abs(p.y - scanY) / 0.1) : 0;
        const size = (st.mobile ? 1.3 : 1.5) * f;
        if (p.dirty && k > 0.95) {
          ctx.fillStyle = `rgba(61,216,255,${0.55 + depth * 0.45})`;
        } else if (near > 0) {
          ctx.fillStyle = `rgba(61,216,255,${0.3 + near * 0.7})`;
        } else {
          ctx.fillStyle = `rgba(170,190,220,${(0.12 + depth * 0.55) * (0.35 + k * 0.65)})`;
        }
        ctx.fillRect(X - size / 2, Y - size / 2, size, size);
      }
      ctx.globalCompositeOperation = 'source-over';

      // scan line across the panel
      if (!reduce && st.clock > 1.8) {
        // scan plane drawn perpendicular to the string axis
        ctx.save();
        ctx.translate(ox, oy);
        ctx.rotate(st.roll);
        const half = sc * 2.2;
        const g = ctx.createLinearGradient(-half, 0, half, 0);
        g.addColorStop(0, 'rgba(61,216,255,0)');
        g.addColorStop(0.5, 'rgba(61,216,255,0.45)');
        g.addColorStop(1, 'rgba(61,216,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(-half, scanY * sc, half * 2, 1);
        ctx.restore();
      }
    },
  });

  return <canvas ref={ref} aria-hidden="true" className={`block h-full w-full ${className}`} />;
}
