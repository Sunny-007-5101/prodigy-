import { ABOUT } from '../content';
import { WordReveal } from '../motion/WordReveal';

export function About() {
  return (
    <section id="about" className="relative py-20 md:py-28" aria-label={ABOUT.label}>
      <div className="wrap grid md:grid-cols-12">
        <div className="md:col-span-10 md:col-start-2">
          <WordReveal
            text={ABOUT.body}
            highlight={ABOUT.highlight}
            className="text-[clamp(24px,2.9vw,42px)] font-normal leading-[1.25] tracking-[-0.02em]"
          />
        </div>
      </div>
    </section>
  );
}
