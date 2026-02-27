import ThemeToggle from "@/components/dashboard/ThemeToggle";
import CurateWorkspace from "./components/CurateWorkspace";
import { requireCurateUser, signOutCurateAction } from "./actions";

export default async function NewsletterCuratePage() {
  await requireCurateUser();

  return (
    <div className="app-shell min-h-screen">
      <main className="w-full px-3 py-3 md:px-5 md:py-5">
        <section className="w-full">
          <CurateWorkspace
            rightHeaderActions={
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <form action={signOutCurateAction}>
                  <button type="submit" className="app-btn-ghost px-4 py-2 text-sm font-medium">
                    Sign out
                  </button>
                </form>
              </div>
            }
          />
        </section>
      </main>
    </div>
  );
}