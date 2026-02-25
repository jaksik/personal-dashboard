import { formatMonthDay, truncateText } from "./helpers";
import type { JobPostingRow } from "./types";

type JobsTableProps = {
  isLoading: boolean;
  error: string | null;
  jobs: JobPostingRow[];
};

function formatRemoteFlag(value: boolean | null) {
  if (value === true) {
    return "Remote";
  }

  if (value === false) {
    return "On-site";
  }

  return "—";
}

export default function JobsTable({ isLoading, error, jobs }: JobsTableProps) {
  return (
    <div className="app-kpi overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-foreground/15 bg-foreground/5">
            <tr>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3 font-semibold">Company</th>
              <th className="px-4 py-3 font-semibold">Location</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Title</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center app-text-muted">
                  Loading jobs...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center app-text-danger">
                  {error}
                </td>
              </tr>
            ) : jobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center app-text-muted">
                  No job postings found.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.id} className="border-t border-foreground/10">
                  <td className="px-4 py-3 app-text-muted">
                    {formatMonthDay(job.created_at)}
                  </td>
                  <td className="px-4 py-3 app-text-muted">{job.company ?? "—"}</td>
                  <td className="px-4 py-3 app-text-muted">{job.location ?? "—"}</td>
                  <td className="px-4 py-3 app-text-muted">
                    {formatRemoteFlag(job.remote)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <p className="font-medium">{job.title ?? "Untitled role"}</p>
                      <p className="text-sm app-text-muted">
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
  );
}
