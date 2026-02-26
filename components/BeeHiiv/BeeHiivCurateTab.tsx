"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import BeeHiivCurateModal from "@/components/BeeHiiv/BeeHiivCurateModal";
import BeeHiivLastSyncedBadge from "@/components/BeeHiiv/BeeHiivLastSyncedBadge";
import {
  dispatchNewsletterCreated,
} from "@/components/BeeHiiv/BeeHiivNewsletterSelector";
import BeeHiivNewsletterSelector from "@/components/BeeHiiv/BeeHiivNewsletterSelector";
import { useSelectedNewsletterId } from "@/components/BeeHiiv/useSelectedNewsletterId";

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

type CurateNewsletter = {
  id: number;
  title: string | null;
  created_at: string;
};

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
  const [newsletter, setNewsletter] = useState<CurateNewsletter | null>(null);
  const [articleCount, setArticleCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);
  const [categoryCounters, setCategoryCounters] = useState<CategoryCounter[]>([]);
  const [isCreatingNewsletter, setIsCreatingNewsletter] = useState(false);
  const [createNewsletterError, setCreateNewsletterError] = useState<string | null>(null);

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

      setNewsletter(selectedNewsletter);

      if (!selectedNewsletter) {
        setArticleCount(0);
        setJobCount(0);
        setCategoryCounters([]);
        setSyncedAt(new Date());
        return;
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

  const referenceDate = newsletter?.created_at ? formatDate(newsletter.created_at) : "Pending";
  const referenceName = newsletter?.title ?? "No newsletter";

  async function createNewsletter() {
    setIsCreatingNewsletter(true);
    setCreateNewsletterError(null);

    const supabase = createClient();
    const { data: createdNewsletter, error } = await supabase
      .from("newsletters")
      .insert({})
      .select("id, title, created_at")
      .single();

    if (error) {
      setCreateNewsletterError(error.message);
      setIsCreatingNewsletter(false);
      return;
    }

    if (createdNewsletter) {
      dispatchNewsletterCreated(createdNewsletter);
    }

    setSyncedAt(new Date());
    setIsCreatingNewsletter(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BeeHiivNewsletterSelector />
          <BeeHiivCurateModal />
          <button
            type="button"
            className="app-btn-ghost h-10 w-10 text-lg font-semibold leading-none"
            onClick={createNewsletter}
            disabled={isCreatingNewsletter}
            aria-label="Create newsletter"
            title="Create newsletter"
          >
            +
          </button>
        </div>
        <BeeHiivLastSyncedBadge syncedAt={syncedAt} />
      </div>
      {createNewsletterError ? (
        <p className="app-text-danger text-sm">{createNewsletterError}</p>
      ) : null}
      <div className="flex items-center gap-3">
        {articleCount > 0 ? <SuccessIcon /> : <PendingIcon />}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold sm:text-base">Curate Articles</span>
            {articleCount === 0 ? (
              <span className="text-sm">No articles associated with the selected newsletter.</span>
            ) : (
              categoryCounters.map((counter) => {
                const color =
                  fixedCategoryBadges.find((badge) => badge.category === counter.category)?.color ??
                  "var(--chart-1)";

                return (
                  <span
                    key={counter.category}
                    className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold"
                    style={{
                      color,
                      borderColor: `color-mix(in srgb, ${color} 45%, transparent)`,
                      backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                    }}
                  >
                    {counter.category}: {counter.count}
                  </span>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {jobCount > 0 ? <SuccessIcon /> : <PendingIcon />}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold sm:text-base">Curate Jobs</span>
          <span
            className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold"
            style={{
              color: "var(--chart-4)",
              borderColor: "color-mix(in srgb, var(--chart-4) 45%, transparent)",
              backgroundColor: "color-mix(in srgb, var(--chart-4) 12%, transparent)",
            }}
          >
            Job Postings: {jobCount}
          </span>
        </div>
      </div>
    </div>
  );
}