"use client";

import { useEffect, useMemo, useState } from "react";
import { useSelectedNewsletterId } from "@/components/BeeHiiv/useSelectedNewsletterId";
import { createClient } from "@/utils/supabase/client";

type NewsletterOption = {
  id: number;
  title: string | null;
  created_at: string;
};

const NEWSLETTER_CREATED_EVENT = "beehiiv:newsletter-created";

function dispatchNewsletterCreated(newsletter: NewsletterOption) {
  window.dispatchEvent(
    new CustomEvent<NewsletterOption>(NEWSLETTER_CREATED_EVENT, {
      detail: newsletter,
    })
  );
}

let cachedNewsletters: NewsletterOption[] | null = null;

function formatOptionDate(value: string) {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${month}/${day}`;
}

export default function BeeHiivNewsletterSelectorWithCreate() {
  const { selectedNewsletterId, setSelectedNewsletterId } = useSelectedNewsletterId();
  const [newsletters, setNewsletters] = useState<NewsletterOption[]>(
    () => cachedNewsletters ?? []
  );
  const [isLoading, setIsLoading] = useState(() => cachedNewsletters == null);
  const [isCreatingNewsletter, setIsCreatingNewsletter] = useState(false);
  const [createNewsletterError, setCreateNewsletterError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedNewsletters != null) {
      return;
    }

    async function loadNewsletters() {
      setIsLoading(true);

      const response = await fetch("/api/beehiiv/design/newsletters", {
        method: "GET",
      });

      const payload = (await response.json()) as {
        newsletters?: NewsletterOption[];
      };

      if (response.ok) {
        const nextNewsletters = payload.newsletters ?? [];
        cachedNewsletters = nextNewsletters;
        setNewsletters(nextNewsletters);
      } else {
        cachedNewsletters = [];
        setNewsletters([]);
      }

      setIsLoading(false);
    }

    loadNewsletters();
  }, []);

  useEffect(() => {
    function handleNewsletterCreated(event: Event) {
      const customEvent = event as CustomEvent<NewsletterOption>;
      const created = customEvent.detail;

      if (!created) {
        return;
      }

      setNewsletters((current) => {
        const deduped = current.filter((newsletter) => newsletter.id !== created.id);
        const next = [created, ...deduped];
        cachedNewsletters = next;
        return next;
      });

      setSelectedNewsletterId(created.id);
    }

    window.addEventListener(NEWSLETTER_CREATED_EVENT, handleNewsletterCreated);

    return () => {
      window.removeEventListener(NEWSLETTER_CREATED_EVENT, handleNewsletterCreated);
    };
  }, [setSelectedNewsletterId]);

  useEffect(() => {
    if (newsletters.length === 0) {
      return;
    }

    if (selectedNewsletterId != null) {
      const exists = newsletters.some((newsletter) => newsletter.id === selectedNewsletterId);
      if (exists) {
        return;
      }
    }

    setSelectedNewsletterId(newsletters[0].id);
  }, [newsletters, selectedNewsletterId, setSelectedNewsletterId]);

  const selectedValue = useMemo(() => {
    if (selectedNewsletterId == null) {
      return "";
    }

    return String(selectedNewsletterId);
  }, [selectedNewsletterId]);

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

    setIsCreatingNewsletter(false);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <select
          value={selectedValue}
          onChange={(event) => {
            const nextValue = event.target.value;
            setSelectedNewsletterId(nextValue ? Number(nextValue) : null);
          }}
          className="app-input w-70"
          disabled={isLoading || newsletters.length === 0}
          aria-label="Select newsletter"
        >
          {isLoading && newsletters.length === 0 ? (
            <option value="">Loading newsletters...</option>
          ) : newsletters.length === 0 ? (
            <option value="">No newsletters available</option>
          ) : (
            newsletters.map((newsletter) => (
              <option key={newsletter.id} value={newsletter.id}>
                {`${formatOptionDate(newsletter.created_at)} • #${newsletter.id}`}
              </option>
            ))
          )}
        </select>
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

      {createNewsletterError ? (
        <p className="app-text-danger text-sm">{createNewsletterError}</p>
      ) : null}
    </div>
  );
}