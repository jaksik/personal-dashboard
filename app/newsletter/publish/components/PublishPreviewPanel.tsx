"use client";

import { Fragment, useMemo } from "react";
import type { PublishContextArticle, PublishContextJob } from "../actions";
import { getPublishHtmlSectionOrder } from "./payload/publishPayloadBuilder";
import { publishPayloadConfig } from "./payload/publishPayloadConfig";
import {
  getArticleDisplayDescription,
  getCategoryHeaderLabel,
  getArticleDisplayTitle,
  getJobDisplayTitle,
  groupArticlesByCategory,
  toSafeHttpUrl,
} from "./payload/publishPayloadUtils";

type PublishPreviewPanelProps = {
  title: string | null;
  subTitle: string | null;
  coverImage: string | null;
  articles: PublishContextArticle[];
  jobs: PublishContextJob[];
};

export default function PublishPreviewPanel({
  title,
  subTitle,
  coverImage,
  articles,
  jobs,
}: PublishPreviewPanelProps) {
  const groupedArticles = useMemo(
    () =>
      groupArticlesByCategory(articles, publishPayloadConfig).map((group) => ({
        category: group.category,
        items: group.articles,
      })),
    [articles]
  );

  const orderedSections = useMemo(() => {
    const { order, includesTitle, includesSubtitle, firstHeaderIndex } =
      getPublishHtmlSectionOrder(publishPayloadConfig);
    const inlineJobsAfterCategory =
      publishPayloadConfig.jobsPlacement.mode === "afterCategory" && jobs.length > 0;
    const targetInlineCategory =
      publishPayloadConfig.jobsPlacement.afterCategory?.trim().toLowerCase() ?? "";
    const inlineInsertIndex = inlineJobsAfterCategory
      ? groupedArticles.findIndex(
          (group) => group.category.trim().toLowerCase() === targetInlineCategory
        )
      : -1;
    const shouldInlineAtEnd = inlineJobsAfterCategory && inlineInsertIndex === -1;

    function renderJobsSection(key: string) {
      return (
        <div key={key} className="space-y-2 rounded-md border border-foreground/15 p-3">
          <p className="app-text-muted text-center text-base font-semibold tracking-wide">
            {publishPayloadConfig.labels.aiJobsHeading}
          </p>
          {jobs.length === 0 ? (
            <p className="app-text-muted text-sm">{publishPayloadConfig.labels.noJobsFallback}</p>
          ) : (
            <ul className="space-y-1">
              {jobs.map((job) => {
                const title = getJobDisplayTitle(job, publishPayloadConfig);
                const safeUrl = toSafeHttpUrl(job.apply_link);

                return (
                  <li key={job.id} className="text-md">
                    {safeUrl ? (
                      <a
                        href={safeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {title}
                      </a>
                    ) : (
                      title
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      );
    }

    return order
      .map((sectionId, index) => {
        if (sectionId === "title" || sectionId === "subtitle") {
          if (index !== firstHeaderIndex) {
            return null;
          }

          return (
            <div key={`header-${index}`} className="rounded-md bg-foreground/10 px-3 py-2">
              {includesTitle ? (
                <p className="text-lg font-semibold">
                  {title ?? publishPayloadConfig.labels.newsletterTitleFallback}
                </p>
              ) : null}
              {includesSubtitle ? (
                <p className="app-text-muted text-base">
                  {subTitle ?? publishPayloadConfig.labels.newsletterSubtitleFallback}
                </p>
              ) : null}
            </div>
          );
        }

        if (sectionId === "coverImage") {
          return coverImage ? (
            <img
              key={`cover-image-${index}`}
              src={coverImage}
              alt="Newsletter cover preview"
              className="h-70 w-full rounded-md object-cover"
            />
          ) : (
            <div
              key={`cover-image-placeholder-${index}`}
              className="h-28 rounded-md border border-dashed border-foreground/25"
            />
          );
        }

        if (sectionId === "categories") {
          return (
            <div key={`categories-${index}`} className="space-y-2 rounded-md border border-foreground/15 p-3">
              {groupedArticles.length === 0 ? (
                <p className="app-text-muted text-sm">No associated articles yet.</p>
              ) : (
                <div className="space-y-3">
                  {groupedArticles.map((group, groupIndex) => (
                    <Fragment key={group.category}>
                      <div className="space-y-1">
                        <p className="app-text-muted text-center text-base font-semibold tracking-wide">
                          {getCategoryHeaderLabel(group.category, publishPayloadConfig)}
                        </p>
                        <ul className="space-y-1">
                          {group.items.map((article) => (
                            <li key={article.id} className="text-md">
                              {(() => {
                                const title = getArticleDisplayTitle(article, publishPayloadConfig);
                                const description = getArticleDisplayDescription(
                                  article,
                                  publishPayloadConfig
                                );
                                const safeUrl = toSafeHttpUrl(article.url);

                                return safeUrl ? (
                                  <>
                                    <a
                                      href={safeUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="underline"
                                    >
                                      {title}
                                    </a>
                                    {description ? (
                                      <p className="app-text-muted text-sm leading-snug">{description}</p>
                                    ) : null}
                                  </>
                                ) : (
                                  <>
                                    {title}
                                    {description ? (
                                      <p className="app-text-muted text-sm leading-snug">{description}</p>
                                    ) : null}
                                  </>
                                );
                              })()}
                            </li>
                          ))}
                        </ul>
                      </div>
                      {inlineJobsAfterCategory && groupIndex === inlineInsertIndex
                        ? renderJobsSection(`ai-jobs-inline-${index}-${groupIndex}`)
                        : null}
                    </Fragment>
                  ))}
                  {shouldInlineAtEnd ? renderJobsSection(`ai-jobs-inline-end-${index}`) : null}
                </div>
              )}
            </div>
          );
        }

        if (sectionId === "aiJobs") {
          if (inlineJobsAfterCategory) {
            return null;
          }

          return renderJobsSection(`ai-jobs-${index}`);
        }

        return null;
      })
      .filter(Boolean);
  }, [coverImage, groupedArticles, jobs, subTitle, title]);

  return (
    <div className="space-y-3 rounded-xl border border-foreground/15 bg-foreground/2 p-3">
      {orderedSections.map((section, index) => (
        <Fragment key={index}>{section}</Fragment>
      ))}
    </div>
  );
}
