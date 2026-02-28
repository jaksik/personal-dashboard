"use client";

import { useCallback, useSyncExternalStore } from "react";

const SELECTED_NEWSLETTER_STORAGE_KEY = "beehiiv:selected-newsletter-id";
const SELECTED_NEWSLETTER_EVENT = "beehiiv:selected-newsletter-id:changed";

function parseSelectedNewsletterId(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function getSelectedNewsletterStorageKey() {
  return SELECTED_NEWSLETTER_STORAGE_KEY;
}

export function getSelectedNewsletterEventName() {
  return SELECTED_NEWSLETTER_EVENT;
}

export function useSelectedNewsletterId() {
  const selectedNewsletterId = useSyncExternalStore(
    (onStoreChange) => {
      function handleStorage(event: StorageEvent) {
        if (event.key !== SELECTED_NEWSLETTER_STORAGE_KEY) {
          return;
        }

        onStoreChange();
      }

      function handleSelectionChanged() {
        onStoreChange();
      }

      window.addEventListener("storage", handleStorage);
      window.addEventListener(SELECTED_NEWSLETTER_EVENT, handleSelectionChanged);

      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(SELECTED_NEWSLETTER_EVENT, handleSelectionChanged);
      };
    },
    () =>
      parseSelectedNewsletterId(window.localStorage.getItem(SELECTED_NEWSLETTER_STORAGE_KEY)),
    () => null
  );

  const updateSelectedNewsletterId = useCallback((nextId: number | null) => {
    if (nextId == null) {
      window.localStorage.removeItem(SELECTED_NEWSLETTER_STORAGE_KEY);
    } else {
      window.localStorage.setItem(SELECTED_NEWSLETTER_STORAGE_KEY, String(nextId));
    }

    window.dispatchEvent(new Event(SELECTED_NEWSLETTER_EVENT));
  }, []);

  return {
    selectedNewsletterId,
    setSelectedNewsletterId: updateSelectedNewsletterId,
  };
}
