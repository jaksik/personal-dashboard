export default function BeeHiivReviewTab() {
  return (
    <div className="space-y-4">
      <div className="app-panel overflow-hidden">
        <div className="border-b border-foreground/15 px-4 py-3">
          <p className="text-xs uppercase tracking-wide app-text-muted">
            Newsletter Preview
          </p>
          <h4 className="mt-1 text-base font-semibold">The AI Entrepreneur Newsletter</h4>
        </div>

        <div className="space-y-4 p-4">
          <div className="rounded-lg border border-foreground/15 bg-background p-4">
            <p className="text-xs app-text-muted">Hero Section</p>
            <div className="mt-3 h-24 rounded-md border border-dashed border-foreground/25" />
          </div>

          <div className="rounded-lg border border-foreground/15 bg-background p-4">
            <p className="text-xs app-text-muted">Article Blocks</p>
            <div className="mt-3 space-y-2">
              <div className="h-3 w-5/6 rounded bg-foreground/15" />
              <div className="h-3 w-full rounded bg-foreground/10" />
              <div className="h-3 w-4/6 rounded bg-foreground/10" />
            </div>
          </div>

          <div className="rounded-lg border border-foreground/15 bg-background p-4">
            <p className="text-xs app-text-muted">Footer / CTA</p>
            <div className="mt-3 h-9 w-40 rounded-md bg-foreground/20" />
          </div>
        </div>
      </div>
    </div>
  );
}