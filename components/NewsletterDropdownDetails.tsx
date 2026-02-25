import type { ReactNode } from "react";
import { operationLogTargets } from "@/components/BeeHiiv/BeeHiivCreateTabLogTargets";
import BeeHiivCurateTab from "@/components/BeeHiiv/BeeHiivCurateTab";
import BeeHiivDesignTab from "@/components/BeeHiiv/BeeHiivDesignTab";
import BeeHiivReviewTab from "@/components/BeeHiiv/BeeHiivReviewTab";
import DetailTabs from "@/components/BeeHiiv/OperationTabs";
import OperationLogStatusList from "@/components/BeeHiiv/BeeHiivCreateTab";

export const newsletterDropdownDetailsById: Record<string, ReactNode> = {
  "ai-entrepreneur": (
    <div className="space-y-3">
      <h4 className="text-sm">Task to Complete:</h4>
      <h4 className="text-lg font-semibold">Publish Newsletter</h4>

      <DetailTabs
        overviewContent={<OperationLogStatusList items={operationLogTargets} />}
        curateContent={<BeeHiivCurateTab />}
        designContent={<BeeHiivDesignTab />}
        reviewContent={<BeeHiivReviewTab />}
      />
    </div>
  ),
  "growth-ops": (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold">Growth Ops Snapshot</h4>
      <p className="app-text-muted text-sm">
        This slot is ready for a custom component that can hydrate campaign,
        conversion, and funnel metrics.
      </p>
      <DetailTabs
        overviewContent={<OperationLogStatusList items={operationLogTargets} />}
        curateContent={<BeeHiivCurateTab />}
        designContent={<BeeHiivDesignTab />}
        reviewContent={<BeeHiivReviewTab />}
      />
    </div>
  ),
  "saas-intelligence": (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold">SaaS Intelligence Notes</h4>
      <ul className="app-text-muted list-disc space-y-1 pl-5 text-sm">
        <li>Top three trends to cover this week</li>
        <li>Competitor tracking summary widget placeholder</li>
        <li>Upcoming topics and sponsor slot placeholder</li>
      </ul>
    </div>
  ),
};