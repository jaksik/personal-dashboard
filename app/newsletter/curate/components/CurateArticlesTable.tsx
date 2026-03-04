import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { ArticleRow } from "./types";

type CurateArticlesTableProps = {
  hasTargetNewsletter: boolean;
  actionError: string | null;
  isLoading: boolean;
  error: string | null;
  visibleArticles: ArticleRow[];
  categoryOptions: string[];
  categoryToneByName: Record<string, string>;
  categoryNeonColorByName: Record<string, string>;
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
  addArticleToNewsletter: (articleId: number) => void;
  addingArticleIds: number[];
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

export default function CurateArticlesTable({
  hasTargetNewsletter,
  actionError,
  isLoading,
  error,
  visibleArticles,
  categoryOptions,
  categoryToneByName,
  categoryNeonColorByName,
  updateArticleCategory,
  updatingCategoryArticleIds,
  updateArticleDocument,
  updatingArticleDocumentIds,
  focusFirstRowSignal,
  addArticleToNewsletter,
  addingArticleIds,
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
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center app-text-muted">
                    Loading articles...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center app-text-danger">
                    {error}
                  </td>
                </tr>
              ) : visibleArticles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center app-text-muted">
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
                    <td className="py-4 pl-2">
                      {(() => {
                        const isAssociated = article.newsletter_id !== null;

                        return (
                          <div className="flex flex-col items-center gap-1">
                            <button
                              type="button"
                              onClick={() => addArticleToNewsletter(article.id)}
                              disabled={
                                (!hasTargetNewsletter && article.newsletter_id === null) ||
                                addingArticleIds.includes(article.id)
                              }
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-xl font-medium disabled:opacity-60 ${
                                isAssociated ? "app-neon-badge" : "app-btn-ghost"
                              }`}
                              style={
                                isAssociated
                                  ? ({ "--neon-color": "#4ade80" } as CSSProperties)
                                  : undefined
                              }
                              aria-label={
                                isAssociated
                                  ? `Remove article ${article.id} from newsletter`
                                  : `Add article ${article.id} to newsletter`
                              }
                            >
                              {isAssociated ? "-" : "+"}
                            </button>
                          </div>
                        );
                      })()}
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
                          <p className="text-2xls font-semibold leading-tight">
                            {article.title_snippet ?? "—"}
                          </p>
                          <p className="text-sm font-medium">
                            {truncateText(article.title, 80) ?? "Untitled"}
                          </p>
                          <p className="text-xs font-semibold app-text-muted">{article.publisher ?? "—"}</p>
                          <p className="text-md app-text-muted leading-relaxed">
                            {truncateText(article.description, 150)}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex h-full min-h-20 flex-col items-end justify-between gap-2">
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
                        <div className="flex flex-col items-end gap-1.5">
                          <p className="text-2xs app-text-muted whitespace-nowrap">
                            {formatMonthDay(article.created_at)}
                          </p>
                          <p className="max-w-32 truncate text-right text-xs app-text-muted">
                            {article.source ?? "—"}
                          </p>
                          <select
                            value={article.category?.trim() ?? ""}
                            onChange={(event) =>
                              updateArticleCategory(
                                article.id,
                                event.target.value ? event.target.value : null
                              )
                            }
                            disabled={updatingCategoryArticleIds.includes(article.id)}
                            className={`app-input app-input-neon h-8 min-w-32 text-xs disabled:opacity-60 ${
                              categoryToneByName[article.category?.trim() || "Uncategorized"] ?? ""
                            }`}
                            style={{
                              "--neon-color":
                                categoryNeonColorByName[article.category?.trim() || "Uncategorized"] ??
                                "#9ca3af",
                            } as CSSProperties}
                            aria-label={`Set category for article ${article.id}`}
                          >
                            <option value="">—</option>
                            {categoryOptions.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
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