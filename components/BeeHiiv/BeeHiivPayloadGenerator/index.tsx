"use client";

import {
  buildBeehiivHtmlPayload,
  buildBeehiivPlainTextPayload,
  groupArticlesByCategory,
} from "./formatters";
import PayloadCopyActions from "./PayloadCopyActions";
import { usePayloadContext } from "./usePayloadContext";

export default function BeeHiivPayloadGenerator() {
  const { isLoading, error, newsletter, articles } = usePayloadContext();

  if (isLoading) {
    return (
      <div className="app-panel p-4">
        <p className="app-text-muted text-sm">Loading newsletter payload...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-panel p-4">
        <p className="app-text-danger text-sm">{error}</p>
      </div>
    );
  }

  if (!newsletter) {
    return (
      <div className="app-panel p-4">
        <p className="app-text-muted text-sm">
          No newsletter found in the last 12 hours.
        </p>
      </div>
    );
  }

  const articleGroups = groupArticlesByCategory(articles);
  const htmlPayload = buildBeehiivHtmlPayload(newsletter, articleGroups);
  const plainTextPayload = buildBeehiivPlainTextPayload(newsletter, articleGroups);

  return (
    <div className="space-y-4">
      <div className="app-panel overflow-hidden">
        <div className="border-b border-foreground/15 px-4 py-3">
          <p className="text-xs uppercase tracking-wide app-text-muted">
            Beehiiv Payload Generator
          </p>
          <h4 className="mt-1 text-base font-semibold">
            {newsletter.title ?? "Newsletter Title"}
          </h4>
        </div>

        <div className="space-y-4 p-4">
          <PayloadCopyActions
            htmlPayload={htmlPayload}
            plainTextPayload={plainTextPayload}
          />

          <div className="rounded-lg border border-foreground/15 bg-background p-4">
            <p className="text-xs app-text-muted">Preview by Category</p>

            {articleGroups.length === 0 ? (
              <p className="app-text-muted mt-3 text-sm">No associated articles.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {articleGroups.map((group) => (
                  <div key={group.category} className="space-y-1">
                    <p className="app-text-muted text-xs font-semibold uppercase tracking-wide">
                      {group.category}
                    </p>
                    <ul className="space-y-1">
                      {group.articles.map((article) => (
                        <li key={article.id} className="text-sm">
                          {article.title_snippet ?? article.title ?? "Untitled article"}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-foreground/15 bg-background p-4">
            <p className="text-xs app-text-muted">HTML Payload</p>
            <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap wrap-break-word text-xs app-text-muted">
              {htmlPayload}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
