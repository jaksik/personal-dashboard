"use client";

import { useEffect, useMemo, useState } from "react";
import useSelectedNewsletterId from "@/components/newsletter/useSelectedNewsletterId";
import {
  generateNewsletterImageAction,
  getDesignWorkspaceDataAction,
  setNewsletterCoverImageAction,
  updateNewsletterMetaAction,
  type DesignContextArticle,
  type DesignContextNewsletter,
  type NewsletterImage,
} from "../actions";
import DesignImageGenerator from "./DesignImageGenerator";
import DesignArticleSnippetDropdown from "@/app/newsletter/design/components/DesignArticleSnippetDropdown";
import DesignMetaForm from "./DesignMetaForm";
import DesignPreviewPanel from "./DesignPreviewPanel";

export default function DesignWorkspace() {
  const { selectedNewsletterId } = useSelectedNewsletterId();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [newsletter, setNewsletter] = useState<DesignContextNewsletter | null>(null);
  const [articles, setArticles] = useState<DesignContextArticle[]>([]);
  const [images, setImages] = useState<NewsletterImage[]>([]);

  const [title, setTitle] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [isMetaPanelOpen, setIsMetaPanelOpen] = useState(false);
  const [isImagePanelOpen, setIsImagePanelOpen] = useState(false);
  const [isSnippetPanelOpen, setIsSnippetPanelOpen] = useState(false);

  useEffect(() => {
    async function loadWorkspaceData() {
      setIsLoading(true);
      setError(null);
      setMessage(null);

      try {
        const payload = await getDesignWorkspaceDataAction(selectedNewsletterId);
        setNewsletter(payload.newsletter);
        setArticles(payload.articles);
        setImages(payload.images);
        setTitle(payload.newsletter?.title ?? "");
        setSubTitle(payload.newsletter?.sub_title ?? "");
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Failed to load design workspace.");
      } finally {
        setIsLoading(false);
      }
    }

    loadWorkspaceData();
  }, [selectedNewsletterId]);

  const isNewsletterMissing = useMemo(() => newsletter == null, [newsletter]);

  async function handleSaveMeta() {
    if (!newsletter) {
      setError("No newsletter found in the last 12 hours.");
      return false;
    }

    setError(null);
    setMessage(null);

    try {
      const updatedNewsletter = await updateNewsletterMetaAction({
        newsletterId: newsletter.id,
        title,
        subTitle,
      });

      setNewsletter(updatedNewsletter);
      setTitle(updatedNewsletter.title ?? "");
      setSubTitle(updatedNewsletter.sub_title ?? "");
      setMessage("Newsletter title and subtitle updated.");
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to update newsletter details.");
      return false;
    }
  }

  async function handleGenerateImage(input: { prompt: string; model: string }) {
    if (!newsletter) {
      setError("No newsletter found in the last 12 hours.");
      return false;
    }

    setError(null);
    setMessage(null);

    try {
      const image = await generateNewsletterImageAction({
        newsletterId: newsletter.id,
        prompt: input.prompt,
        model: input.model,
      });

      setImages((current) => [image, ...current]);
      setMessage("Image generated and saved.");
      return true;
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : "Failed to generate image.");
      return false;
    }
  }

  async function handleSetCoverImage(imageId: number) {
    if (!newsletter) {
      setError("No newsletter found in the last 12 hours.");
      return;
    }

    setError(null);
    setMessage(null);

    try {
      const coverImage = await setNewsletterCoverImageAction({
        newsletterId: newsletter.id,
        imageId,
      });

      setNewsletter((current) =>
        current
          ? {
              ...current,
              cover_image: coverImage,
            }
          : current
      );
      setMessage("Cover image updated.");
    } catch (coverImageError) {
      setError(coverImageError instanceof Error ? coverImageError.message : "Failed to update cover image.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl border-t border-foreground/15 py-6">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        <section className="space-y-4 lg:col-span-6">
          <div className="rounded-xl border border-foreground/15 bg-foreground/3 p-2">
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => setIsMetaPanelOpen((current) => !current)}
                className="app-neon-badge app-neon-cyan inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] transition"
              >
                <span>Newsletter Details</span>
                <span
                  className="app-neon-pill px-2 py-0.5 text-[12px] font-bold leading-none"
                  aria-label={isMetaPanelOpen ? "Collapse" : "Expand"}
                >
                  {isMetaPanelOpen ? "▲" : "▼"}
                </span>
              </button>
            </div>

            {isMetaPanelOpen ? (
              <div className="mt-2">
                <DesignMetaForm
                  disabled={isLoading || isNewsletterMissing}
                  title={title}
                  subTitle={subTitle}
                  onTitleChange={setTitle}
                  onSubTitleChange={setSubTitle}
                  onSave={handleSaveMeta}
                />
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border border-foreground/15 bg-foreground/3 p-2">
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => setIsImagePanelOpen((current) => !current)}
                className="app-neon-badge app-neon-fuchsia inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] transition"
              >
                <span>Image Generator</span>
                <span
                  className="app-neon-pill px-2 py-0.5 text-[12px] font-bold leading-none"
                  aria-label={isImagePanelOpen ? "Collapse" : "Expand"}
                >
                  {isImagePanelOpen ? "▲" : "▼"}
                </span>
              </button>
            </div>

            {isImagePanelOpen ? (
              <div className="mt-2">
                <DesignImageGenerator
                  disabled={isLoading || isNewsletterMissing}
                  images={images}
                  coverImage={newsletter?.cover_image ?? null}
                  onGenerate={handleGenerateImage}
                  onSetCoverImage={handleSetCoverImage}
                />
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border border-foreground/15 bg-foreground/3 p-2">
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => setIsSnippetPanelOpen((current) => !current)}
                className="app-neon-badge app-neon-sky inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] transition"
              >
                <span>Article Snippets</span>
                <span
                  className="app-neon-pill px-2 py-0.5 text-[12px] font-bold leading-none"
                  aria-label={isSnippetPanelOpen ? "Collapse" : "Expand"}
                >
                  {isSnippetPanelOpen ? "▲" : "▼"}
                </span>
              </button>
            </div>

            {isSnippetPanelOpen ? (
              <div className="mt-2">
                <DesignArticleSnippetDropdown
                  disabled={isLoading || isNewsletterMissing}
                  articles={articles}
                />
              </div>
            ) : null}
          </div>

          {isLoading ? <p className="app-text-muted px-1 text-xs">Loading design workspace...</p> : null}
          {!isLoading && isNewsletterMissing ? (
            <p className="app-text-muted px-1 text-xs">Select a newsletter to load design context.</p>
          ) : null}
          {error ? <p className="app-text-danger px-1 text-xs">{error}</p> : null}
          {message ? <p className="app-text-muted px-1 text-xs">{message}</p> : null}
        </section>

        <section className="lg:col-span-6">
          <DesignPreviewPanel
            title={newsletter?.title ?? null}
            subTitle={newsletter?.sub_title ?? null}
            coverImage={newsletter?.cover_image ?? null}
            articles={articles}
          />
        </section>
      </div>
    </div>
  );
}
