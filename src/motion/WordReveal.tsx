import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef } from 'react';

type Props = {
  text: string;
  /** A phrase inside `text` that ends in the accent colour. */
  highlight?: string;
  className?: string;
};

/** Words brighten from muted to white as the paragraph scrolls through the viewport. */
export function WordReveal({ text, highlight, className }: Props) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.45'] });

  const words = text.split(' ');
  let hlStart = -1;
  let hlEnd = -1;
  if (highlight) {
    const hlWords = highlight.split(' ');
    for (let i = 0; i <= words.length - hlWords.length; i++) {
      if (hlWords.every((w, j) => words[i + j] === w)) {
        hlStart = i;
        hlEnd = i + hlWords.length;
        break;
      }
    }
  }

  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => {
        const isHl = i >= hlStart && i < hlEnd;
        return (
          <span key={i}>
            {reduce ? (
              <span className={isHl ? 'text-accent' : 'text-ink'}>{w}</span>
            ) : (
              <Word progress={scrollYProgress} index={i} total={words.length} accent={isHl}>
                {w}
              </Word>
            )}{' '}
          </span>
        );
      })}
    </p>
  );
}

function Word({
  children,
  progress,
  index,
  total,
  accent,
}: {
  children: string;
  progress: MotionValue<number>;
  index: number;
  total: number;
  accent: boolean;
}) {
  const start = index / total;
  const end = Math.min(1, start + 1.5 / total + 0.04);
  const color = useTransform(
    progress,
    [start, end],
    ['rgba(125,139,163,0.35)', accent ? 'rgba(61,216,255,1)' : 'rgba(232,238,247,1)'],
  );
  return <motion.span style={{ color }}>{children}</motion.span>;
}
