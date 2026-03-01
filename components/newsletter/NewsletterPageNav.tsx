"use client";

import type { ReactNode } from "react";
import Link from "next/link";

type NewsletterPageNavProps = {
  centerContent?: ReactNode;
  rightActions?: ReactNode;
  leftActions?: ReactNode;
  compactDashboardButton?: boolean;
};

export default function NewsletterPageNav({
  centerContent,
  rightActions,
  leftActions,
  compactDashboardButton = false,
}: NewsletterPageNavProps) {
  return (
    <div className="my-2 px-1">
      <div className="relative flex min-h-10 items-center">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center">
          <div className="pointer-events-auto flex items-center gap-2">
            {compactDashboardButton ? (
              <Link
                href="/"
                className="app-btn-ghost inline-flex h-9 w-9 items-center justify-center"
                aria-label="Back to dashboard"
                title="Back to dashboard"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path
                    d="M12 4.5 4.5 10.5v8a1 1 0 0 0 1 1h5v-6h3v6h5a1 1 0 0 0 1-1v-8L12 4.5Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            ) : (
              <Link href="/" className="app-btn-ghost px-4 py-2 text-sm font-medium">
                Back to dashboard
              </Link>
            )}
            {leftActions}
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl">{centerContent}</div>

        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 flex items-center">
          <div className="pointer-events-auto">{rightActions}</div>
        </div>
      </div>
    </div>
  );
}