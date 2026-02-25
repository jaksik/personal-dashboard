import type { ArticleGroup, PayloadArticle, PayloadNewsletter } from "./types";
import { getCategoryRenderIndex, getSectionLabel } from "./templateConfig";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function toSafeHttpUrl(value: string | null) {
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

export function groupArticlesByCategory(articles: PayloadArticle[]): ArticleGroup[] {
  const grouped = new Map<string, PayloadArticle[]>();

  for (const article of articles) {
    const category = article.category?.trim() || "Uncategorized";
    const current = grouped.get(category) ?? [];
    current.push(article);
    grouped.set(category, current);
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => {
      const leftOrder = getCategoryRenderIndex(left);
      const rightOrder = getCategoryRenderIndex(right);

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      return left.localeCompare(right);
    })
    .map(([category, categoryArticles]) => ({
      category,
      articles: categoryArticles,
    }));
}

export function buildBeehiivHtmlPayload(
  newsletter: PayloadNewsletter,
  groups: ArticleGroup[]
) {
  const title = escapeHtml(newsletter.title ?? "Newsletter Title");
  const subtitle = escapeHtml(newsletter.sub_title ?? "");

  const coverImageHtml = newsletter.cover_image
    ? `<img src="${escapeHtml(newsletter.cover_image)}" alt="${title}" style="width:100%;max-width:720px;border-radius:8px;display:block;margin:16px auto;"/>`
    : "";

  const groupHtml = groups
    .map((group) => {
      const heading = `<h3 style="margin:24px 0 8px 0;font-size:18px;line-height:1.35;">${escapeHtml(getSectionLabel(group.category))}</h3>`;
      const items = group.articles
        .map((article) => {
          const text = escapeHtml(
            article.title_snippet ?? article.title ?? "Untitled article"
          );

          const safeUrl = toSafeHttpUrl(article.url);
          const content = safeUrl
            ? `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer" style="color:#111827;text-decoration:underline;">${text}</a>`
            : text;

          const isFeatureCategory =
            (article.category?.trim().toLowerCase() ?? "") === "feature";

          const description = isFeatureCategory
            ? (article.description?.trim() ?? "")
            : "";

          if (!description) {
            return `<p style="margin:0 0 8px 0;">${content}</p>`;
          }

          return `
<div style="margin:0 0 10px 0;">
  <p style="margin:0;">${content}</p>
  <p style="margin:4px 0 0 0;color:#4b5563;">${escapeHtml(description)}</p>
</div>
`.trim();
        })
        .join("");

      return `${heading}<div style="margin:0;">${items}</div>`;
    })
    .join("");

  return `
<section style="font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.55;max-width:720px;margin:0 auto;">
  <h1 style="margin:0;font-size:34px;line-height:1.2;">${title}</h1>
  ${subtitle ? `<p style="margin:8px 0 0 0;font-size:18px;color:#4b5563;">${subtitle}</p>` : ""}
  ${coverImageHtml}
  ${groupHtml}
</section>
`.trim();
}

export function buildBeehiivPlainTextPayload(
  newsletter: PayloadNewsletter,
  groups: ArticleGroup[]
) {
  const lines: string[] = [];

  lines.push(newsletter.title ?? "Newsletter Title");

  if (newsletter.sub_title) {
    lines.push(newsletter.sub_title);
  }

  if (newsletter.cover_image) {
    lines.push(`Cover Image: ${newsletter.cover_image}`);
  }

  lines.push("");

  for (const group of groups) {
    lines.push(getSectionLabel(group.category));

    for (const article of group.articles) {
      const title = article.title_snippet ?? article.title ?? "Untitled article";
      const safeUrl = toSafeHttpUrl(article.url);
      const isFeatureCategory =
        (article.category?.trim().toLowerCase() ?? "") === "feature";
      const description = isFeatureCategory
        ? (article.description?.trim() ?? "")
        : "";

      if (safeUrl) {
        lines.push(`${title} (${safeUrl})`);
      } else {
        lines.push(title);
      }

      if (description) {
        lines.push(description);
      }
    }

    lines.push("");
  }

  return lines.join("\n").trim();
}
