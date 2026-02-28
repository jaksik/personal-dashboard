import ThemeToggle from "@/components/dashboard/ThemeToggle";
import NewsletterPageNav from "@/components/newsletter/NewsletterPageNav";
import Link from "next/link";
import { requireDesignUser, signOutDesignAction } from "./actions";
import DesignNewsletterSelectControl from "./components/DesignNewsletterSelectControl";
import DesignWorkspace from "./components/DesignWorkspace";

export default async function NewsletterDesignPage() {
  await requireDesignUser();

  return (
    <div className="app-shell min-h-screen">
      <main className="w-full">
        <section className="w-full bg-foreground/2 px-2">
          <NewsletterPageNav
            compactDashboardButton
            centerContent={<DesignNewsletterSelectControl />}
            leftActions={
              <div className="flex items-center gap-2">
                <Link
                  href="/newsletter/curate"
                  className="app-btn-ghost inline-flex items-center gap-1 px-4 py-2 text-sm font-medium"
                >
                  <span aria-hidden="true">←</span>
                  Curate
                </Link>
                <Link
                  href="/newsletter/publish"
                  className="app-btn-ghost inline-flex items-center gap-1 px-4 py-2 text-sm font-medium"
                >
                  Publish
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            }
            rightActions={
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <form action={signOutDesignAction}>
                  <button type="submit" className="app-btn-ghost px-4 py-2 text-sm font-medium">
                    Sign out
                  </button>
                </form>
              </div>
            }
          />

          <DesignWorkspace />
        </section>
      </main>
    </div>
  );
}
