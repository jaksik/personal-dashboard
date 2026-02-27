"use client";

import { useState } from "react";
import BeeHiivNewsletterSelector, {
  dispatchNewsletterCreated,
} from "@/components/BeeHiiv/BeeHiivNewsletterSelector";
import { createClient } from "@/utils/supabase/client";

export default function BeeHiivNewsletterSelectorWithCreate() {
  const [isCreatingNewsletter, setIsCreatingNewsletter] = useState(false);
  const [createNewsletterError, setCreateNewsletterError] = useState<string | null>(null);

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
        <BeeHiivNewsletterSelector />
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