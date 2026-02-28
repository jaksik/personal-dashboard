"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import type { ArticleRow, JobPostingRow } from "./components/types";

export async function requireCurateUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

export async function signOutCurateAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

type CurateWorkspacePayload = {
  targetNewsletter: {
    id: number;
    title: string | null;
  } | null;
  articles: ArticleRow[];
  jobs: JobPostingRow[];
};

export async function getCurateWorkspaceDataAction(
  selectedNewsletterId: number | null
): Promise<CurateWorkspacePayload> {
  const supabase = await createClient();
  const cutoff = new Date(new Date().getTime() - 12 * 60 * 60 * 1000).toISOString();

  const [
    { data: articleData, error: articleError },
    { data: selectedNewsletter, error: newsletterError },
    { data: jobsData, error: jobsError },
  ] = await Promise.all([
    supabase
      .from("articles")
      .select(
        "id, title_snippet, title, description, category, publisher, published_at, created_at, source, newsletter_id"
      )
      .order("created_at", { ascending: false })
      .limit(150),
    supabase
      .from("newsletters")
      .select("id, title, created_at")
      .eq("id", selectedNewsletterId ?? -1)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("job_postings")
      .select(
        "id, title, description, company, location, remote, posted_date, created_at, apply_link, newsletter_id"
      )
      .order("created_at", { ascending: false })
      .limit(150),
  ]);

  if (articleError) {
    throw new Error(articleError.message);
  }

  if (newsletterError) {
    throw new Error(newsletterError.message);
  }

  if (jobsError) {
    throw new Error(jobsError.message);
  }

  let resolvedNewsletter = selectedNewsletter?.[0] ?? null;

  if (!resolvedNewsletter) {
    const { data: fallbackNewsletters, error: fallbackNewsletterError } = await supabase
      .from("newsletters")
      .select("id, title, created_at")
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false })
      .limit(1);

    if (fallbackNewsletterError) {
      throw new Error(fallbackNewsletterError.message);
    }

    resolvedNewsletter = fallbackNewsletters?.[0] ?? null;
  }

  return {
    targetNewsletter: resolvedNewsletter
      ? { id: resolvedNewsletter.id, title: resolvedNewsletter.title }
      : null,
    articles: (articleData ?? []) as ArticleRow[],
    jobs: (jobsData ?? []) as JobPostingRow[],
  };
}

export async function addArticleToNewsletterAction(
  newsletterId: number,
  articleId: number
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("articles")
    .update({ newsletter_id: newsletterId })
    .eq("id", articleId);

  if (error) {
    throw new Error(error.message);
  }

  return { articleId, newsletterId };
}

export async function removeArticleFromNewsletterAction(articleId: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("articles")
    .update({ newsletter_id: null })
    .eq("id", articleId);

  if (error) {
    throw new Error(error.message);
  }

  return { articleId, newsletterId: null };
}

export async function updateArticleCategoryAction(
  articleId: number,
  category: string | null
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("articles")
    .update({ category })
    .eq("id", articleId);

  if (error) {
    throw new Error(error.message);
  }

  return { articleId, category };
}

export async function updateArticleDocumentAction(
  articleId: number,
  updates: {
    title_snippet: string | null;
    title: string | null;
    description: string | null;
    publisher: string | null;
    source: string | null;
  }
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("articles")
    .update(updates)
    .eq("id", articleId);

  if (error) {
    throw new Error(error.message);
  }

  return { articleId, updates };
}

export async function addSelectedArticlesToNewsletterAction(
  newsletterId: number,
  articleIds: number[]
) {
  if (articleIds.length === 0) {
    return { articleIds, newsletterId };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("articles")
    .update({ newsletter_id: newsletterId })
    .in("id", articleIds);

  if (error) {
    throw new Error(error.message);
  }

  return { articleIds, newsletterId };
}

export async function addJobToNewsletterAction(newsletterId: number, jobId: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("job_postings")
    .update({ newsletter_id: newsletterId })
    .eq("id", jobId);

  if (error) {
    throw new Error(error.message);
  }

  return { jobId, newsletterId };
}

export async function updateJobDocumentAction(
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
  const supabase = await createClient();
  const { error } = await supabase
    .from("job_postings")
    .update(updates)
    .eq("id", jobId);

  if (error) {
    throw new Error(error.message);
  }

  return { jobId, updates };
}