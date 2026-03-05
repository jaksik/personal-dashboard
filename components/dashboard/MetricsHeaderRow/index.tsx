import YouTubeMetrics from "@/components/dashboard/MetricsHeaderRow/YouTubeMetrics";
import NewsletterMetrics from "@/components/dashboard/MetricsHeaderRow/NewsletterMetrics";

export default function MetricsHeaderRow() {
  return (
    <div className="mb-3 space-y-3">
      <div className="flex flex-row gap-4 *:min-w-0 *:flex-1">
        <YouTubeMetrics />
        <NewsletterMetrics />
      </div>
    </div>
  );
}
