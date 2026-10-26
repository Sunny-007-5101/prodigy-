import Lenis from 'lenis';
import { useEffect, useState } from 'react';

let lenis: Lenis | null = null;

/** Smooth scrolling on desktop; native scrolling on touch and reduced motion. */
export function useSmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4) });
    let raf = 0;
    const loop = (time: number) => {
      lenis?.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis?.destroy();
      lenis = null;
    };
  }, []);
}

export function scrollToId(id: string) {
  const el = id === 'top' ? document.body : document.getElementById(id);
  if (!el) return;
  const offset = id === 'top' ? 0 : -64;
  if (lenis) lenis.scrollTo(id === 'top' ? 0 : el, { offset });
  else window.scrollTo({ top: id === 'top' ? 0 : el.getBoundingClientRect().top + window.scrollY + offset, behavior: 'smooth' });
  history.replaceState(null, '', id === 'top' ? ' ' : `#${id}`);
}

/** Click handler for in-page anchors. */
export const anchor = (id: string) => (e: React.MouseEvent) => {
  e.preventDefault();
  scrollToId(id);
};

export function lockScroll(lock: boolean) {
  if (lenis) lock ? lenis.stop() : lenis.start();
  document.documentElement.style.overflow = lock ? 'hidden' : '';
}

/** Which section is currently in the middle of the viewport. */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string>('');
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    const onScroll = () => {
      if (window.scrollY < window.innerHeight * 0.5) setActive('');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [ids]);
  return active;
}
