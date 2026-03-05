"use client";

type ViewEvent = {
  id: number;
  name: string;
  status: string;
  domain: string;
  scheduled_date: string;
  details: string | null;
};

type ViewEventModalProps = {
  event: ViewEvent | null;
  isOpen: boolean;
  onClose: () => void;
};

function formatStatus(status: string) {
  if (status === "in_progress") {
    return "In Progress";
  }

  if (status === "completed") {
    return "Completed";
  }

  return "Planned";
}

function formatDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export default function ViewEventModal({ event, isOpen, onClose }: ViewEventModalProps) {
  if (!isOpen || !event) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="app-panel w-full max-w-lg p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold">Event Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="app-text-muted text-sm underline-offset-4 hover:underline"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm">
          <div>
            <p className="app-text-muted text-xs">Name</p>
            <p className="mt-1 font-medium">{event.name}</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="app-text-muted text-xs">Status</p>
              <p className="mt-1">{formatStatus(event.status)}</p>
            </div>
            <div>
              <p className="app-text-muted text-xs">Domain</p>
              <p className="mt-1">{event.domain}</p>
            </div>
          </div>

          <div>
            <p className="app-text-muted text-xs">Scheduled Date</p>
            <p className="mt-1">{formatDate(event.scheduled_date)}</p>
          </div>

          <div>
            <p className="app-text-muted text-xs">Details</p>
            <p className="mt-1 whitespace-pre-wrap">{event.details?.trim() || "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
