"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import NewsletterSelect from "@/components/newsletter/NewsletterSelect";
import useSelectedNewsletterId from "@/components/newsletter/useSelectedNewsletterId";

const workflowRoutes = [
  {
    href: "/newsletter/curate",
    label: "Curate",
    icon: <span aria-hidden="true">✨</span>,
  },
  {
    href: "/newsletter/design",
    label: "Design",
    icon: <span aria-hidden="true">🎨</span>,
  },
  {
    href: "/newsletter/publish",
    label: "Publish",
    icon: <span aria-hidden="true">💰</span>,
  },
];

export default function NewsletterWorkflowNavControls() {
  const pathname = usePathname();
  const { selectedNewsletterId, setSelectedNewsletterId } = useSelectedNewsletterId();

  return (
    <div className="flex w-full items-center justify-between gap-3">
      <div className="w-full max-w-sm md:w-72 md:max-w-none">
        <NewsletterSelect value={selectedNewsletterId} onChange={setSelectedNewsletterId} />
      </div>

      <div className="flex items-center gap-2">
        {workflowRoutes.map((route) => {
          const isActive = pathname === route.href;

          return (
            <Link
              key={route.href}
              href={route.href}
              className={`${isActive ? "app-btn" : "app-btn-ghost"} inline-flex h-9 w-9 items-center justify-center`}
              aria-label={route.label}
              title={route.label}
            >
              {route.icon}
            </Link>
          );
        })}
      </div>
    </div>
  );
}