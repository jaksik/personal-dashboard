"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
    addArticleToNewsletterAction,
    addJobToNewsletterAction,
    addSelectedArticlesToNewsletterAction,
    getCurateWorkspaceDataAction,
} from "../actions";
import CurateArticlesTable from "./CurateArticlesTable";
import CurateFilters from "./CurateFilters";
import CurateJobsTable from "./CurateJobsTable";
import CurateNewsletterSelect from "./CurateNewsletterSelect";
import CurateTabs from "./CurateTabs";
import type { ArticleRow, CurateTab, JobPostingRow, SortKey } from "./types";

type CurateWorkspaceProps = {
    leftHeaderActions: ReactNode;
    rightHeaderActions: ReactNode;
};

export default function CurateWorkspace({
    leftHeaderActions,
    rightHeaderActions,
}: CurateWorkspaceProps) {
    const [selectedNewsletterId, setSelectedNewsletterId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<CurateTab>("articles");

    const [articles, setArticles] = useState<ArticleRow[]>([]);
    const [jobPostings, setJobPostings] = useState<JobPostingRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const [targetNewsletter, setTargetNewsletter] = useState<{
        id: number;
        title: string | null;
    } | null>(null);

    const [selectedArticleIds, setSelectedArticleIds] = useState<number[]>([]);
    const [addingArticleIds, setAddingArticleIds] = useState<number[]>([]);
    const [addingJobIds, setAddingJobIds] = useState<number[]>([]);

    const [articleSearch, setArticleSearch] = useState("");
    const [articleCategory, setArticleCategory] = useState("all");
    const [sortKey, setSortKey] = useState<SortKey>("created_at");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [jobSearch, setJobSearch] = useState("");
    const [jobRemoteFilter, setJobRemoteFilter] = useState("all");

    useEffect(() => {
        async function loadWorkspaceData() {
            setIsLoading(true);
            setError(null);
            setActionError(null);
            setSelectedArticleIds([]);

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

    const categories = useMemo(() => {
        const unique = new Set<string>();

        for (const article of articles) {
            if (article.category) {
                unique.add(article.category);
            }
        }

        return Array.from(unique).sort((a, b) => a.localeCompare(b));
    }, [articles]);

    const visibleArticles = useMemo(() => {
        const loweredSearch = articleSearch.trim().toLowerCase();

        const filtered = articles.filter((article) => {
            const matchesCategory =
                articleCategory === "all" || article.category === articleCategory;

            if (!matchesCategory) {
                return false;
            }

            if (!loweredSearch) {
                return true;
            }

            const haystack = [article.title, article.publisher, article.category]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(loweredSearch);
        });

        filtered.sort((left, right) => {
            const direction = sortDirection === "asc" ? 1 : -1;

            const leftValue = left[sortKey] ?? "";
            const rightValue = right[sortKey] ?? "";

            if (sortKey === "created_at") {
                const leftTime = leftValue ? new Date(String(leftValue)).getTime() : 0;
                const rightTime = rightValue ? new Date(String(rightValue)).getTime() : 0;

                return (leftTime - rightTime) * direction;
            }

            return String(leftValue).localeCompare(String(rightValue)) * direction;
        });

        return filtered;
    }, [articles, articleCategory, articleSearch, sortDirection, sortKey]);

    const visibleJobs = useMemo(() => {
        const loweredSearch = jobSearch.trim().toLowerCase();

        return jobPostings.filter((job) => {
            const matchesRemote =
                jobRemoteFilter === "all" ||
                (jobRemoteFilter === "remote" && job.remote === true) ||
                (jobRemoteFilter === "onsite" && job.remote === false);

            if (!matchesRemote) {
                return false;
            }

            if (!loweredSearch) {
                return true;
            }

            const haystack = [job.title, job.company, job.location]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return haystack.includes(loweredSearch);
        });
    }, [jobPostings, jobRemoteFilter, jobSearch]);

    function applySort(nextKey: SortKey) {
        if (sortKey === nextKey) {
            setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
            return;
        }

        setSortKey(nextKey);
        setSortDirection("asc");
    }

    function isArticleSelected(articleId: number) {
        return selectedArticleIds.includes(articleId);
    }

    function toggleArticleSelection(articleId: number) {
        setSelectedArticleIds((current) =>
            current.includes(articleId)
                ? current.filter((id) => id !== articleId)
                : [...current, articleId]
        );
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

    async function addSelectedArticlesToNewsletter() {
        if (!targetNewsletter) {
            setActionError("No newsletter found in the last 12 hours to attach articles to.");
            return;
        }

        if (selectedArticleIds.length === 0) {
            return;
        }

        setActionError(null);
        setAddingArticleIds((current) => [...current, ...selectedArticleIds]);

        try {
            await addSelectedArticlesToNewsletterAction(targetNewsletter.id, selectedArticleIds);

            const selectedSet = new Set(selectedArticleIds);
            setArticles((current) =>
                current.map((article) =>
                    selectedSet.has(article.id)
                        ? { ...article, newsletter_id: targetNewsletter.id }
                        : article
                )
            );
            setSelectedArticleIds([]);
        } catch (updateError) {
            setActionError(
                updateError instanceof Error ? updateError.message : "Failed to add selected articles."
            );
        } finally {
            setAddingArticleIds((current) =>
                current.filter((id) => !selectedArticleIds.includes(id))
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

    return (
        <section className="w-full">
            <div className="sticky top-0 z-20 bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/85 md:px-5 md:py-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="shrink-0">{leftHeaderActions}</div>
                        <div className="w-full max-w-sm min-w-55">
                            <CurateNewsletterSelect
                                value={selectedNewsletterId}
                                onChange={setSelectedNewsletterId}
                            />
                        </div>
                    </div>
                    <div>
                        <p className="app-text-muted hidden text-xs uppercase tracking-[0.14em] lg:block mb-5">
                            Curate Newsletter Content
                        </p>
                        <CurateTabs activeTab={activeTab} onChange={setActiveTab} />

                    </div>
                    <div className="shrink-0">{rightHeaderActions}</div>
                </div>

                <div className="mt-3 rounded-xl border border-foreground/15 bg-foreground/2 p-3">
                    <div className="mb-2 flex items-center justify-between">
                        <p className="app-text-muted text-xs uppercase tracking-[0.14em]">Filters</p>
                        <p className="app-text-muted text-xs">
                            {activeTab === "articles"
                                ? `${visibleArticles.length} articles`
                                : `${visibleJobs.length} jobs`}
                        </p>
                    </div>
                    <CurateFilters
                        activeTab={activeTab}
                        articleSearch={articleSearch}
                        onArticleSearchChange={setArticleSearch}
                        articleCategory={articleCategory}
                        onArticleCategoryChange={setArticleCategory}
                        categories={categories}
                        sortDirection={sortDirection}
                        onToggleSortDirection={() =>
                            setSortDirection((current) => (current === "asc" ? "desc" : "asc"))
                        }
                        jobSearch={jobSearch}
                        onJobSearchChange={setJobSearch}
                        jobRemoteFilter={jobRemoteFilter}
                        onJobRemoteFilterChange={setJobRemoteFilter}
                    />
                </div>
            </div>

            <div className="px-1 py-4 md:px-2 md:py-5">
                {activeTab === "articles" ? (
                    <CurateArticlesTable
                        targetNewsletterTitle={targetNewsletter?.title ?? null}
                        hasTargetNewsletter={Boolean(targetNewsletter)}
                        selectedArticleIds={selectedArticleIds}
                        addSelectedArticlesToNewsletter={addSelectedArticlesToNewsletter}
                        actionError={actionError}
                        isLoading={isLoading}
                        error={error}
                        visibleArticles={visibleArticles}
                        applySort={applySort}
                        isArticleSelected={isArticleSelected}
                        toggleArticleSelection={toggleArticleSelection}
                        addArticleToNewsletter={addArticleToNewsletter}
                        addingArticleIds={addingArticleIds}
                        isArticleInTargetNewsletter={isArticleInTargetNewsletter}
                    />
                ) : (
                    <CurateJobsTable
                        targetNewsletterTitle={targetNewsletter?.title ?? null}
                        hasTargetNewsletter={Boolean(targetNewsletter)}
                        actionError={actionError}
                        isLoading={isLoading}
                        error={error}
                        jobs={visibleJobs}
                        addJobToNewsletter={addJobToNewsletter}
                        addingJobIds={addingJobIds}
                        isJobInTargetNewsletter={isJobInTargetNewsletter}
                    />
                )}
            </div>
        </section>
    );
}
