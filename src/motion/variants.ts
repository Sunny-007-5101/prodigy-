import type { Variants } from 'framer-motion';

/** One easing for the whole site (expo-out). */
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Trigger when ~15% of the element is in view, once. */
export const VIEWPORT = { once: true, amount: 0.15 } as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  show: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: EASE, delay },
  }),
};

export const stagger = (step = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
});

export const lineUp: Variants = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 1.1, ease: EASE } },
};
