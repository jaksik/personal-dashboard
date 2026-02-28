import type { ArticleNewsletterFilter, CurateTab, JobSortKey, SortKey } from "./types";

type CurateFiltersProps = {
  activeTab: CurateTab;
  articleSearch: string;
  onArticleSearchChange: (value: string) => void;
  onArticleSearchSubmit: () => void;
  articleCategory: string;
  onArticleCategoryChange: (value: string) => void;
  categoryToneByName: Record<string, string>;
  categories: string[];
  articlePublisher: string;
  onArticlePublisherChange: (value: string) => void;
  publishers: string[];
  articleSource: string;
  onArticleSourceChange: (value: string) => void;
  sources: string[];
  articleNewsletterFilter: ArticleNewsletterFilter;
  onArticleNewsletterFilterChange: (value: ArticleNewsletterFilter) => void;
  articleCreatedDaysBack: string;
  onArticleCreatedDaysBackChange: (value: string) => void;
  articlePublishedDaysBack: string;
  onArticlePublishedDaysBackChange: (value: string) => void;
  articleSortKey: SortKey;
  onArticleSortKeyChange: (value: SortKey) => void;
  sortDirection: "asc" | "desc";
  onToggleSortDirection: () => void;
  onResetArticleFilters: () => void;
  jobSearch: string;
  onJobSearchChange: (value: string) => void;
  onJobSearchSubmit: () => void;
  jobCompany: string;
  onJobCompanyChange: (value: string) => void;
  jobCompanies: string[];
  jobLocation: string;
  onJobLocationChange: (value: string) => void;
  jobLocations: string[];
  jobRemoteFilter: string;
  onJobRemoteFilterChange: (value: string) => void;
  jobNewsletterFilter: ArticleNewsletterFilter;
  onJobNewsletterFilterChange: (value: ArticleNewsletterFilter) => void;
  jobDateFrom: string;
  onJobDateFromChange: (value: string) => void;
  jobDateTo: string;
  onJobDateToChange: (value: string) => void;
  jobSortKey: JobSortKey;
  onJobSortKeyChange: (value: JobSortKey) => void;
  jobSortDirection: "asc" | "desc";
  onToggleJobSortDirection: () => void;
  onResetJobFilters: () => void;
};

export default function CurateFilters({
  activeTab,
  articleSearch,
  onArticleSearchChange,
  onArticleSearchSubmit,
  articleCategory,
  onArticleCategoryChange,
  categoryToneByName,
  categories,
  articlePublisher,
  onArticlePublisherChange,
  publishers,
  articleSource,
  onArticleSourceChange,
  sources,
  articleNewsletterFilter,
  onArticleNewsletterFilterChange,
  articleCreatedDaysBack,
  onArticleCreatedDaysBackChange,
  articlePublishedDaysBack,
  onArticlePublishedDaysBackChange,
  articleSortKey,
  onArticleSortKeyChange,
  sortDirection,
  onToggleSortDirection,
  onResetArticleFilters,
  jobSearch,
  onJobSearchChange,
  onJobSearchSubmit,
  jobCompany,
  onJobCompanyChange,
  jobCompanies,
  jobLocation,
  onJobLocationChange,
  jobLocations,
  jobRemoteFilter,
  onJobRemoteFilterChange,
  jobNewsletterFilter,
  onJobNewsletterFilterChange,
  jobDateFrom,
  onJobDateFromChange,
  jobDateTo,
  onJobDateToChange,
  jobSortKey,
  onJobSortKeyChange,
  jobSortDirection,
  onToggleJobSortDirection,
  onResetJobFilters,
}: CurateFiltersProps) {
  if (activeTab === "articles") {
    return (
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_22rem] md:items-end">
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-12 md:gap-3">
          <div className="md:col-span-5">
            <label className="app-text-muted mb-1 block text-xs font-medium uppercase tracking-[0.08em]">
              Search
            </label>
            <input
              value={articleSearch}
              onChange={(event) => onArticleSearchChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === "ArrowDown") {
                  event.preventDefault();
                  onArticleSearchSubmit();
                }
              }}
              className="app-input h-9 md:h-10"
              placeholder="Search articles"
              aria-label="Search articles"
            />
          </div>
          <div className="md:col-span-2">
            <label className="app-text-muted mb-1 block text-xs font-medium uppercase tracking-[0.08em]">
              Category
            </label>
            <select
              value={articleCategory}
              onChange={(event) => onArticleCategoryChange(event.target.value)}
              className={`app-input app-input-neon h-9 md:h-10 ${categoryToneByName[articleCategory] ?? ""}`}
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
              Publisher
            </label>
            <select
              value={articlePublisher}
              onChange={(event) => onArticlePublisherChange(event.target.value)}
              className="app-input h-9 md:h-10"
              aria-label="Filter article publisher"
            >
              <option value="all">All publishers</option>
              {publishers.map((publisher) => (
                <option key={publisher} value={publisher}>
                  {publisher}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="app-text-muted mb-1 block text-xs font-medium uppercase tracking-[0.08em]">
              Newsletter
            </label>
            <select
              value={articleNewsletterFilter}
              onChange={(event) =>
                onArticleNewsletterFilterChange(event.target.value as ArticleNewsletterFilter)
              }
              className="app-input h-9 md:h-10"
              aria-label="Filter article newsletter assignment"
            >
              <option value="unassigned_or_target">Unassigned + Selected</option>
              <option value="all">All</option>
              <option value="unassigned">Unassigned</option>
              <option value="assigned">Assigned</option>
              <option value="target">In selected newsletter</option>
              <option value="other">In other newsletters</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="app-text-muted mb-1 block text-xs font-medium uppercase tracking-[0.08em]">
              Source
            </label>
            <select
              value={articleSource}
              onChange={(event) => onArticleSourceChange(event.target.value)}
              className="app-input h-9 md:h-10"
              aria-label="Filter article source"
            >
              <option value="all">All sources</option>
              {sources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="app-text-muted mb-1 block text-xs font-medium uppercase tracking-[0.08em]">
              Created
            </label>
            <select
              value={articleCreatedDaysBack}
              onChange={(event) => onArticleCreatedDaysBackChange(event.target.value)}
              className="app-input h-9 md:h-10"
              aria-label="Filter article by created days back"
            >
              <option value="all">Any time</option>
              <option value="1">Last 1 day</option>
              <option value="2">Last 2 days</option>
              <option value="3">Last 3 days</option>
              <option value="5">Last 5 days</option>
              <option value="7">Last 7 days</option>
              <option value="14">Last 14 days</option>
              <option value="30">Last 30 days</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="app-text-muted mb-1 block text-xs font-medium uppercase tracking-[0.08em]">
              Published
            </label>
            <select
              value={articlePublishedDaysBack}
              onChange={(event) => onArticlePublishedDaysBackChange(event.target.value)}
              className="app-input h-9 md:h-10"
              aria-label="Filter article by published days back"
            >
              <option value="all">Any time</option>
              <option value="1">Last 1 day</option>
              <option value="2">Last 2 days</option>
              <option value="3">Last 3 days</option>
              <option value="5">Last 5 days</option>
              <option value="7">Last 7 days</option>
              <option value="14">Last 14 days</option>
              <option value="30">Last 30 days</option>
            </select>
          </div>
        </div>

        <div className="border-t border-foreground/15 pt-2 md:border-l md:border-t-0 md:pl-3 md:pt-0">
          <p className="app-text-muted mb-2 text-[11px] font-medium uppercase tracking-[0.08em]">
            Sort & Actions
          </p>
          <div className="grid grid-cols-3 gap-2">
            <select
              value={articleSortKey}
              onChange={(event) => onArticleSortKeyChange(event.target.value as SortKey)}
              className="app-input h-9"
              aria-label="Select article sort field"
            >
              <option value="created_at">Created</option>
              <option value="published_at">Published</option>
              <option value="title">Title</option>
              <option value="publisher">Publisher</option>
              <option value="source">Source</option>
              <option value="category">Category</option>
            </select>
            <button
              type="button"
              onClick={onToggleSortDirection}
              className="app-btn-ghost h-9 w-full px-2 text-xs"
            >
              {sortDirection === "asc" ? "Asc" : "Desc"}
            </button>
            <button
              type="button"
              onClick={onResetArticleFilters}
              className="app-btn-ghost h-9 w-full px-2 text-xs"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_22rem] md:items-end">
      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-12 md:gap-3">
        <div className="md:col-span-5">
          <label className="app-text-muted mb-1 block text-xs font-medium uppercase tracking-[0.08em]">
            Search
          </label>
          <input
            value={jobSearch}
            onChange={(event) => onJobSearchChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === "ArrowDown") {
                event.preventDefault();
                onJobSearchSubmit();
              }
            }}
            className="app-input h-9 md:h-10"
            placeholder="Search jobs"
            aria-label="Search jobs"
          />
        </div>
        <div className="md:col-span-3">
          <label className="app-text-muted mb-1 block text-xs font-medium uppercase tracking-[0.08em]">
            Company
          </label>
          <select
            value={jobCompany}
            onChange={(event) => onJobCompanyChange(event.target.value)}
            className="app-input h-9 md:h-10"
            aria-label="Filter jobs by company"
          >
            <option value="all">All companies</option>
            {jobCompanies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-4">
          <label className="app-text-muted mb-1 block text-xs font-medium uppercase tracking-[0.08em]">
            Location
          </label>
          <select
            value={jobLocation}
            onChange={(event) => onJobLocationChange(event.target.value)}
            className="app-input h-9 md:h-10"
            aria-label="Filter jobs by location"
          >
            <option value="all">All locations</option>
            {jobLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="app-text-muted mb-1 block text-xs font-medium uppercase tracking-[0.08em]">
            Type
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
        <div className="md:col-span-4">
          <label className="app-text-muted mb-1 block text-xs font-medium uppercase tracking-[0.08em]">
            Newsletter
          </label>
          <select
            value={jobNewsletterFilter}
            onChange={(event) =>
              onJobNewsletterFilterChange(event.target.value as ArticleNewsletterFilter)
            }
            className="app-input h-9 md:h-10"
            aria-label="Filter job newsletter assignment"
          >
            <option value="all">All</option>
            <option value="unassigned">Unassigned</option>
            <option value="assigned">Assigned</option>
            <option value="target">In selected newsletter</option>
            <option value="other">In other newsletters</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="app-text-muted mb-1 block text-xs font-medium uppercase tracking-[0.08em]">
            From
          </label>
          <input
            type="date"
            value={jobDateFrom}
            onChange={(event) => onJobDateFromChange(event.target.value)}
            className="app-input h-9 md:h-10"
            aria-label="Filter job start date"
          />
        </div>
        <div className="md:col-span-2">
          <label className="app-text-muted mb-1 block text-xs font-medium uppercase tracking-[0.08em]">
            To
          </label>
          <input
            type="date"
            value={jobDateTo}
            onChange={(event) => onJobDateToChange(event.target.value)}
            className="app-input h-9 md:h-10"
            aria-label="Filter job end date"
          />
        </div>
      </div>

      <div className="border-t border-foreground/15 pt-2 md:border-l md:border-t-0 md:pl-3 md:pt-0">
        <p className="app-text-muted mb-2 text-[11px] font-medium uppercase tracking-[0.08em]">
          Sort & Actions
        </p>
        <div className="grid grid-cols-3 gap-2">
          <select
            value={jobSortKey}
            onChange={(event) => onJobSortKeyChange(event.target.value as JobSortKey)}
            className="app-input h-9"
            aria-label="Select job sort field"
          >
            <option value="created_at">Created</option>
            <option value="posted_date">Posted</option>
            <option value="title">Title</option>
            <option value="company">Company</option>
            <option value="location">Location</option>
            <option value="remote">Type</option>
          </select>
          <button
            type="button"
            onClick={onToggleJobSortDirection}
            className="app-btn-ghost h-9 w-full px-2 text-xs"
          >
            {jobSortDirection === "asc" ? "Asc" : "Desc"}
          </button>
          <button
            type="button"
            onClick={onResetJobFilters}
            className="app-btn-ghost h-9 w-full px-2 text-xs"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}