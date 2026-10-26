/**
 * PLACEHOLDER mark until the client's final logo arrives.
 * A "P" drawn as a chip trace with 45° corners, a dashed body and a pulse of
 * light running along it. Swap this file's SVG for the final logo.
 */
export function LogoMark({ size = 28, animated = true }: { size?: number; animated?: boolean }) {
  const d = 'M7 29 V5 H19 L25 11 V15 L19 21 H7';
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path d={d} stroke="var(--line-strong)" strokeWidth="2" strokeDasharray="2 2.5" />
      <path d={d} stroke="var(--text)" strokeWidth="2" strokeLinejoin="miter" opacity="0.92" />
      {animated && (
        <path
          d={d}
          stroke="var(--accent)"
          strokeWidth="2.2"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="14 86"
          style={{ animation: 'logo-run 3.2s cubic-bezier(0.65,0,0.35,1) infinite' }}
        />
      )}
      <circle cx="7" cy="29" r="2.4" fill="var(--bg)" stroke="var(--text)" strokeWidth="1.5" />
      <circle cx="25" cy="11" r="1.6" fill="var(--accent)" />
      <style>{`@keyframes logo-run{from{stroke-dashoffset:100}to{stroke-dashoffset:0}}@media (prefers-reduced-motion:reduce){path[pathLength]{display:none}}`}</style>
    </svg>
  );
}

export function Logo({ onClick }: { onClick?: (e: React.MouseEvent) => void }) {
  return (
    <a href="#top" onClick={onClick} className="group flex items-center" aria-label="Prodigy — back to top">
      <span className="text-[15px] font-medium tracking-[0.28em] text-ink">PRODIGY</span>
    </a>
  );
}
