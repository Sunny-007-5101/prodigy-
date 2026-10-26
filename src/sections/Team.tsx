import { SectionLabel } from '../components/Bits';
import { TEAM } from '../content';
import { LineReveal } from '../motion/LineReveal';
import { RevealGroup, RevealItem } from '../motion/Reveal';
import { WordReveal } from '../motion/WordReveal';

export function Team() {
  return (
    <section id="team" className="relative py-20 md:py-28" aria-labelledby="team-title">
      <div className="wrap">
        <SectionLabel index={3} text={TEAM.label} />
        <LineReveal
          id="team-title"
          lines={[TEAM.title]}
          className="mt-8 text-[clamp(32px,4.4vw,64px)] font-normal leading-[1.05] tracking-[-0.02em]"
        />

        <RevealGroup className="mt-14 grid gap-px border-y border-line bg-line md:mt-20 md:grid-cols-2" step={0.12}>
          {TEAM.people.map((p, i) => (
            <RevealItem key={p.name} className="group relative bg-bg py-10 md:px-10 md:py-14 md:first:pl-0">
              <svg className="mb-10 h-6 w-28" viewBox="0 0 112 24" fill="none" aria-hidden="true">
                <path d="M0 18 H44 L56 6 H100" stroke="var(--line-strong)" strokeDasharray="2 4" />
                <path
                  d="M0 18 H44 L56 6 H100"
                  stroke="var(--accent)"
                  strokeWidth="1.2"
                  pathLength={100}
                  strokeDasharray="100"
                  strokeDashoffset="100"
                  className="transition-[stroke-dashoffset] duration-1000 ease-[var(--ease)] group-hover:[stroke-dashoffset:0]"
                />
                <circle cx="104" cy="6" r="3" fill="var(--bg)" stroke={i === 0 ? 'var(--accent)' : 'var(--line-strong)'} className="transition-[stroke] duration-500 group-hover:stroke-[var(--accent)]" />
              </svg>
              <h3 className="text-[clamp(26px,2.6vw,36px)] font-normal tracking-[-0.02em] text-ink">{p.name}</h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">{p.role}</p>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mt-16 grid md:mt-24 md:grid-cols-12">
          <WordReveal
            text={TEAM.note}
            className="text-[clamp(22px,2.4vw,34px)] font-normal leading-[1.3] tracking-[-0.015em] md:col-span-10 md:col-start-3"
          />
        </div>
      </div>
    </section>
  );
}
