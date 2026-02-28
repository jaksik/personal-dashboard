"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { getCurateWorkspaceDataAction } from "../actions";
import CurateArticlesTable from "./CurateArticlesTable";
import CurateFilters from "./CurateFilters";
import CurateJobsTable from "./CurateJobsTable";
import CurateTabs from "./CurateTabs";
import NewsletterPageNav from "@/components/newsletter/NewsletterPageNav";
import NewsletterSelect from "@/components/newsletter/NewsletterSelect";
import useSelectedNewsletterId from "@/components/newsletter/useSelectedNewsletterId";
import {
    getCategories,
    getCategoryCountBadges,
    getCategoryNeonColorByName,
    getCategoryToneByName,
    getPublishers,
    getSources,
    getVisibleArticles,
} from "@/app/newsletter/curate/components/curateArticleSelectors";
import {
    getJobCompanies,
    getJobLocations,
    getVisibleJobs,
} from "@/app/newsletter/curate/components/curateJobSelectors";
import useCurateMutations from "@/app/newsletter/curate/components/useCurateMutations";
import type {
    ArticleNewsletterFilter,
    ArticleRow,
    CurateTab,
    JobSortKey,
    JobPostingRow,
    SortKey,
} from "./types";

type CurateWorkspaceProps = {
    rightHeaderActions: ReactNode;
};

export default function CurateWorkspace({
    rightHeaderActions,
}: CurateWorkspaceProps) {
    const headerRef = useRef<HTMLDivElement | null>(null);
    const [headerHeight, setHeaderHeight] = useState(208);
    const { selectedNewsletterId, setSelectedNewsletterId } = useSelectedNewsletterId();
    const [activeTab, setActiveTab] = useState<CurateTab>("articles");
    const [isFiltersPanelOpen, setIsFiltersPanelOpen] = useState(false);

    const [articles, setArticles] = useState<ArticleRow[]>([]);
    const [jobPostings, setJobPostings] = useState<JobPostingRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const [targetNewsletter, setTargetNewsletter] = useState<{
        id: number;
        title: string | null;
    } | null>(null);

    const [articleSearch, setArticleSearch] = useState("");
    const [articleSearchSubmitCount, setArticleSearchSubmitCount] = useState(0);
    const [articleCategory, setArticleCategory] = useState("all");
    const [articlePublisher, setArticlePublisher] = useState("all");
    const [articleSource, setArticleSource] = useState("all");
    const [articleNewsletterFilter, setArticleNewsletterFilter] =
        useState<ArticleNewsletterFilter>("unassigned_or_target");
    const [articleCreatedDaysBack, setArticleCreatedDaysBack] = useState("all");
    const [articlePublishedDaysBack, setArticlePublishedDaysBack] = useState("all");
    const [sortKey, setSortKey] = useState<SortKey>("created_at");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [jobSearch, setJobSearch] = useState("");
    const [jobCompany, setJobCompany] = useState("all");
    const [jobLocation, setJobLocation] = useState("all");
    const [jobRemoteFilter, setJobRemoteFilter] = useState("all");
    const [jobNewsletterFilter, setJobNewsletterFilter] =
        useState<ArticleNewsletterFilter>("all");
    const [jobDateFrom, setJobDateFrom] = useState("");
    const [jobDateTo, setJobDateTo] = useState("");
    const [jobSortKey, setJobSortKey] = useState<JobSortKey>("created_at");
    const [jobSortDirection, setJobSortDirection] = useState<"asc" | "desc">("desc");

    useEffect(() => {
        async function loadWorkspaceData() {
            setIsLoading(true);
            setError(null);
            setActionError(null);

            try {
                const payload = await getCurateWorkspaceDataAction(selectedNewsletterId);
                setTargetNewsletter(payload.targetNewsletter);
                setArticles(payload.articles);
                setJobPostings(payload.jobs);
            } catch (loadError) {
                setError(loadError instanceof Error ? loadError.message : "Failed to load curate data.");
            } finally {
                setIsLoading(false);
            }
        }

        loadWorkspaceData();
    }, [selectedNewsletterId]);

    useEffect(() => {
        function updateHeaderHeight() {
            const nextHeight = headerRef.current?.getBoundingClientRect().height ?? 0;
            if (nextHeight > 0) {
                setHeaderHeight(nextHeight);
            }
        }

        updateHeaderHeight();

        const observer =
            typeof ResizeObserver !== "undefined"
                ? new ResizeObserver(() => updateHeaderHeight())
                : null;

        if (observer && headerRef.current) {
            observer.observe(headerRef.current);
        }

        window.addEventListener("resize", updateHeaderHeight);

        return () => {
            observer?.disconnect();
            window.removeEventListener("resize", updateHeaderHeight);
        };
    }, [activeTab]);

    const categories = useMemo(() => getCategories(articles), [articles]);

    const publishers = useMemo(() => getPublishers(articles), [articles]);

    const sources = useMemo(() => getSources(articles), [articles]);

    const jobCompanies = useMemo(() => getJobCompanies(jobPostings), [jobPostings]);

    const jobLocations = useMemo(() => getJobLocations(jobPostings), [jobPostings]);

    const visibleArticles = useMemo(
        () =>
            getVisibleArticles({
                articles,
                articleSearch,
                articleCategory,
                articlePublisher,
                articleSource,
                articleNewsletterFilter,
                articleCreatedDaysBack,
                articlePublishedDaysBack,
                sortKey,
                sortDirection,
                targetNewsletter,
            }),
        [
            articleCategory,
            articleCreatedDaysBack,
            articleNewsletterFilter,
            articlePublishedDaysBack,
            articlePublisher,
            articleSearch,
            articleSource,
            articles,
            sortDirection,
            sortKey,
            targetNewsletter,
        ]
    );

    const categoryCountBadges = useMemo(
        () => getCategoryCountBadges(articles, targetNewsletter),
        [articles, targetNewsletter]
    );

    const categoryToneByName = useMemo(
        () => getCategoryToneByName(categoryCountBadges),
        [categoryCountBadges]
    );

    const categoryNeonColorByName = useMemo(
        () => getCategoryNeonColorByName(categories),
        [categories]
    );

    const visibleJobs = useMemo(
        () =>
            getVisibleJobs({
                jobPostings,
                jobSearch,
                jobCompany,
                jobLocation,
                jobRemoteFilter,
                jobNewsletterFilter,
                jobDateFrom,
                jobDateTo,
                jobSortKey,
                jobSortDirection,
                targetNewsletter,
            }),
        [
            jobCompany,
            jobDateFrom,
            jobDateTo,
            jobLocation,
            jobNewsletterFilter,
            jobPostings,
            jobRemoteFilter,
            jobSearch,
            jobSortDirection,
            jobSortKey,
            targetNewsletter,
        ]
    );

    const {
        addingArticleIds,
        updatingCategoryArticleIds,
        updatingArticleDocumentIds,
        addingJobIds,
        updatingJobDocumentIds,
        addArticleToNewsletter,
        updateArticleCategory,
        updateArticleDocument,
        isJobInTargetNewsletter,
        addJobToNewsletter,
        updateJobDocument,
    } = useCurateMutations({
        articles,
        setArticles,
        jobPostings,
        setJobPostings,
        targetNewsletter,
        setActionError,
    });

    function applySort(nextKey: SortKey) {
        if (sortKey === nextKey) {
            setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
            return;
        }

        setSortKey(nextKey);
        setSortDirection(nextKey === "created_at" || nextKey === "published_at" ? "desc" : "asc");
    }

    function handleArticleSortKeyChange(nextKey: SortKey) {
        setSortKey(nextKey);
        setSortDirection(nextKey === "created_at" || nextKey === "published_at" ? "desc" : "asc");
    }

    function applyJobSort(nextKey: JobSortKey) {
        if (jobSortKey === nextKey) {
            setJobSortDirection((current) => (current === "asc" ? "desc" : "asc"));
            return;
        }

        setJobSortKey(nextKey);
        setJobSortDirection(nextKey === "created_at" || nextKey === "posted_date" ? "desc" : "asc");
    }

    function handleJobSortKeyChange(nextKey: JobSortKey) {
        setJobSortKey(nextKey);
        setJobSortDirection(nextKey === "created_at" || nextKey === "posted_date" ? "desc" : "asc");
    }

    function resetArticleFilters() {
        setArticleSearch("");
        setArticleSearchSubmitCount(0);
        setArticleCategory("all");
        setArticlePublisher("all");
        setArticleSource("all");
        setArticleNewsletterFilter("unassigned_or_target");
        setArticleCreatedDaysBack("all");
        setArticlePublishedDaysBack("all");
        setSortKey("created_at");
        setSortDirection("desc");
    }

    function resetJobFilters() {
        setJobSearch("");
        setJobCompany("all");
        setJobLocation("all");
        setJobRemoteFilter("all");
        setJobNewsletterFilter("all");
        setJobDateFrom("");
        setJobDateTo("");
        setJobSortKey("created_at");
        setJobSortDirection("desc");
    }

    return (
        <section className="w-full">
            <div
                ref={headerRef}
                className="fixed inset-x-0 top-0 z-30 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85"
            >
                <div className="mx-auto w-full">
                    <div className="border border-foreground/15 bg-foreground/2 px-2">
                        <NewsletterPageNav
                            compactDashboardButton
                            leftActions={
                                <Link
                                    href="/newsletter/design"
                                    className="app-btn-ghost inline-flex items-center gap-1 px-4 py-2 text-sm font-medium"
                                >
                                    Design
                                    <span aria-hidden="true">→</span>
                                </Link>
                            }
                            rightActions={rightHeaderActions}
                            centerContent={
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-2">
                                        <div className="w-full max-w-sm md:w-72 md:max-w-none">
                                            <NewsletterSelect
                                                value={selectedNewsletterId}
                                                onChange={setSelectedNewsletterId}
                                            />
                                        </div>
                                        <div className="shrink-0">
                                            <CurateTabs activeTab={activeTab} onChange={setActiveTab} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {activeTab === "articles" ? (
                                            <div className="hidden max-w-160 items-center justify-end gap-2 overflow-x-auto lg:flex">
                                                {categoryCountBadges.map((badge) => (
                                                    <span
                                                        key={badge.category}
                                                        className={`app-neon-badge inline-flex h-8 shrink-0 items-center px-5 text-sm font-bold ${badge.toneClass}`}
                                                        style={
                                                            badge.category === "Uncategorized"
                                                                ? ({ "--neon-color": "#9ca3af" } as CSSProperties)
                                                                : undefined
                                                        }
                                                    >
                                                        {badge.category}: {badge.count}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : null}
                                        <button
                                            type="button"
                                            onClick={() => setIsFiltersPanelOpen((current) => !current)}
                                            className="app-btn-ghost inline-flex h-9 w-9 shrink-0 items-center justify-center p-0 md:h-10 md:w-10"
                                            aria-expanded={isFiltersPanelOpen}
                                            aria-controls="curate-filters-panel"
                                            aria-label={isFiltersPanelOpen ? "Hide filters and sort" : "Show filters and sort"}
                                            title={isFiltersPanelOpen ? "Hide filters and sort" : "Show filters and sort"}
                                        >
                                            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                                                <path
                                                    d="M4 6h16M7 12h10M10 18h4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.8"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            }
                        />

                        <div className="mt-3 max-w-6xl mx-auto">
                            {isFiltersPanelOpen ? (
                                <div id="curate-filters-panel">
                                    <CurateFilters
                                        activeTab={activeTab}
                                        articleSearch={articleSearch}
                                        onArticleSearchChange={setArticleSearch}
                                        onArticleSearchSubmit={() =>
                                            setArticleSearchSubmitCount((current) => current + 1)
                                        }
                                        articleCategory={articleCategory}
                                        onArticleCategoryChange={setArticleCategory}
                                        categoryToneByName={categoryToneByName}
                                        categories={categories}
                                        articlePublisher={articlePublisher}
                                        onArticlePublisherChange={setArticlePublisher}
                                        publishers={publishers}
                                        articleSource={articleSource}
                                        onArticleSourceChange={setArticleSource}
                                        sources={sources}
                                        articleNewsletterFilter={articleNewsletterFilter}
                                        onArticleNewsletterFilterChange={setArticleNewsletterFilter}
                                        articleCreatedDaysBack={articleCreatedDaysBack}
                                        onArticleCreatedDaysBackChange={setArticleCreatedDaysBack}
                                        articlePublishedDaysBack={articlePublishedDaysBack}
                                        onArticlePublishedDaysBackChange={setArticlePublishedDaysBack}
                                        articleSortKey={sortKey}
                                        onArticleSortKeyChange={handleArticleSortKeyChange}
                                        sortDirection={sortDirection}
                                        onToggleSortDirection={() =>
                                            setSortDirection((current) => (current === "asc" ? "desc" : "asc"))
                                        }
                                        onResetArticleFilters={resetArticleFilters}
                                        jobSearch={jobSearch}
                                        onJobSearchChange={setJobSearch}
                                        onJobSearchSubmit={() => undefined}
                                        jobCompany={jobCompany}
                                        onJobCompanyChange={setJobCompany}
                                        jobCompanies={jobCompanies}
                                        jobLocation={jobLocation}
                                        onJobLocationChange={setJobLocation}
                                        jobLocations={jobLocations}
                                        jobRemoteFilter={jobRemoteFilter}
                                        onJobRemoteFilterChange={setJobRemoteFilter}
                                        jobNewsletterFilter={jobNewsletterFilter}
                                        onJobNewsletterFilterChange={setJobNewsletterFilter}
                                        jobDateFrom={jobDateFrom}
                                        onJobDateFromChange={setJobDateFrom}
                                        jobDateTo={jobDateTo}
                                        onJobDateToChange={setJobDateTo}
                                        jobSortKey={jobSortKey}
                                        onJobSortKeyChange={handleJobSortKeyChange}
                                        jobSortDirection={jobSortDirection}
                                        onToggleJobSortDirection={() =>
                                            setJobSortDirection((current) => (current === "asc" ? "desc" : "asc"))
                                        }
                                        onResetJobFilters={resetJobFilters}
                                    />
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-1 pb-4 md:px-2 md:pb-5" style={{ paddingTop: `${headerHeight + 16}px` }}>
                <div className="mx-auto w-full max-w-6xl">
                    {activeTab === "articles" ? (
                        <CurateArticlesTable
                            hasTargetNewsletter={Boolean(targetNewsletter)}
                            actionError={actionError}
                            isLoading={isLoading}
                            error={error}
                            visibleArticles={visibleArticles}
                            categoryOptions={categories}
                            categoryToneByName={categoryToneByName}
                            categoryNeonColorByName={categoryNeonColorByName}
                            updateArticleCategory={updateArticleCategory}
                            updatingCategoryArticleIds={updatingCategoryArticleIds}
                            updateArticleDocument={updateArticleDocument}
                            updatingArticleDocumentIds={updatingArticleDocumentIds}
                            focusFirstRowSignal={articleSearchSubmitCount}
                            sortKey={sortKey}
                            sortDirection={sortDirection}
                            applySort={applySort}
                            addArticleToNewsletter={addArticleToNewsletter}
                            addingArticleIds={addingArticleIds}
                        />
                    ) : (
                        <CurateJobsTable
                            hasTargetNewsletter={Boolean(targetNewsletter)}
                            actionError={actionError}
                            isLoading={isLoading}
                            error={error}
                            jobs={visibleJobs}
                            jobSortKey={jobSortKey}
                            jobSortDirection={jobSortDirection}
                            applyJobSort={applyJobSort}
                            updateJobDocument={updateJobDocument}
                            updatingJobDocumentIds={updatingJobDocumentIds}
                            addJobToNewsletter={addJobToNewsletter}
                            addingJobIds={addingJobIds}
                            isJobInTargetNewsletter={isJobInTargetNewsletter}
                        />
                    )}
                </div>
            </div>
        </section>
    );
}
