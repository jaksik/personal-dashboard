const contributionRows = 7;
const contributionCols = 26;

const intensityClasses = [
  "bg-foreground/10",
  "bg-emerald-900/40",
  "bg-emerald-700/60",
  "bg-emerald-500/80",
  "bg-emerald-400",
];

function getIntensity(row: number, col: number) {
  const seed = (row * 17 + col * 23 + row * col * 3) % 5;
  return intensityClasses[seed];
}

export default function ContributionHeatMapPlaceholder() {
  return (
    <div className="app-panel p-4">
      <p className="app-text-muted text-sm font-medium">Contribution Activity</p>

      <div className="mt-3 overflow-x-auto">
        <div
          className="grid w-max gap-1"
          style={{ gridTemplateColumns: `repeat(${contributionCols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: contributionRows * contributionCols }).map((_, index) => {
            const row = Math.floor(index / contributionCols);
            const col = index % contributionCols;

            return (
              <span
                key={`${row}-${col}`}
                className={`h-3 w-3 rounded-[3px] ${getIntensity(row, col)}`}
                aria-hidden="true"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
