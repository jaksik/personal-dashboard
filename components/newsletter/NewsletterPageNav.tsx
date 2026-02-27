"use client";

import type { ReactNode } from "react";
import Link from "next/link";

type NewsletterPageNavProps = {
  centerContent?: ReactNode;
  rightActions?: ReactNode;
};

export default function NewsletterPageNav({
  centerContent,
  rightActions,
}: NewsletterPageNavProps) {
  return (
    <div className="my-2 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-1">
      <div className="shrink-0 justify-self-start">
        <Link href="/" className="app-btn-ghost px-4 py-2 text-sm font-medium">
          Back to dashboard
        </Link>
      </div>

      <div className="mx-auto w-full max-w-6xl">{centerContent}</div>

      <div className="shrink-0 justify-self-end">{rightActions}</div>
    </div>
  );
}