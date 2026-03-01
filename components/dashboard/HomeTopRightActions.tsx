import { signOutAction } from "@/app/actions/auth";
import ThemeToggle from "@/components/dashboard/ThemeToggle";
import NewsletterProfileMenu from "@/components/newsletter/NewsletterProfileMenu";

export default function HomeTopRightActions() {
  return (
    <div className="app-panel flex items-center justify-end gap-2 p-2">
      <ThemeToggle iconOnly />
      <NewsletterProfileMenu signOutAction={signOutAction} />
    </div>
  );
}