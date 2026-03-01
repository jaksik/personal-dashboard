import { redirect } from "next/navigation";
import Link from "next/link";
import { getNewsletterDropdownContentById } from "@/components/NewsletterDropdownDetails";
import { createClient } from "@/utils/supabase/server";
import NewsletterDropdown from "@/components/NewsletterDropdown";
import { newsletterDropdowns } from "@/data/newsletter-dropdowns";
import SystemTasksTable from "@/components/dashboard/SystemTasksTable";
import HomeTopRightActions from "@/components/dashboard/HomeTopRightActions";

const projectModules = [
  { href: "/content-generator", label: "Content Generator" },
  { href: "/newsletter/curate", label: "Newsletter Curate" },
  { href: "/newsletter/design", label: "Newsletter Design" },
  { href: "/newsletter/publish", label: "Newsletter Publish" },
  { href: "/newsletter", label: "Newsletter Home" },
];


export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: tasksResult, error: tasksError } = await supabase
    .schema("system")
    .from("tasks")
    .select("*")
    .limit(8);
  const tasks = Array.isArray(tasksResult) ? tasksResult : [];
  const tasksErrorMessage = tasksError ? `system.tasks: ${tasksError.message}` : null;
  const newsletterDropdownContentById = getNewsletterDropdownContentById();

  return (
    <div className="app-shell min-h-screen">
      <main className="px-6 pb-8">
        <div className="mx-auto grid w-full grid-cols-1 gap-4 lg:grid-cols-12">
          <section className="space-y-4 lg:col-span-3">
            <SystemTasksTable
              tasks={tasks}
              errorMessage={tasksErrorMessage}
            />
     

          </section>

          <section className="space-y-4 lg:col-span-6">
            {/* <WorldClockRow />
            <DottedWorldMap /> */}
            <div className="overflow-hidden p-0 mb-3">
              <div className="grid grid-cols-2 divide-x divide-y divide-foreground/20 md:grid-cols-4 md:divide-y-0">
                <div className="px-4 py-6 text-center">
                  <p className="app-text-muted text-md">Active Systems Monitored</p>
                  <p className="mt-2 text-3xl font-semibold leading-none">3</p>
                </div>
                <div className="px-4 py-6 text-center">
                  <p className="app-text-muted text-md">Weekly Tasks to Complete</p>
                  <p className="mt-2 text-3xl font-semibold leading-none">7</p>
                </div>
                <div className="px-4 py-6 text-center">
                  <p className="app-text-muted text-md">Weekly Time Commitment</p>
                  <p className="mt-2 text-3xl font-semibold leading-none">12 Hours</p>
                </div>
                <div className="px-4 py-6 text-center">
                  <p className="app-text-muted text-md">Weekly Income Potential</p>
                  <p className="mt-2 text-3xl font-semibold leading-none">~$5k</p>
                </div>
              </div>
            </div>

            {newsletterDropdowns.map((item) => (
              <NewsletterDropdown
                key={item.id}
                item={item}
                secondaryChildren={newsletterDropdownContentById[item.id]?.secondary}
              >
                {newsletterDropdownContentById[item.id]?.primary}
              </NewsletterDropdown>
            ))}
          </section>

          <section className="space-y-4 lg:col-span-3">
            <HomeTopRightActions />
            <div className="app-panel p-4">
              <h2 className="app-text-muted underline text-sm">Total Income (30 day rolling)</h2>
              <p className="mt-2 font-bold text-5xl">
                $-------
              </p>
            </div>
        

            <div className="app-panel p-4">
              <h3 className="text-sm font-semibold">Project Modules</h3>
              <ul className="mt-3 space-y-2">
                {projectModules.map((module) => (
                  <li key={module.href}>
                    <Link
                      href={module.href}
                      className="text-sm underline-offset-4 hover:underline"
                    >
                      {module.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
