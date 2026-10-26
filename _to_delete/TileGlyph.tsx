/**
 * Abstract line/dot glyphs for the four "What we solve" tiles.
 * Deliberately non-literal: no robots, drones or product hints.
 * Each has a slow ambient motion that brightens on hover (via .group).
 */
const dim = 'stroke-line-strong';
const lit = 'stroke-line-strong transition-[stroke] duration-500 group-hover:stroke-accent';

export function TileGlyph({ kind }: { kind: number }) {
  return (
    <svg viewBox="0 0 160 110" className="h-full w-full" fill="none" aria-hidden="true">
      <style>{`
        @keyframes g-scan { 0%{transform:translateY(-34px)} 100%{transform:translateY(34px)} }
        @keyframes g-close { 0%,20%{transform:translateX(0)} 50%,70%{transform:translateX(14px)} 100%{transform:translateX(0)} }
        @keyframes g-rise { 0%{transform:translateY(0);opacity:0} 15%{opacity:1} 85%{opacity:1} 100%{transform:translateY(-62px);opacity:0} }
        @keyframes g-run { from{stroke-dashoffset:200} to{stroke-dashoffset:0} }
        @media (prefers-reduced-motion: reduce){ .g-anim{animation:none!important} }
      `}</style>
      {kind === 0 && (
        // Inspection: dot field with a scan line passing over it
        <g>
          {Array.from({ length: 7 }).map((_, r) =>
            Array.from({ length: 11 }).map((_, c) => (
              <circle key={`${r}-${c}`} cx={30 + c * 10} cy={25 + r * 10} r="1" className="fill-line-strong transition-[fill] duration-500 group-hover:fill-[rgba(61,216,255,0.6)]" />
            )),
          )}
          <g className="g-anim" style={{ animation: 'g-scan 3.6s cubic-bezier(.45,0,.55,1) infinite alternate' }}>
            <line x1="20" x2="140" y1="55" y2="55" className="stroke-accent" strokeWidth="1" opacity="0.8" />
            <rect x="20" y="51" width="120" height="8" fill="url(#scan-g)" />
          </g>
          <defs>
            <linearGradient id="scan-g" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#3dd8ff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#3dd8ff" stopOpacity="0.18" />
              <stop offset="1" stopColor="#3dd8ff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </g>
      )}
      {kind === 1 && (
        // Maintenance: a broken trace whose gap closes and reopens
        <g>
          <path d="M14 70 H62 L74 58" className={lit} strokeWidth="1" />
          <circle cx="74" cy="58" r="2.5" className="fill-bg stroke-accent" />
          <g className="g-anim" style={{ animation: 'g-close 4s cubic-bezier(.65,0,.35,1) infinite' }}>
            <circle cx="86" cy="58" r="2.5" className="fill-bg stroke-accent" />
          </g>
          <path d="M100 58 L112 46 H146" className={lit} strokeWidth="1" />
          <path d="M14 86 H146" className={dim} strokeWidth="1" strokeDasharray="2 4" />
          <path d="M14 30 H146" className={dim} strokeWidth="1" strokeDasharray="2 4" />
        </g>
      )}
      {kind === 2 && (
        // At height: stepped trace climbing, node rising along a dotted mast
        <g>
          <path d="M80 100 V12" className={dim} strokeWidth="1" strokeDasharray="1.5 4" />
          <path d="M20 96 H44 L56 84 H74 M86 62 H104 L116 50 H140" className={lit} strokeWidth="1" />
          <path d="M60 34 H100" className={dim} strokeWidth="1" />
          <path d="M66 22 H94" className={dim} strokeWidth="1" />
          <g className="g-anim" style={{ animation: 'g-rise 3.4s cubic-bezier(.45,0,.55,1) infinite' }}>
            <circle cx="80" cy="84" r="3" className="fill-accent" />
            <circle cx="80" cy="84" r="8" fill="rgba(61,216,255,0.14)" />
          </g>
        </g>
      )}
      {kind === 3 && (
        // On live assets: three conductors with current running through
        <g>
          {[34, 55, 76].map((y, i) => (
            <g key={y}>
              <path d={`M8 ${y} Q80 ${y + 12} 152 ${y}`} className={dim} strokeWidth="1" />
              <path
                d={`M8 ${y} Q80 ${y + 12} 152 ${y}`}
                stroke="#3dd8ff"
                strokeWidth="1.4"
                strokeLinecap="round"
                pathLength={200}
                strokeDasharray="18 182"
                className="g-anim opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                style={{ animation: `g-run ${2.4 + i * 0.5}s linear infinite`, animationDelay: `${i * -0.8}s` }}
              />
            </g>
          ))}
          <path d="M40 22 V92 M120 22 V92" className={dim} strokeWidth="1" strokeDasharray="1.5 4" />
        </g>
      )}
    </svg>
  );
}
