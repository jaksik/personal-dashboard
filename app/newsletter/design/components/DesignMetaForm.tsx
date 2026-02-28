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
    <div className="rounded-lg p-3">

      <form onSubmit={handleSubmit} className="space-y-2">
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

        <div className="pt-1 flex justify-end">
          <button
            type="submit"
            disabled={disabled || isSaving}
            className="app-neon-badge app-neon-cyan inline-flex items-center px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Details"}
          </button>
        </div>
      </form>
    </div>
  );
}
