import ThemeToggle from "@/components/dashboard/ThemeToggle";
import NewsletterPageNav from "@/components/newsletter/NewsletterPageNav";
import Link from "next/link";
import { requirePublishUser, signOutPublishAction } from "./actions";
import PublishNewsletterSelectControl from "./components/PublishNewsletterSelectControl";
import PublishWorkspace from "./components/PublishWorkspace";

export default async function NewsletterPublishPage() {
  await requirePublishUser();

  return (
    <div className="app-shell min-h-screen">
      <main className="w-full">
        <section className="w-full bg-foreground/2 px-2">
          <NewsletterPageNav
            compactDashboardButton
            centerContent={<PublishNewsletterSelectControl />}
            leftActions={
              <Link
                href="/newsletter/design"
                className="app-btn-ghost inline-flex items-center gap-1 px-4 py-2 text-sm font-medium"
              >
                <span aria-hidden="true">←</span>
                Design
              </Link>
            }
            rightActions={
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <form action={signOutPublishAction}>
                  <button type="submit" className="app-btn-ghost px-4 py-2 text-sm font-medium">
                    Sign out
                  </button>
                </form>
              </div>
            }
          />

          <PublishWorkspace />
        </section>
      </main>
    </div>
  );
}
