import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cutoff = new Date(new Date().getTime() - 12 * 60 * 60 * 1000).toISOString();

    const { data: newsletters, error: newsletterError } = await supabase
      .from("newsletters")
      .select("id, title, sub_title, cover_image, created_at")
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false })
      .limit(1);

    if (newsletterError) {
      return NextResponse.json({ error: newsletterError.message }, { status: 500 });
    }

    const newsletter = newsletters?.[0] ?? null;

    if (!newsletter) {
      return NextResponse.json({ newsletter: null, images: [], articles: [] });
    }

    const [
      { data: images, error: imagesError },
      { data: articles, error: articlesError },
    ] = await Promise.all([
      supabase
        .from("newsletter_images")
        .select("id, blob_url, prompt, provider, model, created_at, newsletter_id")
        .eq("newsletter_id", newsletter.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("articles")
        .select("id, title, title_snippet, category, created_at")
        .eq("newsletter_id", newsletter.id)
        .order("created_at", { ascending: false }),
    ]);

    if (imagesError) {
      return NextResponse.json({ error: imagesError.message }, { status: 500 });
    }

    if (articlesError) {
      return NextResponse.json({ error: articlesError.message }, { status: 500 });
    }

    return NextResponse.json({
      newsletter,
      images: images ?? [],
      articles: articles ?? [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
