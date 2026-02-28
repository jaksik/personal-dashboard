"use client";

import { useEffect, useMemo, useState } from "react";
import useSelectedNewsletterId from "@/components/newsletter/useSelectedNewsletterId";
import {
  getPublishWorkspaceDataAction,
  type PublishContextArticle,
  type PublishContextJob,
  type PublishContextNewsletter,
} from "../actions";
import { buildPublishPayloads } from "./payload/publishPayloadBuilder";
import PublishCopyButton from "./PublishCopyButton";
import PublishPreviewPanel from "./PublishPreviewPanel";

export default function PublishWorkspace() {
  const { selectedNewsletterId } = useSelectedNewsletterId();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newsletter, setNewsletter] = useState<PublishContextNewsletter | null>(null);
  const [articles, setArticles] = useState<PublishContextArticle[]>([]);
  const [jobs, setJobs] = useState<PublishContextJob[]>([]);

  useEffect(() => {
    async function loadPublishWorkspaceData() {
      setIsLoading(true);
      setError(null);

      try {
        const payload = await getPublishWorkspaceDataAction(selectedNewsletterId);
        setNewsletter(payload.newsletter);
        setArticles(payload.articles);
        setJobs(payload.jobs);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load publish workspace.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPublishWorkspaceData();
  }, [selectedNewsletterId]);

  const payloads = useMemo(() => {
    if (!newsletter) {
      return {
        htmlPayload: "",
        plainTextPayload: "",
      };
    }

    return buildPublishPayloads({ newsletter, articles, jobs });
  }, [newsletter, articles, jobs]);

  const { htmlPayload, plainTextPayload } = payloads;

  return (
    <div className="mx-auto w-full max-w-6xl border-t border-foreground/15 py-6">
      {isLoading ? <p className="app-text-muted px-1 text-xs">Loading publish workspace...</p> : null}
      {error ? <p className="app-text-danger px-1 text-xs">{error}</p> : null}
      {!isLoading && !error && !newsletter ? (
        <p className="app-text-muted px-1 text-xs">Select a newsletter to generate a payload.</p>
      ) : null}

      {newsletter ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <section className="space-y-3 lg:col-span-6">
            <div className="rounded-xl border border-foreground/15 bg-foreground/3 p-3">
              <p className="app-text-muted text-[11px] font-semibold uppercase tracking-[0.08em]">
                Payload Generator
              </p>
              <h4 className="mt-1 text-base font-semibold">{newsletter.title ?? "Newsletter Title"}</h4>

              <div className="mt-3">
                <PublishCopyButton htmlPayload={htmlPayload} plainTextPayload={plainTextPayload} />
              </div>
            </div>

            <div className="rounded-xl border border-foreground/15 bg-foreground/3 p-3">
              <p className="app-text-muted text-[11px] font-semibold uppercase tracking-[0.08em]">
                HTML Payload
              </p>
              <pre className="mt-3 max-h-136 overflow-auto whitespace-pre-wrap break-words text-xs app-text-muted">
                {htmlPayload}
              </pre>
            </div>
          </section>

          <section className="lg:col-span-6">
            <PublishPreviewPanel
              title={newsletter.title}
              subTitle={newsletter.sub_title}
              coverImage={newsletter.cover_image}
              articles={articles}
              jobs={jobs}
            />
          </section>
        </div>
      ) : null}
    </div>
  );
}
