import type { JobPostingRow } from "./types";

type CurateJobsTableProps = {
  targetNewsletterTitle: string | null;
  hasTargetNewsletter: boolean;
  actionError: string | null;
  isLoading: boolean;
  error: string | null;
  jobs: JobPostingRow[];
  addJobToNewsletter: (jobId: number) => void;
  addingJobIds: number[];
  isJobInTargetNewsletter: (job: JobPostingRow) => boolean;
};

function formatMonthDay(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}`;
}

function truncateText(value: string | null, maxLength: number) {
  if (!value) {
    return "—";
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}…`;
}

function formatRemoteFlag(value: boolean | null) {
  if (value === true) {
    return "Remote";
  }

  if (value === false) {
    return "On-site";
  }

  return "—";
}

export default function CurateJobsTable({
  targetNewsletterTitle,
  hasTargetNewsletter,
  actionError,
  isLoading,
  error,
  jobs,
  addJobToNewsletter,
  addingJobIds,
  isJobInTargetNewsletter,
}: CurateJobsTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-foreground/10 bg-foreground/2 px-4 py-3">
        <p className="app-text-muted text-sm font-medium">
          Target newsletter: {targetNewsletterTitle ?? "None in last 12 hours"}
        </p>
      </div>

      {actionError ? (
        <p className="app-text-danger rounded-lg border border-current/25 px-3 py-2 text-sm">
          {actionError}
        </p>
      ) : null}

      <div className="app-kpi overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-foreground/15 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/90">
              <tr>
                <th className="px-4 py-3 font-semibold">Created</th>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Type</th>
                <th className="px-4 py-3 font-semibold">Add</th>
                <th className="px-4 py-3 font-semibold">Title</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center app-text-muted">
                    Loading jobs...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center app-text-danger">
                    {error}
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center app-text-muted">
                    No job postings found.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="border-t border-foreground/10 align-top transition hover:bg-foreground/2">
                    <td className="px-4 py-4 app-text-muted">{formatMonthDay(job.created_at)}</td>
                    <td className="px-4 py-4 app-text-muted">{job.company ?? "—"}</td>
                    <td className="px-4 py-4 app-text-muted">{job.location ?? "—"}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-md border border-foreground/15 bg-foreground/3 px-2 py-1 text-xs app-text-muted">
                        {formatRemoteFlag(job.remote)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => addJobToNewsletter(job.id)}
                        disabled={
                          !hasTargetNewsletter ||
                          isJobInTargetNewsletter(job) ||
                          addingJobIds.includes(job.id)
                        }
                        className="app-btn-ghost px-2 py-1 text-xs font-medium disabled:opacity-60"
                      >
                        {isJobInTargetNewsletter(job)
                          ? "Added"
                          : addingJobIds.includes(job.id)
                            ? "Adding..."
                            : "Add"}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1.5">
                        <p className="font-semibold leading-tight">{job.title ?? "Untitled role"}</p>
                        <p className="text-sm app-text-muted leading-relaxed">
                          {truncateText(job.description, 220)}
                        </p>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}