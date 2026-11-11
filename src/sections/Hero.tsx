import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../components/Button';
import { DroneScene } from '../canvas/DroneScene';
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

function useIsPhone() {
  const q = '(max-width: 767px)';
  const [phone, setPhone] = useState(() => typeof window !== 'undefined' && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setPhone(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  return phone;
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const phone = useIsPhone();
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '-12%']);

  const fade = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 18, filter: 'blur(6px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
    transition: { duration: 0.9, ease: EASE, delay },
  });

  return (
    <section ref={ref} id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden" aria-label="Introduction">
      {/* keep the headline readable over the circuit */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 22% 60%, rgba(10,21,38,0.92) 0%, rgba(10,21,38,0.6) 45%, rgba(10,21,38,0) 75%), linear-gradient(to bottom, rgba(10,21,38,0.55) 0%, rgba(10,21,38,0) 18%)',
        }}
      />

      <div className="wrap relative grid flex-1 items-center gap-6 pb-12 pt-28 md:pb-16 md:pt-32 lg:grid-cols-12">
        <motion.div className="relative z-10 lg:col-span-6" style={reduce ? undefined : { y: textY }}>
          <LineReveal
            as="h1"
            immediate
            delay={0.3}
            lines={(phone ? HERO.titleLinesMobile : HERO.titleLines).map(renderLine)}
            className="text-[clamp(42px,5.4vw,84px)] font-normal leading-[1.04] tracking-[-0.022em] text-ink"
          />

          <motion.p {...fade(0.9)} className="mt-7 max-w-[30rem] text-[16px] leading-relaxed text-muted md:text-[18px]">
            {HERO.subtitle}
          </motion.p>

          <motion.div {...fade(1.0)} className="mt-9">
            <Button href="#contact" onClick={anchor('contact')}>
              {HERO.cta}
            </Button>
          </motion.div>
        </motion.div>

        {/* opening loop: drone inspects and cleans an insulator */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.5 }}
          className="relative -mx-4 h-[300px] sm:h-[380px] lg:col-span-6 lg:mx-0 lg:h-[min(62vh,560px)]"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 60% 55% at 55% 50%, rgba(10,21,38,0.92) 0%, rgba(10,21,38,0.7) 50%, rgba(10,21,38,0) 80%)' }}
          />
          <DroneScene className="relative" />
        </motion.div>
      </div>
    </section>
  );
}
