import { useEffect, useRef, useState } from "react";
import type { ArticleRow, SortKey } from "./types";

type CurateArticlesTableProps = {
  hasTargetNewsletter: boolean;
  actionError: string | null;
  isLoading: boolean;
  error: string | null;
  visibleArticles: ArticleRow[];
  categoryOptions: string[];
  updateArticleCategory: (articleId: number, nextCategory: string | null) => void;
  updatingCategoryArticleIds: number[];
  updateArticleDocument: (
    articleId: number,
    updates: {
      title_snippet: string | null;
      title: string | null;
      description: string | null;
      publisher: string | null;
      source: string | null;
    }
  ) => Promise<void>;
  updatingArticleDocumentIds: number[];
  focusFirstRowSignal: number;
  sortKey: SortKey;
  sortDirection: "asc" | "desc";
  applySort: (nextKey: SortKey) => void;
  addArticleToNewsletter: (articleId: number) => void;
  addingArticleIds: number[];
  isArticleInTargetNewsletter: (article: ArticleRow) => boolean;
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

function sortIndicator(sortKey: SortKey, activeSortKey: SortKey, sortDirection: "asc" | "desc") {
  if (sortKey !== activeSortKey) {
    return "↕";
  }

  return sortDirection === "asc" ? "↑" : "↓";
}

export default function CurateArticlesTable({
  hasTargetNewsletter,
  actionError,
  isLoading,
  error,
  visibleArticles,
  categoryOptions,
  updateArticleCategory,
  updatingCategoryArticleIds,
  updateArticleDocument,
  updatingArticleDocumentIds,
  focusFirstRowSignal,
  sortKey,
  sortDirection,
  applySort,
  addArticleToNewsletter,
  addingArticleIds,
  isArticleInTargetNewsletter,
}: CurateArticlesTableProps) {
  const rowRefs = useRef<Record<number, HTMLTableRowElement | null>>({});
  const [editingArticleId, setEditingArticleId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<{
    title_snippet: string;
    title: string;
    description: string;
    publisher: string;
    source: string;
  }>({ title_snippet: "", title: "", description: "", publisher: "", source: "" });

  useEffect(() => {
    if (focusFirstRowSignal < 1 || visibleArticles.length === 0) {
      return;
    }

    const firstId = visibleArticles[0]?.id;
    if (!firstId) {
      return;
    }

    rowRefs.current[firstId]?.focus();
  }, [focusFirstRowSignal, visibleArticles]);

  function startEditing(article: ArticleRow) {
    setEditingArticleId(article.id);
    setEditDraft({
      title_snippet: article.title_snippet ?? "",
      title: article.title ?? "",
      description: article.description ?? "",
      publisher: article.publisher ?? "",
      source: article.source ?? "",
    });
  }

  async function saveArticleEdits(articleId: number) {
    try {
      await updateArticleDocument(articleId, editDraft);
      setEditingArticleId(null);
    } catch {
      return;
    }
  }

  return (
    <div className="space-y-4">

      {actionError ? (
        <p className="app-text-danger rounded-lg border border-current/25 px-3 py-2 text-sm">
          {actionError}
        </p>
      ) : null}

      <div className="app-kpi overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-foreground/15 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/90">
              <tr>
                <th className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => applySort("created_at")} className="relative pr-3 transition hover:opacity-80">
                    Created
                    <span className="absolute right-0 top-1/2 -translate-y-1/2" aria-hidden>
                      {sortIndicator("created_at", sortKey, sortDirection)}
                    </span>
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => applySort("published_at")} className="relative pr-3 transition hover:opacity-80">
                    Published
                    <span className="absolute right-0 top-1/2 -translate-y-1/2" aria-hidden>
                      {sortIndicator("published_at", sortKey, sortDirection)}
                    </span>
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => applySort("source")} className="relative pr-3 transition hover:opacity-80">
                    Source
                    <span className="absolute right-0 top-1/2 -translate-y-1/2" aria-hidden>
                      {sortIndicator("source", sortKey, sortDirection)}
                    </span>
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => applySort("publisher")} className="relative pr-3 transition hover:opacity-80">
                    Publisher
                    <span className="absolute right-0 top-1/2 -translate-y-1/2" aria-hidden>
                      {sortIndicator("publisher", sortKey, sortDirection)}
                    </span>
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => applySort("category")} className="relative pr-3 transition hover:opacity-80">
                    Category
                    <span className="absolute right-0 top-1/2 -translate-y-1/2" aria-hidden>
                      {sortIndicator("category", sortKey, sortDirection)}
                    </span>
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Add</th>
                <th className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => applySort("title")} className="relative pr-3 transition hover:opacity-80">
                    Title
                    <span className="absolute right-0 top-1/2 -translate-y-1/2" aria-hidden>
                      {sortIndicator("title", sortKey, sortDirection)}
                    </span>
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold text-right">Edit</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center app-text-muted">
                    Loading articles...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center app-text-danger">
                    {error}
                  </td>
                </tr>
              ) : visibleArticles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center app-text-muted">
                    No articles found for the current filter.
                  </td>
                </tr>
              ) : (
                visibleArticles.map((article) => (
                  <tr
                    key={article.id}
                    ref={(node) => {
                      rowRefs.current[article.id] = node;
                    }}
                    tabIndex={-1}
                    className="border-t border-foreground/10 align-top transition hover:bg-foreground/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/25"
                  >
                    <td className="px-4 py-4 app-text-muted">
                      {formatMonthDay(article.created_at)}
                    </td>
                    <td className="px-4 py-4 app-text-muted">
                      {formatMonthDay(article.published_at)}
                    </td>
                    <td className="px-4 py-4 app-text-muted">{article.source ?? "—"}</td>
                    <td className="px-4 py-4 app-text-muted">{article.publisher ?? "—"}</td>
                    <td className="px-4 py-4">
                      <select
                        value={article.category ?? ""}
                        onChange={(event) =>
                          updateArticleCategory(
                            article.id,
                            event.target.value ? event.target.value : null
                          )
                        }
                        disabled={updatingCategoryArticleIds.includes(article.id)}
                        className="app-input h-8 min-w-32 text-xs disabled:opacity-60"
                        aria-label={`Set category for article ${article.id}`}
                      >
                        <option value="">—</option>
                        {categoryOptions.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => addArticleToNewsletter(article.id)}
                        disabled={
                          !hasTargetNewsletter ||
                          isArticleInTargetNewsletter(article) ||
                          addingArticleIds.includes(article.id)
                        }
                        className="app-btn-ghost px-2 py-1 text-xs font-medium disabled:opacity-60"
                      >
                        +
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      {editingArticleId === article.id ? (
                        <div className="space-y-2">
                          <input
                            value={editDraft.title_snippet}
                            onChange={(event) =>
                              setEditDraft((current) => ({ ...current, title_snippet: event.target.value }))
                            }
                            className="app-input h-8 text-xs"
                            placeholder="Headline"
                          />
                          <input
                            value={editDraft.title}
                            onChange={(event) =>
                              setEditDraft((current) => ({ ...current, title: event.target.value }))
                            }
                            className="app-input h-8 text-xs"
                            placeholder="Title"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              value={editDraft.publisher}
                              onChange={(event) =>
                                setEditDraft((current) => ({ ...current, publisher: event.target.value }))
                              }
                              className="app-input h-8 text-xs"
                              placeholder="Publisher"
                            />
                            <input
                              value={editDraft.source}
                              onChange={(event) =>
                                setEditDraft((current) => ({ ...current, source: event.target.value }))
                              }
                              className="app-input h-8 text-xs"
                              placeholder="Source"
                            />
                          </div>
                          <textarea
                            value={editDraft.description}
                            onChange={(event) =>
                              setEditDraft((current) => ({ ...current, description: event.target.value }))
                            }
                            className="app-input min-h-20 text-xs"
                            placeholder="Description"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => saveArticleEdits(article.id)}
                              disabled={updatingArticleDocumentIds.includes(article.id)}
                              className="app-btn-ghost px-2 py-1 text-xs font-medium disabled:opacity-60"
                            >
                              {updatingArticleDocumentIds.includes(article.id) ? "Saving..." : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingArticleId(null)}
                              disabled={updatingArticleDocumentIds.includes(article.id)}
                              className="app-btn-ghost px-2 py-1 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <p className="text-base font-semibold leading-tight">
                            {article.title_snippet ?? "—"}
                          </p>
                          <p className="text-sm font-medium app-text-muted">
                            {truncateText(article.title, 80) ?? "Untitled"}
                          </p>
                          <p className="text-sm app-text-muted leading-relaxed">
                            {truncateText(article.description, 150)}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          editingArticleId === article.id
                            ? setEditingArticleId(null)
                            : startEditing(article)
                        }
                        className="app-btn-ghost inline-flex h-7 w-7 items-center justify-center rounded-full p-0 text-xs font-medium"
                        aria-label={`Edit article ${article.id}`}
                      >
                        ✎
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}