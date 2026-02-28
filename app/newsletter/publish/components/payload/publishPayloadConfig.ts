/**
 * Quick edits:
 * 1) Change section order with `sectionOrder.html` / `sectionOrder.plainText`.
 * 2) Switch category ordering with `categoryOrder.mode` ("alphabetical" | "custom").
 * 3) Update fallback labels in `labels` (title/subtitle/uncategorized/untitled/job labels).
 */
export type PublishPayloadSection =
  | "title"
  | "subtitle"
  | "coverImage"
  | "categories"
  | "aiJobs";

export type PublishPayloadConfig = {
  sectionOrder: {
    html: PublishPayloadSection[];
    plainText: PublishPayloadSection[];
  };
  categoryOrder: {
    mode: "alphabetical" | "custom";
    customOrder: string[];
  };
  labels: {
    newsletterTitleFallback: string;
    newsletterSubtitleFallback: string;
    uncategorizedFallback: string;
    untitledArticleFallback: string;
    categoryHeaderOverrides: Record<string, string>;
    aiJobsHeading: string;
    untitledJobFallback: string;
    noJobsFallback: string;
    coverImagePlainTextPrefix: string;
  };
  articleContent: {
    showDescription: boolean;
    descriptionFallback: string;
    trimDescription: boolean;
    maxDescriptionLength: number | null;
    descriptionCategories: {
      mode: "all" | "only" | "except";
      categories: string[];
    };
  };
  jobsPlacement: {
    mode: "end" | "afterCategory";
    afterCategory: string | null;
  };
  htmlStyles: {
    section: string;
    title: string;
    subtitle: string;
    coverImage: string;
    categoryHeading: string;
    categoryContainer: string;
    articleItem: string;
    articleLink: string;
    articleDescription: string;
  };
};

export const publishPayloadConfig: PublishPayloadConfig = {
  sectionOrder: {
    html: ["title", "subtitle", "coverImage", "categories", "aiJobs"],
    plainText: ["title", "subtitle", "coverImage", "categories", "aiJobs"],
  },
  categoryOrder: {
    mode: "custom",
    customOrder: ["Feature", "Economy", "Brief", "Research"],
  },
  labels: {
    newsletterTitleFallback: "Newsletter Title",
    newsletterSubtitleFallback: "Newsletter subtitle",
    uncategorizedFallback: "Uncategorized",
    untitledArticleFallback: "Untitled article",
    categoryHeaderOverrides: {Feature: "Top Developments", Economy: "💰The AI Economy", Brief: "📝 Brief", Research: "🔬 Research"},
    aiJobsHeading: "AI Jobs",
    untitledJobFallback: "Untitled job",
    noJobsFallback: "No associated jobs yet.",
    coverImagePlainTextPrefix: "Cover Image",
  },
  articleContent: {
    showDescription: true,
    descriptionFallback: "",
    trimDescription: true,
    maxDescriptionLength: 220,
    descriptionCategories: {
      mode: "only",
      categories: ["Feature"],
    },
  },
  jobsPlacement: {
    mode: "afterCategory",
    afterCategory: "Economy",
  },
  htmlStyles: {
    section:
      "font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.55;max-width:720px;margin:0 auto;",
    title: "margin:0;font-size:34px;line-height:1.2;text-align:center;",
    subtitle: "margin:8px 0 0 0;font-size:18px;color:#4b5563;text-align:center;",
    coverImage:
      "width:100%;max-width:720px;border-radius:8px;display:block;margin:16px auto;",
    categoryHeading: "margin:24px 0 8px 0;font-size:18px;line-height:1.35;text-align:center;",
    categoryContainer: "margin:0;",
    articleItem: "margin:0 0 8px 0;",
    articleLink: "color:#111827;text-decoration:underline;",
    articleDescription: "margin:4px 0 10px 0;color:#4b5563;font-size:14px;",
  },
};
