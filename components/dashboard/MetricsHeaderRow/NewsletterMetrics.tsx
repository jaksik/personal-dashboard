const BEEHIIV_API_BASE_URL = "https://api.beehiiv.com/v2";
const NEWSLETTER_ROLLING_DAYS = 30;

type NewsletterMetricsSummary = {
	newslettersPublished: number | null;
	emailOpens: number | null;
	averageCtr: number | null;
	netSubscribers: number | null;
};

type BeehiivListResponse = {
	data?: unknown[];
	pagination?: {
		next_page?: number | null;
	};
};

function formatNumber(value: number | null) {
	if (value == null) {
		return "----";
	}

	return Math.round(value).toLocaleString("en-US");
}

function formatPercent(value: number | null) {
	if (value == null) {
		return "--%";
	}

	const rounded = value.toFixed(2);
	return `${rounded}%`;
}

function parseDateValue(value: unknown): Date | null {
	if (typeof value === "number") {
		const millis = value > 1_000_000_000_000 ? value : value * 1000;
		const parsed = new Date(millis);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	}

	if (typeof value === "string") {
		const parsed = new Date(value);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	}

	return null;
}

function getItemDate(item: Record<string, unknown>): Date | null {
	return (
		parseDateValue(item.publish_date) ??
		parseDateValue(item.published_at) ??
		parseDateValue(item.created_at) ??
		parseDateValue(item.created)
	);
}

function getNumberValue(...candidates: unknown[]) {
	for (const candidate of candidates) {
		if (typeof candidate === "number" && Number.isFinite(candidate)) {
			return candidate;
		}

		if (typeof candidate === "string") {
			const parsed = Number(candidate);
			if (Number.isFinite(parsed)) {
				return parsed;
			}
		}
	}

	return null;
}

function getRollingCutoff(days: number) {
	const cutoff = new Date();
	cutoff.setUTCDate(cutoff.getUTCDate() - (days - 1));
	return cutoff;
}

function getUnsubscribeDate(item: Record<string, unknown>): Date | null {
	return (
		parseDateValue(item.unsubscribed_at) ??
		parseDateValue(item.unsubscribed) ??
		parseDateValue(item.ended_at)
	);
}

function isUnsubscribed(item: Record<string, unknown>) {
	const unsubscribeDate = getUnsubscribeDate(item);
	if (unsubscribeDate) {
		return true;
	}

	const status = item.status;
	if (typeof status !== "string") {
		return false;
	}

	const normalized = status.toLowerCase();
	return normalized === "unsubscribed" || normalized === "inactive";
}

function getSubscriberKey(item: Record<string, unknown>) {
	const emailCandidates = [item.email, item.email_address];

	for (const candidate of emailCandidates) {
		if (typeof candidate === "string") {
			const normalized = candidate.trim().toLowerCase();
			if (normalized.length > 0) {
				return normalized;
			}
		}
	}

	const candidates = [item.subscriber_id, item.id, item.subscription_id];

	for (const candidate of candidates) {
		if (typeof candidate === "string" && candidate.trim().length > 0) {
			return candidate;
		}

		if (typeof candidate === "number" && Number.isFinite(candidate)) {
			return String(candidate);
		}
	}

	return null;
}

function getSubscriptionDate(item: Record<string, unknown>): Date | null {
	return (
		parseDateValue(item.subscribed_at) ??
		parseDateValue(item.created_at) ??
		parseDateValue(item.created)
	);
}

type SubscriberEventSummary = {
	latestSubscribeDate: Date | null;
	latestUnsubscribeDate: Date | null;
};

async function fetchBeehiivPage(
	path: string,
	apiKey: string,
	page: number
): Promise<BeehiivListResponse | null> {
	const separator = path.includes("?") ? "&" : "?";
	const url = `${BEEHIIV_API_BASE_URL}${path}${separator}page=${page}`;

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${apiKey}`,
			Accept: "application/json",
		},
		cache: "no-store",
	});

	if (!response.ok) {
		return null;
	}

	return (await response.json()) as BeehiivListResponse;
}

async function getRollingNewsletterMetrics(days: number): Promise<NewsletterMetricsSummary> {
	const apiKey = process.env.BEEHIIV_API_KEY;
	const publicationId = process.env.BEEHIIV_PUB_ID;

	if (!apiKey || !publicationId) {
		return {
			newslettersPublished: null,
			emailOpens: null,
			averageCtr: null,
			netSubscribers: null,
		};
	}

	const cutoff = getRollingCutoff(days);
	let newslettersPublished = 0;
	let emailOpens = 0;
	let ctrTotal = 0;
	let ctrCount = 0;
	const subscriberEvents = new Map<string, SubscriberEventSummary>();

	for (let page = 1; page <= 20; page += 1) {
		const postPage = await fetchBeehiivPage(
			`/publications/${publicationId}/posts?status=confirmed&limit=100&expand[]=stats&order_by=publish_date&direction=desc`,
			apiKey,
			page
		);

		if (!postPage?.data?.length) {
			break;
		}

		let reachedOlderPosts = false;

		for (const rawPost of postPage.data) {
			if (!rawPost || typeof rawPost !== "object") {
				continue;
			}

			const post = rawPost as Record<string, unknown>;
			const postDate = getItemDate(post);
			if (!postDate || postDate < cutoff) {
				reachedOlderPosts = true;
				continue;
			}

			newslettersPublished += 1;

			const stats = post.stats as Record<string, unknown> | undefined;
			const opensValue = getNumberValue(
				stats?.total_opens,
				stats?.opens,
				stats?.open_count,
				stats?.unique_opens
			);

			if (opensValue != null) {
				emailOpens += opensValue;
			}

			const ctrValue = getNumberValue(
				stats?.email_click_rate,
				stats?.click_through_rate,
				stats?.ctr
			);

			if (ctrValue != null) {
				ctrTotal += ctrValue;
				ctrCount += 1;
			}
		}

		if (reachedOlderPosts || !postPage.pagination?.next_page) {
			break;
		}
	}

	for (let page = 1; page <= 20; page += 1) {
		const subscriptionPage = await fetchBeehiivPage(
			`/publications/${publicationId}/subscriptions?limit=100&order_by=created_at&direction=desc`,
			apiKey,
			page
		);

		if (!subscriptionPage?.data?.length) {
			break;
		}

		for (const rawSubscription of subscriptionPage.data) {
			if (!rawSubscription || typeof rawSubscription !== "object") {
				continue;
			}

			const subscription = rawSubscription as Record<string, unknown>;
			const subscriberKey = getSubscriberKey(subscription);
			if (!subscriberKey) {
				continue;
			}

			const subscriptionDate = getSubscriptionDate(subscription);
			const unsubscribeDate = getUnsubscribeDate(subscription);

			const existing = subscriberEvents.get(subscriberKey) ?? {
				latestSubscribeDate: null,
				latestUnsubscribeDate: null,
			};

			if (
				subscriptionDate &&
				(!existing.latestSubscribeDate || subscriptionDate > existing.latestSubscribeDate)
			) {
				existing.latestSubscribeDate = subscriptionDate;
			}

			if (
				unsubscribeDate &&
				(!existing.latestUnsubscribeDate || unsubscribeDate > existing.latestUnsubscribeDate)
			) {
				existing.latestUnsubscribeDate = unsubscribeDate;
			}

			subscriberEvents.set(subscriberKey, existing);
		}

		if (!subscriptionPage.pagination?.next_page) {
			break;
		}
	}

	let newSubscribers = 0;
	let unsubscribedSubscribers = 0;

	for (const events of subscriberEvents.values()) {
		const { latestSubscribeDate, latestUnsubscribeDate } = events;

		const hasRecentSubscribe = Boolean(latestSubscribeDate && latestSubscribeDate >= cutoff);
		const hasRecentUnsubscribe = Boolean(latestUnsubscribeDate && latestUnsubscribeDate >= cutoff);

		const subscribedAfterLatestUnsubscribe = Boolean(
			latestSubscribeDate &&
			(!latestUnsubscribeDate || latestSubscribeDate > latestUnsubscribeDate)
		);

		const unsubscribedAfterLatestSubscribe = Boolean(
			latestUnsubscribeDate &&
			(!latestSubscribeDate || latestUnsubscribeDate > latestSubscribeDate)
		);

		if (hasRecentSubscribe && subscribedAfterLatestUnsubscribe) {
			newSubscribers += 1;
		}

		if (hasRecentUnsubscribe && unsubscribedAfterLatestSubscribe) {
			unsubscribedSubscribers += 1;
		}
	}

	const netSubscribers = newSubscribers - unsubscribedSubscribers;

	return {
		newslettersPublished,
		emailOpens,
		averageCtr: ctrCount > 0 ? ctrTotal / ctrCount : null,
		netSubscribers,
	};
}

export default async function NewsletterMetrics() {
	const metrics = await getRollingNewsletterMetrics(NEWSLETTER_ROLLING_DAYS);

	return (
		<section className="app-panel p-4">
			<div className="mb-3 flex items-center justify-between">
				<h3 className="text-sm font-semibold">Newsletter</h3>
				<p className="app-text-muted text-xs">Last 30 days</p>
			</div>
			<div className="grid grid-cols-4 gap-3">
				<div className="rounded-md border border-foreground/15 p-3">
					<p className="app-text-muted text-xs">Newsletters Published</p>
					<p className="mt-1 text-lg font-semibold leading-none">{formatNumber(metrics.newslettersPublished)}</p>
				</div>
				<div className="rounded-md border border-foreground/15 p-3">
					<p className="app-text-muted text-xs">Emails Opened</p>
					<p className="mt-1 text-lg font-semibold leading-none">{formatNumber(metrics.emailOpens)}</p>
				</div>
				<div className="rounded-md border border-foreground/15 p-3">
					<p className="app-text-muted text-xs">Average CTR</p>
					<p className="mt-1 text-lg font-semibold leading-none">{formatPercent(metrics.averageCtr)}</p>
				</div>
				<div className="rounded-md border border-foreground/15 p-3">
					<p className="app-text-muted text-xs">Net Subscribers</p>
					<p className="mt-1 text-lg font-semibold leading-none">{formatNumber(metrics.netSubscribers)}</p>
				</div>
			</div>
		</section>
	);
}
