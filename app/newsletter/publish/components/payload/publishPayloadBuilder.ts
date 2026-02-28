import type {
  PublishContextArticle,
  PublishContextJob,
  PublishContextNewsletter,
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
    const categoriesHtml = groupedArticles
      .map((group) => {
        const headingLabel = getCategoryHeaderLabel(group.category, config);
        const heading = `<h3 style="${config.htmlStyles.categoryHeading}">${escapeHtml(headingLabel)}</h3>`;
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

        const categoryBlock = `${heading}<div style="${config.htmlStyles.categoryContainer}">${items}</div>`;
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
  config: PublishPayloadConfig
) {
  const groupedArticles = groupArticlesByCategory(articles, config);
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
  config?: PublishPayloadConfig;
}) {
  const { newsletter, articles, jobs, config = publishPayloadConfig } = params;

  const htmlBody = buildHtmlSections(newsletter, articles, jobs, config);
  const htmlPayload = `
<section style="${config.htmlStyles.section}">
  ${htmlBody}
</section>
`.trim();

  const plainTextPayload = buildPlainTextSections(newsletter, articles, jobs, config);

  return {
    htmlPayload,
    plainTextPayload,
  };
}
