"use client";

import { useEffect, useMemo, useState } from "react";
import ModalShell from "@/components/ui/ModalShell";
import { createClient } from "@/utils/supabase/client";
import ArticlesTable from "./ArticlesTable";
import CurateTopTabs from "./CurateTopTabs";
import JobsTable from "./JobsTable";
import { useSelectedNewsletterId } from "@/components/BeeHiiv/useSelectedNewsletterId";
import type { ArticleRow, CurateTab, JobPostingRow, SortKey } from "./types";

export default function BeeHiivCurateModal() {
  const { selectedNewsletterId } = useSelectedNewsletterId();
  const [activeTab, setActiveTab] = useState<CurateTab>("articles");
  const [isOpen, setIsOpen] = useState(false);
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [jobPostings, setJobPostings] = useState<JobPostingRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [selectedArticleIds, setSelectedArticleIds] = useState<number[]>([]);
  const [addingArticleIds, setAddingArticleIds] = useState<number[]>([]);
  const [addingJobIds, setAddingJobIds] = useState<number[]>([]);
  const [targetNewsletter, setTargetNewsletter] = useState<{
    id: number;
    title: string | null;
  } | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    async function loadArticles() {
      setIsLoading(true);
      setError(null);
      setActionError(null);
      setSelectedArticleIds([]);
      setActiveTab("articles");

      const supabase = createClient();
      const cutoff = new Date(new Date().getTime() - 12 * 60 * 60 * 1000).toISOString();

      const [
        { data: articleData, error: articleError },
        { data: selectedNewsletter, error: newsletterError },
        { data: jobsData, error: jobsError },
      ] = await Promise.all([
        supabase
          .from("articles")
          .select(
            "id, title_snippet, title, description, category, publisher, published_at, created_at, source, newsletter_id"
          )
          .order("created_at", { ascending: false })
          .limit(150),
        supabase
          .from("newsletters")
          .select("id, title, created_at")
          .eq("id", selectedNewsletterId ?? -1)
          .order("created_at", { ascending: false })
          .limit(1),
        supabase
          .from("job_postings")
          .select(
            "id, title, description, company, location, remote, posted_date, created_at, apply_link, newsletter_id"
          )
          .order("created_at", { ascending: false })
          .limit(150),
      ]);

      if (articleError) {
        setError(articleError.message);
        setIsLoading(false);
        return;
      }

      if (newsletterError) {
        setError(newsletterError.message);
        setIsLoading(false);
        return;
      }

      if (jobsError) {
        setError(jobsError.message);
        setIsLoading(false);
        return;
      }

      let resolvedNewsletter = selectedNewsletter?.[0] ?? null;

      if (!resolvedNewsletter) {
        const { data: fallbackNewsletters, error: fallbackNewsletterError } = await supabase
          .from("newsletters")
          .select("id, title, created_at")
          .gte("created_at", cutoff)
          .order("created_at", { ascending: false })
          .limit(1);

        if (fallbackNewsletterError) {
          setError(fallbackNewsletterError.message);
          setIsLoading(false);
          return;
        }

        resolvedNewsletter = fallbackNewsletters?.[0] ?? null;
      }

      setTargetNewsletter(
        resolvedNewsletter
          ? { id: resolvedNewsletter.id, title: resolvedNewsletter.title }
          : null
      );

      setArticles(articleData ?? []);
      setJobPostings(jobsData ?? []);
      setIsLoading(false);
    }

    loadArticles();
  }, [isOpen, selectedNewsletterId]);

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
    const loweredSearch = searchTerm.trim().toLowerCase();

    const filtered = articles.filter((article) => {
      const matchesCategory =
        categoryFilter === "all" || article.category === categoryFilter;

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
  }, [articles, categoryFilter, searchTerm, sortDirection, sortKey]);

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

    const supabase = createClient();
    const { error } = await supabase
      .from("articles")
      .update({ newsletter_id: targetNewsletter.id })
      .eq("id", articleId);

    setAddingArticleIds((current) => current.filter((id) => id !== articleId));

    if (error) {
      setActionError(error.message);
      return;
    }

    setArticles((current) =>
      current.map((article) =>
        article.id === articleId
          ? { ...article, newsletter_id: targetNewsletter.id }
          : article
      )
    );
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

    const supabase = createClient();
    const { error } = await supabase
      .from("articles")
      .update({ newsletter_id: targetNewsletter.id })
      .in("id", selectedArticleIds);

    setAddingArticleIds((current) =>
      current.filter((id) => !selectedArticleIds.includes(id))
    );

    if (error) {
      setActionError(error.message);
      return;
    }

    const selectedSet = new Set(selectedArticleIds);

    setArticles((current) =>
      current.map((article) =>
        selectedSet.has(article.id)
          ? { ...article, newsletter_id: targetNewsletter.id }
          : article
      )
    );
    setSelectedArticleIds([]);
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

    const supabase = createClient();
    const { error } = await supabase
      .from("job_postings")
      .update({ newsletter_id: targetNewsletter.id })
      .eq("id", jobId);

    setAddingJobIds((current) => current.filter((id) => id !== jobId));

    if (error) {
      setActionError(error.message);
      return;
    }

    setJobPostings((current) =>
      current.map((job) =>
        job.id === jobId
          ? { ...job, newsletter_id: targetNewsletter.id }
          : job
      )
    );
  }

  return (
    <>
      <div className="flex justify-start">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="app-btn-ghost inline-flex h-9 items-center rounded-md px-4 text-md font-semibold tracking-wide shadow-sm transition hover:-translate-y-px hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30"
        >
          Curate
        </button>
      </div>

      <ModalShell
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Newsletter Curation Workspace"
        description="Browse and curate article and job candidates for newsletter publishing."
        headerLeft={<CurateTopTabs activeTab={activeTab} onChange={setActiveTab} />}
        headerLeftAlignment="center"
        maxWidthClassName="max-w-6xl"
      >
        <div className="space-y-4">
          {activeTab === "articles" ? (
            <ArticlesTable
              targetNewsletterTitle={targetNewsletter?.title ?? null}
              hasTargetNewsletter={Boolean(targetNewsletter)}
              selectedArticleIds={selectedArticleIds}
              addSelectedArticlesToNewsletter={addSelectedArticlesToNewsletter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              categories={categories}
              sortDirection={sortDirection}
              setSortDirection={setSortDirection}
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
            <JobsTable
              targetNewsletterTitle={targetNewsletter?.title ?? null}
              hasTargetNewsletter={Boolean(targetNewsletter)}
              actionError={actionError}
              isLoading={isLoading}
              error={error}
              jobs={jobPostings}
              addJobToNewsletter={addJobToNewsletter}
              addingJobIds={addingJobIds}
              isJobInTargetNewsletter={isJobInTargetNewsletter}
            />
          )}
        </div>
      </ModalShell>
    </>
  );
}