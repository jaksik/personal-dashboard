import NewsletterTaskPageShell from "@/components/newsletter/NewsletterTaskPageShell";
import NewsletterSubNavRow from "@/components/newsletter/NewsletterSubNavRow";
import NewsletterWorkflowNavControls from "@/components/newsletter/NewsletterWorkflowNavControls";
import { requireDesignUser } from "./actions";
import DesignStatusBadges from "./components/DesignStatusBadges";
import DesignWorkspace from "./components/DesignWorkspace";

export default async function NewsletterDesignPage() {
  await requireDesignUser();

  return (
    <NewsletterTaskPageShell
      centerContent={<NewsletterWorkflowNavControls />}
      subNavRow={
        <NewsletterSubNavRow
          leftContent={<p className="app-text-muted text-sm">Design</p>}
          rightContent={<DesignStatusBadges />}
        />
      }
    >
      <DesignWorkspace />
    </NewsletterTaskPageShell>
  );
}
