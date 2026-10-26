// Point-cloud models of grid infrastructure, in model units (y points down).
// Deliberately no robots or drones: only the assets themselves.

export type CP = {
  x: number; y: number; z: number; // target
  sx: number; sy: number; sz: number; // scattered start
  delay: number;
  kind: 0 | 1; // 1 = accent point
  u: number; // position along a conductor 0..1 (or -1)
  lane: number; // conductor / part index
};

type V = [number, number, number];

class Builder {
  pts: CP[] = [];
  constructor(public rand: () => number) {}
  add(x: number, y: number, z: number, kind: 0 | 1 = 0, u = -1, lane = 0) {
    this.pts.push({ x, y, z, sx: 0, sy: 0, sz: 0, delay: 0, kind, u, lane });
  }
  /** points along a segment; density = points per unit length */
  seg(a: V, b: V, density: number, kind: 0 | 1 = 0, jitter = 0.012) {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const n = Math.max(2, Math.round(len * density));
    const r = this.rand;
    for (let i = 0; i < n; i++) {
      const k = r();
      this.add(
        a[0] + (b[0] - a[0]) * k + (r() - 0.5) * jitter,
        a[1] + (b[1] - a[1]) * k + (r() - 0.5) * jitter,
        a[2] + (b[2] - a[2]) * k + (r() - 0.5) * jitter,
        kind,
      );
    }
  }
  /** horizontal disc (insulator shed) centred at (x,y,z) */
  disc(x: number, y: number, z: number, R: number, n: number) {
    const r = this.rand;
    for (let i = 0; i < n; i++) {
      const th = r() * Math.PI * 2;
      const rr = R * Math.sqrt(0.15 + r() * 0.85);
      this.add(x + Math.cos(th) * rr, y + (rr / R) * R * 0.25, z + Math.sin(th) * rr);
    }
  }
  /** lattice section between two square rings (4 legs + X bracing on each face) */
  lattice(y0: number, w0: number, y1: number, w1: number, d: number, brace = true) {
    const c0: V[] = [[-w0, y0, -w0], [w0, y0, -w0], [w0, y0, w0], [-w0, y0, w0]];
    const c1: V[] = [[-w1, y1, -w1], [w1, y1, -w1], [w1, y1, w1], [-w1, y1, w1]];
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4;
      this.seg(c0[i], c1[i], d * 1.4); // legs
      this.seg(c0[i], c0[j], d * 0.8); // ring
      if (brace) {
        this.seg(c0[i], c1[j], d * 0.55);
        this.seg(c0[j], c1[i], d * 0.55);
      }
    }
  }
  /** tapered cross-arm along x from the tower face out to ±span */
  arm(y: number, inner: number, span: number, d: number) {
    for (const s of [-1, 1]) {
      const b0: V[] = [[s * inner, y, -0.16], [s * inner, y, 0.16]];
      const tip: V = [s * span, y, 0];
      const top: V[] = [[s * inner, y - 0.42, -0.12], [s * inner, y - 0.42, 0.12]];
      for (const p of b0) this.seg(p, tip, d);
      for (const p of top) this.seg(p, tip, d * 0.8);
      // zigzag bracing
      const steps = Math.max(2, Math.round((span - inner) / 0.35));
      for (let i = 0; i < steps; i++) {
        const k0 = i / steps;
        const k1 = (i + 1) / steps;
        const yTop = (k: number) => y - 0.42 * (1 - k);
        const x = (k: number) => s * (inner + (span - inner) * k);
        this.seg([x(k0), y, 0.14 * (1 - k0)], [x(k1), yTop(k1), 0.1 * (1 - k1)], d * 0.5);
      }
    }
  }
  /** short insulator string hanging from (x,y,z) */
  string(x: number, y: number, z: number, discs: number, R: number, per: number) {
    this.seg([x, y, z], [x, y + discs * 0.14 + 0.1, z], 40, 0, 0.006);
    for (let i = 0; i < discs; i++) this.disc(x, y + 0.08 + i * 0.14, z, R, per);
  }
}

/** Scatter start positions and set assembly delays along an axis. */
function finalize(b: Builder, axis: 'x' | 'y', reverse = false) {
  const r = b.rand;
  let ext = 0;
  let mn = Infinity;
  let mx = -Infinity;
  for (const p of b.pts) {
    ext = Math.max(ext, Math.hypot(p.x, p.y, p.z));
    const a = p[axis];
    mn = Math.min(mn, a);
    mx = Math.max(mx, a);
  }
  for (const p of b.pts) {
    const u = r() * Math.PI * 2;
    const v = Math.acos(2 * r() - 1);
    const rr = ext * (1.1 + r() * 0.7);
    p.sx = rr * Math.sin(v) * Math.cos(u);
    p.sy = rr * Math.cos(v);
    p.sz = rr * Math.sin(v) * Math.sin(u);
    let k = (p[axis] - mn) / (mx - mn || 1);
    if (reverse) k = 1 - k;
    p.delay = k * 0.7 + r() * 0.25;
  }
  return b.pts;
}

/** Cap-and-pin insulator string (the "In focus" asset). */
export function insulator(count: number, rand: () => number, sheds: number): CP[] {
  const b = new Builder(rand);
  const pitch = 1;
  const top = -((sheds - 1) * pitch) / 2;
  const R = 0.66;
  const r0 = 0.13;
  const W = 1.4;
  const add = (x: number, y: number, z: number, kind: 0 | 1 = 0) => b.add(x * W, y, z * W, kind);
  const perShed = Math.floor((count * 0.82) / sheds);
  for (let i = 0; i < sheds; i++) {
    const cy = top + i * pitch;
    for (let k = 0; k < perShed; k++) {
      const th = rand() * Math.PI * 2;
      const pick = rand();
      if (pick < 0.55) {
        const r = Math.sqrt(rand() * (R * R - r0 * r0) + r0 * r0);
        const y = cy + 0.05 + ((r - r0) / (R - r0)) * 0.2;
        const n = Math.sin(th * 3 + i * 1.9) + 0.6 * Math.sin(th * 7 - i) + (r / R) * 0.9 + rand() * 0.5;
        add(Math.cos(th) * r, y, Math.sin(th) * r, n > 1.75 ? 1 : 0);
      } else if (pick < 0.68) {
        const r = R + (rand() - 0.5) * 0.02;
        add(Math.cos(th) * r, cy + 0.25 + rand() * 0.05, Math.sin(th) * r);
      } else if (pick < 0.86) {
        const r = rand() < 0.5 ? 0.34 : 0.5;
        add(Math.cos(th) * r, cy + 0.2 + rand() * 0.16, Math.sin(th) * r);
      } else {
        const r = 0.13 + (rand() - 0.5) * 0.01;
        add(Math.cos(th) * r, cy - 0.16 + rand() * 0.22, Math.sin(th) * r);
      }
    }
    if (i < sheds - 1) {
      for (let k = 0; k < Math.floor(count * 0.008); k++) {
        const th = rand() * Math.PI * 2;
        add(Math.cos(th) * 0.04, cy + 0.3 + rand() * 0.54, Math.sin(th) * 0.04);
      }
    }
  }
  for (const [y0, dir] of [[top - 0.18, -1], [top + (sheds - 1) * pitch + 0.32, 1]] as const) {
    for (let k = 0; k < Math.floor(count * 0.03); k++) {
      const th = rand() * Math.PI * 2;
      if (rand() < 0.55) add(Math.cos(th) * 0.045, y0 + dir * rand() * 0.55, Math.sin(th) * 0.045);
      else add(Math.cos(th) * 0.13, y0 + dir * 0.7 + Math.sin(th) * 0.13, 0);
    }
  }
  return finalize(b, 'y');
}

/** 01 — Tower head: lattice body, cross-arm and hanging strings. Scanned left → right. */
export function towerHead(count: number, rand: () => number): CP[] {
  const b = new Builder(rand);
  const d = count / 60;
  b.lattice(-1.5, 0.32, -0.45, 0.38, d);
  b.lattice(-0.45, 0.38, 0.6, 0.46, d);
  b.lattice(0.6, 0.46, 1.8, 0.58, d);
  b.lattice(-2.05, 0.06, -1.5, 0.32, d, false);
  b.arm(-0.45, 0.38, 2.3, d);
  for (const x of [-2.15, -1.25, 1.25, 2.15]) {
    b.string(x, -0.45, 0, 5, 0.17, Math.round(d * 2.2));
    b.seg([x, 0.38, -1.2], [x, 0.38, 1.2], d * 1.2, 0, 0.01); // conductor stub
  }
  return finalize(b, 'x');
}

/** 02 — Quad conductor bundle with spacer-dampers (the spacers cycle in accent). */
export function bundle(count: number, rand: () => number): CP[] {
  const b = new Builder(rand);
  const L = 3.2;
  const sag = (x: number) => 0.45 * (1 - (x / L) ** 2);
  const subs: [number, number][] = [[-0.24, -0.24], [-0.24, 0.24], [0.24, 0.24], [0.24, -0.24]];
  const perLine = Math.floor((count * 0.7) / 4);
  subs.forEach(([oy, oz]) => {
    for (let i = 0; i < perLine; i++) {
      const x = -L + rand() * 2 * L;
      const th = rand() * Math.PI * 2;
      b.add(x, sag(x) + oy + Math.cos(th) * 0.025, oz + Math.sin(th) * 0.025);
    }
  });
  const spacerXs = [-2.1, -0.7, 0.7, 2.1];
  const per = Math.floor((count * 0.3) / spacerXs.length);
  spacerXs.forEach((x, lane) => {
    const y0 = sag(x);
    const corners = subs.map(([oy, oz]) => [x, y0 + oy, oz] as V);
    const hub: V = [x, y0, 0];
    const start = b.pts.length;
    for (let i = 0; i < 4; i++) b.seg(hub, corners[i], per / 5, 1, 0.008);
    for (let i = 0; i < 4; i++) b.seg(corners[i], corners[(i + 1) % 4], per / 9, 1, 0.008);
    for (let i = start; i < b.pts.length; i++) b.pts[i].lane = lane;
  });
  return finalize(b, 'x');
}

/** 03 — Full lattice transmission tower, seen slightly from below. Assembles bottom → top. */
export function tower(count: number, rand: () => number): CP[] {
  const b = new Builder(rand);
  const d = count / 75;
  const levels: [number, number][] = [[3.0, 1.15], [2.0, 0.85], [1.0, 0.6], [0.1, 0.42], [-0.7, 0.34], [-1.5, 0.32], [-2.3, 0.3]];
  for (let i = 0; i < levels.length - 1; i++) b.lattice(levels[i + 1][0], levels[i + 1][1], levels[i][0], levels[i][1], d);
  b.lattice(-2.9, 0.06, -2.3, 0.3, d, false);
  b.arm(-1.5, 0.32, 1.75, d * 0.9);
  b.arm(-2.3, 0.3, 1.3, d * 0.9);
  for (const [x, y] of [[-1.65, -1.5], [1.65, -1.5], [-1.2, -2.3], [1.2, -2.3]] as const) b.string(x, y, 0, 4, 0.12, Math.round(d * 1.6));
  return finalize(b, 'y', true);
}

/** 04 — Live three-phase span with shield wire; current flows along the conductors. */
export function liveSpan(count: number, rand: () => number): CP[] {
  const b = new Builder(rand);
  const L = 3.3;
  const per = Math.floor((count * 0.72) / 3);
  [-0.85, 0, 0.85].forEach((z, lane) => {
    for (let i = 0; i < per; i++) {
      const x = -L + rand() * 2 * L;
      const th = rand() * Math.PI * 2;
      b.add(x, 0.6 * (1 - (x / L) ** 2) + Math.cos(th) * 0.02, z + Math.sin(th) * 0.02, 0, (x + L) / (2 * L), lane);
    }
  });
  // shield wire
  for (let i = 0; i < per * 0.35; i++) {
    const x = -L + rand() * 2 * L;
    b.add(x, -0.75 + 0.35 * (1 - (x / L) ** 2), 0);
  }
  // tower tops at both ends
  const d = count / 90;
  for (const s of [-1, 1]) {
    const x = s * L;
    b.seg([x, -0.95, 0], [x, 1.3, -0.22], d);
    b.seg([x, -0.95, 0], [x, 1.3, 0.22], d);
    b.seg([x, -0.02, -1.05], [x, -0.02, 1.05], d * 1.2);
    b.seg([x, -0.3, -0.5], [x, -0.02, -1.05], d * 0.6);
    b.seg([x, -0.3, 0.5], [x, -0.02, 1.05], d * 0.6);
  }
  return finalize(b, 'x');
}
