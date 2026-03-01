import NewsletterTaskPageShell from "@/components/newsletter/NewsletterTaskPageShell";
import NewsletterSubNavRow from "@/components/newsletter/NewsletterSubNavRow";
import NewsletterWorkflowNavControls from "@/components/newsletter/NewsletterWorkflowNavControls";
import { requirePublishUser } from "./actions";
import PublishRowActions from "./components/PublishRowActions";
import PublishWorkspace from "./components/PublishWorkspace";

export default async function NewsletterPublishPage() {
  await requirePublishUser();

  return (
    <NewsletterTaskPageShell
      centerContent={<NewsletterWorkflowNavControls />}
      subNavRow={
        <NewsletterSubNavRow
          leftContent={<p className="app-text-muted text-sm">Publish</p>}
          rightContent={<PublishRowActions />}
        />
      }
    >
      <PublishWorkspace />
    </NewsletterTaskPageShell>
  );
}
