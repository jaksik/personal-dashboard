import type { ArticleRow, SortKey } from "./types";

type CurateArticlesTableProps = {
  targetNewsletterTitle: string | null;
  hasTargetNewsletter: boolean;
  selectedArticleIds: number[];
  addSelectedArticlesToNewsletter: () => void;
  actionError: string | null;
  isLoading: boolean;
  error: string | null;
  visibleArticles: ArticleRow[];
  applySort: (nextKey: SortKey) => void;
  isArticleSelected: (articleId: number) => boolean;
  toggleArticleSelection: (articleId: number) => void;
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

export default function CurateArticlesTable({
  targetNewsletterTitle,
  hasTargetNewsletter,
  selectedArticleIds,
  addSelectedArticlesToNewsletter,
  actionError,
  isLoading,
  error,
  visibleArticles,
  applySort,
  isArticleSelected,
  toggleArticleSelection,
  addArticleToNewsletter,
  addingArticleIds,
  isArticleInTargetNewsletter,
}: CurateArticlesTableProps) {
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
                  <button type="button" onClick={() => applySort("created_at")} className="transition hover:opacity-80">
                    Created
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => applySort("source")} className="transition hover:opacity-80">
                    Source
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => applySort("publisher")} className="transition hover:opacity-80">
                    Publisher
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => applySort("category")} className="transition hover:opacity-80">
                    Category
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Add</th>
                <th className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => applySort("title")} className="transition hover:opacity-80">
                    Title
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center app-text-muted">
                    Loading articles...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center app-text-danger">
                    {error}
                  </td>
                </tr>
              ) : visibleArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center app-text-muted">
                    No articles found for the current filter.
                  </td>
                </tr>
              ) : (
                visibleArticles.map((article) => (
                  <tr key={article.id} className="border-t border-foreground/10 align-top transition hover:bg-foreground/2">
                    <td className="px-4 py-4 app-text-muted">
                      {formatMonthDay(article.created_at)}
                    </td>
                    <td className="px-4 py-4 app-text-muted">{article.source ?? "—"}</td>
                    <td className="px-4 py-4 app-text-muted">{article.publisher ?? "—"}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-md border border-foreground/15 bg-foreground/3 px-2 py-1 text-xs app-text-muted">
                        {article.category ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isArticleSelected(article.id)}
                          onChange={() => toggleArticleSelection(article.id)}
                          disabled={isArticleInTargetNewsletter(article)}
                        />
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
                          {isArticleInTargetNewsletter(article)
                            ? "Added"
                            : addingArticleIds.includes(article.id)
                              ? "Adding..."
                              : "Add"}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
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