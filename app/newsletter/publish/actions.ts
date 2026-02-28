"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export type PublishContextNewsletter = {
  id: number;
  title: string | null;
  sub_title: string | null;
  cover_image: string | null;
  created_at: string;
};

export type PublishContextArticle = {
  id: number;
  title: string | null;
  title_snippet: string | null;
  category: string | null;
  url: string | null;
  description: string | null;
  created_at: string;
};

export type PublishContextJob = {
  id: number;
  title: string | null;
  company: string | null;
  location: string | null;
  apply_link: string | null;
  created_at: string;
};

export type PublishWorkspacePayload = {
  newsletter: PublishContextNewsletter | null;
  articles: PublishContextArticle[];
  jobs: PublishContextJob[];
};

export async function requirePublishUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

export async function signOutPublishAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

export async function getPublishWorkspaceDataAction(
  selectedNewsletterId: number | null
): Promise<PublishWorkspacePayload> {
  const supabase = await createClient();
  const cutoff = new Date(new Date().getTime() - 12 * 60 * 60 * 1000).toISOString();

  const newsletterQuery = supabase
    .from("newsletters")
    .select("id, title, sub_title, cover_image, created_at")
    .order("created_at", { ascending: false })
    .limit(1);

  if (selectedNewsletterId != null) {
    newsletterQuery.eq("id", selectedNewsletterId);
  } else {
    newsletterQuery.gte("created_at", cutoff);
  }

  const { data: newsletters, error: newsletterError } = await newsletterQuery;

  if (newsletterError) {
    throw new Error(newsletterError.message);
  }

  const newsletter = (newsletters?.[0] ?? null) as PublishContextNewsletter | null;

  if (!newsletter) {
    return {
      newsletter: null,
      articles: [],
      jobs: [],
    };
  }

  const [
    { data: articles, error: articlesError },
    { data: jobs, error: jobsError },
  ] = await Promise.all([
    supabase
      .from("articles")
      .select("id, title, title_snippet, category, url, description, created_at")
      .eq("newsletter_id", newsletter.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("job_postings")
      .select("id, title, company, location, apply_link, created_at")
      .eq("newsletter_id", newsletter.id)
      .order("created_at", { ascending: false }),
  ]);

  if (articlesError) {
    throw new Error(articlesError.message);
  }

  if (jobsError) {
    throw new Error(jobsError.message);
  }

  return {
    newsletter,
    articles: (articles ?? []) as PublishContextArticle[],
    jobs: (jobs ?? []) as PublishContextJob[],
  };
}
