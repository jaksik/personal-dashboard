import type { CurateTab } from "./types";

type CurateFiltersProps = {
  activeTab: CurateTab;
  articleSearch: string;
  onArticleSearchChange: (value: string) => void;
  articleCategory: string;
  onArticleCategoryChange: (value: string) => void;
  categories: string[];
  sortDirection: "asc" | "desc";
  onToggleSortDirection: () => void;
  jobSearch: string;
  onJobSearchChange: (value: string) => void;
  jobRemoteFilter: string;
  onJobRemoteFilterChange: (value: string) => void;
};

export default function CurateFilters({
  activeTab,
  articleSearch,
  onArticleSearchChange,
  articleCategory,
  onArticleCategoryChange,
  categories,
  sortDirection,
  onToggleSortDirection,
  jobSearch,
  onJobSearchChange,
  jobRemoteFilter,
  onJobRemoteFilterChange,
}: CurateFiltersProps) {
  if (activeTab === "articles") {
    return (
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-12 md:gap-3">
        <div className="md:col-span-6">
          <label className="app-text-muted mb-1 block text-xs font-medium uppercase tracking-[0.08em]">
            Search
          </label>
          <input
            value={articleSearch}
            onChange={(event) => onArticleSearchChange(event.target.value)}
            className="app-input h-9 md:h-10"
            placeholder="Search articles"
            aria-label="Search articles"
          />
        </div>
        <div className="md:col-span-4">
          <label className="app-text-muted mb-1 block text-xs font-medium uppercase tracking-[0.08em]">
            Category
          </label>
          <select
            value={articleCategory}
            onChange={(event) => onArticleCategoryChange(event.target.value)}
            className="app-input h-9 md:h-10"
            aria-label="Filter article category"
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
          <label className="app-text-muted mb-1 block text-xs font-medium uppercase tracking-[0.08em]">
            Order
          </label>
          <button
            type="button"
            onClick={onToggleSortDirection}
            className="app-btn-ghost h-9 w-full px-3 text-sm md:h-10"
          >
            {sortDirection === "asc" ? "Ascending" : "Descending"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-2.5 md:grid-cols-12 md:gap-3">
      <div className="md:col-span-8">
        <label className="app-text-muted mb-1 block text-xs font-medium uppercase tracking-[0.08em]">
          Search
        </label>
        <input
          value={jobSearch}
          onChange={(event) => onJobSearchChange(event.target.value)}
          className="app-input h-9 md:h-10"
          placeholder="Search jobs"
          aria-label="Search jobs"
        />
      </div>
      <div className="md:col-span-4">
        <label className="app-text-muted mb-1 block text-xs font-medium uppercase tracking-[0.08em]">
          Location Type
        </label>
        <select
          value={jobRemoteFilter}
          onChange={(event) => onJobRemoteFilterChange(event.target.value)}
          className="app-input h-9 md:h-10"
          aria-label="Filter jobs by remote"
        >
          <option value="all">All jobs</option>
          <option value="remote">Remote only</option>
          <option value="onsite">On-site only</option>
        </select>
      </div>
    </div>
  );
}