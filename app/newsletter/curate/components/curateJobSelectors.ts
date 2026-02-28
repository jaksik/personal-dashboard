import { normalizeText, parseDate } from "./curateHelpers";
import type { ArticleNewsletterFilter, JobPostingRow, JobSortKey } from "./types";

type TargetNewsletter = {
    id: number;
    title: string | null;
} | null;

export function getJobCompanies(jobPostings: JobPostingRow[]) {
    const unique = new Set<string>();

    for (const job of jobPostings) {
        if (job.company) {
            unique.add(job.company);
        }
    }

    return Array.from(unique).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base", numeric: true })
    );
}

export function getJobLocations(jobPostings: JobPostingRow[]) {
    const unique = new Set<string>();

    for (const job of jobPostings) {
        if (job.location) {
            unique.add(job.location);
        }
    }

    return Array.from(unique).sort((a, b) =>
        a.localeCompare(b, undefined, { sensitivity: "base", numeric: true })
    );
}

export function getVisibleJobs(params: {
    jobPostings: JobPostingRow[];
    jobSearch: string;
    jobCompany: string;
    jobLocation: string;
    jobRemoteFilter: string;
    jobNewsletterFilter: ArticleNewsletterFilter;
    jobDateFrom: string;
    jobDateTo: string;
    jobSortKey: JobSortKey;
    jobSortDirection: "asc" | "desc";
    targetNewsletter: TargetNewsletter;
}) {
    const {
        jobPostings,
        jobSearch,
        jobCompany,
        jobLocation,
        jobRemoteFilter,
        jobNewsletterFilter,
        jobDateFrom,
        jobDateTo,
        jobSortKey,
        jobSortDirection,
        targetNewsletter,
    } = params;

    const searchTokens = jobSearch
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

    const filtered = jobPostings.filter((job) => {
        if (jobCompany !== "all" && job.company !== jobCompany) {
            return false;
        }

        if (jobLocation !== "all" && job.location !== jobLocation) {
            return false;
        }

        const matchesRemote =
            jobRemoteFilter === "all" ||
            (jobRemoteFilter === "remote" && job.remote === true) ||
            (jobRemoteFilter === "onsite" && job.remote === false);

        if (!matchesRemote) {
            return false;
        }

        const assignedNewsletterId = job.newsletter_id;
        if (jobNewsletterFilter === "unassigned" && assignedNewsletterId !== null) {
            return false;
        }
        if (jobNewsletterFilter === "assigned" && assignedNewsletterId === null) {
            return false;
        }
        if (jobNewsletterFilter === "target") {
            if (!targetNewsletter || assignedNewsletterId !== targetNewsletter.id) {
                return false;
            }
        }
        if (jobNewsletterFilter === "other") {
            if (
                !targetNewsletter ||
                assignedNewsletterId === null ||
                assignedNewsletterId === targetNewsletter.id
            ) {
                return false;
            }
        }

        if (jobDateFrom || jobDateTo) {
            const jobTime = parseDate(job.posted_date) ?? parseDate(job.created_at);
            if (jobTime === null) {
                return false;
            }

            if (jobDateFrom) {
                const fromTime = new Date(`${jobDateFrom}T00:00:00`).getTime();
                if (!Number.isNaN(fromTime) && jobTime < fromTime) {
                    return false;
                }
            }

            if (jobDateTo) {
                const toTime = new Date(`${jobDateTo}T23:59:59.999`).getTime();
                if (!Number.isNaN(toTime) && jobTime > toTime) {
                    return false;
                }
            }
        }

        if (searchTokens.length === 0) {
            return true;
        }

        const haystack = [
            job.title,
            job.description,
            job.company,
            job.location,
            job.remote === true ? "remote" : job.remote === false ? "onsite" : null,
        ]
            .map((value) => normalizeText(value))
            .filter(Boolean)
            .join(" ");

        return searchTokens.every((token) => haystack.includes(token));
    });

    filtered.sort((left, right) => {
        const direction = jobSortDirection === "asc" ? 1 : -1;

        if (jobSortKey === "created_at" || jobSortKey === "posted_date") {
            const leftTime = parseDate(left[jobSortKey]);
            const rightTime = parseDate(right[jobSortKey]);

            if (leftTime === null && rightTime !== null) {
                return 1;
            }

            if (leftTime !== null && rightTime === null) {
                return -1;
            }

            if (leftTime !== null && rightTime !== null && leftTime !== rightTime) {
                return (leftTime - rightTime) * direction;
            }
        } else if (jobSortKey === "remote") {
            const leftValue = left.remote === true ? 2 : left.remote === false ? 1 : 0;
            const rightValue = right.remote === true ? 2 : right.remote === false ? 1 : 0;

            if (leftValue !== rightValue) {
                return (leftValue - rightValue) * direction;
            }
        } else {
            const leftText = normalizeText(left[jobSortKey]);
            const rightText = normalizeText(right[jobSortKey]);

            if (!leftText && rightText) {
                return 1;
            }

            if (leftText && !rightText) {
                return -1;
            }

            const compared = leftText.localeCompare(rightText, undefined, {
                sensitivity: "base",
                numeric: true,
            });

            if (compared !== 0) {
                return compared * direction;
            }
        }

        const fallbackLeft = parseDate(left.created_at) ?? 0;
        const fallbackRight = parseDate(right.created_at) ?? 0;

        if (fallbackLeft !== fallbackRight) {
            return (fallbackRight - fallbackLeft) * direction;
        }

        return left.id - right.id;
    });

    return filtered;
}
