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

const fixedCategories = ["Feature", "Brief", "Economy", "Research", "Uncategorized"];

export default function BeeHiivCurateTab() {
  const { selectedNewsletterId, setSelectedNewsletterId } = useSelectedNewsletterId();
  const [syncedAt, setSyncedAt] = useState(new Date());
  const [articleCount, setArticleCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);
  const [categoryCounters, setCategoryCounters] = useState<CategoryCounter[]>([]);
  const [activeNewsletterId, setActiveNewsletterId] = useState<number | null>(null);
  const [isResolvingNewsletter, setIsResolvingNewsletter] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    async function loadCurateSummary() {
      setIsResolvingNewsletter(true);
      const supabase = createClient();

      let selectedNewsletter: { id: number } | null = null;

      if (selectedNewsletterId != null) {
        const { data: newsletterById } = await supabase
          .from("newsletters")
          .select("id")
          .eq("id", selectedNewsletterId)
          .limit(1)
          .maybeSingle();

        if (!isCurrent) {
          return;
        }

        selectedNewsletter = newsletterById ?? null;
      }

      if (!selectedNewsletter) {
        const { data: latestNewsletter } = await supabase
          .from("newsletters")
          .select("id")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!isCurrent) {
          return;
        }

        selectedNewsletter = latestNewsletter ?? null;
      }

      if (!selectedNewsletter) {
        if (!isCurrent) {
          return;
        }

        setArticleCount(0);
        setJobCount(0);
        setCategoryCounters([]);
        setActiveNewsletterId(null);
        setSyncedAt(new Date());
        setIsResolvingNewsletter(false);
        return;
      }

      setActiveNewsletterId(selectedNewsletter.id);

      if (selectedNewsletterId !== selectedNewsletter.id) {
        setSelectedNewsletterId(selectedNewsletter.id);
      }

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

      if (!isCurrent) {
        return;
      }

      const categoryCounts = new Map<string, number>();

      for (const article of articleCategories ?? []) {
        const normalizedCategory = article.category?.trim().toLowerCase() || "uncategorized";

        categoryCounts.set(
          normalizedCategory,
          (categoryCounts.get(normalizedCategory) ?? 0) + 1
        );
      }

      const nextCounters = fixedCategories.map((category) => ({
        category,
        count: categoryCounts.get(category.toLowerCase()) ?? 0,
      }));

      setArticleCount(articles ?? 0);
      setJobCount(jobs ?? 0);
      setCategoryCounters(nextCounters);
      setSyncedAt(new Date());
      setIsResolvingNewsletter(false);
    }

    loadCurateSummary();

    return () => {
      isCurrent = false;
    };
  }, [selectedNewsletterId, setSelectedNewsletterId]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          {articleCount > 0 ? <SuccessIcon /> : <PendingIcon />}
          <div className="space-y-2">
            <div className="space-y-2">
              <p className="font-medium sm:text-base">
                <span className="font-semibold">{articleCount}</span>{" "}
                <span className="text-md">- Articles Selected</span>
              </p>
              {articleCount > 0 ? (
                <ul className="app-text-muted list-disc space-y-1 pl-5 text-sm">
                  {categoryCounters.map((counter) => (
                    <li key={counter.category}>
                      {counter.category}: {counter.count}
                    </li>
                  ))}
                </ul>
              ) : null}
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

      <div className="flex justify-end">
        <div className="flex flex-col items-end gap-2">
          <BeeHiivLastSyncedBadge syncedAt={syncedAt} />
          <Link
            href="/newsletter/curate"
            className="app-btn-ghost inline-flex items-center px-3 py-1.5 text-xs font-medium"
          >
            Curate Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}