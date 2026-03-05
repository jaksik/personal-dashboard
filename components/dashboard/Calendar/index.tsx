"use client";

import { useState } from "react";
import type { Tables } from "@/utils/supabase/database.types";
import CreateEventModal from "@/components/dashboard/Calendar/CreateEventModal";
import ViewEventModal from "@/components/dashboard/Calendar/ViewEventModal";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const totalCells = 42;
const activeDaysCount = 36;

type CalendarEvent = Pick<
  Tables<{ schema: "system" }, "events">,
  "id" | "name" | "scheduled_date" | "status" | "domain" | "details"
>;

type CalendarProps = {
  events: CalendarEvent[];
};

function toDateKey(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toEventDateKey(value: string) {
  return value.slice(0, 10);
}

function getStatusBadgeStyle(status: string) {
  if (status === "completed") {
    return { color: "var(--chart-2)", borderColor: "color-mix(in oklab, var(--chart-2) 40%, transparent)" };
  }

  if (status === "in_progress") {
    return { color: "var(--chart-4)", borderColor: "color-mix(in oklab, var(--chart-4) 40%, transparent)" };
  }

  return { color: "var(--app-text-muted)", borderColor: "color-mix(in oklab, var(--app-text-muted) 35%, transparent)" };
}

export default function Calendar({ events }: CalendarProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const firstDate = new Date();
  firstDate.setHours(0, 0, 0, 0);
  const todayColumnIndex = (firstDate.getDay() + 6) % 7;

  const cells = Array.from({ length: totalCells }, (_, index) => {
    const dayOffset = index - todayColumnIndex;

    if (dayOffset < 0 || dayOffset >= activeDaysCount) {
      return null;
    }

    const value = new Date(firstDate);
    value.setDate(firstDate.getDate() + dayOffset);
    return value;
  });

  const eventsByDate = events.reduce<Record<string, CalendarEvent[]>>((accumulator, event) => {
    const key = toEventDateKey(event.scheduled_date);

    if (!accumulator[key]) {
      accumulator[key] = [];
    }

    accumulator[key].push(event);
    return accumulator;
  }, {});

  return (
    <div className="app-panel flex h-96 flex-col p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="app-text-muted text-sm font-semibold">Calendar</h2>
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-md border border-foreground/20 px-2.5 py-1 text-xs"
        >
          New Event
        </button>
      </div>

      <div className="app-text-muted mt-3 grid grid-cols-7 border border-foreground/10 text-center text-[11px] font-medium">
        {weekdays.map((day) => (
          <span key={day} className="border-r border-foreground/10 py-2 last:border-r-0">
            {day}
          </span>
        ))}
      </div>

      <div className="app-scrollbox flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 border-x border-b border-foreground/10">
          {cells.map((dateValue, index) => {
            if (!dateValue) {
              return (
                <div
                  key={`filler-${index}`}
                  className="min-h-24 border-r border-t border-foreground/10 bg-foreground/5 p-2 last:border-r-0"
                />
              );
            }

            const dateKey = toDateKey(dateValue);
            const dayEvents = eventsByDate[dateKey] ?? [];
            const isToday = index === todayColumnIndex;

            return (
              <div
                key={dateKey}
                className="min-h-24 border-r border-t border-foreground/10 p-2 text-left text-xs last:border-r-0"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium">{dateValue.getDate()}</span>
                  {isToday ? (
                    <span className="app-text-muted rounded border border-foreground/20 px-1.5 py-0.5 text-[10px]">
                      Today
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <button
                      type="button"
                      key={event.id}
                      className="flex items-center gap-1.5 rounded border border-foreground/15 px-1.5 py-1 text-[10px]"
                      title={`${event.name} (${event.status})`}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: getStatusBadgeStyle(event.status).color }}
                      />
                      <p className="truncate">{event.name}</p>
                    </button>
                  ))}
                  {dayEvents.length > 2 ? (
                    <p className="app-text-muted text-[10px]">+{dayEvents.length - 2} more</p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <ViewEventModal
        event={selectedEvent}
        isOpen={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}
