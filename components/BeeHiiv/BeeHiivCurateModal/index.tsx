"use client";

import { useState } from "react";
import ModalShell from "@/components/ui/ModalShell";

export default function BeeHiivCurateModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="app-btn px-3 py-2 text-xs font-medium"
        >
          Open Curate Modal
        </button>
      </div>

      <ModalShell
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Newsletter Curation Workspace"
        description="Placeholder workspace for selecting and curating content blocks."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <section className="space-y-4 lg:col-span-4">
            <div className="app-kpi p-4">
              <h4 className="text-sm font-semibold">Article Queue</h4>
              <div className="mt-3 space-y-2">
                <div className="h-12 rounded-md border border-foreground/15" />
                <div className="h-12 rounded-md border border-foreground/15" />
                <div className="h-12 rounded-md border border-foreground/15" />
              </div>
            </div>

            <div className="app-kpi p-4">
              <h4 className="text-sm font-semibold">Job Queue</h4>
              <div className="mt-3 space-y-2">
                <div className="h-12 rounded-md border border-foreground/15" />
                <div className="h-12 rounded-md border border-foreground/15" />
                <div className="h-12 rounded-md border border-foreground/15" />
              </div>
            </div>
          </section>

          <section className="space-y-4 lg:col-span-8">
            <div className="app-kpi p-4">
              <h4 className="text-sm font-semibold">Curated Newsletter Order</h4>
              <div className="mt-3 space-y-3 rounded-lg border border-foreground/15 p-4">
                <div className="h-10 rounded-md bg-foreground/10" />
                <div className="h-16 rounded-md border border-dashed border-foreground/25" />
                <div className="h-16 rounded-md border border-dashed border-foreground/25" />
                <div className="h-16 rounded-md border border-dashed border-foreground/25" />
              </div>
            </div>

            <div className="app-kpi p-4">
              <h4 className="text-sm font-semibold">Actions</h4>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="app-btn px-3 py-2 text-xs">
                  Save Curation
                </button>
                <button type="button" className="app-btn-ghost px-3 py-2 text-xs">
                  Auto Sort
                </button>
                <button type="button" className="app-btn-ghost px-3 py-2 text-xs">
                  Clear Selection
                </button>
              </div>
            </div>
          </section>
        </div>
      </ModalShell>
    </>
  );
}