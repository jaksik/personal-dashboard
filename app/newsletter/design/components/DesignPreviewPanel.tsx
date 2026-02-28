"use client";

import { useMemo } from "react";
import Image from "next/image";
import type { DesignContextArticle } from "../actions";

type DesignPreviewPanelProps = {
  title: string | null;
  subTitle: string | null;
  coverImage: string | null;
  articles: DesignContextArticle[];
};

export default function DesignPreviewPanel({
  title,
  subTitle,
  coverImage,
  articles,
}: DesignPreviewPanelProps) {
  const groupedArticles = useMemo(() => {
    const grouped = new Map<string, DesignContextArticle[]>();

    for (const article of articles) {
      const category = article.category?.trim() || "Uncategorized";
      const current = grouped.get(category) ?? [];
      current.push(article);
      grouped.set(category, current);
    }

    return Array.from(grouped.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([category, items]) => ({ category, items }));
  }, [articles]);

  return (
    <div className="space-y-3 rounded-xl border border-foreground/15 bg-foreground/2 p-3">
      <div className="rounded-md bg-foreground/10 px-3 py-2">
        <p className="text-lg font-semibold">{title ?? "Newsletter Title"}</p>
        <p className="app-text-muted text-base">{subTitle ?? "Newsletter subtitle"}</p>
      </div>

      {coverImage ? (
        <Image
          src={coverImage}
          alt="Newsletter cover preview"
          width={1200}
          height={560}
          className="h-70 w-full rounded-md object-cover"
        />
      ) : (
        <div className="h-28 rounded-md border border-dashed border-foreground/25" />
      )}

      <div className="space-y-2 rounded-md border border-foreground/15 p-3">
        {groupedArticles.length === 0 ? (
          <p className="app-text-muted text-sm">No associated articles yet.</p>
        ) : (
          <div className="space-y-3">
            {groupedArticles.map((group) => (
              <div key={group.category} className="space-y-1">
                <p className="app-text-muted text-center text-base font-semibold tracking-wide">
                  {group.category}
                </p>
                <ul className="space-y-1">
                  {group.items.map((article) => (
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
  );
}
