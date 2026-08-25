interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

// Monochrome schematic building mark — no gradients, ink on paper
export function Logo({ size = 48, className = '', showText = true }: LogoProps) {
  const iconSize = size;
  const fontSize = size * 0.25;

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer square frame */}
        <rect x="10" y="10" width="80" height="80" stroke="currentColor" strokeWidth="4" fill="none" />

        {/* Building facade — flat lines */}
        <rect x="25" y="32" width="50" height="44" fill="currentColor" opacity="0.08" />
        <rect x="25" y="32" width="50" height="44" stroke="currentColor" strokeWidth="2.5" fill="none" />

        {/* Roof / gable line */}
        <polyline points="20,33 50,18 80,33" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        {/* Windows — grid of 6 */}
        <rect x="30" y="38" width="8" height="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <rect x="46" y="38" width="8" height="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <rect x="62" y="38" width="8" height="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <rect x="30" y="52" width="8" height="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <rect x="62" y="52" width="8" height="8" stroke="currentColor" strokeWidth="1.5" fill="none" />

        {/* Door */}
        <rect x="43" y="57" width="14" height="19" stroke="currentColor" strokeWidth="2" fill="none" />

        {/* Door knob */}
        <circle cx="54" cy="67" r="1.5" fill="currentColor" />
      </svg>

      {showText && (
        <div className="flex flex-col items-start">
          <span
            className="font-bold text-foreground leading-none tracking-tight"
            style={{ fontSize: `${fontSize}px` }}
          >
            HOSTEL<span className="text-[#8B2326]">SYNC</span>
          </span>
        </div>
      )}
    </div>
  );
}
