import type { ReactNode } from "react";
import BeeHiivCurateTab from "@/components/BeeHiiv/TaskTabs/BeeHiivCurateTab";
import BeeHiivDesignTab from "@/components/BeeHiiv/TaskTabs/BeeHiivDesignTab";
import BeeHiivCountdownTimer from "@/components/BeeHiiv/BeeHiivCountdownTimer";
import BeeHiivNewsletterSelectorWithCreate from "./BeeHiiv/BeeHiivNewsletterSelectorWithCreate";
import DetailTabs from "@/components/BeeHiiv/TaskTabs";
import OperationLogStatusList from "@/components/BeeHiiv/TaskTabs/BeeHiivCreateTab";
import SystemTasksTable from "@/components/dashboard/SystemTasksTable";
import type { Tables } from "@/utils/supabase/database.types";

type SystemTaskRow = Tables<{ schema: "system" }, "tasks">;

export type NewsletterDropdownDetailGroup = {
  primary: ReactNode;
  secondary?: ReactNode;
};

type DropdownContentOptions = {
  tasks?: SystemTaskRow[];
  tasksErrorMessage?: string | null;
};

export function getNewsletterDropdownContentById({
  tasks = [],
  tasksErrorMessage = null,
}: DropdownContentOptions = {}): Record<string, NewsletterDropdownDetailGroup> {
  const beehiivTasks = tasks.filter(
    (task) => task.component_name === "BeeHiiv Newsletter",
  );

  return {
  "ai-entrepreneur": {
    primary: (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SystemTasksTable
          tasks={beehiivTasks}
          errorMessage={tasksErrorMessage}
        />

        <div className="app-panel p-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Performance Metrics</h4>
            <span className="app-text-muted text-xs">Placeholder</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-md border border-foreground/15 p-3">
              <p className="app-text-muted text-xs">Open Rate</p>
              <p className="mt-1 text-lg font-semibold">--%</p>
            </div>
            <div className="rounded-md border border-foreground/15 p-3">
              <p className="app-text-muted text-xs">Click Rate</p>
              <p className="mt-1 text-lg font-semibold">--%</p>
            </div>
            <div className="rounded-md border border-foreground/15 p-3">
              <p className="app-text-muted text-xs">Subscribers</p>
              <p className="mt-1 text-lg font-semibold">----</p>
            </div>
            <div className="rounded-md border border-foreground/15 p-3">
              <p className="app-text-muted text-xs">Revenue</p>
              <p className="mt-1 text-lg font-semibold">$----</p>
            </div>
          </div>
        </div>
      </div>
    ),
    secondary: (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h4 className="app-text-muted text-sm">Task to Complete:</h4>
            <h4 className="text-lg font-semibold">Publish Newsletter on 2/27 by 9am</h4>
          </div>
          <div className="flex items-center gap-3">
            <BeeHiivCountdownTimer />
            <BeeHiivNewsletterSelectorWithCreate />
          </div>
        </div>

        <DetailTabs
          overviewContent={<OperationLogStatusList />}
          curateContent={<BeeHiivCurateTab />}
          designContent={<BeeHiivDesignTab />}
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
}