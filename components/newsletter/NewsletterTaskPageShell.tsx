import type { ReactNode } from "react";
import NewsletterPageNav from "@/components/newsletter/NewsletterPageNav";
import SiteHeaderActions from "@/components/dashboard/SiteHeaderActions";

type NewsletterTaskPageShellProps = {
  leftActions?: ReactNode;
  centerContent?: ReactNode;
  subNavRow?: ReactNode;
  children: ReactNode;
};

export default function NewsletterTaskPageShell({
  leftActions,
  centerContent,
  subNavRow,
  children,
}: NewsletterTaskPageShellProps) {
  return (
    <div className="app-shell min-h-screen">
      <main className="w-full">
        <section className="w-full bg-foreground/2 px-2">
          <NewsletterPageNav
            compactDashboardButton
            leftActions={leftActions}
            centerContent={centerContent}
            rightActions={<SiteHeaderActions />}
          />

          {subNavRow}

          {children}
        </section>
      </main>
    </div>
  );
}