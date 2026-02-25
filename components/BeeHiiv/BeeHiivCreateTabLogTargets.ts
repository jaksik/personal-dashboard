import type { OperationLogTarget } from "@/components/BeeHiiv/BeeHiivCreateTab";

export const operationLogTargets: OperationLogTarget[] = [
  { label: "Fetch Articles", category: "Article Fetcher" },
  { label: "Generate Snippets", category: "Snippet Generator" },
  { label: "Fetch Jobs", category: "Job Fetcher" },
  { label: "Create Newsletter", category: "Create Newsletter" },
];