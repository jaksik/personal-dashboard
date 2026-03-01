import type {
  PublishContextArticle,
  PublishContextJob,
  PublishContextNewsletter,
  PublishStockRecap,
} from "../../actions";
import {
  publishPayloadConfig,
  type PublishPayloadConfig,
  type PublishPayloadSection,
} from "@/app/newsletter/publish/components/payload/publishPayloadConfig";
import {
  getArticleDisplayDescription,
  getCategoryHeaderLabel,
  escapeHtml,
  getArticleDisplayTitle,
  getJobDisplayTitle,
  groupArticlesByCategory,
  toSafeHttpUrl,
} from "@/app/newsletter/publish/components/payload/publishPayloadUtils";

function sortStockRecapsByConfig(stockRecaps: PublishStockRecap[], config: PublishPayloadConfig) {
  const rows = [...stockRecaps];
  const orderMode = config.stockRecapCategoryOrder.mode;
  const customOrder = config.stockRecapCategoryOrder.customOrder;

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

    return rows;
  }

  rows.sort((left, right) => left.category.localeCompare(right.category));
  return rows;
}

function getStockRecapDisplayCategory(category: string, config: PublishPayloadConfig) {
  return config.stockRecapCategoryLabelOverrides[category] ?? category;
}

function formatSignedPercent(value: number | null) {
  if (value == null) {
    return null;
  }

  const rounded = Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.00$/, "");
  const sign = value > 0 ? "+" : "";
  return `${sign}${rounded}%`;
}

function getPercentColor(value: number | null) {
  if (value == null) {
    return "#6b7280";
  }

  if (value > 0) {
    return "#16a34a";
  }

  if (value < 0) {
    return "#dc2626";
  }

  return "#6b7280";
}

export function getPublishHtmlSectionOrder(config: PublishPayloadConfig) {
  const order: PublishPayloadSection[] = config.sectionOrder.html;

  return {
    order,
    includesTitle: order.includes("title"),
    includesSubtitle: order.includes("subtitle"),
    firstHeaderIndex: order.findIndex(
      (sectionId) => sectionId === "title" || sectionId === "subtitle"
    ),
  };
}

function buildHtmlSections(
  newsletter: PublishContextNewsletter,
  articles: PublishContextArticle[],
  jobs: PublishContextJob[],
  stockRecaps: PublishStockRecap[],
  config: PublishPayloadConfig
) {
  const { order } = getPublishHtmlSectionOrder(config);
  const typedOrder: PublishPayloadSection[] = order;
  const groupedArticles = groupArticlesByCategory(articles, config);

  const title = escapeHtml(newsletter.title ?? config.labels.newsletterTitleFallback);
  const subtitle = escapeHtml(newsletter.sub_title ?? config.labels.newsletterSubtitleFallback);

  const jobsHtml = jobs
    .map((job) => {
      const title = escapeHtml(getJobDisplayTitle(job, config));
      const safeUrl = toSafeHttpUrl(job.apply_link);
      const content = safeUrl
        ? `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" style="${config.htmlStyles.articleLink}">${title}</a>`
        : title;

      return `<p style="${config.htmlStyles.articleItem}">${content}</p>`;
    })
    .join("");

  const jobsSectionHtml = jobs.length
    ? `<h3 style="${config.htmlStyles.categoryHeading}">${escapeHtml(config.labels.aiJobsHeading)}</h3><div style="${config.htmlStyles.categoryContainer}">${jobsHtml}</div>`
    : "";

  const inlineJobsAfterCategory =
    config.jobsPlacement.mode === "afterCategory" && jobs.length > 0;
  const targetInlineCategory = (config.jobsPlacement.afterCategory ?? "").trim().toLowerCase();
  let jobsInjectedInCategories = false;

  const groupHtmlWithJobs = (() => {
    const stockRecapRows = sortStockRecapsByConfig(stockRecaps, config);

    const stockRecapsTableHtml = stockRecapRows.length
      ? `<table style="width:100%;border-collapse:collapse;margin:8px 0 12px 0;font-size:14px;"><thead><tr><th style="border:1px solid #d1d5db;padding:6px 8px;text-align:left;">Sector</th><th style="border:1px solid #d1d5db;padding:6px 8px;text-align:left;">Leader Ticker</th><th style="border:1px solid #d1d5db;padding:6px 8px;text-align:left;">Laggard Ticker</th></tr></thead><tbody>${stockRecapRows
          .map(
            (row) => {
              const displayCategory = getStockRecapDisplayCategory(row.category, config);
              const categoryChange = formatSignedPercent(row.category_change);
              const categoryChangeColor = getPercentColor(row.category_change);
              const leaderChange = formatSignedPercent(row.leader_change);
              const leaderChangeColor = getPercentColor(row.leader_change);
              const laggardChange = formatSignedPercent(row.laggard_change);
              const laggardChangeColor = getPercentColor(row.laggard_change);
              const sectorWithChange = categoryChange
                ? `${escapeHtml(displayCategory)} <span style="color:${categoryChangeColor};font-weight:600;">${escapeHtml(categoryChange)}</span>`
                : escapeHtml(displayCategory);
              const leaderWithChange = leaderChange
                ? `${escapeHtml(row.leader_ticker)} <span style="color:${leaderChangeColor};font-weight:600;">${escapeHtml(leaderChange)}</span>`
                : escapeHtml(row.leader_ticker);
              const laggardWithChange = laggardChange
                ? `${escapeHtml(row.laggard_ticker)} <span style="color:${laggardChangeColor};font-weight:600;">${escapeHtml(laggardChange)}</span>`
                : escapeHtml(row.laggard_ticker);

              return `<tr><td style="border:1px solid #d1d5db;padding:6px 8px;">${sectorWithChange}</td><td style="border:1px solid #d1d5db;padding:6px 8px;">${leaderWithChange}</td><td style="border:1px solid #d1d5db;padding:6px 8px;">${laggardWithChange}</td></tr>`;
            }
          )
          .join("")}</tbody></table>`
      : "";

    const categoriesHtml = groupedArticles
      .map((group) => {
        const headingLabel = getCategoryHeaderLabel(group.category, config);
        const heading = `<h3 style="${config.htmlStyles.categoryHeading}">${escapeHtml(headingLabel)}</h3>`;
        const shouldRenderStockRecapTable =
          group.category.trim().toLowerCase() === "economy" && stockRecapsTableHtml.length > 0;
        const items = group.articles
          .map((article) => {
            const text = escapeHtml(getArticleDisplayTitle(article, config));
            const description = getArticleDisplayDescription(article, config);
            const safeUrl = toSafeHttpUrl(article.url);
            const content = safeUrl
              ? `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" style="${config.htmlStyles.articleLink}">${text}</a>`
              : text;

            if (!description) {
              return `<p style="${config.htmlStyles.articleItem}">${content}</p>`;
            }

            return `<div style="${config.htmlStyles.articleItem}">${content}<p style="${config.htmlStyles.articleDescription}">${escapeHtml(description)}</p></div>`;
          })
          .join("");

        const categoryBlock = `${heading}${shouldRenderStockRecapTable ? stockRecapsTableHtml : ""}<div style="${config.htmlStyles.categoryContainer}">${items}</div>`;
        const isInlineTarget =
          inlineJobsAfterCategory && group.category.trim().toLowerCase() === targetInlineCategory;

        if (isInlineTarget) {
          jobsInjectedInCategories = true;
          return `${categoryBlock}${jobsSectionHtml}`;
        }

        return categoryBlock;
      })
      .join("");

    if (inlineJobsAfterCategory && !jobsInjectedInCategories) {
      return `${categoriesHtml}${jobsSectionHtml}`;
    }

    return categoriesHtml;
  })();

  const sections: Record<PublishPayloadSection, string> = {
    title: `<h1 style="${config.htmlStyles.title}">${title}</h1>`,
    subtitle: newsletter.sub_title
      ? `<p style="${config.htmlStyles.subtitle}">${subtitle}</p>`
      : "",
    coverImage: newsletter.cover_image
      ? `<img src="${escapeHtml(newsletter.cover_image)}" alt="${title}" style="${config.htmlStyles.coverImage}"/>`
      : "",
    categories: groupHtmlWithJobs,
    aiJobs: inlineJobsAfterCategory ? "" : jobsSectionHtml,
  };

  return typedOrder
    .map((sectionId) => sections[sectionId])
    .filter(Boolean)
    .join("\n  ");
}

function buildPlainTextSections(
  newsletter: PublishContextNewsletter,
  articles: PublishContextArticle[],
  jobs: PublishContextJob[],
  stockRecaps: PublishStockRecap[],
  config: PublishPayloadConfig
) {
  const groupedArticles = groupArticlesByCategory(articles, config);
  const stockRecapRows = sortStockRecapsByConfig(stockRecaps, config);
  const inlineJobsAfterCategory =
    config.jobsPlacement.mode === "afterCategory" && jobs.length > 0;
  const targetInlineCategory = (config.jobsPlacement.afterCategory ?? "").trim().toLowerCase();
  let jobsInjectedInCategories = false;

  const aiJobsLines = jobs.length
    ? [
        config.labels.aiJobsHeading,
        ...jobs.map((job) => {
          const title = getJobDisplayTitle(job, config);
          const safeUrl = toSafeHttpUrl(job.apply_link);
          return safeUrl ? `${title} (${safeUrl})` : title;
        }),
        "",
      ]
    : [];

  const sections: Record<PublishPayloadSection, string[]> = {
    title: [newsletter.title ?? config.labels.newsletterTitleFallback],
    subtitle: newsletter.sub_title ? [newsletter.sub_title] : [],
    coverImage: newsletter.cover_image
      ? [`${config.labels.coverImagePlainTextPrefix}: ${newsletter.cover_image}`]
      : [],
    categories: groupedArticles.flatMap((group) => {
      const lines = [getCategoryHeaderLabel(group.category, config)];

      if (group.category.trim().toLowerCase() === "economy" && stockRecapRows.length > 0) {
        lines.push("Sector | Leader Ticker | Laggard Ticker");
        lines.push(
          ...stockRecapRows.map((row) => {
            const displayCategory = getStockRecapDisplayCategory(row.category, config);
            const categoryChange = formatSignedPercent(row.category_change);
            const leaderChange = formatSignedPercent(row.leader_change);
            const laggardChange = formatSignedPercent(row.laggard_change);
            const sectorWithChange = categoryChange
              ? `${displayCategory} ${categoryChange}`
              : displayCategory;
            const leaderWithChange = leaderChange ? `${row.leader_ticker} ${leaderChange}` : row.leader_ticker;
            const laggardWithChange = laggardChange
              ? `${row.laggard_ticker} ${laggardChange}`
              : row.laggard_ticker;
            return `${sectorWithChange} | ${leaderWithChange} | ${laggardWithChange}`;
          })
        );
        lines.push("");
      }

      for (const article of group.articles) {
        const title = getArticleDisplayTitle(article, config);
        const description = getArticleDisplayDescription(article, config);
        const safeUrl = toSafeHttpUrl(article.url);

        if (safeUrl) {
          lines.push(`${title} (${safeUrl})`);
        } else {
          lines.push(title);
        }

        if (description) {
          lines.push(`  ${description}`);
        }
      }

      lines.push("");

      if (inlineJobsAfterCategory && group.category.trim().toLowerCase() === targetInlineCategory) {
        lines.push(...aiJobsLines);
        jobsInjectedInCategories = true;
      }

      return lines;
    }),
    aiJobs: inlineJobsAfterCategory ? [] : aiJobsLines,
  };

  if (inlineJobsAfterCategory && !jobsInjectedInCategories && aiJobsLines.length > 0) {
    sections.categories = [...sections.categories, ...aiJobsLines];
  }

  const plainTextOrder: PublishPayloadSection[] = config.sectionOrder.plainText;

  return plainTextOrder
    .flatMap((sectionId) => {
      const lines = sections[sectionId];
      return lines.length > 0 ? [...lines, ""] : [];
    })
    .join("\n")
    .trim();
}

export function buildPublishPayloads(params: {
  newsletter: PublishContextNewsletter;
  articles: PublishContextArticle[];
  jobs: PublishContextJob[];
  stockRecaps: PublishStockRecap[];
  config?: PublishPayloadConfig;
}) {
  const { newsletter, articles, jobs, stockRecaps, config = publishPayloadConfig } = params;

  const htmlBody = buildHtmlSections(newsletter, articles, jobs, stockRecaps, config);
  const htmlPayload = `
<section style="${config.htmlStyles.section}">
  ${htmlBody}
</section>
`.trim();

  const plainTextPayload = buildPlainTextSections(newsletter, articles, jobs, stockRecaps, config);

  return {
    htmlPayload,
    plainTextPayload,
  };
}
