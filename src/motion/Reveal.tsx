import { motion, useReducedMotion } from 'framer-motion';
import type { ElementType, ReactNode } from 'react';
import { fadeUp, stagger, VIEWPORT } from './variants';

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: 'div' | 'p' | 'li' | 'span' | 'h3' | 'ul' | 'section' | 'form';
};

/** Fade-up + de-blur on entering the viewport. */
export function Reveal({ children, className, delay = 0, as = 'div' }: Props) {
  const reduce = useReducedMotion();
  const M = motion[as] as ElementType;
  if (reduce) {
    const T = as as ElementType;
    return <T className={className}>{children}</T>;
  }
  return (
    <M className={className} variants={fadeUp} custom={delay} initial="hidden" whileInView="show" viewport={VIEWPORT}>
      {children}
    </M>
  );
}

/** Parent that staggers its <RevealItem> children. */
export function RevealGroup({
  children,
  className,
  step = 0.08,
  delay = 0,
  as = 'div',
}: Props & { step?: number }) {
  const reduce = useReducedMotion();
  const M = motion[as] as ElementType;
  return (
    <M
      className={className}
      variants={stagger(step, delay)}
      initial={reduce ? 'show' : 'hidden'}
      whileInView="show"
      viewport={VIEWPORT}
    >
      {children}
    </M>
  );
}

export function RevealItem({ children, className, as = 'div' }: Omit<Props, 'delay'>) {
  const M = motion[as] as ElementType;
  return (
    <M className={className} variants={fadeUp}>
      {children}
    </M>
  );
}
