import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  href?: string;
  variant?: 'solid' | 'ghost';
  size?: 'md' | 'sm';
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'disabled'>;

/**
 * Cut-corner button. On hover a pulse of light travels around the outline.
 * Label is rendered in mono inside [ brackets ].
 */
export function Button({ children, href, variant = 'solid', size = 'md', className = '', onClick, type, disabled }: Props) {
  const pad = size === 'md' ? 'h-12 px-6 text-[12px]' : 'h-10 px-4 text-[11px]';
  const tone =
    variant === 'solid'
      ? 'bg-accent text-bg hover:bg-[#7fe6ff]'
      : 'bg-[rgba(61,216,255,0.04)] text-ink hover:bg-[rgba(61,216,255,0.1)]';
  const cls = `group relative inline-flex select-none items-center justify-center gap-2 font-mono uppercase tracking-[0.14em] transition-colors duration-300 cut disabled:cursor-wait disabled:opacity-70 ${pad} ${tone} ${className}`;

  const inner = (
    <>
      {variant === 'ghost' && <Outline />}
      <span className="opacity-60">[</span>
      <span className="relative">{children}</span>
      <span className="opacity-60">]</span>
    </>
  );

  if (href)
    return (
      <a href={href} onClick={onClick} className={cls}>
        {inner}
      </a>
    );
  return (
    <button type={type ?? 'button'} onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  );
}

/** Outline that follows the cut corners, with a travelling pulse on hover. */
function Outline() {
  // polygon in a 100x100 box; vectorEffect keeps the stroke at 1px
  const pts = '10,0 100,0 100,72 90,100 0,100 0,28';
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <polygon points={pts} fill="none" stroke="rgba(61,216,255,0.35)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <polygon
        points={pts}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        pathLength={400}
        strokeDasharray="60 340"
        className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ animation: 'trace 1.6s linear infinite' }}
      />
    </svg>
  );
}
