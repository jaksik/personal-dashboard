"use client";

import { Fragment, useMemo, type ReactElement } from "react";
import Image from "next/image";
import type { PublishContextArticle, PublishContextJob, PublishStockRecap } from "../actions";
import { getPublishHtmlSectionOrder } from "@/app/newsletter/publish/components/payload/publishPayloadBuilder";
import {
  publishPayloadConfig,
  type PublishPayloadSection,
} from "@/app/newsletter/publish/components/payload/publishPayloadConfig";
import {
  getArticleDisplayDescription,
  getCategoryHeaderLabel,
  getArticleDisplayTitle,
  getJobDisplayTitle,
  groupArticlesByCategory,
  toSafeHttpUrl,
} from "@/app/newsletter/publish/components/payload/publishPayloadUtils";

type PublishPreviewPanelProps = {
  title: string | null;
  subTitle: string | null;
  coverImage: string | null;
  articles: PublishContextArticle[];
  jobs: PublishContextJob[];
  stockRecaps: PublishStockRecap[];
};

export default function PublishPreviewPanel({
  title,
  subTitle,
  coverImage,
  articles,
  jobs,
  stockRecaps,
}: PublishPreviewPanelProps) {
  const groupedArticles = useMemo(
    () =>
      groupArticlesByCategory(articles, publishPayloadConfig).map((group) => ({
        category: group.category,
        items: group.articles,
      })),
    [articles]
  );

  const orderedSections = useMemo<ReactElement[]>(() => {
    const { order, includesTitle, includesSubtitle, firstHeaderIndex } =
      getPublishHtmlSectionOrder(publishPayloadConfig);
    const typedOrder = order as PublishPayloadSection[];
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

    function renderStockRecapsTable() {
      if (stockRecaps.length === 0) {
        return null;
      }

      function formatCategoryChangePercent(value: number | null) {
        if (value == null) {
          return null;
        }

        const rounded = Number.isInteger(value)
          ? String(value)
          : value.toFixed(2).replace(/\.00$/, "");
        const sign = value > 0 ? "+" : "";
        return `${sign}${rounded}%`;
      }

      function getStockRecapDisplayCategory(category: string) {
        return publishPayloadConfig.stockRecapCategoryLabelOverrides[category] ?? category;
      }

      function getToneClassName(value: number | null) {
        if (value == null) {
          return "text-foreground/50";
        }

        if (value > 0) {
          return "text-green-500";
        }

        if (value < 0) {
          return "text-red-500";
        }

        return "text-foreground/50";
      }

      const rows = [...stockRecaps];
      const orderMode = publishPayloadConfig.stockRecapCategoryOrder.mode;
      const customOrder = publishPayloadConfig.stockRecapCategoryOrder.customOrder;

      if (orderMode === "custom" && customOrder.length > 0) {
        const customOrderIndex = new Map(customOrder.map((category, index) => [category, index]));

        rows.sort((left, right) => {
          const leftIndex = customOrderIndex.get(left.category);
          const rightIndex = customOrderIndex.get(right.category);

          if (leftIndex !== undefined && rightIndex !== undefined && leftIndex !== rightIndex) {
            return leftIndex - rightIndex;
          }

          if (leftIndex !== undefined && rightIndex === undefined) {
            return -1;
          }

          if (leftIndex === undefined && rightIndex !== undefined) {
            return 1;
          }

          return left.category.localeCompare(right.category);
        });
      } else {
        rows.sort((left, right) => left.category.localeCompare(right.category));
      }

      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="border border-foreground/20 px-2 py-1.5 font-semibold">Sector</th>
                <th className="border border-foreground/20 px-2 py-1.5 font-semibold">Leader Ticker</th>
                <th className="border border-foreground/20 px-2 py-1.5 font-semibold">Laggard Ticker</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`${row.created_at}-${row.category}-${rowIndex}`}>
                  <td className="border border-foreground/20 px-2 py-1.5">
                    {getStockRecapDisplayCategory(row.category)}
                    {(() => {
                      const categoryChange = formatCategoryChangePercent(row.category_change);

                      if (!categoryChange) {
                        return null;
                      }

                      const toneClassName = getToneClassName(row.category_change);

                      return <span className={`ml-1 font-medium ${toneClassName}`}>{categoryChange}</span>;
                    })()}
                  </td>
                  <td className="border border-foreground/20 px-2 py-1.5">
                    {row.leader_ticker}
                    {(() => {
                      const leaderChange = formatCategoryChangePercent(row.leader_change);

                      if (!leaderChange) {
                        return null;
                      }

                      const toneClassName = getToneClassName(row.leader_change);
                      return <span className={`ml-1 font-medium ${toneClassName}`}>{leaderChange}</span>;
                    })()}
                  </td>
                  <td className="border border-foreground/20 px-2 py-1.5">
                    {row.laggard_ticker}
                    {(() => {
                      const laggardChange = formatCategoryChangePercent(row.laggard_change);

                      if (!laggardChange) {
                        return null;
                      }

                      const toneClassName = getToneClassName(row.laggard_change);
                      return <span className={`ml-1 font-medium ${toneClassName}`}>{laggardChange}</span>;
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return typedOrder
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
            <Image
              key={`cover-image-${index}`}
              src={coverImage}
              alt="Newsletter cover preview"
              width={1200}
              height={560}
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
                        {group.category.trim().toLowerCase() === "economy" ? renderStockRecapsTable() : null}
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
          .filter((section): section is ReactElement => section !== null);
  }, [coverImage, groupedArticles, jobs, stockRecaps, subTitle, title]);

  return (
    <div className="space-y-3 rounded-xl border border-foreground/15 bg-foreground/2 p-3">
      {orderedSections.map((section, index) => (
        <Fragment key={index}>{section}</Fragment>
      ))}
    </div>
  );
}
