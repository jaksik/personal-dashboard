"use client";

import { useState } from "react";

const BEEHIIV_TEMPLATE_LIBRARY_URL =
  "https://app.beehiiv.com/posts/template-library?tab=my_templates";

type PublishCopyButtonProps = {
  htmlPayload: string;
  plainTextPayload: string;
  label?: string;
  buttonClassName?: string;
};

export default function PublishCopyButton({
  htmlPayload,
  plainTextPayload,
  label = "Copy Payload",
  buttonClassName,
}: PublishCopyButtonProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function handleCopy() {
    setStatusMessage(null);
    window.open(BEEHIIV_TEMPLATE_LIBRARY_URL, "_blank", "noopener,noreferrer");

    try {
      if (typeof ClipboardItem !== "undefined") {
        const item = new ClipboardItem({
          "text/html": new Blob([htmlPayload], { type: "text/html" }),
          "text/plain": new Blob([plainTextPayload], { type: "text/plain" }),
        });

        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(plainTextPayload);
      }

      setStatusMessage("Payload copied.");
    } catch {
      setStatusMessage("Copy failed. Please copy manually from the payload panel.");
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleCopy}
        className={
          buttonClassName ??
          "app-neon-badge app-neon-cyan inline-flex items-center px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition"
        }
      >
        {label}
      </button>

      {statusMessage ? <p className="app-text-muted text-xs">{statusMessage}</p> : null}
    </div>
  );
}
