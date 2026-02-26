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

    const { data: newsletters, error: newslettersError } = await supabase
      .from("newsletters")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (newslettersError) {
      return NextResponse.json({ error: newslettersError.message }, { status: 500 });
    }

    return NextResponse.json({ newsletters: newsletters ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
