import { FOOTER, SITE } from '../content';
import { anchor } from '../lib/scroll';

export function Footer({ onPrivacy }: { onPrivacy: () => void }) {
  return (
    <footer className="relative border-t border-line">
      {/* the trace that started in the hero leaves the frame here */}
      <svg className="absolute -top-px left-0 h-10 w-full" viewBox="0 0 1440 40" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true">
        <path d="M1460 0 H1100 L1076 24 H940" stroke="var(--line-strong)" strokeDasharray="2 5" />
        <circle cx="940" cy="24" r="3" fill="var(--accent)" style={{ animation: 'blink 2s ease-in-out infinite' }} />
      </svg>
      <div className="wrap flex flex-col gap-8 py-12 md:flex-row md:items-center md:justify-between md:py-14">
        <a href="#top" onClick={anchor('top')} className="flex items-center" aria-label="Back to top">
          <span className="text-[13px] font-medium tracking-[0.28em]">{SITE.name}</span>
        </a>
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[14px] text-muted">
          <a href={`mailto:${SITE.email}`} className="transition-colors hover:text-ink">{SITE.email}</a>
          <a href={SITE.linkedin} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-ink">LinkedIn</a>
          <button type="button" onClick={onPrivacy} className="transition-colors hover:text-ink">{FOOTER.privacy}</button>
        </nav>
        <p className="label">© {SITE.year} Prodigy. {FOOTER.rights}</p>
      </div>
    </footer>
  );
}
