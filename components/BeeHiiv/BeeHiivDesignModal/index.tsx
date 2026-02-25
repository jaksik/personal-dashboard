"use client";

import { useEffect, useMemo, useState } from "react";
import ModalShell from "@/components/ui/ModalShell";
import BeeHiivImageGenerator from "./BeeHiivImageGenerator";
import BeeHiivNewsletterMetaForm from "./BeeHiivNewsletterMetaForm";

type DesignContextNewsletter = {
  id: number;
  title: string | null;
  sub_title: string | null;
  cover_image: string | null;
  created_at: string;
};

type DesignContextArticle = {
  id: number;
  title: string | null;
  title_snippet: string | null;
  category: string | null;
  created_at: string;
};

export default function BeeHiivDesignModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [previewCoverImage, setPreviewCoverImage] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string | null>(null);
  const [previewSubTitle, setPreviewSubTitle] = useState<string | null>(null);
  const [previewArticles, setPreviewArticles] = useState<DesignContextArticle[]>([]);
  const [isNewsletterDetailsOpen, setIsNewsletterDetailsOpen] = useState(false);
  const [isImageGeneratorOpen, setIsImageGeneratorOpen] = useState(false);

  const previewArticleGroups = useMemo(() => {
    const grouped = new Map<string, DesignContextArticle[]>();

    for (const article of previewArticles) {
      const category = article.category?.trim() || "Uncategorized";
      const current = grouped.get(category) ?? [];
      current.push(article);
      grouped.set(category, current);
    }

    return Array.from(grouped.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([category, articles]) => ({ category, articles }));
  }, [previewArticles]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    async function loadPreviewContext() {
      const response = await fetch("/api/beehiiv/design/context", {
        method: "GET",
      });

      const payload = (await response.json()) as {
        newsletter?: DesignContextNewsletter | null;
        articles?: DesignContextArticle[];
      };

      const newsletter = payload.newsletter ?? null;
      setPreviewCoverImage(newsletter?.cover_image ?? null);
      setPreviewTitle(newsletter?.title ?? null);
      setPreviewSubTitle(newsletter?.sub_title ?? null);
      setPreviewArticles(payload.articles ?? []);
    }

    loadPreviewContext();
  }, [isOpen]);

  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="app-btn px-3 py-2 text-xs font-medium"
        >
          Open Design Modal
        </button>
      </div>

      <ModalShell
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setPreviewCoverImage(null);
          setPreviewTitle(null);
          setPreviewSubTitle(null);
          setPreviewArticles([]);
        }}
        title="Newsletter Design Builder"
        description="Use side panels to configure and generate newsletter assets."
        maxWidthClassName="max-w-[90vw]"
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <section className="space-y-4 lg:col-span-3">
            <div className="app-kpi p-2">
              <button
                type="button"
                onClick={() => setIsNewsletterDetailsOpen((current) => !current)}
                className="app-btn-ghost flex w-full items-center justify-between px-3 py-2 text-xs font-medium"
              >
                <span>Newsletter Details</span>
                <span>{isNewsletterDetailsOpen ? "Hide" : "Show"}</span>
              </button>

              {isNewsletterDetailsOpen ? (
                <div className="mt-2">
                  <BeeHiivNewsletterMetaForm
                    isVisible={isOpen}
                    onMetaChange={(next) => {
                      setPreviewTitle(next.title);
                      setPreviewSubTitle(next.sub_title);
                    }}
                  />
                </div>
              ) : null}
            </div>

            <div className="app-kpi p-2">
              <button
                type="button"
                onClick={() => setIsImageGeneratorOpen((current) => !current)}
                className="app-btn-ghost flex w-full items-center justify-between px-3 py-2 text-xs font-medium"
              >
                <span>Image Generator</span>
                <span>{isImageGeneratorOpen ? "Hide" : "Show"}</span>
              </button>

              {isImageGeneratorOpen ? (
                <div className="mt-2">
                  <BeeHiivImageGenerator
                    isVisible={isOpen}
                    onCoverImageChange={setPreviewCoverImage}
                  />
                </div>
              ) : null}
            </div>

          </section>

          <section className="space-y-4 lg:col-span-6">
              <div className="space-y-3 rounded-lg border border-foreground/15 p-4">
                <div className="rounded-md bg-foreground/10 px-3 py-2">
                  <p className="text-xl font-semibold">{previewTitle ?? "Newsletter Title"}</p>
                  <p className="app-text-muted text-lg">
                    {previewSubTitle ?? "Newsletter subtitle"}
                  </p>
                </div>
                {previewCoverImage ? (
                  <img
                    src={previewCoverImage}
                    alt="Newsletter cover preview"
                    className="h-70 w-full rounded-md object-cover"
                  />
                ) : (
                  <div className="h-28 rounded-md border border-dashed border-foreground/25" />
                )}
                <div className="space-y-2 rounded-md border border-foreground/15 p-3">
                  {previewArticleGroups.length === 0 ? (
                    <p className="app-text-muted text-sm">No associated articles yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {previewArticleGroups.map((group) => (
                        <div key={group.category} className="space-y-1">
                          <p className="app-text-muted text-2xl text-center font-semibold tracking-wide">
                            {group.category}
                          </p>
                          <ul className="space-y-1">
                            {group.articles.map((article) => (
                              <li key={article.id} className="text-md">
                                {article.title_snippet ?? article.title ?? "Untitled article"}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
          </section>

          <section className="space-y-4 lg:col-span-3">
            <div className="app-kpi p-4">
              <h4 className="text-sm font-semibold">Actions</h4>
              <div className="mt-3 space-y-2">
                <button type="button" className="app-btn w-full px-3 py-2 text-xs">
                  Save Draft
                </button>
                <button type="button" className="app-btn-ghost w-full px-3 py-2 text-xs">
                  Preview Email
                </button>
              </div>
            </div>
          </section>
        </div>
      </ModalShell>
    </>
  );
}