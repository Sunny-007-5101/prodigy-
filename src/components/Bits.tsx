import { Reveal } from '../motion/Reveal';

/** ● OPERATING IN STEALTH — blinking status dot with an expanding ring. */
export function StatusTag({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-3 border border-line bg-[rgba(17,32,56,0.6)] px-3 py-2 backdrop-blur-sm">
      <span className="relative flex h-2 w-2">
        <span className="absolute inset-0 rounded-full bg-accent" style={{ animation: 'ping-ring 2s var(--ease) infinite' }} />
        <span className="relative h-2 w-2 rounded-full bg-accent" style={{ animation: 'blink 2s ease-in-out infinite' }} />
      </span>
      <span className="label text-ink/80">{label}</span>
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
