// Generates chip-like circuit traces on a grid: orthogonal runs with
// 45° jogs, nodes at dead ends, and traces that enter/leave the frame.

export type Pt = { x: number; y: number };
export type Trace = {
  pts: Pt[]; // polyline vertices in px
  cum: number[]; // cumulative length at each vertex
  len: number;
  endNode: boolean; // ends inside the frame with a pad
  startNode: boolean; // starts inside the frame with a pad
  solid: boolean; // solid hairline instead of dashed
};

const DIRS: [number, number][] = [
  [1, 0], [1, 1], [0, 1], [-1, 1],
  [-1, 0], [-1, -1], [0, -1], [1, -1],
];

export function buildTraces(w: number, h: number, cell: number, rand: () => number, density = 1): Trace[] {
  const cols = Math.ceil(w / cell) + 3;
  const rows = Math.ceil(h / cell) + 3;
  const ox = (w - (cols - 3) * cell) / 2 - cell;
  const oy = (h - (rows - 3) * cell) / 2 - cell;
  const occ = new Uint8Array(cols * rows);
  const idx = (c: number, r: number) => r * cols + c;
  const inb = (c: number, r: number) => c >= 0 && r >= 0 && c < cols && r < rows;
  const target = Math.round(((cols * rows) / 38) * density);
  const traces: Trace[] = [];

  for (let attempt = 0; traces.length < target && attempt < target * 12; attempt++) {
    let c: number, r: number, dir: number;
    let startNode = false;
    if (rand() < 0.72) {
      const side = Math.floor(rand() * 4);
      if (side === 0) { c = 0; r = 1 + Math.floor(rand() * (rows - 2)); dir = 0; }
      else if (side === 1) { c = cols - 1; r = 1 + Math.floor(rand() * (rows - 2)); dir = 4; }
      else if (side === 2) { c = 1 + Math.floor(rand() * (cols - 2)); r = 0; dir = 2; }
      else { c = 1 + Math.floor(rand() * (cols - 2)); r = rows - 1; dir = 6; }
    } else {
      c = 2 + Math.floor(rand() * (cols - 4));
      r = 2 + Math.floor(rand() * (rows - 4));
      dir = Math.floor(rand() * 4) * 2;
      startNode = true;
    }
    if (occ[idx(c, r)]) continue;

    const own = new Set<number>([idx(c, r)]);
    const cells: [number, number][] = [[c, r]];
    const verts: [number, number][] = [[c, r]];
    let straight = 0;
    let diagLeft = 0;
    let prevOrth = dir;
    let exited = false;
    const maxSteps = 8 + Math.floor(rand() * 48);

    for (let s = 0; s < maxSteps; s++) {
      const isDiag = dir % 2 === 1;
      if (isDiag) {
        diagLeft--;
        if (diagLeft <= 0) {
          const sign = (dir - prevOrth + 8) % 8 === 1 ? 1 : -1;
          // 70%: jog back to the original heading; 30%: complete a 90° bend
          dir = rand() < 0.7 ? prevOrth : (prevOrth + 2 * sign + 8) % 8;
          verts.push([c, r]);
          straight = 0;
        }
      } else if (straight >= 3 && rand() < 0.13) {
        prevOrth = dir;
        dir = (dir + (rand() < 0.5 ? 1 : 7)) % 8;
        diagLeft = 1 + Math.floor(rand() * 4);
        verts.push([c, r]);
        straight = 0;
      }
      const [dx, dy] = DIRS[dir];
      const nc = c + dx;
      const nr = r + dy;
      if (!inb(nc, nr)) { exited = true; break; }
      const k = idx(nc, nr);
      if (occ[k] || own.has(k)) break;
      // don't cut diagonally through another trace's corner
      if (dir % 2 === 1 && occ[idx(c + dx, r)] && occ[idx(c, r + dy)]) break;
      c = nc; r = nr;
      own.add(k);
      cells.push([c, r]);
      straight++;
    }
    if (cells.length < 5) continue;
    verts.push([c, r]);
    // Edge-starting traces always begin offscreen; make exits continue offscreen too.
    if (exited) {
      const [dx, dy] = DIRS[dir];
      verts.push([c + dx * 2, r + dy * 2]);
    }
    for (const [cc, rr] of cells) occ[idx(cc, rr)] = 1;

    const pts = dedupe(verts).map(([cc, rr]) => ({ x: ox + cc * cell, y: oy + rr * cell }));
    const cum = [0];
    for (let i = 1; i < pts.length; i++) {
      cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
    }
    traces.push({ pts, cum, len: cum[cum.length - 1], endNode: !exited, startNode, solid: rand() < 0.28 });
  }
  return traces;
}

function dedupe(v: [number, number][]) {
  return v.filter((p, i) => i === 0 || p[0] !== v[i - 1][0] || p[1] !== v[i - 1][1]);
}

export function pointAt(t: Trace, d: number): Pt {
  if (d <= 0) return t.pts[0];
  if (d >= t.len) return t.pts[t.pts.length - 1];
  let i = 1;
  while (t.cum[i] < d) i++;
  const a = t.pts[i - 1];
  const b = t.pts[i];
  const k = (d - t.cum[i - 1]) / (t.cum[i] - t.cum[i - 1]);
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
}

/** Polyline points between two distances along a trace. */
export function slice(t: Trace, d0: number, d1: number): Pt[] {
  d0 = Math.max(0, d0);
  d1 = Math.min(t.len, d1);
  if (d1 <= d0) return [];
  const out: Pt[] = [pointAt(t, d0)];
  for (let i = 1; i < t.pts.length - 1; i++) if (t.cum[i] > d0 && t.cum[i] < d1) out.push(t.pts[i]);
  out.push(pointAt(t, d1));
  return out;
}
