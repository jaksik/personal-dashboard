import type { Database } from "@/utils/supabase/database.types";

export type CurateTab = "articles" | "jobs";
export type SortKey =
  | "title"
  | "category"
  | "publisher"
  | "created_at"
  | "published_at"
  | "source";

export type JobSortKey = "title" | "company" | "location" | "remote" | "created_at" | "posted_date";

export type ArticleNewsletterFilter =
  | "all"
  | "unassigned"
  | "assigned"
  | "target"
  | "other"
  | "unassigned_or_target";

export type NewsletterOption = {
  id: number;
  title: string | null;
  created_at: string;
};

export type ArticleRow = Pick<
  Database["public"]["Tables"]["articles"]["Row"],
  | "id"
  | "title_snippet"
  | "title"
  | "description"
  | "category"
  | "publisher"
  | "published_at"
  | "created_at"
  | "source"
  | "newsletter_id"
>;

export type JobPostingRow = Pick<
  Database["public"]["Tables"]["job_postings"]["Row"],
  | "id"
  | "title"
  | "description"
  | "company"
  | "location"
  | "remote"
  | "posted_date"
  | "created_at"
  | "apply_link"
  | "newsletter_id"
>;