import { redirect } from "next/navigation";
import { newsletterDropdownDetailsById } from "@/components/NewsletterDropdownDetails";
import { createClient } from "@/utils/supabase/server";
import NewsletterDropdown from "@/components/NewsletterDropdown";
import ThemeToggle from "@/components/ThemeToggle";
import { newsletterDropdowns } from "@/data/newsletter-dropdowns";
import PlaceholderGraph from "@/components/PlaceholderGraph";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  async function signOut() {
    "use server";

    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/sign-in");
  }

  return (
    <div className="app-shell min-h-screen">
      <header className="flex items-center justify-end px-6 py-6">
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <form action={signOut}>
            <button
              type="submit"
              className="app-btn-ghost px-4 py-2"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="px-6 pb-8">
        <div className="mx-auto grid w-full grid-cols-1 gap-4 lg:grid-cols-12">
          <section className="space-y-4 lg:col-span-3">
            <div className="app-panel p-4">
              <h2 className="text-md font-semibold">System Run Logs</h2>
              <p className="app-text-muted mt-2 text-sm">
                Place compact widgets here.
              </p>
            </div>
            <div className="app-panel p-4">
              <h3 className="text-md font-semibold">Upcoming Human Tasks</h3>
              <p className="app-text-muted mt-2 text-sm">
                Good for quick stats or filters.
              </p>
            </div>
          </section>

          <section className="space-y-4 lg:col-span-6">
            <PlaceholderGraph />

            <div className="overflow-hidden p-0 mb-10">
              <div className="grid grid-cols-2 divide-x divide-y divide-foreground/20 md:grid-cols-4 md:divide-y-0">
                <div className="px-4 py-6 text-center">
                  <p className="app-text-muted text-md">Active Systems</p>
                  <p className="mt-2 text-5xl font-semibold leading-none">3</p>
                </div>
                <div className="px-4 py-6 text-center">
                  <p className="app-text-muted text-md">Weekly Checkins</p>
                  <p className="mt-2 text-5xl font-semibold leading-none">7</p>
                </div>
                <div className="px-4 py-6 text-center">
                  <p className="app-text-muted text-md">Time Commitment</p>
                  <p className="mt-2 text-5xl font-semibold leading-none">12 h/w</p>
                </div>
                <div className="px-4 py-6 text-center">
                  <p className="app-text-muted text-md">Revenue Potential</p>
                  <p className="mt-2 text-5xl font-semibold leading-none">~$7k/w</p>
                </div>
              </div>
            </div>

            {newsletterDropdowns.map((item, index) => (
              <NewsletterDropdown
                key={item.id}
                item={item}
                defaultOpen={index === 0}
              >
                {newsletterDropdownDetailsById[item.id]}
              </NewsletterDropdown>
            ))}
          </section>

          <section className="space-y-4 lg:col-span-3">
            <div className="app-panel p-4">
              <h2 className="app-text-muted underline text-sm">Total Income</h2>
              <p className="mt-2 font-bold text-5xl">
                $11,735
              </p>
            </div>
            <div className="app-panel p-4">
              <h3 className="text-sm font-semibold">Notes</h3>
              <p className="app-text-muted mt-2 text-sm">
                Reserve this area for lightweight components.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
