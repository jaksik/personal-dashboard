import { createClient } from "@/utils/supabase/server";
import BeeHiivLastSyncedBadge from "@/components/BeeHiiv/BeeHiivLastSyncedBadge";
import BeeHiivCreateTabStatusRow from "@/components/BeeHiiv/BeeHiivCreateTabStatusRow";

type OperationLogStatusListProps = {
  lookbackHours?: number;
};

function formatTime(value: string) {
  const date = new Date(value);
  const hours24 = date.getHours();
  const hours12 = hours24 % 12 || 12;
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const meridiem = hours24 >= 12 ? "pm" : "am";

  return `${String(hours12).padStart(2, "0")}:${minutes}${meridiem}`;
}

export default async function OperationLogStatusList({
  lookbackHours = 50,
}: OperationLogStatusListProps) {
  const syncedAt = new Date();
  const supabase = await createClient();
  const cutoff = new Date(
    new Date().getTime() - lookbackHours * 60 * 60 * 1000
  ).toISOString();
  const snippetCutoff = new Date(new Date().getTime() - 50 * 60 * 60 * 1000).toISOString();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartIso = todayStart.toISOString();

  const [
    { count: articleCount },
    { count: jobCount },
    { data: latestArticleRows },
    { data: latestJobRows },
    { data: todaysNewsletterRows },
    { data: articleFetcherLogs },
    { data: snippetGeneratorLogs },
    { data: jobFetcherLogs },
    { data: createNewsletterLogs },
  ] = await Promise.all([
    supabase
      .from("articles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", cutoff),
    supabase
      .from("job_postings")
      .select("id", { count: "exact", head: true })
      .gte("created_at", cutoff),
    supabase
      .from("articles")
      .select("created_at")
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("job_postings")
      .select("created_at")
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("newsletters")
      .select("id, created_at")
      .gte("created_at", todayStartIso)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("logs")
      .select("id, created_at, category, name, message, status")
      .eq("category", "Article Fetcher")
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false }),
    supabase
      .from("logs")
      .select("id, created_at, category, name, message, status")
      .eq("category", "Snippet Generator")
      .gte("created_at", snippetCutoff)
      .order("created_at", { ascending: false }),
    supabase
      .from("logs")
      .select("id, created_at, category, name, message, status")
      .eq("category", "Job Fetcher")
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false }),
    supabase
      .from("logs")
      .select("id, created_at, category, name, message, status")
      .eq("category", "Create Newsletter")
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false }),
  ]);

  const latestArticleCreatedAt = latestArticleRows?.[0]?.created_at ?? null;
  const latestJobCreatedAt = latestJobRows?.[0]?.created_at ?? null;
  const articleCountValue = articleCount ?? 0;
  const jobCountValue = jobCount ?? 0;
  const snippetCountValue = snippetGeneratorLogs?.length ?? 0;
  const todaysNewsletter = todaysNewsletterRows?.[0] ?? null;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
      <div className="space-y-4">
        <BeeHiivCreateTabStatusRow
          label={`${articleCountValue}`}
          success={articleCountValue > 0}
          summary={` - ${
            articleCountValue > 0
              ? ` Article${articleCountValue === 1 ? "" : "s"} saved in the last ${lookbackHours} hours`
              : `No articles saved in the last ${lookbackHours} hours`
          }`}
          logs={articleFetcherLogs ?? []}
        />

        <BeeHiivCreateTabStatusRow
          label="70"
          success={snippetCountValue > 0}
          summary={` - Snippets generated in the last 50 hours`}
          logs={snippetGeneratorLogs ?? []}
        />

        <BeeHiivCreateTabStatusRow
          label={`${jobCountValue}`}
          success={jobCountValue > 0}
          summary={` - ${
            jobCountValue > 0
              ? ` Job${jobCountValue === 1 ? "" : "s"} saved in the last ${lookbackHours} hours`
              : `No jobs saved in the last ${lookbackHours} hours`
          }`}
          logs={jobFetcherLogs ?? []}
        />

        <BeeHiivCreateTabStatusRow
          label="1"
          success={Boolean(todaysNewsletter)}
          summary={` - ${
            todaysNewsletter
              ? `Newsletter created (id: ${todaysNewsletter.id}).`
              : "No newsletter created today"
          }`}
          logs={createNewsletterLogs ?? []}
        />
      </div>

      <div className="flex justify-end self-start">
        <BeeHiivLastSyncedBadge syncedAt={syncedAt} />
      </div>
    </div>
  );
}