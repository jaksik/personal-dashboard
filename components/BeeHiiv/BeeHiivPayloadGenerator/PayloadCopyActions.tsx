"use client";

import { useState } from "react";

type PayloadCopyActionsProps = {
  htmlPayload: string;
  plainTextPayload: string;
};

export default function PayloadCopyActions({
  htmlPayload,
  plainTextPayload,
}: PayloadCopyActionsProps) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function copyCompletePayload() {
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
      setStatusMessage("Copy failed. Please copy manually from the payload preview.");
    }
  }

  async function copyPlainText() {
    setStatusMessage(null);

    try {
      await navigator.clipboard.writeText(plainTextPayload);
      setStatusMessage("Plain text copied.");
    } catch {
      setStatusMessage("Copy failed. Please copy manually from the payload preview.");
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={copyCompletePayload}
          className="app-btn px-3 py-2 text-xs font-medium"
        >
          Copy for Beehiiv
        </button>
        <button
          type="button"
          onClick={copyPlainText}
          className="app-btn-ghost px-3 py-2 text-xs font-medium"
        >
          Copy Plain Text
        </button>
      </div>

      {statusMessage ? (
        <p className="app-text-muted text-xs">{statusMessage}</p>
      ) : null}
    </div>
  );
}
