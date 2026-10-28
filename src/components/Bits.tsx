import { Reveal } from '../motion/Reveal';

/** Status line: a short trace with a pulse of light running along it, then the label. */
export function StatusTag({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-3">
      <span className="relative h-px w-10 overflow-hidden bg-line-strong">
        <span
          className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-accent to-transparent"
          style={{ animation: 'status-run 2.8s cubic-bezier(0.65,0,0.35,1) infinite' }}
        />
      </span>
      <span className="text-[13px] font-medium uppercase tracking-[0.08em] text-ink/85">{label}</span>
    </div>
  );
}

/** [ 01 / WHO WE ARE ] */
export function SectionLabel({ index, text, className = '' }: { index: number; text: string; className?: string }) {
  return (
    <Reveal className={`label flex items-center gap-3 ${className}`}>
      <span className="text-accent">[</span>
      <span className="text-ink/90">{String(index).padStart(2, '0')}</span>
      <span className="text-line-strong">/</span>
      <span>{text}</span>
      <span className="text-accent">]</span>
    </Reveal>
  );
}

/** Panel/card frame with technical corner ticks. */
export function Ticks() {
  return <span className="tick-b pointer-events-none absolute inset-0" aria-hidden="true" />;
}
