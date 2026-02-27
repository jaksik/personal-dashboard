"use client";

import { useState } from "react";

type DesignMetaFormProps = {
  disabled: boolean;
  title: string;
  subTitle: string;
  onTitleChange: (value: string) => void;
  onSubTitleChange: (value: string) => void;
  onSave: () => Promise<boolean>;
};

export default function DesignMetaForm({
  disabled,
  title,
  subTitle,
  onTitleChange,
  onSubTitleChange,
  onSave,
}: DesignMetaFormProps) {
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);

    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-foreground/15 bg-foreground/2 p-3">
      <h4 className="text-sm font-semibold">Newsletter Details</h4>

      <form onSubmit={handleSubmit} className="mt-3 space-y-2">
        <label className="app-text-muted mb-1 block text-[11px] font-medium uppercase tracking-[0.08em]">
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="Newsletter title"
          className="app-input h-9"
          disabled={disabled || isSaving}
        />

        <label className="app-text-muted mb-1 block text-[11px] font-medium uppercase tracking-[0.08em]">
          Subtitle
        </label>
        <input
          type="text"
          value={subTitle}
          onChange={(event) => onSubTitleChange(event.target.value)}
          placeholder="Newsletter subtitle"
          className="app-input h-9"
          disabled={disabled || isSaving}
        />

        <button
          type="submit"
          disabled={disabled || isSaving}
          className="app-btn w-full px-3 py-2 text-xs font-medium disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save Details"}
        </button>
      </form>
    </div>
  );
}
