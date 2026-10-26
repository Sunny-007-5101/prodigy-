import { SectionLabel } from '../components/Bits';
import { ABOUT } from '../content';
import { WordReveal } from '../motion/WordReveal';

export function About() {
  return (
    <section id="about" className="relative py-20 md:py-28" aria-labelledby="about-label">
      <div className="wrap grid gap-10 md:grid-cols-12">
        <div className="md:col-span-3" id="about-label">
          <SectionLabel index={1} text={ABOUT.label} className="md:sticky md:top-32" />
        </div>
        <div className="md:col-span-9">
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
