import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const PATHS = {
  a: { d: 'M-20 18 H520 L560 58 H980 L1000 38 H1180', node: [1180, 38] },
  b: { d: 'M1460 22 H900 L860 62 H430 L410 42 H260', node: [260, 42] },
} as const;

/**
 * A trace that draws itself between sections as you scroll, entering from the
 * frame edge and ending in a connection node that lights up.
 */
export function CircuitDivider({ variant = 'a' }: { variant?: keyof typeof PATHS }) {
  const ref = useRef<SVGSVGElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref as unknown as React.RefObject<HTMLElement>, offset: ['start 0.95', 'start 0.45'] });
  const length = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const nodeScale = useTransform(scrollYProgress, [0.85, 1], [0, 1]);
  const { d, node } = PATHS[variant];

  return (
    <svg
      ref={ref}
      className="block h-20 w-full"
      viewBox="0 0 1440 80"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      aria-hidden="true"
    >
      <path d={d} stroke="var(--line)" strokeWidth="1" strokeDasharray="2 5" vectorEffect="non-scaling-stroke" />
      <motion.path
        d={d}
        stroke="url(#cd-grad)"
        strokeWidth="1.2"
        vectorEffect="non-scaling-stroke"
        style={{ pathLength: reduce ? 1 : length }}
      />
      <motion.g style={{ scale: reduce ? 1 : nodeScale, transformOrigin: `${node[0]}px ${node[1]}px` }}>
        <circle cx={node[0]} cy={node[1]} r="7" fill="rgba(61,216,255,0.12)" />
        <circle cx={node[0]} cy={node[1]} r="3" fill="var(--bg)" stroke="var(--accent)" strokeWidth="1.2" />
      </motion.g>
      <defs>
        <linearGradient id="cd-grad" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="var(--accent-deep)" stopOpacity="0.2" />
          <stop offset="1" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
