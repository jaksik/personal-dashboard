import type { CurateTab } from "./types";

type CurateTopTabsProps = {
  activeTab: CurateTab;
  onChange: (tab: CurateTab) => void;
};

export default function CurateTopTabs({ activeTab, onChange }: CurateTopTabsProps) {
  return (
    <div className="app-kpi p-2">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange("articles")}
          className={`app-btn-ghost rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            activeTab === "articles"
              ? "border-transparent"
              : ""
          }`}
          style={
            activeTab === "articles"
              ? {
                  background: "var(--app-accent)",
                  color: "var(--app-accent-foreground)",
                }
              : undefined
          }
        >
          Articles
        </button>

        <button
          type="button"
          onClick={() => onChange("jobs")}
          className={`app-btn-ghost rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            activeTab === "jobs"
              ? "border-transparent"
              : ""
          }`}
          style={
            activeTab === "jobs"
              ? {
                  background: "var(--app-accent)",
                  color: "var(--app-accent-foreground)",
                }
              : undefined
          }
        >
          Jobs
        </button>
      </div>
    </div>
  );
}
