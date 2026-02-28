import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import {
    addArticleToNewsletterAction,
    addJobToNewsletterAction,
    removeArticleFromNewsletterAction,
    updateArticleCategoryAction,
    updateArticleDocumentAction,
    updateJobDocumentAction,
} from "../actions";
import { normalizeNullable } from "./curateHelpers";
import type { ArticleRow, JobPostingRow } from "./types";

type TargetNewsletter = {
    id: number;
    title: string | null;
} | null;

type UseCurateMutationsParams = {
    articles: ArticleRow[];
    setArticles: Dispatch<SetStateAction<ArticleRow[]>>;
    jobPostings: JobPostingRow[];
    setJobPostings: Dispatch<SetStateAction<JobPostingRow[]>>;
    targetNewsletter: TargetNewsletter;
    setActionError: Dispatch<SetStateAction<string | null>>;
};

export default function useCurateMutations({
    articles,
    setArticles,
    jobPostings,
    setJobPostings,
    targetNewsletter,
    setActionError,
}: UseCurateMutationsParams) {
    const [addingArticleIds, setAddingArticleIds] = useState<number[]>([]);
    const [updatingCategoryArticleIds, setUpdatingCategoryArticleIds] = useState<number[]>([]);
    const [updatingArticleDocumentIds, setUpdatingArticleDocumentIds] = useState<number[]>([]);
    const [addingJobIds, setAddingJobIds] = useState<number[]>([]);
    const [updatingJobDocumentIds, setUpdatingJobDocumentIds] = useState<number[]>([]);

    async function addArticleToNewsletter(articleId: number) {
        const article = articles.find((item) => item.id === articleId);
        if (!article) {
            return;
        }

        const isAssociated = article.newsletter_id !== null;

        if (!isAssociated && !targetNewsletter) {
            setActionError("No newsletter found in the last 12 hours to attach articles to.");
            return;
        }

        setActionError(null);
        setAddingArticleIds((current) => [...current, articleId]);

        try {
            if (isAssociated) {
                await removeArticleFromNewsletterAction(articleId);
            } else {
                await addArticleToNewsletterAction(targetNewsletter!.id, articleId);
            }

            setArticles((current) =>
                current.map((nextArticle) =>
                    nextArticle.id === articleId
                        ? {
                              ...nextArticle,
                              newsletter_id: isAssociated ? null : targetNewsletter!.id,
                          }
                        : nextArticle
                )
            );
        } catch (updateError) {
            setActionError(
                updateError instanceof Error ? updateError.message : "Failed to add article."
            );
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
            setUpdatingCategoryArticleIds((current) => current.filter((id) => id !== articleId));
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
                current.map((article) => (article.id === articleId ? previousArticle : article))
            );
            setActionError(
                updateError instanceof Error ? updateError.message : "Failed to update article."
            );
            throw updateError;
        } finally {
            setUpdatingArticleDocumentIds((current) => current.filter((id) => id !== articleId));
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
                    job.id === jobId ? { ...job, newsletter_id: targetNewsletter.id } : job
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
                updateError instanceof Error ? updateError.message : "Failed to update job."
            );
            throw updateError;
        } finally {
            setUpdatingJobDocumentIds((current) => current.filter((id) => id !== jobId));
        }
    }

    return {
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
    };
}
