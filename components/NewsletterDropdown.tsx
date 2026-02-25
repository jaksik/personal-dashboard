import type { ReactNode } from "react";
import Image from "next/image";

export type NewsletterDropdownData = {
  id: string;
  category: string;
  title: string;
  timeCommitment: string;
  revenuePotential: string;
  badges?: Array<{
    label: string;
    tone: "attention" | "healthy" | "neutral";
  }>;
  details?: string;
  imageSrc?: string;
  imageAlt?: string;
};

type NewsletterDropdownProps = {
  item: NewsletterDropdownData;
  defaultOpen?: boolean;
  children?: ReactNode;
};

export default function NewsletterDropdown({
  item,
  defaultOpen = false,
  children,
}: NewsletterDropdownProps) {
  function badgeClassName(tone: "attention" | "healthy" | "neutral") {
    if (tone === "attention") {
      return "border-amber-400/80 bg-amber-400/15 text-amber-300";
    }

    if (tone === "healthy") {
      return "border-lime-400/80 bg-lime-400/15 text-lime-300";
    }

    return "border-foreground/30 bg-foreground/10 app-text-muted";
  }

  return (
    <details
      className="app-panel overflow-hidden border-2 mb-10"
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center gap-4 p-5 [&::-webkit-details-marker]:hidden">
        {item.imageSrc ? (
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-foreground/20">
            <Image
              src={item.imageSrc}
              alt={item.imageAlt ?? `${item.title} logo`}
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-foreground/20 text-xl font-semibold">
            {item.title.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="app-text-muted text-md mr-4 underline">{item.category}</p>
            {item.badges?.map((badge) => (
              <span
                key={badge.label}
                className={`rounded-full border px-2 py-1 text-xs ${badgeClassName(
                  badge.tone
                )}`}
              >
                {badge.label}
              </span>
            ))}
          </div>
          <h3 className="truncate text-2xl font-semibold mt-2 leading-tight">
            {item.title}
          </h3>

          <p className="mt-1 text-sm">
            <span className="font-semibold">Time Commitment:</span>{" "}
            {item.timeCommitment}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Revenue Potential:</span>{" "}
            {item.revenuePotential}
          </p>
        </div>
      </summary>

      <div className="border-t border-foreground/15 px-5 pb-5 pt-4">
        {children ? (
          children
        ) : (
          <p className="app-text-muted text-sm">
            {item.details ??
              "Placeholder dropdown content. Replace this with hydrated data components for this newsletter card."}
          </p>
        )}
      </div>
    </details>
  );
}