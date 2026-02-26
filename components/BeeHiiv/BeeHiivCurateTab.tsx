"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import BeeHiivCurateModal from "@/components/BeeHiiv/BeeHiivCurateModal";
import BeeHiivLastSyncedBadge from "@/components/BeeHiiv/BeeHiivLastSyncedBadge";
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

export default function BeeHiivCurateTab() {
  const { selectedNewsletterId } = useSelectedNewsletterId();
  const [syncedAt, setSyncedAt] = useState(new Date());
  const [newsletter, setNewsletter] = useState<CurateNewsletter | null>(null);
  const [articleCount, setArticleCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);

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
        setSyncedAt(new Date());
        return;
      }

      const [{ count: articles }, { count: jobs }] = await Promise.all([
        supabase
          .from("articles")
          .select("id", { count: "exact", head: true })
          .eq("newsletter_id", selectedNewsletter.id),
        supabase
          .from("job_postings")
          .select("id", { count: "exact", head: true })
          .eq("newsletter_id", selectedNewsletter.id),
      ]);

      setArticleCount(articles ?? 0);
      setJobCount(jobs ?? 0);
      setSyncedAt(new Date());
    }

    loadCurateSummary();
  }, [selectedNewsletterId]);

  const referenceDate = newsletter?.created_at ? formatDate(newsletter.created_at) : "Pending";
  const referenceName = newsletter?.title ?? "No newsletter";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BeeHiivNewsletterSelector />
          <BeeHiivCurateModal />
        </div>
        <BeeHiivLastSyncedBadge syncedAt={syncedAt} />
      </div>
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