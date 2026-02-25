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
      .select("id, title, sub_title, created_at")
      .gte("created_at", cutoff)
      .order("created_at", { ascending: false })
      .limit(1);

    if (newsletterError) {
      return NextResponse.json({ error: newsletterError.message }, { status: 500 });
    }

    return NextResponse.json({ newsletter: newsletters?.[0] ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      newsletterId?: number;
      title?: string | null;
      subTitle?: string | null;
    };

    if (!body.newsletterId) {
      return NextResponse.json(
        { error: "newsletterId is required." },
        { status: 400 }
      );
    }

    const title = body.title?.trim() ?? "";
    const subTitle = body.subTitle?.trim() ?? "";

    const { data: updatedNewsletter, error: updateError } = await supabase
      .from("newsletters")
      .update({
        title: title.length > 0 ? title : null,
        sub_title: subTitle.length > 0 ? subTitle : null,
      })
      .eq("id", body.newsletterId)
      .select("id, title, sub_title, created_at")
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ newsletter: updatedNewsletter });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
