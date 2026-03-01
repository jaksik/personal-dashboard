"use client";

import { useEffect, useMemo, useState } from "react";
import useSelectedNewsletterId from "@/components/newsletter/useSelectedNewsletterId";
import {
  getPublishWorkspaceDataAction,
  type PublishContextArticle,
  type PublishContextJob,
  type PublishContextNewsletter,
  type PublishStockRecap,
} from "../actions";
import { buildPublishPayloads } from "@/app/newsletter/publish/components/payload/publishPayloadBuilder";
import PublishCopyButton from "@/app/newsletter/publish/components/PublishCopyButton";

export default function PublishRowActions() {
  const { selectedNewsletterId } = useSelectedNewsletterId();
  const [isLoading, setIsLoading] = useState(false);
  const [newsletter, setNewsletter] = useState<PublishContextNewsletter | null>(null);
  const [articles, setArticles] = useState<PublishContextArticle[]>([]);
  const [jobs, setJobs] = useState<PublishContextJob[]>([]);
  const [stockRecaps, setStockRecaps] = useState<PublishStockRecap[]>([]);

  useEffect(() => {
    async function loadPublishData() {
      setIsLoading(true);

      try {
        const payload = await getPublishWorkspaceDataAction(selectedNewsletterId);
        setNewsletter(payload.newsletter);
        setArticles(payload.articles);
        setJobs(payload.jobs);
        setStockRecaps(payload.stockRecaps);
      } finally {
        setIsLoading(false);
      }
    }

    loadPublishData();
  }, [selectedNewsletterId]);

  const payloads = useMemo(() => {
    if (!newsletter) {
      return {
        htmlPayload: "",
        plainTextPayload: "",
      };
    }

    return buildPublishPayloads({ newsletter, articles, jobs, stockRecaps });
  }, [newsletter, articles, jobs, stockRecaps]);

  if (isLoading) {
    return <p className="app-text-muted text-xs">Preparing payload...</p>;
  }

  if (!newsletter) {
    return <p className="app-text-muted text-xs">Select a newsletter to publish.</p>;
  }

  return (
    <PublishCopyButton
      htmlPayload={payloads.htmlPayload}
      plainTextPayload={payloads.plainTextPayload}
      label="Publish"
      buttonClassName="app-newsletter-assigned-btn inline-flex items-center px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition"
    />
  );
}