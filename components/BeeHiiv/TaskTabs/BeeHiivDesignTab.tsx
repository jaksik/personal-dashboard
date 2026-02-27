"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BeeHiivLastSyncedBadge from "@/components/BeeHiiv/BeeHiivLastSyncedBadge";
import { useSelectedNewsletterId } from "@/components/BeeHiiv/useSelectedNewsletterId";
import { createClient } from "@/utils/supabase/client";

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

type DesignNewsletter = {
  id: number;
  title: string | null;
  sub_title: string | null;
  cover_image: string | null;
  cover_article: number | null;
  created_at: string;
};

export default function BeeHiivDesignTab() {
  const { selectedNewsletterId, setSelectedNewsletterId } = useSelectedNewsletterId();
  const [syncedAt, setSyncedAt] = useState(new Date());
  const [newsletter, setNewsletter] = useState<DesignNewsletter | null>(null);
  const [featureArticleSnippet, setFeatureArticleSnippet] = useState<string | null>(null);
  const [isResolvingNewsletter, setIsResolvingNewsletter] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    async function loadDesignSummary() {
      setIsResolvingNewsletter(true);
      const supabase = createClient();

      let resolvedNewsletter: DesignNewsletter | null = null;

      if (selectedNewsletterId != null) {
        const { data: newsletterById } = await supabase
          .from("newsletters")
          .select("id, title, sub_title, cover_image, cover_article, created_at")
          .eq("id", selectedNewsletterId)
          .limit(1)
          .maybeSingle();

        if (!isCurrent) {
          return;
        }

        resolvedNewsletter = newsletterById ?? null;
      }

      if (!resolvedNewsletter) {
        const { data: latestNewsletter } = await supabase
          .from("newsletters")
          .select("id, title, sub_title, cover_image, cover_article, created_at")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!isCurrent) {
          return;
        }

        resolvedNewsletter = latestNewsletter ?? null;
      }

      const selectedNewsletter = resolvedNewsletter;
      if (!isCurrent) {
        return;
      }

      setNewsletter(selectedNewsletter);

      if (selectedNewsletter && selectedNewsletterId !== selectedNewsletter.id) {
        setSelectedNewsletterId(selectedNewsletter.id);
      }

      if (selectedNewsletter?.cover_article != null) {
        const { data: featureArticle } = await supabase
          .from("articles")
          .select("title_snippet")
          .eq("id", selectedNewsletter.cover_article)
          .limit(1)
          .maybeSingle();

        if (!isCurrent) {
          return;
        }

        setFeatureArticleSnippet(featureArticle?.title_snippet ?? null);
      } else {
        setFeatureArticleSnippet(null);
      }

      setSyncedAt(new Date());
      setIsResolvingNewsletter(false);
    }

    loadDesignSummary();

    return () => {
      isCurrent = false;
    };
  }, [selectedNewsletterId, setSelectedNewsletterId]);

  const checks = useMemo(
    () => [
      {
        label: "Title",
        success: hasText(newsletter?.title ?? null),
        successMessage: newsletter?.title?.trim() ?? "",
        pendingMessage: "Title is missing",
        includeReferenceMetadata: false,
      },
      {
        label: "Sub Title",
        success: hasText(newsletter?.sub_title ?? null),
        successMessage: newsletter?.sub_title?.trim() ?? "",
        pendingMessage: "Sub title is missing",
        includeReferenceMetadata: false,
      },
      {
        label: "Feature Article",
        success: hasText(featureArticleSnippet),
        successMessage: featureArticleSnippet ?? "",
        pendingMessage: "Feature article is missing",
        includeReferenceMetadata: false,
      },
      {
        label: "Cover Image",
        success: hasText(newsletter?.cover_image ?? null),
        successMessage: "Cover image is set",
        pendingMessage: "Cover image is missing",
        includeReferenceMetadata: true,
        hideDetails: true,
      },
    ],
    [newsletter, featureArticleSnippet]
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
      <div className="space-y-4">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-3">
            {check.success ? <SuccessIcon /> : <PendingIcon />}
            <p className="font-medium sm:text-base">
              <span className="font-semibold">{check.label}</span>{" "}
              {check.hideDetails ? null : (
                <span className="text-sm">
                  {check.includeReferenceMetadata
                    ? "- "
                    : "- "}
                  {newsletter
                    ? check.success
                      ? check.successMessage
                      : check.pendingMessage
                    : isResolvingNewsletter
                      ? "Loading selected newsletter..."
                      : "No newsletters available."}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <div className="flex flex-col items-end gap-2">
          <BeeHiivLastSyncedBadge syncedAt={syncedAt} />
          <Link
            href="/newsletter/design"
            className="app-btn-ghost inline-flex items-center px-3 py-1.5 text-xs font-medium"
          >
            Design Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}