import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  href?: string;
  variant?: 'solid' | 'ghost';
  size?: 'md' | 'sm';
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'disabled'>;

/** Plain rounded button with the label in the main sans font. */
export function Button({ children, href, variant = 'solid', size = 'md', className = '', onClick, type, disabled }: Props) {
  const pad = size === 'md' ? 'h-12 px-7 text-[15px]' : 'h-10 px-5 text-[14px]';
  const tone =
    variant === 'solid'
      ? 'bg-accent text-bg hover:bg-[#7fe6ff]'
      : 'border border-[rgba(61,216,255,0.45)] text-ink hover:border-accent hover:bg-[rgba(61,216,255,0.08)]';
  const cls = `inline-flex select-none items-center justify-center rounded-md font-medium transition-colors duration-300 disabled:cursor-wait disabled:opacity-70 ${pad} ${tone} ${className}`;

  if (href)
    return (
      <a href={href} onClick={onClick} className={cls}>
        {children}
      </a>
    );
  return (
    <button type={type ?? 'button'} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}
