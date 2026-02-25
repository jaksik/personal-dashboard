import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type GrokImageDatum = {
  url?: string;
  b64_json?: string;
};

type GrokImageResponse = {
  data?: GrokImageDatum[];
};

function getImageContentTypeFromUrl(url: string) {
  const lowered = url.toLowerCase();

  if (lowered.includes(".webp")) {
    return "image/webp";
  }

  if (lowered.includes(".jpg") || lowered.includes(".jpeg")) {
    return "image/jpeg";
  }

  return "image/png";
}

function getFileExtension(contentType: string) {
  if (contentType === "image/webp") {
    return "webp";
  }

  if (contentType === "image/jpeg") {
    return "jpg";
  }

  return "png";
}

async function extractImageBuffer(payload: GrokImageResponse) {
  const firstImage = payload.data?.[0];

  if (!firstImage) {
    throw new Error("Grok response did not include image data.");
  }

  if (firstImage.b64_json) {
    return {
      contentType: "image/png",
      bytes: Buffer.from(firstImage.b64_json, "base64"),
    };
  }

  if (firstImage.url) {
    const response = await fetch(firstImage.url);

    if (!response.ok) {
      throw new Error("Failed to download generated image from Grok response URL.");
    }

    const contentType = response.headers.get("content-type") ?? getImageContentTypeFromUrl(firstImage.url);
    const arrayBuffer = await response.arrayBuffer();

    return {
      contentType,
      bytes: Buffer.from(arrayBuffer),
    };
  }

  throw new Error("Unsupported Grok response payload. Expected b64_json or url.");
}

export async function POST(request: Request) {
  try {
    const grokApiKey = process.env.GROK_API_KEY ?? process.env.XAI_API_KEY;
    const grokApiUrl =
      process.env.GROK_IMAGE_API_URL ?? "https://api.x.ai/v1/images/generations";
    const defaultGrokModel = process.env.GROK_IMAGE_MODEL ?? "grok-2-image-1212";

    if (!grokApiKey) {
      return NextResponse.json(
        { error: "Missing GROK_API_KEY (or XAI_API_KEY)." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as {
      prompt?: string;
      newsletterId?: number;
      model?: string;
    };

    const prompt = body.prompt?.trim();
    const newsletterId = body.newsletterId;
    const grokModel = body.model?.trim() || defaultGrokModel;

    if (!prompt || prompt.length < 5) {
      return NextResponse.json(
        { error: "Prompt must be at least 5 characters." },
        { status: 400 }
      );
    }

    if (!newsletterId) {
      return NextResponse.json(
        { error: "A newsletterId is required." },
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

    const { data: newsletter, error: newsletterError } = await supabase
      .from("newsletters")
      .select("id")
      .eq("id", newsletterId)
      .single();

    if (newsletterError || !newsletter) {
      return NextResponse.json(
        { error: "Newsletter not found for provided newsletterId." },
        { status: 404 }
      );
    }

    const grokResponse = await fetch(grokApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${grokApiKey}`,
      },
      body: JSON.stringify({
        model: grokModel,
        prompt,
        n: 1,
      }),
    });

    if (!grokResponse.ok) {
      const errorBody = await grokResponse.text();
      return NextResponse.json(
        { error: `Grok image request failed: ${errorBody || grokResponse.statusText}` },
        { status: 502 }
      );
    }

    const grokPayload = (await grokResponse.json()) as GrokImageResponse;
    const imageData = await extractImageBuffer(grokPayload);
    const extension = getFileExtension(imageData.contentType);

    const blob = await put(
      `newsletter-images/${newsletterId}/${Date.now()}-${randomUUID()}.${extension}`,
      imageData.bytes,
      {
        access: "public",
        contentType: imageData.contentType,
      }
    );

    const { data: insertedImage, error: insertError } = await supabase
      .from("newsletter_images")
      .insert({
        newsletter_id: newsletterId,
        prompt,
        provider: "grok",
        model: grokModel,
        blob_url: blob.url,
      })
      .select("id, blob_url, prompt, provider, model, created_at, newsletter_id")
      .single();

    if (insertError || !insertedImage) {
      return NextResponse.json(
        { error: insertError?.message ?? "Failed to save generated image record." },
        { status: 500 }
      );
    }

    return NextResponse.json({ image: insertedImage }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
