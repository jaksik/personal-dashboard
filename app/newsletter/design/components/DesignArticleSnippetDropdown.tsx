"use client";

import { useMemo } from "react";
import type { DesignContextArticle } from "../actions";

type DesignArticleSnippetDropdownProps = {
  disabled: boolean;
  articles: DesignContextArticle[];
};

function getSnippetLabel(article: DesignContextArticle) {
  const snippet = article.title_snippet?.trim();
  if (snippet) {
    return snippet;
  }

  const title = article.title?.trim();
  if (title) {
    return title;
  }

  return "Untitled article";
}

export default function DesignArticleSnippetDropdown({
  disabled,
  articles,
}: DesignArticleSnippetDropdownProps) {
  const snippets = useMemo(
    () =>
      articles.map((article) => ({
        id: String(article.id),
        label: getSnippetLabel(article),
      })),
    [articles]
  );

  return (
    <div className="rounded-lg p-3">
      <div className="space-y-2">
        <label className="app-text-muted mb-1 block text-[11px] font-medium uppercase tracking-[0.08em]">
          Article title snippets
        </label>

        {snippets.length === 0 ? (
          <p className="app-text-muted text-xs">No title snippets found for this newsletter.</p>
        ) : (
          <ul
            className={`max-h-56 space-y-1 overflow-y-auto rounded-md border border-foreground/15 p-2 ${
              disabled ? "opacity-60" : ""
            }`}
            aria-label="Article title snippets"
          >
            {snippets.map((snippet) => (
              <li key={snippet.id} className="text-xs">
                {snippet.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
