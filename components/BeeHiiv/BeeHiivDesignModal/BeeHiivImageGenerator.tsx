"use client";

import { useEffect, useState } from "react";

type NewsletterSummary = {
  id: number;
  title: string | null;
  cover_image: string | null;
  created_at?: string;
};

type NewsletterImage = {
  id: number;
  blob_url: string;
  prompt: string | null;
  provider: string | null;
  model: string | null;
  created_at: string;
  newsletter_id: number | null;
};

type BeeHiivImageGeneratorProps = {
  isVisible: boolean;
  selectedNewsletterId: number | null;
  onCoverImageChange?: (coverImageUrl: string | null) => void;
};

const GROK_IMAGE_MODELS = [
  { value: "grok-imagine-image", label: "Grok Image 1 ($.02)" },
  { value: "grok-imagine-image-pro", label: "Grok Pro Image ($.07)" },
  { value: "grok-2-image-1212", label: "Grok Image 2 ($.07)" },
];

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

export default function BeeHiivImageGenerator({
  isVisible,
  selectedNewsletterId,
  onCoverImageChange,
}: BeeHiivImageGeneratorProps) {
  const [isLoadingContext, setIsLoadingContext] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSettingCoverImageId, setIsSettingCoverImageId] = useState<number | null>(null);

  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(GROK_IMAGE_MODELS[0].value);
  const [newsletter, setNewsletter] = useState<NewsletterSummary | null>(null);
  const [images, setImages] = useState<NewsletterImage[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    async function loadContext() {
      setIsLoadingContext(true);
      setError(null);
      setActionMessage(null);

      const searchParams = new URLSearchParams();

      if (selectedNewsletterId != null) {
        searchParams.set("newsletterId", String(selectedNewsletterId));
      }

      const response = await fetch(`/api/beehiiv/design/context?${searchParams.toString()}`, {
        method: "GET",
      });

      const payload = (await response.json()) as {
        error?: string;
        newsletter?: NewsletterSummary | null;
        images?: NewsletterImage[];
      };

      if (!response.ok) {
        setError(payload.error ?? "Failed to load design context.");
        setIsLoadingContext(false);
        return;
      }

      setNewsletter(payload.newsletter ?? null);
      onCoverImageChange?.(payload.newsletter?.cover_image ?? null);
      setImages(payload.images ?? []);
      setIsLoadingContext(false);
    }

    loadContext();
  }, [isVisible, selectedNewsletterId, onCoverImageChange]);

  async function handleGenerateImage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newsletter) {
      setError("No newsletter found in the last 12 hours.");
      return;
    }

    const trimmedPrompt = prompt.trim();

    if (trimmedPrompt.length < 5) {
      setError("Prompt must be at least 5 characters.");
      return;
    }

    setError(null);
    setActionMessage(null);
    setIsGenerating(true);

    const response = await fetch("/api/beehiiv/design/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: trimmedPrompt,
        newsletterId: newsletter.id,
        model: selectedModel,
      }),
    });

    const payload = (await response.json()) as {
      error?: string;
      image?: NewsletterImage;
    };

    setIsGenerating(false);

    if (!response.ok || !payload.image) {
      setError(payload.error ?? "Failed to generate image.");
      return;
    }

    setImages((current) => [payload.image as NewsletterImage, ...current]);
    setPrompt("");
    setActionMessage("Image generated and saved.");
  }

  async function handleSetCoverImage(image: NewsletterImage) {
    if (!newsletter) {
      return;
    }

    setError(null);
    setActionMessage(null);
    setIsSettingCoverImageId(image.id);

    const response = await fetch("/api/beehiiv/design/cover-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        newsletterId: newsletter.id,
        imageId: image.id,
      }),
    });

    const payload = (await response.json()) as {
      error?: string;
      coverImage?: string;
    };

    setIsSettingCoverImageId(null);

    if (!response.ok || !payload.coverImage) {
      setError(payload.error ?? "Failed to set cover image.");
      return;
    }

    setNewsletter((current) =>
      current
        ? {
            ...current,
            cover_image: payload.coverImage ?? null,
          }
        : current
    );
    onCoverImageChange?.(payload.coverImage ?? null);
    setActionMessage("Cover image updated.");
  }

  return (
    <div className="app-kpi p-4">
      <h4 className="text-sm font-semibold">Cover Image Generator</h4>
      <p className="app-text-muted mt-2 text-xs">
        Newsletter: {newsletter?.title ?? "None in last 12 hours"}
      </p>

      <form onSubmit={handleGenerateImage} className="mt-3 space-y-2">
        <select
          value={selectedModel}
          onChange={(event) => setSelectedModel(event.target.value)}
          className="app-input"
          disabled={!newsletter || isGenerating || isLoadingContext}
        >
          {GROK_IMAGE_MODELS.map((model) => (
            <option key={model.value} value={model.value}>
              {model.label}
            </option>
          ))}
        </select>

        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Describe the cover image..."
          className="app-input min-h-24"
          disabled={!newsletter || isGenerating || isLoadingContext}
        />
        <button
          type="submit"
          disabled={!newsletter || isGenerating || isLoadingContext}
          className="app-btn w-full px-3 py-2 text-xs font-medium disabled:opacity-60"
        >
          {isGenerating ? "Generating..." : "Generate"}
        </button>
      </form>

      {error ? <p className="app-text-danger mt-2 text-xs">{error}</p> : null}
      {actionMessage ? <p className="app-text-muted mt-2 text-xs">{actionMessage}</p> : null}

      <div className="mt-3 space-y-2">
        <h5 className="text-xs font-semibold">Generated Images</h5>

        {isLoadingContext ? (
          <p className="app-text-muted text-xs">Loading images...</p>
        ) : images.length === 0 ? (
          <p className="app-text-muted text-xs">No images for this newsletter.</p>
        ) : (
          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {images.map((image) => {
              const isCoverImage = newsletter?.cover_image === image.blob_url;

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
                  <p className="app-text-muted mt-1 text-[11px]">
                    {formatMonthDay(image.created_at)}
                  </p>
                  <p className="mt-1 text-[11px]">{truncateText(image.prompt, 70)}</p>
                  <button
                    type="button"
                    disabled={
                      isCoverImage ||
                      !newsletter ||
                      isSettingCoverImageId === image.id
                    }
                    onClick={() => handleSetCoverImage(image)}
                    className={`mt-2 w-full px-2 py-1 text-[11px] font-medium disabled:opacity-60 ${
                      isCoverImage ? "app-btn" : "app-btn-ghost"
                    }`}
                  >
                    {isCoverImage
                      ? "Current Cover"
                      : isSettingCoverImageId === image.id
                        ? "Saving..."
                        : "Set as Cover"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
