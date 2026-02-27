import type { CurateTab } from "./types";

type CurateTabsProps = {
  activeTab: CurateTab;
  onChange: (tab: CurateTab) => void;
};

export default function CurateTabs({ activeTab, onChange }: CurateTabsProps) {
  return (
    <div className="rounded-xl border border-foreground/15 bg-foreground/3 p-1">
      <div className="grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => onChange("articles")}
          className="rounded-lg border px-3 py-2 text-sm font-semibold transition md:py-2.5"
          style={
            activeTab === "articles"
              ? {
                  background: "var(--app-accent)",
                  color: "var(--app-accent-foreground)",
                  borderColor: "var(--app-accent)",
                }
              : {
                  background: "var(--app-surface)",
                  color: "var(--app-text)",
                  borderColor: "var(--app-border)",
                }
          }
        >
          Articles
        </button>

        <button
          type="button"
          onClick={() => onChange("jobs")}
          className="rounded-lg border px-3 py-2 text-sm font-semibold transition md:py-2.5"
          style={
            activeTab === "jobs"
              ? {
                  background: "var(--app-accent)",
                  color: "var(--app-accent-foreground)",
                  borderColor: "var(--app-accent)",
                }
              : {
                  background: "var(--app-surface)",
                  color: "var(--app-text)",
                  borderColor: "var(--app-border)",
                }
          }
        >
          Jobs
        </button>
      </div>
    </div>
  );
}