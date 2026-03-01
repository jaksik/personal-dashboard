import type { ReactNode } from "react";
import BeeHiivMetricsRow from "@/components/BeeHiiv/BeeHiivMetricsRow";

export type NewsletterDropdownDetailGroup = {
  primary: ReactNode;
  secondary?: ReactNode;
};

export function getNewsletterDropdownContentById(): Record<string, NewsletterDropdownDetailGroup> {
  return {
  "ai-entrepreneur": {
    primary: (
      <BeeHiivMetricsRow />
    ),
    secondary: (
      <div className="space-y-3">

      </div>
    ),
  },
  };
}