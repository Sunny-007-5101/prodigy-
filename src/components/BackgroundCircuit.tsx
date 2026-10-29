import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { CircuitField } from '../canvas/CircuitField';

/**
 * The hero's circuit field, fixed behind the whole page so the traces and
 * pulses stay with the visitor while they scroll. It dims a little once the
 * hero is passed so body text stays easy to read.
 */
export function BackgroundCircuit() {
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 700], [1, 0.55]);
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0"
      style={reduce ? { opacity: 0.55 } : { opacity }}
    >
      <CircuitField />
    </motion.div>
  );
}
