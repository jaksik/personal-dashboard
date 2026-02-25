import { createClient } from "@/utils/supabase/server";
import BeeHiivLastSyncedBadge from "@/components/BeeHiiv/BeeHiivLastSyncedBadge";

export type OperationLogTarget = {
  label: string;
  category: string;
};

type OperationLogStatusListProps = {
  items: OperationLogTarget[];
  lookbackHours?: number;
};

function formatDate(value: string) {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const meridiem = hours24 >= 12 ? "pm" : "am";

  return `${month}/${day}, ${String(hours12).padStart(2, "0")}:${minutes} ${meridiem}`;
}

function isSuccessStatus(status: string | null) {
  return status?.toLowerCase() === "success";
}

function SuccessIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" aria-label="Success">
      <circle cx="12" cy="12" r="10" fill="none" stroke="#65e26d" strokeWidth="1.8" />
      <path
        d="M7.5 12.2 10.6 15.3 16.7 9.2"
        fill="none"
        stroke="#65e26d"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" aria-label="Pending">
      <circle cx="12" cy="12" r="10" fill="none" stroke="#facc15" strokeWidth="1.8" />
      <path
        d="M12 7.5v5l3 2"
        fill="none"
        stroke="#facc15"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function OperationLogStatusList({
  items,
  lookbackHours = 20,
}: OperationLogStatusListProps) {
  const syncedAt = new Date();
  const supabase = await createClient();
  const cutoff = new Date(
    new Date().getTime() - lookbackHours * 60 * 60 * 1000
  ).toISOString();
  const categories = items.map((item) => item.category);

  const { data: logs } = await supabase
    .from("logs")
    .select("category, created_at, name, message, status")
    .in("category", categories)
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false });

  type LogRow = NonNullable<typeof logs>[number];
  const latestByCategory = new Map<string, LogRow>();

  for (const log of logs ?? []) {
    if (!latestByCategory.has(log.category ?? "")) {
      latestByCategory.set(log.category ?? "", log);
    }
  }

  return (
    <div className="space-y-4">
      <BeeHiivLastSyncedBadge syncedAt={syncedAt} />
      {items.map((item) => {
        const log = latestByCategory.get(item.category);
        const success = isSuccessStatus(log?.status ?? null);

        return (
          <div key={item.category} className="flex items-center gap-3">
            {success ? <SuccessIcon /> : <PendingIcon />}
            <p className="font-medium sm:text-base">
              <span className="font-semibold">{item.label}</span> <span className="text-sm">- {log?.created_at ? formatDate(log.created_at): "Pending"} -{" "}
              {log?.name ?? "No run"} - {log?.message ?? "No recent log in the last 20 hours"}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}