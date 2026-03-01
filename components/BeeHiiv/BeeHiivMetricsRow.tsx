import { createClient } from "@/utils/supabase/server";
import type { Tables } from "@/utils/supabase/database.types";

type MetricsRow = Tables<"metrics">;

function formatPercent(value: number | null) {
  if (value == null) {
    return "--%";
  }

  const hasDecimals = !Number.isInteger(value);
  const rounded = hasDecimals ? value.toFixed(1) : String(value);
  return `${rounded}%`;
}

function formatNumber(value: number | null) {
  if (value == null) {
    return "----";
  }

  return Math.round(value).toLocaleString("en-US");
}

function renderMetricCards(latestMetrics: MetricsRow | null) {
  return (
    <>
      <div className="rounded-md border border-foreground/15 p-3">
        <p className="app-text-muted text-xs">Open Rate</p>
        <p className="mt-1 text-lg font-semibold">{formatPercent(latestMetrics?.open_rate ?? null)}</p>
      </div>

      <div className="rounded-md border border-foreground/15 p-3">
        <p className="app-text-muted text-xs">CTR</p>
        <p className="mt-1 text-lg font-semibold">{formatPercent(latestMetrics?.ctr ?? null)}</p>
      </div>

      <div className="rounded-md border border-foreground/15 p-3">
        <p className="app-text-muted text-xs">Subscribers</p>
        <p className="mt-1 text-lg font-semibold">{formatNumber(latestMetrics?.subscribers ?? null)}</p>
      </div>

      <div className="rounded-md border border-foreground/15 p-3">
        <p className="app-text-muted text-xs">Publications</p>
        <p className="mt-1 text-lg font-semibold">{formatNumber(latestMetrics?.publications ?? null)}</p>
      </div>

      <div className="rounded-md border border-foreground/15 p-3">
        <p className="app-text-muted text-xs">90 Day Opens</p>
        <p className="mt-1 text-lg font-semibold">{formatNumber(latestMetrics?.["90_day_opens"] ?? null)}</p>
      </div>
    </>
  );
}

export default async function BeeHiivMetricsRow() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("metrics")
    .select("id, created_at, open_rate, ctr, subscribers, publications, 90_day_opens")
    .order("created_at", { ascending: false })
    .limit(1);

  const latestMetrics = !error && data?.length ? (data[0] as MetricsRow) : null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
      {renderMetricCards(latestMetrics)}
    </div>
  );
}
