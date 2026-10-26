import { motion, useScroll, useSpring } from 'framer-motion';
import { NAV } from '../content';
import { anchor } from '../lib/scroll';

/**
 * Thin vertical circuit rail on the left edge (wide screens only).
 * It fills with light as the page scrolls; each section lights its node.
 */
export function ScrollRail({ active }: { active: string }) {
  const { scrollYProgress } = useScroll();
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const activeIdx = NAV.findIndex((n) => n.id === active);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.4, duration: 1 }}
      className="pointer-events-none fixed bottom-10 left-6 top-28 z-30 hidden w-6 2xl:left-10 xl:block"
      aria-hidden="true"
    >
      <div className="absolute bottom-0 left-[3px] top-0 w-px bg-[linear-gradient(var(--line-strong)_50%,transparent_0)] bg-[length:1px_6px]" />
      <motion.div
        className="absolute bottom-0 left-[3px] top-0 w-px origin-top bg-gradient-to-b from-accent-deep to-accent"
        style={{ scaleY: fill }}
      />
      {NAV.map((n, i) => {
        const top = `${((i + 1) / (NAV.length + 1)) * 100}%`;
        const on = i <= activeIdx;
        return (
          <a
            key={n.id}
            href={`#${n.id}`}
            onClick={anchor(n.id)}
            tabIndex={-1}
            className="pointer-events-auto absolute left-0 flex -translate-y-1/2 items-center gap-3"
            style={{ top }}
          >
            <span
              className={`h-[7px] w-[7px] rounded-full border transition-all duration-500 ${
                on ? 'border-accent bg-accent shadow-[0_0_12px_var(--accent)]' : 'border-line-strong bg-bg'
              }`}
            />
            <span className={`hidden font-mono text-[10px] 2xl:inline tracking-[0.14em] transition-colors duration-500 ${i === activeIdx ? 'text-ink' : 'text-line-strong'}`}>
              {String(i + 1).padStart(2, '0')}
            </span>
          </a>
        );
      })}
    </motion.div>
  );
}
