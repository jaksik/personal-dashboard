"use client";

import { useState } from "react";
import ModalShell from "@/components/ui/ModalShell";

export default function BeeHiivDesignModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="app-btn px-3 py-2 text-xs font-medium"
        >
          Open Design Modal
        </button>
      </div>

      <ModalShell
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Newsletter Design Builder"
        description="Placeholder workspace for design components and controls."
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <section className="space-y-4 lg:col-span-3">
            <div className="app-kpi p-4">
              <h4 className="text-sm font-semibold">Template Settings</h4>
              <div className="mt-3 space-y-2">
                <div className="h-8 rounded-md border border-foreground/15" />
                <div className="h-8 rounded-md border border-foreground/15" />
                <div className="h-8 rounded-md border border-foreground/15" />
              </div>
            </div>

            <div className="app-kpi p-4">
              <h4 className="text-sm font-semibold">Theme Controls</h4>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="h-8 rounded-md border border-foreground/15" />
                <div className="h-8 rounded-md border border-foreground/15" />
                <div className="h-8 rounded-md border border-foreground/15" />
              </div>
            </div>
          </section>

          <section className="space-y-4 lg:col-span-6">
            <div className="app-kpi p-4">
              <h4 className="text-sm font-semibold">Live Newsletter Preview</h4>
              <div className="mt-3 space-y-3 rounded-lg border border-foreground/15 p-4">
                <div className="h-12 rounded-md bg-foreground/10" />
                <div className="h-28 rounded-md border border-dashed border-foreground/25" />
                <div className="space-y-2">
                  <div className="h-3 w-5/6 rounded bg-foreground/15" />
                  <div className="h-3 w-full rounded bg-foreground/10" />
                  <div className="h-3 w-2/3 rounded bg-foreground/10" />
                </div>
                <div className="h-10 w-36 rounded-md bg-foreground/20" />
              </div>
            </div>
          </section>

          <section className="space-y-4 lg:col-span-3">
            <div className="app-kpi p-4">
              <h4 className="text-sm font-semibold">Section Blocks</h4>
              <div className="mt-3 space-y-2">
                <div className="h-9 rounded-md border border-foreground/15" />
                <div className="h-9 rounded-md border border-foreground/15" />
                <div className="h-9 rounded-md border border-foreground/15" />
                <div className="h-9 rounded-md border border-foreground/15" />
              </div>
            </div>

            <div className="app-kpi p-4">
              <h4 className="text-sm font-semibold">Actions</h4>
              <div className="mt-3 space-y-2">
                <button type="button" className="app-btn w-full px-3 py-2 text-xs">
                  Save Draft
                </button>
                <button type="button" className="app-btn-ghost w-full px-3 py-2 text-xs">
                  Preview Email
                </button>
              </div>
            </div>
          </section>
        </div>
      </ModalShell>
    </>
  );
}