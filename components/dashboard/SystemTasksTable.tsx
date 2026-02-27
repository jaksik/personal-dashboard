import type { Tables } from "@/utils/supabase/database.types";

type SystemTaskRow = Tables<{ schema: "system" }, "tasks">;

type SystemTasksTableProps = {
  tasks: SystemTaskRow[];
  errorMessage?: string | null;
};

function getTaskTitle(task: SystemTaskRow) {
  return task.task_name;
}

function getTaskStatus(task: SystemTaskRow) {
  return task.complete ? "completed" : "pending";
}

function getTaskTimestamp(task: SystemTaskRow) {
  const parsed = new Date(task.scheduled_date ?? task.created_at);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(parsed);
}

export default function SystemTasksTable({ tasks, errorMessage }: SystemTasksTableProps) {
  return (
    <div className="app-panel p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="app-text-muted text-sm font-semibold">Upcoming Tasks</h2>
      </div>

      {errorMessage ? (
        <p className="app-text-muted mt-3 text-sm">{errorMessage}</p>
      ) : tasks.length === 0 ? (
        <p className="app-text-muted mt-3 text-sm">No tasks found.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full table-fixed text-left">
            <colgroup>
              <col className="w-[52%]" />
              <col className="w-[26%]" />
              <col className="w-[22%]" />
            </colgroup>
            <tbody>
              {tasks.map((task) => {
                const status = getTaskStatus(task);
                const isComplete = task.complete === true;

                return (
                  <tr
                    key={task.id}
                    className="border-b border-foreground/10 last:border-b-0"
                  >
                    <td className="py-2 pr-3 text-sm font-medium">
                      {getTaskTitle(task)}
                      <p className="app-text-muted mt-0.5 text-[11px]">{task.component_name}</p>
                    </td>
                    <td className="py-2 pr-3 text-xs">
                      <span
                        className="inline-flex rounded-full border border-foreground/15 px-2 py-0.5"
                        style={{
                          color: isComplete ? "var(--chart-2)" : "var(--app-text-muted)",
                        }}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="app-text-muted py-2 text-xs">{getTaskTimestamp(task)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}