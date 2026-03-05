import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import HomeTopRightActions from "@/components/ui/NavPanel";
import Calendar from "@/components/dashboard/Calendar";
import MetricsHeaderRow from "@/components/dashboard/MetricsHeaderRow";
import MinimalDropdown from "@/components/ui/MinimalDropdown";

function toDateKey(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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

  const today = new Date();
  const eventRangeEnd = new Date(today);
  eventRangeEnd.setDate(eventRangeEnd.getDate() + 35);

  const { data: eventsResult, error: eventsError } = await supabase
    .schema("system")
    .from("events")
    .select("id, name, scheduled_date, status, domain, details")
    .gte("scheduled_date", toDateKey(today))
    .lte("scheduled_date", toDateKey(eventRangeEnd))
    .order("scheduled_date", { ascending: true });

  if (eventsError) {
    throw new Error(`system.events: ${eventsError.message}`);
  }

  const tasks = Array.isArray(tasksResult) ? tasksResult : [];
  const events = Array.isArray(eventsResult) ? eventsResult : [];
  const tasksErrorMessage = tasksError ? `system.tasks: ${tasksError.message}` : null;

  return (
    <div className="app-shell min-h-screen">
      <main className="px-6 pb-8">
        <HomeTopRightActions />

        <div className="mx-auto grid w-full grid-cols-1 gap-4 lg:grid-cols-12">
          <section className="space-y-4 lg:col-span-1">



          </section>

          <section className="space-y-1 lg:col-span-10">

            <MinimalDropdown label="Metrics">
              <MetricsHeaderRow />
            </MinimalDropdown>

            <MinimalDropdown label="Calendar">
              <Calendar events={events} />
            </MinimalDropdown>



          </section>

        </div>
      </main>
    </div>
  );
}
