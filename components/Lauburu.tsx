/**
 * Lauburu (Basque Cross)
 * Sacred Basque symbol representing the four axes of existence
 */

export default function Lauburu({
  size = 64,
  className = "",
  style = {},
  filled = false,
}: {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
  filled?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Four-lobed flower cross - the Lauburu */}
      <defs>
        <style>{`
          .lauburu-lobe { 
            fill: ${filled ? "currentColor" : "none"};
            stroke: currentColor;
            stroke-width: 1.5;
            stroke-linecap: round;
            stroke-linejoin: round;
          }
        `}</style>
      </defs>

      {/* Center circle */}
      <circle cx="32" cy="32" r={filled ? "3.5" : "2.5"} fill="currentColor" />

      {/* Top lobe */}
      <path
        className="lauburu-lobe"
        d="M 32 32 Q 28 20 32 14 Q 36 20 32 32 Z"
      />

      {/* Right lobe */}
      <path
        className="lauburu-lobe"
        d="M 32 32 Q 44 28 50 32 Q 44 36 32 32 Z"
      />

      {/* Bottom lobe */}
      <path
        className="lauburu-lobe"
        d="M 32 32 Q 36 44 32 50 Q 28 44 32 32 Z"
      />

      {/* Left lobe */}
      <path
        className="lauburu-lobe"
        d="M 32 32 Q 20 36 14 32 Q 20 28 32 32 Z"
      />

      {/* Decorative circles at cardinal points */}
      <circle cx="32" cy="14" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="50" cy="32" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="32" cy="50" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="14" cy="32" r="1.5" fill="currentColor" opacity="0.6" />
    </svg>
  );
}
