const contributionWeekdayRows = ["M", "W", "F"] as const;
const contributionWeekColumns = 52;
const contributionMonthMarkers = [
  { label: "Jan", week: 0 },
  { label: "Apr", week: 13 },
  { label: "Jul", week: 26 },
  { label: "Oct", week: 39 },
] as const;

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

    <div className="mb-8 overflow-x-auto">
      <p className="app-text-muted text-sm">Task Completions</p>
      <div className="app-text-muted mb-1 flex w-max items-center gap-3 text-[10px] leading-3">
        <div className="w-3" aria-hidden="true" />
        <div
          className="grid w-max gap-1"
          style={{ gridTemplateColumns: `repeat(${contributionWeekColumns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: contributionWeekColumns }).map((_, colIndex) => {
            const marker = contributionMonthMarkers.find(({ week }) => week === colIndex);
            return (
              <span key={`month-${colIndex}`} className="h-3 w-3 whitespace-nowrap">
                {marker?.label ?? ""}
              </span>
            );
          })}
        </div>
      </div>
      <div className="flex w-max items-start gap-3">
        <div className="app-text-muted mt-0.5 grid w-3 text-[10px] leading-3">
          {contributionWeekdayRows.map((day) => (
            <span key={day} className="h-4">
              {day}
            </span>
          ))}
        </div>
        <div
          className="grid w-max gap-1"
          style={{ gridTemplateColumns: `repeat(${contributionWeekColumns}, minmax(0, 1fr))` }}
        >
          {contributionWeekdayRows.flatMap((_, rowIndex) =>
            Array.from({ length: contributionWeekColumns }).map((_, colIndex) => (
              <span
                key={`${rowIndex}-${colIndex}`}
                className={`h-3 w-3 rounded-[3px] ${getIntensity(rowIndex, colIndex)}`}
                aria-label={`Week ${colIndex + 1}, ${contributionWeekdayRows[rowIndex]}`}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
