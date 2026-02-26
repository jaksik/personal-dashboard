const monthGroups = [
  { label: "FEB", weeks: 5 },
  { label: "MAR", weeks: 6 },
  { label: "APR", weeks: 5 },
  { label: "MAY", weeks: 6 },
  { label: "JUN", weeks: 5 },
  { label: "JUL", weeks: 6 },
  { label: "AUG", weeks: 5 },
];

function getIntensity(monthIndex: number, weekIndex: number, dayIndex: number) {
  const seed =
    (monthIndex * 31 + weekIndex * 17 + dayIndex * 13 + monthIndex * weekIndex) % 6;
  return seed;
}

function getCellStyle(intensity: number) {
  if (intensity === 0) {
    return {
      backgroundColor: "color-mix(in srgb, var(--foreground) 10%, transparent)",
    };
  }

  if (intensity === 1) {
    return {
      backgroundColor: "color-mix(in srgb, var(--chart-4) 30%, transparent)",
    };
  }

  if (intensity === 2) {
    return {
      backgroundColor: "color-mix(in srgb, var(--chart-4) 45%, transparent)",
    };
  }

  if (intensity === 3) {
    return {
      backgroundColor: "color-mix(in srgb, var(--chart-4) 60%, transparent)",
    };
  }

  if (intensity === 4) {
    return {
      backgroundColor: "color-mix(in srgb, var(--chart-4) 80%, transparent)",
    };
  }

  return {
    backgroundColor: "var(--chart-4)",
    boxShadow: "0 0 14px color-mix(in srgb, var(--chart-4) 45%, transparent)",
  };
}

export default function CalendarHeatMapPlaceholder() {
  return (
    <div className=" overflow-hidden p-4">
      <div className="overflow-x-auto">
        <div className="min-w-245 space-y-5">
          <div className="flex items-center justify-between px-2">
            {monthGroups.map((month) => (
              <p
                key={month.label}
                className="app-text-muted text-sm font-semibold tracking-wide"
              >
                {month.label}
              </p>
            ))}
          </div>

          <div className="flex items-start gap-5">
            {monthGroups.map((month, monthIndex) => (
              <div
                key={month.label}
                className="grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${month.weeks}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: month.weeks * 5 }).map((_, cellIndex) => {
                  const dayIndex = Math.floor(cellIndex / month.weeks);
                  const weekIndex = cellIndex % month.weeks;
                  const intensity = getIntensity(monthIndex, weekIndex, dayIndex);

                  return (
                    <span
                      key={`${month.label}-${dayIndex}-${weekIndex}`}
                      className="h-3 w-3 rounded-[3px]"
                      style={getCellStyle(intensity)}
                      aria-hidden="true"
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <div className="h-2 w-full rounded-full bg-foreground/10">
            <div className="h-full w-2/3 rounded-full bg-foreground/30" />
          </div>
        </div>
      </div>
    </div>
  );
}
