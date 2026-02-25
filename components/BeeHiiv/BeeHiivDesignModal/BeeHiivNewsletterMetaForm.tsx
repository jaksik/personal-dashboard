"use client";

import { useEffect, useState } from "react";

type NewsletterMeta = {
  id: number;
  title: string | null;
  sub_title: string | null;
  created_at: string;
};

type BeeHiivNewsletterMetaFormProps = {
  isVisible: boolean;
  onMetaChange?: (next: { title: string | null; sub_title: string | null }) => void;
};

export default function BeeHiivNewsletterMetaForm({
  isVisible,
  onMetaChange,
}: BeeHiivNewsletterMetaFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newsletter, setNewsletter] = useState<NewsletterMeta | null>(null);
  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    async function loadNewsletterMeta() {
      setIsLoading(true);
      setError(null);
      setMessage(null);

      const response = await fetch("/api/beehiiv/design/newsletter-meta", {
        method: "GET",
      });

      const payload = (await response.json()) as {
        error?: string;
        newsletter?: NewsletterMeta | null;
      };

      if (!response.ok) {
        setError(payload.error ?? "Failed to load newsletter details.");
        setIsLoading(false);
        return;
      }

      const fetchedNewsletter = payload.newsletter ?? null;
      setNewsletter(fetchedNewsletter);
      setTitle(fetchedNewsletter?.title ?? "");
      setSubTitle(fetchedNewsletter?.sub_title ?? "");
      onMetaChange?.({
        title: fetchedNewsletter?.title ?? null,
        sub_title: fetchedNewsletter?.sub_title ?? null,
      });
      setIsLoading(false);
    }

    loadNewsletterMeta();
  }, [isVisible, onMetaChange]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newsletter) {
      setError("No newsletter found in the last 12 hours.");
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/beehiiv/design/newsletter-meta", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newsletterId: newsletter.id,
        title,
        subTitle,
      }),
    });

    const payload = (await response.json()) as {
      error?: string;
      newsletter?: NewsletterMeta;
    };

    setIsSaving(false);

    if (!response.ok || !payload.newsletter) {
      setError(payload.error ?? "Failed to update newsletter details.");
      return;
    }

    setNewsletter(payload.newsletter);
    setTitle(payload.newsletter.title ?? "");
    setSubTitle(payload.newsletter.sub_title ?? "");
    onMetaChange?.({
      title: payload.newsletter.title ?? null,
      sub_title: payload.newsletter.sub_title ?? null,
    });
    setMessage("Newsletter title and subtitle updated.");
  }

  return (
    <div className="app-kpi p-4">
      <h4 className="text-sm font-semibold">Newsletter Details</h4>

      {isLoading ? (
        <p className="app-text-muted mt-3 text-xs">Loading newsletter details...</p>
      ) : !newsletter ? (
        <p className="app-text-muted mt-3 text-xs">No newsletter found in last 12 hours.</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2">
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Newsletter title"
            className="app-input"
            disabled={isSaving}
          />

          <input
            type="text"
            value={subTitle}
            onChange={(event) => setSubTitle(event.target.value)}
            placeholder="Newsletter subtitle"
            className="app-input"
            disabled={isSaving}
          />

          <button
            type="submit"
            disabled={isSaving}
            className="app-btn w-full px-3 py-2 text-xs font-medium disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Details"}
          </button>
        </form>
      )}

      {error ? <p className="app-text-danger mt-2 text-xs">{error}</p> : null}
      {message ? <p className="app-text-muted mt-2 text-xs">{message}</p> : null}
    </div>
  );
}
