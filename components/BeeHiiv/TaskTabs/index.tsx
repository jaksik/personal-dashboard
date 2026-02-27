"use client";

import type { ReactNode } from "react";
import { useState } from "react";

function SuccessIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-label="Success">
      <circle cx="12" cy="12" r="10" fill="none" stroke="#65e26d" strokeWidth="1.8" />
      <path
        d="M7.5 12.2 10.6 15.3 16.7 9.2"
        fill="none"
        stroke="#65e26d"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-label="Pending">
      <circle cx="12" cy="12" r="10" fill="none" stroke="#facc15" strokeWidth="1.8" />
      <path
        d="M12 7.5v5l3 2"
        fill="none"
        stroke="#facc15"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type DetailTab = {
  id: string;
  label: string;
  title: string;
  description: string;
};

type DetailTabsProps = {
  tabs?: DetailTab[];
  overviewContent?: ReactNode;
  curateContent?: ReactNode;
  designContent?: ReactNode;
};

const defaultTabs: DetailTab[] = [
  {
    id: "overview",
    label: "Create",
    title: "",
    description:
      "High-level summary content goes here. Replace with hydrated metrics, trends, and key status signals.",
  },
  {
    id: "audience",
    label: "Curate",
    title: "",
    description:
      "Show subscriber segments, growth by cohort, and other audience insights in this tab.",
  },
  {
    id: "content",
    label: "Design",
    title: "",
    description:
      "Use this area for top-performing content, drafts queue, and publishing cadence details.",
  },
  {
    id: "tasks",
    label: "Publish",
    title: "",
    description:
      "Track follow-up actions, blocked items, and execution checklist for this newsletter.",
  },
];

export default function DetailTabs({
  tabs = defaultTabs,
  overviewContent,
  curateContent,
  designContent,
}: DetailTabsProps) {
  const safeTabs = tabs.length === 4 ? tabs : defaultTabs;
  const [activeTabId, setActiveTabId] = useState(safeTabs[0].id);
  const [mountedTabIds, setMountedTabIds] = useState<Set<string>>(
    () => new Set([safeTabs[0].id])
  );

  const activeTab =
    safeTabs.find((tab) => tab.id === activeTabId) ?? safeTabs[0];

  function getTabContent(tabId: string, description: string) {
    if (tabId === "overview" && overviewContent) {
      return overviewContent;
    }

    if (tabId === "audience" && curateContent) {
      return curateContent;
    }

    if (tabId === "content" && designContent) {
      return designContent;
    }

    return <p className="app-text-muted text-sm">{description}</p>;
  }

  function handleTabChange(tabId: string) {
    setActiveTabId(tabId);
    setMountedTabIds((current) => {
      if (current.has(tabId)) {
        return current;
      }

      const next = new Set(current);
      next.add(tabId);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {safeTabs.map((tab) => {
          const isActive = tab.id === activeTab.id;

          return (
            <div key={tab.id} className="flex flex-col items-center gap-1">
              {isActive ? <SuccessIcon /> : <PendingIcon />}
              <button
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className="app-btn-ghost w-full px-3 py-2 text-xs font-medium"
                style={
                  isActive
                    ? {
                        background: "var(--app-accent)",
                        color: "var(--app-accent-foreground)",
                        borderColor: "var(--app-accent)",
                      }
                    : undefined
                }
              >
                {tab.label}
              </button>
            </div>
          );
        })}
      </div>

      <div className="p-4">
        <h4 className="text-sm font-semibold">{activeTab.title}</h4>
        {safeTabs.map((tab) => {
          if (!mountedTabIds.has(tab.id)) {
            return null;
          }

          const isActive = tab.id === activeTab.id;

          return (
            <div key={tab.id} className={isActive ? "mt-2" : "mt-2 hidden"}>
              {getTabContent(tab.id, tab.description)}
            </div>
          );
        })}
      </div>
    </div>
  );
}