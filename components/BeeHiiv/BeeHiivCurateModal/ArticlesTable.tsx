import { formatMonthDay, truncateText } from "./helpers";
import type { ArticleRow, SortKey } from "./types";

type ArticlesTableProps = {
  targetNewsletterTitle: string | null;
  hasTargetNewsletter: boolean;
  selectedArticleIds: number[];
  addSelectedArticlesToNewsletter: () => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  categories: string[];
  sortDirection: "asc" | "desc";
  setSortDirection: (direction: "asc" | "desc") => void;
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

export default function ArticlesTable({
  targetNewsletterTitle,
  hasTargetNewsletter,
  selectedArticleIds,
  addSelectedArticlesToNewsletter,
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  categories,
  sortDirection,
  setSortDirection,
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
}: ArticlesTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="app-text-muted text-sm">
          Target newsletter: {targetNewsletterTitle ?? "None in last 12 hours"}
        </p>
        <button
          type="button"
          onClick={addSelectedArticlesToNewsletter}
          disabled={selectedArticleIds.length === 0 || !hasTargetNewsletter}
          className="app-btn px-3 py-2 text-xs font-medium disabled:opacity-60"
        >
          Add Selected ({selectedArticleIds.length})
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
        <div className="md:col-span-7">
          <input
            type="text"
            placeholder="Filter by title, publisher, or category"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="app-input"
          />
        </div>

        <div className="md:col-span-3">
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="app-input"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <button
            type="button"
            onClick={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
            className="app-btn-ghost w-full px-3 py-2 text-sm"
          >
            Sort: {sortDirection === "asc" ? "Asc" : "Desc"}
          </button>
        </div>
      </div>

      {actionError ? <p className="app-text-danger text-sm">{actionError}</p> : null}

      <div className="app-kpi overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-foreground/15 bg-foreground/5">
              <tr>
                <th className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => applySort("created_at")}>
                    Created
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => applySort("publisher")}>
                    Publisher
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => applySort("category")}>
                    Category
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Add</th>
                <th className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => applySort("title")}>
                    Title
                  </button>
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center app-text-muted">
                    Loading articles...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center app-text-danger">
                    {error}
                  </td>
                </tr>
              ) : visibleArticles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center app-text-muted">
                    No articles found for the current filter.
                  </td>
                </tr>
              ) : (
                visibleArticles.map((article) => (
                  <tr key={article.id} className="border-t border-foreground/10">
                    <td className="px-4 py-3 app-text-muted">
                      {formatMonthDay(article.created_at)}
                    </td>
                    <td className="px-4 py-3 app-text-muted">{article.source ?? "—"}</td>
                    <td className="px-4 py-3 app-text-muted">{article.publisher ?? "—"}</td>
                    <td className="px-4 py-3 app-text-muted">{article.category ?? "—"}</td>
                    <td className="px-4 py-3">
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
                          className="app-btn-ghost px-2 py-1 text-xs disabled:opacity-60"
                        >
                          {isArticleInTargetNewsletter(article)
                            ? "Added"
                            : addingArticleIds.includes(article.id)
                              ? "Adding..."
                              : "Add"}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <p className="text-lg font-medium app-text-muted">
                          {article.title_snippet ?? "—"}
                        </p>
                        <p className="font-medium">{article.title ?? "Untitled"}</p>
                        <p className="text-sm app-text-muted">
                          {truncateText(article.description, 300)}
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
