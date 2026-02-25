import BeeHiivLastSyncedBadge from "@/components/BeeHiiv/BeeHiivLastSyncedBadge";
import BeeHiivDesignModal from "@/components/BeeHiiv/BeeHiivDesignModal";
import { createClient } from "@/utils/supabase/server";

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

function hasText(value: string | null) {
  return Boolean(value && value.trim().length > 0);
}

export default async function BeeHiivDesignTab() {
  const syncedAt = new Date();
  const supabase = await createClient();
  const cutoff = new Date(new Date().getTime() - 12 * 60 * 60 * 1000).toISOString();

  const { data: newsletters } = await supabase
    .from("newsletters")
    .select("id, title, sub_title, cover_image, cover_article, created_at")
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(1);

  const latestNewsletter = newsletters?.[0] ?? null;

  const referenceDate = latestNewsletter?.created_at
    ? formatDate(latestNewsletter.created_at)
    : "Pending";
  const referenceName = latestNewsletter?.title ?? "No newsletter";

  const checks = [
    {
      label: "Has Title",
      success: hasText(latestNewsletter?.title ?? null),
      successMessage: "Title is set",
      pendingMessage: "Title is missing",
    },
    {
      label: "Has Sub Title",
      success: hasText(latestNewsletter?.sub_title ?? null),
      successMessage: "Sub title is set",
      pendingMessage: "Sub title is missing",
    },
    {
      label: "Has Cover Image",
      success: hasText(latestNewsletter?.cover_image ?? null),
      successMessage: "Cover image is set",
      pendingMessage: "Cover image is missing",
    },
    {
      label: "Has Cover Article",
      success: latestNewsletter?.cover_article != null,
      successMessage: "Cover article is set",
      pendingMessage: "Cover article is missing",
    },
  ];

  return (
    <div className="space-y-4">
      <BeeHiivLastSyncedBadge syncedAt={syncedAt} />
      <BeeHiivDesignModal />

      {checks.map((check) => (
        <div key={check.label} className="flex items-center gap-3">
          {check.success ? <SuccessIcon /> : <PendingIcon />}
          <p className="font-medium sm:text-base">
            <span className="font-semibold">{check.label}</span>{" "}
            <span className="text-sm">
              - {referenceDate} - {referenceName} -{" "}
              {latestNewsletter
                ? check.success
                  ? check.successMessage
                  : check.pendingMessage
                : "No newsletter created in last 12 hours"}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
}