import { useState } from "react";
import type { JobPostingRow, JobSortKey } from "./types";

type CurateJobsTableProps = {
  hasTargetNewsletter: boolean;
  actionError: string | null;
  isLoading: boolean;
  error: string | null;
  jobs: JobPostingRow[];
  jobSortKey: JobSortKey;
  jobSortDirection: "asc" | "desc";
  applyJobSort: (nextKey: JobSortKey) => void;
  updateJobDocument: (
    jobId: number,
    updates: {
      title: string | null;
      description: string | null;
      company: string | null;
      location: string | null;
      remote: boolean | null;
      posted_date: string | null;
      apply_link: string | null;
    }
  ) => Promise<void>;
  updatingJobDocumentIds: number[];
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

function sortIndicator(sortKey: JobSortKey, activeSortKey: JobSortKey, sortDirection: "asc" | "desc") {
  if (sortKey !== activeSortKey) {
    return "↕";
  }

  return sortDirection === "asc" ? "↑" : "↓";
}

export default function CurateJobsTable({
  hasTargetNewsletter,
  actionError,
  isLoading,
  error,
  jobs,
  jobSortKey,
  jobSortDirection,
  applyJobSort,
  updateJobDocument,
  updatingJobDocumentIds,
  addJobToNewsletter,
  addingJobIds,
  isJobInTargetNewsletter,
}: CurateJobsTableProps) {
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<{
    title: string;
    description: string;
    company: string;
    location: string;
    remote: "unknown" | "remote" | "onsite";
    posted_date: string;
    apply_link: string;
  }>({
    title: "",
    description: "",
    company: "",
    location: "",
    remote: "unknown",
    posted_date: "",
    apply_link: "",
  });

  function startEditing(job: JobPostingRow) {
    setEditingJobId(job.id);
    setEditDraft({
      title: job.title ?? "",
      description: job.description ?? "",
      company: job.company ?? "",
      location: job.location ?? "",
      remote: job.remote === true ? "remote" : job.remote === false ? "onsite" : "unknown",
      posted_date: job.posted_date ? job.posted_date.slice(0, 10) : "",
      apply_link: job.apply_link ?? "",
    });
  }

  async function saveJobEdits(jobId: number) {
    const remoteValue =
      editDraft.remote === "remote"
        ? true
        : editDraft.remote === "onsite"
          ? false
          : null;

    try {
      await updateJobDocument(jobId, {
        title: editDraft.title,
        description: editDraft.description,
        company: editDraft.company,
        location: editDraft.location,
        remote: remoteValue,
        posted_date: editDraft.posted_date || null,
        apply_link: editDraft.apply_link,
      });
      setEditingJobId(null);
    } catch {
      return;
    }
  }

  return (
    <div className="space-y-4">

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
                <th className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => applyJobSort("created_at")} className="relative pr-3 transition hover:opacity-80">
                    Created
                    <span className="absolute right-0 top-1/2 -translate-y-1/2" aria-hidden>
                      {sortIndicator("created_at", jobSortKey, jobSortDirection)}
                    </span>
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => applyJobSort("posted_date")} className="relative pr-3 transition hover:opacity-80">
                    Posted
                    <span className="absolute right-0 top-1/2 -translate-y-1/2" aria-hidden>
                      {sortIndicator("posted_date", jobSortKey, jobSortDirection)}
                    </span>
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => applyJobSort("company")} className="relative pr-3 transition hover:opacity-80">
                    Company
                    <span className="absolute right-0 top-1/2 -translate-y-1/2" aria-hidden>
                      {sortIndicator("company", jobSortKey, jobSortDirection)}
                    </span>
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => applyJobSort("location")} className="relative pr-3 transition hover:opacity-80">
                    Location
                    <span className="absolute right-0 top-1/2 -translate-y-1/2" aria-hidden>
                      {sortIndicator("location", jobSortKey, jobSortDirection)}
                    </span>
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => applyJobSort("remote")} className="relative pr-3 transition hover:opacity-80">
                    Type
                    <span className="absolute right-0 top-1/2 -translate-y-1/2" aria-hidden>
                      {sortIndicator("remote", jobSortKey, jobSortDirection)}
                    </span>
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold">Add</th>
                <th className="px-4 py-3 font-semibold">
                  <button type="button" onClick={() => applyJobSort("title")} className="relative pr-3 transition hover:opacity-80">
                    Title
                    <span className="absolute right-0 top-1/2 -translate-y-1/2" aria-hidden>
                      {sortIndicator("title", jobSortKey, jobSortDirection)}
                    </span>
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold text-right">Edit</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center app-text-muted">
                    Loading jobs...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center app-text-danger">
                    {error}
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center app-text-muted">
                    No job postings found.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="border-t border-foreground/10 align-top transition hover:bg-foreground/2">
                    <td className="px-4 py-4 app-text-muted">{formatMonthDay(job.created_at)}</td>
                    <td className="px-4 py-4 app-text-muted">{formatMonthDay(job.posted_date)}</td>
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
                      {editingJobId === job.id ? (
                        <div className="space-y-2">
                          <input
                            value={editDraft.title}
                            onChange={(event) =>
                              setEditDraft((current) => ({ ...current, title: event.target.value }))
                            }
                            className="app-input h-8 text-xs"
                            placeholder="Title"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              value={editDraft.company}
                              onChange={(event) =>
                                setEditDraft((current) => ({ ...current, company: event.target.value }))
                              }
                              className="app-input h-8 text-xs"
                              placeholder="Company"
                            />
                            <input
                              value={editDraft.location}
                              onChange={(event) =>
                                setEditDraft((current) => ({ ...current, location: event.target.value }))
                              }
                              className="app-input h-8 text-xs"
                              placeholder="Location"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <select
                              value={editDraft.remote}
                              onChange={(event) =>
                                setEditDraft((current) => ({
                                  ...current,
                                  remote: event.target.value as "unknown" | "remote" | "onsite",
                                }))
                              }
                              className="app-input h-8 text-xs"
                            >
                              <option value="unknown">—</option>
                              <option value="remote">Remote</option>
                              <option value="onsite">On-site</option>
                            </select>
                            <input
                              type="date"
                              value={editDraft.posted_date}
                              onChange={(event) =>
                                setEditDraft((current) => ({ ...current, posted_date: event.target.value }))
                              }
                              className="app-input h-8 text-xs"
                            />
                          </div>
                          <input
                            value={editDraft.apply_link}
                            onChange={(event) =>
                              setEditDraft((current) => ({ ...current, apply_link: event.target.value }))
                            }
                            className="app-input h-8 text-xs"
                            placeholder="Apply link"
                          />
                          <textarea
                            value={editDraft.description}
                            onChange={(event) =>
                              setEditDraft((current) => ({ ...current, description: event.target.value }))
                            }
                            className="app-input min-h-20 text-xs"
                            placeholder="Description"
                          />
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => saveJobEdits(job.id)}
                              disabled={updatingJobDocumentIds.includes(job.id)}
                              className="app-btn-ghost px-2 py-1 text-xs font-medium disabled:opacity-60"
                            >
                              {updatingJobDocumentIds.includes(job.id) ? "Saving..." : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingJobId(null)}
                              disabled={updatingJobDocumentIds.includes(job.id)}
                              className="app-btn-ghost px-2 py-1 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <p className="font-semibold leading-tight">{job.title ?? "Untitled role"}</p>
                          <p className="text-sm app-text-muted leading-relaxed">
                            {truncateText(job.description, 220)}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          editingJobId === job.id ? setEditingJobId(null) : startEditing(job)
                        }
                        className="app-btn-ghost inline-flex h-7 w-7 items-center justify-center rounded-full p-0 text-xs font-medium"
                        aria-label={`Edit job ${job.id}`}
                      >
                        ✎
                      </button>
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