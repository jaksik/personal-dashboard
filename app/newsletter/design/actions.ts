"use server";

import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export type DesignContextNewsletter = {
	id: number;
	title: string | null;
	sub_title: string | null;
	cover_image: string | null;
	created_at: string;
};

export type DesignContextArticle = {
	id: number;
	title: string | null;
	title_snippet: string | null;
	category: string | null;
	created_at: string;
};

export type NewsletterImage = {
	id: number;
	blob_url: string;
	prompt: string | null;
	provider: string | null;
	model: string | null;
	created_at: string;
	newsletter_id: number | null;
};

export type DesignWorkspacePayload = {
	newsletter: DesignContextNewsletter | null;
	articles: DesignContextArticle[];
	images: NewsletterImage[];
};

export async function requireDesignUser() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/sign-in");
	}

	return user;
}

export async function signOutDesignAction() {
	const supabase = await createClient();
	await supabase.auth.signOut();
	redirect("/sign-in");
}

export async function getDesignWorkspaceDataAction(
	selectedNewsletterId: number | null
): Promise<DesignWorkspacePayload> {
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

	const newsletter = (newsletters?.[0] ?? null) as DesignContextNewsletter | null;

	if (!newsletter) {
		return {
			newsletter: null,
			articles: [],
			images: [],
		};
	}

	const [{ data: images, error: imagesError }, { data: articles, error: articlesError }] =
		await Promise.all([
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
		throw new Error(imagesError.message);
	}

	if (articlesError) {
		throw new Error(articlesError.message);
	}

	return {
		newsletter,
		articles: (articles ?? []) as DesignContextArticle[],
		images: (images ?? []) as NewsletterImage[],
	};
}

export async function updateNewsletterMetaAction(input: {
	newsletterId: number;
	title: string;
	subTitle: string;
}): Promise<DesignContextNewsletter> {
	const supabase = await createClient();

	const title = input.title.trim();
	const subTitle = input.subTitle.trim();

	const { data: updatedNewsletter, error: updateError } = await supabase
		.from("newsletters")
		.update({
			title: title.length > 0 ? title : null,
			sub_title: subTitle.length > 0 ? subTitle : null,
		})
		.eq("id", input.newsletterId)
		.select("id, title, sub_title, cover_image, created_at")
		.single();

	if (updateError || !updatedNewsletter) {
		throw new Error(updateError?.message ?? "Failed to update newsletter details.");
	}

	return updatedNewsletter as DesignContextNewsletter;
}

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

export async function generateNewsletterImageAction(input: {
	newsletterId: number;
	prompt: string;
	model?: string;
}): Promise<NewsletterImage> {
	const grokApiKey = process.env.GROK_API_KEY ?? process.env.XAI_API_KEY;
	const grokApiUrl = process.env.GROK_IMAGE_API_URL ?? "https://api.x.ai/v1/images/generations";
	const defaultGrokModel = process.env.GROK_IMAGE_MODEL ?? "grok-2-image-1212";

	if (!grokApiKey) {
		throw new Error("Missing GROK_API_KEY (or XAI_API_KEY).");
	}

	const prompt = input.prompt.trim();
	if (prompt.length < 5) {
		throw new Error("Prompt must be at least 5 characters.");
	}

	const grokModel = input.model?.trim() || defaultGrokModel;
	const newsletterId = input.newsletterId;

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
		throw new Error(`Grok image request failed: ${errorBody || grokResponse.statusText}`);
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

	const supabase = await createClient();

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
		throw new Error(insertError?.message ?? "Failed to save generated image record.");
	}

	return insertedImage as NewsletterImage;
}

export async function setNewsletterCoverImageAction(input: {
	newsletterId: number;
	imageId: number;
}): Promise<string> {
	const supabase = await createClient();

	const { data: image, error: imageError } = await supabase
		.from("newsletter_images")
		.select("id, blob_url, newsletter_id")
		.eq("id", input.imageId)
		.eq("newsletter_id", input.newsletterId)
		.single();

	if (imageError || !image?.blob_url) {
		throw new Error("Selected image does not belong to the provided newsletter.");
	}

	const { error: updateError } = await supabase
		.from("newsletters")
		.update({ cover_image: image.blob_url })
		.eq("id", input.newsletterId);

	if (updateError) {
		throw new Error(updateError.message);
	}

	return image.blob_url;
}
