import { motion, useReducedMotion } from 'framer-motion';
import { INSULATOR, TILE_CLOUDS } from '../canvas/clouds';
import { PointCloud } from '../canvas/PointCloud';
import { Ticks } from '../components/Bits';
import { SOLVE } from '../content';
import { anchor } from '../lib/scroll';
import { LineReveal } from '../motion/LineReveal';
import { Reveal, RevealGroup, RevealItem } from '../motion/Reveal';
import { EASE, VIEWPORT } from '../motion/variants';

export function Solve() {
  const reduce = useReducedMotion();
  return (
    <section id="solve" className="relative py-20 md:py-28" aria-labelledby="solve-title">
      <div className="wrap">
        <LineReveal
          id="solve-title"
          lines={splitTitle(SOLVE.title)}
          className="max-w-[22ch] text-[clamp(32px,4.4vw,64px)] font-normal leading-[1.05] tracking-[-0.02em]"
        />

        {/* Tiles: title + a live point-cloud illustration, no explanatory text */}
        <RevealGroup className="mt-14 grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 md:mt-20 lg:grid-cols-4" step={0.1}>
          {SOLVE.tiles.map((t, i) => (
            <RevealItem key={t} className="group relative flex h-72 flex-col bg-[#0d1a2e] transition-colors duration-500 hover:bg-surface md:h-80">
              <div className="flex items-center justify-between px-5 pt-5">
                <span className="text-[14px] font-medium text-muted">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div className="relative min-h-0 flex-1">
                <PointCloud config={TILE_CLOUDS[i]} />
              </div>
              <h3 className="px-5 pb-5 text-[15px] font-medium leading-snug tracking-[-0.005em] text-ink">{t}</h3>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* In focus panel */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={{ duration: 1.1, ease: EASE }}
          className="ticks relative mt-6 grid overflow-hidden border border-line bg-surface md:mt-8 lg:grid-cols-12"
        >
          <Ticks />
          <div className="relative z-10 flex flex-col justify-center gap-10 p-6 md:p-10 lg:col-span-5 lg:p-12">
            <div>
              <Reveal className="text-[16px] font-medium uppercase tracking-[0.08em] text-accent">
                {SOLVE.focus.label}
              </Reveal>
              <LineReveal
                as="h3"
                lines={[SOLVE.focus.title]}
                className="mt-6 text-[clamp(30px,3.4vw,48px)] font-normal leading-[1.05] tracking-[-0.02em]"
              />
              <Reveal as="p" delay={0.15} className="mt-6 max-w-md text-[16px] leading-relaxed text-muted">
                {SOLVE.focus.body}
              </Reveal>
            </div>
          </div>
          <div className="relative h-[380px] border-t border-line md:h-[480px] lg:col-span-7 lg:h-[600px] lg:border-l lg:border-t-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,107,232,0.10),transparent_65%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />
            <PointCloud config={INSULATOR} className="relative" />
          </div>
        </motion.div>

        <Reveal className="mt-10 flex md:justify-end">
          <a href="#contact" onClick={anchor('contact')} className="group inline-flex items-center gap-3 text-[15px] text-muted transition-colors hover:text-ink">
            {SOLVE.closing}
            <span className="inline-block text-accent transition-transform duration-500 group-hover:translate-x-1">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/** Two balanced lines for the section title on wide screens. */
function splitTitle(t: string) {
  const words = t.split(' ');
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}
