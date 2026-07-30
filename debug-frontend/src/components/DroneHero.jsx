export default function DroneHero({ className = '' }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={`h-28 w-28 ${className}`.trim()}
      role="img"
      aria-label="Fixed-wing VTOL drone transitioning from hover to cruise flight"
    >
      {/* Drawn in its resting/cruise orientation (nose right); the group starts
          rotated -90deg (nose up, hover) and animates to this orientation on load. */}
      <g className="hero-drone-group">
        <circle cx="60" cy="20" r="8" fill="none" stroke="#e1e0d9" strokeWidth="3" />
        <circle cx="60" cy="100" r="8" fill="none" stroke="#e1e0d9" strokeWidth="3" />
        <rect x="53" y="20" width="14" height="80" rx="6" fill="#d4d2c9" />
        <rect x="20" y="53" width="80" height="14" rx="7" fill="#171717" />
        <path d="M100 51 L114 60 L100 69 Z" fill="#171717" />
        <path d="M20 51 L8 60 L20 69 Z" fill="#FF6A1A" />
      </g>
    </svg>
  );
}
