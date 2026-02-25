"use client";

import { useEffect, useState } from "react";
import type { PayloadArticle, PayloadContextResponse, PayloadNewsletter } from "./types";

export function usePayloadContext() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newsletter, setNewsletter] = useState<PayloadNewsletter | null>(null);
  const [articles, setArticles] = useState<PayloadArticle[]>([]);

  useEffect(() => {
    async function loadPayloadContext() {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/beehiiv/design/context", {
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
  }, []);

  return {
    isLoading,
    error,
    newsletter,
    articles,
  };
}
