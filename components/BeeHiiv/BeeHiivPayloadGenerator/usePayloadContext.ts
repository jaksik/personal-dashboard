"use client";

import { useEffect, useState } from "react";
import type { PayloadArticle, PayloadContextResponse, PayloadNewsletter } from "./types";
import { useSelectedNewsletterId } from "@/components/BeeHiiv/useSelectedNewsletterId";

export function usePayloadContext() {
  const { selectedNewsletterId } = useSelectedNewsletterId();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newsletter, setNewsletter] = useState<PayloadNewsletter | null>(null);
  const [articles, setArticles] = useState<PayloadArticle[]>([]);

  useEffect(() => {
    async function loadPayloadContext() {
      setIsLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();

      if (selectedNewsletterId != null) {
        searchParams.set("newsletterId", String(selectedNewsletterId));
      }

      const response = await fetch(`/api/beehiiv/design/context?${searchParams.toString()}`, {
        method: "GET",
      });

      const payload = (await response.json()) as Partial<PayloadContextResponse> & {
        error?: string;
      };

      if (!response.ok) {
        setError(payload.error ?? "Failed to load newsletter context.");
        setNewsletter(null);
        setArticles([]);
        setIsLoading(false);
        return;
      }

      setNewsletter(payload.newsletter ?? null);
      setArticles(payload.articles ?? []);
      setIsLoading(false);
    }

    loadPayloadContext();
  }, [selectedNewsletterId]);

  return {
    isLoading,
    error,
    newsletter,
    articles,
  };
}
