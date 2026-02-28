import { CATEGORY_NEON_TONES } from "./curateConstants";
import { normalizeText, parseDate } from "./curateHelpers";
import type { ArticleNewsletterFilter, ArticleRow, SortKey } from "./types";

type TargetNewsletter = {
    id: number;
    title: string | null;
} | null;

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

export function getCategories(articles: ArticleRow[]) {
    const unique = new Set<string>();

    for (const article of articles) {
        const category = article.category?.trim();
        if (category) {
            unique.add(category);
        }
    }

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
}

export function getPublishers(articles: ArticleRow[]) {
    const unique = new Set<string>();

    for (const article of articles) {
        if (article.publisher) {
            unique.add(article.publisher);
        }
    }

    return Array.from(unique).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base", numeric: true })
    );
}

export function getSources(articles: ArticleRow[]) {
    const unique = new Set<string>();

    for (const article of articles) {
        if (article.source) {
            unique.add(article.source);
        }
    }

    return Array.from(unique).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base", numeric: true })
    );
}

export function getVisibleArticles(params: {
    articles: ArticleRow[];
    articleSearch: string;
    articleCategory: string;
    articlePublisher: string;
    articleSource: string;
    articleNewsletterFilter: ArticleNewsletterFilter;
    articleCreatedDaysBack: string;
    articlePublishedDaysBack: string;
    sortKey: SortKey;
    sortDirection: "asc" | "desc";
    targetNewsletter: TargetNewsletter;
}) {
    const {
        articles,
        articleSearch,
        articleCategory,
        articlePublisher,
        articleSource,
        articleNewsletterFilter,
        articleCreatedDaysBack,
        articlePublishedDaysBack,
        sortKey,
        sortDirection,
        targetNewsletter,
    } = params;

    const searchTokens = articleSearch
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

    const filtered = articles.filter((article) => {
        const normalizedCategory = article.category?.trim() ?? "";

        if (articleCategory !== "all" && normalizedCategory !== articleCategory) {
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
        if (articleNewsletterFilter === "unassigned_or_target") {
            if (assignedNewsletterId !== null) {
                if (!targetNewsletter || assignedNewsletterId !== targetNewsletter.id) {
                    return false;
                }
            }
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
            if (
                !targetNewsletter ||
                assignedNewsletterId === null ||
                assignedNewsletterId === targetNewsletter.id
            ) {
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
}

export function getCategoryCountBadges(articles: ArticleRow[], targetNewsletter: TargetNewsletter) {
    const counts = new Map<string, number>();

    if (!targetNewsletter) {
        return [];
    }

    for (const article of articles) {
        if (article.newsletter_id !== targetNewsletter.id) {
            continue;
        }

        const category = article.category?.trim() || "Uncategorized";
        counts.set(category, (counts.get(category) ?? 0) + 1);
    }

    return Array.from(counts.entries())
        .sort(([leftCategory], [rightCategory]) =>
            leftCategory.localeCompare(rightCategory, undefined, { sensitivity: "base" })
        )
        .map(([category, count], index) => ({
            category,
            count,
            toneClass: CATEGORY_NEON_TONES[index % CATEGORY_NEON_TONES.length].toneClass,
        }));
}

export function getCategoryToneByName(
    categoryCountBadges: Array<{ category: string; count: number; toneClass: string }>
) {
    const toneMap: Record<string, string> = {};

    for (const badge of categoryCountBadges) {
        toneMap[badge.category] = badge.toneClass;
    }

    return toneMap;
}

export function getCategoryNeonColorByName(categories: string[]) {
    const colorMap: Record<string, string> = {};

    categories.forEach((category, index) => {
        colorMap[category] = CATEGORY_NEON_TONES[index % CATEGORY_NEON_TONES.length].neonColor;
    });

    colorMap.Uncategorized = "#9ca3af";

    return colorMap;
}
