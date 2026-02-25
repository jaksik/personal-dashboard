import { createClient } from "@/utils/supabase/server";
import BeeHiivCurateModal from "@/components/BeeHiiv/BeeHiivCurateModal";
import BeeHiivLastSyncedBadge from "@/components/BeeHiiv/BeeHiivLastSyncedBadge";

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

export default async function BeeHiivCurateTab() {
  const syncedAt = new Date();
  const supabase = await createClient();
  const cutoff = new Date(new Date().getTime() - 12 * 60 * 60 * 1000).toISOString();

  const { data: newsletters } = await supabase
    .from("newsletters")
    .select("id, title, created_at")
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(1);

  const latestNewsletter = newsletters?.[0] ?? null;

  let articleCount = 0;
  let jobCount = 0;

  if (latestNewsletter) {
    const [{ count: articles }, { count: jobs }] = await Promise.all([
      supabase
        .from("articles")
        .select("id", { count: "exact", head: true })
        .eq("newsletter_id", latestNewsletter.id),
      supabase
        .from("job_postings")
        .select("id", { count: "exact", head: true })
        .eq("newsletter_id", latestNewsletter.id),
    ]);

    articleCount = articles ?? 0;
    jobCount = jobs ?? 0;
  }

  const referenceDate = latestNewsletter?.created_at
    ? formatDate(latestNewsletter.created_at)
    : "Pending";
  const referenceName = latestNewsletter?.title ?? "No newsletter";

  return (
    <div className="space-y-4">
      <BeeHiivLastSyncedBadge syncedAt={syncedAt} />
      <BeeHiivCurateModal />
      <div className="flex items-center gap-3">
        {articleCount > 0 ? <SuccessIcon /> : <PendingIcon />}
        <p className="font-medium sm:text-base">
          <span className="font-semibold">Curate Articles</span>{" "}
          <span className="text-sm">
            - {referenceDate} - {referenceName} - {articleCount > 0
              ? `${articleCount} associated article${articleCount === 1 ? "" : "s"}`
              : "No associated articles found"}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        {jobCount > 0 ? <SuccessIcon /> : <PendingIcon />}
        <p className="font-medium sm:text-base">
          <span className="font-semibold">Curate Jobs</span>{" "}
          <span className="text-sm">
            - {referenceDate} - {referenceName} - {jobCount > 0
              ? `${jobCount} associated job${jobCount === 1 ? "" : "s"}`
              : "No associated jobs found"}
          </span>
        </p>
      </div>
    </div>
  );
}