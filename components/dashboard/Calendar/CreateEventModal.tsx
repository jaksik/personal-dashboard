"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSystemEventAction } from "@/app/actions/events";

type CreateEventModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("personal");
  const [scheduledDate, setScheduledDate] = useState("");
  const [status, setStatus] = useState("planned");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await createSystemEventAction({
        name,
        domain,
        scheduledDate,
        status,
        details,
      });

      setName("");
      setDomain("personal");
      setScheduledDate("");
      setStatus("planned");
      setDetails("");
      router.refresh();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create event.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="app-panel w-full max-w-lg p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold">Create Event</h3>
          <button
            type="button"
            onClick={onClose}
            className="app-text-muted text-sm underline-offset-4 hover:underline"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="space-y-1">
            <label htmlFor="event-name" className="app-text-muted text-xs">
              Name
            </label>
            <input
              id="event-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="event-domain" className="app-text-muted text-xs">
                Domain
              </label>
              <input
                id="event-domain"
                value={domain}
                onChange={(event) => setDomain(event.target.value)}
                className="w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="event-status" className="app-text-muted text-xs">
                Status
              </label>
              <select
                id="event-status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm"
                required
              >
                <option value="planned">planned</option>
                <option value="in_progress">in_progress</option>
                <option value="completed">completed</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="event-scheduled-date" className="app-text-muted text-xs">
              Scheduled Date
            </label>
            <input
              id="event-scheduled-date"
              type="date"
              value={scheduledDate}
              onChange={(event) => setScheduledDate(event.target.value)}
              className="w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="event-details" className="app-text-muted text-xs">
              Details (optional)
            </label>
            <textarea
              id="event-details"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              className="min-h-20 w-full rounded-md border border-foreground/20 bg-transparent px-3 py-2 text-sm"
            />
          </div>

          {errorMessage ? <p className="text-sm text-red-400">{errorMessage}</p> : null}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-foreground/20 px-3 py-2 text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md border border-foreground/20 px-3 py-2 text-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
