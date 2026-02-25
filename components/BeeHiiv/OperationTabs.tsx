"use client";

import type { ReactNode } from "react";
import { useState } from "react";

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
  reviewContent?: ReactNode;
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
    id: "revenue",
    label: "Review",
    title: "",
    description:
      "Display sponsorship performance, conversion value, and projected revenue breakdowns here.",
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
  reviewContent,
}: DetailTabsProps) {
  const safeTabs = tabs.length === 5 ? tabs : defaultTabs;
  const [activeTabId, setActiveTabId] = useState(safeTabs[0].id);

  const activeTab =
    safeTabs.find((tab) => tab.id === activeTabId) ?? safeTabs[0];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {safeTabs.map((tab) => {
          const isActive = tab.id === activeTab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTabId(tab.id)}
              className="app-btn-ghost px-3 py-2 text-xs font-medium"
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
          );
        })}
      </div>

      <div className="app-kpi p-4">
        <h4 className="text-sm font-semibold">{activeTab.title}</h4>
        {activeTab.id === "overview" && overviewContent ? (
          <div className="mt-2">{overviewContent}</div>
        ) : activeTab.id === "audience" && curateContent ? (
          <div className="mt-2">{curateContent}</div>
        ) : activeTab.id === "content" && designContent ? (
          <div className="mt-2">{designContent}</div>
        ) : activeTab.id === "revenue" && reviewContent ? (
          <div className="mt-2">{reviewContent}</div>
        ) : (
          <p className="app-text-muted mt-2 text-sm">{activeTab.description}</p>
        )}
      </div>
    </div>
  );
}