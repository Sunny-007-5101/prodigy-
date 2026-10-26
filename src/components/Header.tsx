import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { HERO, NAV } from '../content';
import { anchor, lockScroll, scrollToId } from '../lib/scroll';
import { EASE } from '../motion/variants';
import { Button } from './Button';
import { Logo } from './Logo';

export function Header({ active }: { active: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    lockScroll(open);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    // let the menu close before scrolling
    setTimeout(() => scrollToId(id), open ? 250 : 0);
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled ? 'border-b border-line bg-[rgba(10,21,38,0.75)] backdrop-blur-md' : 'border-b border-transparent'
        }`}
      >
        <div className="wrap flex h-[64px] items-center justify-between md:h-[72px]">
          <Logo onClick={go('top')} />

          <nav aria-label="Main" className="hidden items-center gap-9 md:flex">
            {NAV.map((n) => (
              <a
                key={n.id}
                href={`#${n.id}`}
                onClick={anchor(n.id)}
                className={`group relative py-2 text-[13px] tracking-[0.01em] transition-colors duration-300 ${
                  active === n.id ? 'text-ink' : 'text-muted hover:text-ink'
                }`}
                aria-current={active === n.id ? 'true' : undefined}
              >
                {n.label}
                <span
                  className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-accent transition-transform duration-500 ease-[var(--ease)] ${
                    active === n.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </a>
            ))}
          </nav>

          <div className="hidden md:block">
            <Button href="#contact" onClick={anchor('contact')} variant="ghost" size="sm">
              {HERO.cta}
            </Button>
          </div>

          <button
            type="button"
            className="relative -mr-2 flex h-11 w-11 items-center justify-center md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span className={`absolute h-px w-6 bg-ink transition-transform duration-500 ${open ? 'rotate-45' : '-translate-y-[4px]'}`} />
            <span className={`absolute h-px w-6 bg-ink transition-transform duration-500 ${open ? '-rotate-45' : 'translate-y-[4px]'}`} />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-40 flex flex-col bg-bg/95 px-5 pb-10 pt-28 backdrop-blur-md md:hidden"
          >
            <nav aria-label="Mobile" className="flex flex-col gap-2">
              {NAV.map((n, i) => (
                <motion.a
                  key={n.id}
                  href={`#${n.id}`}
                  onClick={go(n.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.05 + i * 0.06 }}
                  className="flex items-baseline gap-4 border-b border-line py-4 text-[32px] font-normal tracking-tight"
                >
                  <span className="label">{String(i + 1).padStart(2, '0')}</span>
                  {n.label}
                </motion.a>
              ))}
            </nav>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-auto"
            >
              <Button href="#contact" onClick={go('contact')} className="w-full">
                {HERO.cta}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
