"use client";

import { useState } from "react";

type PublishCopyButtonProps = {
  htmlPayload: string;
  plainTextPayload: string;
};

export default function PublishCopyButton({ htmlPayload, plainTextPayload }: PublishCopyButtonProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function handleCopy() {
    setStatusMessage(null);

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
        className="app-neon-badge app-neon-cyan inline-flex items-center px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition"
      >
        Copy Payload
      </button>

      {statusMessage ? <p className="app-text-muted text-xs">{statusMessage}</p> : null}
    </div>
  );
}
