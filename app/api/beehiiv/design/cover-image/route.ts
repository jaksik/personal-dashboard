import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      newsletterId?: number;
      imageId?: number;
    };

    const newsletterId = body.newsletterId;
    const imageId = body.imageId;

    if (!newsletterId || !imageId) {
      return NextResponse.json(
        { error: "newsletterId and imageId are required." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: image, error: imageError } = await supabase
      .from("newsletter_images")
      .select("id, blob_url, newsletter_id")
      .eq("id", imageId)
      .eq("newsletter_id", newsletterId)
      .single();

    if (imageError || !image?.blob_url) {
      return NextResponse.json(
        { error: "Selected image does not belong to the provided newsletter." },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from("newsletters")
      .update({ cover_image: image.blob_url })
      .eq("id", newsletterId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ coverImage: image.blob_url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
