import { signOutAction } from "@/app/actions/auth";
import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";
import NewsletterProfileMenu from "@/components/newsletter/NewsletterProfileMenu";

const projectModules = [
  { href: "/newsletter/curate", label: "Newsletter Curate" },
  { href: "/newsletter/design", label: "Newsletter Design" },
  { href: "/newsletter/publish", label: "Newsletter Publish" },
];

export default function HomeTopRightActions() {
  return (
    <div className="app-panel flex items-center justify-end gap-2 p-2">
      <details className="group relative">
        <summary className="app-btn-ghost inline-flex cursor-pointer list-none items-center rounded-md px-2 py-1.5 [&::-webkit-details-marker]:hidden">
          <span className="sr-only">Open project modules</span>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4 transition-transform duration-150 group-open:rotate-180"
          >
            <path
              d="M5 7.5 10 12.5 15 7.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </summary>

        <div className="app-panel absolute right-0 top-full z-20 mt-2 min-w-52 p-2">
          <ul className="space-y-1">
            {projectModules.map((module) => (
              <li key={module.href}>
                <Link
                  href={module.href}
                  className="block rounded-md px-2 py-1.5 text-sm hover:bg-foreground/10"
                >
                  {module.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </details>

      <ThemeToggle iconOnly />
      <NewsletterProfileMenu signOutAction={signOutAction} />
    </div>
  );
}
