import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { CircuitField } from '../canvas/CircuitField';
import { Button } from '../components/Button';
import { StatusTag } from '../components/Bits';
import { HERO } from '../content';
import { anchor } from '../lib/scroll';
import { LineReveal } from '../motion/LineReveal';
import { EASE } from '../motion/variants';

function renderLine(line: string) {
  if (!line.includes(HERO.emphasis)) return line;
  const [before, after] = line.split(HERO.emphasis);
  return (
    <>
      {before}
      <em className="bg-gradient-to-r from-ink via-[#bfefff] to-accent bg-clip-text font-display text-[0.8em] font-normal not-italic tracking-[-0.02em] text-transparent">
        {HERO.emphasis}
      </em>
      {after}
    </>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0.15]);
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);

  const fade = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 18, filter: 'blur(6px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 0.9, ease: EASE, delay },
  });

  return (
    <section ref={ref} id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden" aria-label="Introduction">
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y: bgY, opacity: bgOpacity }}>
        <CircuitField />
      </motion.div>
      {/* keep the headline readable over the circuit */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 22% 68%, rgba(10,21,38,0.92) 0%, rgba(10,21,38,0.6) 45%, rgba(10,21,38,0) 75%), linear-gradient(to bottom, rgba(10,21,38,0.55) 0%, rgba(10,21,38,0) 18%, rgba(10,21,38,0) 70%, var(--bg) 100%)',
        }}
      />

      <motion.div className="wrap relative mt-auto pb-10 pt-32 md:pb-14" style={reduce ? undefined : { y: textY }}>
        <motion.p {...fade(0.25)} className="label mb-7 flex items-center gap-3">
          <span className="text-accent">[</span>Prodigy — Autonomous systems<span className="text-accent">]</span>
        </motion.p>

        <LineReveal
          as="h1"
          immediate
          delay={0.3}
          lines={HERO.titleLines.map(renderLine)}
          className="max-w-[15ch] text-[clamp(42px,6.4vw,96px)] font-normal leading-[1.02] tracking-[-0.022em] text-ink md:max-w-none"
        />

        <motion.p {...fade(0.9)} className="mt-8 max-w-[34rem] text-[16px] leading-relaxed text-muted md:text-[18px]">
          {HERO.subtitle}
        </motion.p>

        <motion.div {...fade(1.0)} className="mt-10">
          <Button href="#contact" onClick={anchor('contact')}>
            {HERO.cta}
          </Button>
        </motion.div>

        <div className="mt-16 flex items-end justify-between gap-6 md:mt-20">
          <motion.a
            {...fade(1.3)}
            href="#about"
            onClick={anchor('about')}
            className="group hidden items-center gap-4 md:flex"
            aria-label="Scroll to About"
          >
            <span className="relative block h-12 w-px overflow-hidden bg-line">
              <span className="absolute inset-x-0 top-0 h-1/3 bg-accent" style={{ animation: 'drop 2.2s var(--ease) infinite' }} />
            </span>
            <span className="label transition-colors group-hover:text-ink">Scroll</span>
          </motion.a>
          <motion.div {...fade(1.2)} className="ml-auto">
            <StatusTag label={HERO.status} />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
