import type { CloudConfig } from './PointCloud';
import { bundle, insulator, liveSpan, tower, towerHead } from './shapes';

/** "In focus": insulator string laid diagonally, contamination in accent. */
export const INSULATOR: CloudConfig = {
  build: (n, r, mobile) => insulator(n, r, mobile ? 7 : 9),
  count: [3200, 1400],
  rotX: -0.32,
  roll: 0.48,
  spin: 0.14,
  scan: 'y',
  scanLine: true,
  pad: 0.76,
};

/** The four "What we solve" tiles, in order. */
export const TILE_CLOUDS: CloudConfig[] = [
  // 01 Autonomous inspection — tower head scanned left → right
  { build: (n, r) => towerHead(n, r), count: [1500, 900], seed: 3, rotX: -0.28, yaw: 0.55, sway: 0.35, spin: 0.35, scan: 'x', pointSize: 1.3 },
  // 02 Autonomous maintenance — spacer-dampers take turns lighting up
  { build: (n, r) => bundle(n, r), count: [1300, 800], seed: 5, rotX: -0.3, yaw: 0.65, sway: 0.3, spin: 0.3, cycle: 1.1, pointSize: 1.3 },
  // 03 Operations at height — full tower, assembled bottom → top, scanned upward
  { build: (n, r) => tower(n, r), count: [1700, 1000], seed: 7, rotX: 0.12, spin: 0.16, scan: 'y-up', pointSize: 1.2, pad: 0.82 },
  // 04 On live assets — current flowing along a three-phase span
  { build: (n, r) => liveSpan(n, r), count: [1400, 850], seed: 9, rotX: -0.32, yaw: 0.4, sway: 0.28, spin: 0.28, flow: true, pointSize: 1.3 },
];
