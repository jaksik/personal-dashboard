import SiteHeaderActions from "@/components/dashboard/SiteHeaderActions";
import CurateWorkspace from "./components/CurateWorkspace";
import { requireCurateUser } from "./actions";

export default async function NewsletterCuratePage() {
  await requireCurateUser();

  return (
    <div className="app-shell min-h-screen">
      <main className="w-full px-3 py-3 md:px-5 md:py-5">
        <section className="w-full">
          <CurateWorkspace
            rightHeaderActions={
              <SiteHeaderActions />
            }
          />
        </section>
      </main>
    </div>
  );
}