"use client";

import { useEffect, useState } from "react";

const NEWSLETTER_SELECTION_KEY = "newsletter:selected-id";
const NEWSLETTER_SELECTION_EVENT = "newsletter:selected-id:change";

function getInitialNewsletterId(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(NEWSLETTER_SELECTION_KEY);
  if (!rawValue) {
    return null;
  }

  const parsed = Number(rawValue);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export default function useSelectedNewsletterId() {
  const [selectedNewsletterId, setSelectedNewsletterId] = useState<number | null>(() =>
    getInitialNewsletterId()
  );

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== NEWSLETTER_SELECTION_KEY) {
        return;
      }

      const nextRawValue = event.newValue;
      const nextValue = nextRawValue ? Number(nextRawValue) : null;

      if (nextValue == null || !Number.isInteger(nextValue) || nextValue <= 0) {
        setSelectedNewsletterId(null);
        return;
      }

      setSelectedNewsletterId(nextValue);
    }

    function handleSameTabChange(event: Event) {
      const customEvent = event as CustomEvent<number | null>;
      const nextValue = customEvent.detail;
      setSelectedNewsletterId(nextValue);
    }

    window.addEventListener("storage", handleStorage);
    window.addEventListener(NEWSLETTER_SELECTION_EVENT, handleSameTabChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(NEWSLETTER_SELECTION_EVENT, handleSameTabChange);
    };
  }, []);

  function updateSelectedNewsletterId(nextNewsletterId: number | null) {
    setSelectedNewsletterId(nextNewsletterId);

    if (nextNewsletterId == null) {
      window.localStorage.removeItem(NEWSLETTER_SELECTION_KEY);
    } else {
      window.localStorage.setItem(NEWSLETTER_SELECTION_KEY, String(nextNewsletterId));
    }

    window.dispatchEvent(
      new CustomEvent<number | null>(NEWSLETTER_SELECTION_EVENT, {
        detail: nextNewsletterId,
      })
    );
  }

  return {
    selectedNewsletterId,
    setSelectedNewsletterId: updateSelectedNewsletterId,
  };
}
