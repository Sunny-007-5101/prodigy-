import { useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { rng, useCanvasLoop } from './useCanvasLoop';

/**
 * Hero loop (≈9s), almost no text: a drone flies to a high-voltage line,
 * scans an insulator string, finds contamination, cleans it, and leaves —
 * then current flows down the line again.
 *
 * Scene space is 1000 × 700; it is scaled to fit the canvas.
 */

const LOOP = 9.5;
const ACC = '61,216,255';
const INK = '232,240,250';
const DIRT = '196,164,112'; // dull contamination, the only non-blue tone

const ease = (k: number) => (k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.pow(1 - k, 3));
const easeIO = (k: number) => (k <= 0 ? 0 : k >= 1 ? 1 : k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const clamp01 = (k: number) => Math.max(0, Math.min(1, k));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

// insulator string geometry
const IX = 770; // string axis x
const ITOP = 196;
const DISCS = 7;
const PITCH = 28;
const discY = (i: number) => ITOP + 22 + i * PITCH;
const LINE_Y = discY(DISCS - 1) + 30; // conductor clamp

// timeline (seconds within the loop)
const T = {
  arrive: [0, 2.1],
  scan: [2.3, 4.0],
  approach: [4.0, 4.5],
  clean: [4.5, 6.9],
  current: [6.9, 8.2],
  leave: [7.6, 9.2],
};

type Dot = { a: number; r: number; dirt: boolean };

export function DroneScene({ className = '' }: { className?: string }) {
  const reduce = !!useReducedMotion();
  const s = useRef({
    discs: [] as Dot[][],
    spray: [] as { x: number; y: number; vx: number; vy: number; life: number }[],
    lastSprayT: 0,
    rand: rng(5),
  });

  const ref = useCanvasLoop({
    still: reduce,
    setup() {
      const st = s.current;
      if (st.discs.length) return;
      const r = rng(21);
      for (let i = 0; i < DISCS; i++) {
        const dots: Dot[] = [];
        for (let k = 0; k < 64; k++) {
          const a = r() * Math.PI * 2;
          const rr = 0.35 + r() * 0.65;
          // contamination clusters on the upper surface of some discs
          const dirt = Math.sin(a * 2 + i) > 0.15 && r() < 0.55 && i % 3 !== 1;
          dots.push({ a, r: rr, dirt });
        }
        st.discs.push(dots);
      }
    },
    draw({ ctx, w, h, t, dt }) {
      const st = s.current;
      const time = reduce ? 6.95 : t % LOOP;
      // view box: crop tight on the action (x 400–1000, y 110–580)
      const VX = 400, VY = 110, VW = 600, VH = 470;
      const sc = Math.min(w / VW, h / VH);
      const ox = (w - VW * sc) / 2 - VX * sc;
      const oy = (h - VH * sc) / 2 - VY * sc;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(ox, oy);
      ctx.scale(sc, sc);

      const ph = (k: number[]) => clamp01((time - k[0]) / (k[1] - k[0]));
      const cleanP = ph(T.clean);
      const scanP = ph(T.scan);
      const discClean = (i: number) => clamp01(cleanP * DISCS - i);

      // ---- tower cross-arm (lattice) on the right, going off frame
      ctx.lineWidth = 1.2;
      ctx.strokeStyle = `rgba(${INK},0.32)`;
      ctx.beginPath();
      ctx.moveTo(700, ITOP - 6); ctx.lineTo(1040, ITOP - 6);
      ctx.moveTo(700, ITOP - 6); ctx.lineTo(1040, ITOP - 52);
      for (let x = 720; x < 1040; x += 34) {
        const yTop = ITOP - 6 - ((x - 700) / 340) * 46;
        ctx.moveTo(x, ITOP - 6); ctx.lineTo(x + 17, yTop - 4);
      }
      ctx.stroke();
      // tower body
      ctx.beginPath();
      ctx.moveTo(930, ITOP - 70); ctx.lineTo(905, 720);
      ctx.moveTo(990, ITOP - 70); ctx.lineTo(1015, 720);
      for (let y = ITOP; y < 720; y += 60) {
        ctx.moveTo(930 - (y - ITOP) * 0.045, y); ctx.lineTo(990 + (y - ITOP) * 0.045, y + 60);
        ctx.moveTo(990 + (y - ITOP) * 0.045, y); ctx.lineTo(930 - (y - ITOP) * 0.045, y + 60);
      }
      ctx.strokeStyle = `rgba(${INK},0.14)`;
      ctx.stroke();

      // ---- conductor: from the clamp, sagging off to the left
      const conductor = (k: number) => {
        const x = lerp(IX, -40, k);
        const y = LINE_Y + Math.sin(k * Math.PI) * 70 - k * 30;
        return [x, y] as const;
      };
      ctx.beginPath();
      for (let k = 0; k <= 1.0001; k += 0.02) {
        const [x, y] = conductor(k);
        k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${INK},0.45)`;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      // a second phase further back
      ctx.beginPath();
      for (let k = 0; k <= 1.0001; k += 0.02) {
        const x = lerp(1040, -40, k);
        const y = ITOP - 40 + Math.sin(k * Math.PI) * 90;
        k === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${INK},0.12)`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // current pulse once the insulator is clean
      const curP = ph(T.current);
      if (curP > 0 && curP < 1) {
        ctx.globalCompositeOperation = 'lighter';
        for (let j = 0; j < 14; j++) {
          const k = clamp01(curP * 1.2 - j * 0.012);
          const [x, y] = conductor(k);
          ctx.fillStyle = `rgba(${ACC},${(1 - j / 14) * 0.9})`;
          ctx.beginPath();
          ctx.arc(x, y, 2.6 - j * 0.12, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
      }

      // ---- insulator string
      ctx.strokeStyle = `rgba(${INK},0.6)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(IX, ITOP - 6); ctx.lineTo(IX, LINE_Y);
      ctx.stroke();
      // clamp
      ctx.fillStyle = `rgba(${INK},0.7)`;
      ctx.fillRect(IX - 7, LINE_Y - 4, 14, 8);

      for (let i = 0; i < DISCS; i++) {
        const y = discY(i);
        const rx = 40;
        const ry = 9;
        const c = discClean(i);
        const scanned = scanP > (i + 0.5) / DISCS || time > T.scan[1];
        for (const d of st.discs[i]) {
          const x = IX + Math.cos(d.a) * rx * d.r;
          const yy = y + Math.sin(d.a) * ry * d.r - (1 - d.r) * 4;
          const back = Math.sin(d.a) < 0 ? 0.55 : 1;
          let col: string;
          if (d.dirt && c < 1) {
            const fade = 1 - c;
            col = scanned
              ? `rgba(${ACC},${(0.35 + 0.55 * fade) * back})` // detected
              : `rgba(${DIRT},${(0.5 + 0.4 * fade) * back})`;
            if (c > 0) col = `rgba(${INK},${0.4 + 0.5 * c})`;
          } else {
            col = `rgba(${INK},${(0.45 + (c > 0.99 ? 0.35 : 0)) * back})`;
          }
          ctx.fillStyle = col;
          ctx.fillRect(x - 1.3, yy - 1.3, 2.6, 2.6);
        }
        // rim
        ctx.beginPath();
        ctx.ellipse(IX, y + 2, rx, ry, 0, 0, Math.PI);
        ctx.strokeStyle = `rgba(${INK},0.35)`;
        ctx.lineWidth = 1;
        ctx.stroke();
        // detection bracket while dirty
        if (scanned && c < 1 && st.discs[i].some((d) => d.dirt)) {
          const a = 1 - c;
          ctx.strokeStyle = `rgba(${ACC},${0.8 * a})`;
          ctx.lineWidth = 1.2;
          const bx = IX + rx + 10;
          ctx.beginPath();
          ctx.moveTo(bx, y - 8); ctx.lineTo(bx + 6, y - 8); ctx.lineTo(bx + 6, y + 10); ctx.lineTo(bx, y + 10);
          ctx.stroke();
        }
      }
      // clean confirmation ring
      if (curP > 0 && curP < 1) {
        const k = easeIO(curP);
        ctx.strokeStyle = `rgba(${ACC},${(1 - k) * 0.7})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(IX, (ITOP + LINE_Y) / 2, 60 + k * 60, 140 + k * 40, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // ---- drone position along the timeline
      const hoverX = 560;
      const hoverY = 300;
      const workX = 650;
      let dx: number, dy: number, alpha = 1;
      const bob = Math.sin(time * 3.1) * 4;
      if (time < T.arrive[1]) {
        const k = ease(ph(T.arrive));
        dx = lerp(-160, hoverX, k);
        dy = lerp(120, hoverY, k);
        alpha = clamp01(time / 0.4);
      } else if (time < T.approach[0]) {
        dx = hoverX;
        dy = hoverY + bob;
      } else if (time < T.leave[0]) {
        const kA = easeIO(ph(T.approach));
        const targetY = discY(Math.min(DISCS - 1, Math.floor(cleanP * DISCS))) - 28;
        dx = lerp(hoverX, workX, kA);
        dy = lerp(hoverY, cleanP > 0 ? targetY : discY(0) - 28, kA) + bob * 0.5;
        if (cleanP >= 1) dy = discY(DISCS - 1) - 28 + bob * 0.5;
      } else {
        const k = easeIO(ph(T.leave));
        const sy = discY(DISCS - 1) - 28;
        dx = lerp(workX, 1150, k);
        dy = lerp(sy, 40, k) + bob * (1 - k);
        alpha = 1 - clamp01((time - 8.7) / 0.5);
      }

      // ---- scan beam (sensor → insulator)
      if (scanP > 0 && scanP < 1) {
        const by = lerp(discY(0) - 10, discY(DISCS - 1) + 12, easeIO(scanP));
        const g = ctx.createLinearGradient(dx, dy, IX, by);
        g.addColorStop(0, `rgba(${ACC},0.35)`);
        g.addColorStop(1, `rgba(${ACC},0.05)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(dx + 6, dy + 16);
        ctx.lineTo(IX - 52, by - 14);
        ctx.lineTo(IX - 52, by + 14);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = `rgba(${ACC},0.9)`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(IX - 56, by); ctx.lineTo(IX + 56, by);
        ctx.stroke();
      }

      // ---- cleaning spray (nozzle → current disc)
      const cleaning = cleanP > 0 && cleanP < 1;
      if (cleaning && !reduce) {
        const target = discY(Math.min(DISCS - 1, Math.floor(cleanP * DISCS)));
        for (let n = 0; n < 4; n++) {
          const r = st.rand;
          const sx = dx + 58;
          const sy = dy + 22;
          const tx = IX - 34 + r() * 30;
          const ty = target + (r() - 0.5) * 10;
          const life = 0.35 + r() * 0.15;
          st.spray.push({ x: sx, y: sy, vx: (tx - sx) / life, vy: (ty - sy) / life, life });
        }
      }
      ctx.globalCompositeOperation = 'lighter';
      for (let i = st.spray.length - 1; i >= 0; i--) {
        const p = st.spray[i];
        p.life -= dt;
        if (p.life <= 0) { st.spray.splice(i, 1); continue; }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        ctx.fillStyle = `rgba(${ACC},${Math.min(1, p.life * 3) * 0.8})`;
        ctx.fillRect(p.x - 1.2, p.y - 1.2, 2.4, 2.4);
      }
      ctx.globalCompositeOperation = 'source-over';

      // ---- drone (line art)
      if (alpha > 0) drawDrone(ctx, dx, dy, time, alpha, cleaning || (time > T.approach[0] && time < T.leave[0]));

      ctx.restore();
    },
  });

  return <canvas ref={ref} aria-hidden="true" className={`block h-full w-full ${className}`} />;
}

function drawDrone(ctx: CanvasRenderingContext2D, x: number, y: number, t: number, alpha: number, armOut: boolean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.sin(t * 2.2) * 0.03);
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 1.6;
  ctx.strokeStyle = `rgba(${INK},0.95)`;
  // arms
  ctx.beginPath();
  ctx.moveTo(-54, -4); ctx.lineTo(54, -4);
  ctx.stroke();
  // body
  ctx.fillStyle = 'rgba(10,21,38,0.9)';
  roundRect(ctx, -26, -10, 52, 18, 5);
  ctx.fill();
  ctx.stroke();
  // rotors
  for (const rx of [-54, 54]) {
    ctx.beginPath();
    ctx.moveTo(rx, -4); ctx.lineTo(rx, -12);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(rx, -13, 26, 4, 0, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${INK},0.35)`;
    ctx.stroke();
    // spinning blade highlight
    const a = t * 40 + rx;
    ctx.beginPath();
    ctx.moveTo(rx + Math.cos(a) * 24, -13 + Math.sin(a) * 3.6);
    ctx.lineTo(rx - Math.cos(a) * 24, -13 - Math.sin(a) * 3.6);
    ctx.strokeStyle = `rgba(${INK},0.85)`;
    ctx.stroke();
    ctx.strokeStyle = `rgba(${INK},0.95)`;
  }
  // landing struts
  ctx.beginPath();
  ctx.moveTo(-16, 8); ctx.lineTo(-22, 18); ctx.moveTo(16, 8); ctx.lineTo(22, 18);
  ctx.moveTo(-28, 18); ctx.lineTo(-14, 18); ctx.moveTo(14, 18); ctx.lineTo(28, 18);
  ctx.stroke();
  // sensor gimbal with accent lens
  ctx.beginPath();
  ctx.arc(4, 13, 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = `rgba(${ACC},1)`;
  ctx.beginPath();
  ctx.arc(6, 13, 2, 0, Math.PI * 2);
  ctx.fill();
  // tool arm extends toward the insulator while working
  if (armOut) {
    ctx.strokeStyle = `rgba(${INK},0.9)`;
    ctx.beginPath();
    ctx.moveTo(26, 4); ctx.lineTo(44, 14); ctx.lineTo(58, 22);
    ctx.stroke();
    ctx.fillStyle = `rgba(${ACC},1)`;
    ctx.fillRect(56, 20, 4, 4);
  }
  // status LEDs
  ctx.fillStyle = `rgba(${ACC},${0.6 + 0.4 * Math.sin(t * 6)})`;
  ctx.fillRect(-20, -3, 3, 3);
  ctx.restore();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
