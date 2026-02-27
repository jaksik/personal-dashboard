"use client";

import { useEffect, useMemo, useState } from "react";

type NewsletterOption = {
  id: number;
  created_at: string;
};

type NewsletterSelectProps = {
  value: number | null;
  onChange: (newsletterId: number | null) => void;
};

let cachedNewsletters: NewsletterOption[] | null = null;

function formatOptionDate(value: string) {
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}`;
}

export default function NewsletterSelect({ value, onChange }: NewsletterSelectProps) {
  const [newsletters, setNewsletters] = useState<NewsletterOption[]>(() => cachedNewsletters ?? []);
  const [isLoading, setIsLoading] = useState(() => cachedNewsletters == null);

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
    if (newsletters.length === 0) {
      return;
    }

    if (value != null && newsletters.some((item) => item.id === value)) {
      return;
    }

    onChange(newsletters[0].id);
  }, [newsletters, value, onChange]);

  const selectedValue = useMemo(() => {
    if (value == null) {
      return "";
    }

    return String(value);
  }, [value]);

  return (
    <select
      value={selectedValue}
      onChange={(event) => {
        const nextValue = event.target.value;
        onChange(nextValue ? Number(nextValue) : null);
      }}
      className="app-input h-9 min-w-48 md:h-10 md:min-w-64"
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
  );
}
