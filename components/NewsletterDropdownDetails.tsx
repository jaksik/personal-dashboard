import type { ReactNode } from "react";
import BeeHiivCurateTab from "@/components/BeeHiiv/TaskTabs/BeeHiivCurateTab";
import BeeHiivDesignTab from "@/components/BeeHiiv/TaskTabs/BeeHiivDesignTab";
import BeeHiivReviewTab from "@/components/BeeHiiv/TaskTabs/BeeHiivReviewTab";
import BeeHiivNewsletterSelectorWithCreate from "./BeeHiiv/BeeHiivNewsletterSelectorWithCreate";
import DetailTabs from "@/components/BeeHiiv/TaskTabs";
import OperationLogStatusList from "@/components/BeeHiiv/TaskTabs/BeeHiivCreateTab";

export type NewsletterDropdownDetailGroup = {
  primary: ReactNode;
  secondary?: ReactNode;
};

export const newsletterDropdownContentById: Record<
  string,
  NewsletterDropdownDetailGroup
> = {
  "ai-entrepreneur": {
    primary: (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">AI Entrepreneur Notes</h4>
        <p className="app-text-muted text-sm">
          Reserve this section for secondary workflows, backlog items, or a deeper metrics view.
        </p>        
      </div>
    ),
    secondary: (
      <div className="space-y-3">
        <h4 className="app-text-muted text-sm">Task to Complete:</h4>
        <h4 className="text-lg font-semibold">Publish Newsletter on 2/27 by 9am</h4>
        <div className="flex justify-end">
          <BeeHiivNewsletterSelectorWithCreate />
        </div>

        <DetailTabs
          overviewContent={<OperationLogStatusList />}
          curateContent={<BeeHiivCurateTab />}
          designContent={<BeeHiivDesignTab />}
          reviewContent={<BeeHiivReviewTab />}
        />
      </div>
    ),
  },
  "growth-ops": {
    primary: (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold">Growth Ops Snapshot</h4>
        <p className="app-text-muted text-sm">
          This slot is ready for a custom component that can hydrate campaign,
          conversion, and funnel metrics.
        </p>
      </div>
    ),
    secondary: (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Growth Ops Secondary Panel</h4>
        <p className="app-text-muted text-sm">
          Use this area for experiment logs, recent wins/losses, or channel-level drilldowns.
        </p>
      </div>
    ),
  },
  "saas-intelligence": {
    primary: (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">SaaS Intelligence Notes</h4>
        <ul className="app-text-muted list-disc space-y-1 pl-5 text-sm">
          <li>Top three trends to cover this week</li>
          <li>Competitor tracking summary widget placeholder</li>
          <li>Upcoming topics and sponsor slot placeholder</li>
        </ul>
      </div>
    ),
    secondary: (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold">SaaS Intelligence Secondary Panel</h4>
        <p className="app-text-muted text-sm">
          Add secondary market context, supporting charts, or action items here.
        </p>
      </div>
    ),
  },
};