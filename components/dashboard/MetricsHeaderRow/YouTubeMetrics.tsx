const YOUTUBE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const YOUTUBE_ANALYTICS_REPORTS_URL = "https://youtubeanalytics.googleapis.com/v2/reports";
const YOUTUBE_DATA_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

type YouTubeTotals = {
  videosPublished: number | null;
  netSubscribers: number | null;
  totalViews: number | null;
  totalWatchHours: number | null;
};

const YOUTUBE_ANALYTICS_SCOPE = "https://www.googleapis.com/auth/yt-analytics.readonly https://www.googleapis.com/auth/youtube.readonly";

function formatInteger(value: number | null) {
  if (value == null) {
    return "----";
  }

  return Math.round(value).toLocaleString("en-US");
}

function formatWatchHours(value: number | null) {
  if (value == null) {
    return "----";
  }

  return value.toLocaleString("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function toDateKey(value: Date) {
  const year = value.getUTCFullYear();
  const month = `${value.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${value.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function getGoogleAccessToken() {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const tokenResponse = await fetch(YOUTUBE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });

  if (!tokenResponse.ok) {
    return null;
  }

  const tokenJson = (await tokenResponse.json()) as { access_token?: string };
  return tokenJson.access_token ?? null;
}

function getNinetyDayDateRange() {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - 89);

  return {
    startDate,
    endDate,
  };
}

async function getNinetyDayYouTubeTotals(
  accessToken: string | null
): Promise<Pick<YouTubeTotals, "totalViews" | "totalWatchHours" | "netSubscribers">> {
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!accessToken || !channelId) {
    return {
      netSubscribers: null,
      totalViews: null,
      totalWatchHours: null,
    };
  }

  const { startDate, endDate } = getNinetyDayDateRange();

  const query = new URLSearchParams({
    ids: `channel==${channelId}`,
    startDate: toDateKey(startDate),
    endDate: toDateKey(endDate),
    metrics: "views,estimatedMinutesWatched,subscribersGained,subscribersLost",
  });

  const reportsResponse = await fetch(`${YOUTUBE_ANALYTICS_REPORTS_URL}?${query.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!reportsResponse.ok) {
    return {
      netSubscribers: null,
      totalViews: null,
      totalWatchHours: null,
    };
  }

  const reportsJson = (await reportsResponse.json()) as {
    rows?: Array<[number, number, number, number]>;
  };
  const [views, watchedMinutes, subscribersGained, subscribersLost] = reportsJson.rows?.[0] ?? [];

  if (
    typeof views !== "number" ||
    typeof watchedMinutes !== "number" ||
    typeof subscribersGained !== "number" ||
    typeof subscribersLost !== "number"
  ) {
    return {
      netSubscribers: null,
      totalViews: null,
      totalWatchHours: null,
    };
  }

  return {
    netSubscribers: subscribersGained - subscribersLost,
    totalViews: views,
    totalWatchHours: watchedMinutes / 60,
  };
}

async function getNinetyDayVideosPublished(accessToken: string | null): Promise<number | null> {
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  const apiKey = process.env.YOUTUBE_DATA_API_KEY;

  if (!channelId) {
    return null;
  }

  if (!apiKey && !accessToken) {
    return null;
  }

  const { startDate, endDate } = getNinetyDayDateRange();
  const publishedAfter = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), 0, 0, 0)).toISOString();
  const publishedBefore = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(), 23, 59, 59)).toISOString();

  let total = 0;
  let pageToken: string | null = null;

  for (let page = 0; page < 20; page += 1) {
    const query = new URLSearchParams({
      part: "id",
      channelId,
      type: "video",
      order: "date",
      maxResults: "50",
      publishedAfter,
      publishedBefore,
    });

    if (pageToken) {
      query.set("pageToken", pageToken);
    }

    if (apiKey) {
      query.set("key", apiKey);
    }

    const response = await fetch(`${YOUTUBE_DATA_SEARCH_URL}?${query.toString()}`, {
      method: "GET",
      headers: accessToken && !apiKey ? { Authorization: `Bearer ${accessToken}` } : undefined,
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as {
      items?: Array<{ id?: { videoId?: string } }>;
      nextPageToken?: string;
    };

    total += (json.items ?? []).filter((item) => Boolean(item.id?.videoId)).length;
    pageToken = json.nextPageToken ?? null;

    if (!pageToken) {
      break;
    }
  }

  return total;
}

function getYouTubeOauthUrl() {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  if (!clientId) {
    return null;
  }

  const redirectUri = process.env.YOUTUBE_OAUTH_REDIRECT_URI ?? "http://localhost:3000/oauth2/callback";
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: YOUTUBE_ANALYTICS_SCOPE,
    access_type: "offline",
    prompt: "consent",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export default async function YouTubeMetrics() {
  const accessToken = await getGoogleAccessToken();
  const [analyticsTotals, videosPublished] = await Promise.all([
    getNinetyDayYouTubeTotals(accessToken),
    getNinetyDayVideosPublished(accessToken),
  ]);

  const totals: YouTubeTotals = {
    videosPublished,
    netSubscribers: analyticsTotals.netSubscribers,
    totalViews: analyticsTotals.totalViews,
    totalWatchHours: analyticsTotals.totalWatchHours,
  };

  const oauthUrl = getYouTubeOauthUrl();
  const showConnectLink = !process.env.YOUTUBE_REFRESH_TOKEN && !process.env.YOUTUBE_DATA_API_KEY && Boolean(oauthUrl);

  return (
    <section className="app-panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">YouTube</h3>
        <p className="app-text-muted text-xs">Last 90 days</p>
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-md border border-foreground/15 p-3">
          <p className="app-text-muted text-xs">Videos Published</p>
          <p className="mt-1 text-lg font-semibold leading-none">{formatInteger(totals.videosPublished)}</p>
        </div>
        <div className="rounded-md border border-foreground/15 p-3">
          <p className="app-text-muted text-xs">Net Subscribers</p>
          <p className="mt-1 text-lg font-semibold leading-none">{formatInteger(totals.netSubscribers)}</p>
        </div>
        <div className="rounded-md border border-foreground/15 p-3">
          <p className="app-text-muted text-xs">Total Views</p>
          <p className="mt-1 text-lg font-semibold leading-none">{formatInteger(totals.totalViews)}</p>
          {showConnectLink ? (
            <a
              href={oauthUrl ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs underline underline-offset-4"
            >
              Connect YouTube
            </a>
          ) : null}
        </div>
        <div className="rounded-md border border-foreground/15 p-3">
          <p className="app-text-muted text-xs">Watch Hours</p>
          <p className="mt-1 text-lg font-semibold leading-none">{formatWatchHours(totals.totalWatchHours)}</p>
        </div>
      </div>
    </section>
  );
}