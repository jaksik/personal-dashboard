"use client";

import { useState } from "react";

type LogRow = {
  id: number;
  created_at: string;
  category: string | null;
  name: string | null;
  message: string | null;
  status: string | null;
};

type BeeHiivCreateTabStatusRowProps = {
  label: string;
  success: boolean;
  summary: string;
  logs: LogRow[];
};

function formatTableDate(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function isLogSuccess(status: string | null) {
  return status?.toLowerCase() === "success";
}

function SuccessIcon({ sizeClassName = "h-8 w-8" }: { sizeClassName?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={sizeClassName} aria-label="Success">
      <circle cx="12" cy="12" r="10" fill="none" stroke="#65e26d" strokeWidth="1.8" />
      <path
        d="M7.5 12.2 10.6 15.3 16.7 9.2"
        fill="none"
        stroke="#65e26d"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PendingIcon({ sizeClassName = "h-8 w-8" }: { sizeClassName?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={sizeClassName} aria-label="Pending">
      <circle cx="12" cy="12" r="10" fill="none" stroke="#facc15" strokeWidth="1.8" />
      <path
        d="M12 7.5v5l3 2"
        fill="none"
        stroke="#facc15"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function BeeHiivCreateTabStatusRow({
  label,
  success,
  summary,
  logs,
}: BeeHiivCreateTabStatusRowProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setIsOpen((current) => !current)}>
          {success ? <SuccessIcon /> : <PendingIcon />}
        </button>
        <p className="font-medium sm:text-base">
          <span className="font-semibold">{label}</span> <span className="text-md">{summary}</span>
        </p>
      </div>

      {isOpen ? (
        <div className="mt-3 overflow-hidden rounded-xl border border-foreground/15">
          <table className="w-full table-fixed text-left">
            <colgroup>
              <col className="w-10" />
              <col className="w-36" />
              <col className="w-38" />
              <col />
            </colgroup>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log) => {
                  const rowSuccess = isLogSuccess(log.status);

                  return (
                    <tr key={log.id} className="border-b border-foreground/15 last:border-b-0">
                      <td className="pl-5 py-3 align-middle">
                        {rowSuccess ? (
                          <SuccessIcon sizeClassName="h-4 w-4" />
                        ) : (
                          <PendingIcon sizeClassName="h-4 w-4" />
                        )}
                      </td>
                      <td className="px-1 py-3 align-middle text-sm font-medium">
                        {formatTableDate(log.created_at)}
                      </td>
                      <td className="px-1 py-3 align-middle text-sm font-medium">
                        {log.name ?? "-"}
                      </td>
                      <td className="px-4 py-3 align-middle text-sm font-medium">
                        {log.message ?? "-"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="px-5 py-3 text-sm" colSpan={4}>
                    No logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
