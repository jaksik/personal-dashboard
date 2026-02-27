"use client";

import { useEffect, useMemo, useState } from "react";

const DEFAULT_SECONDS = 30 * 60;

function formatRemainingTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function BeeHiivCountdownTimer() {
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_SECONDS);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const formattedTime = useMemo(
    () => formatRemainingTime(remainingSeconds),
    [remainingSeconds]
  );

  return (
    <div
      className="rounded-md border border-foreground/15 px-3 py-2"
      aria-live="polite"
      aria-label="Countdown timer"
    >
      <p className="app-text-muted text-xs"></p>
      <p className="text-sm font-semibold">{formattedTime}</p>
    </div>
  );
}
