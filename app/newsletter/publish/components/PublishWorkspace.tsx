"use client";

import { useEffect, useState } from "react";
import useSelectedNewsletterId from "@/components/newsletter/useSelectedNewsletterId";
import {
  getPublishWorkspaceDataAction,
  type PublishContextArticle,
  type PublishContextJob,
  type PublishContextNewsletter,
  type PublishStockRecap,
} from "../actions";
import PublishPreviewPanel from "@/app/newsletter/publish/components/PublishPreviewPanel";

export default function PublishWorkspace() {
  const { selectedNewsletterId } = useSelectedNewsletterId();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newsletter, setNewsletter] = useState<PublishContextNewsletter | null>(null);
  const [articles, setArticles] = useState<PublishContextArticle[]>([]);
  const [jobs, setJobs] = useState<PublishContextJob[]>([]);
  const [stockRecaps, setStockRecaps] = useState<PublishStockRecap[]>([]);

  useEffect(() => {
    async function loadPublishWorkspaceData() {
      setIsLoading(true);
      setError(null);

      try {
        const payload = await getPublishWorkspaceDataAction(selectedNewsletterId);
        setNewsletter(payload.newsletter);
        setArticles(payload.articles);
        setJobs(payload.jobs);
        setStockRecaps(payload.stockRecaps);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load publish workspace.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPublishWorkspaceData();
  }, [selectedNewsletterId]);

  return (
    <div className="mx-auto w-full max-w-6xl border-t border-foreground/15 py-6">
      {isLoading ? <p className="app-text-muted px-1 text-xs">Loading publish workspace...</p> : null}
      {error ? <p className="app-text-danger px-1 text-xs">{error}</p> : null}
      {!isLoading && !error && !newsletter ? (
        <p className="app-text-muted px-1 text-xs">Select a newsletter to generate a payload.</p>
      ) : null}

      {newsletter ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          {/* <section className="space-y-3 lg:col-span-6">
           

            <div className="rounded-xl border border-foreground/15 bg-foreground/3 p-3">
              <p className="app-text-muted text-[11px] font-semibold uppercase tracking-[0.08em]">
                HTML Payload
              </p>
              <pre className="mt-3 max-h-136 overflow-auto whitespace-pre-wrap wrap-break-word text-xs app-text-muted">
                {htmlPayload}
              </pre>
            </div>
          </section> */}

          <section className="lg:col-span-7 lg:col-start-4">
            <PublishPreviewPanel
              title={newsletter.title}
              subTitle={newsletter.sub_title}
              coverImage={newsletter.cover_image}
              articles={articles}
              jobs={jobs}
              stockRecaps={stockRecaps}
            />
          </section>
        </div>
      ) : null}
    </div>
  );
}
