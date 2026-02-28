"use client";

import { useState } from "react";
import type { NewsletterImage } from "../actions";

const GROK_IMAGE_MODELS = [
  { value: "grok-imagine-image", label: "Grok Image 1 ($.02)" },
  { value: "grok-imagine-image-pro", label: "Grok Pro Image ($.07)" },
  { value: "grok-2-image-1212", label: "Grok Image 2 ($.07)" },
];

type DesignImageGeneratorProps = {
  disabled: boolean;
  images: NewsletterImage[];
  coverImage: string | null;
  onGenerate: (input: { prompt: string; model: string }) => Promise<boolean>;
  onSetCoverImage: (imageId: number) => Promise<void>;
};

function formatMonthDay(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${month}/${day}`;
}

function truncateText(value: string | null, maxLength: number) {
  if (!value) {
    return "—";
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}…`;
}

export default function DesignImageGenerator({
  disabled,
  images,
  coverImage,
  onGenerate,
  onSetCoverImage,
}: DesignImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [settingCoverImageId, setSettingCoverImageId] = useState<number | null>(null);
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState(GROK_IMAGE_MODELS[0].value);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsGenerating(true);

    try {
      const wasSuccessful = await onGenerate({ prompt, model });
      if (wasSuccessful) {
        setPrompt("");
      }
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="rounded-lg p-3">

      <form onSubmit={handleSubmit} className="space-y-2">
        <label className="app-text-muted mb-1 block text-[11px] font-medium uppercase tracking-[0.08em]">
          Model
        </label>
        <select
          value={model}
          onChange={(event) => setModel(event.target.value)}
          className="app-input h-9"
          disabled={disabled || isGenerating}
        >
          {GROK_IMAGE_MODELS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <label className="app-text-muted mb-1 block text-[11px] font-medium uppercase tracking-[0.08em]">
          Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Describe the cover image..."
          className="app-input min-h-24"
          disabled={disabled || isGenerating}
        />

        <div className="pt-1 flex justify-end">
          <button
            type="submit"
            disabled={disabled || isGenerating}
            className="app-neon-badge app-neon-fuchsia inline-flex items-center px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? "Generating..." : "Generate"}
          </button>
        </div>
      </form>

      <div className="mt-3 space-y-2">
        <h5 className="app-text-muted text-[11px] font-semibold uppercase tracking-[0.08em]">
          Generated Images
        </h5>

        {images.length === 0 ? (
          <p className="app-text-muted text-xs">No images for this newsletter.</p>
        ) : (
          <div className="max-h-136 grid grid-cols-2 gap-2 overflow-y-auto pr-1">
            {images.map((image) => {
              const isCoverImage = coverImage === image.blob_url;

              return (
                <div
                  key={image.id}
                  className={`rounded-md border p-2 ${
                    isCoverImage ? "border-accent" : "border-foreground/15"
                  }`}
                >
                  <img
                    src={image.blob_url}
                    alt={image.prompt ?? "Generated newsletter image"}
                    className="h-24 w-full rounded object-cover"
                  />
                  <p className="app-text-muted mt-1 text-[11px]">{formatMonthDay(image.created_at)}</p>
                  <p className="mt-1 text-[11px]">{truncateText(image.prompt, 70)}</p>
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={disabled || isCoverImage || settingCoverImageId === image.id}
                      onClick={async () => {
                        setSettingCoverImageId(image.id);

                        try {
                          await onSetCoverImage(image.id);
                        } finally {
                          setSettingCoverImageId(null);
                        }
                      }}
                      className={`app-neon-badge inline-flex items-center px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] transition disabled:cursor-not-allowed ${
                        isCoverImage
                          ? "app-cover-current-btn font-bold disabled:opacity-100"
                          : "app-neon-sky disabled:opacity-60"
                      }`}
                    >
                      {isCoverImage
                        ? "Current Cover"
                        : settingCoverImageId === image.id
                          ? "Saving..."
                          : "Set as Cover"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
