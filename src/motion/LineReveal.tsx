import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { lineUp, stagger, VIEWPORT } from './variants';

type Props = {
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  /** Animate on mount instead of on scroll (used in the hero). */
  immediate?: boolean;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  id?: string;
};

/** Headings rise line by line out of a mask. */
export function LineReveal({ lines, className, lineClassName = '', delay = 0, immediate, as = 'h2', id }: Props) {
  const reduce = useReducedMotion();
  const M = motion[as];
  const trigger = immediate ? { animate: 'show' } : { whileInView: 'show', viewport: VIEWPORT };
  return (
    <M id={id} className={className} variants={stagger(0.1, delay)} initial={reduce ? 'show' : 'hidden'} {...trigger}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span className={`block ${lineClassName}`} variants={reduce ? undefined : lineUp}>
            {line}
          </motion.span>
        </span>
      ))}
    </M>
  );
}
