import type { PublishContextArticle, PublishContextJob } from "../../actions";
import type { PublishPayloadConfig } from "./publishPayloadConfig";

export type PublishArticleGroup = {
  category: string;
  articles: PublishContextArticle[];
};

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function toSafeHttpUrl(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

export function groupArticlesByCategory(
  articles: PublishContextArticle[],
  config: PublishPayloadConfig
): PublishArticleGroup[] {
  const grouped = new Map<string, PublishContextArticle[]>();

  for (const article of articles) {
    const category = article.category?.trim() || config.labels.uncategorizedFallback;
    const current = grouped.get(category) ?? [];
    current.push(article);
    grouped.set(category, current);
  }

  const entries = Array.from(grouped.entries());

  if (config.categoryOrder.mode === "custom" && config.categoryOrder.customOrder.length > 0) {
    const customOrderIndex = new Map(
      config.categoryOrder.customOrder.map((category, index) => [category, index])
    );

    entries.sort(([left], [right]) => {
      const leftIndex = customOrderIndex.get(left);
      const rightIndex = customOrderIndex.get(right);

      if (leftIndex !== undefined && rightIndex !== undefined && leftIndex !== rightIndex) {
        return leftIndex - rightIndex;
      }

      if (leftIndex !== undefined && rightIndex === undefined) {
        return -1;
      }

      if (leftIndex === undefined && rightIndex !== undefined) {
        return 1;
      }

      return left.localeCompare(right);
    });
  } else {
    entries.sort(([left], [right]) => left.localeCompare(right));
  }

  return entries.map(([category, groupedArticles]) => ({
    category,
    articles: groupedArticles,
  }));
}

export function getArticleDisplayTitle(
  article: Pick<PublishContextArticle, "title_snippet" | "title">,
  config: PublishPayloadConfig
) {
  return article.title_snippet ?? article.title ?? config.labels.untitledArticleFallback;
}

export function getCategoryHeaderLabel(category: string, config: PublishPayloadConfig) {
  const trimmedCategory = category.trim();

  if (!trimmedCategory) {
    return config.labels.uncategorizedFallback;
  }

  return config.labels.categoryHeaderOverrides[trimmedCategory] ?? trimmedCategory;
}

export function getArticleDisplayDescription(
  article: Pick<PublishContextArticle, "description" | "category">,
  config: PublishPayloadConfig
) {
  if (!config.articleContent.showDescription) {
    return null;
  }

  const category = article.category?.trim() || config.labels.uncategorizedFallback;
  const configuredCategories = new Set(
    config.articleContent.descriptionCategories.categories
      .map((configuredCategory) => configuredCategory.trim())
      .filter(Boolean)
  );

  if (config.articleContent.descriptionCategories.mode === "only") {
    if (!configuredCategories.has(category)) {
      return null;
    }
  }

  if (config.articleContent.descriptionCategories.mode === "except") {
    if (configuredCategories.has(category)) {
      return null;
    }
  }

  const rawDescription = article.description?.trim() ?? "";
  let description = rawDescription;

  if (!description) {
    description = config.articleContent.descriptionFallback.trim();
  }

  if (!description) {
    return null;
  }

  if (
    config.articleContent.trimDescription &&
    config.articleContent.maxDescriptionLength != null &&
    config.articleContent.maxDescriptionLength > 0 &&
    description.length > config.articleContent.maxDescriptionLength
  ) {
    description = `${description.slice(0, config.articleContent.maxDescriptionLength).trimEnd()}…`;
  }

  return description;
}

export function getJobDisplayTitle(
  job: Pick<PublishContextJob, "title" | "company" | "location">,
  config: PublishPayloadConfig
) {
  const title = job.title?.trim();
  const company = job.company?.trim();
  const location = job.location?.trim();

  if (title) {
    return title;
  }

  if (company && location) {
    return `${company} — ${location}`;
  }

  if (company) {
    return company;
  }

  if (location) {
    return location;
  }

  return config.labels.untitledJobFallback;
}
