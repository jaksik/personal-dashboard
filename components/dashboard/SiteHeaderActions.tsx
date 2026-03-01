import ThemeToggle from "@/components/dashboard/ThemeToggle";
import NewsletterProfileMenu from "@/components/newsletter/NewsletterProfileMenu";
import { signOutAction } from "@/app/actions/auth";

export default function SiteHeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle iconOnly />
      <NewsletterProfileMenu signOutAction={signOutAction} />
    </div>
  );
}