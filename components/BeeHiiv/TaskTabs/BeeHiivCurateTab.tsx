"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import BeeHiivLastSyncedBadge from "@/components/BeeHiiv/BeeHiivLastSyncedBadge";
import { useSelectedNewsletterId } from "@/components/BeeHiiv/useSelectedNewsletterId";

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

type CategoryCounter = {
  category: string;
  count: number;
};

const fixedCategoryBadges = [
  { category: "Feature", color: "var(--chart-1)" },
  { category: "Brief", color: "var(--chart-2)" },
  { category: "Economy", color: "var(--chart-3)" },
  { category: "Research", color: "var(--chart-4)" },
];

export default function BeeHiivCurateTab() {
  const { selectedNewsletterId } = useSelectedNewsletterId();
  const [syncedAt, setSyncedAt] = useState(new Date());
  const [articleCount, setArticleCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);
  const [categoryCounters, setCategoryCounters] = useState<CategoryCounter[]>([]);
  const [activeNewsletterId, setActiveNewsletterId] = useState<number | null>(null);

  useEffect(() => {
    async function loadCurateSummary() {
      const supabase = createClient();
      const cutoff = new Date(new Date().getTime() - 12 * 60 * 60 * 1000).toISOString();

      const newsletterQuery = supabase
        .from("newsletters")
        .select("id, title, created_at")
        .order("created_at", { ascending: false })
        .limit(1);

      if (selectedNewsletterId != null) {
        newsletterQuery.eq("id", selectedNewsletterId);
      } else {
        newsletterQuery.gte("created_at", cutoff);
      }

      const { data: newsletters } = await newsletterQuery;
      const selectedNewsletter = newsletters?.[0] ?? null;

      if (!selectedNewsletter) {
        setArticleCount(0);
        setJobCount(0);
        setCategoryCounters([]);
        setActiveNewsletterId(null);
        setSyncedAt(new Date());
        return;
      }

      setActiveNewsletterId(selectedNewsletter.id);

      const [
        { count: articles },
        { count: jobs },
        { data: articleCategories },
      ] = await Promise.all([
        supabase
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("newsletter_id", selectedNewsletter.id),
        supabase
          .from("job_postings")
          .select("id", { count: "exact", head: true })
          .eq("newsletter_id", selectedNewsletter.id),
        supabase
          .from("articles")
          .select("category")
          .eq("newsletter_id", selectedNewsletter.id),
      ]);

      const categoryCounts = new Map<string, number>();

      for (const article of articleCategories ?? []) {
        const normalizedCategory = article.category?.trim().toLowerCase() ?? "";

        if (!normalizedCategory) {
          continue;
        }

        categoryCounts.set(
          normalizedCategory,
          (categoryCounts.get(normalizedCategory) ?? 0) + 1
        );
      }

      const nextCounters = fixedCategoryBadges.map((badge) => ({
        category: badge.category,
        count: categoryCounts.get(badge.category.toLowerCase()) ?? 0,
      }));

      setArticleCount(articles ?? 0);
      setJobCount(jobs ?? 0);
      setCategoryCounters(nextCounters);
      setSyncedAt(new Date());
    }

    loadCurateSummary();
  }, [selectedNewsletterId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link
            href="/newsletter/curate"
            className="app-btn-ghost inline-flex items-center px-3 py-1.5 text-xs font-medium"
          >
            Curate Workspace
          </Link>
        </div>
        <BeeHiivLastSyncedBadge syncedAt={syncedAt} />
      </div>
      <div className="flex items-start gap-3">
        {articleCount > 0 ? <SuccessIcon /> : <PendingIcon />}
        <div className="space-y-2">
          <div className="space-y-2">
            <p className="font-medium sm:text-base">
              <span className="font-semibold">{articleCount}</span>{" "}
              <span className="text-md">- Articles Selected</span>
            </p>
            {articleCount === 0 ? (
              <span className="text-sm">
                {activeNewsletterId == null
                  ? "No newsletter selected for this time window."
                  : "No articles associated with the selected newsletter."}
              </span>
            ) : (
              <ul className="app-text-muted list-disc space-y-1 pl-5 text-sm">
                {categoryCounters.map((counter) => (
                  <li key={counter.category}>
                    {counter.category}: {counter.count}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {jobCount > 0 ? <SuccessIcon /> : <PendingIcon />}
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium sm:text-base">
            <span className="font-semibold">{jobCount}</span>{" "}
            <span className="text-md">- Jobs Selected</span>
          </p>
        </div>
      </div>
    </div>
  );
}