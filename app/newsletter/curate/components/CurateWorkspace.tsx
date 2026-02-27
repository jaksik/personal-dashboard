"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    addArticleToNewsletterAction,
    addJobToNewsletterAction,
    getCurateWorkspaceDataAction,
    updateArticleCategoryAction,
    updateArticleDocumentAction,
    updateJobDocumentAction,
} from "../actions";
import CurateArticlesTable from "./CurateArticlesTable";
import CurateFilters from "./CurateFilters";
import CurateJobsTable from "./CurateJobsTable";
import CurateTabs from "./CurateTabs";
import NewsletterPageNav from "@/components/newsletter/NewsletterPageNav";
import NewsletterSelect from "@/components/newsletter/NewsletterSelect";
import useSelectedNewsletterId from "@/components/newsletter/useSelectedNewsletterId";
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

    const [addingArticleIds, setAddingArticleIds] = useState<number[]>([]);
    const [updatingCategoryArticleIds, setUpdatingCategoryArticleIds] = useState<number[]>([]);
    const [updatingArticleDocumentIds, setUpdatingArticleDocumentIds] = useState<number[]>([]);
    const [addingJobIds, setAddingJobIds] = useState<number[]>([]);
    const [updatingJobDocumentIds, setUpdatingJobDocumentIds] = useState<number[]>([]);

    const [articleSearch, setArticleSearch] = useState("");
    const [articleSearchSubmitCount, setArticleSearchSubmitCount] = useState(0);
    const [articleCategory, setArticleCategory] = useState("all");
    const [articlePublisher, setArticlePublisher] = useState("all");
    const [articleSource, setArticleSource] = useState("all");
    const [articleNewsletterFilter, setArticleNewsletterFilter] =
        useState<ArticleNewsletterFilter>("all");
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

    const categories = useMemo(() => {
        const unique = new Set<string>();

        for (const article of articles) {
            if (article.category) {
                unique.add(article.category);
            }
        }

        return Array.from(unique).sort((a, b) => a.localeCompare(b));
    }, [articles]);

    const publishers = useMemo(() => {
        const unique = new Set<string>();

        for (const article of articles) {
            if (article.publisher) {
                unique.add(article.publisher);
            }
        }

        return Array.from(unique).sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: "base", numeric: true })
        );
    }, [articles]);

    const sources = useMemo(() => {
        const unique = new Set<string>();

        for (const article of articles) {
            if (article.source) {
                unique.add(article.source);
            }
        }

        return Array.from(unique).sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: "base", numeric: true })
        );
    }, [articles]);

    const jobCompanies = useMemo(() => {
        const unique = new Set<string>();

        for (const job of jobPostings) {
            if (job.company) {
                unique.add(job.company);
            }
        }

        return Array.from(unique).sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: "base", numeric: true })
        );
    }, [jobPostings]);

    const jobLocations = useMemo(() => {
        const unique = new Set<string>();

        for (const job of jobPostings) {
            if (job.location) {
                unique.add(job.location);
            }
        }

        return Array.from(unique).sort((a, b) =>
            a.localeCompare(b, undefined, { sensitivity: "base", numeric: true })
        );
    }, [jobPostings]);

    function normalizeText(value: string | null) {
        return (value ?? "").trim().toLowerCase();
    }

    function normalizeNullable(value: string | null) {
        const trimmed = (value ?? "").trim();
        return trimmed.length > 0 ? trimmed : null;
    }

    function parseDate(value: string | null) {
        if (!value) {
            return null;
        }

        const time = new Date(value).getTime();
        return Number.isNaN(time) ? null : time;
    }

    const visibleArticles = useMemo(() => {
        function isWithinDaysBack(value: string | null, daysBack: string) {
            if (daysBack === "all") {
                return true;
            }

            const parsedDays = Number(daysBack);
            if (!Number.isFinite(parsedDays) || parsedDays <= 0) {
                return true;
            }

            const valueTime = parseDate(value);
            if (valueTime === null) {
                return false;
            }

            const threshold = Date.now() - parsedDays * 24 * 60 * 60 * 1000;
            return valueTime >= threshold;
        }

        const searchTokens = articleSearch
            .trim()
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);

        const filtered = articles.filter((article) => {
            if (articleCategory !== "all" && article.category !== articleCategory) {
                return false;
            }

            if (articlePublisher !== "all" && article.publisher !== articlePublisher) {
                return false;
            }

            if (articleSource !== "all" && article.source !== articleSource) {
                return false;
            }

            const assignedNewsletterId = article.newsletter_id;
            if (articleNewsletterFilter === "unassigned" && assignedNewsletterId !== null) {
                return false;
            }
            if (articleNewsletterFilter === "assigned" && assignedNewsletterId === null) {
                return false;
            }
            if (articleNewsletterFilter === "target") {
                if (!targetNewsletter || assignedNewsletterId !== targetNewsletter.id) {
                    return false;
                }
            }
            if (articleNewsletterFilter === "other") {
                if (!targetNewsletter || assignedNewsletterId === null || assignedNewsletterId === targetNewsletter.id) {
                    return false;
                }
            }

            if (!isWithinDaysBack(article.created_at, articleCreatedDaysBack)) {
                return false;
            }

            if (!isWithinDaysBack(article.published_at, articlePublishedDaysBack)) {
                return false;
            }

            if (searchTokens.length === 0) {
                return true;
            }

            const haystack = [
                article.title_snippet,
                article.title,
                article.description,
                article.publisher,
                article.category,
                article.source,
            ]
                .map((value) => normalizeText(value))
                .filter(Boolean)
                .join(" ");

            return searchTokens.every((token) => haystack.includes(token));
        });

        filtered.sort((left, right) => {
            const direction = sortDirection === "asc" ? 1 : -1;

            if (sortKey === "created_at" || sortKey === "published_at") {
                const leftTime = parseDate(left[sortKey]);
                const rightTime = parseDate(right[sortKey]);

                if (leftTime === null && rightTime !== null) {
                    return 1;
                }

                if (leftTime !== null && rightTime === null) {
                    return -1;
                }

                if (leftTime !== null && rightTime !== null && leftTime !== rightTime) {
                    return (leftTime - rightTime) * direction;
                }
            } else {
                const leftText =
                    sortKey === "title"
                        ? normalizeText(left.title_snippet ?? left.title)
                        : normalizeText(left[sortKey]);
                const rightText =
                    sortKey === "title"
                        ? normalizeText(right.title_snippet ?? right.title)
                        : normalizeText(right[sortKey]);

                if (!leftText && rightText) {
                    return 1;
                }

                if (leftText && !rightText) {
                    return -1;
                }

                const compared = leftText.localeCompare(rightText, undefined, {
                    sensitivity: "base",
                    numeric: true,
                });

                if (compared !== 0) {
                    return compared * direction;
                }
            }

            const fallbackLeft = parseDate(left.created_at) ?? 0;
            const fallbackRight = parseDate(right.created_at) ?? 0;

            if (fallbackLeft !== fallbackRight) {
                return (fallbackRight - fallbackLeft) * direction;
            }

            return left.id - right.id;
        });

        return filtered;
    }, [
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
    ]);

    const visibleJobs = useMemo(() => {
        const searchTokens = jobSearch
            .trim()
            .toLowerCase()
            .split(/\s+/)
            .filter(Boolean);

        const filtered = jobPostings.filter((job) => {
            if (jobCompany !== "all" && job.company !== jobCompany) {
                return false;
            }

            if (jobLocation !== "all" && job.location !== jobLocation) {
                return false;
            }

            const matchesRemote =
                jobRemoteFilter === "all" ||
                (jobRemoteFilter === "remote" && job.remote === true) ||
                (jobRemoteFilter === "onsite" && job.remote === false);

            if (!matchesRemote) {
                return false;
            }

            const assignedNewsletterId = job.newsletter_id;
            if (jobNewsletterFilter === "unassigned" && assignedNewsletterId !== null) {
                return false;
            }
            if (jobNewsletterFilter === "assigned" && assignedNewsletterId === null) {
                return false;
            }
            if (jobNewsletterFilter === "target") {
                if (!targetNewsletter || assignedNewsletterId !== targetNewsletter.id) {
                    return false;
                }
            }
            if (jobNewsletterFilter === "other") {
                if (!targetNewsletter || assignedNewsletterId === null || assignedNewsletterId === targetNewsletter.id) {
                    return false;
                }
            }

            if (jobDateFrom || jobDateTo) {
                const jobTime = parseDate(job.posted_date) ?? parseDate(job.created_at);
                if (jobTime === null) {
                    return false;
                }

                if (jobDateFrom) {
                    const fromTime = new Date(`${jobDateFrom}T00:00:00`).getTime();
                    if (!Number.isNaN(fromTime) && jobTime < fromTime) {
                        return false;
                    }
                }

                if (jobDateTo) {
                    const toTime = new Date(`${jobDateTo}T23:59:59.999`).getTime();
                    if (!Number.isNaN(toTime) && jobTime > toTime) {
                        return false;
                    }
                }
            }

            if (searchTokens.length === 0) {
                return true;
            }

            const haystack = [
                job.title,
                job.description,
                job.company,
                job.location,
                job.remote === true ? "remote" : job.remote === false ? "onsite" : null,
            ]
                .map((value) => normalizeText(value))
                .filter(Boolean)
                .join(" ");

            return searchTokens.every((token) => haystack.includes(token));
        });

        filtered.sort((left, right) => {
            const direction = jobSortDirection === "asc" ? 1 : -1;

            if (jobSortKey === "created_at" || jobSortKey === "posted_date") {
                const leftTime = parseDate(left[jobSortKey]);
                const rightTime = parseDate(right[jobSortKey]);

                if (leftTime === null && rightTime !== null) {
                    return 1;
                }

                if (leftTime !== null && rightTime === null) {
                    return -1;
                }

                if (leftTime !== null && rightTime !== null && leftTime !== rightTime) {
                    return (leftTime - rightTime) * direction;
                }
            } else if (jobSortKey === "remote") {
                const leftValue = left.remote === true ? 2 : left.remote === false ? 1 : 0;
                const rightValue = right.remote === true ? 2 : right.remote === false ? 1 : 0;

                if (leftValue !== rightValue) {
                    return (leftValue - rightValue) * direction;
                }
            } else {
                const leftText = normalizeText(left[jobSortKey]);
                const rightText = normalizeText(right[jobSortKey]);

                if (!leftText && rightText) {
                    return 1;
                }

                if (leftText && !rightText) {
                    return -1;
                }

                const compared = leftText.localeCompare(rightText, undefined, {
                    sensitivity: "base",
                    numeric: true,
                });

                if (compared !== 0) {
                    return compared * direction;
                }
            }

            const fallbackLeft = parseDate(left.created_at) ?? 0;
            const fallbackRight = parseDate(right.created_at) ?? 0;

            if (fallbackLeft !== fallbackRight) {
                return (fallbackRight - fallbackLeft) * direction;
            }

            return left.id - right.id;
        });

        return filtered;
    }, [
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
    ]);

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
        setArticleNewsletterFilter("all");
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

    function isArticleInTargetNewsletter(article: ArticleRow) {
        return targetNewsletter ? article.newsletter_id === targetNewsletter.id : false;
    }

    async function addArticleToNewsletter(articleId: number) {
        if (!targetNewsletter) {
            setActionError("No newsletter found in the last 12 hours to attach articles to.");
            return;
        }

        setActionError(null);
        setAddingArticleIds((current) => [...current, articleId]);

        try {
            await addArticleToNewsletterAction(targetNewsletter.id, articleId);
            setArticles((current) =>
                current.map((article) =>
                    article.id === articleId
                        ? { ...article, newsletter_id: targetNewsletter.id }
                        : article
                )
            );
        } catch (updateError) {
            setActionError(updateError instanceof Error ? updateError.message : "Failed to add article.");
        } finally {
            setAddingArticleIds((current) => current.filter((id) => id !== articleId));
        }
    }

    async function updateArticleCategory(articleId: number, nextCategory: string | null) {
        const previousArticle = articles.find((article) => article.id === articleId);
        if (!previousArticle || previousArticle.category === nextCategory) {
            return;
        }

        setActionError(null);
        setUpdatingCategoryArticleIds((current) => [...current, articleId]);
        setArticles((current) =>
            current.map((article) =>
                article.id === articleId ? { ...article, category: nextCategory } : article
            )
        );

        try {
            await updateArticleCategoryAction(articleId, nextCategory);
        } catch (updateError) {
            setArticles((current) =>
                current.map((article) =>
                    article.id === articleId
                        ? { ...article, category: previousArticle.category }
                        : article
                )
            );
            setActionError(
                updateError instanceof Error
                    ? updateError.message
                    : "Failed to update article category."
            );
        } finally {
            setUpdatingCategoryArticleIds((current) =>
                current.filter((id) => id !== articleId)
            );
        }
    }

    async function updateArticleDocument(
        articleId: number,
        updates: {
            title_snippet: string | null;
            title: string | null;
            description: string | null;
            publisher: string | null;
            source: string | null;
        }
    ) {
        const previousArticle = articles.find((article) => article.id === articleId);
        if (!previousArticle) {
            return;
        }

        const normalizedUpdates = {
            title_snippet: normalizeNullable(updates.title_snippet),
            title: normalizeNullable(updates.title),
            description: normalizeNullable(updates.description),
            publisher: normalizeNullable(updates.publisher),
            source: normalizeNullable(updates.source),
        };

        setActionError(null);
        setUpdatingArticleDocumentIds((current) => [...current, articleId]);
        setArticles((current) =>
            current.map((article) =>
                article.id === articleId ? { ...article, ...normalizedUpdates } : article
            )
        );

        try {
            await updateArticleDocumentAction(articleId, normalizedUpdates);
        } catch (updateError) {
            setArticles((current) =>
                current.map((article) =>
                    article.id === articleId ? previousArticle : article
                )
            );
            setActionError(
                updateError instanceof Error
                    ? updateError.message
                    : "Failed to update article."
            );
            throw updateError;
        } finally {
            setUpdatingArticleDocumentIds((current) =>
                current.filter((id) => id !== articleId)
            );
        }
    }

    function isJobInTargetNewsletter(job: JobPostingRow) {
        return targetNewsletter ? job.newsletter_id === targetNewsletter.id : false;
    }

    async function addJobToNewsletter(jobId: number) {
        if (!targetNewsletter) {
            setActionError("No newsletter found in the last 12 hours to attach jobs to.");
            return;
        }

        setActionError(null);
        setAddingJobIds((current) => [...current, jobId]);

        try {
            await addJobToNewsletterAction(targetNewsletter.id, jobId);
            setJobPostings((current) =>
                current.map((job) =>
                    job.id === jobId
                        ? { ...job, newsletter_id: targetNewsletter.id }
                        : job
                )
            );
        } catch (updateError) {
            setActionError(updateError instanceof Error ? updateError.message : "Failed to add job.");
        } finally {
            setAddingJobIds((current) => current.filter((id) => id !== jobId));
        }
    }

    async function updateJobDocument(
        jobId: number,
        updates: {
            title: string | null;
            description: string | null;
            company: string | null;
            location: string | null;
            remote: boolean | null;
            posted_date: string | null;
            apply_link: string | null;
        }
    ) {
        const previousJob = jobPostings.find((job) => job.id === jobId);
        if (!previousJob) {
            return;
        }

        const normalizedUpdates = {
            title: normalizeNullable(updates.title),
            description: normalizeNullable(updates.description),
            company: normalizeNullable(updates.company),
            location: normalizeNullable(updates.location),
            remote: updates.remote,
            posted_date: normalizeNullable(updates.posted_date),
            apply_link: normalizeNullable(updates.apply_link),
        };

        setActionError(null);
        setUpdatingJobDocumentIds((current) => [...current, jobId]);
        setJobPostings((current) =>
            current.map((job) => (job.id === jobId ? { ...job, ...normalizedUpdates } : job))
        );

        try {
            await updateJobDocumentAction(jobId, normalizedUpdates);
        } catch (updateError) {
            setJobPostings((current) =>
                current.map((job) => (job.id === jobId ? previousJob : job))
            );
            setActionError(
                updateError instanceof Error
                    ? updateError.message
                    : "Failed to update job."
            );
            throw updateError;
        } finally {
            setUpdatingJobDocumentIds((current) => current.filter((id) => id !== jobId));
        }
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
                            rightActions={rightHeaderActions}
                            centerContent={
                                <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
                                    <div className="justify-self-start w-full max-w-sm md:w-72 md:max-w-none">
                                        <NewsletterSelect
                                            value={selectedNewsletterId}
                                            onChange={setSelectedNewsletterId}
                                        />
                                    </div>
                                    <div className="shrink-0 justify-self-center">
                                        <CurateTabs activeTab={activeTab} onChange={setActiveTab} />
                                    </div>
                                    <div className="justify-self-end">
                                        <button
                                            type="button"
                                            onClick={() => setIsFiltersPanelOpen((current) => !current)}
                                            className="app-btn-ghost h-9 shrink-0 px-3 text-xs"
                                            aria-expanded={isFiltersPanelOpen}
                                            aria-controls="curate-filters-panel"
                                        >
                                            {isFiltersPanelOpen ? "Hide filters & sort" : "Show filters & sort"}
                                        </button>
                                    </div>
                                </div>
                            }
                        />

                        <div className="mt-3 border-t max-w-6xl mx-auto border-foreground/15 py-3">
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
                            isArticleInTargetNewsletter={isArticleInTargetNewsletter}
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
