type BeeHiivLastSyncedBadgeProps = {
  syncedAt: Date;
};

function formatSyncedAt(value: Date) {
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  const hours24 = value.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = String(value.getMinutes()).padStart(2, "0");
  const meridiem = hours24 >= 12 ? "pm" : "am";

  return `${month}/${day} ${String(hours12).padStart(2, "0")}:${minutes} ${meridiem}`;
}

export default function BeeHiivLastSyncedBadge({
  syncedAt,
}: BeeHiivLastSyncedBadgeProps) {
  return (
    <div className="flex justify-end">
      <p className="app-text-muted flex items-center gap-2 text-xs">
        <span className="h-2 w-2 rounded-full bg-[#65e26d]" aria-hidden="true" />
        Last Synced: {formatSyncedAt(syncedAt)}
      </p>
    </div>
  );
}