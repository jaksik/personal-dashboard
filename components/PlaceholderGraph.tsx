export default function PlaceholderGraph() {
  const colors = {
    gridStrong: "#5a5a5a",
    grid: "#3a3a3a",
    trend: "#a855f7",
    volumeTop: "#22d3ee",
    volumeBottom: "#fb7185",
    points: "#f59e0b",
  };

  return (
    <div className="">

      <svg
        viewBox="0 0 640 280"
        className="h-54 w-full rounded-xl p-3"
        role="img"
        aria-label="Placeholder chart"
      >
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.trend} stopOpacity="0.45" />
            <stop offset="100%" stopColor={colors.trend} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.volumeTop} stopOpacity="0.9" />
            <stop offset="100%" stopColor={colors.volumeBottom} stopOpacity="0.55" />
          </linearGradient>
          <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="3"
              floodColor={colors.trend}
              floodOpacity="0.55"
            />
          </filter>
        </defs>
        <rect x="70" y="156" width="36" height="76" rx="6" fill="url(#barFill)" />
        <rect x="132" y="128" width="36" height="104" rx="6" fill="url(#barFill)" />
        <rect x="194" y="142" width="36" height="90" rx="6" fill="url(#barFill)" />
        <rect x="256" y="108" width="36" height="124" rx="6" fill="url(#barFill)" />
        <rect x="318" y="122" width="36" height="110" rx="6" fill="url(#barFill)" />
        <rect x="380" y="92" width="36" height="140" rx="6" fill="url(#barFill)" />
        <rect x="442" y="114" width="36" height="118" rx="6" fill="url(#barFill)" />
        <rect x="504" y="86" width="36" height="146" rx="6" fill="url(#barFill)" />

        <path
          d="M88 178 L150 148 L212 160 L274 126 L336 136 L398 108 L460 122 L522 96 L522 232 L88 232 Z"
          fill="url(#areaFill)"
        />

        <path
          d="M88 178 L150 148 L212 160 L274 126 L336 136 L398 108 L460 122 L522 96"
          fill="none"
          stroke={colors.trend}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#lineGlow)"
        />

        <circle cx="88" cy="178" r="4.5" fill={colors.points} />
        <circle cx="150" cy="148" r="4.5" fill={colors.points} />
        <circle cx="212" cy="160" r="4.5" fill={colors.points} />
        <circle cx="274" cy="126" r="4.5" fill={colors.points} />
        <circle cx="336" cy="136" r="4.5" fill={colors.points} />
        <circle cx="398" cy="108" r="4.5" fill={colors.points} />
        <circle cx="460" cy="122" r="4.5" fill={colors.points} />
        <circle cx="522" cy="96" r="4.5" fill={colors.points} />
      </svg>

    </div>
  );
}